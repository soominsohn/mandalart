import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// 만다라트 데이터
const data = {
  // 핵심 목표
  40: '균형잡힌 한 해 만들기',

  // 세부 목표 제목들 (중앙 블록)
  30: '건강', 31: '커리어/일', 32: '자기계발',
  39: '재정 관리', 41: '관계',
  48: '생활 습관', 49: '취미/즐거움', 50: '마인드셋',

  // 세부 목표 제목들 (각 블록 중앙에 복제)
  10: '건강', 13: '커리어/일', 16: '자기계발',
  37: '재정 관리', 43: '관계',
  64: '생활 습관', 67: '취미/즐거움', 70: '마인드셋',

  // 건강 (블록0)
  0: '주 3회 이상 운동', 1: '하루 8천 보 걷기', 2: '정기 건강검진',
  9: '스트레칭 습관화', 11: '수면 7시간 유지',
  18: '물 충분히 마시기', 19: '체중·체력 기록', 20: '과로 방지',

  // 커리어/일 (블록1)
  3: '전문성 한 분야 강화', 4: '업무 성과 명확화', 5: '연봉·보상 목표 설정',
  12: '피드백 정리 습관', 14: '분기별 목표 점검',
  21: '생산성 도구 활용', 22: '커리어 로드맵 작성', 23: '이직·성장 옵션 확보',

  // 자기계발 (블록2)
  6: '매일 30분 학습', 7: '연 12권 독서', 8: '강의·스터디 참여',
  15: '배운 내용 정리', 17: '실습·적용 경험',
  24: '기록 습관 만들기', 25: '사고력 확장', 26: '꾸준함 유지',

  // 재정 관리 (블록3)
  27: '월 예산 수립', 28: '고정비 점검', 29: '저축 자동화',
  36: '투자 원칙 정립', 38: '지출 기록 습관',
  45: '비상금 마련', 46: '재무 목표 수치화', 47: '소비 기준 세우기',

  // 관계 (블록5)
  33: '가족과 정기 연락', 34: '친구와 월 1회 만남', 35: '감사 표현 늘리기',
  42: '갈등 회피 줄이기', 44: '경청 습관',
  51: '인간관계 정리', 52: '새로운 인연 열기', 53: '신뢰 쌓기',

  // 생활 습관 (블록6)
  54: '아침 루틴 만들기', 55: '하루 계획 작성', 56: '스마트폰 사용 절제',
  63: '정리정돈 습관', 65: '주간 리뷰',
  72: '휴식 시간 확보', 73: '생활 리듬 유지', 74: '번아웃 예방',

  // 취미/즐거움 (블록7)
  57: '새로운 취미 1개', 58: '여행 계획 세우기', 59: '혼자만의 시간',
  66: '기록용 사진 남기기', 68: '문화생활 즐기기',
  75: '소소한 보상', 76: '즐거운 도전', 77: '삶의 여유',

  // 마인드셋 (블록8)
  60: '현실적인 기대', 61: '비교 줄이기', 62: '실패 관대하게 보기',
  69: '감사 일기 작성', 71: '현재에 집중',
  78: '감정 인식 연습', 79: '긍정적 언어 사용', 80: '나 자신 존중',
};

async function waitForServer(url, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {
      // Server not ready yet
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error('Server failed to start');
}

async function main() {
  console.log('Starting dev server...');

  const server = spawn('npm', ['run', 'dev'], {
    cwd: projectRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let serverUrl = 'http://localhost:3000';

  server.stdout.on('data', (data) => {
    const output = data.toString();
    const match = output.match(/http:\/\/localhost:\d+/);
    if (match) serverUrl = match[0];
  });

  try {
    console.log('Waiting for server...');
    await waitForServer(serverUrl);
    console.log(`Server ready at ${serverUrl}`);

    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 1200 });

    console.log('Loading page...');
    await page.goto(serverUrl, { waitUntil: 'networkidle0' });

    // LocalStorage에 데이터 설정
    console.log('Setting mandarat data...');
    await page.evaluate((cellData) => {
      const cells = Array.from({ length: 81 }, (_, i) => ({
        id: crypto.randomUUID(),
        position: i,
        title: cellData[i] || '',
      }));

      const mandarat = {
        id: crypto.randomUUID(),
        title: '나의 만다라트',
        cells,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem('mandarat-guest-data', JSON.stringify(mandarat));
    }, data);

    // 페이지 새로고침하여 데이터 로드
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));

    // 그리드 요소 찾기
    console.log('Taking screenshot...');
    const gridElement = await page.$('.max-w-5xl.mx-auto.p-3');

    if (gridElement) {
      await gridElement.screenshot({
        path: join(projectRoot, 'public', 'example.png'),
        type: 'png',
      });
      console.log('Screenshot saved to public/example.png');
    } else {
      // 전체 페이지 스크린샷
      await page.screenshot({
        path: join(projectRoot, 'public', 'example.png'),
        type: 'png',
        fullPage: false,
      });
      console.log('Full page screenshot saved to public/example.png');
    }

    await browser.close();
    console.log('Done!');

  } finally {
    server.kill();
  }
}

main().catch(console.error);
