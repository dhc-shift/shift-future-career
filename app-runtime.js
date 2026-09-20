// ?v= 는 캐시 대응입니다. 파일을 고칠 때마다 index.html과 함께 날짜를 올려주세요.
import { JOBS, buildQuestions } from './question-bank.js?v=20260920b';

/* ------------------------------------------------------------------ *
 * 상태
 * ------------------------------------------------------------------ */

const STORAGE_KEY = 'future-career-application-v2';

const initialState = {
  screen: 'splash',
  coins: 0,
  coinsAwarded: false,
  pendingReward: null,
  purchased: [],
  gift: null,
  giftOpened: false,
  category: 'all',
  companyType: null,
  jobId: null,
  organization: '',
  questionIndex: 0,
  questions: null,
  answers: {},
  name: '',
  studentId: '',
  email: '',
  submitted: false,
  savedAt: null
};

let state = { ...initialState, ...readSaved() };
let splashTimer = null;
let revealTimer = null;
let saveIndicatorTimer = null;

const app = document.querySelector('#app');

function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function save() {
  state.savedAt = Date.now();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* 저장 실패는 진행을 막지 않는다 */
  }
}

function go(screen, extra = {}) {
  state = { ...state, screen, ...extra };
  save();
  render();
}

const esc = (value = '') =>
  String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));

/* ------------------------------------------------------------------ *
 * 데이터
 * ------------------------------------------------------------------ */

const CATEGORIES = [
  ['all', '전체'],
  ['academic', '학업·연구'],
  ['practical', '실무'],
  ['challenge', '도전'],
  ['global', '글로벌'],
  ['leadership', '리더십'],
  ['skill', '역량']
];

// [id, 이름, 카테고리, 설명, 가격, 선행 경험]
const EXPERIENCES = [
  ['undergrad', '학부연구생', 'academic', '질문을 세우고 검증하는 탐구 경험', 15],
  ['master', '대학원 석사', 'academic', '전문 분야를 깊게 탐구하는 학업 경험', 20, 'undergrad'],
  ['minor', '복수전공 / 부전공', 'academic', '관심 분야를 넓혀 연결하는 학업 경험', 12],
  ['research-project', '연구 프로젝트', 'academic', '팀과 함께 연구 질문을 해결한 경험', 16],
  ['conference', '논문·학회 발표', 'academic', '연구 결과를 정리하고 공유한 경험', 18, 'research-project'],
  ['intern', '기업 인턴', 'practical', '조직의 실제 문제를 가까이서 관찰한 경험', 18],
  ['field-training', '현장실습', 'practical', '현장에서 직무를 직접 경험한 시간', 14],
  ['company-project', '기업 프로젝트', 'practical', '기업의 실제 과제를 해결한 경험', 21],
  ['contest-entry', '공모전 참여', 'challenge', '아이디어를 결과물로 만든 첫 도전', 8],
  ['contest-encourage', '공모전 장려상', 'challenge', '끝까지 완성해 인정받은 도전', 12, 'contest-entry'],
  ['contest-award', '공모전 우수상', 'challenge', '높은 완성도로 만든 성과', 18, 'contest-encourage'],
  ['contest-best', '공모전 최우수상', 'challenge', '가장 높은 목표를 향한 도전', 24, 'contest-award'],
  ['hackathon', '해커톤', 'challenge', '짧은 시간 안에 팀으로 만든 결과', 15],
  ['startup', '창업 경험', 'challenge', '문제를 발견하고 실행한 경험', 22],
  ['exchange-us', '교환학생 · 미국·캐나다', 'global', '새로운 환경에서 배우고 적응한 경험', 8],
  ['exchange-eu', '교환학생 · 유럽', 'global', '다른 문화와 관점 속에서 성장한 경험', 7],
  ['exchange-asia', '교환학생 · 아시아', 'global', '가까운 이웃 국가에서 확장한 경험', 6],
  ['overseas-training', '해외연수', 'global', '낯선 환경에서 역량을 키운 경험', 9],
  ['language', '어학 경험', 'global', '다른 언어로 소통하는 힘', 7],
  ['club-staff', '동아리 운영진', 'leadership', '사람과 활동을 꾸준히 운영한 경험', 10],
  ['student-member', '학생회 부원', 'leadership', '공동체의 일원으로 기여한 경험', 7],
  ['student-deputy', '학생회 차장', 'leadership', '업무를 조율하고 책임진 경험', 10, 'student-member'],
  ['council', '학생회 국장', 'leadership', '사람과 목표를 연결한 협업 경험', 14, 'student-deputy'],
  ['student-president', '학생회 회장', 'leadership', '조직 전체의 방향을 책임진 경험', 20, 'council'],
  ['data', '데이터분석 프로젝트', 'skill', '데이터로 문제를 정의하고 해석한 경험', 16],
  ['coding', '코딩 프로젝트', 'skill', '기술로 아이디어를 구현한 경험', 17],
  ['portfolio', '포트폴리오', 'skill', '나의 역량을 결과물로 정리한 경험', 12],
  ['certificate', '직무 자격증', 'skill', '기초 전문성을 증명하는 준비', 10],
  ['shift', 'SHIFT 프로그램 기획 경험', 'skill', '사용자 관점에서 프로그램을 설계한 경험', 16]
];

const GIFTS = [
  'SHIFT 프로그램 기획 경험',
  'SHIFT 운영진 경험',
  'SHIFT IT 온보딩 진행 경험',
  'SHIFT 헬스케어 기업 탐방 경험',
  'SHIFT 소모임 진행 경험'
];

const ORG_LINKS = {
  public: [
    ['국민건강보험공단', 'https://www.nhis.or.kr/nhis/index.do'],
    ['한국보건산업진흥원', 'https://www.khidi.or.kr/'],
    ['한국보건의료인국가시험원', 'https://www.kuksiwon.or.kr/']
  ],
  private: [
    ['삼성 커리어스', 'https://www.samsungcareers.com/'],
    ['Philips Healthcare Careers', 'https://www.careers.philips.com/'],
    ['Medtronic Careers', 'https://jobs.medtronic.com/'],
    ['Roche Careers', 'https://careers.roche.com/']
  ]
};

// 화면 순서 — 진행 표시와 뒤로 가기에 함께 사용
const FLOW = [
  ['gacha', '코인 뽑기'],
  ['shop', '경험 상점'],
  ['mystery', 'SHIFT 선물'],
  ['type', '지원 유형'],
  ['job', '지원 직무'],
  ['org', '지원 기업'],
  ['essay', '지원서 작성'],
  ['complete', '완료']
];

const findExperience = (id) => EXPERIENCES.find((item) => item[0] === id);
const experienceLabels = () => state.purchased.map((id) => findExperience(id)?.[1]).filter(Boolean);
const jobLabel = () => JOBS.find((job) => job.id === state.jobId)?.label || '미선택';
const typeLabel = () => (state.companyType === 'public' ? '공기업·공공기관' : '사기업');
const currentQuestions = () => state.questions || [];
const hasProgress = () => state.coinsAwarded || state.purchased.length > 0 || Object.keys(state.answers).length > 0;

/* ------------------------------------------------------------------ *
 * 공통 화면 요소
 * ------------------------------------------------------------------ */

function stepIndicator(screen) {
  const index = FLOW.findIndex(([id]) => id === screen);
  if (index < 0) return '';
  const percent = ((index + 1) / FLOW.length) * 100;
  return `
    <div class="flow-indicator">
      <div class="flow-meta">
        <span class="mono">STEP ${index + 1} / ${FLOW.length}</span>
        <span class="flow-name">${FLOW[index][1]}</span>
      </div>
      <div class="progress"><i style="width:${percent}%"></i></div>
    </div>`;
}

function header(body, { screen = state.screen } = {}) {
  return `
    <div class="app-shell">
      <header class="topbar">
        <button class="home-button" data-action="home"><span>⌂</span>처음 화면</button>
        <div class="logo">FUTURE <span>CAREER</span></div>
        <div class="header-tools">
          <div class="mono">APPLICATION STUDIO / 2026</div>
          <button class="reset-demo" data-action="restart">처음부터 다시</button>
        </div>
      </header>
      ${stepIndicator(screen)}
      ${body}
    </div>`;
}

function backButton(action, label) {
  return `<button class="button secondary" data-action="${action}">← ${label}</button>`;
}

/* ------------------------------------------------------------------ *
 * 화면
 * ------------------------------------------------------------------ */

const SCREENS = {
  splash: splashScreen,
  welcome: welcomeScreen,
  gacha: gachaScreen,
  shop: shopScreen,
  mystery: mysteryScreen,
  recruit: recruitScreen,
  type: typeScreen,
  job: jobScreen,
  org: orgScreen,
  essay: essayScreen,
  complete: completeScreen,
  resume: resumeScreen,
  applicant: applicantScreen
};

function render() {
  const screen = SCREENS[state.screen] ? state.screen : 'splash';
  if (screen !== state.screen) state.screen = screen;
  SCREENS[screen]();
  window.scrollTo({ top: 0 });
}

function splashScreen() {
  app.innerHTML = `
    <div class="splash-screen" data-action="skip-splash">
      <div class="splash-mark">
        <div class="splash-kicker">MY FUTURE, MY SHIFT</div>
        <div class="splash-logo">FUTURE <span>RESUME</span></div>
        <p>나의 경험을 미래의 지원서로</p>
      </div>
    </div>`;
  if (splashTimer) return;
  splashTimer = setTimeout(() => {
    splashTimer = null;
    go(hasProgress() ? 'welcome' : 'gacha');
  }, 1500);
}

// 재접속했을 때 이어할지 처음부터 할지 고르는 화면
function welcomeScreen() {
  const answered = Object.values(state.answers).filter((text) => text && text.trim()).length;
  const stepName = FLOW.find(([id]) => id === state.lastFlowScreen)?.[1] || '경험 상점';
  app.innerHTML = header(`
    <main class="welcome-page">
      <div class="eyebrow">WELCOME BACK</div>
      <h1>이어서 작성하시겠어요?</h1>
      <p class="lead">이전에 작성하던 내용이 이 브라우저에 저장되어 있습니다.</p>
      <div class="welcome-summary">
        <div><span>마지막 단계</span><strong>${esc(stepName)}</strong></div>
        <div><span>보유 코인</span><strong>${state.coins} COINS</strong></div>
        <div><span>선택한 경험</span><strong>${state.purchased.length}개</strong></div>
        <div><span>작성한 문항</span><strong>${answered}개</strong></div>
      </div>
      <div class="actions">
        <button class="button accent" data-action="continue">이어서 하기 →</button>
        <button class="button secondary" data-action="restart">처음부터 다시</button>
      </div>
      <p class="hint">처음부터 다시 시작하면 지금까지 작성한 내용은 모두 지워집니다.</p>
    </main>`, { screen: 'welcome' });
}

function gachaScreen() {
  if (state.pendingReward === null) {
    state.pendingReward = Math.floor(Math.random() * 31) + 40;
    save();
  }
  const reward = state.pendingReward;
  const claimed = state.coinsAwarded;

  app.innerHTML = header(`
    <div class="gacha-screen${claimed ? ' complete' : ''}">
      <div class="gacha-copy">
        <div class="splash-kicker">SHIFT LUCKY DROP</div>
        <h1>오늘의 미래 코인을 <span>뽑아보세요.</span></h1>
        <p>가챠 머신이 첫 Career Shop 코인을 준비하고 있습니다.</p>
      </div>
      <div class="gacha-machine">
        <div class="machine-top"><span></span><span></span><span></span><span></span><span></span></div>
        <div class="machine-glass">
          <i class="capsule capsule-one"></i><i class="capsule capsule-two"></i><i class="capsule capsule-three"></i>
          <i class="capsule capsule-four"></i><i class="capsule capsule-five"></i><i class="winning-capsule">◈</i>
        </div>
        <div class="machine-base">
          <div class="machine-label">FUTURE<br>RESUME</div>
          <div class="machine-slot"></div>
          <div class="machine-knob"></div>
        </div>
      </div>
      <div class="gacha-status">
        <span class="status-shuffle">CAPSULES SHUFFLING · · ·</span>
        <span class="status-reveal">YOUR CAPSULE IS READY</span>
        <strong class="gacha-reward">◈ ${reward}</strong>
        <div class="gacha-actions">
          <button class="button accent" data-action="claim-coins">코인 받기 →</button>
        </div>
      </div>
      <div class="gacha-result" style="display:none">
        <div class="result-label">YOU GOT</div>
        <strong>◈ ${reward} COINS</strong>
        <p>Career Shop 코인을 획득했습니다. 코인은 한 번만 지급되며 다시 뽑을 수 없습니다.</p>
        <div class="gacha-result-actions">
          <button class="button secondary" data-action="close-reward">나중에 받기</button>
          <button class="button accent" data-action="claim-coins">코인 받기 →</button>
        </div>
      </div>
    </div>`, { screen: 'gacha' });

  if (claimed) return;
  clearTimeout(revealTimer);
  revealTimer = setTimeout(() => {
    document.querySelector('.gacha-screen')?.classList.add('complete');
    const result = document.querySelector('.gacha-result');
    if (result) result.style.display = 'grid';
  }, 4300);
}

function shopScreen() {
  const visible = EXPERIENCES.filter((item) => state.category === 'all' || item[2] === state.category);
  const tabs = CATEGORIES.map(
    ([id, label]) => `<button class="category-tab ${state.category === id ? 'active' : ''}" data-category="${id}">${label}</button>`
  ).join('');

  const cards = visible
    .map(([id, label, category, detail, cost, requires]) => {
      const ownedCount = state.purchased.filter((item) => item === id).length;
      const prerequisite = requires ? findExperience(requires)?.[1] : '';
      const locked = Boolean(requires) && !state.purchased.includes(requires);
      const controls = ownedCount
        ? `<div class="quantity-control">
             <button class="quantity-button" data-decrease="${id}" aria-label="${esc(label)} 수량 줄이기">−</button>
             <span class="owned-label">${ownedCount}개 보유</span>
             <button class="quantity-button" data-increase="${id}" aria-label="${esc(label)} 수량 늘리기">+</button>
           </div>`
        : `<button class="button small" data-buy="${id}" ${state.coins < cost || locked ? 'disabled' : ''}>${locked ? '잠김' : '구매하기'}</button>`;
      return `
        <article class="shop-item ${ownedCount ? 'owned' : ''} ${locked ? 'locked' : ''}">
          <div>
            <div class="mono">${CATEGORIES.find((item) => item[0] === category)?.[1] || 'CAREER EXPERIENCE'}</div>
            <h3>${label}</h3>
            <p>${detail}</p>
            ${locked ? `<div class="prerequisite">${prerequisite} 경험이 먼저 필요합니다</div>` : ''}
          </div>
          <div class="shop-item-footer">
            <span class="coin-cost">${cost} COINS</span>
            <div class="shop-item-actions">${controls}</div>
          </div>
        </article>`;
    })
    .join('');

  const total = state.purchased.length;
  app.innerHTML = header(`
    <main class="shop-page">
      <div class="eyebrow">CAREER SHOP / EXPERIENCE STORE</div>
      <div class="shop-title-row">
        <div>
          <h1>EXPERIENCE STORE</h1>
          <p class="lead">미래의 나를 상상하며, 필요한 경험을 하나씩 구매해보세요.</p>
        </div>
        <div class="coin-wallet">
          <span>MY COINS</span>
          <strong>${state.coins} COINS</strong>
          <small>선택한 경험 ${total}개</small>
        </div>
      </div>
      <div class="category-tabs">${tabs}</div>
      <div class="shop-grid">${cards}</div>
      <div class="actions">
        <button class="button accent" data-action="finish-shop" ${total ? '' : 'disabled'}>
          ${total ? '지원하러 가기 →' : '경험을 1개 이상 선택하세요'}
        </button>
      </div>
    </main>`, { screen: 'shop' });
}

function mysteryScreen() {
  const stage = state.giftOpened
    ? `<section class="mystery-reveal">
         <div class="reward-decor reward-decor-left"></div>
         <div class="reward-decor reward-decor-right"></div>
         <div class="eyebrow">CONGRATULATIONS!</div>
         <h2>축하합니다!</h2>
         <div class="reward-highlight">${esc(state.gift || '')} 당첨!</div>
         <p>SHIFT가 당신의 대학생활을 응원합니다. 새로운 경험이 MY CAREER에 추가되었습니다.</p>
         <div class="actions center-actions">
           ${backButton('back-to-shop', '경험 더 고르기')}
           <button class="button accent" data-action="confirm-gift">지원 시작하기 →</button>
         </div>
       </section>`
    : `<section class="mystery-gift-stage">
         <div class="side-note note-left">SHIFT가 준비한<br>특별한 경험!</div>
         <div class="mystery-decor decor-one"></div>
         <div class="mystery-decor decor-two"></div>
         <div class="gift-illustration"><img src="mystery-box.png" alt="SHIFT Mystery Box 선물상자"></div>
         <div class="side-note note-right">A SMALL GIFT<br>BY SHIFT</div>
         <button class="button accent mystery-cta" data-action="open-gift">선물 열어보기</button>
       </section>`;

  app.innerHTML = header(`
    <main class="mystery-page">
      <div class="eyebrow">SHIFT MYSTERY BOX</div>
      <h1><span>SHIFT</span> MYSTERY GIFT</h1>
      <p class="lead">구매한 경험과는 별개로, SHIFT의 랜덤 보너스를 확인해보세요.</p>
      ${stage}
      <section class="mystery-info-card">
        <div><span>MY EXPERIENCE</span><strong>${state.purchased.length}개 보유</strong></div>
        <div><span>SHIFT BONUS</span><strong>${state.giftOpened ? '1개' : '확인 전'}</strong></div>
        <div class="mystery-tip">
          <span>TIP</span>
          <p>SHIFT Mystery Box에서는 구매한 경험과는 다른 특별한 경험이 지급됩니다.</p>
        </div>
      </section>
    </main>`, { screen: 'mystery' });
}

function recruitScreen() {
  app.innerHTML = header(`
    <main class="recruit-page">
      <div class="recruit-hero">
        <div class="eyebrow">RECRUIT / FUTURE CAREER</div>
        <h1>미래를 함께 만들어갈 <span>인재를 기다립니다.</span></h1>
        <p>이제 경험을 지원 직무와 연결하고, 나만의 미래 지원서를 시작해보세요.</p>
        <div class="recruit-gift">
          <span class="badge">SPECIAL GIFT</span>
          <strong>${esc(state.gift || 'SHIFT 보너스 경험')}</strong>
          <span>SHIFT가 당신의 대학생활을 응원합니다.</span>
        </div>
        <div class="actions">
          ${backButton('mystery', 'SHIFT 선물 다시 보기')}
          <button class="button accent" data-action="type">지원 유형 고르기 →</button>
        </div>
      </div>
      <div class="recruit-strip">
        <span>YOUR EXPERIENCE</span>
        <strong>경험을 선택했다면, 이제 지원할 미래를 고릅니다.</strong>
      </div>
    </main>`, { screen: 'type' });
}

function typeScreen() {
  app.innerHTML = header(`
    <main>
      <div class="eyebrow">WHERE DO YOU WANT TO WORK?</div>
      <h1>어떤 조직의 미래에 지원하시겠습니까?</h1>
      <div class="cards">
        <article class="card ${state.companyType === 'private' ? 'selected' : ''}">
          <div class="icon">🏢</div>
          <h3>PRIVATE COMPANY</h3>
          <p>성과와 성장, 직무 전문성, 기업 핵심가치를 중심으로 작성합니다.</p>
          <button class="button" data-type="private">사기업 지원하기 →</button>
        </article>
        <article class="card ${state.companyType === 'public' ? 'selected' : ''}">
          <div class="icon">🏛</div>
          <h3>PUBLIC INSTITUTION</h3>
          <p>직무수행능력, 문제해결, 직업윤리와 공공성을 중심으로 작성합니다.</p>
          <button class="button" data-type="public">공기업·공공기관 지원하기 →</button>
        </article>
      </div>
      <div class="actions">${backButton('back-to-mystery', 'SHIFT 선물로')}</div>
    </main>`, { screen: 'type' });
}

function jobScreen() {
  const list = state.companyType === 'public' ? JOBS : [...JOBS].sort((a, b) => Number(a.public) - Number(b.public));
  app.innerHTML = header(`
    <main>
      <div class="eyebrow">JOB CATEGORY</div>
      <h1>지원 직무를 선택하세요</h1>
      <p class="lead">${typeLabel()}에 지원합니다. 관심 있는 직무를 하나 고르세요.</p>
      <div class="job-grid">
        ${list
          .map(
            (job) => `<button class="job ${job.id === state.jobId ? 'selected' : ''}" data-job="${job.id}" aria-pressed="${job.id === state.jobId}">
              <strong>${job.label}</strong>${job.public ? '<small>공공기관 지원 가능</small>' : ''}
            </button>`
          )
          .join('')}
      </div>
      <div class="actions">
        ${backButton('type', '지원 유형 다시 고르기')}
        <button class="button accent" data-action="job-next" ${state.jobId ? '' : 'disabled'}>
          ${state.jobId ? '직무 선택 완료 →' : '직무를 선택하세요'}
        </button>
      </div>
    </main>`, { screen: 'job' });
}

function orgScreen() {
  const isPublic = state.companyType === 'public';
  const links = ORG_LINKS[isPublic ? 'public' : 'private']
    .map(([label, url]) => `<a class="career-link" href="${url}" target="_blank" rel="noreferrer"><span>${label}</span><strong>↗</strong></a>`)
    .join('');
  const filled = Boolean(state.organization.trim());

  app.innerHTML = header(`
    <main>
      <div class="eyebrow">ORGANIZATION</div>
      <h1>${isPublic ? '지원 기관' : '지원 기업'}을 정해보세요</h1>
      <p class="lead">${isPublic ? '기관의 주요 사업과 지원 직무의 역할을 먼저 조사하세요.' : '공식 채용 홈페이지와 핵심가치·인재상을 직접 조사하세요.'}</p>
      <div class="field">
        <label for="org">지원 ${isPublic ? '기관' : '기업'} 이름 <span class="required">필수</span></label>
        <input id="org" value="${esc(state.organization)}" placeholder="예: ${isPublic ? '국민건강보험공단' : '삼성전자'}" autocomplete="off">
        <p class="field-hint" id="org-hint">${filled ? '입력한 내용은 자동으로 저장됩니다.' : '지원할 곳을 입력해야 다음 단계로 넘어갈 수 있습니다.'}</p>
      </div>
      <section class="career-links">
        <div>
          <div class="mono">${isPublic ? 'PUBLIC HEALTH REFERENCES' : 'HEALTHCARE TALENT REFERENCES'}</div>
          <h3>${isPublic ? '기관의 사업과 직무 역할을 확인하세요.' : '헬스케어 기업의 인재상과 채용 기준을 확인하세요.'}</h3>
        </div>
        <div class="career-link-grid">${links}</div>
      </section>
      ${isPublic ? '<div class="blind"><strong>BLIND RECRUITMENT MODE</strong>직무와 직접 관계없는 개인정보는 작성하지 않습니다.</div>' : ''}
      <div class="actions">
        ${backButton('job', '직무 다시 고르기')}
        <button class="button accent" data-action="org-next" ${filled ? '' : 'disabled'}>지원서 작성하기 →</button>
      </div>
    </main>`, { screen: 'org' });

  const input = document.querySelector('#org');
  input?.addEventListener('input', (event) => {
    state.organization = event.target.value;
    save();
    const ready = Boolean(event.target.value.trim());
    const nextButton = document.querySelector('[data-action="org-next"]');
    if (nextButton) nextButton.disabled = !ready;
    const hint = document.querySelector('#org-hint');
    if (hint) hint.textContent = ready ? '입력한 내용은 자동으로 저장됩니다.' : '지원할 곳을 입력해야 다음 단계로 넘어갈 수 있습니다.';
  });
}

function essayScreen() {
  const questions = state.questions?.length ? state.questions : buildQuestions(state.companyType, state.jobId);
  state.questions = questions;
  const index = Math.min(state.questionIndex, questions.length - 1);
  state.questionIndex = index;
  const question = questions[index];
  const answer = state.answers[question.id] || '';
  const isLast = index === questions.length - 1;

  app.innerHTML = header(`
    <main class="essay-page">
      <div class="essay-heading">
        <div class="eyebrow">APPLICATION ESSAY · 문항 ${index + 1} / ${questions.length}</div>
        <button class="career-check-button" data-action="view-career">내 경험 확인하기</button>
      </div>
      <div class="steps">
        ${questions
          .map((item, i) => {
            const done = (state.answers[item.id] || '').trim().length > 0;
            return `<button class="step ${i === index ? 'active' : ''} ${done ? 'done' : ''}" data-question="${i}">문항 ${i + 1} ${done ? '●' : '○'}</button>`;
          })
          .join('')}
      </div>
      <div class="essay-context mono">${esc(typeLabel())} · ${esc(jobLabel())} · ${esc(state.organization || '미입력')}</div>
      <h2>${question.question}</h2>
      <div class="guide">작성 구조: ${question.writingGuide}</div>
      <textarea id="answer" maxlength="700" placeholder="나의 경험과 생각을 직접 작성해보세요.">${esc(answer)}</textarea>
      <div class="essay-status">
        <span class="save-indicator" id="save-indicator" aria-live="polite">작성 중인 내용은 이 브라우저에 자동 저장됩니다</span>
        <span class="counter"><span id="count">${answer.length}</span> / 700</span>
      </div>
      <div class="actions">
        ${index === 0 ? backButton('back-to-org', '지원 기업 수정') : '<button class="button secondary" data-action="previous">← 이전 문항</button>'}
        <button class="button accent" data-action="next">${isLast ? '작성 완료 →' : '다음 문항 →'}</button>
      </div>
    </main>`, { screen: 'essay' });

  const textarea = document.querySelector('#answer');
  textarea?.addEventListener('input', (event) => {
    state.answers[question.id] = event.target.value;
    save();
    const counter = document.querySelector('#count');
    if (counter) counter.textContent = String(event.target.value.length);
    showSaved();
  });
}

function showSaved() {
  const indicator = document.querySelector('#save-indicator');
  if (!indicator) return;
  const time = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  indicator.textContent = `${time} 자동 저장됨 · 창을 닫아도 이어서 쓸 수 있습니다`;
  indicator.classList.add('saved');
  clearTimeout(saveIndicatorTimer);
  saveIndicatorTimer = setTimeout(() => indicator.classList.remove('saved'), 1200);
}

function completeScreen() {
  const questions = currentQuestions();
  const missing = questions.filter((question) => !(state.answers[question.id] || '').trim());
  app.innerHTML = header(`
    <main class="completion-page">
      <div class="completion-card">
        <div class="eyebrow">APPLICATION COMPLETE</div>
        <h1>미래의 지원서가 <span>완성되었습니다.</span></h1>
        <p>작성한 경험과 답변이 Future Resume에 저장되었습니다.</p>
        <div class="completion-summary">
          <div><span>지원 유형</span><strong>${esc(typeLabel())}</strong></div>
          <div><span>지원 직무</span><strong>${esc(jobLabel())}</strong></div>
          <div><span>지원 기업·기관</span><strong>${esc(state.organization || '미입력')}</strong></div>
          <div><span>연결한 경험</span><strong>${state.purchased.length}개 + SHIFT 보너스</strong></div>
        </div>
        ${missing.length
          ? `<div class="notice-inline">아직 작성하지 않은 문항이 ${missing.length}개 있습니다. 지금 이어서 작성할 수 있습니다.</div>`
          : ''}
        <div class="actions">
          <button class="button secondary" data-action="back-to-essay">← 지원서 다시 보기</button>
          <button class="button accent" data-action="future-resume">FUTURE RESUME 확인하기 →</button>
        </div>
      </div>
    </main>`, { screen: 'complete' });
}

function resumeScreen() {
  const labels = experienceLabels();
  const unique = [...new Set(labels)];
  const questions = currentQuestions();
  app.innerHTML = header(`
    <main class="completion-page">
      <div class="eyebrow">FUTURE RESUME</div>
      <h1>나의 미래 <span>지원 기록</span></h1>
      <div class="resume-panel">
        <div><span>APPLICATION STATUS</span><strong>${state.submitted ? '제출 완료' : '작성 완료'}</strong></div>
        <div><span>SELECTED JOB</span><strong>${esc(jobLabel())}</strong></div>
        <div><span>CAREER EXPERIENCE</span><strong>${labels.length}개 + SHIFT 보너스</strong></div>
      </div>
      <div class="tags">
        ${unique.map((label) => `<span class="tag">#${esc(label)}</span>`).join('')}
        ${state.gift ? `<span class="tag">#${esc(state.gift)}</span>` : ''}
      </div>
      <div class="review">
        ${questions
          .map((question, i) => `
            <div class="review-item">
              <div class="mono">Q${i + 1}</div>
              <h3>${question.question}</h3>
              <p>${esc(state.answers[question.id] || '미작성')}</p>
            </div>`)
          .join('')}
      </div>
      <div class="actions">
        <button class="button secondary" data-action="back-to-essay">← 내용 수정하기</button>
        <button class="button accent" data-action="go-applicant">제출하기 →</button>
      </div>
    </main>`, { screen: 'complete' });
}

/* 제출 직전에 이름·학번·이메일을 받는 화면 */

const APPLICANT_RULES = {
  name: (value) => (value.trim().length >= 2 ? '' : '이름을 두 글자 이상 입력해주세요.'),
  studentId: (value) => (/^\d{6,10}$/.test(value.trim()) ? '' : '학번을 숫자로 입력해주세요.'),
  email: (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : '받으실 이메일 주소를 정확히 입력해주세요.')
};

const applicantErrors = () =>
  Object.entries(APPLICANT_RULES)
    .map(([field, check]) => [field, check(state[field] || '')])
    .filter(([, message]) => message);

function applicantScreen() {
  const fields = [
    ['name', '이름', '예: 김시프트', 'text', 'name'],
    ['studentId', '학번', '예: 25012345', 'text', 'off'],
    ['email', '이메일', '예: shift@example.com', 'email', 'email']
  ];
  const ready = applicantErrors().length === 0;

  app.innerHTML = header(`
    <main class="applicant-page">
      <div class="eyebrow">APPLICANT INFO</div>
      <h1>제출자 정보를 입력해주세요</h1>
      <p class="lead">작성하신 지원서를 입력하신 이메일로 보내드립니다. 같은 내용이 SHIFT 운영진에게도 전달됩니다.</p>
      ${fields
        .map(
          ([field, label, placeholder, type, autocomplete]) => `
        <div class="field">
          <label for="${field}">${label} <span class="required">필수</span></label>
          <input id="${field}" type="${type}" value="${esc(state[field] || '')}" placeholder="${placeholder}" autocomplete="${autocomplete}" data-field="${field}">
          <p class="field-error" id="${field}-error"></p>
        </div>`
        )
        .join('')}
      <div class="blind">
        <strong>개인정보 안내</strong>
        입력하신 이름·학번·이메일은 제출 확인과 마일리지 지급에만 사용하며, SHIFT 운영진만 확인합니다.
      </div>
      <div class="actions">
        <button class="button secondary" data-action="future-resume">← 작성 내용 다시 보기</button>
        <button class="button accent" data-action="submit-application" ${ready ? '' : 'disabled'}>제출하기 →</button>
      </div>
    </main>`, { screen: 'complete' });

  document.querySelectorAll('[data-field]').forEach((input) => {
    input.addEventListener('input', (event) => {
      const field = event.target.dataset.field;
      state[field] = event.target.value;
      save();
      const message = APPLICANT_RULES[field](event.target.value);
      const errorBox = document.querySelector(`#${field}-error`);
      if (errorBox) errorBox.textContent = event.target.value.trim() ? message : '';
      const submitButton = document.querySelector('[data-action="submit-application"]');
      if (submitButton) submitButton.disabled = applicantErrors().length > 0;
    });
  });
}

/* ------------------------------------------------------------------ *
 * 모달
 * ------------------------------------------------------------------ */

function openModal(html, className = '') {
  closeModal();
  app.insertAdjacentHTML('beforeend', `<div class="modal-backdrop ${className}">${html}</div>`);
  document.querySelector('.modal-backdrop .button.accent, .modal-backdrop button')?.focus();
}

const closeModal = () => document.querySelector('.modal-backdrop')?.remove();

function showNotice(message) {
  openModal(`
    <section class="modal purchase-modal" role="alertdialog" aria-modal="true">
      <div class="eyebrow">CAREER SHOP</div>
      <h2>${esc(message)}</h2>
      <button class="button accent" data-action="close-modal">확인</button>
    </section>`);
}

// 구매·환불처럼 연속으로 일어나는 동작은 모달 대신 토스트로 알린다
let toastTimer = null;
function showToast(message) {
  document.querySelector('.toast')?.remove();
  app.insertAdjacentHTML('beforeend', `<div class="toast" role="status" aria-live="polite">${esc(message)}</div>`);
  const toast = document.querySelector('.toast');
  requestAnimationFrame(() => toast?.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast?.classList.remove('show');
    setTimeout(() => toast?.remove(), 250);
  }, 2000);
}

function confirmDialog({ eyebrow, title, detail, cost, confirmLabel, cancelLabel, action, id }) {
  openModal(`
    <section class="modal purchase-modal" role="dialog" aria-modal="true">
      <div class="eyebrow">${eyebrow}</div>
      <h2>${esc(title)}</h2>
      ${cost ? `<div class="purchase-cost">${cost}</div>` : ''}
      <p>${detail}</p>
      <div class="actions">
        <button class="button secondary" data-action="close-modal">${cancelLabel}</button>
        <button class="button accent" data-action="${action}" data-id="${id || ''}">${confirmLabel}</button>
      </div>
    </section>`);
}

function openCareerReview() {
  const labels = experienceLabels();
  const rows = [...new Set(labels)]
    .map((label) => `<li><span>${esc(label)}</span><strong>${labels.filter((item) => item === label).length}개</strong></li>`)
    .join('');
  openModal(`
    <section class="modal career-review-panel" role="dialog" aria-modal="true">
      <div class="essay-heading">
        <div>
          <div class="eyebrow">MY CAREER INVENTORY</div>
          <h2>내 경험 확인하기</h2>
        </div>
        <button class="career-close-button" data-action="close-modal">닫기</button>
      </div>
      <p>Career Shop에서 구매한 경험과 SHIFT 보너스를 확인할 수 있습니다.</p>
      <ul class="career-review-list">${rows || '<li><span>구매한 경험이 없습니다.</span></li>'}</ul>
      ${state.gift ? `<div class="career-bonus"><span>SHIFT BONUS</span><strong>${esc(state.gift)}</strong></div>` : ''}
    </section>`, 'career-review-modal');
}

/* ------------------------------------------------------------------ *
 * 구매 처리
 * ------------------------------------------------------------------ */

function buy(item) {
  const [id, label, , , cost, requires] = item;
  if (requires && !state.purchased.includes(requires)) {
    showNotice(`${findExperience(requires)?.[1]} 경험이 먼저 필요합니다.`);
    return;
  }
  if (state.coins < cost) {
    showNotice(`코인이 부족합니다. ${label} 구매에는 ${cost} COINS가 필요합니다.`);
    return;
  }
  state.coins -= cost;
  state.purchased.push(id);
  save();
  render();
  showToast(`${label} · ${cost} COINS 구매 완료`);
}

function refund(item, { notify = true } = {}) {
  const [id, label, , , cost] = item;
  const index = state.purchased.lastIndexOf(id);
  if (index < 0) return;
  // 선행 경험을 취소하면 그 경험을 필요로 하는 항목도 함께 정리한다
  const stillOwned = state.purchased.filter((entry) => entry === id).length - 1;
  if (!stillOwned) {
    const dependents = EXPERIENCES.filter((entry) => entry[5] === id && state.purchased.includes(entry[0]));
    dependents.forEach((dependent) => refund(dependent, { notify: false }));
  }
  state.purchased.splice(index, 1);
  state.coins += cost;
  save();
  render();
  if (notify) showToast(`${label} 취소 · ${cost} COINS 환불`);
}

/* ------------------------------------------------------------------ *
 * 제출
 * ------------------------------------------------------------------ */

// 배포한 Apps Script 웹 앱 주소를 넣으면 시트 저장·PDF 발송이 연결됩니다.
// 비워두면 예전처럼 메일 작성 창을 여는 방식으로 동작합니다.
const SUBMIT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzfyW1A5YdHyHGgTC82tIm5RAyxMD4dKzk_SRgUeX70DIHUFlXVFU4fpZQlUEBXgKzH/exec';

function submissionPayload() {
  const questions = currentQuestions().map((question) => ({
    question: question.question,
    answer: state.answers[question.id] || ''
  }));
  const skillIds = EXPERIENCES.filter((item) => item[2] === 'skill').map((item) => item[0]);
  return {
    name: state.name,
    studentId: state.studentId,
    email: state.email,
    companyType: typeLabel(),
    job: jobLabel(),
    organization: state.organization,
    experiences: [...new Set(experienceLabels())],
    skills: [...new Set(state.purchased.filter((id) => skillIds.includes(id)).map((id) => findExperience(id)[1]))],
    gift: state.gift || '',
    coins: state.coins,
    questions
  };
}

async function submitApplication() {
  if (!SUBMIT_ENDPOINT) return submitByMail();

  openModal(`
    <section class="modal purchase-modal" role="alertdialog" aria-modal="true">
      <div class="eyebrow">SUBMITTING</div>
      <h2>제출하는 중입니다</h2>
      <p>잠시만 기다려주세요. 작성하신 지원서를 PDF로 만들어 메일로 보내드립니다.</p>
    </section>`);

  try {
    const response = await fetch(SUBMIT_ENDPOINT, {
      method: 'POST',
      // text/plain 으로 보내야 사전 확인 요청 없이 바로 전달됩니다
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(submissionPayload())
    });
    const result = await response.json();
    if (!result.ok) throw new Error(result.message || '제출에 실패했습니다.');

    state.submitted = true;
    save();
    closeModal();
    render();
    openModal(`
      <section class="modal purchase-modal" role="alertdialog" aria-modal="true">
        <div class="eyebrow">SUBMITTED</div>
        <h2>제출이 완료되었습니다</h2>
        <p>${esc(state.email)} 주소로 작성하신 지원서를 보내드렸습니다. 메일이 보이지 않으면 스팸함도 확인해주세요.</p>
        <button class="button accent" data-action="close-modal">확인</button>
      </section>`);
  } catch (error) {
    closeModal();
    openModal(`
      <section class="modal purchase-modal" role="alertdialog" aria-modal="true">
        <div class="eyebrow">SUBMIT FAILED</div>
        <h2>제출하지 못했습니다</h2>
        <p>작성하신 내용은 그대로 남아 있습니다. 다시 시도하거나, 메일로 보내는 방법을 이용해주세요.</p>
        <div class="actions">
          <button class="button secondary" data-action="submit-by-mail">메일로 보내기</button>
          <button class="button accent" data-action="retry-submit">다시 시도</button>
        </div>
      </section>`);
  }
}

// 연결 전이거나 전송이 실패했을 때 쓰는 방법 — 메일 작성 창을 열어줍니다
function submitByMail() {
  const payload = submissionPayload();
  const subject = `[미래이력서] ${payload.studentId || '학번미입력'}_${payload.name || '이름미입력'}`;
  const lines = [
    `이름: ${payload.name || '미입력'}`,
    `학번: ${payload.studentId || '미입력'}`,
    `이메일: ${payload.email || '미입력'}`,
    `채용 유형: ${payload.companyType}`,
    `지원 기업·기관: ${payload.organization || '미입력'}`,
    `지원 직무: ${payload.job}`,
    `선택한 경험: ${payload.experiences.join(', ') || '없음'}`,
    `SHIFT 보너스: ${payload.gift || '없음'}`,
    '',
    'APPLICATION ESSAY'
  ];
  payload.questions.forEach((item, index) => {
    lines.push(`Q${index + 1} ${item.question}`);
    lines.push(`답변: ${item.answer || '미작성'}`);
    lines.push('');
  });
  const body = encodeURIComponent(lines.join(String.fromCharCode(10)));
  const url = `https://mail.google.com/mail/?view=cm&fs=1&to=shiftysdh@gmail.com&su=${encodeURIComponent(subject)}&body=${body}`;
  const opened = window.open(url, '_blank');
  state.submitted = true;
  save();
  if (!opened) {
    showNotice('팝업이 차단되어 메일 창을 열지 못했습니다. 브라우저의 팝업 차단을 해제한 뒤 다시 시도해주세요.');
    return;
  }
  render();
}

/* ------------------------------------------------------------------ *
 * 이벤트
 * ------------------------------------------------------------------ */

const ACTIONS = {
  'skip-splash': () => {
    clearTimeout(splashTimer);
    splashTimer = null;
    go(hasProgress() ? 'welcome' : 'gacha');
  },
  home: () => {
    if (!hasProgress()) return go('splash');
    state.lastFlowScreen = state.screen;
    go('welcome');
  },
  continue: () => go(state.lastFlowScreen && SCREENS[state.lastFlowScreen] ? state.lastFlowScreen : 'shop'),
  restart: () =>
    confirmDialog({
      eyebrow: 'RESTART',
      title: '처음부터 다시 시작할까요?',
      detail: '지금까지 뽑은 코인, 선택한 경험, 작성한 답변이 모두 지워집니다.',
      confirmLabel: '처음부터 다시',
      cancelLabel: '돌아가기',
      action: 'confirm-restart'
    }),
  'confirm-restart': () => {
    closeModal();
    localStorage.removeItem(STORAGE_KEY);
    state = { ...initialState };
    clearTimeout(splashTimer);
    clearTimeout(revealTimer);
    splashTimer = null;
    render();
  },
  'claim-coins': () => {
    closeModal();
    if (state.coinsAwarded) return go('shop');
    state.coins = state.pendingReward ?? 0;
    state.coinsAwarded = true;
    go('shop');
  },
  'close-reward': () => {
    const result = document.querySelector('.gacha-result');
    if (result) result.style.display = 'none';
  },
  'finish-shop': () => {
    if (!state.purchased.length) return showNotice('경험을 1개 이상 선택한 뒤 진행해주세요.');
    if (!state.gift) state.gift = GIFTS[Math.floor(Math.random() * GIFTS.length)];
    go('mystery');
  },
  'open-gift': () => go('mystery', { giftOpened: true }),
  'confirm-gift': () => go('type'),
  'back-to-shop': () => go('shop'),
  'back-to-mystery': () => go('mystery'),
  mystery: () => go('mystery'),
  type: () => go('type'),
  job: () => go('job'),
  'job-next': () => (state.jobId ? go('org') : showNotice('지원 직무를 먼저 선택해주세요.')),
  'back-to-org': () => go('org'),
  'org-next': () => {
    if (!state.organization.trim()) return showNotice('지원할 기업 또는 기관 이름을 입력해주세요.');
    const questions = state.questions?.length ? state.questions : buildQuestions(state.companyType, state.jobId);
    go('essay', { questionIndex: 0, questions });
  },
  previous: () => state.questionIndex > 0 && go('essay', { questionIndex: state.questionIndex - 1 }),
  next: () => {
    const questions = currentQuestions();
    if (state.questionIndex < questions.length - 1) return go('essay', { questionIndex: state.questionIndex + 1 });
    go('complete');
  },
  'back-to-essay': () => go('essay', { questionIndex: 0 }),
  'future-resume': () => go('resume'),
  'go-applicant': () => go('applicant'),
  'submit-application': () => {
    if (applicantErrors().length) return showNotice('제출자 정보를 모두 입력해주세요.');
    return confirmDialog({
      eyebrow: 'SUBMIT',
      title: '작성한 지원서를 제출할까요?',
      detail: `${esc(state.email)} 주소로 사본이 발송됩니다. 제출 후에도 내용을 수정해 다시 제출할 수 있습니다.`,
      confirmLabel: '제출하기',
      cancelLabel: '돌아가기',
      action: 'confirm-submit'
    });
  },
  'confirm-submit': () => {
    closeModal();
    submitApplication();
  },
  'retry-submit': () => {
    closeModal();
    submitApplication();
  },
  'submit-by-mail': () => {
    closeModal();
    submitByMail();
  },
  'view-career': openCareerReview,
  'close-modal': closeModal
};

app.addEventListener('click', (event) => {
  const category = event.target.closest('[data-category]');
  if (category) {
    state.category = category.dataset.category;
    save();
    render();
    return;
  }

  const questionStep = event.target.closest('[data-question]');
  if (questionStep) return go('essay', { questionIndex: Number(questionStep.dataset.question) });

  const typeButton = event.target.closest('[data-type]');
  if (typeButton) {
    const changed = state.companyType !== typeButton.dataset.type;
    return go('job', {
      companyType: typeButton.dataset.type,
      jobId: changed ? null : state.jobId,
      questions: changed ? null : state.questions
    });
  }

  const jobButton = event.target.closest('[data-job]');
  if (jobButton) {
    state.jobId = jobButton.dataset.job;
    state.questions = null;
    save();
    render();
    return;
  }

  const buyButton = event.target.closest('[data-buy]');
  if (buyButton) {
    const item = findExperience(buyButton.dataset.buy);
    if (!item) return;
    return confirmDialog({
      eyebrow: 'PURCHASE CHECK',
      title: `${item[1]}을(를) 구매할까요?`,
      detail: '구매한 경험은 자기소개서를 쓸 때 활용할 수 있습니다.',
      cost: `◈ ${item[4]} COINS`,
      confirmLabel: '구매하기',
      cancelLabel: '취소',
      action: 'confirm-purchase',
      id: item[0]
    });
  }

  const increase = event.target.closest('[data-increase]');
  if (increase) {
    const item = findExperience(increase.dataset.increase);
    if (item) buy(item);
    return;
  }

  const decrease = event.target.closest('[data-decrease]');
  if (decrease) {
    const item = findExperience(decrease.dataset.decrease);
    if (!item) return;
    const count = state.purchased.filter((id) => id === item[0]).length;
    if (count > 1) return refund(item);
    return confirmDialog({
      eyebrow: 'CANCEL PURCHASE',
      title: `${item[1]} 구매를 취소할까요?`,
      detail: '보유 경험에서 제거되고 코인이 환불됩니다.',
      cost: `${item[4]} COINS 환불`,
      confirmLabel: '구매 취소',
      cancelLabel: '돌아가기',
      action: 'confirm-refund',
      id: item[0]
    });
  }

  const button = event.target.closest('button, [data-action]');
  if (!button) return;
  const action = button.dataset.action;

  if (action === 'confirm-purchase') {
    closeModal();
    const item = findExperience(button.dataset.id);
    if (item) buy(item);
    return;
  }
  if (action === 'confirm-refund') {
    closeModal();
    const item = findExperience(button.dataset.id);
    if (item) refund(item);
    return;
  }
  if (ACTIONS[action]) ACTIONS[action]();
});

// 모달 바깥 클릭·ESC로 닫기
app.addEventListener('click', (event) => {
  if (event.target.classList.contains('modal-backdrop')) closeModal();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeModal();
});

render();
