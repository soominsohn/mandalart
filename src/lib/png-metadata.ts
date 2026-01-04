// PNG 메타데이터 유틸리티
// PNG tEXt chunk를 사용하여 만다라트 데이터를 이미지에 포함/추출

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const MANDARAT_KEY = 'MandaratData';

// CRC32 테이블 생성
function makeCrcTable(): number[] {
  const table: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

const crcTable = makeCrcTable();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// tEXt chunk 생성
function createTextChunk(key: string, value: string): Uint8Array {
  const keyBytes = new TextEncoder().encode(key);
  const valueBytes = new TextEncoder().encode(value);
  const dataLength = keyBytes.length + 1 + valueBytes.length; // key + null + value

  const chunk = new Uint8Array(12 + dataLength);
  const view = new DataView(chunk.buffer);

  // Length (4 bytes)
  view.setUint32(0, dataLength);

  // Type "tEXt" (4 bytes)
  chunk[4] = 0x74; // t
  chunk[5] = 0x45; // E
  chunk[6] = 0x58; // X
  chunk[7] = 0x74; // t

  // Data: key + null + value
  chunk.set(keyBytes, 8);
  chunk[8 + keyBytes.length] = 0; // null separator
  chunk.set(valueBytes, 8 + keyBytes.length + 1);

  // CRC (4 bytes) - covers type + data
  const crcData = chunk.slice(4, 8 + dataLength);
  const crcValue = crc32(crcData);
  view.setUint32(8 + dataLength, crcValue);

  return chunk;
}

// PNG에 만다라트 데이터 추가
export function embedMandaratData(
  pngDataUrl: string,
  cells: { position: number; title: string }[]
): string {
  // Data URL에서 base64 데이터 추출
  const base64 = pngDataUrl.split(',')[1];
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // JSON 데이터 생성
  const jsonData = JSON.stringify(cells);
  const textChunk = createTextChunk(MANDARAT_KEY, jsonData);

  // IEND chunk 위치 찾기 (마지막 12 bytes)
  // PNG는 항상 IEND로 끝남
  const iendStart = bytes.length - 12;

  // 새 PNG 생성: 기존 데이터(IEND 제외) + tEXt chunk + IEND
  const newPng = new Uint8Array(bytes.length + textChunk.length);
  newPng.set(bytes.slice(0, iendStart), 0);
  newPng.set(textChunk, iendStart);
  newPng.set(bytes.slice(iendStart), iendStart + textChunk.length);

  // base64로 변환
  let binary = '';
  for (let i = 0; i < newPng.length; i++) {
    binary += String.fromCharCode(newPng[i]);
  }
  return 'data:image/png;base64,' + btoa(binary);
}

// PNG에서 만다라트 데이터 추출
export function extractMandaratData(
  file: File
): Promise<{ position: number; title: string }[] | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);

        // PNG 시그니처 확인
        for (let i = 0; i < 8; i++) {
          if (bytes[i] !== PNG_SIGNATURE[i]) {
            resolve(null);
            return;
          }
        }

        // Chunk 순회하며 tEXt 찾기
        let offset = 8;
        while (offset < bytes.length) {
          const view = new DataView(bytes.buffer, offset);
          const length = view.getUint32(0);
          const type = String.fromCharCode(
            bytes[offset + 4],
            bytes[offset + 5],
            bytes[offset + 6],
            bytes[offset + 7]
          );

          if (type === 'tEXt') {
            // tEXt chunk 데이터 파싱
            const dataStart = offset + 8;
            const dataEnd = dataStart + length;
            const data = bytes.slice(dataStart, dataEnd);

            // null 문자로 key와 value 분리
            let nullIndex = 0;
            for (let i = 0; i < data.length; i++) {
              if (data[i] === 0) {
                nullIndex = i;
                break;
              }
            }

            const key = new TextDecoder().decode(data.slice(0, nullIndex));
            if (key === MANDARAT_KEY) {
              const value = new TextDecoder().decode(data.slice(nullIndex + 1));
              const cells = JSON.parse(value);
              resolve(cells);
              return;
            }
          }

          if (type === 'IEND') {
            break;
          }

          // 다음 chunk로 이동 (length + type + data + crc)
          offset += 12 + length;
        }

        resolve(null);
      } catch {
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsArrayBuffer(file);
  });
}
