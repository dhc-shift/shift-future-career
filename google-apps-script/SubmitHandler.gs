/**
 * SHIFT 미래이력서 — 제출 처리 스크립트
 *
 * 하는 일
 *  1) 웹에서 보낸 제출 내용을 구글 시트에 한 줄 기록
 *  2) 양식 문서를 복사해 내용을 채우고 PDF로 변환
 *  3) 제출자 본인과 동아리 메일로 PDF 발송
 *
 * 설치 방법
 *  1. 아래 시트를 열고 확장 프로그램 → Apps Script
 *  2. 이 파일 내용을 전부 붙여넣기
 *  3. 배포 → 새 배포 → 유형: 웹 앱
 *     - 실행 계정: 나 (동아리 계정)
 *     - 액세스 권한: 모든 사용자
 *  4. 나오는 웹 앱 URL을 app-runtime.js의 SUBMIT_ENDPOINT에 넣기
 *  5. 처음 실행 시 권한 승인 화면이 뜨면 허용
 */

const SHEET_ID = '1lRvJ5BlqB5P08_62RSQVETEj6iQYza3i9nFnzAIFcP4';
const TEMPLATE_DOC_ID = '1N4eZRj_wdG1r6AteYpezUHXw-3WTQJslah2bLu-uS2A';
const CLUB_EMAIL = 'shiftysdh@gmail.com';
const PDF_FOLDER_ID = ''; // 보관 폴더를 쓰려면 폴더 ID 입력. 비우면 저장하지 않음
const SCHOOL = '연세대학교 디지털헬스케어학부';
const CLOSING_NOTE = '이 문서는 SHIFT 미래이력서 프로그램으로 작성된 가상의 지원서입니다.';

const HEADERS = [
  '제출일시', '이름', '학번', '이메일', '지원유형', '지원직무', '지원기업',
  '선택한 경험', '역량', 'SHIFT 보너스', '남은 코인', '문항 수',
  'Q1 문항', 'Q1 답변', 'Q2 문항', 'Q2 답변', 'Q3 문항', 'Q3 답변',
  'Q4 문항', 'Q4 답변', 'Q5 문항', 'Q5 답변', 'PDF 링크'
];

/* ------------------------------------------------------------------ */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const clean = validate(data);
    const pdf = buildPdf(clean);
    sendMails(clean, pdf.blob);
    appendRow(clean, pdf.url);
    return json({ ok: true });
  } catch (error) {
    console.error(error);
    return json({ ok: false, message: String(error && error.message ? error.message : error) });
  }
}

function doGet() {
  return json({ ok: true, message: 'SHIFT 미래이력서 제출 서버입니다.' });
}

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

/* 입력 검증 — 잘못된 값이나 지나치게 긴 값은 여기서 걸러낸다 */
function validate(data) {
  const text = (value, max) => String(value == null ? '' : value).slice(0, max).trim();
  const name = text(data.name, 40);
  const studentId = text(data.studentId, 20);
  const email = text(data.email, 120);

  if (name.length < 2) throw new Error('이름이 올바르지 않습니다.');
  if (!/^\d{6,10}$/.test(studentId)) throw new Error('학번이 올바르지 않습니다.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('이메일이 올바르지 않습니다.');

  const questions = (Array.isArray(data.questions) ? data.questions : []).slice(0, 5).map(function (item) {
    return { question: text(item.question, 300), answer: text(item.answer, 3000) || '미작성' };
  });

  return {
    name: name,
    studentId: studentId,
    email: email,
    companyType: text(data.companyType, 30) || '미입력',
    job: text(data.job, 80) || '미입력',
    organization: text(data.organization, 80) || '미입력',
    experiences: (Array.isArray(data.experiences) ? data.experiences : []).slice(0, 40).map(function (v) { return text(v, 60); }),
    skills: (Array.isArray(data.skills) ? data.skills : []).slice(0, 20).map(function (v) { return text(v, 60); }),
    gift: text(data.gift, 60),
    coins: Number(data.coins) || 0,
    questions: questions
  };
}

/* ------------------------------------------------------------------ *
 * PDF 생성
 * ------------------------------------------------------------------ */

function buildPdf(data) {
  const fileName = '[미래이력서] ' + data.studentId + '_' + data.name;
  const copy = DriveApp.getFileById(TEMPLATE_DOC_ID).makeCopy(fileName + ' (임시)');
  const doc = DocumentApp.openById(copy.getId());
  const body = doc.getBody();

  const simple = {
    '이름': data.name,
    '학번': data.studentId,
    '이메일': data.email,
    '제출일': formatDate(new Date()),
    '지원유형': data.companyType,
    '지원직무': data.job,
    '지원기업': data.organization,
    '학교': SCHOOL,
    '졸업예정': graduationDate(data.studentId),
    '안내문구': CLOSING_NOTE
  };
  Object.keys(simple).forEach(function (key) {
    body.replaceText('\\{\\{' + key + '\\}\\}', simple[key]);
  });

  fillList(body, '경험목록', data.experiences.length ? data.experiences : ['없음']);
  fillList(body, '역량목록', data.skills.length ? data.skills : ['없음']);
  fillEssay(body, data.questions);

  doc.saveAndClose();

  const blob = DriveApp.getFileById(copy.getId()).getAs(MimeType.PDF).setName(fileName + '.pdf');
  let url = '';
  if (PDF_FOLDER_ID) {
    url = DriveApp.getFolderById(PDF_FOLDER_ID).createFile(blob).getUrl();
  }
  DriveApp.getFileById(copy.getId()).setTrashed(true); // 임시 문서 정리
  return { blob: blob, url: url };
}

/**
 * {{token}} 이 들어 있는 줄을 찾아, 줄 수만큼 복제해 채운다.
 * 일반 문단과 글머리 기호 목록(LIST_ITEM)을 모두 지원하며,
 * 원래 줄의 서식(글머리 기호·굵기·정렬)을 그대로 물려받는다. 표 안에서도 동작한다.
 */
function fillList(body, token, lines) {
  const found = body.findText('\\{\\{' + token + '\\}\\}');
  if (!found) return;
  const block = blockOf(found.getElement());
  if (!block) return;
  const parent = block.getParent();
  const index = parent.getChildIndex(block);

  lines.forEach(function (line, i) {
    insertBlock(parent, index + i, cloneWithText(block, line));
  });
  removeBlock(parent, block);
}

/**
 * 자기소개서 영역.
 * 양식에 {{문항}} / {{답변}} 두 줄이 있으면 그 두 줄을 한 묶음으로 복제하고,
 * {{자기소개서}} 한 줄만 있으면 문항과 답변을 이어서 채운다.
 */
function fillEssay(body, questions) {
  const pairAnchor = body.findText('\\{\\{문항\\}\\}');
  if (pairAnchor) {
    const questionBlock = blockOf(pairAnchor.getElement());
    const answerFound = body.findText('\\{\\{답변\\}\\}');
    if (!questionBlock || !answerFound) return;
    const answerBlock = blockOf(answerFound.getElement());
    const parent = questionBlock.getParent();
    let index = parent.getChildIndex(questionBlock);

    questions.forEach(function (item, i) {
      insertBlock(parent, index++, cloneWithText(questionBlock, 'Q' + (i + 1) + '. ' + item.question));
      insertBlock(parent, index++, cloneWithText(answerBlock, item.answer));
    });
    removeBlock(parent, questionBlock);
    removeBlock(answerBlock.getParent(), answerBlock);
    return;
  }

  const lines = [];
  questions.forEach(function (item, i) {
    lines.push('Q' + (i + 1) + '. ' + item.question);
    lines.push(item.answer);
    if (i < questions.length - 1) lines.push('');
  });
  fillList(body, '자기소개서', lines.length ? lines : ['작성한 내용이 없습니다.']);
}

/* 찾은 글자에서 위로 올라가며 문단 또는 목록 항목을 찾는다 */
function blockOf(element) {
  let node = element;
  while (node) {
    const type = node.getType();
    if (type === DocumentApp.ElementType.PARAGRAPH) return node.asParagraph();
    if (type === DocumentApp.ElementType.LIST_ITEM) return node.asListItem();
    node = node.getParent();
  }
  return null;
}

function cloneWithText(block, text) {
  const clone = block.copy();
  clone.clear();
  // 빈 문자열을 넣으면 구글 문서가 오류를 내므로, 빈 줄은 비운 상태로 둔다
  if (text) clone.appendText(text);
  return clone;
}

function insertBlock(parent, index, block) {
  if (block.getType() === DocumentApp.ElementType.LIST_ITEM) {
    parent.insertListItem(index, block.asListItem());
  } else {
    parent.insertParagraph(index, block.asParagraph());
  }
}

/* 줄 삭제 — 표 칸에 줄이 하나뿐이면 삭제 대신 비운다 (구글 문서 제약) */
function removeBlock(parent, block) {
  try {
    parent.removeChild(block);
  } catch (error) {
    block.clear();
  }
}

/* ------------------------------------------------------------------ *
 * 메일
 * ------------------------------------------------------------------ */

function sendMails(data, pdfBlob) {
  const subject = '[SHIFT 미래이력서] ' + data.name + '님의 미래 지원서';
  const bodyForApplicant =
    data.name + '님, 미래이력서 작성을 완료하셨습니다.\n\n' +
    '작성하신 내용을 PDF로 첨부해 드립니다.\n' +
    '지원 ' + data.organization + ' · ' + data.job + '\n\n' +
    '오늘 고른 경험 중 실제로 해보고 싶은 것이 있다면, 이번 학기에 할 수 있는 일부터 시작해보세요.\n\n— SHIFT';

  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    body: bodyForApplicant,
    name: 'SHIFT',
    attachments: [pdfBlob]
  });

  MailApp.sendEmail({
    to: CLUB_EMAIL,
    subject: '[제출] ' + data.studentId + ' ' + data.name + ' / ' + data.job,
    body: [
      '이름: ' + data.name,
      '학번: ' + data.studentId,
      '이메일: ' + data.email,
      '지원: ' + data.organization + ' · ' + data.job + ' (' + data.companyType + ')',
      '선택한 경험: ' + (data.experiences.join(', ') || '없음'),
      'SHIFT 보너스: ' + (data.gift || '없음')
    ].join('\n'),
    name: 'SHIFT 미래이력서',
    attachments: [pdfBlob]
  });
}

/* ------------------------------------------------------------------ *
 * 시트 기록
 * ------------------------------------------------------------------ */

function appendRow(data, pdfUrl) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }

  const row = [
    formatDate(new Date()),
    data.name,
    data.studentId,
    data.email,
    data.companyType,
    data.job,
    data.organization,
    data.experiences.join(', '),
    data.skills.join(', ') || '없음',
    data.gift || '없음',
    data.coins,
    data.questions.length
  ];
  for (let i = 0; i < 5; i++) {
    const item = data.questions[i];
    row.push(item ? item.question : '');
    row.push(item ? item.answer : '');
  }
  row.push(pdfUrl);
  sheet.appendRow(row);
}

/* ------------------------------------------------------------------ *
 * 보조
 * ------------------------------------------------------------------ */

function formatDate(date) {
  return Utilities.formatDate(date, 'Asia/Seoul', 'yyyy-MM-dd HH:mm');
}

/* 학번 앞 두 자리를 입학연도로 보고 4년 뒤 2월을 졸업 예정으로 계산 */
function graduationDate(studentId) {
  const entered = 2000 + Number(String(studentId).slice(0, 2));
  if (!entered || isNaN(entered)) return '미상';
  return (entered + 4) + '.02 (예정)';
}

/* 설치 후 이 함수를 한 번 실행하면 권한 승인과 동작 확인을 함께 할 수 있다 */
function testSubmit() {
  const sample = {
    postData: {
      contents: JSON.stringify({
        name: '테스트',
        studentId: '22012345',
        email: CLUB_EMAIL,
        companyType: '사기업',
        job: 'AI / Machine Learning',
        organization: '테스트기업',
        experiences: ['기업 인턴', '공모전 참여'],
        skills: ['코딩 프로젝트'],
        gift: 'SHIFT 운영진 경험',
        coins: 12,
        questions: [{ question: '테스트 문항입니다.', answer: '테스트 답변입니다.' }]
      })
    }
  };
  Logger.log(doPost(sample).getContent());
}
