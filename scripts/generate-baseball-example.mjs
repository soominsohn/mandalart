import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// 만다라트 데이터 - 메이저리그 최고의 선수
const data = {
  // 핵심 목표
  40: '메이저리그 최고의 선수',

  // 세부 목표 제목들 (중앙 블록)
  30: '피지컬(체력)', 31: '투수 능력', 32: '타자 능력',
  39: '멘탈 관리', 41: '생활 습관',
  48: '야구 지식', 49: '환경 활용', 50: '목표 의식',

  // 세부 목표 제목들 (각 블록 중앙에 복제)
  10: '피지컬(체력)', 13: '투수 능력', 16: '타자 능력',
  37: '멘탈 관리', 43: '생활 습관',
  64: '야구 지식', 67: '환경 활용', 70: '목표 의식',

  // 피지컬(체력) (블록0)
  0: '하체 근력 강화', 1: '유연성 스트레칭', 2: '코어 트레이닝',
  9: '부상 예방 루틴', 11: '체중 관리',
  18: '수면 관리', 19: '회복 프로그램', 20: '시즌별 컨디션 체크',

  // 투수 능력 (블록1)
  3: '구속 향상', 4: '제구력 훈련', 5: '변화구 완성도',
  12: '투구 폼 안정화', 14: '타자 분석',
  21: '볼 배합 연구', 22: '경기 운영 능력', 23: '멘탈 유지',

  // 타자 능력 (블록2)
  6: '스윙 스피드', 7: '컨택 정확도', 8: '장타력 강화',
  15: '볼 고르기', 17: '타격 밸런스',
  24: '좌·우 투수 대응', 25: '타격 루틴', 26: '실전 타석 경험',

  // 멘탈 관리 (블록3)
  27: '목표 시각화', 28: '실패 후 리셋', 29: '긴장 조절',
  36: '집중력 유지', 38: '자신감 강화',
  45: '루틴 유지', 46: '긍정적 사고', 47: '압박 상황 대응',

  // 생활 습관 (블록5)
  33: '식단 관리', 34: '규칙적인 수면', 35: '음주·유혹 절제',
  42: '하루 일정 관리', 44: '휴식 시간 확보',
  51: '스트레스 관리', 52: '컨디션 기록', 53: '자기관리 습관화',

  // 야구 지식 (블록6)
  54: '규칙 이해', 55: '데이터 분석', 56: '상대팀 분석',
  63: '경기 영상 복기', 65: '트렌드 학습',
  72: '전략 이해', 73: '코치 피드백', 74: '경험 정리',

  // 환경 활용 (블록7)
  57: '좋은 코치 선택', 58: '훈련 시설 활용', 59: '팀 동료 소통',
  66: '의료진 협업', 68: '최신 장비 활용',
  75: '데이터 시스템', 76: '해외 경험', 77: '언어 적응',

  // 목표 의식 (블록8)
  60: '꿈의 명확화', 61: '장기 목표 설정', 62: '단기 목표 관리',
  69: '매일 기록', 71: '성장 점검',
  78: '동기 부여', 79: '초심 유지', 80: '성공 이미지화',
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
        path: join(projectRoot, 'public', 'example-baseball.png'),
        type: 'png',
      });
      console.log('Screenshot saved to public/example-baseball.png');
    } else {
      // 전체 페이지 스크린샷
      await page.screenshot({
        path: join(projectRoot, 'public', 'example-baseball.png'),
        type: 'png',
        fullPage: false,
      });
      console.log('Full page screenshot saved to public/example-baseball.png');
    }

    await browser.close();
    console.log('Done!');

  } finally {
    server.kill();
  }
}

main().catch(console.error);
