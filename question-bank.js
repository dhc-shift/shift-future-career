export const JOBS = [
  { id: 'publicHealth', label: '보건·의료 행정', public: true },
  { id: 'publicPlanning', label: '공공 의료·보건 사업기획', public: true },
  { id: 'data', label: 'Healthcare Data Analyst', public: true },
  { id: 'clinical', label: 'Clinical / 임상', public: true },
  { id: 'research', label: '바이오·헬스케어 연구직', public: true },
  { id: 'ai', label: 'AI / Machine Learning', public: false },
  { id: 'software', label: 'Software Developer', public: false },
  { id: 'medicalDevice', label: '의료기기 R&D', public: false },
  { id: 'ux', label: 'UX / UI', public: false },
  { id: 'servicePlanner', label: 'Healthcare Service Planner', public: false },
  { id: 'pm', label: 'Product Manager', public: false },
  { id: 'qa', label: '의료기기 품질 / QA', public: false },
  { id: 'ra', label: '의료기기 인허가 / RA', public: false },
  { id: 'marketing', label: 'Healthcare Marketing', public: false },
  { id: 'sales', label: 'Healthcare Sales', public: false }
];

const base = (id, question, companyType, jobCategories, competency, slot, writingGuide, random = false) => ({ id, question, companyType, jobCategories, competency, slot, writingGuide, random });

export const QUESTION_BANK = [
  base('private-motivation', '많은 기업 중 해당 기업을 선택한 이유와 지원 직무를 선택하게 된 계기를 구체적으로 작성해주세요.', ['private'], ['all'], 'motivation', 'private-motivation', '기업/기관 관심 계기 → 직무 선택 이유 → 내가 기여할 부분'),
  base('private-competency', '지원 직무를 수행하는 데 가장 중요하다고 생각하는 역량은 무엇이며, 이를 갖추기 위해 어떤 경험과 노력을 해왔는지 작성해주세요.', ['private'], ['all'], 'technical', 'private-competency', '필요 역량 → 준비 과정 → 활용 경험 → 입사 후 활용'),
  base('private-goal', '입사 후 해당 직무에서 어떤 전문가로 성장하고 싶은지, 이를 위해 어떤 역량을 발전시키고 싶은지 작성해주세요.', ['private'], ['all'], 'growth', 'private-goal', '현재 강점 → 성장 방향 → 실행 계획 → 기여'),
  base('public-duty', '지원 직무에 필요한 지식과 기술을 습득하기 위해 노력했던 경험을 기술하고, 입사 후 해당 역량을 어떻게 발휘할 수 있을지 구체적으로 기술하여 주십시오.', ['public'], ['all'], 'technical', 'public-duty', '필요 역량 → 준비 과정 → 활용 경험 → 입사 후 활용'),
  base('public-ncs', '제한된 시간이나 자원 속에서 문제를 해결해야 했던 경험을 상황, 본인의 행동 및 결과를 중심으로 기술하여 주십시오.', ['public'], ['all'], 'problemSolving', 'public-ncs', '상황 → 문제의 제약 → 내가 취한 행동 → 결과'),
  base('public-role', '지원 기관의 주요 사업 중 관심 있는 분야를 하나 선택하고, 해당 사업이 국민 또는 사회에 제공하는 가치와 본인이 기여할 수 있는 부분을 기술하여 주십시오.', ['public'], ['all'], 'publicValue', 'public-role', '관심 사업 → 사회적 가치 → 나의 역할 → 실행 방향'),
  base('collaboration', '서로 다른 생각을 가진 사람들과 협업하여 공동의 목표를 달성했던 경험과 그 과정에서 본인이 맡은 역할을 작성해주세요.', ['both'], ['all'], 'collaboration', 'experience', '상황 → 역할과 행동 → 결과 → 배운 점', true),
  base('conflict', '팀 구성원과 의견이 충돌했던 경험을 설명하고, 상대방을 설득하거나 합의점을 찾기 위해 어떤 행동을 했는지 작성해주세요.', ['both'], ['all'], 'communication', 'experience', '상황 → 갈등의 원인 → 소통 행동 → 결과', true),
  base('failure', '목표 달성에 실패했던 경험과 그 실패를 통해 무엇을 배웠으며 이후 행동이 어떻게 달라졌는지 작성해주세요.', ['both'], ['all'], 'challenge', 'experience', '목표 → 시도와 결과 → 배운 점 → 이후 변화', true),
  base('data-private', '복잡하거나 많은 데이터를 활용하여 의미 있는 정보를 도출했던 경험을 작성하고, 분석 과정에서 어떤 기준으로 데이터를 해석했는지 설명해주세요.', ['private'], ['data'], 'analysis', 'job', '문제와 데이터 → 해석 기준 → 분석 행동 → 인사이트'),
  base('data-public', '공공 또는 의료 데이터를 활용하여 국민에게 도움이 되는 서비스를 만든다면 어떤 문제를 해결하고 싶은지, 데이터 활용 과정에서 고려해야 할 사항과 함께 기술하여 주십시오.', ['public'], ['data'], 'publicValue', 'job', '해결할 문제 → 데이터 활용 → 개인정보·편향 고려 → 기대 가치'),
  base('ai', 'AI 또는 머신러닝 기술을 활용하여 해결해보고 싶은 디지털헬스케어 문제와 해당 문제에 AI가 적합하다고 생각하는 이유를 작성해주세요.', ['both'], ['ai'], 'technical', 'job', '문제 정의 → AI 적합성 → 고려할 한계 → 기대 결과'),
  base('software', '개발 과정에서 예상하지 못한 오류나 기술적 문제를 해결했던 경험과 문제의 원인을 찾기 위해 어떤 과정을 거쳤는지 작성해주세요.', ['both'], ['software'], 'problemSolving', 'job', '오류 상황 → 원인 탐색 → 해결 과정 → 재발 방지'),
  base('medical-device', '의료기기 또는 헬스케어 기술을 개발할 때 가장 중요하게 고려해야 한다고 생각하는 요소와 그 이유를 작성해주세요.', ['both'], ['medicalDevice'], 'technical', 'job', '사용자와 위험 → 판단 기준 → 고려 과정 → 기대 효과'),
  base('clinical', '환자 안전과 새로운 기술의 도입 사이에서 고려해야 할 요소는 무엇이라고 생각하는지 작성해주세요.', ['both'], ['clinical'], 'ethics', 'job', '상황의 긴장 → 우선 기준 → 이해관계자 고려 → 실행'),
  base('ux', '고령자 또는 디지털 기기에 익숙하지 않은 사용자를 위한 헬스케어 서비스를 설계한다면 가장 중요하게 고려할 요소와 그 이유를 작성해주세요.', ['both'], ['ux'], 'userFocus', 'job', '사용자 맥락 → 문제 → 설계 기준 → 검증'),
  base('planner', '사용자의 문제를 발견하고 이를 새로운 서비스 또는 기능으로 해결해본 경험을 작성해주세요.', ['both'], ['servicePlanner', 'pm'], 'problemSolving', 'job', '사용자 문제 → 발견 과정 → 해결안 → 결과'),
  base('qa', '작은 오류라도 사용자 안전에 영향을 미칠 수 있는 상황에서 문제를 발견했다면 어떻게 대응할 것인지 작성해주세요.', ['both'], ['qa'], 'ethics', 'job', '위험 판단 → 즉시 조치 → 공유와 기록 → 재발 방지'),
  base('ra', '새로운 의료기술의 빠른 시장 출시와 안전성을 위한 규제 준수가 충돌할 경우 어떤 기준으로 판단해야 한다고 생각하는지 작성해주세요.', ['both'], ['ra'], 'ethics', 'job', '이해관계 → 판단 기준 → 소통 → 실행'),
  base('marketing', '복잡한 의료·헬스케어 정보를 일반 소비자가 이해하기 쉽게 전달해야 한다면 어떤 방식으로 접근할 것인지 작성해주세요.', ['both'], ['marketing'], 'communication', 'job', '대상 이해 → 핵심 메시지 → 전달 방식 → 확인'),
  base('sales', '상대방의 요구를 파악하고 이를 바탕으로 설득하거나 제안을 성공적으로 이끌어낸 경험을 작성해주세요.', ['both'], ['sales'], 'communication', 'job', '요구 파악 → 제안 → 설득 행동 → 결과'),
  base('research', '연구 또는 프로젝트 과정에서 예상했던 결과와 다른 결과가 나왔던 경험과, 원인을 확인하기 위해 어떤 방식으로 접근했는지 작성해주세요.', ['both'], ['research'], 'analysis', 'job', '가설 → 관찰 결과 → 원인 탐색 → 배운 점'),
  base('public-health', '보건의료 서비스를 이용하는 국민의 입장에서 불편하거나 개선이 필요하다고 생각했던 문제를 하나 선정하고, 이를 해결하기 위한 방안을 기술하여 주십시오.', ['public'], ['publicHealth', 'publicPlanning'], 'publicValue', 'job', '문제 상황 → 원인 → 개선 방안 → 기대 효과'),
  base('public-budget', '한정된 예산과 인력으로 여러 보건의료 사업 중 우선순위를 결정해야 한다면 어떤 기준을 활용할 것인지 기술하여 주십시오.', ['public'], ['publicHealth', 'publicPlanning'], 'judgement', 'job', '목표 → 판단 기준 → 우선순위 → 책임 있는 실행'),
  base('public-ethics', '원칙이나 기준을 지키는 것이 개인적으로 불리하거나 어려운 상황에서도 이를 준수했던 경험과 그 이유를 기술하여 주십시오.', ['public'], ['all'], 'ethics', 'public-ethics', '상황 → 원칙과 판단 → 행동 → 조직에 미친 영향')
];

export const CAREER_EXPERIENCES = ['학부연구생', '기업 인턴', '공모전 우수상', '학생회 국장', '헬스케어 데이터 프로젝트', 'SHIFT 프로그램 기획 경험'];

export function buildQuestions(companyType, jobId) {
  const matches = (question) => (question.companyType.includes(companyType) || question.companyType.includes('both')) && (question.jobCategories.includes('all') || question.jobCategories.includes(jobId));
  const take = (slot, used = []) => QUESTION_BANK.find((question) => matches(question) && question.slot === slot && !used.includes(question.competency));
  const selected = [];
  const add = (question) => { if (question && !selected.some((item) => item.id === question.id)) selected.push(question); };
  if (companyType === 'private') { add(take('private-motivation')); add(take('private-competency', selected.map((item) => item.competency))); }
  else { add(take('public-duty')); add(take('public-ncs', selected.map((item) => item.competency))); }
  add(take('job', selected.map((item) => item.competency)));
  add(take('experience', selected.map((item) => item.competency)));
  add(companyType === 'private' ? take('private-goal', selected.map((item) => item.competency)) : (take('public-role', selected.map((item) => item.competency)) || take('public-ethics', selected.map((item) => item.competency))));
  return selected.slice(0, 5);
}
