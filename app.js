history.scrollRestoration = 'manual';
let _suppressHistoryPush = false;

if (new URLSearchParams(location.search).has('reset-intro')) {
  try { localStorage.removeItem('introVideoSeen'); } catch {}
}

// ── 개발자 모드 (GA 추적 비활성화) ───────────────────────────────────────
// 본인 기기에서 콘솔에 한 번만 실행: localStorage.setItem('devMode', 'true')
// 로컬/프리뷰 환경(localhost·사설 IP·file://)은 hostname 기반으로 자동 차단됨.
function isLocalEnv() {
  var h = location.hostname;
  if (!h) return true;
  if (location.protocol === 'file:') return true;
  if (h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0' || h === '::1') return true;
  if (h.endsWith('.local')) return true;
  if (/^192\.168\./.test(h)) return true;
  if (/^10\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  return false;
}
function isGaSuppressed() {
  var until = Number(localStorage.getItem('gaSuppressedUntil') || '0');
  if (localStorage.getItem('devMode') === 'true') return true;
  if (Date.now() < until) return true;
  if (isLocalEnv()) return true;
  return false;
}
if (isGaSuppressed()) {
  window['ga-disable-G-LKQZX5YS2H'] = true;
}

function trackMenuClick(menuName) {
  if (typeof gtag === "function") {
    gtag("event", "menu_click", { menu_name: menuName });
  }
}

// ── 패치노트 설정 (여기만 수정하면 됩니다) ──────────────────────────────
const PATCH_NOTES = {
  version: "v1.0.2",
  date: "2026-05-31",
  items: [
    { type: "notice",  text: "이 사이트는 법적기준이 아닙니다. 참고만해주세요!" },
    { type: "new",     text: "① 소방시설 탐색기 '판매시설, 공동주택'<br>&nbsp;&nbsp;&nbsp;&nbsp;용도 추가<br>② 법정기한계산기 공휴일 자동반영<br>③ 참고법령 안내 기능 추가<br>④ 안내 펫 일구 기능 추가 <br>⑤ 계절테마 추가<br>&nbsp;&nbsp;&nbsp;(눈 아프면 우측 위 테마변경버튼 누르세요)" },
    { type: "improve", text: "메인화면 메뉴 배치 및 이름, UI 변경 등" },
    { type: "fix",     text: "유틸리티 도구함 숫자입력 버그 수정" },
  ],
};
// ────────────────────────────────────────────────────────────────────────

const statusMeta = {
  required: { label: "설치 필요", className: "status-required" },
  review: { label: "검토 필요", className: "status-review" },
  notRequired: { label: "해당 없음", className: "status-not-required" },
};

const categories = {
  extinguishing: "소화설비",
  alarm: "경보설비",
  evacuation: "피난구조설비",
  waterSupply: "소화용수설비",
  fireSupport: "소화활동설비",
};

const steps = [
  {
    key: "isThirdClassNeighborhood",
    title: "3급 근린생활시설인가요?",
    help: "관계인이 자체점검을 직접 작성해서 오는 대상인지 먼저 확인합니다.",
    type: "choice",
    options: [
      { value: "yes", label: "예", description: "3급 근린생활시설 기준으로 계속 진행" },
      { value: "no", label: "아니오", description: "용도 선택 화면으로 이동" },
    ],
  },
  {
    key: "permitBefore1992",
    title: "건축허가일이 1992년 7월 28일 이전인가요?",
    help: "(건축물 대장을 확인해주세요.)",
    type: "choice",
    options: [
      { value: "yes", label: "예", description: "1992년 7월 28일 이전에 건축허가" },
      { value: "no", label: "아니오", description: "1992년 7월 28일 이후에 건축허가" },
    ],
  },
  {
    key: "pre1992PermitRange",
    title: "건축허가일 구간을 선택해주세요.",
    help: "건축물 대장상의 건축허가일에 맞는 기간을 선택하세요.",
    type: "choice",
    options: [
      { value: "1982-08-07_to_1984-06-30", label: "1982년 8월 7일 ~ 1984년 6월 30일", description: "해당 기간에 건축허가" },
      { value: "1984-06-30_to_1990-06-29", label: "1984년 6월 30일 ~ 1990년 6월 29일", description: "해당 기간에 건축허가" },
      { value: "1990-06-29_to_1990-12-01", label: "1990년 6월 29일 ~ 1990년 12월 1일", description: "해당 기간에 건축허가" },
      { value: "1990-12-01_to_1991-01-08", label: "1990년 12월 1일 ~ 1992년 7월 28일", description: "해당 기간에 건축허가" },
    ],
  },
  {
    key: "thirdClassDetailUse",
    title: "세부용도는 무엇인가요?",
    help: "붙임파일 기준에 맞춰 세부용도를 선택해주세요.",
    type: "choice",
    options: [
      { value: "general", label: "일반근린생활시설", description: "일반근린생활시설 기준 적용" },
      { value: "marketBathhouse", label: "시장 또는 공중목욕장", description: "시장·공중목욕장 기준 적용" },
    ],
  },
  {
    key: "occupancyType",
    title: "어떤 용도를 탐색할까요?",
    help: "용도를 선택하면 해당 소방시설 기준을 안내합니다.",
    type: "choice",
    options: [
      { value: "neighborhood", label: "근린생활시설", description: "일반 상가·사무실·식당 등" },
      { value: "lodging", label: "숙박시설", description: "호텔·모텔·여관 등" },
      { value: "elderly", label: "노유자시설", description: "요양원·복지관·아동센터 등" },
      { value: "medical", label: "의료시설", description: "병원·요양병원·정신의료기관 등" },
    ],
  },
  {
    key: "facilitySubtype",
    title: "어떤 근린생활시설인가요?",
    help: "세부 유형에 따라 설치 기준이 달라집니다.",
    type: "choice",
    onlyFor: "neighborhood",
    options: [
      { value: "general", label: "일반 근린생활시설", description: "일반 상가, 사무형 근린생활시설" },
      { value: "bathhouse", label: "목욕장", description: "목욕장 기준 별도 적용" },
      { value: "clinicInpatient", label: "입원실 있는 의원", description: "의원·치과의원·한의원" },
      { value: "postpartum", label: "조산원·산후조리원", description: "면적 기준에 따라 설치 설비 판정" },
    ],
  },
  {
    key: "postpartumAreaRange",
    title: "바닥면적이 600㎡ 미만인가요, 이상인가요?",
    help: "조산원·산후조리원을 선택한 경우에만 확인합니다.",
    type: "choice",
    onlyFor: "neighborhood",
    options: [
      { value: "under600", label: "600㎡ 미만", description: "간이스프링클러설비, 자동화재탐지설비, 자동화재속보설비 대상" },
      { value: "600plus", label: "600㎡ 이상", description: "스프링클러설비, 자동화재탐지설비, 자동화재속보설비 대상" },
    ],
  },
  { key: "totalArea", title: "건물 연면적은 얼마인가요?", help: "㎡ 단위로 입력하세요.", type: "number", onlyFor: "neighborhood", min: 0, step: 0.1, placeholder: "예: 1600" },
  { key: "neighborhoodArea", title: "근린생활시설 사용부분 바닥면적 합계는 얼마인가요?", help: "간이스프링클러설비 판단에 사용됩니다.", type: "number", onlyFor: "neighborhood", min: 0, step: 0.1, placeholder: "예: 1200" },
  { key: "aboveGroundFloors", title: "지상층수는 몇 층인가요?", help: "지하층을 제외한 지상층수를 입력해 주세요.", type: "number", onlyFor: "neighborhood", min: 0, step: 1, placeholder: "예: 6" },
  { key: "basementFloors", title: "지하층 정보를 입력해 주세요.", help: "지하층이 없으면 0을 입력하세요.", type: "compound", onlyFor: "neighborhood" },
  { key: "hasWindowlessFloor", title: "무창층 정보를 입력해 주세요.", help: "무창층이란 채광·환기 조건 등을 충족하지 못하는 층입니다.", type: "compound", onlyFor: "neighborhood" },
  {
    key: "hasLargeTargetFloor",
    title: "지하층, 무창층, 또는 4층 이상 층 중 300㎡ 이상인 층이 있나요?",
    help: "연면적만으로 옥내소화전설비가 결정되지 않을 때만 묻습니다.",
    type: "choice",
    onlyFor: "neighborhood",
    options: [
      { value: "yes", label: "있음", description: "해당 층이 하나라도 있으면 선택" },
      { value: "no", label: "없음", description: "조건에 맞는 층이 없으면 선택" },
    ],
  },
  { key: "firstSecondFloorArea", title: "지상 1층과 2층의 바닥면적 합계는 얼마인가요?", help: "연면적이 9,000㎡ 이상일 때만 묻습니다.", type: "number", onlyFor: "neighborhood", min: 0, step: 0.1, placeholder: "예: 9200" },
  { key: "detailSet", title: "추가 조건을 입력해 주세요.", help: "주차 관련 공간과 전기실·발전실·변전실·전산실이 없으면 0으로 입력해 주세요.", type: "compound", onlyFor: "neighborhood" },
  {
    key: "has24HourStaff",
    title: "24시간 상주 근무자가 있나요?",
    help: "자동화재속보설비 면제 검토가 필요한 경우에만 묻습니다.",
    type: "choice",
    onlyFor: "neighborhood",
    options: [
      { value: "yes", label: "있음", description: "24시간 근무자가 상주함" },
      { value: "no", label: "없음", description: "24시간 상주 근무자가 없음" },
    ],
  },
  // ── 숙박시설 전용 스텝 ──
  {
    key: "lodgingIsTouristHotel",
    title: "어떤 숙박시설인가요?",
    help: "관광호텔이고 지하층을 포함한 층수가 7층 이상이면 인명구조기구(방열복·공기호흡기 등)를 설치해야 합니다.",
    type: "choice",
    onlyFor: "lodging",
    options: [
      { value: "no", label: "일반 숙박시설", description: "모텔·여관·펜션 등 관광호텔이 아닌 숙박시설" },
      { value: "yes", label: "관광호텔", description: "관광진흥법에 따른 관광호텔업 등록 시설" },
    ],
  },
  { key: "lodgingTotalArea", title: "건물 연면적은 얼마인가요?", help: "㎡ 단위로 입력하세요.", type: "number", onlyFor: "lodging", min: 0, step: 0.1, placeholder: "예: 2000" },
  { key: "lodgingArea", title: "숙박시설로 사용되는 바닥면적 합계는 얼마인가요?", help: "간이스프링클러·스프링클러 판단에 사용됩니다. 건물 전체를 해당 용도로 쓰는 경우에는 연면적과 동일하게 입력해주세요.", type: "number", onlyFor: "lodging", min: 0, step: 0.1, placeholder: "예: 450" },
  { key: "lodgingAboveGroundFloors", title: "지상층수는 몇 층인가요?", help: "지하층을 제외한 지상층수를 입력해 주세요.", type: "number", onlyFor: "lodging", min: 0, step: 1, placeholder: "예: 8" },
  { key: "lodgingBasementFloors", title: "지하층 정보를 입력해 주세요.", help: "지하층이 없으면 0을 입력하세요.", type: "compound", onlyFor: "lodging" },
  { key: "lodgingHasWindowlessFloor", title: "무창층 정보를 입력해 주세요.", help: "무창층이란 채광·환기 조건 등을 충족하지 못하는 층입니다.", type: "compound", onlyFor: "lodging" },
  {
    key: "lodgingHasLargeFloorFor1000",
    title: "지하층, 무창층 또는 4층 이상 층 중 바닥면적 1,000㎡ 이상인 층이 있나요?",
    help: "스프링클러설비(해당층) 설치 조건입니다.",
    type: "choice",
    onlyFor: "lodging",
    options: [
      { value: "yes", label: "있음", description: "해당 조건의 층이 하나라도 있으면 선택" },
      { value: "no", label: "없음", description: "조건에 맞는 층이 없으면 선택" },
    ],
  },
  {
    key: "lodgingHasGasFacility",
    title: "가스시설이 설치돼 있나요?",
    help: "가스누설경보기 설치 여부를 판단합니다.",
    type: "choice",
    onlyFor: "lodging",
    options: [
      { value: "yes", label: "있음", description: "가스시설이 설치돼 있음" },
      { value: "no", label: "없음", description: "가스시설이 없음" },
    ],
  },
  { key: "lodgingFirstSecondFloorArea", title: "지상 1층과 2층의 바닥면적 합계는 얼마인가요?", help: "연면적이 9,000㎡ 이상일 때만 묻습니다.", type: "number", onlyFor: "lodging", min: 0, step: 0.1, placeholder: "예: 9200" },
  { key: "lodgingDetailSet", title: "주차·전기실 추가 조건을 입력해 주세요.", help: "해당 공간이 없으면 0으로 입력해 주세요.", type: "compound", onlyFor: "lodging" },
  {
    key: "lodgingHasMultiuseBusiness",
    title: "다중이용업소가 있나요?",
    help: "다중이용업소가 있으면 설치해야 하는 안전시설을 별도로 표시합니다.",
    type: "choice",
    onlyFor: "lodging",
    options: [
      { value: "yes", label: "예", description: "다중이용업소 추가 설치시설까지 확인" },
      { value: "no", label: "아니오", description: "기존 숙박시설 결과만 표시" },
    ],
  },
  {
    key: "lodgingMultiuseSimpleSprinklerCheck",
    title: "간이스프링클러설비 설치 대상인지 확인합니다.",
    help: "해당되는 항목은 중복 선택할 수 있습니다.",
    type: "compound",
    onlyFor: "lodging",
  },
  {
    key: "lodgingMultiuseOnSecondToTenthFloor",
    title: "다중이용업소가 2층~10층 사이에 설치돼있나요?",
    help: "맞다면 피난기구를 설치해야 합니다.",
    type: "choice",
    onlyFor: "lodging",
    options: [
      { value: "yes", label: "예", description: "2층부터 10층 사이에 설치돼 있음" },
      { value: "no", label: "아니오", description: "해당 층 범위가 아님" },
    ],
  },
  {
    key: "lodgingMultiuseOnGroundOrRefugeFloor",
    title: "지상 1층이나 피난층에 설치돼있나요?",
    help: "산후조리업이나 고시원에 해당할 때만 확인합니다.",
    type: "choice",
    onlyFor: "lodging",
    options: [
      { value: "yes", label: "예", description: "지상 1층 또는 피난층에 설치돼 있음" },
      { value: "no", label: "아니오", description: "지상 1층 또는 피난층이 아님" },
    ],
  },
  {
    key: "lodgingMultiuseUsesAV",
    title: "'노래반주기 등 영상음향장치를 사용하는 영업장'인가요?",
    help: "맞다면 자동화재탐지설비와 영상음향차단장치를 설치해야 합니다.",
    type: "choice",
    onlyFor: "lodging",
    options: [
      { value: "yes", label: "예", description: "영상음향장치를 사용함" },
      { value: "no", label: "아니오", description: "영상음향장치를 사용하지 않음" },
    ],
  },
  {
    key: "lodgingMultiuseHasGasFacility",
    title: "다중이용업소에 가스시설을 사용하는 주방이나 난방시설이 있나요?",
    help: "맞다면 가스누설경보기를 설치해야 합니다.",
    type: "choice",
    onlyFor: "lodging",
    options: [
      { value: "yes", label: "예", description: "가스시설을 사용함" },
      { value: "no", label: "아니오", description: "가스시설을 사용하지 않음" },
    ],
  },
  {
    key: "lodgingMultiuseHasRooms",
    title: "영업장 내부에 구획된 실(室)이 있나요?",
    help: "노래방 룸, 고시원 방 등 별도로 구획된 공간이 있는 경우입니다. 해당하면 영업장 내부 피난통로를 확보해야 합니다.",
    type: "choice",
    onlyFor: "lodging",
    options: [
      { value: "yes", label: "예", description: "구획된 룸·방 등이 있음" },
      { value: "no", label: "아니오", description: "구획된 실이 없음" },
    ],
  },
  {
    key: "lodgingMultiuseHasEvacuationRoute",
    title: "영업장 내부 피난통로 또는 복도가 있는 영업장인가요?",
    help: "맞다면 피난유도선을 설치해야 합니다.",
    type: "choice",
    onlyFor: "lodging",
    options: [
      { value: "yes", label: "예", description: "피난통로 또는 복도가 있음" },
      { value: "no", label: "아니오", description: "해당 통로가 없음" },
    ],
  },

  // ── 노유자시설 전용 스텝 ──
  {
    key: "elderlySubtype",
    title: "어떤 노유자시설인가요?",
    help: "생활시설 여부에 따라 간이스프링클러·자동화재탐지설비·자동화재속보설비 기준이 달라집니다.",
    type: "choice",
    onlyFor: "elderly",
    options: [
      { value: "general", label: "일반 노유자시설", description: "숙식을 제공하지 않는 시설 — 노인복지관, 아동센터, 노인주간보호센터 등" },
      { value: "livingFacility", label: "노유자 생활시설", description: "숙식을 함께 제공하는 시설 — 양로원, 노인요양원, 아동복지시설 등" },
    ],
  },
  { key: "elderlyTotalArea", title: "건물 연면적은 얼마인가요?", help: "㎡ 단위로 입력하세요.", type: "number", onlyFor: "elderly", min: 0, step: 0.1, placeholder: "예: 1200" },
  { key: "elderlyArea", title: "노유자시설로 사용되는 바닥면적 합계는 얼마인가요?", help: "스프링클러·간이스프링클러 판단에 사용됩니다. 건물 전체를 해당 용도로 쓰는 경우에는 연면적과 동일하게 입력해주세요.", type: "number", onlyFor: "elderly", min: 0, step: 0.1, placeholder: "예: 500" },
  { key: "elderlyAboveGroundFloors", title: "지상층수는 몇 층인가요?", help: "지하층을 제외한 지상층수를 입력해 주세요.", type: "number", onlyFor: "elderly", min: 0, step: 1, placeholder: "예: 4" },
  { key: "elderlyBasementFloors", title: "지하층 정보를 입력해 주세요.", help: "지하층이 없으면 0을 입력하세요.", type: "compound", onlyFor: "elderly" },
  { key: "elderlyHasWindowlessFloor", title: "무창층 정보를 입력해 주세요.", help: "무창층이란 채광·환기 조건 등을 충족하지 못하는 층입니다.", type: "compound", onlyFor: "elderly" },
  {
    key: "elderlyHasGrillWindow",
    title: "창살(화재 시 자동으로 열리지 않는 구조)이 설치돼 있나요?",
    help: "추락 방지 목적의 창살이 있으면, 노유자시설 사용 면적이 300㎡ 미만이어도 간이스프링클러를 설치해야 합니다.",
    type: "choice",
    onlyFor: "elderly",
    options: [
      { value: "yes", label: "있음", description: "자동 개방 구조가 아닌 창살이 설치돼 있음" },
      { value: "no", label: "없음", description: "창살이 없거나 화재 시 자동으로 열리는 구조" },
    ],
  },
  {
    key: "elderlyHasFloor500Plus",
    title: "바닥면적이 500㎡ 이상인 층이 있나요?",
    help: "일반 노유자시설의 자동화재속보설비 설치 여부를 판단합니다.",
    type: "choice",
    onlyFor: "elderly",
    options: [
      { value: "yes", label: "있음", description: "500㎡ 이상인 층이 하나라도 있음" },
      { value: "no", label: "없음", description: "모든 층이 500㎡ 미만" },
    ],
  },
  {
    key: "elderlyHas24HourStaff",
    title: "24시간 상주 근무자가 있나요?",
    help: "일반 노유자시설에서 자동화재속보설비 면제 검토 시에만 묻습니다.",
    type: "choice",
    onlyFor: "elderly",
    options: [
      { value: "yes", label: "있음", description: "24시간 근무자가 상주함" },
      { value: "no", label: "없음", description: "24시간 상주 근무자가 없음" },
    ],
  },
  {
    key: "elderlyHasGasFacility",
    title: "가스시설이 설치돼 있나요?",
    help: "가스누설경보기 설치 여부를 판단합니다.",
    type: "choice",
    onlyFor: "elderly",
    options: [
      { value: "yes", label: "있음", description: "가스시설이 설치돼 있음" },
      { value: "no", label: "없음", description: "가스시설이 없음" },
    ],
  },
  { key: "elderlyFirstSecondFloorArea", title: "지상 1층과 2층의 바닥면적 합계는 얼마인가요?", help: "연면적이 9,000㎡ 이상일 때만 묻습니다.", type: "number", onlyFor: "elderly", min: 0, step: 0.1, placeholder: "예: 9200" },
  { key: "elderlyDetailSet", title: "주차·전기실 추가 조건을 입력해 주세요.", help: "해당 공간이 없으면 0으로 입력해 주세요.", type: "compound", onlyFor: "elderly" },

  // ── 의료시설 전용 스텝 ──
  {
    key: "medicalSubtype",
    title: "어떤 의료시설인가요?",
    help: "세부 유형에 따라 스프링클러·간이스프링클러·자동화재탐지설비·자동화재속보설비 기준이 달라집니다.",
    type: "choice",
    onlyFor: "medical",
    options: [
      { value: "hospital", label: "병원·치과병원·한방병원", description: "병원, 치과병원, 한방병원" },
      { value: "generalHospital", label: "종합병원", description: "종합병원" },
      { value: "nursingHome", label: "요양병원", description: "요양병원(정신병원 제외)" },
      { value: "psychiatricHospital", label: "정신의료기관", description: "정신병원·정신건강의학과의원 등" },
      { value: "rehabilitationFacility", label: "의료재활시설", description: "장애인 의료재활시설" },
    ],
  },
  { key: "medicalTotalArea", title: "건물 연면적은 얼마인가요?", help: "㎡ 단위로 입력하세요.", type: "number", onlyFor: "medical", min: 0, step: 0.1, placeholder: "예: 2000" },
  { key: "medicalArea", title: "의료시설로 사용되는 바닥면적 합계는 얼마인가요?", help: "스프링클러·간이스프링클러·자동화재탐지설비 판단에 사용됩니다. 건물 전체를 해당 용도로 쓰는 경우에는 연면적과 동일하게 입력해주세요.", type: "number", onlyFor: "medical", min: 0, step: 0.1, placeholder: "예: 1500" },
  { key: "medicalAboveGroundFloors", title: "지상층수는 몇 층인가요?", help: "지하층을 제외한 지상층수를 입력해 주세요.", type: "number", onlyFor: "medical", min: 0, step: 1, placeholder: "예: 5" },
  { key: "medicalBasementFloors", title: "지하층 정보를 입력해 주세요.", help: "지하층이 없으면 0을 입력하세요.", type: "compound", onlyFor: "medical" },
  { key: "medicalHasWindowlessFloor", title: "무창층 정보를 입력해 주세요.", help: "무창층이란 채광·환기 조건 등을 충족하지 못하는 층입니다.", type: "compound", onlyFor: "medical" },
  {
    key: "medicalHasGrillWindow",
    title: "사람의 탈출을 막기 위한 고정식 창살이 설치돼 있나요?",
    help: "정신의료기관·의료재활시설에서 바닥면적 300㎡ 미만이어도 간이스프링클러 및 자동화재탐지설비 설치 여부를 판단합니다.",
    type: "choice",
    onlyFor: "medical",
    options: [
      { value: "yes", label: "있음", description: "탈출 방지 목적의 고정식 창살이 설치돼 있음" },
      { value: "no", label: "없음", description: "창살이 없음" },
    ],
  },
  {
    key: "medicalHasGasFacility",
    title: "가스시설이 설치돼 있나요?",
    help: "가스누설경보기 설치 여부를 판단합니다.",
    type: "choice",
    onlyFor: "medical",
    options: [
      { value: "yes", label: "있음", description: "주방 등 가스시설이 설치돼 있음" },
      { value: "no", label: "없음", description: "가스시설이 없음" },
    ],
  },
  { key: "medicalFirstSecondFloorArea", title: "지상 1층과 2층의 바닥면적 합계는 얼마인가요?", help: "연면적이 9,000㎡ 이상일 때만 묻습니다.", type: "number", onlyFor: "medical", min: 0, step: 0.1, placeholder: "예: 9200" },
  { key: "medicalDetailSet", title: "주차·전기실 추가 조건을 입력해 주세요.", help: "해당 공간이 없으면 0으로 입력해 주세요.", type: "compound", onlyFor: "medical" },
];

// 다중이용업소 전용 탐색기(multiuse-only 모드)에서만 쓰는 질문. 메인 탐색기 steps[]와 완전 분리.
const multiuseSteps = [
  {
    key: "multiuseSimpleSprinklerCheck",
    title: "간이스프링클러설비 설치 대상인지 확인합니다.",
    help: "해당되는 항목은 중복 선택할 수 있습니다. 하나라도 해당하면 간이스프링클러설비 설치대상입니다.",
    type: "compound",
  },
  {
    key: "multiuseOnGroundOrRefugeFloor",
    title: "지상 1층이나 피난층에 설치돼있나요?",
    help: "산후조리업이나 고시원에 해당할 때만 확인하며, 맞다면 간이스프링클러설비 대상에서 제외합니다.",
    type: "choice",
    options: [
      { value: "yes", label: "예", description: "지상 1층 또는 피난층에 설치돼 있음" },
      { value: "no", label: "아니오", description: "지상 1층 또는 피난층이 아님" },
    ],
  },
  {
    key: "multiuseOnSecondToTenthFloor",
    title: "다중이용업소가 2층~4층 사이에 설치돼있나요?",
    help: "맞다면 피난기구를 설치해야 합니다.",
    type: "choice",
    options: [
      { value: "yes", label: "예", description: "2층부터 4층 사이에 설치돼 있음" },
      { value: "no", label: "아니오", description: "해당 층 범위가 아님" },
    ],
  },
  {
    key: "multiuseUsesAV",
    title: "'노래반주기 등 영상음향장치를 사용하는 영업장'인가요?",
    help: "맞다면 자동화재탐지설비와 영상음향차단장치를 설치해야 합니다.",
    type: "choice",
    options: [
      { value: "yes", label: "예", description: "영상음향장치를 사용함" },
      { value: "no", label: "아니오", description: "영상음향장치를 사용하지 않음" },
    ],
  },
  {
    key: "multiuseHasGasFacility",
    title: "가스시설을 사용하는 주방이나 난방시설이 있나요?",
    help: "맞다면 가스누설경보기를 설치해야 합니다.",
    type: "choice",
    options: [
      { value: "yes", label: "예", description: "가스시설을 사용함" },
      { value: "no", label: "아니오", description: "가스시설을 사용하지 않음" },
    ],
  },
  {
    key: "multiuseHasRooms",
    title: "영업장 내부에 구획된 실(室)이 있나요?",
    help: "노래방 룸, 고시원 방 등 별도로 구획된 공간이 있는 경우입니다. 해당하면 영업장 내부 피난통로를 확보해야 합니다.",
    type: "choice",
    options: [
      { value: "yes", label: "예", description: "구획된 룸·방 등이 있음" },
      { value: "no", label: "아니오", description: "구획된 실이 없음" },
    ],
  },
  {
    key: "multiuseHasEvacuationRoute",
    title: "영업장 내부 피난통로 또는 복도가 있는 영업장인가요?",
    help: "맞다면 피난유도선을 설치해야 합니다.",
    type: "choice",
    options: [
      { value: "yes", label: "예", description: "피난통로 또는 복도가 있음" },
      { value: "no", label: "아니오", description: "해당 통로가 없음" },
    ],
  },
];

const state = {
  currentStep: 0,
  answers: {
    occupancyType: "neighborhood",
    facilitySubtype: "general",
    postpartumAreaRange: "under600",
    isThirdClassNeighborhood: "yes",
    permitBefore1992: "no",
    pre1992PermitRange: "1982-08-07_to_1984-06-30",
    thirdClassDetailUse: "general",
    totalArea: 1600,
    neighborhoodArea: 1600,
    aboveGroundFloors: 6,
    basementFloors: 1,
    basementAreaSum: 180,
    hasWindowlessFloor: "no",
    windowlessArea: 0,
    hasLargeTargetFloor: "yes",
    firstSecondFloorArea: 0,
    indoorParkingArea: 0,
    parkingStructureArea: 0,
    mechanicalParkingCapacity: 0,
    electricalRoomArea: 0,
    has24HourStaff: "no",
    hasMultiuseBusiness: "no",
    multiuseInBasement: "no",
    multiuseIsSealed: "no",
    multiuseIsPostpartum: "no",
    multiuseIsGosiwon: "no",
    multiuseIsGunRange: "no",
    multiuseOnSecondToTenthFloor: "no",
    multiuseOnGroundOrRefugeFloor: "no",
    multiuseUsesAV: "no",
    multiuseHasGasFacility: "no",
    multiuseHasRooms: "no",
    multiuseHasEvacuationRoute: "no",
    // 숙박시설
    lodgingArea: 450,
    lodgingTotalArea: 2000,
    lodgingAboveGroundFloors: 8,
    lodgingBasementFloors: 1,
    lodgingBasementAreaSum: 200,
    lodgingHasWindowlessFloor: "no",
    lodgingWindowlessArea: 0,
    lodgingHasLargeFloorFor1000: "no",
    lodgingHasGasFacility: "no",
    lodgingFirstSecondFloorArea: 0,
    lodgingIsTouristHotel: "no",
    lodgingIndoorParkingArea: 0,
    lodgingParkingStructureArea: 0,
    lodgingMechanicalParkingCapacity: 0,
    lodgingElectricalRoomArea: 0,
    lodgingHasMultiuseBusiness: "no",
    lodgingMultiuseInBasement: "no",
    lodgingMultiuseIsSealed: "no",
    lodgingMultiuseIsPostpartum: "no",
    lodgingMultiuseIsGosiwon: "no",
    lodgingMultiuseIsGunRange: "no",
    lodgingMultiuseOnSecondToTenthFloor: "no",
    lodgingMultiuseOnGroundOrRefugeFloor: "no",
    lodgingMultiuseUsesAV: "no",
    lodgingMultiuseHasGasFacility: "no",
    lodgingMultiuseHasRooms: "no",
    lodgingMultiuseHasEvacuationRoute: "no",
    // 노유자시설
    elderlySubtype: "general",
    elderlyTotalArea: 1200,
    elderlyArea: 500,
    elderlyAboveGroundFloors: 4,
    elderlyBasementFloors: 0,
    elderlyBasementAreaSum: 0,
    elderlyHasWindowlessFloor: "no",
    elderlyWindowlessArea: 0,
    elderlyHasLargeTargetFloor: "no",
    elderlyHasGrillWindow: "no",
    elderlyHasFloor500Plus: "no",
    elderlyHas24HourStaff: "no",
    elderlyHasGasFacility: "no",
    elderlyFirstSecondFloorArea: 0,
    elderlyIndoorParkingArea: 0,
    elderlyParkingStructureArea: 0,
    elderlyMechanicalParkingCapacity: 0,
    elderlyElectricalRoomArea: 0,
    // 의료시설
    medicalSubtype: "hospital",
    medicalTotalArea: 2000,
    medicalArea: 1500,
    medicalAboveGroundFloors: 5,
    medicalBasementFloors: 1,
    medicalBasementAreaSum: 300,
    medicalHasWindowlessFloor: "no",
    medicalWindowlessArea: 0,
    medicalHasGrillWindow: "no",
    medicalHasGasFacility: "no",
    medicalFirstSecondFloorArea: 0,
    medicalIndoorParkingArea: 0,
    medicalParkingStructureArea: 0,
    medicalMechanicalParkingCapacity: 0,
    medicalElectricalRoomArea: 0,
  },
  dateCalc: {
    mode: "inspect_report",
    baseDate: todayString(),
    holidays: [],
    apiHolidays: {},
    selectMode: "base",
    noncomplianceType: "repair",
    assistantTargetType: "apartment",
    assistantHouseholds: "",
    assistantArea: "",
    viewYear: new Date().getFullYear(),
    viewMonth: new Date().getMonth(),
    editingMonth: false,
  },
};

const CALC_MODES = {
  inspect_report: {
    short: "자체점검",
    kind: "inspect_report",
    label: "자체점검 실시결과 보고서 제출",
    days: 15,
    baseDateLabel: "점검 완료일",
    resultLabel: "제출기한",
    infoTone: "amber",
    supportsHolidaySelection: true,
    infoTitle: "접수 시 확인사항",
    infoBody: "① 자체점검 실시결과는 '관계인'의 서명이 되어있어야합니다.<br>② 2급 이상 대상은 소방시설관리업자가 자체점검을 해야 합니다.<br>③ 점검인력은 주인력1명, 보조인력2명을 기본 1단위로 합니다.",
    tableTitle: "점검 구분별 제출 서류",
    tableHead: ["구분", "제출 서류"],
    tableBody: [
      ["관계인 직접", "① 자체점검 실시결과 보고서"],
      ["업체 위탁", "① 자체점검 실시결과 보고서<br>② 점검인력 배치확인서<br>③ 점검결과 보고서 제출용 위임장(업체 제출시)"],
      ["부적합 추가 서류", "① 소방시설등의 자체점검 결과 이행계획서"],
    ],
  },
  fire_safety_manager: {
    short: "소방안전관리자",
    kind: "manager_dual",
    label: "소방안전관리자 기한 계산",
    baseDateLabel: "해임·퇴직일",
    resultLabel: "선임 및 선임신고 기한",
    infoTone: "amber",
    supportsHolidaySelection: true,
    appointDays: 30,
    reportDays: 14,
    infoTitle: "선임신고 시 확인사항",
    introBody: "해임·퇴직일로부터 30일 이내에 선임하고, 선임일로부터 14일 이내에 소방서에 신고해야 합니다.",
    infoBody: "선임신고서에 '관계인' 서명이 필요합니다.(안전관리자와 관계인이 같으면 안전관리자 서명 가능)",
    tableTitle: "선임 구분별 제출 서류",
    tableHead: ["구분", "제출 서류"],
    tableBody: [
      ["개인 직접 선임", "① 소방안전관리자 선임신고서<br>② 소방안전관리자 자격증 사본"],
      ["소방시설관리업체<br>대행 선임", "① 소방안전관리자 선임신고서<br>② 소방안전관리 업무 감독 증명서류<br>③ 소방안전관리업무의 대행 계약서 사본<br>④ 선임신고서 제출용 위임장(업체 제출시)<br> ⑤ 소방시설관리업등록증(2022.12.1부터 필수X)<br>⑥ 소방시설관리사수첩(2022.12.1부터 필수X)"],
    ],
    extraSections: [
      {
        title: "소방안전관리 대상물 구분 기준",
        titleColor: "red",
        content: `
<div style="display:flex;flex-direction:column;gap:12px;">
  <div>
    <div style="color:var(--red-soft);font-weight:700;margin-bottom:4px;">특급</div>
    <div style="display:flex;flex-direction:column;gap:2px;padding-left:8px;">
      <span>1) 50층↑(지하층 제외) 또는 높이 200m↑ 아파트</span>
      <span>2) 30층↑(지하층 포함) 또는 높이 120m↑ 특정소방대상물(아파트 제외)</span>
      <span>3) 연면적 10만㎡↑ 특정소방대상물(아파트 제외)</span>
    </div>
  </div>
  <div style="border-top:1px solid rgba(66,133,244,0.15);padding-top:12px;">
    <div style="color:var(--red-soft);font-weight:700;margin-bottom:4px;">1급</div>
    <div style="display:flex;flex-direction:column;gap:2px;padding-left:8px;">
      <span>1) 30층↑(지하층 제외) 또는 높이 120m↑ 아파트</span>
      <span>2) 연면적 1만5천㎡↑ 특정소방대상물(아파트·연립주택 제외)</span>
      <span>3) 지상 11층↑ 특정소방대상물(아파트 제외)</span>
      <span>4) 가연성 가스 1,000톤↑ 저장·취급 시설</span>
    </div>
  </div>
  <div style="border-top:1px solid rgba(66,133,244,0.15);padding-top:12px;">
    <div style="color:var(--red-soft);font-weight:700;margin-bottom:4px;">2급</div>
    <div style="display:flex;flex-direction:column;gap:2px;padding-left:8px;">
      <span>1) 옥내소화전·스프링클러·물분무등소화설비 설치 대상</span>
      <span>2) 도시가스사업 허가 시설 또는 가연성 가스 100~1,000톤 미만 저장·취급 시설</span>
      <span>3) 지하구</span>
      <span>4) 옥내소화전 또는 스프링클러 설치 공동주택</span>
      <span>5) 보물·국보로 지정된 목조건축물</span>
    </div>
  </div>
  <div style="border-top:1px solid rgba(66,133,244,0.15);padding-top:12px;">
    <div style="color:var(--red-soft);font-weight:700;margin-bottom:4px;">3급</div>
    <div style="display:flex;flex-direction:column;gap:2px;padding-left:8px;">
      <span>1) 간이스프링클러설비(주택전용 제외) 설치 대상</span>
      <span>2) 자동화재탐지설비 설치 대상</span>
    </div>
  </div>
</div>`,
      },
    ],
  },
  fire_safety_assistant_manager: {
    short: "소방안전관리보조자",
    kind: "manager_dual",
    label: "소방안전관리보조자 기한 계산",
    baseDateLabel: "해임·퇴직일",
    resultLabel: "선임 및 선임신고 기한",
    infoTone: "amber",
    supportsHolidaySelection: true,
    appointDays: 30,
    reportDays: 14,
    infoTitle: "선임신고 시 확인사항",
    introBody: "해임·퇴직일로부터 30일 이내에 선임하고, 선임일로부터 14일 이내에 소방서에 신고해야 합니다.",
    infoBody: "소방안전관리보조자는 소방안전관리자를 보조하여 소방안전관리 업무를 수행합니다. 선임신고서에 '관계인' 서명이 필요하며, 소방안전관리보조자 자격을 갖춘 자를 선임해야 합니다.",
    tableTitle: "선임 구분별 제출 서류",
    tableHead: ["구분", "제출 서류"],
    tableBody: [
      ["공통신고<br>서류", "① 소방안전관리보조자 선임신고서"],
      ["자격증명<br>서류<br>(중 1택)", "① 소방안전관리보조자 자격증 사본<br>② 소방안전관리자 자격증 사본(특,1,2,3급)<br>③ 소방안전관리자 강습교육 수료증 사본(특,1,2,3급,공공기관)<br>④ 국가기술자격증 사본(건축, 위험물, 안전관리 등)<br>⑤ 소방안전 관련 업무에 2년 이상 근무경력 증명서류"],
    ],
    extraSections: [
      {
        title: "선임 대상",
        content: `
<div style="display:flex;flex-direction:column;gap:12px;">
  <div>
    <div style="color:var(--red-soft);font-weight:700;margin-bottom:4px;">가.</div>
    <div style="padding-left:8px;">300세대 이상인 아파트</div>
  </div>
  <div style="border-top:1px solid rgba(66,133,244,0.15);padding-top:12px;">
    <div style="color:var(--red-soft);font-weight:700;margin-bottom:4px;">나.</div>
    <div style="padding-left:8px;">연면적 1만5천㎡ 이상인 특정소방대상물(아파트·연립주택 제외)</div>
  </div>
  <div style="border-top:1px solid rgba(66,133,244,0.15);padding-top:12px;">
    <div style="color:var(--red-soft);font-weight:700;margin-bottom:4px;">다.</div>
    <div style="padding-left:8px;display:flex;flex-direction:column;gap:4px;">
      <span>가·나 외 특정소방대상물 중 다음 어느 하나에 해당하는 것</span>
      <span style="padding-left:12px;">1) 공동주택 중 기숙사</span>
      <span style="padding-left:12px;">2) 의료시설</span>
      <span style="padding-left:12px;">3) 노유자 시설</span>
      <span style="padding-left:12px;">4) 수련시설</span>
      <span style="padding-left:12px;">5) 숙박시설(바닥면적 합계 1,500㎡ 미만이고 관계인이 24시간 상시 근무하는 경우 제외)</span>
    </div>
  </div>
</div>`,
      },
      {
        title: "선임 인원",
        content: `
<div style="display:flex;flex-direction:column;gap:12px;">
  <div>
    <div style="color:var(--red-soft);font-weight:700;margin-bottom:4px;">가.</div>
    <div style="padding-left:8px;">아파트(300세대 이상): 1명. 초과되는 300세대마다 1명 이상 추가 선임</div>
  </div>
  <div style="border-top:1px solid rgba(66,133,244,0.15);padding-top:12px;">
    <div style="color:var(--red-soft);font-weight:700;margin-bottom:4px;">나.</div>
    <div style="padding-left:8px;">연면적 1만5천㎡ 이상: 1명. 초과되는 연면적 1만5천㎡마다 1명 추가 선임</div>
  </div>
  <div style="border-top:1px solid rgba(66,133,244,0.15);padding-top:12px;">
    <div style="color:var(--red-soft);font-weight:700;margin-bottom:4px;">다.</div>
    <div style="padding-left:8px;">그 밖의 대상: 1명. 야간·휴일에 이용되지 않는 것이 확인된 경우 선임 제외 가능</div>
  </div>
</div>`,
      },
    ],
  },
  hazardous_material_manager: {
    short: "위험물안전관리자",
    kind: "manager_dual",
    label: "위험물안전관리자 기한 계산",
    baseDateLabel: "해임·퇴직일",
    resultLabel: "선임 및 선임신고 기한",
    infoTone: "amber",
    supportsHolidaySelection: true,
    appointDays: 30,
    reportDays: 14,
    infoTitle: "선임신고 시 확인사항",
    introBody: "해임·퇴직일로부터 30일 이내에 선임하고, 선임일로부터 14일 이내에 소방서에 신고해야 합니다.",
    infoBody: "해당 위험물 유형과 지정수량의 배수에 맞는 자격(위험물기능사·산업기사·기능장 등)을 갖추었는지 확인하세요.<br> 둘 이상의 제조소등에 중복하여 선임하는 경우 제조소등의 수만큼 신고서를 각각 제출해야 합니다.",
    tableTitle: "선임 구분별 제출 서류",
    tableHead: ["구분", "제출 서류"],
    tableBody: [
      ["개인 직접 선임", "① 위험물안전관리자 선임신고서<br>② 위험물안전관리자 자격증 사본"],
      ["안전관리대행기관<br>대행 선임", "① 위험물안전관리자 선임신고서<br>② 위험물 안전관리대행기관 지정서 사본<br>③ 위험물 안전관리업무대행계약서 사본"],
    ],
  },
  noncompliance_action: {
    short: "부적합조치기한",
    kind: "noncompliance_dual",
    label: "부적합 조치기한 계산",
    baseDateLabel: "보고일",
    resultLabel: "이행완료 및 완료신고 기한",
    infoTone: "amber",
    supportsHolidaySelection: true,
    reportDays: 10,
    actionTypes: {
      repair: {
        label: "10일",
        completionDays: 10,
        tooltip: "소방시설등을 구성하고 있는 기계ㆍ기구를 수리하거나 정비하는 경우",
        description: "소방시설등을 구성하는 기계·기구를 수리하거나 정비하는 경우",
      },
      replacement: {
        label: "20일",
        completionDays: 20,
        tooltip: "소방시설등의 전부 또는 일부를 철거하고 새로 교체하는 경우",
        description: "소방시설등의 전부 또는 일부를 철거하고 새로 교체하는 경우",
      },
    },
    infoTitle: "조치기한 10일·20일 기준 판단",
    infoBody: "기간 구분이 애매한 경우 소방서 자체점검 담당자와 협의해서 결정하세요. 조치기한 10일을 줘야할 것 같아도 상황에 따라서 20일을 주기도 합니다.",
    tableTitle: "이행기한 구분 예시",
    tableHead: ["기한", "해당 사례"],
    tableBody: [],
  },
};

const screens = {
  home: document.getElementById("screen-home"),
  explorerSelect: document.getElementById("screen-explorer-select"),
  explorer: document.getElementById("screen-explorer"),
  explorerYear: document.getElementById("screen-explorer-year"),
  date: document.getElementById("screen-date"),
  inspection: document.getElementById("screen-inspection"),
  multiuseSelect: document.getElementById("screen-multiuse-select"),
  multiuse: document.getElementById("screen-multiuse"),
  guide: document.getElementById("screen-guide"),
  reportGuide: document.getElementById("screen-report-guide"),
  occupancy: document.getElementById("screen-occupancy"),
  lab: document.getElementById("screen-lab"),
  facilities: document.getElementById("screen-facilities"),
  layoutLearn: document.getElementById("screen-layout-learn"),
  "developer-letter": document.getElementById("screen-developer-letter"),
};

const questionElements = {
  kicker: document.getElementById("question-kicker"),
  title: document.getElementById("question-title"),
  help: document.getElementById("question-help"),
  input: document.getElementById("question-input"),
};

const explorerRuntime = {
  mode: "default", // "default" | "year"
  from: "home",   // 뒤로가기 대상 추적
};

const explorerTitleEl = document.getElementById("explorer-title");
const explorerModeBadgeEl = document.getElementById("explorer-mode-badge");

function applyExplorerModeUI() {
  if (!explorerTitleEl || !explorerModeBadgeEl) return;
  const isYearMode = explorerRuntime.mode === "year";
  const isMultiuseOnly = explorerRuntime.mode === "multiuse-only";
  if (isMultiuseOnly) {
    explorerTitleEl.textContent = "다중이용업소 안전시설 탐색";
    explorerModeBadgeEl.classList.add("hidden");
  } else {
    explorerTitleEl.textContent = isYearMode ? "소방시설 탐색기 (연도별)" : "소방시설 탐색기";
    explorerModeBadgeEl.classList.toggle("hidden", !isYearMode);
  }
  const lawChip = document.getElementById("explorer-law-chip");
  if (lawChip) {
    if (isMultiuseOnly) {
      lawChip.dataset.lawKey = "multiuse-safety";
      lawChip.classList.remove("hidden");
    } else if (isYearMode) {
      const era = (typeof yearState !== "undefined" && yearState.answers && yearState.answers.yEraChoice) || "after2004";
      lawChip.dataset.lawKey = era === "before2004" ? "explorer-year-pre" : "explorer-year-post";
      lawChip.classList.remove("hidden");
    } else {
      lawChip.dataset.lawKey = "explorer-simple";
      lawChip.classList.remove("hidden");
    }
  }
}

const questionCard = document.getElementById("question-card");
const resultCard = document.getElementById("result-card");
const multiuseSafetyCard = document.getElementById("multiuse-safety-card");

const explorerViewState = {
  lastInput: null,
};

function todayString() {
  const now = new Date();
  return formatInputDate(now);
}

function formatInputDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDate(date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toBool(value) {
  return value === "yes";
}

function parseDate(value) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isWeekend(date) {
  return date.getDay() === 0 || date.getDay() === 6;
}

function dateKey(date) {
  return formatInputDate(date);
}

function parseHolidayInput(text) {
  return text.split(",").map((part) => part.trim()).filter(Boolean).filter((part) => /^\d{4}-\d{2}-\d{2}$/.test(part));
}

function sameDate(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function addInspectReportDays(startDate, days, holidayKeys) {
  const countedDates = [];
  let cursor = addDays(startDate, 1);
  while (countedDates.length < days) {
    const key = dateKey(cursor);
    if (!isWeekend(cursor) && !holidayKeys.has(key)) {
      countedDates.push(new Date(cursor));
    }
    cursor = addDays(cursor, 1);
  }
  return countedDates;
}

function getSequentialDates(startDate, days) {
  const dates = [];
  for (let i = 1; i <= days; i += 1) {
    dates.push(addDays(startDate, i));
  }
  return dates;
}

function getInclusiveDates(startDate, days) {
  const dates = [];
  for (let i = 0; i < days; i += 1) {
    dates.push(addDays(startDate, i));
  }
  return dates;
}

function moveToNextBusinessDay(date, holidayKeys) {
  let cursor = new Date(date);
  while (isWeekend(cursor) || holidayKeys.has(dateKey(cursor))) {
    cursor = addDays(cursor, 1);
  }
  return cursor;
}

function addBusinessDays(startDate, days, holidayKeys) {
  let count = 0;
  let cursor = addDays(startDate, 1);
  while (count < days) {
    if (!isWeekend(cursor) && !holidayKeys.has(dateKey(cursor))) {
      count += 1;
      if (count === days) break;
    }
    cursor = addDays(cursor, 1);
  }
  return cursor;
}

function getAssistantStaffingResult(targetType, rawValue) {
  if (rawValue === "" || rawValue === null || rawValue === undefined) return null;
  const value = Number(rawValue);
  if (!Number.isFinite(value) || value < 0) return null;

  const normalizedValue = Math.floor(value);
  const isApartment = targetType === "apartment";
  const divisor = isApartment ? 300 : 15000;
  const count = Math.floor(normalizedValue / divisor);

  return {
    count,
    divisor,
    inputValue: normalizedValue,
    inputLabel: isApartment ? "세대수" : "연면적",
    targetLabel: isApartment ? "아파트" : "그 외 대상",
    unitLabel: isApartment ? "세대" : "㎡",
  };
}

function sanitizeAssistantNumericInput(value) {
  return String(value ?? "").replace(/\D/g, "");
}

const simpleAfter2004StepOrder = new Map([
  "occupancyType",

  // 공통 건축물 정보
  "totalArea",
  "aboveGroundFloors",
  "basementFloors",
  "hasWindowlessFloor",
  "neighborhoodArea",

  // 용도 세부 질문
  "facilitySubtype",
  "postpartumAreaRange",
  "has24HourStaff",

  // 조건 보정 질문
  "hasLargeTargetFloor",
  "firstSecondFloorArea",
  "detailSet",

  // 공통 건축물 정보 - 숙박시설
  "lodgingTotalArea",
  "lodgingAboveGroundFloors",
  "lodgingBasementFloors",
  "lodgingHasWindowlessFloor",
  "lodgingArea",

  // 용도 세부 질문 - 숙박시설
  "lodgingIsTouristHotel",

  // 조건 보정 질문 - 숙박시설
  "lodgingHasLargeFloorFor1000",
  "lodgingFirstSecondFloorArea",
  "lodgingDetailSet",

  // 가스시설 질문 - 숙박시설
  "lodgingHasGasFacility",

  // 공통 건축물 정보 - 노유자시설
  "elderlyTotalArea",
  "elderlyAboveGroundFloors",
  "elderlyBasementFloors",
  "elderlyHasWindowlessFloor",
  "elderlyArea",

  // 용도 세부 질문 - 노유자시설
  "elderlySubtype",
  "elderlyHasGrillWindow",
  "elderlyHasFloor500Plus",
  "elderlyHas24HourStaff",

  // 조건 보정 질문 - 노유자시설
  "elderlyFirstSecondFloorArea",
  "elderlyDetailSet",

  // 가스시설 질문 - 노유자시설
  "elderlyHasGasFacility",

  // 공통 건축물 정보 - 의료시설
  "medicalTotalArea",
  "medicalAboveGroundFloors",
  "medicalBasementFloors",
  "medicalHasWindowlessFloor",
  "medicalArea",

  // 용도 세부 질문 - 의료시설
  "medicalSubtype",
  "medicalHasGrillWindow",

  // 조건 보정 질문 - 의료시설
  "medicalFirstSecondFloorArea",
  "medicalDetailSet",

  // 가스시설 질문 - 의료시설
  "medicalHasGasFacility",
].map((key, index) => [key, index]));
// ── 단계(phase) 정의: 용도(0) / 규모(1) / 특수조건(2). 결과(3)은 UI 도착표시 전용. ──
// 정렬 1순위 = phase, 2순위 = 기존 순서맵.
// → 세부유형(정체) 질문이 자동으로 ①용도로 당겨지고(B안 정밀), 단조증가가 구조적으로 보장됨.
// USE/SIZE에 없는 모든 키는 기본 특수조건(2). 면적 자동산정 해제 묶음은 기존 +100000 오프셋으로 특수조건 내 맨 뒤 유지.
const PHASE_USE_KEYS = new Set([
  // 간단버전
  "occupancyType", "facilitySubtype",
  "lodgingIsTouristHotel", "elderlySubtype", "medicalSubtype",
  // 자세한(연도별)버전
  "yEraChoice", "yPermitDate", "yOccupancyType", "yApartmentSubtype",
  "yFacilitySubtype", "yBefore2004FacilitySubtype",
  "yLodgingIsTouristHotel", "yBefore2004LodgingIsTouristHotel", "yLodgingIsLiving",
  "yElderlySubtype", "yMedicalSubtype", "yBefore2004MedicalSubtype",
  "ySalesIsTraditionalMarket", "ySalesIsLargeStore",
  "yReligiousIsSacrificialBuilding",
]);
const PHASE_SIZE_KEYS = new Set([
  // 간단버전
  "totalArea", "aboveGroundFloors", "basementFloors", "hasWindowlessFloor", "neighborhoodArea",
  "lodgingTotalArea", "lodgingAboveGroundFloors", "lodgingBasementFloors", "lodgingHasWindowlessFloor", "lodgingArea",
  "elderlyTotalArea", "elderlyAboveGroundFloors", "elderlyBasementFloors", "elderlyHasWindowlessFloor", "elderlyArea",
  "medicalTotalArea", "medicalAboveGroundFloors", "medicalBasementFloors", "medicalHasWindowlessFloor", "medicalArea",
  // 자세한버전
  "yTotalArea", "yAboveGroundFloors", "yBasementSet", "yWindowlessSet",
  "yNeighborhoodArea", "yLodgingArea", "yElderlyArea", "yMedicalArea", "ySalesArea", "yBefore2004SalesArea",
  "yAptBuildingCount", "yAptHouseholdCount", "yBefore2004AptHouseholds",
]);
function phaseOf(key) {
  if (PHASE_USE_KEYS.has(key)) return 0;
  if (PHASE_SIZE_KEYS.has(key)) return 1;
  return 2; // 특수조건 (기본값)
}
// 단계바 4칸(<li>)에 done/active 클래스 적용. phaseIdx: 0=용도 1=규모 2=특수조건 3=결과
function renderPhaseBar(container, phaseIdx) {
  if (!container) return;
  [...container.children].forEach((li, i) => {
    li.classList.toggle("is-done", i < phaseIdx);
    li.classList.toggle("is-active", i === phaseIdx);
  });
}

function sortBySimpleAfter2004Order(activeSteps) {
  return [...activeSteps].sort((a, b) => {
    const pa = phaseOf(a.key), pb = phaseOf(b.key);
    if (pa !== pb) return pa - pb;
    const ai = simpleAfter2004StepOrder.get(a.key) ?? Number.MAX_SAFE_INTEGER;
    const bi = simpleAfter2004StepOrder.get(b.key) ?? Number.MAX_SAFE_INTEGER;
    if (ai !== bi) return ai - bi;
    return steps.indexOf(a) - steps.indexOf(b);
  });
}

function getActiveSteps() {
  if (explorerRuntime.mode === "multiuse-only") {
    return multiuseSteps.filter((step) => {
      if (step.key === "multiuseOnGroundOrRefugeFloor") {
        return state.answers.multiuseIsPostpartum === "yes" || state.answers.multiuseIsGosiwon === "yes";
      }
      if (step.key === "multiuseOnSecondToTenthFloor") {
        return state.answers.multiuseInBasement !== "yes" && state.answers.multiuseOnGroundOrRefugeFloor !== "yes";
      }
      return true;
    });
  }
  // 숙박시설 다중이용업소 질문은 steps[]에 정의는 있으나 간단 탐색기에서는 표시하지 않음(연도별 탐색기에서만 사용).
  const EXPLORER_MULTIUSE_KEYS = [
    "lodgingHasMultiuseBusiness",
    "lodgingMultiuseSimpleSprinklerCheck",
    "lodgingMultiuseOnSecondToTenthFloor",
    "lodgingMultiuseOnGroundOrRefugeFloor",
    "lodgingMultiuseUsesAV",
    "lodgingMultiuseHasGasFacility",
    "lodgingMultiuseHasRooms",
    "lodgingMultiuseHasEvacuationRoute",
  ];
  const activeSteps = steps.filter((step) => {
    if (["isThirdClassNeighborhood", "permitBefore1992", "pre1992PermitRange", "thirdClassDetailUse"].includes(step.key)) return false;
    if (EXPLORER_MULTIUSE_KEYS.includes(step.key)) return false;
    if (!step.onlyFor) return true;
    if (step.onlyFor !== state.answers.occupancyType) return false;
    if (step.key === "hasLargeTargetFloor") return toNumber(state.answers.totalArea) < 1500;
    if (step.key === "firstSecondFloorArea") return toNumber(state.answers.totalArea) >= 9000;
    if (step.key === "postpartumAreaRange") return state.answers.facilitySubtype === "postpartum";
    if (step.key === "has24HourStaff") return ["clinicInpatient", "postpartum"].includes(state.answers.facilitySubtype);
    // 숙박시설 전용 조건
    if (step.key === "lodgingHasLargeFloorFor1000") {
      // 이미 전층 스프링클러 대상이면 skip
      const la = toNumber(state.answers.lodgingArea);
      const ag = toNumber(state.answers.lodgingAboveGroundFloors);
      const totalF = toNumber(state.answers.lodgingAboveGroundFloors) + toNumber(state.answers.lodgingBasementFloors);
      return la < 600 && ag < 6 && totalF < 6;
    }
    if (step.key === "lodgingFirstSecondFloorArea") return toNumber(state.answers.lodgingTotalArea) >= 9000;
    // 노유자시설 전용 조건
    if (step.key === "elderlyHasGrillWindow") {
      return state.answers.elderlySubtype === "general"
        && toNumber(state.answers.elderlyArea) < 300;
    }
    if (step.key === "elderlyHasFloor500Plus") return state.answers.elderlySubtype === "general";
    if (step.key === "elderlyHas24HourStaff") {
      if (state.answers.elderlySubtype === "living") return true;
      return state.answers.elderlySubtype === "general"
        && state.answers.elderlyHasFloor500Plus === "yes";
    }
    if (step.key === "elderlyFirstSecondFloorArea") return toNumber(state.answers.elderlyTotalArea) >= 9000;
    // 의료시설 전용 조건
    if (step.key === "medicalHasGrillWindow") {
      const sub = state.answers.medicalSubtype;
      const ma = toNumber(state.answers.medicalArea);
      return (sub === "psychiatricHospital" || sub === "rehabilitationFacility") && ma < 300;
    }
    if (step.key === "medicalFirstSecondFloorArea") return toNumber(state.answers.medicalTotalArea) >= 9000;
    return true;
  });
  return sortBySimpleAfter2004Order(activeSteps);
}

let ilguLoadingFrame = null;
let ilguSpriteTimer = null;
let ilguSpawnTimer = null;
let ilguPhysicsFrame = null;
let ilguPapers = [];

function showIlguLoading(callback) {
  const overlay = document.getElementById("ilgu-loading-overlay");
  const statusEl = document.getElementById("ilgu-loading-status");
  const percentEl = document.getElementById("ilgu-loading-percent");
  const barEl = document.getElementById("ilgu-loading-bar");
  const spriteEl = document.getElementById("v2-sprite");
  const stageBack = document.getElementById("v2-stage-back");
  const stageFront = document.getElementById("v2-stage-front");
  const wrap = document.getElementById("v2-loader-wrap");

  const loadingSteps = [
    { limit: 25, text: "서류를 찾는 중" },
    { limit: 55, text: "자료를 검토하는 중" },
    { limit: 82, text: "결과를 정리하는 중" },
    { limit: 99, text: "마무리 확인 중" },
    { limit: 100, text: "완료" },
  ];

  if (ilguLoadingFrame) cancelAnimationFrame(ilguLoadingFrame);
  if (ilguPhysicsFrame) cancelAnimationFrame(ilguPhysicsFrame);
  clearTimeout(ilguSpawnTimer);
  clearTimeout(ilguSpriteTimer);
  ilguPapers.forEach(p => p.el.remove());
  ilguPapers = [];

  overlay.classList.remove("fading");
  overlay.classList.remove("hidden");
  overlay.style.opacity = "0";
  requestAnimationFrame(() => { overlay.style.opacity = ""; });

  // sprite frame cycling
  const spritePositions = ["0%", "33.33%", "100%", "66.66%"];
  let spriteIdx = 0;
  function cycleSpriteFrame() {
    spriteIdx = (spriteIdx + 1) % spritePositions.length;
    if (spriteEl) spriteEl.style.backgroundPosition = spritePositions[spriteIdx] + " 50%";
    ilguSpriteTimer = setTimeout(cycleSpriteFrame, 600);
  }
  ilguSpriteTimer = setTimeout(cycleSpriteFrame, 600);

  // wave-char status paint
  let lastStatusText = "";
  function paint(percent) {
    const step = loadingSteps.find(s => percent <= s.limit) || loadingSteps[loadingSteps.length - 1];
    if (step.text !== lastStatusText) {
      if (statusEl) {
        statusEl.innerHTML = "";
        [...step.text].forEach((ch, i) => {
          const s = document.createElement("span");
          s.className = "v2-wave-char";
          s.textContent = ch;
          s.style.animationDelay = `${i * 0.08}s`;
          if (ch === " ") s.style.width = "0.3em";
          statusEl.appendChild(s);
        });
      }
      lastStatusText = step.text;
    }
    if (percentEl) percentEl.textContent = `${percent}%`;
    if (barEl) barEl.style.width = `${percent}%`;
  }

  // paper physics
  const PAPER_KINDS = ["kind-a", "kind-b", "kind-c"];
  function randBetween(min, max) { return min + Math.random() * (max - min); }
  function spawnPaper() {
    if (!wrap) return;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    const fromLeft = Math.random() < 0.5;
    const sourceX = fromLeft ? w * 0.35 : w * 0.65;
    const sourceY = h * 0.30 + randBetween(-10, 15);
    const size = randBetween(0.8, 1.2);
    const baseW = 26 * size;
    const baseH = 36 * size;
    const direction = fromLeft ? -1 : 1;
    const el = document.createElement("div");
    el.className = `v2-paper ${PAPER_KINDS[Math.floor(Math.random() * PAPER_KINDS.length)]}`;
    el.style.width = `${baseW}px`;
    el.style.height = `${baseH}px`;
    el.style.left = "0px";
    el.style.top = "0px";
    el.style.opacity = "0";
    const layer = Math.random() < 0.5 ? "back" : "front";
    (layer === "back" ? stageBack : stageFront).appendChild(el);
    ilguPapers.push({
      el,
      x: sourceX - baseW / 2, y: sourceY - baseH / 2,
      vx: direction * randBetween(70, 160),
      vy: randBetween(-240, -340),
      gravity: randBetween(360, 460),
      rotation: randBetween(0, 360),
      rotationSpeed: randBetween(-200, 200),
      life: randBetween(2000, 3000),
      born: performance.now(),
    });
  }

  let physicsLast = performance.now();
  function physicsLoop(now) {
    const dt = Math.min((now - physicsLast) / 1000, 0.05);
    physicsLast = now;
    const h = wrap ? wrap.clientHeight : 0;
    for (let i = ilguPapers.length - 1; i >= 0; i--) {
      const p = ilguPapers[i];
      const lifeT = (now - p.born) / p.life;
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.rotationSpeed * dt;
      const opacity = lifeT < 0.15 ? lifeT / 0.15 : lifeT > 0.75 ? Math.max(0, 1 - (lifeT - 0.75) / 0.25) : 1;
      p.el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rotation}deg)`;
      p.el.style.opacity = opacity.toFixed(3);
      if (lifeT >= 1 || p.y > h + 100) { p.el.remove(); ilguPapers.splice(i, 1); }
    }
    ilguPhysicsFrame = requestAnimationFrame(physicsLoop);
  }
  ilguPhysicsFrame = requestAnimationFrame(physicsLoop);

  function startSpawning() {
    for (let i = 0; i < 4; i++) setTimeout(spawnPaper, i * 120);
    function tick() { spawnPaper(); ilguSpawnTimer = setTimeout(tick, randBetween(180, 360)); }
    ilguSpawnTimer = setTimeout(tick, 300);
  }
  function stopSpawning() { clearTimeout(ilguSpawnTimer); ilguSpawnTimer = null; }

  startSpawning();
  paint(1);

  const duration = 3000 + Math.random() * 3000;
  const start = performance.now();
  let lastPercent = 1;

  function tick(now) {
    const elapsed = now - start;
    const raw = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - raw, 2.35);
    const maxBeforeDone = raw < 1 ? 99 : 100;
    const jitter = raw < 0.92 ? Math.sin(elapsed / 120) * 1.4 : 0;
    const percent = Math.max(lastPercent, Math.min(maxBeforeDone, Math.floor(eased * 100 + jitter)));
    lastPercent = percent;
    paint(percent);
    if (raw < 1) { ilguLoadingFrame = requestAnimationFrame(tick); return; }
    stopSpawning();
    clearTimeout(ilguSpriteTimer);
    overlay.classList.add("fading");
    setTimeout(() => {
      overlay.classList.add("hidden");
      overlay.classList.remove("fading");
      cancelAnimationFrame(ilguPhysicsFrame);
      ilguPapers.forEach(p => p.el.remove());
      ilguPapers = [];
      ilguLoadingFrame = null;
      callback();
    }, 300);
  }
  ilguLoadingFrame = requestAnimationFrame(tick);
}

function showScreen(name) {
  Object.entries(screens).forEach(([key, element]) => {
    element.classList.toggle("active", key === name);
  });
  const target = screens[name];
  if (target) {
    const scrollable = target.querySelector('.scroll-content') || target;
    scrollable.scrollTop = 0;
  }
  window.scrollTo(0, 0);
  if (!_suppressHistoryPush && name !== 'home') {
    history.pushState({ screen: name }, '');
  }
}

function getTotalFloors() {
  return toNumber(state.answers.aboveGroundFloors) + toNumber(state.answers.basementFloors);
}

function updateProgress() {
  const wrap = document.getElementById("explorer-prog-wrap");
  // 다중이용업소 전용 탐색기는 단계 개념이 달라 단계바 숨김
  if (explorerRuntime.mode === "multiuse-only") {
    if (wrap) wrap.classList.add("hidden");
    return;
  }
  if (wrap) wrap.classList.remove("hidden");
  const activeSteps = getActiveSteps();
  const step = activeSteps[state.currentStep];
  renderPhaseBar(document.getElementById("phase-steps"), step ? phaseOf(step.key) : 0);
}

function renderChoiceStep(step) {
  const wrapper = document.createElement("div");
  wrapper.className = "choice-list";
  step.options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button";
    if (String(state.answers[step.key]) === option.value) button.classList.add("selected");
    button.innerHTML = `<strong>${option.label}</strong><span>${option.description}</span>`;
    button.addEventListener("click", () => {
      state.answers[step.key] = option.value;
      renderCurrentStep();
    });
    wrapper.appendChild(button);
  });
  return wrapper;
}

const AUTO_FILL_PAIRS = {
  totalArea: "neighborhoodArea",
  lodgingTotalArea: "lodgingArea",
  elderlyTotalArea: "elderlyArea",
  medicalTotalArea: "medicalArea",
};

const FIRST_SECOND_AREA_RULES = {
  firstSecondFloorArea: {
    totalAreaKey: "totalArea",
    aboveGroundFloorsKey: "aboveGroundFloors",
    basementFloorsKey: "basementFloors",
  },
  lodgingFirstSecondFloorArea: {
    totalAreaKey: "lodgingTotalArea",
    aboveGroundFloorsKey: "lodgingAboveGroundFloors",
    basementFloorsKey: "lodgingBasementFloors",
  },
  elderlyFirstSecondFloorArea: {
    totalAreaKey: "elderlyTotalArea",
    aboveGroundFloorsKey: "elderlyAboveGroundFloors",
    basementFloorsKey: "elderlyBasementFloors",
  },
  medicalFirstSecondFloorArea: {
    totalAreaKey: "medicalTotalArea",
    aboveGroundFloorsKey: "medicalAboveGroundFloors",
    basementFloorsKey: "medicalBasementFloors",
  },
};

function calculateFirstSecondFloorArea(targetKey) {
  const rule = FIRST_SECOND_AREA_RULES[targetKey];
  if (!rule) return null;
  const totalArea = toNumber(state.answers[rule.totalAreaKey]);
  const aboveGroundFloors = toNumber(state.answers[rule.aboveGroundFloorsKey]);
  const basementFloors = toNumber(state.answers[rule.basementFloorsKey]);
  const totalFloors = aboveGroundFloors + basementFloors;
  if (totalFloors <= 0) return 0;
  return Math.round((totalArea / totalFloors) * 2 * 10) / 10;
}

function syncDerivedFirstSecondFloorAreas(changedKey) {
  Object.entries(FIRST_SECOND_AREA_RULES).forEach(([targetKey, rule]) => {
    if (![rule.totalAreaKey, rule.aboveGroundFloorsKey, rule.basementFloorsKey].includes(changedKey)) return;
    state.answers[targetKey] = calculateFirstSecondFloorArea(targetKey);
  });
}
function renderNumberStep(step) {
  const input = document.createElement("input");
  input.className = "calc-input";
  input.type = "number";
  input.min = String(step.min ?? 0);
  input.step = String(step.step ?? 1);
  input.placeholder = step.placeholder ?? "";
  const derivedValue = calculateFirstSecondFloorArea(step.key);
  if (derivedValue !== null) state.answers[step.key] = derivedValue;
  input.value = state.answers[step.key] ?? "";
  input.addEventListener("input", (event) => {
    state.answers[step.key] = event.target.value;
    const fillKey = AUTO_FILL_PAIRS[step.key];
    if (fillKey) state.answers[fillKey] = event.target.value;
    syncDerivedFirstSecondFloorAreas(step.key);
  });
  return input;
}

function makeField(labelText, name, value, extra = {}) {
  const wrapper = document.createElement("div");
  wrapper.className = "calc-form-row";
  const label = document.createElement("label");
  label.textContent = labelText;
  const input = document.createElement("input");
  input.className = "calc-input";
  input.type = "number";
  input.min = String(extra.min ?? 0);
  input.step = String(extra.step ?? 1);
  input.placeholder = extra.placeholder ?? "";
  input.value = value ?? "";
  input.addEventListener("input", (event) => {
    state.answers[name] = event.target.value;
    syncDerivedFirstSecondFloorAreas(name);
  });
  wrapper.appendChild(label);
  wrapper.appendChild(input);
  return wrapper;
}

function makeBinaryChoiceField(labelText, name) {
  const wrapper = document.createElement("div");
  wrapper.className = "calc-form-row";

  const label = document.createElement("label");
  label.textContent = labelText;
  wrapper.appendChild(label);

  const buttons = document.createElement("div");
  buttons.className = "choice-list";

  [
    { value: "yes", label: "예", description: "해당됨" },
    { value: "no", label: "아니오", description: "해당되지 않음" },
  ].forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button";
    if (state.answers[name] === option.value) button.classList.add("selected");
    button.innerHTML = `<strong>${option.label}</strong><span>${option.description}</span>`;
    button.addEventListener("click", () => {
      state.answers[name] = option.value;
      renderCurrentStep();
    });
    buttons.appendChild(button);
  });

  wrapper.appendChild(buttons);
  return wrapper;
}

function makeToggleChoiceButton({ label, description, selected, onClick }) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "choice-button";
  if (selected) button.classList.add("selected");
  button.innerHTML = `<strong>${label}</strong>${description ? `<span>${description}</span>` : ""}`;
  button.addEventListener("click", onClick);
  return button;
}

function appendBasementCompound(wrapper, floorsKey, areaKey, totalAreaKey, aboveKey) {
  const floorsField = makeField("지하층수", floorsKey, state.answers[floorsKey], { min: 0, step: 1, placeholder: "없으면 0" });
  const areaField = makeField("지하층 바닥면적 합계(㎡)", areaKey, state.answers[areaKey], { min: 0, step: 0.1, placeholder: "없으면 0" });
  wrapper.appendChild(floorsField);
  wrapper.appendChild(areaField);

  const floorsInput = floorsField.querySelector("input");
  const areaInput = areaField.querySelector("input");

  floorsInput.addEventListener("input", () => {
    const basement = Number(state.answers[floorsKey]);
    const totalArea = Number(state.answers[totalAreaKey]);
    const above = Number(state.answers[aboveKey]);
    if (!Number.isFinite(basement) || basement < 1) return;
    if (!Number.isFinite(totalArea) || totalArea <= 0) return;
    if (!Number.isFinite(above) || above < 0) return;
    const totalFloors = above + basement;
    if (totalFloors <= 0) return;
    const computed = Math.round((totalArea / totalFloors) * basement * 10) / 10;
    state.answers[areaKey] = String(computed);
    areaInput.value = String(computed);
  });
}

function renderCompoundStep(step) {
  const wrapper = document.createElement("div");
  wrapper.className = "choice-list";

  if (step.key === "detailSet") {
    [
      makeField("건물 내부 차고·주차장 바닥면적(㎡)", "indoorParkingArea", state.answers.indoorParkingArea, { min: 0, step: 0.1, placeholder: "없으면 0" }),
      makeField("차고·주차용 건축물 연면적(㎡)", "parkingStructureArea", state.answers.parkingStructureArea, { min: 0, step: 0.1, placeholder: "없으면 0" }),
      makeField("기계식 주차 가능 대수", "mechanicalParkingCapacity", state.answers.mechanicalParkingCapacity, { min: 0, step: 1, placeholder: "없으면 0" }),
      makeField("전기실·발전실·변전실·전산실 최대 바닥면적(㎡)", "electricalRoomArea", state.answers.electricalRoomArea, { min: 0, step: 0.1, placeholder: "없으면 0" }),
    ].forEach((field) => wrapper.appendChild(field));
    return wrapper;
  }

  if (step.key === "lodgingDetailSet") {
    [
      makeField("건물 내부 차고·주차장 바닥면적(㎡)", "lodgingIndoorParkingArea", state.answers.lodgingIndoorParkingArea, { min: 0, step: 0.1, placeholder: "없으면 0" }),
      makeField("차고·주차용 건축물 연면적(㎡)", "lodgingParkingStructureArea", state.answers.lodgingParkingStructureArea, { min: 0, step: 0.1, placeholder: "없으면 0" }),
      makeField("기계식 주차 가능 대수", "lodgingMechanicalParkingCapacity", state.answers.lodgingMechanicalParkingCapacity, { min: 0, step: 1, placeholder: "없으면 0" }),
      makeField("전기실·발전실·변전실·전산실 최대 바닥면적(㎡)", "lodgingElectricalRoomArea", state.answers.lodgingElectricalRoomArea, { min: 0, step: 0.1, placeholder: "없으면 0" }),
    ].forEach((field) => wrapper.appendChild(field));
    return wrapper;
  }

  if (step.key === "elderlyDetailSet") {
    [
      makeField("건물 내부 차고·주차장 바닥면적(㎡)", "elderlyIndoorParkingArea", state.answers.elderlyIndoorParkingArea, { min: 0, step: 0.1, placeholder: "없으면 0" }),
      makeField("차고·주차용 건축물 연면적(㎡)", "elderlyParkingStructureArea", state.answers.elderlyParkingStructureArea, { min: 0, step: 0.1, placeholder: "없으면 0" }),
      makeField("기계식 주차 가능 대수", "elderlyMechanicalParkingCapacity", state.answers.elderlyMechanicalParkingCapacity, { min: 0, step: 1, placeholder: "없으면 0" }),
      makeField("전기실·발전실·변전실·전산실 최대 바닥면적(㎡)", "elderlyElectricalRoomArea", state.answers.elderlyElectricalRoomArea, { min: 0, step: 0.1, placeholder: "없으면 0" }),
    ].forEach((field) => wrapper.appendChild(field));
    return wrapper;
  }

  if (step.key === "medicalDetailSet") {
    [
      makeField("건물 내부 차고·주차장 바닥면적(㎡)", "medicalIndoorParkingArea", state.answers.medicalIndoorParkingArea, { min: 0, step: 0.1, placeholder: "없으면 0" }),
      makeField("차고·주차용 건축물 연면적(㎡)", "medicalParkingStructureArea", state.answers.medicalParkingStructureArea, { min: 0, step: 0.1, placeholder: "없으면 0" }),
      makeField("기계식 주차 가능 대수", "medicalMechanicalParkingCapacity", state.answers.medicalMechanicalParkingCapacity, { min: 0, step: 1, placeholder: "없으면 0" }),
      makeField("전기실·발전실·변전실·전산실 최대 바닥면적(㎡)", "medicalElectricalRoomArea", state.answers.medicalElectricalRoomArea, { min: 0, step: 0.1, placeholder: "없으면 0" }),
    ].forEach((field) => wrapper.appendChild(field));
    return wrapper;
  }

  if (step.key === "basementFloors") {
    appendBasementCompound(wrapper, "basementFloors", "basementAreaSum", "totalArea", "aboveGroundFloors");
    return wrapper;
  }

  if (step.key === "lodgingBasementFloors") {
    appendBasementCompound(wrapper, "lodgingBasementFloors", "lodgingBasementAreaSum", "lodgingTotalArea", "lodgingAboveGroundFloors");
    return wrapper;
  }

  if (step.key === "elderlyBasementFloors") {
    appendBasementCompound(wrapper, "elderlyBasementFloors", "elderlyBasementAreaSum", "elderlyTotalArea", "elderlyAboveGroundFloors");
    return wrapper;
  }

  if (step.key === "medicalBasementFloors") {
    appendBasementCompound(wrapper, "medicalBasementFloors", "medicalBasementAreaSum", "medicalTotalArea", "medicalAboveGroundFloors");
    return wrapper;
  }

  if (step.key === "hasWindowlessFloor") {
    wrapper.appendChild(makeBinaryChoiceField("무창층이 있나요?", "hasWindowlessFloor"));
    if (state.answers.hasWindowlessFloor === "yes") {
      wrapper.appendChild(makeField("무창층 바닥면적(㎡)", "windowlessArea", state.answers.windowlessArea, { min: 0, step: 0.1, placeholder: "예: 200" }));
    }
    return wrapper;
  }

  if (step.key === "lodgingHasWindowlessFloor") {
    wrapper.appendChild(makeBinaryChoiceField("무창층이 있나요?", "lodgingHasWindowlessFloor"));
    if (state.answers.lodgingHasWindowlessFloor === "yes") {
      wrapper.appendChild(makeField("무창층 바닥면적(㎡)", "lodgingWindowlessArea", state.answers.lodgingWindowlessArea, { min: 0, step: 0.1, placeholder: "예: 200" }));
    }
    return wrapper;
  }

  if (step.key === "elderlyHasWindowlessFloor") {
    wrapper.appendChild(makeBinaryChoiceField("무창층이 있나요?", "elderlyHasWindowlessFloor"));
    if (state.answers.elderlyHasWindowlessFloor === "yes") {
      wrapper.appendChild(makeField("무창층 바닥면적(㎡)", "elderlyWindowlessArea", state.answers.elderlyWindowlessArea, { min: 0, step: 0.1, placeholder: "예: 200" }));
    }
    return wrapper;
  }

  if (step.key === "medicalHasWindowlessFloor") {
    wrapper.appendChild(makeBinaryChoiceField("무창층이 있나요?", "medicalHasWindowlessFloor"));
    if (state.answers.medicalHasWindowlessFloor === "yes") {
      wrapper.appendChild(makeField("무창층 바닥면적(㎡)", "medicalWindowlessArea", state.answers.medicalWindowlessArea, { min: 0, step: 0.1, placeholder: "예: 200" }));
    }
    return wrapper;
  }

  if (step.key === "multiuseSimpleSprinklerCheck") {
    const selectedKeys = [
      "multiuseInBasement",
      "multiuseIsSealed",
      "multiuseIsPostpartum",
      "multiuseIsGosiwon",
      "multiuseIsGunRange",
    ];

    const toggleOption = (name) => {
      const wasSelected = state.answers[name] === "yes";
      selectedKeys.forEach((k) => { state.answers[k] = "no"; });
      if (!wasSelected) state.answers[name] = "yes";
      renderCurrentStep();
    };

    const optionList = document.createElement("div");
    optionList.className = "choice-list";

    [
      { name: "multiuseInBasement", label: "지하층에 설치돼 있음", description: "해당되면 선택" },
      { name: "multiuseIsSealed", label: "밀폐구조의 영업장", description: "해당되면 선택" },
      { name: "multiuseIsPostpartum", label: "산후조리업", description: "해당되면 선택" },
      { name: "multiuseIsGosiwon", label: "고시원", description: "해당되면 선택" },
      { name: "multiuseIsGunRange", label: "권총사격장", description: "해당되면 선택" },
    ].forEach((option) => {
      optionList.appendChild(makeToggleChoiceButton({
        label: option.label,
        description: option.description,
        selected: state.answers[option.name] === "yes",
        onClick: () => toggleOption(option.name),
      }));
    });

    const noneSelected = selectedKeys.every((name) => state.answers[name] !== "yes");
    optionList.appendChild(makeToggleChoiceButton({
      label: "해당사항 없음",
      description: "선택한 항목이 없으면 선택",
      selected: noneSelected,
      onClick: () => {
        selectedKeys.forEach((name) => {
          state.answers[name] = "no";
        });
        renderCurrentStep();
      },
    }));

    wrapper.appendChild(optionList);
  }

  if (step.key === "lodgingMultiuseSimpleSprinklerCheck") {
    const selectedKeys = [
      "lodgingMultiuseInBasement",
      "lodgingMultiuseIsSealed",
      "lodgingMultiuseIsPostpartum",
      "lodgingMultiuseIsGosiwon",
      "lodgingMultiuseIsGunRange",
    ];

    const toggleOption = (name) => {
      state.answers[name] = state.answers[name] === "yes" ? "no" : "yes";
      renderCurrentStep();
    };

    const optionList = document.createElement("div");
    optionList.className = "choice-list";

    [
      { name: "lodgingMultiuseInBasement", label: "지하층에 설치돼 있음", description: "해당되면 선택" },
      { name: "lodgingMultiuseIsSealed", label: "밀폐구조의 영업장", description: "해당되면 선택" },
      { name: "lodgingMultiuseIsPostpartum", label: "산후조리업", description: "해당되면 선택" },
      { name: "lodgingMultiuseIsGosiwon", label: "고시원", description: "해당되면 선택" },
      { name: "lodgingMultiuseIsGunRange", label: "권총사격장", description: "해당되면 선택" },
    ].forEach((option) => {
      optionList.appendChild(makeToggleChoiceButton({
        label: option.label,
        description: option.description,
        selected: state.answers[option.name] === "yes",
        onClick: () => toggleOption(option.name),
      }));
    });

    const noneSelected = selectedKeys.every((name) => state.answers[name] !== "yes");
    optionList.appendChild(makeToggleChoiceButton({
      label: "해당사항 없음",
      description: "선택한 항목이 없으면 선택",
      selected: noneSelected,
      onClick: () => {
        selectedKeys.forEach((name) => {
          state.answers[name] = "no";
        });
        renderCurrentStep();
      },
    }));

    wrapper.appendChild(optionList);
  }

  return wrapper;
}

function renderCurrentStep() {
  const activeSteps = getActiveSteps();
  const step = activeSteps[state.currentStep];
  questionElements.kicker.textContent = `QUESTION ${state.currentStep + 1}`;
  questionElements.title.textContent = step.title;
  questionElements.help.textContent = step.help;
  questionElements.input.innerHTML = "";

  let node;
  if (step.type === "choice") node = renderChoiceStep(step);
  else if (step.type === "compound") node = renderCompoundStep(step);
  else node = renderNumberStep(step);

  questionElements.input.appendChild(node);
  document.getElementById("prev-step").disabled = false;
  if (state.currentStep === activeSteps.length - 1) {
    document.getElementById("next-step").textContent = explorerRuntime.mode === "year" ? "결과 준비중" : "결과 보기";
  } else {
    document.getElementById("next-step").textContent = "다음";
  }
  updateProgress();
}

function currentStepIsValid() {
  const step = getActiveSteps()[state.currentStep];
  if (step.type === "number") {
    const value = state.answers[step.key];
    return value !== "" && !Number.isNaN(Number(value));
  }
  return true;
}

function normalizeAnswers() {
  const basementAverageArea = toNumber(state.answers.basementFloors) > 0
    ? toNumber(state.answers.basementAreaSum) / toNumber(state.answers.basementFloors)
    : 0;
  const windowlessArea = state.answers.hasWindowlessFloor === "yes" ? toNumber(state.answers.windowlessArea) : 0;
  return {
    occupancyType: state.answers.occupancyType,
    facilitySubtype: state.answers.facilitySubtype,
    postpartumAreaRange: state.answers.postpartumAreaRange,
    isThirdClassNeighborhood: state.answers.isThirdClassNeighborhood,
    permitBefore1992: state.answers.permitBefore1992,
    pre1992PermitRange: state.answers.pre1992PermitRange,
    thirdClassDetailUse: state.answers.thirdClassDetailUse,
    totalArea: toNumber(state.answers.totalArea),
    neighborhoodArea: toNumber(state.answers.neighborhoodArea),
    aboveGroundFloors: toNumber(state.answers.aboveGroundFloors),
    basementFloors: toNumber(state.answers.basementFloors),
    totalFloors: getTotalFloors(),
    firstSecondFloorArea: toNumber(state.answers.firstSecondFloorArea),
    basementAreaSum: toNumber(state.answers.basementAreaSum),
    hasLargeTargetFloor: toBool(state.answers.hasLargeTargetFloor),
    hasBasement150Plus: toNumber(state.answers.basementFloors) > 0 && basementAverageArea >= 150,
    hasBasement450Plus: toNumber(state.answers.basementFloors) > 0 && basementAverageArea >= 450,
    hasWindowless150Plus: windowlessArea >= 150,
    hasWindowless450Plus: windowlessArea >= 450,
    smokeControlArea: toNumber(state.answers.basementAreaSum) + windowlessArea,
    indoorParkingArea: toNumber(state.answers.indoorParkingArea),
    parkingStructureArea: toNumber(state.answers.parkingStructureArea),
    mechanicalParkingCapacity: toNumber(state.answers.mechanicalParkingCapacity),
    electricalRoomArea: toNumber(state.answers.electricalRoomArea),
    has24HourStaff: toBool(state.answers.has24HourStaff),
    hasMultiuseBusiness: toBool(state.answers.hasMultiuseBusiness),
    multiuseInBasement: toBool(state.answers.multiuseInBasement),
    multiuseIsSealed: toBool(state.answers.multiuseIsSealed),
    multiuseIsPostpartum: toBool(state.answers.multiuseIsPostpartum),
    multiuseIsGosiwon: toBool(state.answers.multiuseIsGosiwon),
    multiuseIsGunRange: toBool(state.answers.multiuseIsGunRange),
    multiuseOnSecondToTenthFloor: toBool(state.answers.multiuseOnSecondToTenthFloor) && state.answers.multiuseInBasement !== "yes" && state.answers.multiuseOnGroundOrRefugeFloor !== "yes",
    multiuseOnGroundOrRefugeFloor: toBool(state.answers.multiuseOnGroundOrRefugeFloor),
    multiuseUsesAV: toBool(state.answers.multiuseUsesAV),
    multiuseHasGasFacility: toBool(state.answers.multiuseHasGasFacility),
    multiuseHasRooms: toBool(state.answers.multiuseHasRooms),
    multiuseHasEvacuationRoute: toBool(state.answers.multiuseHasEvacuationRoute),
    // 숙박시설
    lodgingArea: toNumber(state.answers.lodgingArea),
    lodgingTotalArea: toNumber(state.answers.lodgingTotalArea),
    lodgingAboveGroundFloors: toNumber(state.answers.lodgingAboveGroundFloors),
    lodgingBasementFloors: toNumber(state.answers.lodgingBasementFloors),
    lodgingBasementAreaSum: toNumber(state.answers.lodgingBasementAreaSum),
    lodgingTotalFloors: toNumber(state.answers.lodgingAboveGroundFloors) + toNumber(state.answers.lodgingBasementFloors),
    lodgingFirstSecondFloorArea: toNumber(state.answers.lodgingFirstSecondFloorArea),
    lodgingWindowlessArea: state.answers.lodgingHasWindowlessFloor === "yes" ? toNumber(state.answers.lodgingWindowlessArea) : 0,
    lodgingHasLargeFloorFor1000: toBool(state.answers.lodgingHasLargeFloorFor1000),
    lodgingHasGasFacility: toBool(state.answers.lodgingHasGasFacility),
    lodgingIsTouristHotel: toBool(state.answers.lodgingIsTouristHotel),
    lodgingIndoorParkingArea: toNumber(state.answers.lodgingIndoorParkingArea),
    lodgingParkingStructureArea: toNumber(state.answers.lodgingParkingStructureArea),
    lodgingMechanicalParkingCapacity: toNumber(state.answers.lodgingMechanicalParkingCapacity),
    lodgingElectricalRoomArea: toNumber(state.answers.lodgingElectricalRoomArea),
    lodgingHasMultiuseBusiness: toBool(state.answers.lodgingHasMultiuseBusiness),
    lodgingMultiuseInBasement: toBool(state.answers.lodgingMultiuseInBasement),
    lodgingMultiuseIsSealed: toBool(state.answers.lodgingMultiuseIsSealed),
    lodgingMultiuseIsPostpartum: toBool(state.answers.lodgingMultiuseIsPostpartum),
    lodgingMultiuseIsGosiwon: toBool(state.answers.lodgingMultiuseIsGosiwon),
    lodgingMultiuseIsGunRange: toBool(state.answers.lodgingMultiuseIsGunRange),
    lodgingMultiuseOnSecondToTenthFloor: toBool(state.answers.lodgingMultiuseOnSecondToTenthFloor) && state.answers.lodgingMultiuseInBasement !== "yes",
    lodgingMultiuseOnGroundOrRefugeFloor: toBool(state.answers.lodgingMultiuseOnGroundOrRefugeFloor),
    lodgingMultiuseUsesAV: toBool(state.answers.lodgingMultiuseUsesAV),
    lodgingMultiuseHasGasFacility: toBool(state.answers.lodgingMultiuseHasGasFacility),
    lodgingMultiuseHasRooms: toBool(state.answers.lodgingMultiuseHasRooms),
    lodgingMultiuseHasEvacuationRoute: toBool(state.answers.lodgingMultiuseHasEvacuationRoute),
    // 노유자시설
    elderlySubtype: state.answers.elderlySubtype,
    elderlyTotalArea: toNumber(state.answers.elderlyTotalArea),
    elderlyArea: toNumber(state.answers.elderlyArea),
    elderlyAboveGroundFloors: toNumber(state.answers.elderlyAboveGroundFloors),
    elderlyBasementFloors: toNumber(state.answers.elderlyBasementFloors),
    elderlyBasementAreaSum: toNumber(state.answers.elderlyBasementAreaSum),
    elderlyTotalFloors: toNumber(state.answers.elderlyAboveGroundFloors) + toNumber(state.answers.elderlyBasementFloors),
    elderlyFirstSecondFloorArea: toNumber(state.answers.elderlyFirstSecondFloorArea),
    elderlyWindowlessArea: state.answers.elderlyHasWindowlessFloor === "yes" ? toNumber(state.answers.elderlyWindowlessArea) : 0,
    get elderlyHasLargeTargetFloor() {
      const tf = toNumber(state.answers.elderlyAboveGroundFloors) + toNumber(state.answers.elderlyBasementFloors);
      const avg = tf > 0 ? toNumber(state.answers.elderlyTotalArea) / tf : 0;
      return avg >= 300;
    },
    get elderlyFloorAvgArea() {
      const tf = toNumber(state.answers.elderlyAboveGroundFloors) + toNumber(state.answers.elderlyBasementFloors);
      return tf > 0 ? toNumber(state.answers.elderlyTotalArea) / tf : 0;
    },
    elderlyHasGrillWindow: toBool(state.answers.elderlyHasGrillWindow),
    elderlyHasFloor500Plus: toBool(state.answers.elderlyHasFloor500Plus),
    elderlyHas24HourStaff: toBool(state.answers.elderlyHas24HourStaff),
    elderlyHasGasFacility: toBool(state.answers.elderlyHasGasFacility),
    elderlyIndoorParkingArea: toNumber(state.answers.elderlyIndoorParkingArea),
    elderlyParkingStructureArea: toNumber(state.answers.elderlyParkingStructureArea),
    elderlyMechanicalParkingCapacity: toNumber(state.answers.elderlyMechanicalParkingCapacity),
    elderlyElectricalRoomArea: toNumber(state.answers.elderlyElectricalRoomArea),
    // 의료시설
    medicalSubtype: state.answers.medicalSubtype,
    medicalTotalArea: toNumber(state.answers.medicalTotalArea),
    medicalArea: toNumber(state.answers.medicalArea),
    medicalAboveGroundFloors: toNumber(state.answers.medicalAboveGroundFloors),
    medicalBasementFloors: toNumber(state.answers.medicalBasementFloors),
    medicalBasementAreaSum: toNumber(state.answers.medicalBasementAreaSum),
    medicalTotalFloors: toNumber(state.answers.medicalAboveGroundFloors) + toNumber(state.answers.medicalBasementFloors),
    medicalFirstSecondFloorArea: toNumber(state.answers.medicalFirstSecondFloorArea),
    medicalWindowlessArea: state.answers.medicalHasWindowlessFloor === "yes" ? toNumber(state.answers.medicalWindowlessArea) : 0,
    medicalHasGrillWindow: toBool(state.answers.medicalHasGrillWindow),
    medicalHasGasFacility: toBool(state.answers.medicalHasGasFacility),
    medicalIndoorParkingArea: toNumber(state.answers.medicalIndoorParkingArea),
    medicalParkingStructureArea: toNumber(state.answers.medicalParkingStructureArea),
    medicalMechanicalParkingCapacity: toNumber(state.answers.medicalMechanicalParkingCapacity),
    medicalElectricalRoomArea: toNumber(state.answers.medicalElectricalRoomArea),
  };
}

function isClinicWithInpatient(input) {
  return input.facilitySubtype === "clinicInpatient";
}

function isPostpartum(input) {
  return input.facilitySubtype === "postpartum";
}

function isPostpartumUnder600(input) {
  return isPostpartum(input) && input.postpartumAreaRange === "under600";
}

function isPostpartum600Plus(input) {
  return isPostpartum(input) && input.postpartumAreaRange === "600plus";
}

function makeResult(category, name, description, status, reason, basis) {
  return { category, name, description, status, reason, basis };
}

function isThirdClassMarketOrBathhouse(input) {
  return input.thirdClassDetailUse === "marketBathhouse";
}

function getThirdClassPeriodLabel(value) {
  const labels = {
    "1982-08-07_to_1984-06-30": "1982년 8월 7일 ~ 1984년 6월 30일",
    "1984-06-30_to_1990-06-29": "1984년 6월 30일 ~ 1990년 6월 29일",
    "1990-06-29_to_1990-12-01": "1990년 6월 29일 ~ 1990년 12월 1일",
    "1990-12-01_to_1991-01-08": "1990년 12월 1일 ~ 1992년 7월 28일",
  };
  return labels[value] || value;
}

function getThirdClassDetailLabel(value) {
  const labels = {
    general: "일반근린생활시설",
    marketBathhouse: "시장 또는 공중목욕장",
  };
  return labels[value] || value;
}

function evaluateThirdClassPre1992(input) {
  const results = [];
  const isSpecialUse = isThirdClassMarketOrBathhouse(input);
  const totalAreaThreshold = isSpecialUse ? 1000 : 600;
  const floorAreaThreshold = isSpecialUse ? 600 : 300;
  const period = input.pre1992PermitRange;
  const firstPeriod = period === "1982-08-07_to_1984-06-30";
  const waterSprayThreshold = ["1982-08-07_to_1984-06-30", "1984-06-30_to_1990-06-29"].includes(period) ? 700 : 150;
  const standpipeRequired = input.aboveGroundFloors >= 7 || (input.aboveGroundFloors >= 5 && input.totalArea >= 6000);

  results.push(makeResult(categories.extinguishing, "소화기", "", input.totalArea >= 150 ? "required" : "notRequired", input.totalArea >= 150 ? "연면적이 150㎡ 이상이므로 설치 대상입니다." : "연면적이 150㎡ 미만이므로 설치 대상이 아닙니다.", ""));

  let autoDetectionStatus = "notRequired";
  let autoDetectionReason = "현재 입력 기준으로는 설치 대상이 아닙니다.";
  if (input.totalArea >= totalAreaThreshold) {
    autoDetectionStatus = "required";
    autoDetectionReason = firstPeriod
      ? `연면적이 ${totalAreaThreshold}㎡ 이상이므로 해당층에만 설치 대상으로 봅니다.`
      : `연면적이 ${totalAreaThreshold}㎡ 이상이므로 전층 설치 대상으로 봅니다.`;
  } else if (input.basementFloors > 0 && input.basementAreaSum >= floorAreaThreshold) {
    autoDetectionStatus = "required";
    autoDetectionReason = firstPeriod
      ? `지하층 바닥면적 합계가 ${floorAreaThreshold}㎡ 이상이므로 해당층 설치 대상으로 봅니다.`
      : `지하층 바닥면적 합계가 ${floorAreaThreshold}㎡ 이상이므로 전층 설치 대상으로 봅니다.`;
  } else if (input.aboveGroundFloors >= 3) {
    autoDetectionStatus = "review";
    autoDetectionReason = `${firstPeriod ? "해당층" : "전층"} 설치 기준에는 무창층 또는 3층 이상 층의 바닥면적 검토가 포함되지만, 현재 입력값만으로는 해당 층 면적을 확정할 수 없어 추가 확인이 필요합니다.`;
  }
  results.push(makeResult(categories.alarm, "자동화재탐지설비", "", autoDetectionStatus, autoDetectionReason, ""));

  results.push(makeResult(categories.evacuation, "유도등(피난구유도등, 통로유도등, 유도표지)", "", "required", "모든 특정소방대상물에 설치합니다.", ""));

  results.push(makeResult(categories.fireSupport, "연결살수설비", "", input.basementAreaSum >= waterSprayThreshold ? "required" : "notRequired", input.basementAreaSum >= waterSprayThreshold ? `지하층 바닥면적 합계가 ${waterSprayThreshold}㎡ 이상이므로 설치 대상입니다.` : `지하층 바닥면적 합계가 ${waterSprayThreshold}㎡ 미만이므로 설치 대상이 아닙니다.`, ""));
  results.push(makeResult(categories.fireSupport, "연결송수관설비", "", standpipeRequired ? "required" : "notRequired", standpipeRequired ? (input.aboveGroundFloors >= 7 ? "지하층을 제외한 층수가 7층 이상이므로 설치 대상입니다." : "지하층을 제외한 층수가 5층 이상이고, 연면적이 6,000㎡ 이상이므로 설치 대상입니다.") : "기준은 '지하층을 제외한 층수가 7층 이상'이거나 '지하층을 제외한 층수가 5층 이상이면서 연면적이 6,000㎡ 이상'인 경우입니다. 현재 입력값은 두 조건에 모두 해당하지 않아 설치 대상이 아닙니다.", ""));

  return results;
}

function evaluateNeighborhoodFacility(input) {
  const results = [];
  const sprinklerRequired = input.aboveGroundFloors >= 6 || isPostpartum600Plus(input);
  const parkingWaterSprayCondition = input.parkingStructureArea >= 800 || input.indoorParkingArea >= 200 || input.mechanicalParkingCapacity >= 20;
  const waterSprayRequired = parkingWaterSprayCondition || input.electricalRoomArea >= 300;
  const simpleSprinklerRequiredByRule = input.neighborhoodArea >= 1000 || isClinicWithInpatient(input) || isPostpartumUnder600(input);
  const simpleSprinklerRequired = simpleSprinklerRequiredByRule && !sprinklerRequired;

  results.push(makeResult(categories.extinguishing, "소화기구", "", input.totalArea >= 33 ? "required" : "notRequired", input.totalArea >= 33 ? "연면적이 33㎡ 이상입니다." : "연면적이 33㎡ 미만입니다.", ""));
  results.push(makeResult(categories.extinguishing, "옥내소화전설비", "", input.totalArea >= 1500 || input.hasLargeTargetFloor ? "required" : "notRequired", input.totalArea >= 1500 ? "연면적이 1,500㎡ 이상입니다." : input.hasLargeTargetFloor ? "지하층, 무창층 또는 4층 이상 층 중 300㎡ 이상인 층이 있습니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  results.push(makeResult(categories.extinguishing, "스프링클러설비", "", sprinklerRequired ? "required" : "notRequired", isPostpartum600Plus(input) ? "조산원·산후조리원이고 바닥면적이 600㎡ 이상입니다." : input.aboveGroundFloors >= 6 ? "지상층수가 6층 이상입니다." : "지상층수가 6층 미만입니다.", ""));
  results.push(makeResult(categories.extinguishing, "간이스프링클러설비", "", simpleSprinklerRequired ? "required" : "notRequired", sprinklerRequired ? "스프링클러설비가 전층 설치 대상이므로 간이스프링클러설비는 제외 대상으로 봅니다." : input.neighborhoodArea >= 1000 ? "근린생활시설 사용면적이 1,000㎡ 이상입니다." : isClinicWithInpatient(input) ? "입원실 있는 의원급입니다." : isPostpartumUnder600(input) ? "조산원·산후조리원이고 바닥면적이 600㎡ 미만입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  results.push(makeResult(categories.extinguishing, "물분무등소화설비", "", waterSprayRequired ? "required" : "notRequired", buildWaterSprayReason(input.parkingStructureArea, input.indoorParkingArea, input.mechanicalParkingCapacity, input.electricalRoomArea), ""));
  results.push(makeResult(categories.extinguishing, "옥외소화전설비", "", input.firstSecondFloorArea >= 9000 ? "required" : "notRequired", input.firstSecondFloorArea >= 9000 ? "지상 1층과 2층의 바닥면적 합계가 9,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  const emergencyAlarm = input.totalArea >= 400 || input.hasBasement150Plus || input.hasWindowless150Plus;
  const autoDetection = (input.facilitySubtype === "bathhouse" && input.totalArea >= 1000) || (input.facilitySubtype !== "bathhouse" && input.totalArea >= 600) || isPostpartum(input);
  results.push(makeResult(categories.alarm, "비상경보설비", "", emergencyAlarm ? "required" : "notRequired", input.totalArea >= 400 ? "연면적이 400㎡ 이상입니다." : input.hasBasement150Plus ? "지하층 평균 면적이 150㎡ 이상입니다." : input.hasWindowless150Plus ? "무창층 면적이 150㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  results.push(makeResult(categories.alarm, "자동화재탐지설비", "", autoDetection ? "required" : "notRequired", input.facilitySubtype === "bathhouse" && input.totalArea >= 1000 ? "목욕장이고 연면적이 1,000㎡ 이상입니다." : input.facilitySubtype !== "bathhouse" && input.totalArea >= 600 ? "일반 근린생활시설이며 연면적이 600㎡ 이상입니다." : isPostpartumUnder600(input) ? "조산원·산후조리원이고 바닥면적이 600㎡ 미만입니다." : isPostpartum600Plus(input) ? "조산원·산후조리원이고 바닥면적이 600㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  results.push(makeResult(categories.alarm, "비상방송설비", "", input.totalArea >= 3500 || input.aboveGroundFloors >= 11 || input.basementFloors >= 3 ? "required" : "notRequired", input.totalArea >= 3500 ? "연면적이 3,500㎡ 이상입니다." : input.aboveGroundFloors >= 11 ? "지상층수가 11층 이상입니다." : input.basementFloors >= 3 ? "지하층수가 3층 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  const autoDispatchTarget = isClinicWithInpatient(input) || isPostpartum(input);
  results.push(makeResult(categories.alarm, "자동화재속보설비", "", autoDispatchTarget ? (input.has24HourStaff ? "review" : "required") : "notRequired", autoDispatchTarget ? input.has24HourStaff ? "24시간 상주 근무자가 있어 면제 검토가 필요합니다." : isPostpartumUnder600(input) ? "조산원·산후조리원이고 바닥면적이 600㎡ 미만입니다." : isPostpartum600Plus(input) ? "조산원·산후조리원이고 바닥면적이 600㎡ 이상입니다." : "입원실 있는 의원급에 해당합니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  results.push(makeResult(categories.alarm, "시각경보기", "", "required", "근린생활시설 용도이므로 설치해야 합니다.", ""));

  results.push(makeResult(categories.evacuation, "피난기구", "", input.aboveGroundFloors >= 3 ? "required" : "notRequired", input.aboveGroundFloors >= 3 ? "건축물 3층 이상 10층 이하의 층에 설치합니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "required", "기본적으로 건물 전체에 설치합니다.", ""));
  results.push(makeResult(categories.evacuation, "비상조명등", "", (input.totalFloors >= 5 && input.totalArea >= 3000) || input.hasBasement450Plus || input.hasWindowless450Plus ? "required" : "notRequired", input.totalFloors >= 5 && input.totalArea >= 3000 ? "전체 층수가 5층 이상이고 연면적이 3,000㎡ 이상입니다." : input.hasBasement450Plus ? "지하층 평균 면적이 450㎡ 이상입니다." : input.hasWindowless450Plus ? "무창층 면적이 450㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  results.push(makeResult(categories.waterSupply, "상수도소화용수설비", "", input.totalArea >= 5000 ? "required" : "notRequired", input.totalArea >= 5000 ? "연면적이 5,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  const smokeReqNeighborhood = input.smokeControlArea >= 1000 || input.aboveGroundFloors >= 11;
  results.push(makeResult(categories.fireSupport, "제연설비", "", smokeReqNeighborhood ? "required" : "notRequired", input.smokeControlArea >= 1000 ? "지하층과 무창층 면적 합계가 1,000㎡ 이상입니다." : input.aboveGroundFloors >= 11 ? "지상 11층 이상으로 특별피난계단에 제연설비를 설치해야 합니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  results.push(makeResult(categories.fireSupport, "연결송수관설비", "", (input.totalFloors >= 5 && input.totalArea >= 6000) || input.totalFloors >= 7 || (input.basementFloors >= 3 && input.basementAreaSum >= 1000) ? "required" : "notRequired", input.totalFloors >= 5 && input.totalArea >= 6000 ? "전체 층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다." : input.totalFloors >= 7 ? "전체 층수가 7층 이상입니다." : input.basementFloors >= 3 && input.basementAreaSum >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  results.push(makeResult(categories.fireSupport, "연결살수설비", "", input.basementAreaSum >= 150 ? "required" : "notRequired", input.basementAreaSum >= 150 ? "지하층 바닥면적 합계가 150㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  results.push(makeResult(categories.fireSupport, "비상콘센트설비", "", input.aboveGroundFloors >= 11 || (input.basementFloors >= 3 && input.basementAreaSum >= 1000) ? "required" : "notRequired", input.aboveGroundFloors >= 11 ? "지상층수가 11층 이상입니다." : input.basementFloors >= 3 && input.basementAreaSum >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  results.push(makeResult(categories.fireSupport, "무선통신보조설비", "", input.aboveGroundFloors >= 30 || input.basementAreaSum >= 3000 || (input.basementFloors >= 3 && input.basementAreaSum >= 1000) ? "required" : "notRequired", input.aboveGroundFloors >= 30 ? "지상층수가 30층 이상입니다." : input.basementAreaSum >= 3000 ? "지하층 바닥면적 합계가 3,000㎡ 이상입니다." : input.basementFloors >= 3 && input.basementAreaSum >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  return results;
}

function evaluateLodgingFacility(input) {
  const results = [];
  const la = input.lodgingArea;
  const ta = input.lodgingTotalArea;
  const ag = input.lodgingAboveGroundFloors;
  const bf = input.lodgingBasementFloors;
  const ba = input.lodgingBasementAreaSum;
  const wl = input.lodgingWindowlessArea;
  const tf = input.lodgingTotalFloors;

  // 지하층 평균 바닥면적
  const basementAvg = bf > 0 ? ba / bf : 0;
  const hasBasement150Plus = bf > 0 && basementAvg >= 150;
  const hasBasement450Plus = bf > 0 && basementAvg >= 450;
  const hasBasement1000Plus = bf > 0 && basementAvg >= 1000;
  const hasWindowless150Plus = wl >= 150;
  const hasWindowless450Plus = wl >= 450;
  const hasWindowless1000Plus = wl >= 1000;

  // 스프링클러 전층 조건
  const sprinklerAllFloors = la >= 600 || ag >= 6;
  // 스프링클러 해당층 조건 (지하/무창/4층이상 중 1000㎡ 이상)
  const sprinklerTargetFloor = !sprinklerAllFloors && (input.lodgingHasLargeFloorFor1000 || hasBasement1000Plus || hasWindowless1000Plus);
  const sprinklerRequired = sprinklerAllFloors || sprinklerTargetFloor;

  // 간이스프링클러
  const simpleSprinklerRequired = !sprinklerRequired && la >= 300 && la < 600;

  // 물분무등소화설비
  const parkingWaterSprayCondition = input.lodgingParkingStructureArea >= 800 || input.lodgingIndoorParkingArea >= 200 || input.lodgingMechanicalParkingCapacity >= 20;
  const waterSprayRequired = parkingWaterSprayCondition || input.lodgingElectricalRoomArea >= 300;

  // 옥내소화전
  // 옥내소화전: 연면적 1500㎡ 이상이거나, 연면적/층수로 추산한 층평균이 300㎡ 이상이거나, 지하/무창 1000㎡ 이상
  const floorAvgArea = tf > 0 ? ta / tf : 0;
  const standpipeRequired = ta >= 1500 || floorAvgArea >= 300 || hasBasement1000Plus || hasWindowless1000Plus;

  // ── 소화설비 ──
  results.push(makeResult(categories.extinguishing, "소화기구", "", ta >= 33 ? "required" : "notRequired",
    ta >= 33 ? "연면적이 33㎡ 이상입니다." : "연면적이 33㎡ 미만입니다.", ""));

  results.push(makeResult(categories.extinguishing, "간이스프링클러설비", "", simpleSprinklerRequired ? "required" : "notRequired",
    sprinklerRequired ? "스프링클러설비 설치 대상이므로 간이스프링클러설비는 제외됩니다."
    : la >= 300 && la < 600 ? "숙박시설 사용 바닥면적이 300㎡ 이상 600㎡ 미만입니다."
    : la < 300 ? "숙박시설 사용 바닥면적이 300㎡ 미만입니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  results.push(makeResult(categories.extinguishing, "스프링클러설비", "",
    sprinklerRequired ? "required" : "notRequired",
    la >= 600 ? "숙박시설 사용 바닥면적이 600㎡ 이상이므로 전층 설치 대상입니다."
    : ag >= 6 ? "건물 전체 층수가 6층 이상이므로 전층 설치 대상입니다."
    : sprinklerTargetFloor ? "지하층, 무창층 또는 4층 이상 층 중 바닥면적 1,000㎡ 이상인 층이 있어 해당 층에 설치합니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  results.push(makeResult(categories.extinguishing, "옥내소화전설비", "",
    standpipeRequired ? "required" : "notRequired",
    ta >= 1500 ? "연면적이 1,500㎡ 이상입니다."
    : floorAvgArea >= 300 ? `연면적(${ta}㎡)을 전체 층수(${tf}층)로 나눈 층평균이 300㎡ 이상입니다.`
    : hasBasement1000Plus ? "지하층 평균 면적이 1,000㎡ 이상입니다."
    : hasWindowless1000Plus ? "무창층 면적이 1,000㎡ 이상입니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  results.push(makeResult(categories.extinguishing, "물분무등소화설비", "", waterSprayRequired ? "required" : "notRequired", buildWaterSprayReason(input.lodgingParkingStructureArea, input.lodgingIndoorParkingArea, input.lodgingMechanicalParkingCapacity, input.lodgingElectricalRoomArea), ""));

  // ── 경보설비 ──
  // 자동화재탐지설비: 숙박시설은 면적 무관 전층
  results.push(makeResult(categories.alarm, "자동화재탐지설비", "", "required",
    "숙박시설의 경우 면적과 관계없이 모든 층에 설치해야 합니다.", ""));

  // 시각경보기: 자동화재탐지설비 설치 대상이므로 함께
  results.push(makeResult(categories.alarm, "시각경보기", "", "required",
    "자동화재탐지설비를 설치해야 하는 숙박시설이므로 함께 설치해야 합니다.", ""));

  // 단독경보형감지기: 연면적 600㎡ 미만
  results.push(makeResult(categories.alarm, "단독경보형 감지기", "", ta < 600 ? "required" : "notRequired",
    ta < 600 ? "연면적 600㎡ 미만의 소규모 숙박시설입니다."
    : "연면적 600㎡ 이상이므로 설치 대상이 아닙니다.", ""));

  // 가스누설경보기
  results.push(makeResult(categories.alarm, "가스누설경보기", "", input.lodgingHasGasFacility ? "required" : "notRequired",
    input.lodgingHasGasFacility ? "가스시설이 설치된 숙박시설입니다."
    : "가스시설이 없어 설치 대상이 아닙니다.", ""));


  // 비상방송설비
  const broadcastRequired = ta >= 3500 || ag >= 11 || bf >= 3;
  results.push(makeResult(categories.alarm, "비상방송설비", "",
    broadcastRequired ? "required" : "notRequired",
    ta >= 3500 ? "연면적이 3,500㎡ 이상입니다."
    : ag >= 11 ? "지상층수가 11층 이상입니다."
    : bf >= 3 ? "지하층수가 3층 이상입니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // 비상경보설비
  const emergencyAlarm = ta >= 400 || hasBasement150Plus || hasWindowless150Plus;
  results.push(makeResult(categories.alarm, "비상경보설비", "",
    emergencyAlarm ? "required" : "notRequired",
    ta >= 400 ? "연면적이 400㎡ 이상입니다."
    : hasBasement150Plus ? "지하층 평균 면적이 150㎡ 이상입니다."
    : hasWindowless150Plus ? "무창층 면적이 150㎡ 이상입니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));


  // ── 피난구조설비 ──
  // 휴대용 비상조명등: 규모 무관 객실 내부
  results.push(makeResult(categories.evacuation, "휴대용 비상조명등", "", "required",
    "숙박시설은 규모에 관계없이 객실 내부에 설치해야 합니다. 단, 복도에 비상조명등이 설치된 경우 제외됩니다.", ""));

  // 피난기구(복도): 3층~10층
  results.push(makeResult(categories.evacuation, "피난기구(복도 등)", "",
    ag >= 3 ? "required" : "notRequired",
    ag >= 3 ? "지상 3층~10층에 완강기등의 피난기구를 설치해야 합니다. 양방향 피난이 가능한 경우 제외 가능합니다."
    : "3층 이상 층이 없어 설치 대상이 아닙니다.", ""));

  // 피난기구(객실 내 간이완강기): 3층 이상 객실
  results.push(makeResult(categories.evacuation, "간이완강기(객실 내부)", "",
    ag >= 3 ? "required" : "notRequired",
    ag >= 3 ? "3층 이상 각 객실마다 간이완강기를 설치해야 합니다. 양방향 피난이 가능해도 제외되지 않습니다."
    : "3층 이상 층이 없어 설치 대상이 아닙니다.", ""));

  // 인명구조기구: 관광호텔 + 지하 포함 7층 이상
  const touristHotel7F = input.lodgingIsTouristHotel && tf >= 7;
  results.push(makeResult(categories.evacuation, "인명구조기구(방열복·공기호흡기 등)", "",
    touristHotel7F ? "required" : "notRequired",
    touristHotel7F ? `관광호텔이며 지하층을 포함한 전체 층수가 ${tf}층으로 7층 이상입니다. 방열복(또는 방화복), 인공소생기, 공기호흡기를 비치해야 합니다.`
    : input.lodgingIsTouristHotel ? `관광호텔이나 지하층을 포함한 전체 층수가 ${tf}층으로 7층 미만입니다.`
    : "관광호텔이 아닙니다.", ""));

  // 유도등
  results.push(makeResult(categories.evacuation, "유도등(피난구유도등·통로유도등)", "", "required",
    "건물 전체 복도와 출입구 등에 설치해야 합니다.", ""));

  // 비상조명등
  const emergencyLightRequired = (ag >= 5 && ta >= 3000) || hasBasement450Plus || hasWindowless450Plus;
  results.push(makeResult(categories.evacuation, "비상조명등", "",
    emergencyLightRequired ? "required" : "notRequired",
    ag >= 5 && ta >= 3000 ? "층수가 5층 이상이고 연면적이 3,000㎡ 이상입니다."
    : hasBasement450Plus ? "지하층 평균 면적이 450㎡ 이상입니다."
    : hasWindowless450Plus ? "무창층 면적이 450㎡ 이상입니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 소화용수설비 ──
  results.push(makeResult(categories.waterSupply, "상수도소화용수설비", "",
    ta >= 5000 ? "required" : "notRequired",
    ta >= 5000 ? "연면적이 5,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 소화활동설비 ──
  // 제연설비: 지하/무창 1000㎡ 이상 또는 11층 이상
  const smokeControlArea = ba + wl;
  const smokeRequired = (bf > 0 && basementAvg >= 1000) || hasWindowless1000Plus || ag >= 11;
  results.push(makeResult(categories.fireSupport, "제연설비", "",
    smokeRequired ? "required" : "notRequired",
    (bf > 0 && basementAvg >= 1000) || hasWindowless1000Plus ? "지하층 또는 무창층의 바닥면적이 1,000㎡ 이상입니다."
    : ag >= 11 ? "지상 11층 이상으로 특별피난계단에 제연설비를 설치해야 합니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // 연결송수관설비: 7층 이상
  results.push(makeResult(categories.fireSupport, "연결송수관설비", "",
    tf >= 7 ? "required" : "notRequired",
    tf >= 7 ? "전체 층수(지하 포함)가 7층 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // 연결살수설비: 지하 150㎡ 이상
  results.push(makeResult(categories.fireSupport, "연결살수설비", "",
    ba >= 150 ? "required" : "notRequired",
    ba >= 150 ? "지하층 바닥면적 합계가 150㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // 비상콘센트설비: 지상 11층 이상 또는 지하 3층 이하(1000㎡ 이상)
  const emergencyOutletRequired = ag >= 11 || (bf >= 3 && ba >= 1000);
  results.push(makeResult(categories.fireSupport, "비상콘센트설비", "",
    emergencyOutletRequired ? "required" : "notRequired",
    ag >= 11 ? "지상층수가 11층 이상입니다."
    : bf >= 3 && ba >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // 무선통신보조설비: 지하 3,000㎡ 이상
  results.push(makeResult(categories.fireSupport, "무선통신보조설비", "",
    ba >= 3000 || (bf >= 3 && ba >= 1000) ? "required" : "notRequired",
    ba >= 3000 ? "지하층 바닥면적 합계가 3,000㎡ 이상입니다."
    : bf >= 3 && ba >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  return results;
}

function buildLodgingExceptionItems(results, input) {
  const exceptionItems = [];
  const autoDetection = results.find((r) => r.name === "자동화재탐지설비");
  const emergencyAlarm = results.find((r) => r.name === "비상경보설비");
  const singleDetector = results.find((r) => r.name === "단독경보형 감지기");
  const sprinkler = results.find((r) => r.name === "스프링클러설비");
  const simpleSprinkler = results.find((r) => r.name === "간이스프링클러설비");
  const drencher = results.find((r) => r.name === "연결살수설비");
  const waterSpray = results.find((r) => r.name === "물분무등소화설비");
  const parkingCondition = input.lodgingParkingStructureArea >= 800 || input.lodgingIndoorParkingArea >= 200 || input.lodgingMechanicalParkingCapacity >= 20;

  if (sprinkler && sprinkler.status === "required" && simpleSprinkler && simpleSprinkler.status === "notRequired") {
    exceptionItems.push({ category: "설치 제외", name: "간이스프링클러설비", status: "review", reason: "스프링클러설비가 전층 설치 대상이므로 간이스프링클러설비는 제외됩니다." });
  }
  if (sprinkler && sprinkler.status === "required" && drencher && drencher.status === "required") {
    exceptionItems.push({ category: "설치 제외", name: "연결살수설비", status: "review", reason: "스프링클러설비가 설치 대상이면 연결살수설비는 설치 제외 대상입니다." });
  }
  if (autoDetection && autoDetection.status === "required" && emergencyAlarm && emergencyAlarm.status === "required") {
    exceptionItems.push({ category: "설치 제외", name: "비상경보설비", status: "review", reason: "자동화재탐지설비가 설치되면 비상경보설비는 면제 관계로 검토할 수 있습니다." });
  }
  if (autoDetection && autoDetection.status === "required" && singleDetector && singleDetector.status === "required") {
    exceptionItems.push({ category: "설치 제외", name: "단독경보형 감지기", status: "review", reason: "자동화재탐지설비가 설치되면 단독경보형 감지기는 중복 설치가 불필요합니다." });
  }
  if (waterSpray && waterSpray.status === "required" && parkingCondition) {
    exceptionItems.push({ category: "대체설비", name: "주차장 관련 스프링클러설비 대체 가능", status: "review", reason: "주차 관련 공간은 물분무등소화설비 기준이 적용되나, 대체설비로 스프링클러설비를 설치할 수 있습니다." });
  }
  if (!exceptionItems.length) {
    exceptionItems.push({ category: "안내", name: "설치 제외·대체 없음", status: "notRequired", reason: "현재 입력값 기준으로 별도 면제 또는 대체로 표시할 항목이 없습니다." });
  }
  return exceptionItems;
}

function buildLodgingRequiredItems(results, input, exceptionItems) {
  const excludedNames = new Set(exceptionItems.filter((e) => e.category === "설치 제외").map((e) => e.name));
  const parkingCondition = input.lodgingParkingStructureArea >= 800 || input.lodgingIndoorParkingArea >= 200 || input.lodgingMechanicalParkingCapacity >= 20;
  let requiredItems = results.filter((r) => r.status === "required" && !excludedNames.has(r.name));
  if (parkingCondition && input.lodgingElectricalRoomArea < 300) {
    requiredItems = requiredItems.filter((r) => r.name !== "물분무등소화설비");
    if (!requiredItems.some((r) => r.name.includes("스프링클러설비"))) {
      requiredItems.push({
        category: categories.extinguishing,
        name: "스프링클러설비(주차 관련 대체설비)",
        status: "required",
        reason: "주차 관련 공간은 물분무등소화설비 기준이 적용되나, 대체설비로 스프링클러설비를 설치할 수 있습니다.",
      });
    }
  }
  return requiredItems;
}

function evaluateLodgingMultiuseFacilities(input) {
  if (!input.lodgingHasMultiuseBusiness) {
    return { requiredItems: [], extraSafetyItems: [], reasonItems: [], transitionalNotes: [] };
  }

  const requiredItems = [
    { category: "다중이용업소 공통", name: "소화기", status: "required", reason: "다중이용업소 공통 설치대상이며, 구획된 실마다 설치해야 합니다." },
  ];

  const simpleSprinklerReasons = [];
  if (input.lodgingMultiuseInBasement) simpleSprinklerReasons.push("지하층에 설치돼 있습니다.");
  if (input.lodgingMultiuseIsSealed) simpleSprinklerReasons.push("밀폐구조 영업장입니다.");
  if (input.lodgingMultiuseIsPostpartum && !input.lodgingMultiuseOnGroundOrRefugeFloor) simpleSprinklerReasons.push("산후조리업에 해당합니다.");
  if (input.lodgingMultiuseIsGosiwon && !input.lodgingMultiuseOnGroundOrRefugeFloor) simpleSprinklerReasons.push("고시원에 해당합니다.");
  if (input.lodgingMultiuseIsGunRange) simpleSprinklerReasons.push("권총사격장에 해당합니다.");
  if (simpleSprinklerReasons.length) {
    requiredItems.push({ category: categories.extinguishing, name: "간이스프링클러설비", status: "required", reason: simpleSprinklerReasons.join(" ") });
  }

  requiredItems.push({ category: "다중이용업소 공통", name: "비상벨설비", status: "required", reason: "다중이용업소 공통 설치대상이며, 비상벨설비 구성품 중 경종은 구획된 실마다 설치해야 합니다." });

  if (input.lodgingMultiuseUsesAV) {
    requiredItems.push({ category: categories.alarm, name: "자동화재탐지설비", status: "required", reason: "노래반주기 등 영상음향장치를 사용하는 영업장입니다." });
  }
  if (input.lodgingMultiuseHasGasFacility) {
    requiredItems.push({ category: categories.alarm, name: "가스누설경보기", status: "required", reason: "가스시설을 사용하는 주방 또는 난방시설이 있습니다." });
  }
  if (input.lodgingMultiuseOnSecondToTenthFloor) {
    requiredItems.push({ category: categories.evacuation, name: "피난기구", status: "required", reason: "다중이용업소가 2층부터 10층 사이에 설치돼 있어 피난기구 설치대상입니다. 주로 구조대나 피난사다리를 설치하며, 법에는 완강기 설치가 가능하지만 대구에서는 완강기 설치가 불가합니다." });
  }
  if (input.lodgingMultiuseHasEvacuationRoute) {
    requiredItems.push({ category: categories.evacuation, name: "피난유도선", status: "required", reason: "영업장 내부 피난통로 또는 복도가 있습니다." });
  }

  requiredItems.push({ category: "다중이용업소 공통", name: "유도등", status: "required", reason: "다중이용업소 공통 설치대상이며, 구획된 실마다 설치해야 합니다." });
  requiredItems.push({ category: "다중이용업소 공통", name: "휴대용 비상조명등", status: "required", reason: "다중이용업소 공통 설치대상이며, 구획된 실마다 설치해야 합니다." });
  requiredItems.push({ category: "다중이용업소 공통", name: "비상구", status: "required", reason: "다중이용업소에는 비상구를 설치해야 합니다. 다만 주된 출입구 외에 해당 영업장 내부에서 피난층 또는 지상으로 통하는 직통계단이 주된 출입구 중심선으로부터 수평거리로 영업장의 긴 변 길이의 2분의 1 이상 떨어진 위치에 별도로 설치된 경우에는 비상구를 설치하지 않을 수 있습니다." });

  if (input.lodgingMultiuseHasRooms) {
    requiredItems.push({ category: "다중이용업소 공통", name: "영업장 내부 피난통로", status: "required", reason: "구획된 실이 있는 다중이용업소는 내부 피난통로를 확보해야 합니다. 양옆에 구획된 실이 있는 경우 폭 150cm 이상, 그 외 120cm 이상이어야 하며, 3번 이상 구부러지는 형태는 금지됩니다." });
  }

  const extraSafetyItems = [];
  if (input.lodgingMultiuseUsesAV) {
    extraSafetyItems.push({ category: "그 밖의 안전시설", name: "영상음향차단장치", status: "required", reason: "노래반주기 등 영상음향장치를 사용하는 영업장입니다." });
  }
  extraSafetyItems.push({ category: "그 밖의 안전시설", name: "누전차단기", status: "required", reason: "다중이용업소 공통 안전시설로 설치해야 합니다." });
  if (input.lodgingMultiuseIsGosiwon) {
    extraSafetyItems.push({ category: "그 밖의 안전시설", name: "창문", status: "required", reason: "고시원이므로 창문을 설치해야 합니다." });
  }

  const etcItems = [];
  etcItems.push({ category: "기타", name: "피난안내도, 피난안내영상물", status: "required", reason: "다중이용업소이므로 피난안내도를 각 층마다 보기 쉬운 위치에 비치하거나 피난안내영상물을 상영해야 합니다." });
  etcItems.push({ category: "기타", name: "방염", status: "required", reason: "다중이용업소이므로 방염을 해야 합니다." });

  const transitionalNotes = buildMultiuseTransitionalNotes({
    isSealed: input.lodgingMultiuseIsSealed,
    usesAV: input.lodgingMultiuseUsesAV,
    hasEvacuationRoute: input.lodgingMultiuseHasEvacuationRoute,
    isGosiwon: input.lodgingMultiuseIsGosiwon,
  });

  const reasonItems = [...requiredItems, ...extraSafetyItems, ...etcItems];
  return { requiredItems, extraSafetyItems, etcItems, reasonItems, transitionalNotes };
}

function evaluateElderlyFacility(input) {
  const results = [];
  const ea = input.elderlyArea;
  const ta = input.elderlyTotalArea;
  const ag = input.elderlyAboveGroundFloors;
  const bf = input.elderlyBasementFloors;
  const ba = input.elderlyBasementAreaSum;
  const wl = input.elderlyWindowlessArea;
  const tf = input.elderlyTotalFloors;
  const isLivingFacility = input.elderlySubtype === "livingFacility";

  const basementAvg = bf > 0 ? ba / bf : 0;
  const hasBasement150Plus = bf > 0 && basementAvg >= 150;
  const hasBasement450Plus = bf > 0 && basementAvg >= 450;
  const hasBasement1000Plus = bf > 0 && basementAvg >= 1000;
  const hasWindowless150Plus = wl >= 150;
  const hasWindowless450Plus = wl >= 450;
  const hasWindowless1000Plus = wl >= 1000;

  // 스프링클러 조건
  const sprinklerRequired = ag >= 6 || ea >= 600;

  // 간이스프링클러 조건
  let simpleSprinklerRequired = false;
  let simpleSprinklerReason = "";
  if (!sprinklerRequired) {
    if (isLivingFacility) {
      simpleSprinklerRequired = true;
      simpleSprinklerReason = "노유자 생활시설은 면적에 관계없이 모든 층에 간이스프링클러를 설치해야 합니다.";
    } else if (ea >= 300 && ea < 600) {
      simpleSprinklerRequired = true;
      simpleSprinklerReason = `노유자시설 사용 바닥면적이 ${ea}㎡로 300㎡ 이상 600㎡ 미만입니다.`;
    } else if (ea < 300 && input.elderlyHasGrillWindow) {
      simpleSprinklerRequired = true;
      simpleSprinklerReason = "창살(자동 개방 제외)이 설치된 노유자시설로, 바닥면적이 300㎡ 미만이더라도 간이스프링클러를 설치해야 합니다.";
    }
  }

  // 물분무등소화설비
  const parkingWaterSprayCondition = input.elderlyParkingStructureArea >= 800 || input.elderlyIndoorParkingArea >= 200 || input.elderlyMechanicalParkingCapacity >= 20;
  const waterSprayRequired = parkingWaterSprayCondition || input.elderlyElectricalRoomArea >= 300;

  // 옥내소화전
  const standpipeRequired = ta >= 1500 || input.elderlyHasLargeTargetFloor;

  // ── 소화설비 ──
  results.push(makeResult(categories.extinguishing, "소화기구", "", ta >= 33 ? "required" : "notRequired",
    ta >= 33 ? "연면적이 33㎡ 이상입니다. 소화기 수량의 2분의 1 이상은 투척용 소화용구 등 노약자가 쉽게 사용할 수 있는 것으로 설치할 수 있습니다."
    : "연면적이 33㎡ 미만입니다.", ""));

  results.push(makeResult(categories.extinguishing, "옥내소화전설비", "", standpipeRequired ? "required" : "notRequired",
    ta >= 1500 ? "연면적이 1,500㎡ 이상입니다."
    : input.elderlyHasLargeTargetFloor ? `연면적(${ta}㎡)을 전체 층수(${tf}층)로 나눈 층평균 바닥면적이 약 ${Math.round(input.elderlyFloorAvgArea)}㎡로 300㎡ 이상입니다.`
    : `연면적(${ta}㎡)을 전체 층수(${tf}층)로 나눈 층평균 바닥면적이 약 ${Math.round(input.elderlyFloorAvgArea)}㎡로 300㎡ 미만이므로 설치 대상이 아닙니다.`, ""));

  results.push(makeResult(categories.extinguishing, "스프링클러설비", "", sprinklerRequired ? "required" : "notRequired",
    ag >= 6 ? "건물 층수가 6층 이상이므로 전층 설치 대상입니다."
    : ea >= 600 ? "노유자시설 사용 바닥면적이 600㎡ 이상이므로 전층 설치 대상입니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  let simpleSprinklerStatus = "notRequired";
  let simpleSprinklerDisplayReason = "";
  if (sprinklerRequired) {
    simpleSprinklerStatus = "notRequired";
    simpleSprinklerDisplayReason = "스프링클러설비 설치 대상이므로 간이스프링클러설비는 제외됩니다.";
  } else if (simpleSprinklerRequired) {
    simpleSprinklerStatus = "required";
    simpleSprinklerDisplayReason = simpleSprinklerReason;
  } else {
    simpleSprinklerDisplayReason = isLivingFacility
      ? "스프링클러설비 설치 대상이므로 간이스프링클러설비는 제외됩니다."
      : ea < 300 && !input.elderlyHasGrillWindow
        ? "창살이 설치되지 않은 300㎡ 미만의 일반 노유자시설로 설치 대상이 아닙니다."
        : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.extinguishing, "간이스프링클러설비", "", simpleSprinklerStatus, simpleSprinklerDisplayReason, ""));

  results.push(makeResult(categories.extinguishing, "물분무등소화설비", "", waterSprayRequired ? "required" : "notRequired", buildWaterSprayReason(input.elderlyParkingStructureArea, input.elderlyIndoorParkingArea, input.elderlyMechanicalParkingCapacity, input.elderlyElectricalRoomArea), ""));

  // ── 경보설비 ──
  results.push(makeResult(categories.alarm, "단독경보형 감지기", "", ta < 400 ? "required" : "notRequired",
    ta < 400 ? "연면적 400㎡ 미만의 노유자시설입니다."
    : "연면적 400㎡ 이상이므로 설치 대상이 아닙니다.", ""));

  const autoDetectionRequired = isLivingFacility || ta >= 400;
  results.push(makeResult(categories.alarm, "자동화재탐지설비", "", autoDetectionRequired ? "required" : "notRequired",
    isLivingFacility ? "노유자 생활시설은 면적에 관계없이 모든 층에 설치해야 합니다."
    : ta >= 400 ? "연면적이 400㎡ 이상입니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  let autoDispatchStatus = "notRequired";
  let autoDispatchReason = "현재 입력 기준으로는 설치 대상이 아닙니다.";
  if (isLivingFacility) {
    autoDispatchStatus = "required";
    autoDispatchReason = "노유자 생활시설은 면적에 관계없이 설치해야 합니다.";
  } else if (input.elderlyHasFloor500Plus) {
    if (input.elderlyHas24HourStaff) {
      autoDispatchStatus = "review";
      autoDispatchReason = "바닥면적 500㎡ 이상인 층이 있으나 24시간 상주 근무자가 있어 면제 검토가 필요합니다.";
    } else {
      autoDispatchStatus = "required";
      autoDispatchReason = "바닥면적이 500㎡ 이상인 층이 있습니다.";
    }
  }
  results.push(makeResult(categories.alarm, "자동화재속보설비", "", autoDispatchStatus, autoDispatchReason, ""));

  results.push(makeResult(categories.alarm, "가스누설경보기", "", input.elderlyHasGasFacility ? "required" : "notRequired",
    input.elderlyHasGasFacility ? "가스시설이 설치된 노유자시설입니다."
    : "가스시설이 없어 설치 대상이 아닙니다.", ""));

  const emergencyAlarm = ta >= 400 || hasBasement150Plus || hasWindowless150Plus;
  results.push(makeResult(categories.alarm, "비상경보설비", "", emergencyAlarm ? "required" : "notRequired",
    ta >= 400 ? "연면적이 400㎡ 이상입니다."
    : hasBasement150Plus ? "지하층 평균 면적이 150㎡ 이상입니다."
    : hasWindowless150Plus ? "무창층 면적이 150㎡ 이상입니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  const broadcastRequired = ta >= 3500 || ag >= 11 || bf >= 3;
  results.push(makeResult(categories.alarm, "비상방송설비", "", broadcastRequired ? "required" : "notRequired",
    ta >= 3500 ? "연면적이 3,500㎡ 이상입니다."
    : ag >= 11 ? "지상층수가 11층 이상입니다."
    : bf >= 3 ? "지하층수가 3층 이상입니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 피난구조설비 ──
  results.push(makeResult(categories.evacuation, "피난기구(구조대 등, 완강기 제외)", "", ag >= 2 ? "required" : "notRequired",
    ag >= 2 ? "노유자시설은 2층 이상 10층 이하의 층에 피난기구를 설치합니다. 완강기는 설치하지 않습니다."
    : "2층 이상 층이 없어 설치 대상이 아닙니다.", ""));

  results.push(makeResult(categories.evacuation, "유도등(피난구유도등·통로유도등)", "", "required",
    "건물 전체 복도 및 출입구 등에 설치해야 합니다.", ""));

  const emergencyLightRequired = (tf >= 5 && ta >= 3000) || hasBasement450Plus || hasWindowless450Plus;
  results.push(makeResult(categories.evacuation, "비상조명등", "", emergencyLightRequired ? "required" : "notRequired",
    tf >= 5 && ta >= 3000 ? "지하층을 포함한 층수가 5층 이상이고 연면적이 3,000㎡ 이상입니다."
    : hasBasement450Plus ? "지하층 평균 면적이 450㎡ 이상입니다."
    : hasWindowless450Plus ? "무창층 면적이 450㎡ 이상입니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 소화용수설비 ──
  results.push(makeResult(categories.waterSupply, "상수도소화용수설비", "", ta >= 5000 ? "required" : "notRequired",
    ta >= 5000 ? "연면적이 5,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 소화활동설비 ──
  const smokeRequired = hasBasement1000Plus || hasWindowless1000Plus || ag >= 11;
  results.push(makeResult(categories.fireSupport, "제연설비", "", smokeRequired ? "required" : "notRequired",
    hasBasement1000Plus || hasWindowless1000Plus ? "지하층 또는 무창층의 바닥면적이 1,000㎡ 이상입니다."
    : ag >= 11 ? "지상 11층 이상으로 특별피난계단에 제연설비를 설치해야 합니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  const standpipeFireRequired = (tf >= 5 && ta >= 6000) || tf >= 7 || (bf >= 3 && ba >= 1000);
  results.push(makeResult(categories.fireSupport, "연결송수관설비", "", standpipeFireRequired ? "required" : "notRequired",
    tf >= 5 && ta >= 6000 ? "전체 층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다."
    : tf >= 7 ? "지하층을 포함한 전체 층수가 7층 이상입니다."
    : bf >= 3 && ba >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  results.push(makeResult(categories.fireSupport, "연결살수설비", "", ba >= 150 ? "required" : "notRequired",
    ba >= 150 ? "지하층 바닥면적 합계가 150㎡ 이상입니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  const emergencyOutletRequired = ag >= 11 || (bf >= 3 && ba >= 1000);
  results.push(makeResult(categories.fireSupport, "비상콘센트설비", "", emergencyOutletRequired ? "required" : "notRequired",
    ag >= 11 ? "지상층수가 11층 이상입니다."
    : bf >= 3 && ba >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  results.push(makeResult(categories.fireSupport, "무선통신보조설비", "",
    ba >= 3000 || (bf >= 3 && ba >= 1000) ? "required" : "notRequired",
    ba >= 3000 ? "지하층 바닥면적 합계가 3,000㎡ 이상입니다."
    : bf >= 3 && ba >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  return results;
}

function buildElderlyExceptionItems(results, input) {
  const exceptionItems = [];
  const autoDetection = results.find((r) => r.name === "자동화재탐지설비");
  const emergencyAlarm = results.find((r) => r.name === "비상경보설비");
  const singleDetector = results.find((r) => r.name === "단독경보형 감지기");
  const sprinkler = results.find((r) => r.name === "스프링클러설비");
  const simpleSprinkler = results.find((r) => r.name === "간이스프링클러설비");
  const drencher = results.find((r) => r.name === "연결살수설비");
  const waterSpray = results.find((r) => r.name === "물분무등소화설비");
  const parkingCondition = input.elderlyParkingStructureArea >= 800 || input.elderlyIndoorParkingArea >= 200 || input.elderlyMechanicalParkingCapacity >= 20;

  if (sprinkler && sprinkler.status === "required" && simpleSprinkler && simpleSprinkler.status === "notRequired") {
    exceptionItems.push({ category: "설치 제외", name: "간이스프링클러설비", status: "review", reason: "스프링클러설비가 전층 설치 대상이므로 간이스프링클러설비는 제외됩니다." });
  }
  if (sprinkler && sprinkler.status === "required" && drencher && drencher.status === "required") {
    exceptionItems.push({ category: "설치 제외", name: "연결살수설비", status: "review", reason: "스프링클러설비가 설치 대상이면 연결살수설비는 설치 제외 대상입니다." });
  }
  if (autoDetection && autoDetection.status === "required" && emergencyAlarm && emergencyAlarm.status === "required") {
    exceptionItems.push({ category: "설치 제외", name: "비상경보설비", status: "review", reason: "자동화재탐지설비가 설치되면 비상경보설비는 면제 관계로 검토할 수 있습니다." });
  }
  if (autoDetection && autoDetection.status === "required" && singleDetector && singleDetector.status === "required") {
    exceptionItems.push({ category: "설치 제외", name: "단독경보형 감지기", status: "review", reason: "자동화재탐지설비가 설치되면 단독경보형 감지기는 중복 설치가 불필요합니다." });
  }
  if (waterSpray && waterSpray.status === "required" && parkingCondition) {
    exceptionItems.push({ category: "대체설비", name: "주차장 관련 스프링클러설비 대체 가능", status: "review", reason: "주차 관련 공간은 물분무등소화설비 기준이 적용되나, 대체설비로 스프링클러설비를 설치할 수 있습니다." });
  }
  if (!exceptionItems.length) {
    exceptionItems.push({ category: "안내", name: "설치 제외·대체 없음", status: "notRequired", reason: "현재 입력값 기준으로 별도 면제 또는 대체로 표시할 항목이 없습니다." });
  }
  return exceptionItems;
}

function buildElderlyRequiredItems(results, input, exceptionItems) {
  const excludedNames = new Set(exceptionItems.filter((e) => e.category === "설치 제외").map((e) => e.name));
  const parkingCondition = input.elderlyParkingStructureArea >= 800 || input.elderlyIndoorParkingArea >= 200 || input.elderlyMechanicalParkingCapacity >= 20;
  let requiredItems = results.filter((r) => r.status === "required" && !excludedNames.has(r.name));
  if (parkingCondition && input.elderlyElectricalRoomArea < 300) {
    requiredItems = requiredItems.filter((r) => r.name !== "물분무등소화설비");
    if (!requiredItems.some((r) => r.name.includes("스프링클러설비"))) {
      requiredItems.push({
        category: categories.extinguishing,
        name: "스프링클러설비(주차 관련 대체설비)",
        status: "required",
        reason: "주차 관련 공간은 물분무등소화설비 기준이 적용되나, 대체설비로 스프링클러설비를 설치할 수 있습니다.",
      });
    }
  }
  return requiredItems;
}

function evaluateMedicalFacility(input) {
  const results = [];
  const ma = input.medicalArea;
  const ta = input.medicalTotalArea;
  const ag = input.medicalAboveGroundFloors;
  const bf = input.medicalBasementFloors;
  const ba = input.medicalBasementAreaSum;
  const wl = input.medicalWindowlessArea;
  const tf = input.medicalTotalFloors;
  const sub = input.medicalSubtype;

  const isPsychiatric = sub === "psychiatricHospital";
  const isRehabilitation = sub === "rehabilitationFacility";
  const isNursing = sub === "nursingHome";
  const isGeneral = sub === "generalHospital" || sub === "hospital";

  const basementAvg = bf > 0 ? ba / bf : 0;
  const hasBasement150Plus = bf > 0 && basementAvg >= 150;
  const hasBasement300Plus = bf > 0 && basementAvg >= 300;
  const hasBasement450Plus = bf > 0 && basementAvg >= 450;
  const hasBasement1000Plus = bf > 0 && basementAvg >= 1000;
  const hasWindowless150Plus = wl >= 150;
  const hasWindowless300Plus = wl >= 300;
  const hasWindowless450Plus = wl >= 450;
  const hasWindowless1000Plus = wl >= 1000;

  // ── 소화설비 ──
  results.push(makeResult(categories.extinguishing, "소화기구", "", ta >= 33 ? "required" : "notRequired",
    ta >= 33 ? "연면적이 33㎡ 이상입니다." : "연면적이 33㎡ 미만입니다.", ""));

  const standpipeRequired = ta >= 1500 || hasBasement300Plus || hasWindowless300Plus;
  results.push(makeResult(categories.extinguishing, "옥내소화전설비", "", standpipeRequired ? "required" : "notRequired",
    ta >= 1500 ? "연면적이 1,500㎡ 이상입니다."
    : hasBasement300Plus ? "지하층 평균 바닥면적이 300㎡ 이상입니다."
    : hasWindowless300Plus ? "무창층 바닥면적이 300㎡ 이상입니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  const sprinklerRequired = ag >= 6 || ma >= 600;
  results.push(makeResult(categories.extinguishing, "스프링클러설비", "", sprinklerRequired ? "required" : "notRequired",
    ag >= 6 ? "건물 층수가 6층 이상이므로 전층 설치 대상입니다."
    : ma >= 600 ? "의료시설 사용 바닥면적이 600㎡ 이상이므로 전층 설치 대상입니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  let simpleSprinklerStatus = "notRequired";
  let simpleSprinklerReason = "";
  if (sprinklerRequired) {
    simpleSprinklerReason = "스프링클러설비 설치 대상이므로 간이스프링클러설비는 제외됩니다.";
  } else if (isGeneral || isNursing) {
    simpleSprinklerStatus = "required";
    simpleSprinklerReason = `${isNursing ? "요양병원" : "종합병원·병원·치과병원·한방병원"}으로서 바닥면적 합계가 600㎡ 미만이므로 간이스프링클러설비를 설치해야 합니다.`;
  } else if ((isPsychiatric || isRehabilitation) && ma >= 300) {
    simpleSprinklerStatus = "required";
    simpleSprinklerReason = `${isPsychiatric ? "정신의료기관" : "의료재활시설"}으로서 바닥면적 합계가 300㎡ 이상 600㎡ 미만이므로 간이스프링클러설비를 설치해야 합니다.`;
  } else if ((isPsychiatric || isRehabilitation) && ma < 300 && input.medicalHasGrillWindow) {
    simpleSprinklerStatus = "required";
    simpleSprinklerReason = "고정식 창살이 설치된 정신의료기관·의료재활시설로, 바닥면적 300㎡ 미만이더라도 간이스프링클러설비를 설치해야 합니다.";
  } else {
    simpleSprinklerReason = "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.extinguishing, "간이스프링클러설비", "", simpleSprinklerStatus, simpleSprinklerReason, ""));

  const parkingWaterSprayCondition = input.medicalParkingStructureArea >= 800 || input.medicalIndoorParkingArea >= 200 || input.medicalMechanicalParkingCapacity >= 20;
  const waterSprayRequired = parkingWaterSprayCondition || input.medicalElectricalRoomArea >= 300;
  results.push(makeResult(categories.extinguishing, "물분무등소화설비", "", waterSprayRequired ? "required" : "notRequired", buildWaterSprayReason(input.medicalParkingStructureArea, input.medicalIndoorParkingArea, input.medicalMechanicalParkingCapacity, input.medicalElectricalRoomArea), ""));

  // ── 경보설비 ──
  const emergencyAlarm = ta >= 400 || hasBasement150Plus || hasWindowless150Plus;
  results.push(makeResult(categories.alarm, "비상경보설비", "", emergencyAlarm ? "required" : "notRequired",
    ta >= 400 ? "연면적이 400㎡ 이상입니다."
    : hasBasement150Plus ? "지하층 평균 바닥면적이 150㎡ 이상입니다."
    : hasWindowless150Plus ? "무창층 바닥면적이 150㎡ 이상입니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  const broadcastRequired = ta >= 3500 || ag >= 11 || bf >= 3;
  results.push(makeResult(categories.alarm, "비상방송설비", "", broadcastRequired ? "required" : "notRequired",
    ta >= 3500 ? "연면적이 3,500㎡ 이상입니다."
    : ag >= 11 ? "지상층수가 11층 이상입니다."
    : bf >= 3 ? "지하층수가 3층 이상입니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  let autoDetectionRequired = false;
  let autoDetectionReason = "현재 입력 기준으로는 설치 대상이 아닙니다.";
  if (ag >= 6) {
    autoDetectionRequired = true;
    autoDetectionReason = "건물 층수가 6층 이상이므로 전층 설치 대상입니다.";
  } else if (isNursing) {
    autoDetectionRequired = true;
    autoDetectionReason = "요양병원은 면적에 관계없이 자동화재탐지설비를 설치해야 합니다.";
  } else if (isGeneral && ma >= 600) {
    autoDetectionRequired = true;
    autoDetectionReason = "의료시설(일반) 바닥면적이 600㎡ 이상입니다.";
  } else if ((isPsychiatric || isRehabilitation) && (ma >= 300 || input.medicalHasGrillWindow)) {
    autoDetectionRequired = true;
    autoDetectionReason = ma >= 300
      ? "정신의료기관·의료재활시설로 바닥면적이 300㎡ 이상입니다."
      : "고정식 창살이 설치된 정신의료기관·의료재활시설입니다.";
  }
  results.push(makeResult(categories.alarm, "자동화재탐지설비", "", autoDetectionRequired ? "required" : "notRequired", autoDetectionReason, ""));

  results.push(makeResult(categories.alarm, "시각경보기", "", autoDetectionRequired ? "required" : "notRequired",
    autoDetectionRequired ? "자동화재탐지설비 설치 대상 의료시설에는 청각장애인을 위해 시각경보기를 함께 설치해야 합니다."
    : "자동화재탐지설비 설치 대상이 아니므로 설치 대상이 아닙니다.", ""));

  let autoDispatchStatus = "notRequired";
  let autoDispatchReason = "현재 입력 기준으로는 설치 대상이 아닙니다.";
  if (isGeneral || isNursing) {
    autoDispatchStatus = "required";
    autoDispatchReason = `${isNursing ? "요양병원" : "종합병원·병원·치과병원·한방병원"}은 면적에 관계없이 자동화재속보설비를 설치해야 합니다.`;
  } else if ((isPsychiatric || isRehabilitation) && (bf > 0 && basementAvg >= 500)) {
    autoDispatchStatus = "required";
    autoDispatchReason = "정신병원·의료재활시설로 바닥면적 합계가 500㎡ 이상인 지하층이 있습니다.";
  }
  results.push(makeResult(categories.alarm, "자동화재속보설비", "", autoDispatchStatus, autoDispatchReason, ""));

  results.push(makeResult(categories.alarm, "가스누설경보기", "", input.medicalHasGasFacility ? "required" : "notRequired",
    input.medicalHasGasFacility ? "가스시설이 설치된 의료시설입니다." : "가스시설이 없어 설치 대상이 아닙니다.", ""));

  // ── 피난구조설비 ──
  results.push(makeResult(categories.evacuation, "피난기구(구조대 등)", "", ag >= 3 ? "required" : "notRequired",
    ag >= 3 ? "의료시설은 3층 이상 10층 이하의 층에 피난기구를 설치해야 합니다."
    : "3층 이상 층이 없어 설치 대상이 아닙니다.", ""));

  const inPatientHospital = sub === "generalHospital" || sub === "hospital" || sub === "nursingHome" || sub === "psychiatricHospital";
  results.push(makeResult(categories.evacuation, "인명구조기구(방열복·공기호흡기)", "", tf >= 5 && inPatientHospital ? "required" : "notRequired",
    tf >= 5 && inPatientHospital ? "지하층 포함 층수가 5층 이상인 병원 용도로 사용하는 층에 방열복(또는 방화복) 및 공기호흡기를 비치해야 합니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  results.push(makeResult(categories.evacuation, "유도등(피난구유도등·통로유도등)", "", "required",
    "모든 의료시설에 피난구유도등, 통로유도등, 유도표지를 설치해야 합니다.", ""));

  const emergencyLightRequired = (tf >= 5 && ta >= 3000) || hasBasement450Plus || hasWindowless450Plus;
  results.push(makeResult(categories.evacuation, "비상조명등", "", emergencyLightRequired ? "required" : "notRequired",
    tf >= 5 && ta >= 3000 ? "지하층을 포함한 층수가 5층 이상이고 연면적이 3,000㎡ 이상입니다."
    : hasBasement450Plus ? "지하층 평균 바닥면적이 450㎡ 이상입니다."
    : hasWindowless450Plus ? "무창층 바닥면적이 450㎡ 이상입니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 소화용수설비 ──
  results.push(makeResult(categories.waterSupply, "상수도소화용수설비", "", ta >= 5000 ? "required" : "notRequired",
    ta >= 5000 ? "연면적이 5,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 소화활동설비 ──
  const smokeRequired = hasBasement1000Plus || hasWindowless1000Plus || ag >= 11;
  results.push(makeResult(categories.fireSupport, "제연설비", "", smokeRequired ? "required" : "notRequired",
    hasBasement1000Plus || hasWindowless1000Plus ? "지하층 또는 무창층의 바닥면적이 1,000㎡ 이상입니다."
    : ag >= 11 ? "지상 11층 이상으로 특별피난계단에 제연설비를 설치해야 합니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  const standpipeFireRequired = (tf >= 5 && ta >= 6000) || tf >= 7 || (bf >= 3 && ba >= 1000);
  results.push(makeResult(categories.fireSupport, "연결송수관설비", "", standpipeFireRequired ? "required" : "notRequired",
    tf >= 5 && ta >= 6000 ? "전체 층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다."
    : tf >= 7 ? "지하층을 포함한 전체 층수가 7층 이상입니다."
    : bf >= 3 && ba >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  results.push(makeResult(categories.fireSupport, "연결살수설비", "", ba >= 150 ? "required" : "notRequired",
    ba >= 150 ? "지하층 바닥면적 합계가 150㎡ 이상입니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  const emergencyOutletRequired = ag >= 11 || (bf >= 3 && ba >= 1000);
  results.push(makeResult(categories.fireSupport, "비상콘센트설비", "", emergencyOutletRequired ? "required" : "notRequired",
    ag >= 11 ? "지상층수가 11층 이상입니다."
    : bf >= 3 && ba >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  results.push(makeResult(categories.fireSupport, "무선통신보조설비", "",
    ba >= 3000 || (bf >= 3 && ba >= 1000) ? "required" : "notRequired",
    ba >= 3000 ? "지하층 바닥면적 합계가 3,000㎡ 이상입니다."
    : bf >= 3 && ba >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  return results;
}

function buildMedicalExceptionItems(results, input) {
  const exceptionItems = [];
  const autoDetection = results.find((r) => r.name === "자동화재탐지설비");
  const emergencyAlarm = results.find((r) => r.name === "비상경보설비");
  const sprinkler = results.find((r) => r.name === "스프링클러설비");
  const simpleSprinkler = results.find((r) => r.name === "간이스프링클러설비");
  const drencher = results.find((r) => r.name === "연결살수설비");
  const waterSpray = results.find((r) => r.name === "물분무등소화설비");
  const parkingCondition = input.medicalParkingStructureArea >= 800 || input.medicalIndoorParkingArea >= 200 || input.medicalMechanicalParkingCapacity >= 20;

  if (sprinkler && sprinkler.status === "required" && simpleSprinkler && simpleSprinkler.status === "notRequired") {
    exceptionItems.push({ category: "설치 제외", name: "간이스프링클러설비", status: "review", reason: "스프링클러설비가 전층 설치 대상이므로 간이스프링클러설비는 제외됩니다." });
  }
  if (sprinkler && sprinkler.status === "required" && drencher && drencher.status === "required") {
    exceptionItems.push({ category: "설치 제외", name: "연결살수설비", status: "review", reason: "스프링클러설비가 설치 대상이면 연결살수설비는 설치 제외 대상입니다." });
  }
  if (autoDetection && autoDetection.status === "required" && emergencyAlarm && emergencyAlarm.status === "required") {
    exceptionItems.push({ category: "설치 제외", name: "비상경보설비", status: "review", reason: "자동화재탐지설비가 설치되면 비상경보설비는 설치대상 목록에서 제외됩니다." });
  }
  if (waterSpray && waterSpray.status === "required" && parkingCondition) {
    exceptionItems.push({ category: "대체설비", name: "주차장 관련 스프링클러설비 대체 가능", status: "review", reason: "주차 관련 공간은 물분무등소화설비 기준이 적용되나, 대체설비로 스프링클러설비를 설치할 수 있습니다." });
  }
  if (!exceptionItems.length) {
    exceptionItems.push({ category: "안내", name: "설치 제외·대체 없음", status: "notRequired", reason: "현재 입력값 기준으로 별도 면제 또는 대체로 표시할 항목이 없습니다." });
  }
  return exceptionItems;
}

function buildMedicalRequiredItems(results, input, exceptionItems) {
  const excludedNames = new Set(exceptionItems.filter((e) => e.category === "설치 제외").map((e) => e.name));
  const parkingCondition = input.medicalParkingStructureArea >= 800 || input.medicalIndoorParkingArea >= 200 || input.medicalMechanicalParkingCapacity >= 20;
  let requiredItems = results.filter((r) => r.status === "required" && !excludedNames.has(r.name));
  if (parkingCondition && input.medicalElectricalRoomArea < 300) {
    requiredItems = requiredItems.filter((r) => r.name !== "물분무등소화설비");
    if (!requiredItems.some((r) => r.name.includes("스프링클러설비"))) {
      requiredItems.push({
        category: categories.extinguishing,
        name: "스프링클러설비(주차 관련 대체설비)",
        status: "required",
        reason: "주차 관련 공간은 물분무등소화설비 기준이 적용되나, 대체설비로 스프링클러설비를 설치할 수 있습니다.",
      });
    }
  }
  return requiredItems;
}

function buildWaterSprayReason(pStructure, pIndoor, pMechanical, eRoom) {
  if (eRoom >= 300) {
    return "전기실·발전실·변전실·전산실 바닥면적이 300㎡ 이상으로 해당 공간에만 설치해야 합니다(스프링클러설비로 대체되지 않습니다).";
  }
  if (pStructure >= 800) return "차고·주차용 건축물 연면적이 800㎡ 이상입니다.";
  if (pIndoor >= 200) return "건물 내부 차고·주차장 바닥면적이 200㎡ 이상입니다.";
  if (pMechanical >= 20) return "기계식 주차가 20대 이상입니다.";
  return "현재 입력 기준으로는 설치 대상이 아닙니다.";
}

function buildExceptionItems(results, input) {
  const exceptionItems = [];
  const autoDetection = results.find((item) => item.name === "자동화재탐지설비");
  const emergencyAlarm = results.find((item) => item.name === "비상경보설비");
  const waterSpray = results.find((item) => item.name === "물분무등소화설비");
  const sprinkler = results.find((item) => item.name === "스프링클러설비");
  const simpleSprinkler = results.find((item) => item.name === "간이스프링클러설비");
  const drencher = results.find((item) => item.name === "연결살수설비");
  const hasParkingWaterSprayCondition = input.parkingStructureArea >= 800 || input.indoorParkingArea >= 200 || input.mechanicalParkingCapacity >= 20;

  if (sprinkler && sprinkler.status === "required" && simpleSprinkler && simpleSprinkler.status === "notRequired") {
    exceptionItems.push({ category: "설치 제외", name: "간이스프링클러설비", status: "review", reason: "스프링클러설비가 전층 설치 대상이면 간이스프링클러설비는 제외 대상으로 봅니다." });
  }
  if (sprinkler && sprinkler.status === "required" && drencher && drencher.status === "required") {
    exceptionItems.push({ category: "설치 제외", name: "연결살수설비", status: "review", reason: "스프링클러설비가 설치 대상이면 연결살수설비는 설치 제외 대상으로 봅니다." });
  }
  if (autoDetection && emergencyAlarm && autoDetection.status === "required" && emergencyAlarm.status === "required") {
    exceptionItems.push({ category: "설치 제외", name: "비상경보설비", status: "review", reason: "자동화재탐지설비가 설치되면 비상경보설비는 면제 관계로 검토할 수 있습니다." });
  }
  if (waterSpray && waterSpray.status === "required" && hasParkingWaterSprayCondition) {
    exceptionItems.push({ category: "대체설비", name: "주차장 관련 스프링클러설비 대체 가능", status: "review", reason: "주차 관련 공간의 기본 기준은 물분무등소화설비이며, 그 대체설비로 해당 공간에 스프링클러설비가 설치될 수 있습니다." });
  }
  if (!exceptionItems.length) {
    exceptionItems.push({ category: "안내", name: "설치 제외·대체 없음", status: "notRequired", reason: "현재 입력값 기준으로 별도 면제 또는 대체로 표시할 항목이 없습니다." });
  }
  return exceptionItems;
}

function buildRequiredItems(results, input, exceptionItems) {
  const excludedRequiredNames = new Set(exceptionItems.filter((item) => item.category === "설치 제외").map((item) => item.name));
  const parkingWaterSprayCondition = input.parkingStructureArea >= 800 || input.indoorParkingArea >= 200 || input.mechanicalParkingCapacity >= 20;
  let requiredItems = results.filter((item) => item.status === "required" && !excludedRequiredNames.has(item.name));

  if (parkingWaterSprayCondition && input.electricalRoomArea < 300) {
    requiredItems = requiredItems.filter((item) => item.name !== "물분무등소화설비");
    if (!requiredItems.some((item) => item.name.includes("스프링클러설비"))) {
      requiredItems.push({
        category: categories.extinguishing,
        name: "스프링클러설비(주차 관련 대체설비)",
        status: "required",
        reason: "주차 관련 공간은 물분무등소화설비 기준이 적용되지만, 대체설비로 스프링클러설비를 설치할 수 있습니다.",
      });
    }
  }
  return requiredItems;
}

function getSubtypeLabel(value) {
  const labels = {
    general: "일반 근린생활시설",
    bathhouse: "목욕장",
    clinicInpatient: "입원실 있는 의원급",
    postpartum: "조산원·산후조리원",
  };
  if (value === "postpartum") {
    return `조산원·산후조리원(${state.answers.postpartumAreaRange === "under600" ? "600㎡ 미만" : "600㎡ 이상"})`;
  }
  return labels[value] || value;
}

function renderResultGroup(targetId, items, excludedNames, allowedNames) {
  const list = document.getElementById(targetId);
  const template = document.getElementById("result-item-template");
  list.innerHTML = "";
  const excluded = new Set(excludedNames || []);
  const allowed = allowedNames ? new Set(allowedNames) : null;
  // criteria-list에서는 해당 없음(notRequired) 항목, 설치 제외 항목, 좌측 목록에 없는 항목 제외
  const isCriteriaTarget = targetId === "criteria-list" || targetId === "year-criteria-list";
  const filtered = isCriteriaTarget
    ? items.filter((item) => item.status !== "notRequired" && !excluded.has(item.name) && (!allowed || allowed.has(item.name)))
    : items;
  filtered.forEach((item) => {
    const fragment = template.content.cloneNode(true);
    const status = statusMeta[item.status];
    fragment.querySelector(".result-category").textContent = item.category;
    fragment.querySelector(".result-name").textContent = item.name;
    fragment.querySelector(".result-reason").textContent = item.reason;
    const badge = fragment.querySelector(".result-status");
    badge.textContent = status.label;
    badge.classList.add(status.className);
    list.appendChild(fragment);
  });
}

function setSectionVisibility(sectionId, visible) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  section.classList.toggle("hidden", !visible);
}

function clearMultiuseSections() {
  ["multiuse-required-list", "multiuse-reason-list", "multiuse-transitional-notes"].forEach((id) => {
    const node = document.getElementById(id);
    if (node) node.innerHTML = "";
  });
  setSectionVisibility("open-multiuse-safety", false);
}

function renderTransitionalNotes(notes) {
  const container = document.getElementById("multiuse-transitional-notes");
  if (!container || !notes || notes.length === 0) return;
  const items = notes.map((n) => `<div class="transitional-item"><strong>${n.title}</strong><br>${n.text}</div>`).join("");
  container.innerHTML = `<div class="info-box amber"><div class="ib-title">경과규정 안내 — 기존 영업장 적용 제외 가능</div>${items}</div>`;
}

function renderSimpleRequiredList(items, targetId = "required-list") {
  const list = document.getElementById(targetId);
  list.innerHTML = "";
  items.forEach((item) => {
    const node = document.createElement("div");
    node.className = "facility-row";
    node.innerHTML = `<span class="fr-dot"></span><span>${item.name}</span>`;
    list.appendChild(node);
  });
}

function renderMultiuseRequiredSafetyList(multiuse, targetId) {
  const seen = new Set();
  const items = (multiuse.reasonItems || [])
    .filter((item) => item.status === "required" && item.name && !seen.has(item.name) && seen.add(item.name))
    .map((item) => ({ name: item.name }));
  renderSimpleRequiredList(items, targetId);
}

function buildMultiuseTransitionalNotes(flags) {
  const notes = [];
  if (flags.isSealed) {
    notes.push({
      title: "간이스프링클러설비 (밀폐구조 업소)",
      text: "2015년 1월 8일 이전부터 영업 중이고, 그 이후 안전시설등 설치신고 또는 영업장 내부구조 변경신고를 한 적이 없는 영업장은 간이스프링클러설비를 설치하지 않아도 됩니다.",
    });
  }
  if (flags.usesAV) {
    notes.push({
      title: "자동화재탐지설비 (영상음향장치 업소)",
      text: "2015년 1월 8일 이전부터 영업 중이고, 그 이후 안전시설등 설치신고 또는 영업장 내부구조 변경신고를 한 적이 없는 영업장은 비상벨설비를 유지해도 됩니다(자동화재탐지설비로 강화할 의무 없음).",
    });
    notes.push({
      title: "영상음향차단장치 자동연동",
      text: "2012년 2월 15일 이전부터 영업 중이고, 그 이후 안전시설등 설치신고 또는 내부구조 변경신고를 한 적이 없는 영업장은 자동화재탐지설비 감지기와의 자동연동 설치의무가 없습니다.",
    });
  }
  if (flags.hasEvacuationRoute) {
    notes.push({
      title: "피난유도선 (2018년 전면 확대분)",
      text: "2018년 7월 10일 이전부터 영업 중이고, 그 이후 영업장 내부구조 변경신고를 한 적이 없는 영업장은 2018년에 전면 확대된 피난유도선 설치의무가 없습니다.",
    });
  }
  if (flags.isGosiwon) {
    notes.push({
      title: "창문 (고시원)",
      text: "2007년 3월 25일 이전부터 영업 중인 기존 고시원은 창문 설치의무가 없습니다. 해당 일자 이후 신규 영업을 시작한 경우에만 적용됩니다.",
    });
  }
  notes.push({
    title: "비상구 추락방지 기준",
    text: "2016년 10월 19일 시행된 발코니·부속실 추락방지 기준(경보음 장치·쇠사슬 등)은 기존 영업장에 소급 적용되지 않습니다. 시행 이후 안전시설등 설치신고 또는 영업장 내부구조 변경신고를 하는 영업장부터 적용됩니다.",
  });
  return notes;
}

function evaluateMultiuseFacilities(input) {
  if (!input.hasMultiuseBusiness) {
    return { requiredItems: [], extraSafetyItems: [], reasonItems: [], transitionalNotes: [] };
  }

  const requiredItems = [
    { category: "다중이용업소 공통", name: "소화기", status: "required", reason: "다중이용업소 공통 설치대상이며, 구획된 실마다 설치해야 합니다." },
  ];

  // 간이스프링클러 (소화기 바로 다음)
  const simpleSprinklerReasons = [];
  if (input.multiuseInBasement) simpleSprinklerReasons.push("지하층에 설치돼 있습니다.");
  if (input.multiuseIsSealed) simpleSprinklerReasons.push("밀폐구조 영업장입니다.");
  if (input.multiuseIsPostpartum && !input.multiuseOnGroundOrRefugeFloor) simpleSprinklerReasons.push("산후조리업에 해당합니다.");
  if (input.multiuseIsGosiwon && !input.multiuseOnGroundOrRefugeFloor) simpleSprinklerReasons.push("고시원에 해당합니다.");
  if (input.multiuseIsGunRange) simpleSprinklerReasons.push("권총사격장에 해당합니다.");
  if (simpleSprinklerReasons.length) {
    requiredItems.push({ category: categories.extinguishing, name: "간이스프링클러설비", status: "required", reason: simpleSprinklerReasons.join(" ") });
  }

  // 비상벨설비 (항상)
  requiredItems.push({ category: "다중이용업소 공통", name: "비상벨설비", status: "required", reason: "다중이용업소 공통 설치대상이며, 비상벨설비 구성품 중 경종은 구획된 실마다 설치해야 합니다." });

  // 자동화재탐지설비 (영상음향장치 업소)
  if (input.multiuseUsesAV) {
    requiredItems.push({ category: categories.alarm, name: "자동화재탐지설비", status: "required", reason: "노래반주기 등 영상음향장치를 사용하는 영업장입니다." });
  }

  // 가스누설경보기
  if (input.multiuseHasGasFacility) {
    requiredItems.push({ category: categories.alarm, name: "가스누설경보기", status: "required", reason: "가스시설을 사용하는 주방 또는 난방시설이 있습니다." });
  }

  // 피난기구 (2~4층)
  if (input.multiuseOnSecondToTenthFloor) {
    requiredItems.push({ category: categories.evacuation, name: "피난기구", status: "required", reason: "다중이용업소가 2층부터 4층 사이에 설치돼 있어 피난기구 설치대상입니다. 주로 구조대나 피난사다리를 설치하며, 법에는 완강기 설치가 가능하지만 대구에서는 완강기 설치가 불가합니다." });
  }

  // 피난유도선 (피난통로/복도 있을 때)
  if (input.multiuseHasEvacuationRoute) {
    requiredItems.push({ category: categories.evacuation, name: "피난유도선", status: "required", reason: "영업장 내부 피난통로 또는 복도가 있습니다." });
  }

  // 유도등·휴대용비상조명등·비상구 (항상)
  requiredItems.push({ category: "다중이용업소 공통", name: "유도등", status: "required", reason: "다중이용업소 공통 설치대상이며, 구획된 실마다 설치해야 합니다." });
  requiredItems.push({ category: "다중이용업소 공통", name: "휴대용 비상조명등", status: "required", reason: "다중이용업소 공통 설치대상이며, 구획된 실마다 설치해야 합니다." });
  requiredItems.push({ category: "다중이용업소 공통", name: "비상구", status: "required", reason: "다중이용업소에는 비상구를 설치해야 합니다. 다만 주된 출입구 외에 해당 영업장 내부에서 피난층 또는 지상으로 통하는 직통계단이 주된 출입구 중심선으로부터 수평거리로 영업장의 긴 변 길이의 2분의 1 이상 떨어진 위치에 별도로 설치된 경우에는 비상구를 설치하지 않을 수 있습니다." });

  // 영업장 내부 피난통로 (구획된 실 있을 때)
  if (input.multiuseHasRooms) {
    requiredItems.push({ category: "다중이용업소 공통", name: "영업장 내부 피난통로", status: "required", reason: "구획된 실이 있는 다중이용업소는 내부 피난통로를 확보해야 합니다. 양옆에 구획된 실이 있는 경우 폭 150cm 이상, 그 외 120cm 이상이어야 하며, 3번 이상 구부러지는 형태는 금지됩니다." });
  }

  const extraSafetyItems = [];
  if (input.multiuseUsesAV) {
    extraSafetyItems.push({ category: "그 밖의 안전시설", name: "영상음향차단장치", status: "required", reason: "노래반주기 등 영상음향장치를 사용하는 영업장입니다." });
  }
  extraSafetyItems.push({ category: "그 밖의 안전시설", name: "누전차단기", status: "required", reason: "다중이용업소 공통 안전시설로 설치해야 합니다." });
  if (input.multiuseIsGosiwon) {
    extraSafetyItems.push({ category: "그 밖의 안전시설", name: "창문", status: "required", reason: "고시원이므로 창문을 설치해야 합니다." });
  }

  const etcItems = [];
  etcItems.push({ category: "기타", name: "피난안내도, 피난안내영상물", status: "required", reason: "다중이용업소이므로 피난안내도를 각 층마다 보기 쉬운 위치에 비치하거나 피난안내영상물을 상영해야 합니다." });
  etcItems.push({ category: "기타", name: "방염", status: "required", reason: "다중이용업소이므로 방염을 해야 합니다." });

  const transitionalNotes = buildMultiuseTransitionalNotes({
    isSealed: input.multiuseIsSealed,
    usesAV: input.multiuseUsesAV,
    hasEvacuationRoute: input.multiuseHasEvacuationRoute,
    isGosiwon: input.multiuseIsGosiwon,
  });

  const reasonItems = [...requiredItems, ...extraSafetyItems, ...etcItems];
  return { requiredItems, extraSafetyItems, etcItems, reasonItems, transitionalNotes };
}

function showExplorerCard(view) {
  questionCard.classList.toggle("hidden", view !== "question");
  resultCard.classList.toggle("hidden", view !== "main-result");
  multiuseSafetyCard.classList.toggle("hidden", view !== "multiuse-result");
  // 메인 결과 화면이면 단계바 ④결과 점등(다중이용업소 전용 모드는 바 숨김 상태라 제외)
  if (view === "main-result" && explorerRuntime.mode !== "multiuse-only") {
    renderPhaseBar(document.getElementById("phase-steps"), 3);
  }
}

function showExplorerResultWithLoading(view = "main-result") {
  showIlguLoading(() => {
    showExplorerCard(view);
    scrollToTop();
  });
}

function renderMultiuseEntryButton(_input) {
  // 다중이용업소 안전시설은 탐색기 결과에서 제거됨 (실험실에서 접근)
}

function renderLodgingMultiuseEntryButton(_input) {
  // 다중이용업소 안전시설은 탐색기 결과에서 제거됨 (실험실에서 접근)
}

function renderMultiuseSafetyCard(input) {
  clearMultiuseSections();
  const multiuse = evaluateMultiuseFacilities(input);
  document.getElementById("multiuse-safety-summary").innerHTML = `<div class="ib-title">다중이용업소 안전시설 기준</div>입력한 조건을 기준으로 다중이용업소에 설치해야 하는 안전시설만 별도로 정리했습니다.`;
  renderMultiuseRequiredSafetyList(multiuse, "multiuse-required-list");
  renderResultGroup("multiuse-reason-list", multiuse.reasonItems);
  renderTransitionalNotes(multiuse.transitionalNotes);
}

function renderLodgingMultiuseSafetyCard(input) {
  clearMultiuseSections();
  const multiuse = evaluateLodgingMultiuseFacilities(input);
  document.getElementById("multiuse-safety-summary").innerHTML = `<div class="ib-title">다중이용업소 안전시설 기준</div>입력한 조건을 기준으로 다중이용업소에 설치해야 하는 안전시설만 별도로 정리했습니다.`;
  renderMultiuseRequiredSafetyList(multiuse, "multiuse-required-list");
  renderResultGroup("multiuse-reason-list", multiuse.reasonItems);
  renderTransitionalNotes(multiuse.transitionalNotes);
}

function renderResults(results, input) {
  ensureEmergencyElevatorSmokeControl(results, input, { allowRefugeElevator: true });
  const exceptionItems = buildExceptionItems(results, input);
  const requiredItems = buildRequiredItems(results, input, exceptionItems);
  const excludedNames = exceptionItems.filter((e) => e.category === "설치 제외").map((e) => e.name);
  explorerViewState.lastInput = input;
  document.getElementById("result-summary").innerHTML = `<div class="ib-title">입력값 기준</div>${getSubtypeLabel(input.facilitySubtype)}, 연면적 ${input.totalArea}㎡, 지상 ${input.aboveGroundFloors}층, 지하 ${input.basementFloors}층`;
  renderSimpleRequiredList(requiredItems);
  renderResultGroup("criteria-list", results, excludedNames, requiredItems.map((i) => i.name));
  renderResultGroup("exception-list", exceptionItems);
  renderMultiuseEntryButton(input);
}

function renderThirdClassPre1992Results(results, input) {
  const requiredItems = results.filter((item) => item.status === "required");
  explorerViewState.lastInput = input;
  document.getElementById("result-summary").innerHTML = `<div class="ib-title">3급 근린생활시설 기준</div>${getThirdClassPeriodLabel(input.pre1992PermitRange)} / ${getThirdClassDetailLabel(input.thirdClassDetailUse)} / 연면적 ${input.totalArea}㎡ / 지상 ${input.aboveGroundFloors}층 / 지하 ${input.basementFloors}층`;
  renderSimpleRequiredList(requiredItems);
  renderResultGroup("criteria-list", results, undefined, requiredItems.map((i) => i.name));
  if (input.totalArea >= 2100) {
    document.getElementById("exception-list").innerHTML = `
      <article class="result-item">
        <div class="result-top">
          <div>
            <p class="result-category">주의</p>
            <h4 class="result-name">옥내소화전설비 대상 여부 재확인</h4>
          </div>
          <span class="result-status status-review">확인 필요</span>
        </div>
        <p class="result-reason">연면적이 2,100㎡ 이상이면 옥내소화전설비 설치대상에 해당할 수 있습니다. 옥내소화전설비가 설치되면 2급 이상 소방안전관리대상물입니다. 연면적 등 조건을 제대로 기입했는지 다시 한번 확인해주세요.</p>
      </article>
    `;
  } else {
    document.getElementById("exception-list").innerHTML = "";
  }
  renderMultiuseEntryButton(input);
}

function renderThirdClassPendingGuide(input) {
  explorerViewState.lastInput = input;
  document.getElementById("result-summary").innerHTML = `<div class="ib-title">3급 근린생활시설 기준</div>건축허가일이 1992년 7월 28일 이후인 경로의 기준은 아직 입력 전입니다.`;
  document.getElementById("required-list").innerHTML = "";
  document.getElementById("criteria-list").innerHTML = `
    <article class="result-item">
      <div class="result-top">
        <div>
          <p class="result-category">안내</p>
          <h4 class="result-name">기준 입력 대기</h4>
        </div>
        <span class="result-status status-review">확인 필요</span>
      </div>
      <p class="result-reason">3급 근린생활시설 중 1992년 7월 28일 이후 건축허가 대상의 소방시설 설치기준은 아직 입력되지 않았습니다.</p>
    </article>
  `;
  document.getElementById("exception-list").innerHTML = "";
  renderMultiuseEntryButton(input);
}

let toastTimer = null;
function showToast(message) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  if (toastTimer) clearTimeout(toastTimer);
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  toastTimer = setTimeout(() => {
    toast.classList.add("toast-out");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  }, 2800);
}

function scrollToTop() {
  const scrollEl = document.querySelector("#screen-explorer .scroll-content");
  if (scrollEl) scrollEl.scrollTop = 0;
}

function moveStep(direction) {
  if (!currentStepIsValid()) {
    showToast("현재 질문의 값을 먼저 입력해 주세요.");
    return;
  }
  const activeSteps = getActiveSteps();
  state.currentStep = Math.max(0, Math.min(state.currentStep + direction, activeSteps.length - 1));
  renderCurrentStep();
  scrollToTop();
}

function showResults() {
  if (!currentStepIsValid()) {
    showToast("현재 질문의 값을 먼저 입력해 주세요.");
    return;
  }
  if (explorerRuntime.mode === "multiuse-only") {
    const input = normalizeAnswers();
    explorerViewState.lastInput = input;
    renderMultiuseSafetyCard(input);
    const backBtn = document.getElementById("back-to-main-result");
    if (backBtn) backBtn.textContent = "이전 질문으로";
    showIlguLoading(() => { showExplorerCard("multiuse-result"); scrollToTop(); });
    return;
  }
  if (!["neighborhood", "lodging", "elderly", "medical"].includes(state.answers.occupancyType)) {
    showToast("지금은 근린생활시설, 숙박시설, 노유자시설, 의료시설만 판정할 수 있습니다. 해당 용도를 선택해 주세요.");
    return;
  }
  const input = normalizeAnswers();

  if (input.occupancyType === "lodging") {
    const results = evaluateLodgingFacility(input);
    ensureEmergencyElevatorSmokeControl(results, input, { allowRefugeElevator: true });
    const exceptionItems = buildLodgingExceptionItems(results, input);
    const requiredItems = buildLodgingRequiredItems(results, input, exceptionItems);
    const excludedNames = exceptionItems.filter((e) => e.category === "설치 제외").map((e) => e.name);
    explorerViewState.lastInput = input;
    document.getElementById("result-summary").innerHTML = `<div class="ib-title">입력값 기준</div>숙박시설, 연면적 ${input.lodgingTotalArea}㎡, 숙박 사용면적 ${input.lodgingArea}㎡, 지상 ${input.lodgingAboveGroundFloors}층, 지하 ${input.lodgingBasementFloors}층`;
    renderSimpleRequiredList(requiredItems);
    renderResultGroup("criteria-list", results, excludedNames, requiredItems.map((i) => i.name));
    renderResultGroup("exception-list", exceptionItems);
    renderLodgingMultiuseEntryButton(input);
    renderExtraItems(input);
    showExplorerResultWithLoading();
    return;
  }

  if (input.occupancyType === "elderly") {
    const results = evaluateElderlyFacility(input);
    ensureEmergencyElevatorSmokeControl(results, input, { allowRefugeElevator: true });
    const exceptionItems = buildElderlyExceptionItems(results, input);
    const requiredItems = buildElderlyRequiredItems(results, input, exceptionItems);
    const excludedNames = exceptionItems.filter((e) => e.category === "설치 제외").map((e) => e.name);
    explorerViewState.lastInput = input;
    const subtypeLabel = input.elderlySubtype === "livingFacility" ? "노유자 생활시설" : "일반 노유자시설";
    document.getElementById("result-summary").innerHTML = `<div class="ib-title">입력값 기준</div>노유자시설(${subtypeLabel}), 연면적 ${input.elderlyTotalArea}㎡, 노유자 사용면적 ${input.elderlyArea}㎡, 지상 ${input.elderlyAboveGroundFloors}층, 지하 ${input.elderlyBasementFloors}층`;
    renderSimpleRequiredList(requiredItems);
    renderResultGroup("criteria-list", results, excludedNames, requiredItems.map((i) => i.name));
    renderResultGroup("exception-list", exceptionItems);
    const button = document.getElementById("open-multiuse-safety");
    if (button) button.classList.add("hidden");
    renderExtraItems(input);
    showExplorerResultWithLoading();
    return;
  }

  if (input.occupancyType === "medical") {
    const results = evaluateMedicalFacility(input);
    ensureEmergencyElevatorSmokeControl(results, input, { allowRefugeElevator: true });
    const exceptionItems = buildMedicalExceptionItems(results, input);
    const requiredItems = buildMedicalRequiredItems(results, input, exceptionItems);
    const excludedNames = exceptionItems.filter((e) => e.category === "설치 제외").map((e) => e.name);
    explorerViewState.lastInput = input;
    const subtypeLabels = {
      generalHospital: "종합병원",
      hospital: "병원·치과병원·한방병원",
      nursingHome: "요양병원",
      psychiatricHospital: "정신의료기관",
      rehabilitationFacility: "의료재활시설",
    };
    const subtypeLabel = subtypeLabels[input.medicalSubtype] || "의료시설";
    document.getElementById("result-summary").innerHTML = `<div class="ib-title">입력값 기준</div>의료시설(${subtypeLabel}), 연면적 ${input.medicalTotalArea}㎡, 의료 사용면적 ${input.medicalArea}㎡, 지상 ${input.medicalAboveGroundFloors}층, 지하 ${input.medicalBasementFloors}층`;
    renderSimpleRequiredList(requiredItems);
    renderResultGroup("criteria-list", results, excludedNames, requiredItems.map((i) => i.name));
    renderResultGroup("exception-list", exceptionItems);
    const button = document.getElementById("open-multiuse-safety");
    if (button) button.classList.add("hidden");
    renderExtraItems(input);
    showExplorerResultWithLoading();
    return;
  }

  const results = evaluateNeighborhoodFacility(input);
  renderExtraItems(input);
  renderResults(results, input);
  showExplorerResultWithLoading();
}

function getFloorCount(input) {
  switch (input.occupancyType) {
    case "lodging": return input.lodgingAboveGroundFloors || input.aboveGroundFloors || 0;
    case "elderly": return input.elderlyAboveGroundFloors || input.aboveGroundFloors || 0;
    case "medical": return input.medicalAboveGroundFloors || input.aboveGroundFloors || 0;
    default: return input.aboveGroundFloors || 0;
  }
}

function buildExtraItems(input, options = {}) {
  const items = [];
  const facilityNames = { lodging: "숙박시설", elderly: "노유자시설", medical: "의료시설" };
  const floors = getFloorCount(input);
  const allowRefugeElevator = options.allowRefugeElevator === true;
  const requirePermitDateForRefugeElevator = options.requirePermitDateForRefugeElevator === true;
  const usePermitBasedLodgingFlameproof = options.usePermitBasedLodgingFlameproof === true;
  const refugeElevatorRequired = allowRefugeElevator
    && floors >= 30
    && (!requirePermitDateForRefugeElevator || (input.pd || 0) >= YD.D20181018);

  if (input.occupancyType === "lodging" && usePermitBasedLodgingFlameproof) {
    if ((input.pd || 0) >= YD.D20010101) {
      items.push({ name: "방염", reason: "2001년 1월 1일 이후 허가된 모든 숙박시설은 방염 규정 적용 대상입니다." });
    } else if (floors >= 3) {
      items.push({ name: "방염", reason: "2001년 1월 1일 이전 허가된 숙박시설은 3층 이상일 때 방염 규정 적용 대상입니다." });
    }
  } else if (["lodging", "elderly", "medical"].includes(input.occupancyType)) {
    items.push({ name: "방염", reason: `${facilityNames[input.occupancyType]}은 방염 규정 적용 대상입니다.` });
  } else if (input.occupancyType === "religious") {
    if ((input.pd || 0) >= YD.D20110707) {
      items.push({ name: "방염", reason: "2011년 7월 7일 이후 허가된 종교시설은 방염 규정 적용 대상입니다." });
    } else if (floors >= 11) {
      items.push({ name: "방염", reason: "11층 이상 건물은 방염 규정 적용 대상입니다." });
    }
  } else if ((input.occupancyType === "neighborhood" || input.occupancyType === "sales") && floors >= 11) {
    items.push({ name: "방염", reason: "11층 이상 건물은 방염 규정 적용 대상입니다." });
  }

  if (floors >= 5) {
    items.push({ name: "방화문", reason: "5층 이상 건물에 설치 대상입니다." });
    if (floors < 11) {
      items.push({ name: "피난계단", reason: "5층 이상 또는 지하 2층 이하 건물에 설치 대상입니다." });
    }
  }
  if (floors >= 11) {
    items.push({ name: "특별피난계단", reason: "11층 이상 건물에 설치 대상입니다. (피난계단 포함)" });
    if (refugeElevatorRequired) {
      items.push({ name: "피난용승강기", reason: requirePermitDateForRefugeElevator
        ? "2018년 10월 18일 이후 허가 건물이고 30층 이상이므로 피난용승강기 설치 대상입니다."
        : "30층 이상 건물로 피난용승강기 설치 대상입니다." });
    } else {
      items.push({ name: "비상용 승강기", reason: "11층 이상 건물에 설치 대상입니다." });
    }
  }
  return items;
}

function ensureEmergencyElevatorSmokeControl(results, input, options = {}) {
  if (input.occupancyType === "apartment") return; // 공동주택은 갓복도형 제외 등 자체 제연 로직 사용
  const hasEmergencyElevator = buildExtraItems(input, options)
    .some((item) => item.name === "비상용 승강기");
  if (!hasEmergencyElevator) return;

  const smokeControl = results.find((item) => item.name === "제연설비");
  if (!smokeControl || smokeControl.status === "required") return;

  smokeControl.status = "required";
  smokeControl.reason = "비상용 승강기 승강장 부속실에 제연설비를 설치해야 합니다.";
}

// 자세한 버전(분법 이후) 공통: 30층 이상 특정소방대상물 자동화재속보설비
function ensureAutoFireNotify30F(results, input) {
  if (input.occupancyType === "apartment") return; // 공동주택은 2012.9.14~2022.11.30 기준을 자체 처리
  const pd = input.pd || input.permitDateInt || 0;
  const startDate = input.occupancyType === "sales" ? YD.D20150701 : YD.D20111123;
  if (pd < startDate || pd >= YD.D20221201) return;
  if ((input.aboveGroundFloors || 0) < 30) return;
  const item = results.find((r) => r.name === "자동화재속보설비");
  if (!item || item.status === "required") return;
  item.status = "required";
  item.reason = `층수가 30층 이상인 특정소방대상물입니다. (${startDate === YD.D20150701 ? "2015.7.1" : "2011.11.23"}~2022.11.30 공통 설치 기준)`;
}

function suppressBefore2004LowRiseEscapeItems(results, input) {
  if ((input.aboveGroundFloors || 0) >= 3) return;
  for (let i = results.length - 1; i >= 0; i--) {
    if (String(results[i].name || "").includes("피난기구")) {
      results.splice(i, 1);
    }
  }
}

function renderExtraItemsToTarget(input, sectionId, listId, options = {}) {
  const section = document.getElementById(sectionId);
  const list = document.getElementById(listId);
  if (!section || !list) return;

  const items = buildExtraItems(input, options);

  list.innerHTML = "";
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "facility-row";
    row.innerHTML = `<span class="fr-dot" style="background:var(--amber);"></span><span>${item.name}</span>`;
    list.appendChild(row);
  });

  section.classList.toggle("hidden", items.length === 0);
}

function renderExtraItems(input) {
  renderExtraItemsToTarget(input, "extra-items-section", "extra-items-list", { allowRefugeElevator: true });
}

function renderYearExtraItems(input) {
  renderExtraItemsToTarget(input, "year-extra-items-section", "year-extra-items-list", {
    allowRefugeElevator: true,
    requirePermitDateForRefugeElevator: true,
    usePermitBasedLodgingFlameproof: true,
  });
}

function restartExplorer() {
  state.currentStep = 0;
  explorerViewState.lastInput = null;
  Object.assign(state.answers, {
    occupancyType: "neighborhood",
    facilitySubtype: "general",
    postpartumAreaRange: "under600",
    isThirdClassNeighborhood: "no",
    permitBefore1992: "no",
    pre1992PermitRange: "1982-08-07_to_1984-06-30",
    thirdClassDetailUse: "general",
    totalArea: 1600,
    neighborhoodArea: 1600,
    aboveGroundFloors: 6,
    basementFloors: 1,
    basementAreaSum: 180,
    hasWindowlessFloor: "no",
    windowlessArea: 0,
    hasLargeTargetFloor: "yes",
    firstSecondFloorArea: 0,
    indoorParkingArea: 0,
    parkingStructureArea: 0,
    mechanicalParkingCapacity: 0,
    electricalRoomArea: 0,
    has24HourStaff: "no",
    hasMultiuseBusiness: "no",
    multiuseInBasement: "no",
    multiuseIsSealed: "no",
    multiuseIsPostpartum: "no",
    multiuseIsGosiwon: "no",
    multiuseIsGunRange: "no",
    multiuseOnSecondToTenthFloor: "no",
    multiuseOnGroundOrRefugeFloor: "no",
    multiuseUsesAV: "no",
    multiuseHasGasFacility: "no",
    multiuseHasRooms: "no",
    multiuseHasEvacuationRoute: "no",
    // 숙박시설
    lodgingArea: 450,
    lodgingTotalArea: 2000,
    lodgingAboveGroundFloors: 8,
    lodgingBasementFloors: 1,
    lodgingBasementAreaSum: 200,
    lodgingHasWindowlessFloor: "no",
    lodgingWindowlessArea: 0,
    lodgingHasLargeFloorFor1000: "no",
    lodgingHasGasFacility: "no",
    lodgingIsTouristHotel: "no",
    lodgingIndoorParkingArea: 0,
    lodgingParkingStructureArea: 0,
    lodgingMechanicalParkingCapacity: 0,
    lodgingElectricalRoomArea: 0,
    lodgingHasMultiuseBusiness: "no",
    lodgingMultiuseInBasement: "no",
    lodgingMultiuseIsSealed: "no",
    lodgingMultiuseIsPostpartum: "no",
    lodgingMultiuseIsGosiwon: "no",
    lodgingMultiuseIsGunRange: "no",
    lodgingMultiuseOnSecondToTenthFloor: "no",
    lodgingMultiuseOnGroundOrRefugeFloor: "no",
    lodgingMultiuseUsesAV: "no",
    lodgingMultiuseHasGasFacility: "no",
    lodgingMultiuseHasRooms: "no",
    lodgingMultiuseHasEvacuationRoute: "no",
    // 노유자시설
    elderlySubtype: "general",
    elderlyTotalArea: 1200,
    elderlyArea: 500,
    elderlyAboveGroundFloors: 4,
    elderlyBasementFloors: 0,
    elderlyBasementAreaSum: 0,
    elderlyHasWindowlessFloor: "no",
    elderlyWindowlessArea: 0,
    elderlyHasLargeTargetFloor: "no",
    elderlyHasGrillWindow: "no",
    elderlyHasFloor500Plus: "no",
    elderlyHas24HourStaff: "no",
    elderlyHasGasFacility: "no",
    elderlyIndoorParkingArea: 0,
    elderlyParkingStructureArea: 0,
    elderlyMechanicalParkingCapacity: 0,
    elderlyElectricalRoomArea: 0,
    // 의료시설
    medicalSubtype: "hospital",
    medicalTotalArea: 2000,
    medicalArea: 1500,
    medicalAboveGroundFloors: 5,
    medicalBasementFloors: 1,
    medicalBasementAreaSum: 300,
    medicalHasWindowlessFloor: "no",
    medicalWindowlessArea: 0,
    medicalHasGrillWindow: "no",
    medicalHasGasFacility: "no",
    medicalIndoorParkingArea: 0,
    medicalParkingStructureArea: 0,
    medicalMechanicalParkingCapacity: 0,
    medicalElectricalRoomArea: 0,
  });
  showExplorerCard("question");
  clearMultiuseSections();
  renderCurrentStep();
  scrollToTop();
}

function restartMultiuseOnly() {
  state.currentStep = 0;
  explorerViewState.lastInput = null;
  Object.assign(state.answers, {
    occupancyType: "neighborhood",
    hasMultiuseBusiness: "yes",
    multiuseInBasement: "no",
    multiuseIsSealed: "no",
    multiuseIsPostpartum: "no",
    multiuseIsGosiwon: "no",
    multiuseIsGunRange: "no",
    multiuseOnSecondToTenthFloor: "no",
    multiuseOnGroundOrRefugeFloor: "no",
    multiuseUsesAV: "no",
    multiuseHasGasFacility: "no",
    multiuseHasRooms: "no",
    multiuseHasEvacuationRoute: "no",
  });
  showExplorerCard("question");
  clearMultiuseSections();
  renderCurrentStep();
  scrollToTop();
}

let _holidaysJsonCache = null;

// 옛 사이트(carrotcakehope.github.io/fireapp)엔 holidays.json이 없다(404).
// 그 파일은 fetch-holidays Action이 새 repo(fire-assistant/app)에만 자동 커밋하기 때문.
// 그래서 상대경로 실패 시 새 사이트 절대경로로 폴백한다. (GitHub Pages는 CORS * 허용)
const HOLIDAYS_FALLBACK_URL = "https://fire-assistant.github.io/app/holidays.json";

async function fetchHolidaysFrom(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

async function loadHolidaysJson() {
  if (_holidaysJsonCache !== null) return _holidaysJsonCache;
  try {
    _holidaysJsonCache = await fetchHolidaysFrom("./holidays.json");
  } catch {
    try {
      _holidaysJsonCache = await fetchHolidaysFrom(HOLIDAYS_FALLBACK_URL);
    } catch {
      return {};
    }
  }
  return _holidaysJsonCache;
}

async function fetchKoreanHolidays(year) {
  if (state.dateCalc.apiHolidays[year] !== undefined) return;
  state.dateCalc.apiHolidays[year] = null;
  const all = await loadHolidaysJson();
  state.dateCalc.apiHolidays[year] = all[String(year)] ?? [];
  renderDateCalculator();
}

function getApiHolidaySet() {
  const result = new Set();
  for (const arr of Object.values(state.dateCalc.apiHolidays)) {
    if (Array.isArray(arr)) arr.forEach(d => result.add(d));
  }
  return result;
}

function attachHorizontalSwipeNavigation(root, getOptions) {
  if (!root || root.dataset.swipeNavBound === "true") return;
  root.dataset.swipeNavBound = "true";

  let startX = 0;
  let startY = 0;
  let pointerId = null;
  let ignoreSwipe = false;
  let suppressClick = false;

  const interactiveSelector = [
    "input",
    "select",
    "textarea",
    "[contenteditable='true']",
  ].join(",");

  const start = (x, y, target, id = null) => {
    pointerId = id;
    startX = x;
    startY = y;
    ignoreSwipe = !!target.closest?.(interactiveSelector);
  };

  const finish = (x, y, id = null) => {
    if (id !== null && pointerId !== id) return;
    if (ignoreSwipe) return;
    pointerId = null;

    const dx = x - startX;
    const dy = y - startY;
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.25) return;

    const options = getOptions();
    if (!options || !Array.isArray(options.keys) || !options.current || typeof options.onChange !== "function") return;

    const currentIndex = options.keys.indexOf(options.current);
    if (currentIndex < 0) return;

    const nextIndex = dx < 0
      ? Math.min(currentIndex + 1, options.keys.length - 1)
      : Math.max(currentIndex - 1, 0);
    const next = options.keys[nextIndex];
    if (next && next !== options.current) {
      suppressClick = true;
      root.dataset.swipeNavDirection = dx < 0 ? "next" : "prev";
      options.onChange(next);
    }
  };

  root.addEventListener("pointerdown", (event) => {
    if (event.pointerType && event.pointerType !== "touch") return;
    start(event.clientX, event.clientY, event.target, event.pointerId);
  }, { passive: true });

  root.addEventListener("pointerup", (event) => {
    if (pointerId !== event.pointerId) return;
    finish(event.clientX, event.clientY, event.pointerId);
  }, { passive: true });

  root.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    start(touch.clientX, touch.clientY, event.target);
  }, { passive: true });

  root.addEventListener("touchend", (event) => {
    const touch = event.changedTouches[0];
    if (!touch) return;
    finish(touch.clientX, touch.clientY);
  }, { passive: true });

  root.addEventListener("pointercancel", () => {
    pointerId = null;
  }, { passive: true });

  root.addEventListener("touchcancel", () => {
    pointerId = null;
  }, { passive: true });

  root.addEventListener("click", (event) => {
    if (!suppressClick) return;
    suppressClick = false;
    event.preventDefault();
    event.stopPropagation();
  }, true);
}

function animateSwipeNavigation(root) {
  const direction = root?.dataset?.swipeNavDirection;
  if (direction !== "next" && direction !== "prev") return;

  delete root.dataset.swipeNavDirection;
  root.classList.remove("swipe-tab-enter-next", "swipe-tab-enter-prev");
  void root.offsetWidth;
  root.classList.add(direction === "next" ? "swipe-tab-enter-next" : "swipe-tab-enter-prev");
  window.setTimeout(() => {
    root.classList.remove("swipe-tab-enter-next", "swipe-tab-enter-prev");
  }, 380);
}

function renderDateCalculator() {
  const root = document.getElementById("date-content");
  const lawChip = document.getElementById("date-law-chip");
  if (lawChip && state.dateCalc.mode) {
    lawChip.dataset.lawKey = "date-" + state.dateCalc.mode;
  }
  const prevLeftScroll = root.querySelector(".date-left")?.scrollTop ?? 0;
  const prevRightScroll = root.querySelector(".date-right")?.scrollTop ?? 0;
  const prevTabsScroll = root.querySelector(".dc-mode-tabs")?.scrollLeft ?? 0;
  const activeElement = document.activeElement;
  const prevActiveId = activeElement ? activeElement.id : "";
  const mode = CALC_MODES[state.dateCalc.mode];
  const baseDate = parseDate(state.dateCalc.baseDate);
  const modeIntroBody = mode.kind === "inspect_report"
    ? `점검완료일로부터 ${mode.days}일 이내에 소방서에 신고해야 합니다. 토요일·일요일·공휴일은 기한 계산에서 제외됩니다.`
    : (mode.introBody ?? mode.infoBody);
  const modeInfoBody = mode.kind === "inspect_report"
    ? mode.infoBody
    : mode.infoBody;
  if (mode.supportsHolidaySelection) {
    const baseYear = parseDate(state.dateCalc.baseDate).getFullYear();
    [baseYear, baseYear + 1, state.dateCalc.viewYear].forEach(y => {
      if (state.dateCalc.apiHolidays[y] === undefined) fetchKoreanHolidays(y);
    });
  }
  const apiHolidaySet = mode.supportsHolidaySelection ? getApiHolidaySet() : new Set();
  const holidayKeys = new Set(mode.supportsHolidaySelection ? [...state.dateCalc.holidays, ...apiHolidaySet] : []);
  const rangeKeys = new Set();
  const appointRangeKeys = new Set();
  const reportRangeKeys = new Set();
  let deadline = null;
  let appointDeadline = null;
  let reportDeadline = null;
  let resultSection = "";
  let legendMarkup = "";
  let tableBody = mode.tableBody;
  let assistantCalculatorSection = "";
  const tableClassName = mode.kind === "noncompliance_dual"
    ? "calc-table calc-table-noncompliance"
    : mode.kind === "manager_dual"
      ? "calc-table calc-table-manager"
    : "calc-table";
  const renderTableCell = (cell) => {
    const html = String(cell);
    if (mode.kind !== "manager_dual" || !/[①②③④⑤⑥⑦⑧⑨⑩]/.test(html)) return html;
    return html
      .split(/(?=[①②③④⑤⑥⑦⑧⑨⑩])/)
      .filter(Boolean)
      .map((part) => `<span class="dc-doc-item">${part.replace(/<br>\s*$/, "")}</span>`)
      .join("");
  };

  if (mode.kind === "inspect_report") {
    const countedDates = addInspectReportDays(baseDate, mode.days, holidayKeys);
    countedDates.forEach((date) => rangeKeys.add(dateKey(date)));
    deadline = countedDates[countedDates.length - 1];
    if (deadline) {
      const cur = new Date(baseDate); cur.setDate(cur.getDate() + 1);
      while (cur <= deadline) {
        const k = dateKey(cur);
        if (holidayKeys.has(k)) rangeKeys.add(k);
        cur.setDate(cur.getDate() + 1);
      }
    }
    resultSection = `
      <section class="calc-result">
        <div class="calc-result-label">${mode.resultLabel}</div>
        <div class="calc-result-date">${formatDate(deadline)}</div>
        <div class="calc-result-meta">기산일: ${formatDate(baseDate)} / 기준 기한: ${mode.days}일</div>
      </section>
    `;
    legendMarkup = `
      <div class="cl-item"><span class="cl-dot" style="background: transparent; border: 2px solid var(--red);"></span>선택일</div>
      <div class="cl-item"><span class="cl-dot" style="background: rgba(217, 48, 37, 0.18);"></span>산정 날짜</div>
      <div class="cl-item"><span class="cl-dot" style="background: rgba(217, 48, 37, 0.45); border: 1.5px solid rgba(217, 48, 37, 0.85);"></span>마감일</div>
      <div class="cl-item"><span class="cl-dot cl-dot-holiday"></span>입력 공휴일</div>
    `;
  }

  if (mode.kind === "manager_dual") {
    const appointDates = getSequentialDates(baseDate, mode.appointDays);
    appointDeadline = appointDates[appointDates.length - 1];
    const reportDates = getSequentialDates(appointDeadline, mode.reportDays);
    const rawReportDeadline = reportDates[reportDates.length - 1];
    reportDeadline = moveToNextBusinessDay(rawReportDeadline, holidayKeys);
    appointDates.forEach((date) => appointRangeKeys.add(dateKey(date)));
    reportDates.forEach((date) => reportRangeKeys.add(dateKey(date)));
    if (!sameDate(rawReportDeadline, reportDeadline)) {
      let cursor = addDays(rawReportDeadline, 1);
      while (cursor <= reportDeadline) {
        reportRangeKeys.add(dateKey(cursor));
        cursor = addDays(cursor, 1);
      }
    }
    resultSection = `
      <section class="calc-result calc-result-dual">
        <div class="calc-result-label">${mode.resultLabel}</div>
        <div class="calc-result-grid">
          <div class="calc-result-block">
            <div class="calc-result-sub">선임기한</div>
            <div class="calc-result-date calc-result-date-appoint">${formatDate(appointDeadline)}</div>
          </div>
          <div class="calc-result-block">
            <div class="calc-result-sub">선임신고기한</div>
            <div class="calc-result-date calc-result-date-report">${formatDate(reportDeadline)}</div>
          </div>
        </div>
        <div class="calc-result-meta">기산일: ${formatDate(baseDate)} / 선임 다음날부터 선임 ${mode.appointDays}일, 선임기한 종료 다음날부터 선임신고 ${mode.reportDays}일, 신고 마지막 날이 토요일·공휴일이면 다음 평일까지</div>
      </section>
    `;
    legendMarkup = `
      <div class="cl-item"><span class="cl-dot" style="background: transparent; border: 2px solid var(--red);"></span>선택일</div>
      <div class="cl-item"><span class="cl-dot cl-dot-appoint-range"></span>선임기한 범위</div>
      <div class="cl-item"><span class="cl-dot" style="background: rgba(217, 48, 37, 0.45); border: 1.5px solid rgba(217, 48, 37, 0.85);"></span>선임기한</div>
      <div class="cl-item"><span class="cl-dot cl-dot-report-range"></span>선임신고 범위</div>
      <div class="cl-item"><span class="cl-dot" style="background: rgba(66, 133, 244, 0.42); border: 1.5px solid rgba(66, 133, 244, 0.85);"></span>선임신고기한</div>
      <div class="cl-item"><span class="cl-dot cl-dot-holiday"></span>입력 공휴일</div>
    `;
  }

  if (mode.kind === "noncompliance_dual") {
    const actionType = mode.actionTypes[state.dateCalc.noncomplianceType] ?? mode.actionTypes.repair;
    const completionDates = getInclusiveDates(baseDate, actionType.completionDays);
    const completionDeadline = completionDates[completionDates.length - 1];
    const reportDates = addInspectReportDays(completionDeadline, mode.reportDays, holidayKeys);
    appointDeadline = completionDeadline;
    reportDeadline = reportDates[reportDates.length - 1];
    completionDates.forEach((date) => appointRangeKeys.add(dateKey(date)));
    reportDates.forEach((date) => reportRangeKeys.add(dateKey(date)));
    tableBody = [
      ["10일<br><span style='color:var(--text-dim);font-size:11px'>수리·정비</span>", "감지기 탈락·불량, 위치표시등 또는 유도등 조도 불량, 수신기 예비전원 불량, 호스·노즐 교체, 소화기 수량 부족 등"],
      ["20일<br><span style='color:var(--text-dim);font-size:11px'>전부·일부 교체</span>", "수신기 교체, 소화펌프 교체 등"],
    ];
    resultSection = `
      <section class="calc-result calc-result-dual">
        <div class="calc-result-label">${mode.resultLabel}</div>
        <div class="calc-result-grid">
          <div class="calc-result-block">
            <div class="calc-result-sub">이행완료기한</div>
            <div class="calc-result-date calc-result-date-appoint">${formatDate(appointDeadline)}</div>
          </div>
          <div class="calc-result-block">
            <div class="calc-result-sub">완료신고기한</div>
            <div class="calc-result-date calc-result-date-report">${formatDate(reportDeadline)}</div>
          </div>
        </div>
        <div class="calc-result-meta">보고일: ${formatDate(baseDate)} / 자체점검 실시결과 보고일부터 ${actionType.completionDays}일 이내 이행,<br> 조치완료 다음날부터 주말·공휴일을 제외한 10일 신고</div>
      </section>
    `;
    legendMarkup = `
      <div class="cl-item"><span class="cl-dot" style="background: transparent; border: 2px solid var(--red);"></span>선택일</div>
      <div class="cl-item"><span class="cl-dot cl-dot-appoint-range"></span>이행완료 범위</div>
      <div class="cl-item"><span class="cl-dot" style="background: rgba(217, 48, 37, 0.45); border: 1.5px solid rgba(217, 48, 37, 0.85);"></span>이행완료기한</div>
      <div class="cl-item"><span class="cl-dot cl-dot-report-range"></span>완료신고 범위</div>
      <div class="cl-item"><span class="cl-dot" style="background: rgba(66, 133, 244, 0.42); border: 1.5px solid rgba(66, 133, 244, 0.85);"></span>완료신고기한</div>
      <div class="cl-item"><span class="cl-dot cl-dot-holiday"></span>입력 공휴일</div>
    `;
  }

  if (mode.assistantCalculator) {
    const assistantTargetType = state.dateCalc.assistantTargetType === "other" ? "other" : "apartment";
    const assistantValue = assistantTargetType === "apartment"
      ? state.dateCalc.assistantHouseholds
      : state.dateCalc.assistantArea;
    const staffingResult = getAssistantStaffingResult(assistantTargetType, assistantValue);
    const isApartment = assistantTargetType === "apartment";
    const inputLabel = isApartment ? "세대수" : "연면적";
    const inputPlaceholder = isApartment ? "예: 601" : "예: 30001";
    const helperText = isApartment
      ? "해당 아파트의 세대수를 300으로 나누고 소수점은 버립니다."
      : "기숙사, 의료시설, 노유자시설, 수련시설, 숙박시설을 제외한 대상 기준입니다. <br>해당 특정소방대상물의 연면적을 15,000으로 나누고 소수점은 버립니다.";
    const exampleText = isApartment
      ? "예시: 299세대 0명 / 599세대 1명 / 601세대 2명"
      : "예시: 14,999㎡ 0명 / 29,999㎡ 1명 / 30,001㎡ 2명";
    const resultMarkup = staffingResult
      ? `
        <div class="assistant-staffing-result">
          <div class="assistant-staffing-count">${staffingResult.count}<span>명</span></div>
          <div class="assistant-staffing-meta">${staffingResult.targetLabel} / ${staffingResult.inputLabel} ${staffingResult.inputValue.toLocaleString()}${staffingResult.unitLabel}</div>
          <div class="assistant-staffing-formula">계산식: ⌊${staffingResult.inputValue.toLocaleString()} ÷ ${staffingResult.divisor.toLocaleString()}⌋ = ${staffingResult.count}명</div>
        </div>
      `
      : `
        <div class="assistant-staffing-empty">
          대상 구분과 값을 입력하면 선임인원이 바로 계산됩니다.
        </div>
      `;

    assistantCalculatorSection = `
      <section class="dc-assistant-card assistant-staffing-card">
        <h3 class="dc-assistant-title">소방안전관리보조자 선임인원 계산기</h3>
        <p class="dc-assistant-copy">위의 선임대상·선임인원 기준으로 그대로 계산합니다.</p>
        <div class="assistant-staffing-toggle">
          <button class="calc-mode-btn${assistantTargetType === "apartment" ? " active" : ""}" type="button" data-assistant-target="apartment">아파트</button>
          <button class="calc-mode-btn${assistantTargetType === "other" ? " active" : ""}" type="button" data-assistant-target="other">그 외</button>
        </div>
        <div class="calc-form-row">
          <label>${inputLabel}</label>
          <input
            id="assistant-staffing-value"
            class="calc-input"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            placeholder="${inputPlaceholder}"
            value="${assistantValue}"
          >
        </div>
        <p class="assistant-staffing-help">${helperText}</p>
        ${resultMarkup}
        <div class="assistant-staffing-examples">${exampleText}</div>
      </section>
    `;
  }

  const viewYear = state.dateCalc.viewYear;
  const viewMonth = state.dateCalc.viewMonth;
  const firstDay = new Date(viewYear, viewMonth, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
  const cells = [];

  for (let i = 0; i < 42; i += 1) {
    let date;
    let otherMonth = false;
    if (i < startWeekday) {
      date = new Date(viewYear, viewMonth - 1, prevMonthDays - startWeekday + i + 1);
      otherMonth = true;
    } else if (i >= startWeekday + daysInMonth) {
      date = new Date(viewYear, viewMonth + 1, i - (startWeekday + daysInMonth) + 1);
      otherMonth = true;
    } else {
      date = new Date(viewYear, viewMonth, i - startWeekday + 1);
    }

    const classes = ["cal-day"];
    const key = formatInputDate(date);
    if (otherMonth) classes.push("other-month");
    if (date.getDay() === 0) classes.push("sun");
    if (date.getDay() === 6) classes.push("sat");
    if (sameDate(date, baseDate)) classes.push("selected");
    if (rangeKeys.has(key)) classes.push("in-range");
    if (deadline && sameDate(date, deadline)) classes.push("deadline");
    if (appointRangeKeys.has(key)) classes.push("appoint-range");
    if (reportRangeKeys.has(key)) classes.push("report-range");
    if (appointDeadline && sameDate(date, appointDeadline)) classes.push("appoint-deadline");
    if (reportDeadline && sameDate(date, reportDeadline)) classes.push("report-deadline");
    if (mode.supportsHolidaySelection && holidayKeys.has(key)) classes.push("holiday");

    cells.push(`<button class="${classes.join(" ")}" type="button" data-date="${key}">${date.getDate()}</button>`);
  }

  // D-day 계산 헬퍼
  const calcDDay = (target) => {
    if (!target) return null;
    const today = new Date(); today.setHours(0,0,0,0);
    const t = new Date(target); t.setHours(0,0,0,0);
    return Math.round((t - today) / (1000 * 60 * 60 * 24));
  };
  const ddayBadge = (diff) => {
    if (diff === null || diff === undefined) return "";
    if (diff > 0) return `<span class="dc-hero-dday${diff <= 7 ? " urgent" : ""}">D-${diff}</span>`;
    if (diff === 0) return `<span class="dc-hero-dday urgent">D-DAY</span>`;
    return `<span class="dc-hero-dday passed">D+${Math.abs(diff)}</span>`;
  };
  const heroResultBlock = (label, date, dday, accent = "red") => `
    <div class="dc-hero-result">
      <div class="dc-hero-label">${label}</div>
      <div class="dc-hero-date dc-accent-${accent}">${formatDate(date)}</div>
      ${ddayBadge(dday)}
    </div>
  `;

  // HERO 구성 (모드별)
  let heroResultsHTML = "";
  let timelineNodes = [];
  if (mode.kind === "inspect_report") {
    heroResultsHTML = heroResultBlock(mode.resultLabel, deadline, calcDDay(deadline), "red");
    timelineNodes = [
      { type: "start", label: "기산일", date: baseDate },
      { edge: `+${mode.days}일` },
      { type: "appoint", label: "마감", date: deadline },
    ];
  } else if (mode.kind === "manager_dual") {
    heroResultsHTML =
      heroResultBlock("선임기한", appointDeadline, calcDDay(appointDeadline), "red") +
      heroResultBlock("선임신고기한", reportDeadline, calcDDay(reportDeadline), "blue");
    timelineNodes = [
      { type: "start", label: "기산일", date: baseDate },
      { edge: `+${mode.appointDays}일` },
      { type: "appoint", label: "선임", date: appointDeadline },
      { edge: `+${mode.reportDays}일` },
      { type: "report", label: "신고", date: reportDeadline },
    ];
  } else if (mode.kind === "noncompliance_dual") {
    const actionType = mode.actionTypes[state.dateCalc.noncomplianceType] ?? mode.actionTypes.repair;
    heroResultsHTML =
      heroResultBlock("이행완료기한", appointDeadline, calcDDay(appointDeadline), "red") +
      heroResultBlock("완료신고기한", reportDeadline, calcDDay(reportDeadline), "blue");
    timelineNodes = [
      { type: "start", label: "보고일", date: baseDate },
      { edge: `+${actionType.completionDays}일` },
      { type: "appoint", label: "이행", date: appointDeadline },
      { edge: `+${mode.reportDays}일` },
      { type: "report", label: "신고", date: reportDeadline },
    ];
  }

  const formatTimelineDate = (d) => `<span class="dc-timeline-date-year">${d.getFullYear()}년 </span>${d.getMonth() + 1}월 ${d.getDate()}일`;
  const timelineHTML = timelineNodes.map((n) => {
    if (n.edge) {
      return `<div class="dc-timeline-edge"><span class="dc-timeline-edge-label">${n.edge}</span></div>`;
    }
    return `
      <div class="dc-timeline-node">
        <div class="dc-timeline-dot ${n.type}"></div>
        <div class="dc-timeline-label">${n.label}</div>
        <div class="dc-timeline-date">${formatTimelineDate(n.date)}</div>
      </div>
    `;
  }).join("");

  // 공휴일 로딩 안내
  const isHolidayLoading = Object.values(state.dateCalc.apiHolidays).some(v => v === null);
  const holidayHint = mode.supportsHolidaySelection
    ? `공휴일은 자동 적용됩니다${isHolidayLoading ? " <span style='color:var(--text-dim)'>(불러오는 중…)</span>" : ""}. 임시공휴일 등이 빠져있으면 캘린더 상단 "공휴일" 버튼으로 추가하세요.`
    : "";

  root.innerHTML = `
    <div class="dc-mode-tabs">
      ${Object.entries(CALC_MODES).map(([key, cfg]) =>
        `<button class="dc-mode-tab${key === state.dateCalc.mode ? " active" : ""}" type="button" data-mode="${key}">${cfg.short}</button>`
      ).join("")}
    </div>

    <section class="dc-hero">
      <div class="dc-hero-main">
        <div class="dc-hero-results">${heroResultsHTML}</div>
        <div class="dc-timeline">${timelineHTML}</div>
      </div>
      <button id="add-to-home-btn" class="dc-hero-save-btn" type="button">
        📌 <span class="dc-hero-save-label">메인화면에 표시</span>
      </button>
    </section>

    ${mode.kind === "noncompliance_dual" ? `
      <div class="dc-action-section">
        <span class="dc-control-label">조치 종류</span>
        <div class="dc-action-toggle">
          ${Object.entries(mode.actionTypes).map(([key, cfg]) => `
            <button class="dc-action-toggle-btn${key === state.dateCalc.noncomplianceType ? " active" : ""}" type="button" data-noncompliance-type="${key}">
              <span class="dc-action-days">${cfg.label}</span>
              <span class="dc-action-desc">${cfg.description}</span>
            </button>
          `).join("")}
        </div>
      </div>
    ` : ""}

    <div class="dc-split">
      <div class="dc-split-left">
    <div class="dc-main-grid">
      <section class="dc-cal-section">
        <div class="dc-cal-header">
          ${state.dateCalc.editingMonth ? `
            <div class="dc-cal-edit">
              <input class="dc-cal-year-input" id="dc-cal-year-input" type="number" inputmode="numeric" min="1900" max="2200" value="${viewYear}" aria-label="연도 입력">
              <select class="dc-cal-month-select" id="dc-cal-month-select" aria-label="월 선택">
                ${Array.from({ length: 12 }, (_, m) => `<option value="${m}"${m === viewMonth ? " selected" : ""}>${m + 1}월</option>`).join("")}
              </select>
              <button class="dc-cal-apply-btn" type="button" data-cal-apply>확인</button>
            </div>
          ` : `
            <button class="dc-cal-nav-btn" type="button" data-cal-nav="-1">‹</button>
            <button class="dc-cal-month" type="button" data-cal-month-edit title="연·월 직접 입력">${viewYear}년 ${viewMonth + 1}월</button>
            <button class="dc-cal-nav-btn" type="button" data-cal-nav="1">›</button>
          `}
        </div>
        ${mode.supportsHolidaySelection ? `
          <div class="dc-cal-mode-toggle">
            <button class="dc-cal-mode-toggle-btn${state.dateCalc.selectMode === "base" ? " active" : ""}" type="button" data-select-mode="base">📌 기산일 선택</button>
            ${state.dateCalc.selectMode === "holiday" && state.dateCalc.holidays.length > 0
              ? `<button class="dc-cal-mode-toggle-btn active holiday-clear" type="button" data-action="clear-holidays">공휴일 ${state.dateCalc.holidays.length}개 지우기</button>`
              : `<button class="dc-cal-mode-toggle-btn${state.dateCalc.selectMode === "holiday" ? " active" : ""}" type="button" data-select-mode="holiday">🟣 공휴일 추가</button>`}
          </div>
          ${holidayHint ? `<p class="dc-cal-hint">${holidayHint}</p>` : ""}
        ` : ""}
        <div class="cal-dow">
          <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>
        </div>
        <div class="cal-grid">${cells.join("")}</div>
        <div class="dc-cal-legend">${legendMarkup}</div>
      </section>
    </div>
      </div>
      <div class="dc-split-right">
    <section class="dc-ref-section">
      <details class="dc-ref-accordion" open>
        <summary>⚠️ ${mode.infoTitle}</summary>
        <div class="dc-ref-body" style="padding-top:14px;">
          <div class="info-box ${mode.infoTone}" style="border:none;padding:0;margin:0;background:transparent;">
            ${modeInfoBody}
          </div>
        </div>
      </details>
      <details class="dc-ref-accordion" open>
        <summary>📋 ${mode.tableTitle}</summary>
        <div class="dc-ref-body">
          <table class="${tableClassName}">
            <thead><tr>${mode.tableHead.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
            <tbody>${tableBody.map((row) => `<tr>${row.map((cell) => `<td>${renderTableCell(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
          </table>
        </div>
      </details>
      ${(mode.extraSections || []).map((sec) => `
        <details class="dc-ref-accordion" open>
          <summary>${sec.title}</summary>
          <div class="dc-ref-body" style="padding-top:14px;">${sec.content}</div>
        </details>
      `).join("")}
    </section>

    ${assistantCalculatorSection}
      </div>
    </div>
  `;
  animateSwipeNavigation(root);

  const syncDateSplitHeight = () => {
    const calSection = root.querySelector(".dc-cal-section");
    if (!calSection || !window.matchMedia("(min-width: 900px)").matches) {
      root.style.removeProperty("--dc-side-height");
      return;
    }
    root.style.setProperty("--dc-side-height", `${Math.ceil(calSection.getBoundingClientRect().height) + 20}px`);
  };
  syncDateSplitHeight();
  requestAnimationFrame(syncDateSplitHeight);

  const addToHomeBtn = root.querySelector("#add-to-home-btn");
  if (addToHomeBtn) {
    addToHomeBtn.addEventListener("click", () => {
      showAddReminderModal({
        type: state.dateCalc.mode,
        baseDate: state.dateCalc.baseDate,
        deadline: formatInputDate(deadline || appointDeadline),
        secondDeadline: reportDeadline ? formatInputDate(reportDeadline) : null,
      });
    });
  }

  const newLeft = root.querySelector(".date-left");
  if (newLeft && prevLeftScroll > 0) newLeft.scrollTop = prevLeftScroll;
  const newRight = root.querySelector(".date-right");
  if (newRight && prevRightScroll > 0) newRight.scrollTop = prevRightScroll;
  const newTabs = root.querySelector(".dc-mode-tabs");
  if (newTabs) {
    const activeTab = newTabs.querySelector(".dc-mode-tab.active");
    if (activeTab) {
      const tabLeft = activeTab.offsetLeft;
      const tabRight = tabLeft + activeTab.offsetWidth;
      const viewLeft = newTabs.scrollLeft;
      const viewRight = viewLeft + newTabs.clientWidth;
      const pad = 12;
      if (tabLeft < viewLeft + pad) {
        newTabs.scrollLeft = Math.max(0, tabLeft - pad);
      } else if (tabRight > viewRight - pad) {
        newTabs.scrollLeft = tabRight - newTabs.clientWidth + pad;
      } else if (prevTabsScroll > 0) {
        newTabs.scrollLeft = prevTabsScroll;
      }
    } else if (prevTabsScroll > 0) {
      newTabs.scrollLeft = prevTabsScroll;
    }
  }

  root.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.dateCalc.mode = button.dataset.mode;
      state.dateCalc.selectMode = "base";
      renderDateCalculator();
    });
  });
  root.querySelectorAll("[data-noncompliance-type]").forEach((button) => {
    button.addEventListener("click", () => {
      state.dateCalc.noncomplianceType = button.dataset.noncomplianceType;
      renderDateCalculator();
    });
  });
  root.querySelectorAll("[data-assistant-target]").forEach((button) => {
    button.addEventListener("click", () => {
      state.dateCalc.assistantTargetType = button.dataset.assistantTarget;
      renderDateCalculator();
    });
  });
  initFloatingTooltips(root);
  root.querySelectorAll("[data-select-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.dateCalc.selectMode = button.dataset.selectMode;
      renderDateCalculator();
    });
  });
  root.querySelectorAll("[data-action='clear-holidays']").forEach((button) => {
    button.addEventListener("click", () => {
      state.dateCalc.holidays = [];
      renderDateCalculator();
    });
  });
  root.querySelectorAll("[data-cal-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      state.dateCalc.viewMonth += Number(button.dataset.calNav);
      if (state.dateCalc.viewMonth > 11) {
        state.dateCalc.viewMonth = 0;
        state.dateCalc.viewYear += 1;
      }
      if (state.dateCalc.viewMonth < 0) {
        state.dateCalc.viewMonth = 11;
        state.dateCalc.viewYear -= 1;
      }
      renderDateCalculator();
    });
  });
  const monthEditBtn = root.querySelector("[data-cal-month-edit]");
  if (monthEditBtn) {
    monthEditBtn.addEventListener("click", () => {
      state.dateCalc.editingMonth = true;
      renderDateCalculator();
    });
  }
  const applyMonthEdit = () => {
    const yearInput = root.querySelector("#dc-cal-year-input");
    const monthSelect = root.querySelector("#dc-cal-month-select");
    if (!yearInput || !monthSelect) return;
    let year = parseInt(yearInput.value, 10);
    if (Number.isNaN(year)) year = state.dateCalc.viewYear;
    year = Math.min(2200, Math.max(1900, year));
    state.dateCalc.viewYear = year;
    state.dateCalc.viewMonth = Number(monthSelect.value);
    state.dateCalc.editingMonth = false;
    renderDateCalculator();
  };
  const applyBtn = root.querySelector("[data-cal-apply]");
  if (applyBtn) {
    applyBtn.addEventListener("click", applyMonthEdit);
  }
  const yearInputEl = root.querySelector("#dc-cal-year-input");
  if (yearInputEl) {
    yearInputEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter") { event.preventDefault(); applyMonthEdit(); }
      else if (event.key === "Escape") { state.dateCalc.editingMonth = false; renderDateCalculator(); }
    });
  }
  root.querySelectorAll("[data-date]").forEach((button) => {
    button.addEventListener("click", () => {
      if (mode.supportsHolidaySelection && state.dateCalc.selectMode === "holiday") {
        const clicked = button.dataset.date;
        if (getApiHolidaySet().has(clicked)) return; // 자동 공휴일은 수동 토글 불가
        const index = state.dateCalc.holidays.indexOf(clicked);
        if (index >= 0) state.dateCalc.holidays.splice(index, 1);
        else state.dateCalc.holidays.push(clicked);
      } else {
        state.dateCalc.baseDate = button.dataset.date;
        const selected = parseDate(button.dataset.date);
        state.dateCalc.viewYear = selected.getFullYear();
        state.dateCalc.viewMonth = selected.getMonth();
      }
      renderDateCalculator();
    });
  });
  const baseDateInput = root.querySelector("#calc-base-date");
  if (baseDateInput) {
    baseDateInput.addEventListener("input", (event) => {
      state.dateCalc.baseDate = event.target.value;
      const selected = parseDate(event.target.value);
      state.dateCalc.viewYear = selected.getFullYear();
      state.dateCalc.viewMonth = selected.getMonth();
      renderDateCalculator();
    });
  }
  const assistantInput = root.querySelector("#assistant-staffing-value");
  if (assistantInput) {
    assistantInput.addEventListener("input", (event) => {
      const key = state.dateCalc.assistantTargetType === "apartment"
        ? "assistantHouseholds"
        : "assistantArea";
      state.dateCalc[key] = sanitizeAssistantNumericInput(event.target.value);
      renderDateCalculator();
    });
  }

  if (prevActiveId === "assistant-staffing-value" && assistantInput) {
    assistantInput.focus();
    const inputLength = assistantInput.value.length;
    assistantInput.setSelectionRange(inputLength, inputLength);
  }

  if (state.dateCalc.editingMonth && prevActiveId !== "dc-cal-year-input") {
    const yearInput = root.querySelector("#dc-cal-year-input");
    if (yearInput) { yearInput.focus(); yearInput.select(); }
  }

  attachHorizontalSwipeNavigation(root, () => ({
    keys: Object.keys(CALC_MODES),
    current: state.dateCalc.mode,
    onChange: (nextMode) => {
      state.dateCalc.mode = nextMode;
      state.dateCalc.selectMode = "base";
      renderDateCalculator();
    },
  }));
}

function getFloatingTooltipElement() {
  let tooltip = document.getElementById("floating-tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "floating-tooltip";
    tooltip.className = "floating-tooltip hidden";
    document.body.appendChild(tooltip);
  }
  return tooltip;
}

function positionFloatingTooltip(anchor, tooltip) {
  const anchorRect = anchor.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const gap = 10;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = anchorRect.right + gap;
  if (left + tooltipRect.width > viewportWidth - 12) {
    left = anchorRect.left - tooltipRect.width - gap;
  }
  left = Math.max(12, Math.min(left, viewportWidth - tooltipRect.width - 12));

  let top = anchorRect.top + (anchorRect.height / 2) - (tooltipRect.height / 2);
  top = Math.max(12, Math.min(top, viewportHeight - tooltipRect.height - 12));

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function initFloatingTooltips(root) {
  const tooltip = getFloatingTooltipElement();
  const hideTooltip = () => {
    tooltip.classList.add("hidden");
    tooltip.textContent = "";
  };

  root.querySelectorAll("[data-floating-tooltip]").forEach((trigger) => {
    const showTooltip = () => {
      tooltip.textContent = trigger.dataset.floatingTooltip;
      tooltip.classList.remove("hidden");
      positionFloatingTooltip(trigger, tooltip);
    };

    trigger.addEventListener("mouseenter", showTooltip);
    trigger.addEventListener("focus", showTooltip);
    trigger.addEventListener("mouseleave", hideTooltip);
    trigger.addEventListener("blur", hideTooltip);
  });
}

// ── 작동·종합 대상 판독기 ──────────────────────────────────────────

const inspectionNodes = {
  start: {
    title: "스프링클러가 설치돼있나요?",
    help: "주차장에만 설치된 스프링클러설비도 포함됩니다.",
    options: [
      { label: "예", next: { result: "comprehensive", reason: "스프링클러설비가 설치된 특정소방대상물로, 종합정밀점검 대상입니다." } },
      { label: "아니오", next: "multiuseCheck" },
    ],
  },
  multiuseCheck: {
    title: "다중이용업소가 설치된 특정소방대상물인가요?",
    help: "특정소방대상물 내에 다중이용업소 한개만 들어가 있어도 '예'를 눌러주세요.",
    options: [
      { label: "예", next: "multiuse" },
      { label: "아니오", next: "remainingInspectionItems" },
    ],
  },
  remainingInspectionItems: {
    title: "다음 항목을 확인하세요",
    help: "그 외 해당되는 요소가 있는지 확인해주세요.",
    options: [
      { label: "물분무등소화설비가 설치되어 있나요?", next: "waterSpray" },
      { label: "터널인가요?", next: "tunnel" },
      { label: "공공기관인가요?", next: "publicOrg" },
      { label: "해당 없음", next: { result: "operational", reason: "종합정밀점검 대상 조건에 해당하지 않습니다." } },
    ],
  },
  tunnel: {
    title: "제연설비가 설치되어 있나요?",
    help: "제연설비가 없는 터널은 해당되지 않습니다.",
    options: [
      { label: "예", next: { result: "comprehensive", reason: "터널에 제연설비가 설치된 경우 종합정밀점검 대상에 해당합니다." } },
      { label: "아니오", next: { result: "operational", reason: "제연설비가 설치되지 않은 터널은 종합정밀점검 대상에 해당하지 않습니다." } },
    ],
  },
  waterSpray: {
    title: "연면적이 5,000㎡ 이상인가요?",
    help: "호스릴(hose reel) 방식만 단독으로 설치한 경우와 제조소등은 제외됩니다.",
    options: [
      { label: "예", next: { result: "comprehensive", reason: "물분무등소화설비[호스릴 방식 제외]가 설치된 특정소방대상물은 연면적 5,000㎡ 이상일 때 종합정밀점검 대상에 해당합니다." } },
      { label: "아니오", next: { result: "operational", reason: "물분무등소화설비가 설치되어 있더라도 연면적 5,000㎡ 미만이면 종합정밀점검 대상에 해당하지 않습니다." } },
    ],
  },
  multiuse: {
    title: "특정소방대상물의 연면적이 2,000㎡ 이상인가요?",
    help: "해당 업종: 시행령 제2조제1호나목, 제2호(비디오물소극장업 제외)·제6호·제7호·제7호의2·제7호의5. 이 외 업종은 해당되지 않습니다.",
    options: [
      { label: "예", next: { result: "comprehensive", reason: "다중이용업소법 시행령 해당 업종의 영업장이 설치된 특정소방대상물은 연면적 2,000㎡ 이상일 때 종합정밀점검 대상에 해당합니다." } },
      { label: "아니오", next: { result: "operational", reason: "해당 다중이용업소가 설치되어 있더라도 연면적 2,000㎡ 미만이면 종합정밀점검 대상에 해당하지 않습니다." } },
    ],
  },
  publicOrg: {
    title: "연면적이 1,000㎡ 이상인가요?",
    help: "소방대가 근무하는 공공기관은 제외됩니다.",
    options: [
      { label: "예", next: "publicOrgFacility" },
      { label: "아니오", next: { result: "operational", reason: "연면적 1,000㎡ 미만의 공공기관은 종합정밀점검 대상에 해당하지 않습니다." } },
    ],
  },
  publicOrgFacility: {
    title: "옥내소화전설비 또는 자동화재탐지설비가 설치되어 있나요?",
    help: "두 설비 모두 없는 경우에는 해당되지 않습니다. 하나라도 있으면 다음 단계에서 확인합니다.",
    options: [
      { label: "예", next: { result: "comprehensive", reason: "공공기관의 소방안전관리에 관한 규정 제2조에 따른 공공기관으로, 연면적 1,000㎡ 이상이고 옥내소화전설비 또는 자동화재탐지설비가 설치된 경우 종합정밀점검 대상에 해당합니다." } },
      { label: "아니오", next: { result: "operational", reason: "연면적 조건은 충족하나 옥내소화전설비·자동화재탐지설비가 모두 미설치되어 종합정밀점검 대상에 해당하지 않습니다." } },
    ],
  },
};

const inspectionState = {
  history: [],
  current: "start",
};

function buildInspectionHistoryPanel() {
  const aside = document.createElement("aside");
  aside.className = "insp-history";
  const titleEl = document.createElement("div");
  titleEl.className = "insp-history-title";
  titleEl.textContent = "진행 내역";
  aside.appendChild(titleEl);

  if (inspectionState.history.length === 0) {
    const empty = document.createElement("div");
    empty.className = "insp-history-empty";
    empty.innerHTML = `
      <div class="insp-history-empty-icon">🧯</div>
      <div class="insp-history-empty-title">자체점검 종류 판정</div>
      <div class="insp-history-empty-desc">우측 질문에 답하면<br>여기에 진행 내역이 쌓입니다.</div>
    `;
    aside.appendChild(empty);
    return aside;
  }

  inspectionState.history.forEach((entry, idx) => {
    const nodeKey = typeof entry === "object" ? entry.node : entry;
    const chosenLabel = typeof entry === "object" ? entry.label : "";
    const node = inspectionNodes[nodeKey];
    if (!node) return;
    const item = document.createElement("button");
    item.type = "button";
    item.className = "insp-history-item";
    item.innerHTML = `
      <span class="insp-history-step">STEP ${idx + 1}</span>
      <span class="insp-history-q">${node.title}</span>
      ${chosenLabel ? `<span class="insp-history-a">→ ${chosenLabel}</span>` : ""}
    `;
    item.addEventListener("click", () => inspectionJumpTo(idx));
    aside.appendChild(item);
  });

  return aside;
}

function renderInspection() {
  const root = document.getElementById("inspection-content");
  const current = inspectionState.current;
  const currentStep = inspectionState.history.length + 1;

  root.innerHTML = "";
  const layout = document.createElement("div");
  layout.className = "insp-layout";

  const historyPanel = buildInspectionHistoryPanel();
  if (historyPanel) layout.appendChild(historyPanel);

  const main = document.createElement("div");
  main.className = "insp-main";

  if (current && typeof current === "object") {
    const isComp = current.result === "comprehensive";
    const card = document.createElement("div");
    card.className = "wq-card";
    card.innerHTML = `
      <div class="insp-result ${isComp ? "insp-comprehensive" : "insp-operational"}">
        <div class="ir-badge">${isComp ? "종합정밀점검" : "작동기능점검"}</div>
        <div class="ir-title">${isComp ? "종합정밀점검 대상입니다." : "작동기능점검 대상입니다."}</div>
        <p class="ir-reason">${current.reason}</p>
      </div>
    `;
    if (inspectionState.history.length > 0) {
      const backBtn = document.createElement("button");
      backBtn.type = "button";
      backBtn.className = "btn btn-ghost";
      backBtn.style.width = "100%";
      backBtn.style.marginBottom = "8px";
      backBtn.textContent = "이전으로";
      backBtn.addEventListener("click", inspectionBack);
      card.appendChild(backBtn);
    }
    const restartBtn = document.createElement("button");
    restartBtn.type = "button";
    restartBtn.className = "btn-restart";
    restartBtn.textContent = "처음부터 다시";
    restartBtn.addEventListener("click", inspectionRestart);
    card.appendChild(restartBtn);
    main.appendChild(card);
    layout.appendChild(main);
    root.appendChild(layout);
    return;
  }

  const node = inspectionNodes[current];
  if (!node) return;

  const card = document.createElement("div");
  card.className = "wq-card";

  const kicker = document.createElement("p");
  kicker.className = "wq-label";
  kicker.textContent = `STEP ${currentStep}`;
  card.appendChild(kicker);

  const title = document.createElement("h2");
  title.className = "wq-title";
  title.textContent = node.title;
  card.appendChild(title);

  const help = document.createElement("p");
  help.className = "wq-sub";
  help.textContent = node.help;
  card.appendChild(help);

  const list = document.createElement("div");
  list.className = "choice-list";
  node.options.forEach((option) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-button";
    btn.innerHTML = `<strong>${option.label}</strong>${option.sub ? `<span>${option.sub}</span>` : ""}`;
    btn.addEventListener("click", () => inspectionSelect(option, btn));
    list.appendChild(btn);
  });
  card.appendChild(list);

  if (inspectionState.history.length > 0) {
    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "btn btn-ghost";
    backBtn.style.cssText = "width:100%;margin-top:12px;";
    backBtn.textContent = "이전으로";
    backBtn.addEventListener("click", inspectionBack);
    card.appendChild(backBtn);
  }

  main.appendChild(card);
  layout.appendChild(main);
  root.appendChild(layout);
}

function inspectionSelect(option, btn) {
  if (btn) {
    btn.classList.add("selected");
    // 같은 리스트 내 다른 버튼은 클릭 무효화
    const list = btn.parentElement;
    if (list) list.querySelectorAll("button").forEach((b) => { if (b !== btn) b.style.pointerEvents = "none"; });
  }
  const currentNodeKey = inspectionState.current;
  setTimeout(() => {
    inspectionState.history.push({ node: currentNodeKey, label: option.label });
    inspectionState.current = option.next;
    renderInspection();
    const scrollEl = document.querySelector("#screen-inspection .scroll-content");
    if (scrollEl) scrollEl.scrollTo({ top: 0, behavior: "smooth" });
  }, 550);
}

function inspectionBack() {
  if (inspectionState.history.length > 0) {
    const last = inspectionState.history.pop();
    inspectionState.current = typeof last === "object" ? last.node : last;
    renderInspection();
  }
}

function inspectionJumpTo(index) {
  if (index < 0 || index >= inspectionState.history.length) return;
  const target = inspectionState.history[index];
  const targetNode = typeof target === "object" ? target.node : target;
  inspectionState.history = inspectionState.history.slice(0, index);
  inspectionState.current = targetNode;
  renderInspection();
}

function inspectionRestart() {
  inspectionState.history = [];
  inspectionState.current = "start";
  renderInspection();
}

// ── 다중이용업소 판독기 ──────────────────────────────────────────

// 업종별 법 편입 시기 안내 (결과 카드 하단에 표시)
const MULTIUSE_HISTORY_NOTE = {
  tanran:       "1997년 9월 27일 소방법 시행령 개정으로 다중이용업이 처음 신설될 때부터 단란주점·유흥주점은 다중이용업소로 지정되었습니다.",
  karaoke:      "1997년 9월 27일 소방법 시행령 개정으로 다중이용업이 처음 신설될 때부터 노래연습장업은 다중이용업소로 지정되었습니다.",
  food_basement: "1997년 9월 27일 소방법 시행령 개정으로 다중이용업이 처음 신설될 때부터 지하층 바닥면적 66㎡ 이상 음식점은 다중이용업소로 지정되었습니다.",
  video:        "비디오물감상실업은 1997년 9월 27일 법 신설 시부터, 비디오물소극장업은 2007년 3월 25일부터, 복합영상물제공업은 2013년 11월 20일부터 순차적으로 다중이용업소로 지정되었습니다.",
  movie:        "영화상영관은 2007년 3월 25일부터 다중이용업소로 지정되었습니다.",
  game_multi:   "복합유통게임제공업은 2002년 3월 30일부터 다중이용업소로 지정되었습니다.",
  game_pc:      "게임제공업·인터넷컴퓨터게임시설제공업(PC방·오락실)은 2001년 5월 21일부터 다중이용업소로 지정되었습니다.",
  sauna:        "찜질방·황토방 등 발한시설을 갖춘 목욕장업은 2003년 1월 17일부터 다중이용업소로 지정되었습니다.",
  bath_general: null,
  postpartum:   "산후조리업은 2003년 1월 17일부터 다중이용업소로 지정되었습니다.",
  massage:      "안마시술소는 2010년 11월 12일부터 다중이용업소로 지정되었습니다.",
  gosiwon:      "고시원업은 2003년 1월 17일부터 다중이용업소로 지정되었습니다.",
  phonebooth:   "전화방·화상대화방업은 2003년 1월 17일부터 다중이용업소로 지정되었습니다.",
  sleeproom:    "수면방업은 2003년 1월 17일부터 다중이용업소로 지정되었습니다.",
  kollatec:     "콜라텍업은 2003년 1월 17일부터 다중이용업소로 지정되었습니다.",
  academy:      "학원은 2007년 3월 25일부터 다중이용업소로 지정되었습니다.",
  gunrange:     "실내 권총사격장은 2010년 11월 12일부터 다중이용업소로 지정되었습니다.",
  screengolf:   "스크린 골프장(가상체험 체육시설업)은 2010년 11월 12일부터 다중이용업소로 지정되었습니다.",
  shared_food:  "공유주방 운영업은 2021년 12월 30일부터 다중이용업소로 지정되었습니다.",
  escaperoom:   "방탈출카페업은 2022년 6월 8일부터 다중이용업소로 지정되었습니다.",
  kidscafe:     "키즈카페업은 2022년 6월 8일부터 다중이용업소로 지정되었습니다.",
  mangacafe:    "만화카페업은 2022년 6월 8일부터 다중이용업소로 지정되었습니다.",
  food_ground:  "지상층 음식점(휴게음식점·일반음식점·제과점)은 2001년 5월 21일부터 다중이용업소로 지정되었습니다.",
  food_duplex:  "내부계단 복층구조 음식점에 대한 명시적 규정은 2007년 3월 25일에 마련되었습니다.",
};

const multiuseNodes = {
  // ── 1단계: 업종 대분류 ──
  start: {
    title: "업종 분류를 선택하세요",
    help: "옥외에서만 영업하는 경우는 다중이용업소에서 제외됩니다.",
    options: [
      { label: "식품접객업", sub: "음식점·카페·주점·공유주방 등", next: "cat_food" },
      { label: "영상·게임", sub: "영화관·비디오방·PC방·오락실 등", next: "cat_game" },
      { label: "교육", sub: "학원", next: "academy_capacity" },
      { label: "위생·건강", sub: "목욕장·산후조리원·안마시술소", next: "cat_health" },
      { label: "숙박·공간 임대", sub: "고시원·전화방·수면방", next: "cat_lodging" },
      { label: "여가·스포츠·문화", sub: "노래방·방탈출·키즈카페·스크린골프·만화카페 등", next: "cat_leisure" },
      { label: "위 분류에 해당하지 않음", sub: "백화점·병원·헬스장·학교 등", next: "cat_not_multiuse" },
    ],
  },

  cat_not_multiuse: {
    title: "해당하는 용도를 선택하세요",
    help: "사람들이 많이 출입하는 대표적인 용도입니다.",
    options: [
      { label: "백화점", sub: "", next: { result: "no", type: "", law: "", reason: "백화점은 다중이용업소에 해당하지 않습니다. 단, 해당 대상물 내에 다중이용업소가 있을 수도 있습니다. 예시) 홈플러스 내 푸드코트 또는 키즈카페, 병원 내 산후조리원 등" } },
      { label: "대형 마트", sub: "", next: { result: "no", type: "", law: "", reason: "대형 마트는 다중이용업소에 해당하지 않습니다. 단, 해당 대상물 내에 다중이용업소가 있을 수도 있습니다. 예시) 홈플러스 내 푸드코트 또는 키즈카페, 병원 내 산후조리원 등" } },
      { label: "교회", sub: "", next: { result: "no", type: "", law: "", reason: "교회는 다중이용업소에 해당하지 않습니다. 단, 해당 대상물 내에 다중이용업소가 있을 수도 있습니다. 예시) 홈플러스 내 푸드코트 또는 키즈카페, 병원 내 산후조리원 등" } },
      { label: "지하철역", sub: "", next: { result: "no", type: "", law: "", reason: "지하철역은 다중이용업소에 해당하지 않습니다. 단, 해당 대상물 내에 다중이용업소가 있을 수도 있습니다. 예시) 홈플러스 내 푸드코트 또는 키즈카페, 병원 내 산후조리원 등" } },
      { label: "병원", sub: "", next: { result: "no", type: "", law: "", reason: "병원은 다중이용업소에 해당하지 않습니다. 단, 해당 대상물 내에 다중이용업소가 있을 수도 있습니다. 예시) 홈플러스 내 푸드코트 또는 키즈카페, 병원 내 산후조리원 등" } },
      { label: "헬스장", sub: "", next: { result: "no", type: "", law: "", reason: "헬스장은 다중이용업소에 해당하지 않습니다. 단, 해당 대상물 내에 다중이용업소가 있을 수도 있습니다. 예시) 홈플러스 내 푸드코트 또는 키즈카페, 병원 내 산후조리원 등" } },
      { label: "수영장", sub: "", next: { result: "no", type: "", law: "", reason: "수영장은 다중이용업소에 해당하지 않습니다. 단, 해당 대상물 내에 다중이용업소가 있을 수도 있습니다. 예시) 홈플러스 내 푸드코트 또는 키즈카페, 병원 내 산후조리원 등" } },
      { label: "전통시장", sub: "", next: { result: "no", type: "", law: "", reason: "전통시장은 다중이용업소에 해당하지 않습니다. 단, 해당 대상물 내에 다중이용업소가 있을 수도 있습니다. 예시) 홈플러스 내 푸드코트 또는 키즈카페, 병원 내 산후조리원 등" } },
      { label: "예식장", sub: "", next: { result: "no", type: "", law: "", reason: "예식장은 다중이용업소에 해당하지 않습니다. 단, 해당 대상물 내에 다중이용업소가 있을 수도 있습니다. 예시) 홈플러스 내 푸드코트 또는 키즈카페, 병원 내 산후조리원 등" } },
      { label: "전시장", sub: "", next: { result: "no", type: "", law: "", reason: "전시장은 다중이용업소에 해당하지 않습니다. 단, 해당 대상물 내에 다중이용업소가 있을 수도 있습니다. 예시) 홈플러스 내 푸드코트 또는 키즈카페, 병원 내 산후조리원 등" } },
      { label: "학교", sub: "", next: { result: "no", type: "", law: "", reason: "학교는 다중이용업소에 해당하지 않습니다. 단, 해당 대상물 내에 다중이용업소가 있을 수도 있습니다. 예시) 홈플러스 내 푸드코트 또는 키즈카페, 병원 내 산후조리원 등" } },
      { label: "위 항목에도 해당하지 않음", sub: "", next: { result: "no", type: "", law: "", reason: "선택한 업종은 「다중이용업소의 안전관리에 관한 특별법 시행령」에서 정한 다중이용업소 업종에 해당하지 않습니다." } },
    ],
  },

  // ── 2단계: 세부 업종 ──
  cat_food: {
    title: "어떤 식품접객업인가요?",
    help: "",
    options: [
      { label: "휴게음식점 · 제과점 · 일반음식점", sub: "카페·베이커리·식당 등", next: "food_basement" },
      { label: "단란주점 · 유흥주점", sub: "주류 제공 유흥시설", next: { result: "yes", historyKey: "tanran", type: "단란주점·유흥주점", law: "시행령 제2조제1호나목", reason: "단란주점영업과 유흥주점영업은 면적·층수 조건 없이 다중이용업소에 해당합니다." } },
      { label: "공유주방 운영업", sub: "여러 사업자가 공동으로 사용하는 주방을 운영하는 영업", next: "shared_basement" },
    ],
  },
  cat_game: {
    title: "어떤 영상·게임 업종인가요?",
    help: "",
    options: [
      { label: "영화상영관", sub: "극장", next: { result: "yes", historyKey: "movie", type: "영화상영관", law: "시행령 제2조제2호", reason: "영화상영관은 다중이용업소에 해당합니다." } },
      { label: "비디오물감상실업 · 비디오물소극장업 · 복합영상물제공업", sub: "비디오방 등", next: { result: "yes", historyKey: "video", type: "비디오물감상실업·비디오물소극장업·복합영상물제공업", law: "시행령 제2조제2호", reason: "비디오물감상실업, 비디오물소극장업, 복합영상물제공업은 다중이용업소에 해당합니다." } },
      { label: "게임제공업 · 인터넷컴퓨터게임시설제공업", sub: "PC방·오락실 등", next: "game_complex" },
      { label: "복합유통게임제공업", sub: "게임과 다른 영업을 복합 운영", next: { result: "yes", historyKey: "game_multi", type: "복합유통게임제공업", law: "시행령 제2조제5호", reason: "복합유통게임제공업은 층수·출입구 조건에 관계없이 다중이용업소에 해당합니다." } },
    ],
  },
  cat_health: {
    title: "어떤 위생·건강 업종인가요?",
    help: "",
    options: [
      { label: "목욕장업 (찜질방·황토방·맥반석방 등)", sub: "열기·원적외선 이용 발한시설을 갖춘 목욕장", next: "sauna_capacity" },
      { label: "목욕장업 (일반 목욕탕)", sub: "맥반석·황토·옥 등을 직접 또는 간접 가열해 발생한 열기·원적외선으로 땀을 낼 수 있는 시설을 갖춘 목욕장", next: { result: "yes", historyKey: "bath_general", type: "목욕장업(일반 목욕탕)", law: "시행령 제2조제4호나목", reason: "개인 위생처리 공간(세면·탈의 등 시설)을 갖춘 일반 목욕탕은 다중이용업소에 해당합니다." } },
      { label: "산후조리업", sub: "「모자보건법」 제2조제10호에 따른 산후조리업", next: { result: "yes", historyKey: "postpartum", type: "산후조리업", law: "시행령 제2조제7호", reason: "산후조리업은 다중이용업소에 해당합니다." } },
      { label: "안마시술소", sub: "「의료법」 제82조제4항에 따른 안마시술소", next: { result: "yes", historyKey: "massage", type: "안마시술소", law: "시행령 제2조제7호의5", reason: "안마시술소는 다중이용업소에 해당합니다." } },
    ],
  },
  cat_lodging: {
    title: "어떤 숙박·공간 임대 업종인가요?",
    help: "",
    options: [
      { label: "고시원업", sub: "구획된 실 안에 학습·숙박 또는 숙식을 제공하는 영업", next: { result: "yes", historyKey: "gosiwon", type: "고시원업", law: "시행령 제2조제7호의2", reason: "고시원업은 다중이용업소에 해당합니다." } },
      { label: "전화방 · 화상대화방업", sub: "구획된 실에 전화·모니터 등 대화 시설을 갖춘 영업", next: { result: "yes", historyKey: "phonebooth", type: "전화방·화상대화방업", law: "시행규칙 별표 1의2 제1호", reason: "전화방·화상대화방업은 다중이용업소에 해당합니다." } },
      { label: "수면방업", sub: "구획된 실에 침대·간이침대 등 휴식 시설을 갖춘 영업", next: { result: "yes", historyKey: "sleeproom", type: "수면방업", law: "시행규칙 별표 1의2 제2호", reason: "수면방업은 다중이용업소에 해당합니다." } },
    ],
  },
  cat_leisure: {
    title: "어떤 여가·스포츠·문화 업종인가요?",
    help: "",
    options: [
      { label: "노래연습장업", sub: "노래방·코인노래방 등", next: { result: "yes", historyKey: "karaoke", type: "노래연습장업", law: "시행령 제2조제6호", reason: "노래연습장업은 다중이용업소에 해당합니다." } },
      { label: "콜라텍업", sub: "주류 판매 없는 댄스홀", next: { result: "yes", historyKey: "kollatec", type: "콜라텍업", law: "시행규칙 별표 1의2 제3호", reason: "콜라텍업은 다중이용업소에 해당합니다." } },
      { label: "방탈출카페업", sub: "제한 시간 내에 방을 탈출하는 놀이 형태의 영업", next: { result: "yes", historyKey: "escaperoom", type: "방탈출카페업", law: "시행규칙 별표 1의2 제4호", reason: "방탈출카페업은 다중이용업소에 해당합니다." } },
      { label: "키즈카페업", sub: "실내 공간에서 어린이에게 놀이를 제공하는 영업", next: { result: "yes", historyKey: "kidscafe", type: "키즈카페업", law: "시행규칙 별표 1의2 제5호", reason: "키즈카페업은 다중이용업소에 해당합니다." } },
      { label: "만화카페업 · 만화방", sub: "다수의 도서를 갖춘 음식점·열람공간 운영 영업", next: "manga_area" },
      { label: "권총사격장 (실내)", sub: "실내사격장에 한정 (종합사격장 내 설치 포함)", next: { result: "yes", historyKey: "gunrange", type: "권총사격장(실내)", law: "시행령 제2조제7호의3", reason: "실내 권총사격장은 다중이용업소에 해당합니다." } },
      { label: "가상체험 체육시설업", sub: "실내에 1개 이상의 구획된 실을 만들어 운동이 가능한 시설", next: "virtual_sports_type" },
    ],
  },

  virtual_sports_type: {
    title: "어떤 가상체험 체육시설업인가요?",
    help: "",
    options: [
      { label: "스크린 골프장", sub: "구획된 실에서 골프 운동이 가능한 시설", next: { result: "yes", historyKey: "screengolf", type: "가상체험 체육시설업", law: "시행령 제2조제7호의4", reason: "스크린 골프장은 다중이용업소에 해당합니다." } },
      { label: "스크린 야구장", sub: "구획된 실에서 야구 체험을 제공하는 시설", next: { result: "no", type: "", law: "", reason: "스크린 야구장은 현재 다중이용업소 대상인 가상체험 체육시설업에 해당하지 않습니다." } },
      { label: "스크린 풋살, 족구, 양궁 등", sub: "골프 외 다른 종목의 가상체험 체육시설", next: { result: "no", type: "", law: "", reason: "스크린 풋살, 족구, 양궁 등은 현재 다중이용업소 대상인 가상체험 체육시설업에 해당하지 않습니다." } },
    ],
  },

  // ── 휴게음식점·제과점·일반음식점 ──
  food_basement: {
    title: "영업장이 지하층에 있나요?",
    help: "지하층 여부에 따라 면적 기준이 달라집니다. (지하층: 66㎡ 이상 / 그 외: 100㎡ 이상)",
    options: [
      { label: "예 (지하층)", next: "food_area_b" },
      { label: "아니오 (지상층)", next: "food_area_g" },
    ],
  },
  food_area_b: {
    title: "영업장 바닥면적 합계가 66㎡ 이상인가요?",
    help: "영업장으로 사용하는 바닥면적의 합계 기준입니다.",
    options: [
      { label: "예 (66㎡ 이상)", next: { result: "yes", historyKey: "food_basement", type: "휴게음식점·제과점·일반음식점", law: "시행령 제2조제1호가목", reason: "지하층 영업장으로 바닥면적 합계가 66㎡ 이상이므로 다중이용업소에 해당합니다." } },
      { label: "아니오 (66㎡ 미만)", next: { result: "no", type: "", law: "", reason: "지하층 영업장이나 바닥면적 합계가 66㎡ 미만이므로 다중이용업소에 해당하지 않습니다." } },
    ],
  },
  food_area_g: {
    title: "영업장 바닥면적 합계가 100㎡ 이상인가요?",
    help: "영업장으로 사용하는 바닥면적의 합계 기준입니다.",
    options: [
      { label: "예 (100㎡ 이상)", next: "food_complex" },
      { label: "아니오 (100㎡ 미만)", next: { result: "no", type: "", law: "", reason: "바닥면적 합계가 100㎡ 미만이므로 다중이용업소에 해당하지 않습니다." } },
    ],
  },
  food_complex: {
    title: "내부계단으로 연결된 복층구조 영업장인가요?",
    help: "복층구조(내부계단 연결)이면 층수·출입구 조건에 관계없이 다중이용업소에 해당합니다.",
    options: [
      { label: "예 (복층 + 내부계단 연결)", info: "하나의 영업장이 2개 층에 걸쳐 있고, 층 사이를 영업장 내부 계단으로 오르내리는 구조입니다.\n예) 1층과 2층이 모두 같은 음식점이고, 손님이 내부 계단으로 2층을 이용하는 구조", next: { result: "yes", historyKey: "food_duplex", type: "휴게음식점·제과점·일반음식점", law: "시행령 제2조제1호가목", reason: "내부계단으로 연결된 복층구조 영업장은 층수·출입구 제외 규정이 적용되지 않으므로 다중이용업소에 해당합니다." } },
      { label: "아니오 (단층 또는 외부계단)", next: "food_floor" },
    ],
  },
  food_floor: {
    title: "영업장이 지상 1층 또는 지상과 직접 접하는 층에 있나요?",
    help: "반지하·필로티 등 지면과 직접 맞닿는 층도 '지상과 직접 접하는 층'에 해당할 수 있습니다.",
    options: [
      { label: "예 (지상 1층 또는 지상 직접 접하는 층)", next: "food_entrance" },
      { label: "아니오 (2층 이상 또는 기타 층)", next: { result: "yes", historyKey: "food_ground", type: "휴게음식점·제과점·일반음식점", law: "시행령 제2조제1호가목", reason: "지상 1층·지상 직접 접하는 층이 아닌 곳에 영업장이 있으므로 다중이용업소에 해당합니다." } },
    ],
  },
  food_entrance: {
    title: "영업장의 주된 출입구가 건물 외부 지면과 직접 연결되나요?",
    help: "내부 복도·로비를 거치지 않고 외부 지면으로 바로 나갈 수 있는 경우입니다.",
    options: [
      { label: "예 (외부 지면과 직접 연결)", next: { result: "no", type: "", law: "시행령 제2조제1호가목 단서", reason: "지상 1층 또는 지상과 직접 접하는 층에 있고 주된 출입구가 건물 외부 지면과 직접 연결되어 있어 다중이용업소 적용에서 제외됩니다." } },
      { label: "아니오 (내부 통로 경유)", next: { result: "yes", historyKey: "food_ground", type: "휴게음식점·제과점·일반음식점", law: "시행령 제2조제1호가목", reason: "주된 출입구가 건물 외부 지면과 직접 연결되지 않으므로 다중이용업소에 해당합니다." } },
    ],
  },

  // ── 공유주방 운영업 (食품접객업 동일 구조) ──
  shared_basement: {
    title: "공유주방 영업장이 지하층에 있나요?",
    help: "지하층 여부에 따라 면적 기준이 달라집니다. (지하층: 66㎡ 이상 / 그 외: 100㎡ 이상)",
    options: [
      { label: "예 (지하층)", next: "shared_area_b" },
      { label: "아니오 (지상층)", next: "shared_area_g" },
    ],
  },
  shared_area_b: {
    title: "영업장 바닥면적 합계가 66㎡ 이상인가요?",
    help: "",
    options: [
      { label: "예 (66㎡ 이상)", next: { result: "yes", historyKey: "shared_food", type: "공유주방 운영업", law: "시행령 제2조제1호의2", reason: "지하층 공유주방으로 바닥면적 합계 66㎡ 이상이므로 다중이용업소에 해당합니다." } },
      { label: "아니오 (66㎡ 미만)", next: { result: "no", type: "", law: "", reason: "바닥면적 합계가 66㎡ 미만이므로 다중이용업소에 해당하지 않습니다." } },
    ],
  },
  shared_area_g: {
    title: "영업장 바닥면적 합계가 100㎡ 이상인가요?",
    help: "",
    options: [
      { label: "예 (100㎡ 이상)", next: "shared_complex" },
      { label: "아니오 (100㎡ 미만)", next: { result: "no", type: "", law: "", reason: "바닥면적 합계가 100㎡ 미만이므로 다중이용업소에 해당하지 않습니다." } },
    ],
  },
  shared_complex: {
    title: "내부계단으로 연결된 복층구조 영업장인가요?",
    help: "",
    options: [
      { label: "예 (복층 + 내부계단 연결)", info: "하나의 영업장이 2개 층에 걸쳐 있고, 층 사이를 영업장 내부 계단으로 오르내리는 구조입니다.\n예) 1층과 2층이 모두 같은 공유주방이고, 내부 계단으로 연결된 구조", next: { result: "yes", historyKey: "shared_food", type: "공유주방 운영업", law: "시행령 제2조제1호의2", reason: "내부계단으로 연결된 복층구조 영업장은 층수·출입구 제외 규정이 적용되지 않으므로 다중이용업소에 해당합니다." } },
      { label: "아니오", next: "shared_floor" },
    ],
  },
  shared_floor: {
    title: "영업장이 지상 1층 또는 지상과 직접 접하는 층에 있나요?",
    help: "",
    options: [
      { label: "예", next: "shared_entrance" },
      { label: "아니오", next: { result: "yes", historyKey: "shared_food", type: "공유주방 운영업", law: "시행령 제2조제1호의2", reason: "지상 1층·지상 직접 접하는 층이 아닌 층에 있으므로 다중이용업소에 해당합니다." } },
    ],
  },
  shared_entrance: {
    title: "영업장의 주된 출입구가 건물 외부 지면과 직접 연결되나요?",
    help: "",
    options: [
      { label: "예 (외부 지면과 직접 연결)", next: { result: "no", type: "", law: "시행령 제2조제1호의2 단서", reason: "지상 1층 또는 지상과 직접 접하는 층에 있고 주된 출입구가 건물 외부 지면과 직접 연결되어 다중이용업소 적용에서 제외됩니다." } },
      { label: "아니오 (내부 통로 경유)", next: { result: "yes", historyKey: "shared_food", type: "공유주방 운영업", law: "시행령 제2조제1호의2", reason: "주된 출입구가 건물 외부 지면과 직접 연결되지 않으므로 다중이용업소에 해당합니다." } },
    ],
  },

  // ── 학원 ──
  academy_capacity: {
    title: "학원 수용인원이 몇 명인가요?",
    help: "「소방시설 설치 및 관리에 관한 법률 시행령」 별표 7에 따라 산정한 수용인원 기준입니다.",
    options: [
      { label: "300명 이상", next: { result: "yes", historyKey: "academy", type: "학원", law: "시행령 제2조제3호가목", reason: "수용인원이 300명 이상이므로 다중이용업소에 해당합니다." } },
      { label: "100명 이상 300명 미만", next: "academy_sub" },
      { label: "100명 미만", next: { result: "no", type: "", law: "", reason: "수용인원이 100명 미만이므로 다중이용업소에 해당하지 않습니다." } },
    ],
  },
  academy_sub: {
    title: "다음 중 해당하는 항목이 있나요?",
    help: "하나라도 해당하면 추가 확인이 필요합니다. (단, 방화구획으로 분리된 경우 제외 가능)",
    options: [
      { label: "같은 건물에 기숙사가 함께 있음", next: "academy_firewall" },
      { label: "같은 건물에 학원이 2개 이상 있고, 합산 수용인원이 300명 이상", next: "academy_firewall" },
      { label: "같은 건물에 다른 다중이용업소가 함께 있음", next: "academy_firewall" },
      { label: "해당 없음", next: { result: "no", type: "", law: "", reason: "수용인원 100~300명 미만이고 부가 조건(기숙사·복수 학원·다중이용업소 혼재)에 해당하지 않으므로 다중이용업소에 해당하지 않습니다." } },
    ],
  },
  academy_firewall: {
    title: "학원 사용 부분과 다른 용도 부분이 방화구획으로 구분되어 있나요?",
    help: "「건축법 시행령」 제46조에 따른 방화구획으로 나누어진 경우에는 다중이용업소 적용에서 제외됩니다.",
    options: [
      { label: "예 (방화구획으로 구분)", next: { result: "no", type: "", law: "시행령 제2조제3호나목 단서", reason: "학원 사용 부분과 다른 용도 부분이 방화구획으로 구분되어 있어 다중이용업소 적용에서 제외됩니다." } },
      { label: "아니오 (방화구획 없음)", next: { result: "yes", historyKey: "academy", type: "학원", law: "시행령 제2조제3호나목", reason: "수용인원 100~300명 미만이나 부가 조건(기숙사·복수 학원·다중이용업소 혼재)에 해당하고 방화구획으로 구분되어 있지 않으므로 다중이용업소에 해당합니다." } },
    ],
  },

  // ── 목욕장업 (찜질방) ──
  sauna_capacity: {
    title: "찜질·발한 시설 부분의 수용인원이 100명 이상인가요?",
    help: "물로 목욕할 수 있는 시설 부분의 수용인원은 제외하고 계산합니다.",
    options: [
      { label: "예 (100명 이상)", next: { result: "yes", historyKey: "sauna", type: "목욕장업(찜질방·황토방 등)", law: "시행령 제2조제4호가목", reason: "열기·원적외선 이용 발한시설의 수용인원이 100명 이상이므로 다중이용업소에 해당합니다." } },
      { label: "아니오 (100명 미만)", next: { result: "no", type: "", law: "", reason: "발한시설 부분의 수용인원이 100명 미만이므로 다중이용업소에 해당하지 않습니다." } },
    ],
  },

  // ── 게임제공업·인터넷컴퓨터게임시설제공업 ──
  game_complex: {
    title: "내부계단으로 연결된 복층구조 영업장인가요?",
    help: "복층구조(내부계단 연결)이면 층수·출입구 조건에 관계없이 다중이용업소에 해당합니다.",
    options: [
      { label: "예 (복층 + 내부계단 연결)", info: "하나의 영업장이 2개 층에 걸쳐 있고, 층 사이를 영업장 내부 계단으로 오르내리는 구조입니다.\n예) 1층과 2층이 모두 같은 PC방이고, 내부 계단으로 2층을 이용하는 구조", next: { result: "yes", historyKey: "game_pc", type: "게임제공업·인터넷컴퓨터게임시설제공업", law: "시행령 제2조제5호", reason: "내부계단으로 연결된 복층구조 영업장은 층수·출입구 제외 규정이 적용되지 않으므로 다중이용업소에 해당합니다." } },
      { label: "아니오 (단층 또는 외부계단)", next: "game_floor" },
    ],
  },
  game_floor: {
    title: "영업장이 지상 1층 또는 지상과 직접 접하는 층에 있나요?",
    help: "",
    options: [
      { label: "예 (지상 1층 또는 지상 직접 접하는 층)", next: "game_entrance" },
      { label: "아니오 (2층 이상 또는 지하층 등)", next: { result: "yes", historyKey: "game_pc", type: "게임제공업·인터넷컴퓨터게임시설제공업", law: "시행령 제2조제5호", reason: "지상 1층·지상 직접 접하는 층이 아닌 층에 있으므로 다중이용업소에 해당합니다." } },
    ],
  },
  game_entrance: {
    title: "영업장의 주된 출입구가 건물 외부 지면과 직접 연결되나요?",
    help: "",
    options: [
      { label: "예 (외부 지면과 직접 연결)", next: { result: "no", type: "", law: "시행령 제2조제5호 단서", reason: "지상 1층 또는 지상과 직접 접하는 층에 있고 주된 출입구가 건물 외부 지면과 직접 연결되어 있어 다중이용업소 적용에서 제외됩니다." } },
      { label: "아니오 (내부 통로 경유)", next: { result: "yes", historyKey: "game_pc", type: "게임제공업·인터넷컴퓨터게임시설제공업", law: "시행령 제2조제5호", reason: "주된 출입구가 건물 외부 지면과 직접 연결되지 않으므로 다중이용업소에 해당합니다." } },
    ],
  },

  // ── 만화카페 ──
  manga_area: {
    title: "영업장 바닥면적 합계가 50㎡ 이상인가요?",
    help: "50㎡ 미만인 경우는 만화카페업 적용에서 제외됩니다.",
    options: [
      { label: "예 (50㎡ 이상)", next: "manga_type" },
      { label: "아니오 (50㎡ 미만)", next: { result: "no", type: "", law: "", reason: "영업장 바닥면적 합계가 50㎡ 미만이므로 다중이용업소에 해당하지 않습니다." } },
    ],
  },
  manga_type: {
    title: "도서 대여·판매만 하는 영업인가요?",
    help: "단순히 도서를 대여하거나 판매만 하는 경우는 만화카페업에서 제외됩니다.",
    options: [
      { label: "예 (도서 대여·판매만)", next: { result: "no", type: "", law: "", reason: "도서 대여·판매만 하는 영업은 만화카페업에 해당하지 않아 다중이용업소 적용에서 제외됩니다." } },
      { label: "아니오 (음식 제공·열람공간 운영·구획된 실 설치 등)", next: { result: "yes", historyKey: "mangacafe", type: "만화카페업", law: "시행규칙 별표 1의2 제6호", reason: "50㎡ 이상이고 단순 대여·판매 외 음식 제공이나 열람공간·구획된 실 운영 등을 하므로 다중이용업소에 해당합니다." } },
    ],
  },
};

const multiuseState = {
  history: [],
  current: "start",
};

function buildMultiuseHistoryPanel() {
  const aside = document.createElement("aside");
  aside.className = "insp-history";
  const titleEl = document.createElement("div");
  titleEl.className = "insp-history-title";
  titleEl.textContent = "진행 내역";
  aside.appendChild(titleEl);

  if (multiuseState.history.length === 0) {
    const empty = document.createElement("div");
    empty.className = "insp-history-empty";
    empty.innerHTML = `
      <div class="insp-history-empty-icon">👥</div>
      <div class="insp-history-empty-title">다중이용업소 해당 여부</div>
      <div class="insp-history-empty-desc">우측 질문에 답하면<br>여기에 진행 내역이 쌓입니다.</div>
    `;
    aside.appendChild(empty);
    return aside;
  }

  multiuseState.history.forEach((entry, idx) => {
    const nodeKey = typeof entry === "object" ? entry.node : entry;
    const chosenLabel = typeof entry === "object" ? entry.label : "";
    const node = multiuseNodes[nodeKey];
    if (!node) return;
    const item = document.createElement("button");
    item.type = "button";
    item.className = "insp-history-item";
    item.innerHTML = `
      <span class="insp-history-step">STEP ${idx + 1}</span>
      <span class="insp-history-q">${node.title}</span>
      ${chosenLabel ? `<span class="insp-history-a">→ ${chosenLabel}</span>` : ""}
    `;
    item.addEventListener("click", () => multiuseJumpTo(idx));
    aside.appendChild(item);
  });

  return aside;
}

function renderMultiuse() {
  const root = document.getElementById("multiuse-content");
  const current = multiuseState.current;
  const currentStep = multiuseState.history.length + 1;

  root.innerHTML = "";
  const layout = document.createElement("div");
  layout.className = "insp-layout";

  layout.appendChild(buildMultiuseHistoryPanel());

  const main = document.createElement("div");
  main.className = "insp-main";

  if (current && typeof current === "object") {
    const isYes = current.result === "yes";
    const card = document.createElement("div");
    card.className = "wq-card";
    card.innerHTML = `
      <div class="insp-result ${isYes ? "insp-comprehensive" : "insp-operational"}">
        <div class="ir-badge">${isYes ? "다중이용업소 해당" : "해당 없음"}</div>
        <div class="ir-title">${isYes ? "다중이용업소에 해당합니다." : "다중이용업소에 해당하지 않습니다."}</div>
        ${current.type ? `<div class="mu-type">${current.type}</div>` : ""}
        <p class="ir-reason">${current.reason}</p>
        ${current.law ? `<div class="mu-law">${current.law}</div>` : ""}
      </div>
    `;
    // 법 편입 시기 안내 (해당 업종만)
    if (isYes && current.historyKey) {
      const note = MULTIUSE_HISTORY_NOTE[current.historyKey];
      if (note) {
        const noteBox = document.createElement("div");
        noteBox.className = "info-box amber";
        noteBox.style.cssText = "margin-top:10px;font-size:13px;";
        noteBox.innerHTML = `<div class="ib-title">📅 법 편입 시기 안내</div>${note}`;
        card.appendChild(noteBox);
      }
    }
    if (multiuseState.history.length > 0) {
      const backBtn = document.createElement("button");
      backBtn.type = "button";
      backBtn.className = "btn btn-ghost";
      backBtn.style.cssText = "width:100%;margin-bottom:8px;margin-top:10px;";
      backBtn.textContent = "이전으로";
      backBtn.addEventListener("click", multiuseBack);
      card.appendChild(backBtn);
    }
    const restartBtn = document.createElement("button");
    restartBtn.type = "button";
    restartBtn.className = "btn-restart";
    restartBtn.textContent = "처음부터 다시";
    restartBtn.addEventListener("click", multiuseRestart);
    card.appendChild(restartBtn);
    main.appendChild(card);
    layout.appendChild(main);
    root.appendChild(layout);
    return;
  }

  const node = multiuseNodes[current];
  if (!node) return;

  const card = document.createElement("div");
  card.className = "wq-card";

  const kicker = document.createElement("p");
  kicker.className = "wq-label";
  kicker.textContent = `STEP ${currentStep}`;
  card.appendChild(kicker);

  const title = document.createElement("h2");
  title.className = "wq-title";
  title.textContent = node.title;
  card.appendChild(title);

  if (node.help) {
    const help = document.createElement("p");
    help.className = "wq-sub";
    help.textContent = node.help;
    card.appendChild(help);
  }

  const list = document.createElement("div");
  list.className = "choice-list";

  node.options.forEach((option) => {
    if (option.groupLabel !== undefined) {
      const groupEl = document.createElement("p");
      groupEl.className = "wq-group-label";
      groupEl.textContent = option.groupLabel;
      list.appendChild(groupEl);
    }
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-button";
    if (option.info) {
      const labelWrap = document.createElement("div");
      labelWrap.className = "choice-label-wrap";
      const strong = document.createElement("strong");
      strong.textContent = option.label;
      const infoBtn = document.createElement("span");
      infoBtn.className = "calc-mode-info";
      infoBtn.textContent = "i";
      infoBtn.setAttribute("data-floating-tooltip", option.info);
      infoBtn.addEventListener("click", (e) => e.stopPropagation());
      labelWrap.appendChild(strong);
      labelWrap.appendChild(infoBtn);
      btn.appendChild(labelWrap);
      if (option.sub) {
        const span = document.createElement("span");
        span.textContent = option.sub;
        btn.appendChild(span);
      }
    } else {
      btn.innerHTML = `<strong>${option.label}</strong>${option.sub ? `<span>${option.sub}</span>` : ""}`;
    }
    btn.addEventListener("click", () => multiuseSelect(option, btn));
    list.appendChild(btn);
  });

  card.appendChild(list);

  if (multiuseState.history.length > 0) {
    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "btn btn-ghost";
    backBtn.style.cssText = "width:100%;margin-top:12px;";
    backBtn.textContent = "이전으로";
    backBtn.addEventListener("click", multiuseBack);
    card.appendChild(backBtn);
  }

  main.appendChild(card);
  layout.appendChild(main);
  root.appendChild(layout);
  initFloatingTooltips(card);
}

function multiuseSelect(option, btn) {
  if (btn) {
    btn.classList.add("selected");
    const list = btn.parentElement;
    if (list) list.querySelectorAll("button.choice-button").forEach((b) => { if (b !== btn) b.style.pointerEvents = "none"; });
  }
  const currentNodeKey = multiuseState.current;
  setTimeout(() => {
    multiuseState.history.push({ node: currentNodeKey, label: option.label });
    multiuseState.current = option.next;
    renderMultiuse();
    const scrollEl = document.querySelector("#screen-multiuse .scroll-content");
    if (scrollEl) scrollEl.scrollTo({ top: 0, behavior: "smooth" });
  }, 550);
}

function multiuseBack() {
  if (multiuseState.history.length > 0) {
    const last = multiuseState.history.pop();
    multiuseState.current = typeof last === "object" ? last.node : last;
    renderMultiuse();
  }
}

function multiuseJumpTo(index) {
  if (index < 0 || index >= multiuseState.history.length) return;
  const target = multiuseState.history[index];
  const targetNode = typeof target === "object" ? target.node : target;
  multiuseState.history = multiuseState.history.slice(0, index);
  multiuseState.current = targetNode;
  renderMultiuse();
}

function multiuseRestart() {
  multiuseState.history = [];
  multiuseState.current = "start";
  renderMultiuse();
}

// ─────────────────────────────────────────────────────────────────────────────

document.getElementById("open-explorer").addEventListener("click", () => {
  showScreen("explorerSelect");
});
document.getElementById("back-from-explorer-select").addEventListener("click", () => showScreen("home"));
document.getElementById("explorer-select-simple").addEventListener("click", () => {
  trackMenuClick("소방시설 탐색기-간단한버전");
  explorerRuntime.mode = "default";
  applyExplorerModeUI();
  showScreen("explorer");
  restartExplorer();
});
document.getElementById("explorer-select-detailed").addEventListener("click", () => {
  trackMenuClick("소방시설 탐색기-자세한버전");
  showScreen("explorerYear");
  yearWizardRestart();
});
document.getElementById("open-date-calculator").addEventListener("click", () => {
  trackMenuClick("법정기한 계산기");
  showScreen("date");
  renderDateCalculator();
});
document.getElementById("open-multiuse-decoder").addEventListener("click", () => {
  showScreen("multiuseSelect");
});
document.getElementById("back-from-multiuse-select").addEventListener("click", () => showScreen("home"));
document.getElementById("multiuse-select-decoder").addEventListener("click", () => {
  trackMenuClick("다중이용업소 탐색기-해당여부 판독기");
  multiuseRestart();
  showScreen("multiuse");
});
document.getElementById("multiuse-select-safety").addEventListener("click", () => {
  trackMenuClick("다중이용업소 탐색기-안전시설 탐색");
  explorerRuntime.mode = "multiuse-only";
  explorerRuntime.from = "multiuseSelect";
  applyExplorerModeUI();
  showScreen("explorer");
  restartMultiuseOnly();
});
document.getElementById("back-from-multiuse").addEventListener("click", () => showScreen("multiuseSelect"));

// ── 수용인원 계산기 ──────────────────────────────────────────

const occupancyState = {
  tool: "occupancy",
  category: "lodging",         // "lodging" | "classroom" | "assembly" | "other"
  subType: "lodging_bed",      // sub for lodging/assembly
  values: {},
  staffingTargetType: "apartment",
  staffingHouseholds: "",
  staffingArea: "",
};

function getEffectiveOccType() {
  const c = occupancyState.category;
  if (c === "classroom") return "classroom";
  if (c === "other") return "other";
  return occupancyState.subType;
}

function buildOccFormula(type, vals) {
  const n = (v) => parseFloat(v) || 0;
  switch (type) {
    case "lodging_bed":   return `${n(vals.staff)} + ${n(vals.singleBeds)} + ${n(vals.doubleBeds)}×2`;
    case "lodging_no_bed":return `${n(vals.staff)} + ⌊${n(vals.area)} ÷ 3⌋`;
    case "classroom":     return `⌊${n(vals.area)} ÷ 1.9⌋`;
    case "assembly_free": return `⌊${n(vals.area)} ÷ 4.6⌋`;
    case "assembly_fixed":return `${n(vals.seats)}`;
    case "assembly_bench":return `⌊${n(vals.benchWidth)} × ${n(vals.benchCount || 1)} ÷ 0.45⌋`;
    case "other":         return `⌊${n(vals.area)} ÷ 3⌋`;
    default: return "";
  }
}

function getOccupancyBackStep(type) {
  if (["lodging_bed", "lodging_no_bed"].includes(type)) return "lodging_sub";
  if (["assembly_free", "assembly_fixed", "assembly_bench"].includes(type)) return "assembly_sub";
  return "category";
}

const occupancyTypes = [
  { key: "lodging_bed",       label: "침대 있는 숙박시설",       desc: "종사자 수 + 침대 수(2인용은 2개로 산정)" },
  { key: "lodging_no_bed",    label: "침대 없는 숙박시설",        desc: "종사자 수 + 숙박 바닥면적 ÷ 3㎡" },
  { key: "classroom",         label: "강의실·교무실·상담실·실습실·휴게실", desc: "바닥면적 ÷ 1.9㎡" },
  { key: "assembly_free",     label: "강당·문화집회·운동·종교시설 (자유석)", desc: "바닥면적 ÷ 4.6㎡" },
  { key: "assembly_fixed",    label: "강당·문화집회·운동·종교시설 (고정 의자)", desc: "의자 수" },
  { key: "assembly_bench",    label: "강당·문화집회·운동·종교시설 (긴 의자)", desc: "의자 너비 × 개수 ÷ 0.45m" },
  { key: "other",             label: "그 밖의 특정소방대상물",     desc: "바닥면적 ÷ 3㎡" },
];

function calcOccupancy(type, vals) {
  const n = (v) => parseFloat(v) || 0;
  switch (type) {
    case "lodging_bed":
      return Math.round(n(vals.staff) + n(vals.singleBeds) + n(vals.doubleBeds) * 2);
    case "lodging_no_bed":
      return Math.round(n(vals.staff) + n(vals.area) / 3);
    case "classroom":
      return Math.round(n(vals.area) / 1.9);
    case "assembly_free":
      return Math.round(n(vals.area) / 4.6);
    case "assembly_fixed":
      return Math.round(n(vals.seats));
    case "assembly_bench":
      return Math.round((n(vals.benchWidth) * n(vals.benchCount || 1)) / 0.45);
    case "other":
      return Math.round(n(vals.area) / 3);
    default:
      return 0;
  }
}

function getOccupancyFields(type) {
  switch (type) {
    case "lodging_bed":
      return [
        { key: "staff",       label: "종사자 수 (명)",        placeholder: "예: 5",   unit: "명" },
        { key: "singleBeds",  label: "1인용 침대 수 (개)",    placeholder: "예: 10",  unit: "개" },
        { key: "doubleBeds",  label: "2인용 침대 수 (개)",    placeholder: "예: 5",   unit: "개" },
      ];
    case "lodging_no_bed":
      return [
        { key: "staff",  label: "종사자 수 (명)",           placeholder: "예: 3",    unit: "명" },
        { key: "area",   label: "숙박시설 바닥면적 합계 (㎡)", placeholder: "예: 120", unit: "㎡" },
      ];
    case "classroom":
    case "assembly_free":
    case "other":
      return [
        { key: "area", label: "바닥면적 합계 (㎡)", placeholder: "예: 200", unit: "㎡" },
      ];
    case "assembly_fixed":
      return [
        { key: "seats", label: "고정 의자 수 (개)", placeholder: "예: 150", unit: "개" },
      ];
    case "assembly_bench":
      return [
        { key: "benchWidth", label: "긴 의자 1개의 정면 너비 (m)", placeholder: "예: 5", unit: "m" },
        { key: "benchCount", label: "긴 의자 개수 (개)", placeholder: "예: 10", unit: "개" },
      ];
    default:
      return [];
  }
}

function renderOccupancyCalculator() {
  const root = document.getElementById("occupancy-content");
  const tool = occupancyState.tool || "occupancy";
  const lawChip = document.getElementById("occupancy-law-chip");
  if (lawChip) lawChip.dataset.lawKey = "occupancy-" + tool;
  const prevActiveField = document.activeElement?.dataset?.occField;
  const prevActiveStaffing = document.activeElement?.id === "utility-staffing-value";

  const tabsHTML = `
    <div class="utility-tool-tabs">
      <button class="utility-tool-tab${tool === "occupancy" ? " active" : ""}" type="button" data-util-tool="occupancy">수용인원 계산기</button>
      <button class="utility-tool-tab${tool === "staffing" ? " active" : ""}" type="button" data-util-tool="staffing">보조자 선임인원</button>
    </div>
  `;

  attachHorizontalSwipeNavigation(root, () => ({
    keys: ["occupancy", "staffing"],
    current: occupancyState.tool || "occupancy",
    onChange: (nextTool) => {
      occupancyState.tool = nextTool;
      renderOccupancyCalculator();
      root.scrollTop = 0;
    },
  }));

  function attachTabListeners() {
    const tabs = root.querySelector(".utility-tool-tabs");
    if (!tabs) return;
    tabs.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-util-tool]");
      if (btn && tabs.contains(btn)) {
        occupancyState.tool = btn.dataset.utilTool;
        renderOccupancyCalculator();
        root.scrollTop = 0;
      }
    });
  }

  // ── 보조자 선임인원 탭 ────────────────────────────────────────────────
  if (tool === "staffing") {
    const targetType = occupancyState.staffingTargetType;
    const isApartment = targetType === "apartment";
    const staffingValue = isApartment ? occupancyState.staffingHouseholds : occupancyState.staffingArea;
    const inputLabel = isApartment ? "세대수" : "연면적 (㎡)";
    const inputPlaceholder = isApartment ? "예: 601" : "예: 30001";
    const formulaHint = isApartment ? "세대수 ÷ 300 (소수점 버림)" : "연면적 ÷ 15,000 (소수점 버림)";
    const staffingResult = getAssistantStaffingResult(targetType, staffingValue);

    root.innerHTML = `
      <div class="utility-mode-header">
        ${tabsHTML}
      </div>
      <div class="utility-tool-panel">
      <section class="occ-calc-card">
        <div class="occ-section-label">대상 구분</div>
        <div class="occ-segmented" data-occ-segmented="staffing">
          <button type="button" data-staffing-target="apartment" class="${isApartment ? "active" : ""}">아파트</button>
          <button type="button" data-staffing-target="other" class="${!isApartment ? "active" : ""}">그 외 대상</button>
        </div>

        <div class="occ-formula-hint">${formulaHint}</div>

        <div class="occ-input-grid">
          <div class="calc-form-row">
            <label>${inputLabel}</label>
            <input id="utility-staffing-value" class="calc-input" type="text" inputmode="numeric" pattern="[0-9]*" placeholder="${inputPlaceholder}" value="${staffingValue}">
          </div>
        </div>

        <div class="occ-result-card ${staffingResult ? "has-result" : ""}">
          <div class="occ-result-label">선임인원</div>
          ${staffingResult ? `
            <div class="occ-result-num">${staffingResult.count}<span>명</span></div>
            <div class="occ-result-formula">⌊${staffingResult.inputValue.toLocaleString()} ÷ ${staffingResult.divisor.toLocaleString()}⌋ = ${staffingResult.count}명</div>
          ` : `
            <div class="occ-result-empty">값을 입력하면 바로 계산됩니다</div>
          `}
        </div>

        <p class="occ-note">※ 그 외 대상은 기숙사·의료시설·노유자시설·수련시설·숙박시설 제외 기준입니다.</p>
      </section>

      <div class="dc-ref-accordion">
        <div class="dc-ref-head">선임 대상</div>
        <div class="dc-ref-body">
          <div class="dc-ref-row">
            <div class="dc-ref-marker">가.</div>
            <div class="dc-ref-text">300세대 이상인 아파트</div>
          </div>
          <div class="dc-ref-row">
            <div class="dc-ref-marker">나.</div>
            <div class="dc-ref-text">연면적 1만5천㎡ 이상인 특정소방대상물(아파트·연립주택 제외)</div>
          </div>
          <div class="dc-ref-row">
            <div class="dc-ref-marker">다.</div>
            <div class="dc-ref-text">
              <span>가·나 외 특정소방대상물 중 다음 어느 하나에 해당하는 것</span>
              <span class="dc-ref-sub">1) 공동주택 중 기숙사</span>
              <span class="dc-ref-sub">2) 의료시설</span>
              <span class="dc-ref-sub">3) 노유자 시설</span>
              <span class="dc-ref-sub">4) 수련시설</span>
              <span class="dc-ref-sub">5) 숙박시설(바닥면적 합계 1,500㎡ 미만이고 관계인이 24시간 상시 근무하는 경우 제외)</span>
            </div>
          </div>
        </div>
      </div>
      <div class="dc-ref-accordion" style="margin-top:10px;">
        <div class="dc-ref-head">선임 인원</div>
        <div class="dc-ref-body">
          <div class="dc-ref-row">
            <div class="dc-ref-marker">가.</div>
            <div class="dc-ref-text">아파트(300세대 이상): 1명. 초과되는 300세대마다 1명 이상 추가 선임</div>
          </div>
          <div class="dc-ref-row">
            <div class="dc-ref-marker">나.</div>
            <div class="dc-ref-text">연면적 1만5천㎡ 이상: 1명. 초과되는 연면적 1만5천㎡마다 1명 추가 선임</div>
          </div>
          <div class="dc-ref-row">
            <div class="dc-ref-marker">다.</div>
            <div class="dc-ref-text">그 밖의 대상: 1명. 야간·휴일에 이용되지 않는 것이 확인된 경우 선임 제외 가능</div>
          </div>
        </div>
      </div>
      </div>
    `;
    animateSwipeNavigation(root);
    attachTabListeners();

    root.querySelectorAll("[data-staffing-target]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = btn.dataset.staffingTarget;
        if (next === occupancyState.staffingTargetType) return;
        occupancyState.staffingTargetType = next;
        occupancyState.staffingHouseholds = "";
        occupancyState.staffingArea = "";
        renderOccupancyCalculator();
      });
    });

    const staffingInput = root.querySelector("#utility-staffing-value");
    const staffingResultCard = root.querySelector(".occ-result-card");
    if (staffingInput) {
      staffingInput.addEventListener("input", (e) => {
        const key = occupancyState.staffingTargetType === "apartment" ? "staffingHouseholds" : "staffingArea";
        const sanitized = sanitizeAssistantNumericInput(e.target.value);
        occupancyState[key] = sanitized;
        // 입력란을 재생성하지 않고 결과만 갱신 (안드로이드 WebView 숫자 역순 입력 버그 방지)
        if (e.target.value !== sanitized) {
          const pos = Math.max(0, e.target.selectionStart - (e.target.value.length - sanitized.length));
          e.target.value = sanitized;
          e.target.setSelectionRange(pos, pos);
        }
        if (staffingResultCard) {
          const r = getAssistantStaffingResult(occupancyState.staffingTargetType, sanitized);
          staffingResultCard.classList.toggle("has-result", !!r);
          staffingResultCard.innerHTML = `
            <div class="occ-result-label">선임인원</div>
            ${r ? `
              <div class="occ-result-num">${r.count}<span>명</span></div>
              <div class="occ-result-formula">⌊${r.inputValue.toLocaleString()} ÷ ${r.divisor.toLocaleString()}⌋ = ${r.count}명</div>
            ` : `
              <div class="occ-result-empty">값을 입력하면 바로 계산됩니다</div>
            `}
          `;
        }
      });
      if (prevActiveStaffing) {
        staffingInput.focus();
        staffingInput.setSelectionRange(staffingInput.value.length, staffingInput.value.length);
      }
    }
    return;
  }

  // ── 수용인원 탭 ──────────────────────────────────────────────────────
  const cat = occupancyState.category;
  const effType = getEffectiveOccType();
  const typeInfo = occupancyTypes.find((t) => t.key === effType);
  const fields = getOccupancyFields(effType);
  const fieldValues = occupancyState.values || {};
  const allFilled = fields.every((f) => {
    const v = fieldValues[f.key];
    return v !== undefined && v !== "";
  });
  const calcResult = allFilled ? calcOccupancy(effType, fieldValues) : null;

  const subTypesByCat = {
    lodging: [
      { key: "lodging_bed",    label: "침대 있음" },
      { key: "lodging_no_bed", label: "침대 없음" },
    ],
    assembly: [
      { key: "assembly_free",  label: "자유석" },
      { key: "assembly_fixed", label: "고정 의자" },
      { key: "assembly_bench", label: "긴 의자" },
    ],
  };
  const subList = subTypesByCat[cat];

  root.innerHTML = `
    <div class="utility-mode-header">
      ${tabsHTML}
    </div>
    <div class="utility-tool-panel">
    <section class="occ-calc-card">
      <div class="occ-section-label">용도</div>
      <div class="occ-segmented" data-occ-segmented="category">
        <button type="button" data-occ-cat="lodging"  class="${cat === "lodging"  ? "active" : ""}">숙박시설</button>
        <button type="button" data-occ-cat="classroom" class="${cat === "classroom" ? "active" : ""}">강의실·교무실</button>
        <button type="button" data-occ-cat="assembly"  class="${cat === "assembly"  ? "active" : ""}">강당·집회·운동</button>
        <button type="button" data-occ-cat="other"    class="${cat === "other"    ? "active" : ""}">그 밖의 대상</button>
      </div>

      ${subList ? `
        <div class="occ-section-label">세부 유형</div>
        <div class="occ-subchips">
          ${subList.map((s) => `
            <button type="button" class="occ-subchip ${occupancyState.subType === s.key ? "active" : ""}" data-occ-sub="${s.key}">${s.label}</button>
          `).join("")}
        </div>
      ` : ""}

      <div class="occ-formula-hint">${typeInfo.desc}</div>

      <div class="occ-input-grid">
        ${fields.map((f) => `
          <div class="calc-form-row">
            <label>${f.label}</label>
            <input class="calc-input" id="occ-field-${f.key}" type="number" min="0" step="0.1" placeholder="${f.placeholder}" data-occ-field="${f.key}" value="${fieldValues[f.key] ?? ""}">
          </div>
        `).join("")}
      </div>

      <div class="occ-result-card ${calcResult !== null ? "has-result" : ""}">
        <div class="occ-result-label">산정 결과</div>
        ${calcResult !== null ? `
          <div class="occ-result-num">${calcResult.toLocaleString()}<span>명</span></div>
          <div class="occ-result-formula">${buildOccFormula(effType, fieldValues)} = ${calcResult}명</div>
        ` : `
          <div class="occ-result-empty">값을 모두 입력하면 바로 계산됩니다</div>
        `}
      </div>

      <p class="occ-note">※ 복도·계단·화장실 바닥면적은 포함하지 않습니다. 소수점 이하는 반올림합니다.</p>
    </section>
    </div>
  `;
  animateSwipeNavigation(root);
  attachTabListeners();

  root.querySelectorAll("[data-occ-cat]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const newCat = btn.dataset.occCat;
      if (newCat === occupancyState.category) return;
      occupancyState.category = newCat;
      if (newCat === "lodging")  occupancyState.subType = "lodging_bed";
      if (newCat === "assembly") occupancyState.subType = "assembly_free";
      occupancyState.values = {};
      renderOccupancyCalculator();
    });
  });

  root.querySelectorAll("[data-occ-sub]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const newSub = btn.dataset.occSub;
      if (newSub === occupancyState.subType) return;
      occupancyState.subType = newSub;
      occupancyState.values = {};
      renderOccupancyCalculator();
    });
  });

  const occResultCard = root.querySelector(".occ-result-card");
  root.querySelectorAll("[data-occ-field]").forEach((input) => {
    input.addEventListener("input", () => {
      if (!occupancyState.values) occupancyState.values = {};
      occupancyState.values[input.dataset.occField] = input.value;
      // 입력란을 재생성하지 않고 결과만 갱신 (number 입력 커서 역순 입력 버그 방지)
      if (occResultCard) {
        const vals = occupancyState.values;
        const filled = fields.every((f) => vals[f.key] !== undefined && vals[f.key] !== "");
        const res = filled ? calcOccupancy(effType, vals) : null;
        occResultCard.classList.toggle("has-result", res !== null);
        occResultCard.innerHTML = `
          <div class="occ-result-label">산정 결과</div>
          ${res !== null ? `
            <div class="occ-result-num">${res.toLocaleString()}<span>명</span></div>
            <div class="occ-result-formula">${buildOccFormula(effType, vals)} = ${res}명</div>
          ` : `
            <div class="occ-result-empty">값을 모두 입력하면 바로 계산됩니다</div>
          `}
        `;
      }
    });
  });

  if (prevActiveField) {
    const el = root.querySelector(`#occ-field-${prevActiveField}`);
    if (el) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }
}

screens.occupancy = document.getElementById("screen-occupancy");
screens.lab = document.getElementById("screen-lab");
screens.facilities = document.getElementById("screen-facilities");
document.getElementById("open-occupancy-calculator").addEventListener("click", () => {
  trackMenuClick("유틸리티 도구함");
  occupancyState.tool = "occupancy";
  occupancyState.category = "lodging";
  occupancyState.subType = "lodging_bed";
  occupancyState.values = {};
  renderOccupancyCalculator();
  showScreen("occupancy");
});
document.getElementById("back-from-occupancy").addEventListener("click", () => showScreen("home"));
document.getElementById("open-facilities").addEventListener("click", () => {
  trackMenuClick("소방시설 도감");
  showScreen("facilities");
  if (typeof window.initFacilities === "function") window.initFacilities();
});
document.getElementById("back-from-inspection").addEventListener("click", () => {
  rgState.mode = 'select';
  renderReportGuide();
  showScreen('reportGuide');
});
document.getElementById("open-lab").addEventListener("click", () => {
  showScreen("lab");
});
document.getElementById("back-from-lab").addEventListener("click", () => showScreen("home"));

document.getElementById("lab-open-multiuse-safety").addEventListener("click", () => {
  explorerRuntime.mode = "multiuse-only";
  explorerRuntime.from = "lab";
  applyExplorerModeUI();
  showScreen("explorer");
  restartMultiuseOnly();
});
document.getElementById("open-layout-learn").addEventListener("click", () => {
  showScreen("layoutLearn");
  if (typeof window.initLayoutLearn === "function") window.initLayoutLearn();
});
document.getElementById("back-from-layout-learn").addEventListener("click", () => showScreen("lab"));
document.getElementById("back-from-explorer").addEventListener("click", () => {
  if (explorerRuntime.mode === "multiuse-only") showScreen(explorerRuntime.from === "lab" ? "lab" : "multiuseSelect");
  else showScreen("home");
});
// =============================================
// 연도별 탐색기 (Year-based Explorer)
// =============================================

const YD = {
  D19811106: 19811106,
  D19840701: 19840701,
  D19840816: 19840816,
  D19820928: 19820928,
  D19900701: 19900701,
  D19910108: 19910108,
  D19820915: 19820915, // 편복도형 아파트 피난기구 면제
  D19931111: 19931111, // 공동주택 공기안전매트 추가 설치
  D19950810: 19950810, // 갓복도형 아파트 제연 면제·무선통신 면제 조항
  D20010320: 20010320, // 자동화재탐지설비 모든 아파트로 확대(제7조 단서 삭제)
  D19920728: 19920728,
  D19940720: 19940720,
  D19970927: 19970927,
  D19990729: 19990729,
  D20010101: 20010101,
  D20010521: 20010521,
  D20020330: 20020330,
  D20040530: 20040530,
  D20040604: 20040604,
  D20061207: 20061207,
  D20080229: 20080229,
  D20110707: 20110707,
  D20111028: 20111028, // 옥외소화전 설치대상에서 아파트 명시 제외 (공동주택)
  D20111123: 20111123, // 자동화재속보설비 30층 이상 공통 편입 (2011.11.23 ~ 2022.11.30)
  D20120205: 20120205, // 노유자 생활시설 구분 신설 (2012년 2월)
  D20120206: 20120206, // 소화기 명칭 변경(수동식소화기→소화기)·주방용 자동소화장치
  D20170726: 20170726, // 스프링클러 용도무관 의무층수 11층→6층 강화 (공동주택)
  D20120215: 20120215, // 정신의료기관 간이스프링클러 신설 (2012년 2월)
  D20120914: 20120914,
  D20130109: 20130109,
  D20130210: 20130210,
  D20140708: 20140708, // 요양병원 스프링클러·간이스프링클러·FACP·속보 추가 (2014년 7월)
  D20150108: 20150108, // 노유자시설 제연설비 적용 시작
  D20150701: 20150701,
  D20160101: 20160101,
  D20170128: 20170128,
  D20180128: 20180128,
  D20181018: 20181018,
  D20180627: 20180627,
  D20190806: 20190806,
  D20220225: 20220225,
  D20221201: 20221201,
  D20231201: 20231201,
  D20240517: 20240517,
  D20241231: 20241231,
  D20251201: 20251201,
};

const yearState = {
  currentStep: 0,
  answers: {
    yEraChoice: "after2004",
    yOccupancyType: "neighborhood",
    yAutoCalcAreas: "yes",
    yPermitdate: "2026-05-31",
    yTotalArea: "1500",
    yAboveGroundFloors: "4",
    yBasementFloors: "0",
    yBasementAreaSum: "0",
    yHasWindowlessFloor: "no",
    yWindowlessArea: "",
    yHasLargeTargetFloor: "no",
    yHasLargeFloorFor1000: "no",
    yNeighborhoodArea: "1500",
    yFacilitySubtype: "general",
    yIsPostpartum: "no",
    yPostpartumAreaRange: "under600",
    yIsClinicWithInpatient: "no",
    yHasHemodialysis: "no",
    yHas24HourStaff: "no",
    yBefore2004FacilitySubtype: "general",
    yBefore2004HasLargeFloor450: "no",
    yBefore2004SprinklerFloor: "no",
    yBefore2004HasDetFloor300: "no",
    yBefore2004LargeFloor1000: "no",
    yFirstSecondFloorArea: "750",
    yIndoorParkingArea: "",
    yMechanicalParkingCapacity: "",
    yElectricalRoomArea: "",
    ySmokeControlArea: "0",
    yHasSmallUndergroundParking: "no",
    // 근린생활시설 다중이용업소
    yHasMultiuseBusiness: "no",
    yMultiuseInBasement: "no",
    yMultiuseIsSealed: "no",
    yMultiuseIsPostpartum: "no",
    yMultiuseIsGosiwon: "no",
    yMultiuseIsGunRange: "no",
    yMultiuseOnSecondToTenthFloor: "no",
    yMultiuseOnGroundOrRefugeFloor: "no",
    yMultiuseUsesAV: "no",
    yMultiuseHasGasFacility: "no",
    yMultiuseHasRooms: "no",
    yMultiuseHasEvacuationRoute: "no",
    // 숙박시설 전용
    yLodgingArea: "1500",
    yLodgingIsLiving: "no",
    yLodgingIsTouristHotel: "no",
    yLodgingHasLargeFloorFor1000: "no",
    yLodgingHasGasFacility: "no",
    // 숙박시설 다중이용업소
    yLodgingHasMultiuseBusiness: "no",
    yLodgingMultiuseInBasement: "no",
    yLodgingMultiuseIsSealed: "no",
    yLodgingMultiuseIsPostpartum: "no",
    yLodgingMultiuseIsGosiwon: "no",
    yLodgingMultiuseIsGunRange: "no",
    yLodgingMultiuseOnSecondToTenthFloor: "no",
    yLodgingMultiuseOnGroundOrRefugeFloor: "no",
    yLodgingMultiuseUsesAV: "no",
    yLodgingMultiuseHasGasFacility: "no",
    yLodgingMultiuseHasRooms: "no",
    yLodgingMultiuseHasEvacuationRoute: "no",
    yLodgingFirstSecondFloorArea: "750",
    yLodgingIndoorParkingArea: "",
    yLodgingMechanicalParkingCapacity: "",
    yLodgingElectricalRoomArea: "",
    yLodgingBasementAreaForSmoke: "0",
    // 노유자시설 전용
    yElderlySubtype: "general",
    yElderlyArea: "1500",
    yElderlyHasLargeTargetFloor: "no",
    yElderlyHasGrillWindow: "no",
    yElderlyHasGasFacility: "no",
    yElderlyHasFloor500Plus: "no",
    yElderlyHas24HourStaff: "no",
    yElderlyFirstSecondFloorArea: "750",
    yElderlyIndoorParkingArea: "",
    yElderlyMechanicalParkingCapacity: "",
    yElderlyElectricalRoomArea: "",
    yElderlyBasementAreaForSmoke: "0",
    yElderlyHasSmallUndergroundParking: "no",
    // 의료시설 전용
    yMedicalSubtype: "hospital",
    yMedicalArea: "1500",
    yMedicalHasLargeTargetFloor: "no",
    yMedicalHasGrillWindow: "no",
    yMedicalHasGasFacility: "no",
    yMedicalHasFloor500Plus: "no",
    yMedicalFirstSecondFloorArea: "750",
    yMedicalIndoorParkingArea: "",
    yMedicalMechanicalParkingCapacity: "",
    yMedicalElectricalRoomArea: "",
    yMedicalBasementAreaForSmoke: "0",
    // 분법 이전 의료시설 전용
    yBefore2004MedicalSubtype: "hospital",
    yBefore2004MedicalHasLargeFloor450: "no",
    yBefore2004MedicalHasLargeFloor300: "no",
    yBefore2004MedicalSprinklerFloor: "no",
    yBefore2004MedicalAutoDetFloor300: "no",
    yBefore2004MedicalHasLargeFloor1000: "no",
    yBefore2004MedicalHasFloor1500: "no",
    yBefore2004MedicalElectricalRoomArea: "",
    yBefore2004MedicalIndoorParkingArea: "",
    yBefore2004MedicalMechanicalParkingCapacity: "",
    // 분법 이전 숙박시설 전용
    yBefore2004LodgingIsTouristHotel: "no",
    yBefore2004LodgingHasLargeFloor450: "no",
    yBefore2004LodgingSprinklerFloor: "no",
    yBefore2004LodgingAutoDetFloor300: "no",
    yBefore2004LodgingHasLargeFloor300: "no",
    yBefore2004LodgingHasLargeFloor1000: "no",
    yBefore2004LodgingHasFloor1500: "no",
    yBefore2004LodgingElectricalRoomArea: "",
    yBefore2004LodgingIndoorParkingArea: "",
    yBefore2004LodgingMechanicalParkingCapacity: "",
    // 분법 이전 노유자시설 전용
    yBefore2004ElderlyHasLargeFloor450: "no",
    yBefore2004ElderlyHasLargeFloor300: "no",
    yBefore2004ElderlySprinklerFloor: "no",
    yBefore2004ElderlyLargeFloor1000: "no",
    yBefore2004ElderlyHasFloor500Plus: "no",
    yBefore2004ElderlyAutoDetFloor300: "no",
    yBefore2004ElderlyElectricalRoomArea: "",
    yBefore2004ElderlyIndoorParkingArea: "",
    yBefore2004ElderlyMechanicalParkingCapacity: "",
    // 분법 이전 종교시설 전용
    yBefore2004ReligiousHasLargeFloor600: "no",
    yBefore2004ReligiousIndoorParkingArea: "",
    yBefore2004ReligiousMechanicalParkingCapacity: "",
    yBefore2004ReligiousElectricalRoomArea: "",
    // 종교시설 전용
    yReligiousHasLargeTargetFloor: "no",
    yReligiousFirstSecondFloorArea: "750",
    yReligiousIndoorParkingArea: "",
    yReligiousMechanicalParkingCapacity: "",
    yReligiousElectricalRoomArea: "",
    yReligiousOccupancy100Plus: "no",
    yReligiousIsWoodStructure: "no",
    yReligiousIsSacrificialBuilding: "no",
    yReligiousHasStage: "no",
    yReligiousStageArea: "",
    yReligiousHasGasFacility: "no",
    // 판매시설 전용
    ySalesArea: "1500",
    ySalesHasLargeTargetFloor: "no",
    ySalesFirstSecondFloorArea: "750",
    ySalesIndoorParkingArea: "",
    ySalesMechanicalParkingCapacity: "",
    ySalesElectricalRoomArea: "",
    ySalesOccupancy500Plus: "no",
    ySalesOccupancy100Plus: "no",
    ySalesIsTraditionalMarket: "no",
    ySalesIsLargeStore: "no",
    ySalesHasRestaurantKitchen: "no",
    ySalesHas24HourStaff: "no",
    ySalesHasGasFacility: "no",
    // 분법 이전 판매시설(구 「시장」) 전용
    yBefore2004SalesArea: "",
    yBefore2004SalesHasLargeFloor450: "no",
    yBefore2004SalesHasLargeFloor300: "no",
    yBefore2004SalesSprinklerFloor: "no",
    yBefore2004SalesLargeFloor1000: "no",
    yBefore2004SalesAutoDetFloor600: "no",
    yBefore2004SalesHasFloor1500: "no",
    // 공동주택 전용 (분법 이후)
    yApartmentSubtype: "apt",
    yAptBuildingCount: "1",      // 동 수 (연면적을 동당 평균으로 환산)
    yAptHouseholdCount: "150",   // 세대수 (공기안전매트 판단)
    yAptHouseholds: "no",        // 50세대 미만 연립·다세대 여부 (물분무등 주차장 예외)
    yAptIsNationalHousing: "no", // 국민주택규모 이하 + 지하 대피시설 (연결살수 700㎡ 특례)
    yAptIsGatBokdo: "no",        // 갓복도형 아파트등 (제연 면제)
    yAptHasCO2System: "no",      // 이산화탄소소화설비 설치 (인명구조기구 공기호흡기)
    yAptHasFloor600: "no",       // 4층 이상 층 중 600㎡↑ (옥내소화전)
    yAptHasFloor1000: "no",      // 4층 이상 층 중 1000㎡↑ (스프링클러)
    yAptFirstSecondFloorArea: "", // 지상 1·2층 바닥면적 합계 (옥외소화전 9000㎡)
    yAptIndoorParkingArea: "0",  // 건물 내 차고·주차장 면적
    yAptMechanicalParkingCapacity: "0", // 기계식 주차 대수
    yAptElectricalRoomArea: "0", // 전기실·발전실 등 면적
    yAptUndergroundParkingArea: "", // 지하 차고·주차장 면적 (비상경보·연결살수 소규모 기준)
    yAptHasSpecialStair: "no",   // 특별피난계단·비상용승강기·피난용승강기 부설 (제연)
    // 공동주택 전용 (분법 이전)
    yBefore2004AptHouseholds: "150",    // 세대수 (자탐·물분무차고·공기안전매트 의무관리대상 판정)
    yBefore2004AptCorridorType: "none", // 갓복도형(gat)/편복도형(pyeon)/그외(none)
    yAptHasParkingBuilding: "no",       // 별동 주차장 유무
    yAptParkingArea: "",                // 주차장동 연면적
    yAptParkingAbove: "0",              // 주차장동 지상 층수
    yAptParkingBelow: "1",              // 주차장동 지하 층수
    yAptParkingBasementArea: "",        // 주차장동 지하 바닥면적 합계
    yBefore2004AptHasLargeFloor450: "no", // 옥내소화전(1992 이전): 지하·무창·4층↑ 450㎡↑ 층
    yBefore2004AptHasLargeFloor600: "no", // 옥내소화전(1992 이후): 지하·무창·4층↑ 600㎡↑ 층
    yBefore2004AptDetFloor600: "no",      // 자탐(1992 이전): 지하·무창·3층↑ 600㎡↑ 층
  },
};

function yPermitDateInt() {
  const d = yearState.answers.yPermitDate;
  if (!d) return 0;
  return parseInt(d.replace(/-/g, ""), 10);
}

const yearSteps = [
  {
    key: "yEraChoice",
    type: "ychoice",
    title: "건축허가일이 소방법 분법 이전인가요, 이후인가요?",
    help: "소방법은 2004년 5월 30일 소방기본법·소방시설 설치유지 및 안전관리에 관한 법률·소방시설공사업법·위험물안전관리법으로 분법됐습니다. 분법 전후로 소방시설 기준이 크게 달라지므로 먼저 구분합니다.",
    options: [
      { value: "before2004", label: "소방법 분법 이전 (소방법 시행령)", description: "1981. 11. 6. ~ 2004년 5월 29일" },
      { value: "after2004", label: "소방법 분법 이후 (소방시설 설치유지 및 안전관리에 관한 법률 시행령)", description: "2004년 5월 30일 ~ 현재" },
    ],
  },
  {
    key: "yOccupancyType",
    type: "ychoice",
    title: "어떤 용도를 탐색할까요?",
    help: "용도를 선택하면 해당 소방시설 기준을 건축허가일 기준으로 안내합니다.",
    options: [
      { value: "neighborhood", label: "근린생활시설", description: "일반 상가·식당·사무실·의원 등" },
      { value: "lodging", label: "숙박시설", description: "호텔·모텔·여관·펜션 등" },
      { value: "elderly", label: "노유자시설", description: "요양원·복지관·어린이집·아동센터 등" },
      { value: "medical", label: "의료시설", description: "종합병원·병원·요양병원·정신의료기관 등" },
      { value: "religious", label: "종교시설", description: "교회·성당·사찰·사당·기도원 등" },
      { value: "sales", label: "판매시설", description: "백화점·대형마트·쇼핑센터·상점·전통시장 등" },
      { value: "apartment", label: "공동주택", description: "아파트·연립주택·다세대주택·기숙사" },
    ],
  },
  {
    key: "yApartmentSubtype",
    type: "ychoice",
    title: "공동주택 세부 분류는 무엇인가요?",
    help: "세부 분류에 따라 간이스프링클러·자동화재탐지설비·단독경보형감지기 등의 설치 기준이 크게 달라집니다.",
    options: [
      { value: "apt", label: "아파트등", description: "주택으로 쓰는 층수가 5층 이상인 주택" },
      { value: "row", label: "연립주택·다세대주택", description: "주택으로 쓰는 층수가 4층 이하인 주택" },
      { value: "dorm", label: "기숙사", description: "학교·공장 등의 학생·종업원 공동거주 시설" },
    ],
    condition: (ya) => ya.yEraChoice === "after2004" && ya.yOccupancyType === "apartment",
  },
  {
    key: "yAptBuildingCount",
    type: "ynumber",
    title: "단지의 동(棟) 수는 몇 개인가요?",
    help: "앞서 입력한 연면적은 '단지 전체 공동주택 연면적 합계'로 보고, 동 수로 나눠 동당 평균 연면적으로 환산해 판정합니다. 동 1개면 1을 입력하세요.",
    placeholder: "예: 3",
    min: 1,
    step: 1,
    condition: (ya) => ya.yOccupancyType === "apartment",
  },
  {
    key: "yAptHouseholdCount",
    type: "ynumber",
    title: "공동주택 세대수는 몇 세대인가요?",
    help: "공기안전매트 설치 여부 판단에 사용됩니다. 300세대 이상, 또는 150세대 이상이면서 승강기가 설치된 아파트등이면 설치 대상으로 봅니다.",
    placeholder: "예: 300",
    min: 0,
    step: 1,
    condition: (ya) => ya.yEraChoice === "after2004" && ya.yOccupancyType === "apartment",
  },
  {
    key: "yAptHasFloor600",
    type: "ychoice",
    title: "4층 이상인 층 중 바닥면적 600㎡ 이상인 층이 있나요?",
    help: "옥내소화전설비 설치 여부 판단에 사용됩니다. (지하·무창층은 앞서 입력한 면적으로 자동 판단)",
    options: [
      { value: "yes", label: "예", description: "해당 층이 있음" },
      { value: "no", label: "아니오", description: "해당 층이 없음" },
    ],
    condition: (ya, pd) => ya.yOccupancyType === "apartment" && (parseInt(ya.yAboveGroundFloors) || 0) >= 4 && (parseFloat(ya.yTotalArea) || 0) < 3000 && !yearIsAutoAreaMode(),
  },
  {
    key: "yAptHasFloor1000",
    type: "ychoice",
    title: "4층 이상인 층 중 바닥면적 1,000㎡ 이상인 층이 있나요?",
    help: "스프링클러설비 설치 여부 판단에 사용됩니다. (지하·무창층은 앞서 입력한 면적으로 자동 판단)",
    options: [
      { value: "yes", label: "예", description: "해당 층이 있음" },
      { value: "no", label: "아니오", description: "해당 층이 없음" },
    ],
    condition: (ya, pd) => ya.yOccupancyType === "apartment" && (parseInt(ya.yAboveGroundFloors) || 0) >= 4 && (parseInt(ya.yAboveGroundFloors) || 0) < (pd >= YD.D20170726 ? 6 : 11) && !yearIsAutoAreaMode(),
  },
  {
    key: "yAptFirstSecondFloorArea",
    type: "ynumber",
    title: "지상 1·2층 바닥면적 합계(㎡)",
    help: "옥외소화전설비(1·2층 합계 9,000㎡ 이상) 판단에 사용됩니다.",
    placeholder: "예: 9000",
    min: 0,
    step: 0.1,
    condition: (ya, pd) => ya.yOccupancyType === "apartment" && (parseFloat(ya.yTotalArea) || 0) >= 9000 && !(ya.yApartmentSubtype === "apt" && pd >= YD.D20111028) && !yearIsAutoAreaMode(),
  },
  {
    key: "yAptParkingElecSet",
    type: "ycompound",
    title: "기계식 주차장·전기실 정보를 입력하세요",
    help: "물분무등소화설비 판단에 사용됩니다. 해당 없으면 0을 입력하세요.",
    condition: (ya) => ya.yEraChoice === "after2004" && ya.yOccupancyType === "apartment",
  },
  {
    key: "yAptUndergroundParkingArea",
    type: "ynumber",
    title: "지하 차고·주차장 바닥면적 합계(㎡)",
    help: "2025.12.1부터 신설된 소규모 지하주차장(200㎡ 미만) 기준 판단에 사용됩니다. 없으면 0을 입력하세요.",
    placeholder: "예: 0",
    min: 0,
    step: 0.1,
    condition: (ya, pd) => ya.yOccupancyType === "apartment" && pd >= YD.D20251201 && ya.yAptHasParkingBuilding !== "yes",
  },
  {
    key: "yAptHasSpecialStair",
    type: "ychoice",
    title: "특별피난계단·비상용승강기·피난용승강기의 승강장이 있나요?",
    help: "제연설비 설치 여부 판단에 사용됩니다.",
    options: [
      { value: "yes", label: "예", description: "해당 시설이 있음 (고층 공동주택 대부분 해당)" },
      { value: "no", label: "아니오", description: "해당 시설이 없음" },
    ],
    condition: (ya) => ya.yOccupancyType === "apartment" && !yearIsAutoAreaMode(),
  },
  {
    key: "yAptIsGatBokdo",
    type: "ychoice",
    title: "갓복도형 아파트인가요?",
    help: "편복도가 외기에 개방되어 연기 배출이 자연적으로 이뤄지는 구조면 제연설비가 면제됩니다.",
    options: [
      { value: "yes", label: "예 (갓복도형)", description: "제연설비 면제 대상" },
      { value: "no", label: "아니오", description: "일반 구조" },
    ],
    condition: (ya) => ya.yOccupancyType === "apartment" && ya.yApartmentSubtype === "apt" && ya.yAptHasSpecialStair === "yes",
  },
  {
    key: "yAptHouseholds",
    type: "ychoice",
    title: "50세대 미만 연립주택·다세대주택인가요?",
    help: "50세대 미만이면 차고·주차장(200㎡ 이상) 물분무등소화설비 기준에서 제외됩니다. (2022.12.1~)",
    options: [
      { value: "yes", label: "예 (50세대 미만)", description: "주차장 기준 제외" },
      { value: "no", label: "아니오 (50세대 이상)", description: "주차장 기준 적용" },
    ],
    condition: (ya, pd) => ya.yOccupancyType === "apartment" && ya.yApartmentSubtype === "row" && pd >= YD.D20221201 && ((ya.yAptHasParkingBuilding === "yes" ? parseFloat(ya.yAptParkingArea) : parseFloat(ya.yAptIndoorParkingArea)) || 0) >= 200,
  },
  {
    key: "yAptIsNationalHousing",
    type: "ychoice",
    title: "국민주택규모 이하이고 지하층을 대피시설로만 사용하나요?",
    help: "해당하면 연결살수설비 지하층 기준이 150㎡에서 700㎡로 완화됩니다.",
    options: [
      { value: "yes", label: "예", description: "연결살수 700㎡ 완화 특례 적용" },
      { value: "no", label: "아니오", description: "일반 기준(150㎡) 적용" },
    ],
    condition: (ya) => ya.yOccupancyType === "apartment" && ya.yApartmentSubtype === "apt" && (parseInt(ya.yBasementFloors) || 0) > 0 && !yearIsAutoAreaMode(),
  },
  {
    key: "yPermitDate",
    type: "ydate",
    title: "건축허가일자를 입력하세요",
    help: "건축허가일 기준으로 당시 시행 중이던 소방시설 설치 기준을 적용합니다.",
  },
  {
    key: "yTotalArea",
    type: "ynumber",
    title: "건축물 연면적(㎡)",
    help: "지하층을 포함한 건물 전체 바닥면적 합계입니다.",
    placeholder: "예: 1500",
    min: 0,
    step: 0.1,
  },
  {
    key: "yAboveGroundFloors",
    type: "ynumber",
    title: "지상 층수는 몇 층입니까?",
    help: "지하층을 제외한 지상 층수를 입력하세요.",
    placeholder: "예: 5",
    min: 1,
    step: 1,
  },
  {
    key: "yBasementSet",
    type: "ycompound",
    title: "지하층 정보를 입력하세요",
    help: "지하층이 없으면 0을 입력하세요.",
  },
  {
    key: "yWindowlessSet",
    type: "ycompound",
    title: "무창층 정보를 입력하세요",
    help: "무창층이란 채광·환기 조건 등을 충족하지 못하는 층입니다.",
  },
  {
    key: "yHasLargeTargetFloor",
    type: "ychoice",
    title: "지하층·무창층·4층 이상 층 중 바닥면적 300㎡ 이상인 층이 있습니까?",
    help: "옥내소화전설비 설치 여부를 판단하는 조건입니다.",
    options: [
      { value: "yes", label: "예", description: "해당 층이 있음" },
      { value: "no", label: "아니오", description: "해당 층이 없음" },
    ],
    condition: (ya) => ya.yOccupancyType === "neighborhood" && (parseFloat(ya.yTotalArea) || 0) < 1500 && !yearIsAutoAreaMode(),
  },
  {
    key: "yHasLargeFloorFor1000",
    type: "ychoice",
    title: "지하층·무창층·4층 이상 층 중 바닥면적 1,000㎡ 이상인 층이 있습니까?",
    help: "허가일 당시(2018년 1월 이전) 스프링클러설비 설치 여부를 판단합니다.",
    options: [
      { value: "yes", label: "예", description: "해당 층이 있음" },
      { value: "no", label: "아니오", description: "해당 층이 없음" },
    ],
    condition: (ya, pd) => ya.yOccupancyType === "neighborhood" && pd >= YD.D20040530 && pd < YD.D20180128 && !yearIsAutoAreaMode(),
  },
  {
    key: "yNeighborhoodArea",
    type: "ynumber",
    title: "근린생활시설로 사용하는 부분의 바닥면적 합계(㎡)",
    help: "건물 내 근린생활시설 용도로 쓰이는 모든 층 면적을 합산하세요. 건물 전체가 근린생활시설이면 연면적과 같습니다.",
    placeholder: "예: 1200",
    min: 0,
    step: 0.1,
    condition: (ya, pd) => ya.yOccupancyType === "neighborhood" && pd >= YD.D20061207,
  },
  {
    key: "yFacilitySubtype",
    type: "ychoice",
    title: "해당 근린생활시설이 일반목욕장(욕탕)입니까?",
    help: "일반목욕장은 자동화재탐지설비 기준 면적이 다릅니다(600㎡ → 1,000㎡).",
    options: [
      { value: "bathhouse", label: "일반목욕장(욕탕)", description: "목욕장으로 쓰이는 경우" },
      { value: "general", label: "일반 근린생활시설", description: "상가, 식당, 사무실, 의원 등" },
    ],
    condition: (ya) => ya.yOccupancyType === "neighborhood",
  },
  {
    key: "yIsPostpartum",
    type: "ychoice",
    title: "해당 근린생활시설이 조산원 또는 산후조리원입니까?",
    help: "2022년 2월 25일 이후부터 조산원·산후조리원에 별도 설치 기준이 신설됩니다.",
    options: [
      { value: "yes", label: "예", description: "조산원 또는 산후조리원에 해당함" },
      { value: "no", label: "아니오", description: "해당 없음" },
    ],
    condition: (ya, pd) => ya.yOccupancyType === "neighborhood" && pd >= YD.D20220225,
  },
  {
    key: "yPostpartumAreaRange",
    type: "ychoice",
    title: "조산원·산후조리원의 바닥면적 합계는 얼마입니까?",
    help: "600㎡를 기준으로 스프링클러 또는 간이스프링클러 대상이 달라집니다.",
    options: [
      { value: "under600", label: "600㎡ 미만", description: "소규모 산후조리원" },
      { value: "over600", label: "600㎡ 이상", description: "대형 산후조리원" },
    ],
    condition: (ya, pd) => ya.yOccupancyType === "neighborhood" && pd >= YD.D20220225 && ya.yIsPostpartum === "yes",
  },
  {
    key: "yIsClinicWithInpatient",
    type: "ychoice",
    title: "입원실이 있는 의원·치과의원·한의원입니까?",
    help: "2018년 6월 27일 이후부터 입원실 있는 의원급은 면적 불문 간이스프링클러 설치 대상입니다.",
    options: [
      { value: "yes", label: "예", description: "입원실이 있는 의원급" },
      { value: "no", label: "아니오", description: "해당 없음" },
    ],
    condition: (ya, pd) => ya.yOccupancyType === "neighborhood" && pd >= YD.D20180627 && ya.yIsPostpartum !== "yes",
  },
  {
    key: "yHasHemodialysis",
    type: "ychoice",
    title: "인공신장실(혈액투석실)이 있는 의원·치과의원·한의원입니까?",
    help: "2024년 12월 31일 이후부터 인공신장실 있는 의원급도 면적 불문 간이스프링클러 대상입니다.",
    options: [
      { value: "yes", label: "예", description: "인공신장실이 있는 의원급" },
      { value: "no", label: "아니오", description: "해당 없음" },
    ],
    condition: (ya, pd) => ya.yOccupancyType === "neighborhood" && pd >= YD.D20241231 && ya.yIsClinicWithInpatient === "no" && ya.yIsPostpartum !== "yes",
  },
  {
    key: "yHas24HourStaff",
    type: "ychoice",
    title: "24시간 상주 근무자가 있습니까?",
    help: "24시간 상주 시 자동화재속보설비 면제 여부를 검토합니다.",
    options: [
      { value: "yes", label: "예", description: "24시간 상주함" },
      { value: "no", label: "아니오", description: "상주하지 않음" },
    ],
    condition: (ya, pd, autoDispatch) => ya.yOccupancyType === "neighborhood" && autoDispatch,
  },
  // ── 세부 질문 (뒤쪽) ──
  {
    key: "yFirstSecondFloorArea",
    type: "ynumber",
    title: "지상 1층·2층 바닥면적 합계(㎡)",
    help: "옥외소화전 설치 여부를 판단합니다. 해당 없으면 0을 입력하세요.",
    placeholder: "예: 0",
    min: 0,
    step: 0.1,
    condition: (ya) => ya.yOccupancyType === "neighborhood" && (parseFloat(ya.yTotalArea) || 0) >= 9000 && !yearIsAutoAreaMode(),
  },
  {
    key: "yParkingElecSet",
    type: "ycompound",
    title: "주차장·전기실 정보를 입력하세요",
    help: "물분무등소화설비 판단에 사용됩니다. 해당 없으면 0을 입력하세요.",
    condition: (ya) => ya.yOccupancyType === "neighborhood",
  },
  {
    key: "ySmokeControlArea",
    type: "ynumber",
    title: "지하층·무창층 내 근린생활시설 사용 바닥면적 합계(㎡)",
    help: "제연설비 설치 여부를 판단합니다. 해당 없으면 0을 입력하세요.",
    placeholder: "예: 0",
    min: 0,
    step: 0.1,
    condition: (ya) => ya.yOccupancyType === "neighborhood" && !yearIsAutoAreaMode(),
  },
  {
    key: "yHasSmallUndergroundParking",
    type: "ychoice",
    title: "지하 차고·주차장 바닥면적 합계가 200㎡ 미만입니까?",
    help: "2024년 5월 17일 이후부터 소규모 지하주차장도 연결살수설비 설치 대상입니다.",
    options: [
      { value: "yes", label: "예", description: "200㎡ 미만 지하주차장 있음" },
      { value: "no", label: "아니오", description: "해당 없음" },
    ],
    condition: (ya, pd) => ya.yOccupancyType === "neighborhood" && pd >= YD.D20240517,
  },
  {
    key: "yHasMultiuseBusiness",
    type: "ychoice",
    title: "다중이용업소가 있나요?",
    help: "다중이용업소가 있으면 설치해야 하는 소방시설을 별도로 표시합니다.",
    options: [
      { value: "yes", label: "예", description: "다중이용업소 추가 설치시설까지 확인" },
      { value: "no", label: "아니오", description: "기존 근린생활시설 결과만 표시" },
    ],
    condition: (ya) => ya.yOccupancyType === "neighborhood",
  },
  {
    key: "yMultiuseSimpleSprinklerCheck",
    type: "ycompound",
    title: "간이스프링클러설비 설치 대상인지 확인합니다.",
    help: "해당되는 항목은 중복 선택할 수 있습니다. 하나라도 해당하면 간이스프링클러설비 설치대상입니다.",
    condition: (ya) => ya.yOccupancyType === "neighborhood" && ya.yHasMultiuseBusiness === "yes",
  },
  {
    key: "yMultiuseOnSecondToTenthFloor",
    type: "ychoice",
    title: "다중이용업소가 2층~10층 사이에 설치돼있나요?",
    help: "맞다면 피난기구를 설치해야 합니다.",
    options: [
      { value: "yes", label: "예", description: "2층부터 10층 사이에 설치돼 있음" },
      { value: "no", label: "아니오", description: "해당 층 범위가 아님" },
    ],
    condition: (ya) => ya.yOccupancyType === "neighborhood" && ya.yHasMultiuseBusiness === "yes",
  },
  {
    key: "yMultiuseOnGroundOrRefugeFloor",
    type: "ychoice",
    title: "지상 1층이나 피난층에 설치돼있나요?",
    help: "산후조리업이나 고시원에 해당할 때만 확인하며, 맞다면 간이스프링클러설비 대상에서 제외합니다.",
    options: [
      { value: "yes", label: "예", description: "지상 1층 또는 피난층에 설치돼 있음" },
      { value: "no", label: "아니오", description: "지상 1층 또는 피난층이 아님" },
    ],
    condition: (ya) => ya.yOccupancyType === "neighborhood" && ya.yHasMultiuseBusiness === "yes" && (ya.yMultiuseIsPostpartum === "yes" || ya.yMultiuseIsGosiwon === "yes"),
  },
  {
    key: "yMultiuseUsesAV",
    type: "ychoice",
    title: "'노래반주기 등 영상음향장치를 사용하는 영업장'인가요?",
    help: "맞다면 자동화재탐지설비와 영상음향차단장치를 설치해야 합니다.",
    options: [
      { value: "yes", label: "예", description: "영상음향장치를 사용함" },
      { value: "no", label: "아니오", description: "영상음향장치를 사용하지 않음" },
    ],
    condition: (ya) => ya.yOccupancyType === "neighborhood" && ya.yHasMultiuseBusiness === "yes",
  },
  {
    key: "yMultiuseHasGasFacility",
    type: "ychoice",
    title: "가스시설을 사용하는 주방이나 난방시설이 있나요?",
    help: "맞다면 가스누설경보기를 설치해야 합니다.",
    options: [
      { value: "yes", label: "예", description: "가스시설을 사용함" },
      { value: "no", label: "아니오", description: "가스시설을 사용하지 않음" },
    ],
    condition: (ya) => ya.yOccupancyType === "neighborhood" && ya.yHasMultiuseBusiness === "yes",
  },
  {
    key: "yMultiuseHasRooms",
    type: "ychoice",
    title: "영업장 내부에 구획된 실(室)이 있나요?",
    help: "노래방 룸, 고시원 방 등 별도로 구획된 공간이 있는 경우입니다. 해당하면 영업장 내부 피난통로를 확보해야 합니다.",
    options: [
      { value: "yes", label: "예", description: "구획된 룸·방 등이 있음" },
      { value: "no", label: "아니오", description: "구획된 실이 없음" },
    ],
    condition: (ya) => ya.yOccupancyType === "neighborhood" && ya.yHasMultiuseBusiness === "yes",
  },
  {
    key: "yMultiuseHasEvacuationRoute",
    type: "ychoice",
    title: "영업장 내부 피난통로 또는 복도가 있는 영업장인가요?",
    help: "맞다면 피난유도선을 설치해야 합니다.",
    options: [
      { value: "yes", label: "예", description: "피난통로 또는 복도가 있음" },
      { value: "no", label: "아니오", description: "해당 통로가 없음" },
    ],
    condition: (ya) => ya.yOccupancyType === "neighborhood" && ya.yHasMultiuseBusiness === "yes",
  },

  // ── 숙박시설 전용 스텝 ──
  {
    key: "yLodgingArea",
    type: "ynumber",
    title: "숙박시설로 사용하는 바닥면적 합계(㎡)",
    help: "간이스프링클러·스프링클러 판단에 사용됩니다. 건물 전체를 숙박시설로 사용하면 연면적과 같게 입력하세요.",
    placeholder: "예: 450",
    min: 0,
    step: 0.1,
    condition: (ya) => ya.yOccupancyType === "lodging",
  },
  {
    key: "yLodgingIsLiving",
    type: "ychoice",
    title: "생활형 숙박시설(레지던스 등)입니까?",
    help: "2013년 2월 10일부터 2022년 11월 30일까지는 생활형 숙박시설로서 바닥면적 합계가 600㎡ 이상인 경우에만 간이스프링클러설비 설치 대상입니다.",
    options: [
      { value: "yes", label: "생활형 숙박시설", description: "레지던스·생활숙박시설 등 숙박 목적의 주거형 시설" },
      { value: "no", label: "일반 숙박시설", description: "호텔·모텔·여관·펜션 등" },
    ],
    condition: (ya, pd) => ya.yOccupancyType === "lodging" && pd >= YD.D20130210 && pd < YD.D20221201,
  },
  {
    key: "yLodgingHasLargeFloorFor1000",
    type: "ychoice",
    title: "지하층·무창층·4층 이상 층 중 바닥면적 1,000㎡ 이상인 층이 있습니까?",
    help: "2004~2017년 기간에는 이 조건이 스프링클러 설치 여부를 결정합니다.",
    options: [
      { value: "yes", label: "예", description: "해당 조건의 층이 하나라도 있음" },
      { value: "no", label: "아니오", description: "조건에 맞는 층이 없음" },
    ],
    condition: (ya, pd) => ya.yOccupancyType === "lodging" && pd >= YD.D20040530 && pd < YD.D20170128 && !yearIsAutoAreaMode(),
  },
  {
    key: "yLodgingHasGasFacility",
    type: "ychoice",
    title: "가스시설이 설치돼 있습니까?",
    help: "가스누설경보기 설치 여부를 판단합니다.",
    options: [
      { value: "yes", label: "예", description: "가스시설이 설치돼 있음" },
      { value: "no", label: "아니오", description: "가스시설이 없음" },
    ],
    condition: (ya) => ya.yOccupancyType === "lodging",
  },
  {
    key: "yLodgingIsTouristHotel",
    type: "ychoice",
    title: "관광호텔입니까?",
    help: "지하층을 포함한 층수가 7층 이상인 관광호텔이면 인명구조기구(방열복·공기호흡기 등)를 설치해야 합니다.",
    options: [
      { value: "no", label: "일반 숙박시설", description: "모텔·여관·펜션 등 관광호텔이 아닌 숙박시설" },
      { value: "yes", label: "관광호텔", description: "관광진흥법에 따른 관광호텔업 등록 시설" },
    ],
    condition: (ya) => ya.yOccupancyType === "lodging",
  },
  // 숙박시설 세부 조건 (뒤쪽)
  {
    key: "yLodgingFirstSecondFloorArea",
    type: "ynumber",
    title: "지상 1층·2층 바닥면적 합계(㎡)",
    help: "옥외소화전 설치 여부를 판단합니다. 해당 없으면 0을 입력하세요.",
    placeholder: "예: 0",
    min: 0,
    step: 0.1,
    condition: (ya) => ya.yOccupancyType === "lodging" && (parseFloat(ya.yTotalArea) || 0) >= 9000 && !yearIsAutoAreaMode(),
  },
  {
    key: "yLodgingParkingElecSet",
    type: "ycompound",
    title: "주차장·전기실 정보를 입력하세요",
    help: "물분무등소화설비 판단에 사용됩니다. 해당 없으면 0을 입력하세요.",
    condition: (ya) => ya.yOccupancyType === "lodging",
  },
  {
    key: "yLodgingBasementAreaForSmoke",
    type: "ynumber",
    title: "지하층·무창층 내 숙박시설 사용 바닥면적 합계(㎡)",
    help: "제연설비 설치 여부를 판단합니다. 해당 없으면 0을 입력하세요.",
    placeholder: "예: 0",
    min: 0,
    step: 0.1,
    condition: (ya) => ya.yOccupancyType === "lodging" && !yearIsAutoAreaMode(),
  },
  {
    key: "yLodgingHasMultiuseBusiness",
    type: "ychoice",
    title: "다중이용업소가 있나요?",
    help: "다중이용업소가 있으면 설치해야 하는 안전시설을 별도로 표시합니다.",
    options: [
      { value: "yes", label: "예", description: "다중이용업소 추가 설치시설까지 확인" },
      { value: "no", label: "아니오", description: "기존 숙박시설 결과만 표시" },
    ],
    condition: (ya) => ya.yOccupancyType === "lodging",
  },
  {
    key: "yLodgingMultiuseSimpleSprinklerCheck",
    type: "ycompound",
    title: "간이스프링클러설비 설치 대상인지 확인합니다.",
    help: "해당되는 항목은 중복 선택할 수 있습니다.",
    condition: (ya) => ya.yOccupancyType === "lodging" && ya.yLodgingHasMultiuseBusiness === "yes",
  },
  {
    key: "yLodgingMultiuseOnSecondToTenthFloor",
    type: "ychoice",
    title: "다중이용업소가 2층~10층 사이에 설치돼있나요?",
    help: "맞다면 피난기구를 설치해야 합니다.",
    options: [
      { value: "yes", label: "예", description: "2층부터 10층 사이에 설치돼 있음" },
      { value: "no", label: "아니오", description: "해당 층 범위가 아님" },
    ],
    condition: (ya) => ya.yOccupancyType === "lodging" && ya.yLodgingHasMultiuseBusiness === "yes",
  },
  {
    key: "yLodgingMultiuseOnGroundOrRefugeFloor",
    type: "ychoice",
    title: "지상 1층이나 피난층에 설치돼있나요?",
    help: "산후조리업이나 고시원에 해당할 때만 확인합니다.",
    options: [
      { value: "yes", label: "예", description: "지상 1층 또는 피난층에 설치돼 있음" },
      { value: "no", label: "아니오", description: "지상 1층 또는 피난층이 아님" },
    ],
    condition: (ya) => ya.yOccupancyType === "lodging" && ya.yLodgingHasMultiuseBusiness === "yes" && (ya.yLodgingMultiuseIsPostpartum === "yes" || ya.yLodgingMultiuseIsGosiwon === "yes"),
  },
  {
    key: "yLodgingMultiuseUsesAV",
    type: "ychoice",
    title: "'노래반주기 등 영상음향장치를 사용하는 영업장'인가요?",
    help: "맞다면 자동화재탐지설비와 영상음향차단장치를 설치해야 합니다.",
    options: [
      { value: "yes", label: "예", description: "영상음향장치를 사용함" },
      { value: "no", label: "아니오", description: "영상음향장치를 사용하지 않음" },
    ],
    condition: (ya) => ya.yOccupancyType === "lodging" && ya.yLodgingHasMultiuseBusiness === "yes",
  },
  {
    key: "yLodgingMultiuseHasGasFacility",
    type: "ychoice",
    title: "다중이용업소에 가스시설을 사용하는 주방이나 난방시설이 있나요?",
    help: "맞다면 가스누설경보기를 설치해야 합니다.",
    options: [
      { value: "yes", label: "예", description: "가스시설을 사용함" },
      { value: "no", label: "아니오", description: "가스시설을 사용하지 않음" },
    ],
    condition: (ya) => ya.yOccupancyType === "lodging" && ya.yLodgingHasMultiuseBusiness === "yes",
  },
  {
    key: "yLodgingMultiuseHasRooms",
    type: "ychoice",
    title: "영업장 내부에 구획된 실(室)이 있나요?",
    help: "노래방 룸, 고시원 방 등 별도로 구획된 공간이 있는 경우입니다. 해당하면 영업장 내부 피난통로를 확보해야 합니다.",
    options: [
      { value: "yes", label: "예", description: "구획된 룸·방 등이 있음" },
      { value: "no", label: "아니오", description: "구획된 실이 없음" },
    ],
    condition: (ya) => ya.yOccupancyType === "lodging" && ya.yLodgingHasMultiuseBusiness === "yes",
  },
  {
    key: "yLodgingMultiuseHasEvacuationRoute",
    type: "ychoice",
    title: "영업장 내부 피난통로 또는 복도가 있는 영업장인가요?",
    help: "맞다면 피난유도선을 설치해야 합니다.",
    options: [
      { value: "yes", label: "예", description: "피난통로 또는 복도가 있음" },
      { value: "no", label: "아니오", description: "해당 통로가 없음" },
    ],
    condition: (ya) => ya.yOccupancyType === "lodging" && ya.yLodgingHasMultiuseBusiness === "yes",
  },

  // ── 분법 이전 숙박시설 전용 스텝 ──
  {
    key: "yBefore2004LodgingIsTouristHotel",
    type: "ychoice",
    title: "관광호텔입니까?",
    help: "인명구조기구(방열복·공기호흡기 등) 설치 여부를 판단합니다. 1981~1994년에는 지상 7층 이상+수용인원 200인 이상, 1994년 이후에는 층수 7층 이상이면 관광호텔에 설치 의무가 있습니다.",
    options: [
      { value: "no", label: "일반 숙박시설", description: "모텔·여관·여인숙 등 관광호텔이 아닌 숙박시설" },
      { value: "yes", label: "관광호텔", description: "관광진흥법에 따른 관광호텔업 등록 시설" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "lodging",
  },
  {
    key: "yBefore2004LodgingHasLargeFloor450",
    type: "ychoice",
    title: "지하층·무창층·4층 이상 층 중 바닥면적 450㎡ 이상인 층이 있습니까?",
    help: "1992년 7월 28일 이전 옥내소화전설비 설치 조건입니다. (1984년 이전에는 해당 층, 이후에는 전 층 설치)",
    options: [
      { value: "yes", label: "있음", description: "해당 조건의 층이 하나라도 있음" },
      { value: "no", label: "없음", description: "조건에 맞는 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "lodging",
  },
  {
    key: "yBefore2004LodgingSprinklerFloor",
    type: "ychoice",
    title: "4층 이상 10층 이하의 층 중 해당 면적 이상인 층이 있습니까?",
    help: "1981~1984년에는 1,500㎡ 이상, 1984~1992년에는 1,000㎡ 이상인 층이 있으면 해당 층에 스프링클러설비를 설치합니다. (11층 이상이면 자동으로 전 층 설치)",
    options: [
      { value: "yes", label: "있음", description: "해당 면적 이상인 층이 하나라도 있음" },
      { value: "no", label: "없음", description: "조건에 맞는 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "lodging",
  },
  {
    key: "yBefore2004LodgingAutoDetFloor300",
    type: "ychoice",
    title: "지하층·무창층·3층 이상 층 중 바닥면적 300㎡ 이상인 층이 있습니까?",
    help: "1992년 이전 자동화재탐지설비 설치 조건입니다. (1984년 이전에는 해당 층만, 이후에는 전 층 설치)",
    options: [
      { value: "yes", label: "있음", description: "해당 층이 하나라도 있음" },
      { value: "no", label: "없음", description: "조건에 맞는 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "lodging",
  },
  {
    key: "yBefore2004LodgingHasLargeFloor300",
    type: "ychoice",
    title: "지하층·무창층·4층 이상 층 중 바닥면적 300㎡ 이상인 층이 있습니까?",
    help: "1992년 7월 28일 이후 옥내소화전설비 설치 조건입니다.",
    options: [
      { value: "yes", label: "있음", description: "해당 층이 하나라도 있음" },
      { value: "no", label: "없음", description: "조건에 맞는 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "lodging",
  },
  {
    key: "yBefore2004LodgingHasLargeFloor1000",
    type: "ychoice",
    title: "지하층·무창층·4층 이상 층 중 바닥면적 1,000㎡ 이상인 층이 있습니까?",
    help: "1992년 이후 스프링클러설비(해당 층) 설치 조건입니다. (11층 이상이면 전 층 설치)",
    options: [
      { value: "yes", label: "있음", description: "해당 조건의 층이 하나라도 있음" },
      { value: "no", label: "없음", description: "조건에 맞는 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "lodging",
  },
  {
    key: "yBefore2004LodgingHasFloor1500",
    type: "ychoice",
    title: "건물 내 바닥면적이 1,500㎡ 이상인 층이 있습니까?",
    help: "1992년 이후 자동화재속보설비 설치 조건입니다. (1992년 이전에는 연면적으로 판단)",
    options: [
      { value: "yes", label: "있음", description: "1,500㎡ 이상인 층이 하나라도 있음" },
      { value: "no", label: "없음", description: "모든 층이 1,500㎡ 미만" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "lodging",
  },
  {
    key: "yBefore2004LodgingParkingElecSet",
    type: "ycompound",
    title: "주차장·전기실 정보를 입력하세요",
    help: "물분무등소화설비 판단에 사용됩니다. 해당 없으면 0을 입력하세요.",
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "lodging",
  },

  // ── 노유자시설 전용 스텝 ──
  {
    key: "yElderlySubtype",
    type: "ychoice",
    title: "어떤 노유자시설입니까?",
    help: "생활시설 여부에 따라 간이스프링클러·자동화재탐지설비·자동화재속보설비 기준이 달라집니다.",
    options: [
      { value: "general", label: "일반 노유자시설", description: "숙식을 제공하지 않는 시설 — 노인복지관·아동센터·주간보호센터 등" },
      { value: "living", label: "노유자 생활시설", description: "숙식을 함께 제공하는 시설 — 양로원·노인요양원·아동복지시설 등" },
    ],
    condition: (ya, pd) => ya.yOccupancyType === "elderly" && pd >= YD.D20120205,
  },
  {
    key: "yElderlyArea",
    type: "ynumber",
    title: "노유자시설로 사용하는 바닥면적 합계(㎡)",
    help: "2008년 2월 29일 이후 간이스프링클러·스프링클러 판단에 사용됩니다. 건물 전체를 노유자시설로 사용하면 연면적과 같게 입력하세요.",
    placeholder: "예: 400",
    min: 0,
    step: 0.1,
    condition: (ya, pd) => ya.yOccupancyType === "elderly" && pd >= YD.D20080229,
  },
  {
    key: "yElderlyHasLargeTargetFloor",
    type: "ychoice",
    title: "지하층·무창층·4층 이상 층 중 바닥면적 300㎡ 이상인 층이 있습니까?",
    help: "옥내소화전설비 설치 여부를 판단하는 조건입니다.",
    options: [
      { value: "yes", label: "예", description: "해당 층이 있음" },
      { value: "no", label: "아니오", description: "해당 층이 없음" },
    ],
    condition: (ya) => ya.yOccupancyType === "elderly" && (parseFloat(ya.yTotalArea) || 0) < 1500 && !yearIsAutoAreaMode(),
  },
  {
    key: "yElderlyHasGrillWindow",
    type: "ychoice",
    title: "화재 시 자동으로 열리지 않는 창살이 설치돼 있습니까?",
    help: "추락 방지 목적의 창살이 있으면 300㎡ 미만이어도 간이스프링클러 대상이 됩니다. (2008년 2월 29일 이후 적용)",
    options: [
      { value: "yes", label: "있음", description: "자동 개방 구조가 아닌 창살이 설치돼 있음" },
      { value: "no", label: "없음", description: "창살이 없거나 화재 시 자동으로 열리는 구조" },
    ],
    condition: (ya, pd) => ya.yOccupancyType === "elderly" && ya.yElderlySubtype === "general" && pd >= YD.D20080229,
  },
  {
    key: "yElderlyHasGasFacility",
    type: "ychoice",
    title: "가스시설이 설치돼 있습니까?",
    help: "가스누설경보기 설치 여부를 판단합니다.",
    options: [
      { value: "yes", label: "예", description: "가스시설이 설치돼 있음" },
      { value: "no", label: "아니오", description: "가스시설이 없음" },
    ],
    condition: (ya) => ya.yOccupancyType === "elderly",
  },
  // 노유자시설 세부 조건 (뒤쪽)
  {
    key: "yElderlyHasFloor500Plus",
    type: "ychoice",
    title: "바닥면적이 500㎡ 이상인 층이 있습니까?",
    help: "일반 노유자시설의 자동화재속보설비 설치 여부를 판단합니다.",
    options: [
      { value: "yes", label: "있음", description: "500㎡ 이상인 층이 하나라도 있음" },
      { value: "no", label: "없음", description: "모든 층이 500㎡ 미만" },
    ],
    condition: (ya) => ya.yOccupancyType === "elderly" && ya.yElderlySubtype === "general" && !yearIsAutoAreaMode(),
  },
  {
    key: "yElderlyHas24HourStaff",
    type: "ychoice",
    title: "24시간 상주 근무자가 있습니까?",
    help: "방재실 등에 24시간 상주하면 자동화재속보설비를 설치하지 않을 수 있습니다.",
    options: [
      { value: "yes", label: "있음", description: "24시간 화재 감시 가능한 근무자가 상주함" },
      { value: "no", label: "없음", description: "24시간 상주 근무자가 없음" },
    ],
    condition: (ya, pd) => ya.yOccupancyType === "elderly" && (
      (ya.yElderlySubtype === "general" && pd >= YD.D20140708) ||
      (ya.yElderlySubtype === "living" && pd >= YD.D20221201)
    ),
  },
  {
    key: "yElderlyFirstSecondFloorArea",
    type: "ynumber",
    title: "지상 1층·2층 바닥면적 합계(㎡)",
    help: "옥외소화전 설치 여부를 판단합니다. 해당 없으면 0을 입력하세요.",
    placeholder: "예: 0",
    min: 0,
    step: 0.1,
    condition: (ya) => ya.yOccupancyType === "elderly" && (parseFloat(ya.yTotalArea) || 0) >= 9000 && !yearIsAutoAreaMode(),
  },
  {
    key: "yElderlyParkingElecSet",
    type: "ycompound",
    title: "주차장·전기실 정보를 입력하세요",
    help: "물분무등소화설비 판단에 사용됩니다. 해당 없으면 0을 입력하세요.",
    condition: (ya) => ya.yOccupancyType === "elderly",
  },
  {
    key: "yElderlyBasementAreaForSmoke",
    type: "ynumber",
    title: "지하층·무창층 내 노유자시설 사용 바닥면적 합계(㎡)",
    help: "제연설비 설치 여부를 판단합니다. (2015년 1월 8일 이후 적용) 해당 없으면 0을 입력하세요.",
    placeholder: "예: 0",
    min: 0,
    step: 0.1,
    condition: (ya, pd) => ya.yOccupancyType === "elderly" && pd >= YD.D20150108 && !yearIsAutoAreaMode(),
  },
  {
    key: "yElderlyHasSmallUndergroundParking",
    type: "ychoice",
    title: "지하 차고·주차장 바닥면적 합계가 200㎡ 미만입니까?",
    help: "2025년 12월 1일 이후부터 소규모 지하주차장도 비상경보설비 설치 대상입니다.",
    options: [
      { value: "yes", label: "예", description: "200㎡ 미만 지하주차장 있음" },
      { value: "no", label: "아니오", description: "해당 없음" },
    ],
    condition: (ya, pd) => ya.yOccupancyType === "elderly" && pd >= YD.D20251201,
  },

  // ── 의료시설 전용 스텝 ──
  {
    key: "yMedicalSubtype",
    type: "ychoice",
    title: "어떤 의료시설입니까?",
    help: "세부 유형에 따라 스프링클러·간이스프링클러·자동화재탐지설비·자동화재속보설비 기준이 달라집니다.",
    options: [
      { value: "hospital", label: "병원·치과병원·한방병원", description: "병원, 치과병원, 한방병원" },
      { value: "generalHospital", label: "종합병원", description: "종합병원" },
      { value: "nursingHome", label: "요양병원", description: "요양병원(정신병원 제외)" },
      { value: "psychiatricHospital", label: "정신의료기관", description: "정신병원·정신건강의학과의원 등" },
      { value: "rehabilitationFacility", label: "의료재활시설", description: "장애인 의료재활시설" },
    ],
    condition: (ya) => ya.yOccupancyType === "medical",
  },
  {
    key: "yMedicalArea",
    type: "ynumber",
    title: "의료시설로 사용하는 바닥면적 합계(㎡)",
    help: "스프링클러·간이스프링클러·자동화재탐지설비 판단에 사용됩니다. 건물 전체를 의료시설로 사용하면 연면적과 같게 입력하세요.",
    placeholder: "예: 1500",
    min: 0,
    step: 0.1,
    condition: (ya) => ya.yOccupancyType === "medical",
  },
  {
    key: "yMedicalHasLargeTargetFloor",
    type: "ychoice",
    title: "지하층·무창층·4층 이상 층 중 바닥면적 300㎡ 이상인 층이 있습니까?",
    help: "옥내소화전설비 설치 여부를 판단하는 조건입니다.",
    options: [
      { value: "yes", label: "예", description: "해당 층이 있음" },
      { value: "no", label: "아니오", description: "해당 층이 없음" },
    ],
    condition: (ya) => ya.yOccupancyType === "medical" && (parseFloat(ya.yTotalArea) || 0) < 1500 && !yearIsAutoAreaMode(),
  },
  {
    key: "yMedicalHasGrillWindow",
    type: "ychoice",
    title: "사람의 탈출을 막기 위한 고정식 창살이 설치돼 있습니까?",
    help: "정신의료기관·의료재활시설에서 바닥면적 300㎡ 미만이어도 간이스프링클러설비 및 자동화재탐지설비 설치 여부를 판단합니다.",
    options: [
      { value: "yes", label: "있음", description: "탈출 방지 목적의 고정식 창살이 설치돼 있음" },
      { value: "no", label: "없음", description: "창살이 없음" },
    ],
    condition: (ya, pd) => ya.yOccupancyType === "medical" &&
      (ya.yMedicalSubtype === "psychiatricHospital" || ya.yMedicalSubtype === "rehabilitationFacility") &&
      pd >= YD.D20120215,
  },
  {
    key: "yMedicalHasGasFacility",
    type: "ychoice",
    title: "가스시설이 설치돼 있습니까?",
    help: "가스누설경보기 설치 여부를 판단합니다.",
    options: [
      { value: "yes", label: "예", description: "주방 등 가스시설이 설치돼 있음" },
      { value: "no", label: "아니오", description: "가스시설이 없음" },
    ],
    condition: (ya) => ya.yOccupancyType === "medical",
  },
  // 의료시설 특이 조건 (뒤쪽)
  {
    key: "yMedicalHasFloor500Plus",
    type: "ychoice",
    title: "바닥면적이 500㎡ 이상인 층이 있습니까?",
    help: "정신의료기관·의료재활시설의 자동화재속보설비 설치 여부를 판단합니다.",
    options: [
      { value: "yes", label: "있음", description: "500㎡ 이상인 층이 하나라도 있음" },
      { value: "no", label: "없음", description: "모든 층이 500㎡ 미만" },
    ],
    condition: (ya, pd) => ya.yOccupancyType === "medical" &&
      (ya.yMedicalSubtype === "psychiatricHospital" || ya.yMedicalSubtype === "rehabilitationFacility") &&
      pd >= YD.D20140708 && !yearIsAutoAreaMode(),
  },
  // 의료시설 세부 조건
  {
    key: "yMedicalFirstSecondFloorArea",
    type: "ynumber",
    title: "지상 1층·2층 바닥면적 합계(㎡)",
    help: "옥외소화전 설치 여부를 판단합니다. 해당 없으면 0을 입력하세요.",
    placeholder: "예: 0",
    min: 0,
    step: 0.1,
    condition: (ya) => ya.yOccupancyType === "medical" && (parseFloat(ya.yTotalArea) || 0) >= 9000 && !yearIsAutoAreaMode(),
  },
  {
    key: "yMedicalParkingElecSet",
    type: "ycompound",
    title: "주차장·전기실 정보를 입력하세요",
    help: "물분무등소화설비 판단에 사용됩니다. 해당 없으면 0을 입력하세요.",
    condition: (ya) => ya.yOccupancyType === "medical",
  },
  {
    key: "yMedicalBasementAreaForSmoke",
    type: "ynumber",
    title: "지하층·무창층 내 의료시설 사용 바닥면적 합계(㎡)",
    help: "제연설비 설치 여부를 판단합니다. (2015년 1월 8일 이후 적용) 해당 없으면 0을 입력하세요.",
    placeholder: "예: 0",
    min: 0,
    step: 0.1,
    condition: (ya, pd) => ya.yOccupancyType === "medical" && pd >= YD.D20150108 && !yearIsAutoAreaMode(),
  },

  // ── 종교시설 전용 스텝 ──
  {
    key: "yReligiousHasLargeTargetFloor",
    type: "ychoice",
    title: "지하층·무창층·4층 이상 층 중 바닥면적 600㎡ 이상인 층이 있습니까?",
    help: "옥내소화전설비 설치 여부를 판단하는 조건입니다. (종교시설 기준: 연면적 3,000㎡ 이상 또는 해당 층 600㎡ 이상)",
    options: [
      { value: "yes", label: "예", description: "해당 층이 있음" },
      { value: "no", label: "아니오", description: "해당 층이 없음" },
    ],
    condition: (ya) => ya.yOccupancyType === "religious" && (parseFloat(ya.yTotalArea) || 0) < 3000 && !yearIsAutoAreaMode(),
  },
  // 세부 조건 (뒤쪽)
  {
    key: "yReligiousFirstSecondFloorArea",
    type: "ynumber",
    title: "지상 1층·2층 바닥면적 합계(㎡)",
    help: "옥외소화전 설치 여부를 판단합니다. 해당 없으면 0을 입력하세요.",
    placeholder: "예: 0",
    min: 0,
    step: 0.1,
    condition: (ya) => ya.yOccupancyType === "religious" && (parseFloat(ya.yTotalArea) || 0) >= 9000 && !yearIsAutoAreaMode(),
  },
  {
    key: "yReligiousParkingElecSet",
    type: "ycompound",
    title: "주차장·전기실 정보를 입력하세요",
    help: "물분무등소화설비 판단에 사용됩니다. 해당 없으면 0을 입력하세요.",
    condition: (ya) => ya.yOccupancyType === "religious",
  },
  // 종교시설 특수 조건 (뒤쪽)
  {
    key: "yReligiousOccupancy100Plus",
    type: "ychoice",
    title: "수용인원이 100명 이상입니까?",
    help: "스프링클러설비 설치 여부를 판단합니다. 수용인원 산정은 소방관련법령에 따릅니다.",
    options: [
      { value: "yes", label: "예 (100명 이상)", description: "수용인원이 100명 이상인 경우" },
      { value: "no", label: "아니오 (100명 미만)", description: "수용인원이 100명 미만인 경우" },
    ],
    condition: (ya) => ya.yOccupancyType === "religious",
  },
  {
    key: "yReligiousIsWoodStructure",
    type: "ychoice",
    title: "주요구조부가 목조(나무)입니까?",
    help: "2017년 1월 28일 이후부터 주요구조부가 목조인 종교시설은 스프링클러설비 설치 대상에서 제외됩니다.",
    options: [
      { value: "yes", label: "예 (목조 건축물)", description: "기둥·보 등 주요구조부가 나무로 된 목조 건축물" },
      { value: "no", label: "아니오 (비목조)", description: "콘크리트·철골 등 목조가 아닌 건축물" },
    ],
    condition: (ya, pd) => ya.yOccupancyType === "religious" && ya.yReligiousOccupancy100Plus === "yes" && pd >= YD.D20170128,
  },
  {
    key: "yReligiousIsSacrificialBuilding",
    type: "ychoice",
    title: "사찰·제실·사당에 해당합니까?",
    help: "2004~2017년 1월 27일까지는 사찰·제실·사당은 규모에 관계없이 스프링클러설비 설치 대상에서 제외됩니다.",
    options: [
      { value: "yes", label: "예 (사찰·제실·사당)", description: "사찰, 제실, 사당에 해당하는 시설" },
      { value: "no", label: "아니오", description: "교회·성당·기도원 등 그 외 종교시설" },
    ],
    condition: (ya, pd) => ya.yOccupancyType === "religious" && ya.yReligiousOccupancy100Plus === "yes" && pd >= YD.D20040530 && pd < YD.D20170128,
  },
  {
    key: "yReligiousHasStage",
    type: "ychoice",
    title: "무대부가 있습니까?",
    help: "2011년 7월 7일 이후부터 무대부 바닥면적이 200㎡ 이상이면 해당 무대부에 제연설비를 설치해야 합니다.",
    options: [
      { value: "yes", label: "있음", description: "무대장치를 갖춘 무대부가 있음" },
      { value: "no", label: "없음", description: "무대부가 없음" },
    ],
    condition: (ya, pd) => ya.yOccupancyType === "religious" && pd >= YD.D20110707,
  },
  {
    key: "yReligiousStageArea",
    type: "ynumber",
    title: "무대부 바닥면적(㎡)",
    help: "200㎡ 이상이면 해당 무대부에 제연설비를 설치해야 합니다.",
    placeholder: "예: 250",
    min: 0,
    step: 0.1,
    condition: (ya, pd) => ya.yOccupancyType === "religious" && pd >= YD.D20110707 && ya.yReligiousHasStage === "yes",
  },
  {
    key: "yReligiousHasGasFacility",
    type: "ychoice",
    title: "가스시설이 설치돼 있습니까?",
    help: "2011년 7월 7일 이후부터 가스시설이 있는 종교시설은 가스누설경보기를 설치해야 합니다.",
    options: [
      { value: "yes", label: "예", description: "주방 등 가스시설이 설치돼 있음" },
      { value: "no", label: "아니오", description: "가스시설이 없음" },
    ],
    condition: (ya, pd) => ya.yOccupancyType === "religious" && pd >= YD.D20110707,
  },

  // ── 판매시설 전용 스텝 (분법 이후) ──
  {
    key: "ySalesArea",
    type: "ynumber",
    title: "판매시설로 사용하는 바닥면적 합계(㎡)",
    help: "스프링클러설비·연결살수설비 판단에 사용됩니다. 건물 전체를 판매시설로 사용하면 연면적과 같게 입력하세요.",
    placeholder: "예: 4000",
    min: 0,
    step: 0.1,
    condition: (ya, pd) => {
      if (ya.yOccupancyType !== "sales") return false;
      const salesArea = parseFloat(ya.ySalesArea) || 0;
      const aboveGroundFloors = parseInt(ya.yAboveGroundFloors, 10) || 0;
      const threshold = pd >= YD.D20140708 ? 5000 : (aboveGroundFloors <= 3 ? 6000 : 5000);
      return salesArea < threshold;
    },
  },
  {
    key: "ySalesIsTraditionalMarket",
    type: "ychoice",
    title: "전통시장에 해당합니까?",
    help: "전통시장은 면적과 무관하게 자동화재속보설비(2017.1.28~)·자동화재탐지설비(2019.8.6~)·화재알림설비(2022.12.1~) 설치 대상입니다.",
    options: [
      { value: "yes", label: "예 (전통시장)", description: "「전통시장 및 상점가 육성을 위한 특별법」상 전통시장" },
      { value: "no", label: "아니오", description: "전통시장이 아닌 일반 판매시설" },
    ],
    condition: (ya) => ya.yOccupancyType === "sales",
  },
  {
    key: "ySalesIsLargeStore",
    type: "ychoice",
    title: "대규모점포에 해당합니까?",
    help: "「유통산업발전법」상 대규모점포(백화점·대형마트·쇼핑센터 등)는 인명구조기구·휴대용비상조명등·상업용 주방자동소화장치 판단에 사용됩니다.",
    options: [
      { value: "yes", label: "예 (대규모점포)", description: "백화점·대형마트·쇼핑센터·전문점·할인점 등" },
      { value: "no", label: "아니오", description: "대규모점포가 아닌 일반 판매시설" },
    ],
    condition: (ya) => ya.yOccupancyType === "sales",
  },
  {
    key: "ySalesOccupancy500Plus",
    type: "ychoice",
    title: "수용인원이 500명 이상입니까?",
    help: "스프링클러설비 설치 여부를 판단합니다. 수용인원 산정은 소방관계법령에 따릅니다.",
    options: [
      { value: "yes", label: "예 (500명 이상)", description: "수용인원이 500명 이상인 경우" },
      { value: "no", label: "아니오 (500명 미만)", description: "수용인원이 500명 미만인 경우" },
    ],
    condition: (ya, pd) => {
      if (ya.yOccupancyType !== "sales") return false;
      const salesArea = parseFloat(ya.ySalesArea) || 0;
      const aboveGroundFloors = parseInt(ya.yAboveGroundFloors, 10) || 0;
      const threshold = pd >= YD.D20140708 ? 5000 : (aboveGroundFloors <= 3 ? 6000 : 5000);
      return salesArea < threshold;
    },
  },
  {
    key: "ySalesOccupancy100Plus",
    type: "ychoice",
    title: "수용인원이 100명 이상입니까?",
    help: "대규모점포의 인명구조기구(공기호흡기)·휴대용비상조명등 설치 여부 판단(과거 기준)에 사용됩니다.",
    options: [
      { value: "yes", label: "예 (100명 이상)", description: "수용인원이 100명 이상인 경우" },
      { value: "no", label: "아니오 (100명 미만)", description: "수용인원이 100명 미만인 경우" },
    ],
    condition: () => false,
  },
  {
    key: "ySalesHasRestaurantKitchen",
    type: "ychoice",
    title: "대규모점포에 입점한 일반음식점의 주방이 있습니까?",
    help: "2023년 12월 1일 이후 대규모점포에 입점한 일반음식점 주방에는 상업용 주방자동소화장치를 설치해야 합니다.",
    options: [
      { value: "yes", label: "있음", description: "대규모점포 입점 일반음식점 주방이 있음" },
      { value: "no", label: "없음", description: "해당 주방이 없음" },
    ],
    condition: (ya, pd) => ya.yOccupancyType === "sales" && ya.ySalesIsLargeStore === "yes" && pd >= YD.D20231201,
  },
  {
    key: "ySalesHas24HourStaff",
    type: "ychoice",
    title: "방재실 등에 24시간 화재를 감시하는 사람이 근무합니까?",
    help: "2022년 12월 1일 이후에는 화재 수신기가 설치된 장소에 24시간 감시자가 근무하면 자동화재속보설비를 설치하지 않을 수 있습니다.",
    options: [
      { value: "yes", label: "예", description: "24시간 화재 감시 근무자가 상주함" },
      { value: "no", label: "아니오", description: "24시간 감시 근무자가 없음" },
    ],
    condition: (ya, pd) => ya.yOccupancyType === "sales" && pd >= YD.D20221201 && ya.ySalesIsTraditionalMarket === "yes",
  },
  {
    key: "ySalesHasLargeTargetFloor",
    type: "ychoice",
    title: "지하층·무창층·4층 이상 층 중 바닥면적 300㎡ 이상인 층이 있습니까?",
    help: "옥내소화전설비 설치 여부를 판단합니다. (판매시설 기준: 연면적 1,500㎡ 이상 또는 해당 층 300㎡ 이상)",
    options: [
      { value: "yes", label: "예", description: "해당 층이 있음" },
      { value: "no", label: "아니오", description: "해당 층이 없음" },
    ],
    condition: (ya) => ya.yOccupancyType === "sales" && (parseFloat(ya.yTotalArea) || 0) < 1500 && !yearIsAutoAreaMode(),
  },
  {
    key: "ySalesFirstSecondFloorArea",
    type: "ynumber",
    title: "지상 1층·2층 바닥면적 합계(㎡)",
    help: "옥외소화전 설치 여부를 판단합니다. 해당 없으면 0을 입력하세요.",
    placeholder: "예: 0",
    min: 0,
    step: 0.1,
    condition: (ya) => ya.yOccupancyType === "sales" && (parseFloat(ya.yTotalArea) || 0) >= 9000 && !yearIsAutoAreaMode(),
  },
  {
    key: "ySalesParkingElecSet",
    type: "ycompound",
    title: "주차장·전기실 정보를 입력하세요",
    help: "물분무등소화설비 판단에 사용됩니다. 해당 없으면 0을 입력하세요.",
    condition: (ya) => ya.yOccupancyType === "sales",
  },
  {
    key: "ySalesHasGasFacility",
    type: "ychoice",
    title: "가스시설이 설치돼 있습니까?",
    help: "가스시설이 설치된 판매시설은 가스누설경보기를 설치해야 합니다.",
    options: [
      { value: "yes", label: "예", description: "주방 등 가스시설이 설치돼 있음" },
      { value: "no", label: "아니오", description: "가스시설이 없음" },
    ],
    condition: (ya) => ya.yOccupancyType === "sales",
  },

  // ── 소방법 분법 이전(~2004.5.29) 판매시설(구 「시장」) 전용 스텝 ──
  {
    key: "yBefore2004SalesArea",
    type: "ynumber",
    title: "판매시설(구 「시장」)로 사용하는 바닥면적 합계(㎡)",
    help: "스프링클러설비·연결살수설비·자동화재속보설비 판단에 사용됩니다. 건물 전체를 판매시설로 사용하면 연면적과 같게 입력하세요.",
    placeholder: "예: 6000",
    min: 0,
    step: 0.1,
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "sales",
  },
  {
    key: "yBefore2004SalesHasLargeFloor450",
    type: "ychoice",
    title: "지하층·무창층·4층 이상 층 중 바닥면적 450㎡ 이상인 층이 있습니까?",
    help: "1992년 7월 28일 이전 옥내소화전설비 설치 조건입니다. 해당 층이 있으면 (1984년 이후에는 전 층) 설치합니다.",
    options: [
      { value: "yes", label: "예", description: "해당 조건의 층이 있음" },
      { value: "no", label: "아니오", description: "해당 조건의 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "sales",
  },
  {
    key: "yBefore2004SalesHasLargeFloor300",
    type: "ychoice",
    title: "지하층·무창층·4층 이상 층 중 바닥면적 300㎡ 이상인 층이 있습니까?",
    help: "1992년 7월 28일 이후 판매시설 옥내소화전설비 추가 설치 조건입니다.",
    options: [
      { value: "yes", label: "예", description: "해당 조건의 층이 있음" },
      { value: "no", label: "아니오", description: "해당 조건의 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "sales",
  },
  {
    key: "yBefore2004SalesSprinklerFloor",
    type: "ychoice",
    title: "4층 이상 10층 이하의 층 중 바닥면적 1,000㎡(1984년 이전 기준 1,500㎡) 이상인 층이 있습니까?",
    help: "1992년 7월 28일 이전 스프링클러설비 설치 조건입니다. 해당 층에 설치합니다.",
    options: [
      { value: "yes", label: "예", description: "해당 층이 있음" },
      { value: "no", label: "아니오", description: "해당 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "sales",
  },
  {
    key: "yBefore2004SalesLargeFloor1000",
    type: "ychoice",
    title: "지하층·무창층·4층 이상 층 중 바닥면적 1,000㎡ 이상인 층이 있습니까?",
    help: "1992년 7월 28일 이후 스프링클러설비 전 층 설치 조건입니다. 해당 층이 있으면 건물 전 층에 설치합니다.",
    options: [
      { value: "yes", label: "예", description: "해당 층이 있음" },
      { value: "no", label: "아니오", description: "해당 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "sales",
  },
  {
    key: "yBefore2004SalesAutoDetFloor600",
    type: "ychoice",
    title: "지하층·무창층·3층 이상 층 중 바닥면적 600㎡ 이상인 층이 있습니까?",
    help: "1992년 7월 28일 이전 자동화재탐지설비 설치 조건입니다. 연면적 1,000㎡ 미만이더라도 이 조건에 해당하면 설치합니다.",
    options: [
      { value: "yes", label: "예", description: "해당 층이 있음" },
      { value: "no", label: "아니오", description: "해당 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "sales",
  },
  {
    key: "yBefore2004SalesHasFloor1500",
    type: "ychoice",
    title: "건물 내에 바닥면적이 1,500㎡ 이상인 층이 있습니까?",
    help: "1992년 7월 28일 이후 자동화재속보설비 설치 조건입니다.",
    options: [
      { value: "yes", label: "예", description: "1,500㎡ 이상인 층이 있음" },
      { value: "no", label: "아니오", description: "해당 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "sales",
  },

  // ── 소방법 분법 이전(~2004.5.29) 근린생활시설 전용 스텝 ──
  {
    key: "yBefore2004FacilitySubtype",
    type: "ychoice",
    title: "어떤 용도(구 소방법 제1종·제2종 장소)인가요?",
    help: "1992년 7월 28일 이전에는 '근린생활시설'이라는 명칭이 없었고 업종별로 구분하였습니다. 소화기구·자동화재탐지설비 기준에 영향을 줍니다.",
    options: [
      { value: "restaurant", label: "음식점·다방 등", description: "음식점, 다방, 제과점 등 식음료 관련 제1종 장소 — 소화기구 연면적 33㎡ 기준 적용" },
      { value: "marketBathhouse", label: "시장·공중목욕장", description: "재래시장, 슈퍼마켓, 공중목욕장 — 자동화재탐지설비 1,000㎡ 기준 적용" },
      { value: "general", label: "기타 근린생활시설", description: "의원, 소매점, 사무소, 이·미용원 등 — 소화기구 150㎡·자탐 600㎡ 기준 적용" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "neighborhood",
  },
  {
    key: "yBefore2004HasLargeFloor450",
    type: "ychoice",
    title: "지하층·무창층·4층 이상 층 중 바닥면적 450㎡ 이상인 층이 있습니까?",
    help: "1992년 7월 28일 이전 옥내소화전설비 설치 조건입니다. 해당 층이 하나라도 있으면 전 층에 설치합니다.",
    options: [
      { value: "yes", label: "예", description: "해당 조건의 층이 있음" },
      { value: "no", label: "아니오", description: "해당 조건의 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "neighborhood",
  },
  {
    key: "yBefore2004SprinklerFloor",
    type: "ychoice",
    title: "4층 이상 10층 이하의 층 중 바닥면적 1,000㎡(1984년 이전 기준 1,500㎡) 이상인 층이 있습니까?",
    help: "1984년 7월 1일 이전에는 1,500㎡, 이후에는 1,000㎡ 이상인 층에 스프링클러설비를 설치합니다. 해당 층에만 설치하며 전 층 기준이 아닙니다.",
    options: [
      { value: "yes", label: "예", description: "해당 층이 있음" },
      { value: "no", label: "아니오", description: "해당 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "neighborhood",
  },
  {
    key: "yBefore2004HasDetFloor300",
    type: "ychoice",
    title: "지하층·무창층·3층 이상 층 중 바닥면적 300㎡ 이상인 층이 있습니까?",
    help: "연면적 기준 미달이더라도 이 조건에 해당하면 자동화재탐지설비를 설치해야 합니다.",
    options: [
      { value: "yes", label: "예", description: "해당 층이 있음" },
      { value: "no", label: "아니오", description: "해당 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "neighborhood",
  },
  {
    key: "yBefore2004LargeFloor1000",
    type: "ychoice",
    title: "지하층·무창층·4층 이상 층 중 바닥면적 1,000㎡ 이상인 층이 있습니까?",
    help: "1992년 7월 28일 이후 스프링클러설비 설치 조건입니다. 해당 층이 있으면 전 층에 설치합니다.",
    options: [
      { value: "yes", label: "예", description: "해당 층이 있음" },
      { value: "no", label: "아니오", description: "해당 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "neighborhood",
  },

  // ── 소방법 분법 이전(~2004.5.29) 의료시설 전용 스텝 ──
  {
    key: "yBefore2004MedicalSubtype",
    type: "ychoice",
    title: "어떤 의료시설인가요?",
    help: "종합병원과 일반 병원·의원의 구분은 유도등 크기(1984~1992년), 인명구조기구 기준에 영향을 줍니다.",
    options: [
      { value: "generalHospital", label: "종합병원", description: "종합병원 — 대형 피난구·통로유도등 기준 적용(1984~1992)" },
      { value: "hospital", label: "병원·의원 등", description: "병원·치과병원·한방병원·의원·치과의원·한의원 등" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "medical",
  },
  {
    key: "yBefore2004MedicalHasLargeFloor450",
    type: "ychoice",
    title: "지하층·무창층·4층 이상 층 중 바닥면적 450㎡ 이상인 층이 있습니까?",
    help: "1992년 7월 28일 이전 옥내소화전설비 설치 조건입니다. 해당 층이 있으면 (1984년 이후에는 전 층) 설치합니다.",
    options: [
      { value: "yes", label: "예", description: "해당 조건의 층이 있음" },
      { value: "no", label: "아니오", description: "해당 조건의 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "medical",
  },
  {
    key: "yBefore2004MedicalHasLargeFloor300",
    type: "ychoice",
    title: "지하층·무창층·4층 이상 층 중 바닥면적 300㎡ 이상인 층이 있습니까?",
    help: "1992년 7월 28일 이후 의료시설 옥내소화전설비 추가 설치 조건입니다.",
    options: [
      { value: "yes", label: "예", description: "해당 조건의 층이 있음" },
      { value: "no", label: "아니오", description: "해당 조건의 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "medical",
  },
  {
    key: "yBefore2004MedicalSprinklerFloor",
    type: "ychoice",
    title: "지하층·무창층 또는 4층 이상 10층 이하의 층 중 바닥면적 1,000㎡(1984년 이전 기준 1,500㎡) 이상인 층이 있습니까?",
    help: "1992년 7월 28일 이전 스프링클러설비 설치 조건입니다. 해당 층에 설치합니다.",
    options: [
      { value: "yes", label: "예", description: "해당 층이 있음" },
      { value: "no", label: "아니오", description: "해당 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "medical",
  },
  {
    key: "yBefore2004MedicalAutoDetFloor300",
    type: "ychoice",
    title: "지하층·무창층·3층 이상 층 중 바닥면적 300㎡ 이상인 층이 있습니까?",
    help: "연면적 600㎡ 미만이더라도 이 조건에 해당하면 자동화재탐지설비를 설치해야 합니다.",
    options: [
      { value: "yes", label: "예", description: "해당 층이 있음" },
      { value: "no", label: "아니오", description: "해당 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "medical",
  },
  {
    key: "yBefore2004MedicalHasLargeFloor1000",
    type: "ychoice",
    title: "지하층·무창층·4층 이상 층 중 바닥면적 1,000㎡ 이상인 층이 있습니까?",
    help: "1992년 7월 28일 이후 스프링클러설비 전 층 설치 조건입니다. 해당 층이 있으면 건물 전 층에 설치합니다.",
    options: [
      { value: "yes", label: "예", description: "해당 층이 있음" },
      { value: "no", label: "아니오", description: "해당 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "medical",
  },
  {
    key: "yBefore2004MedicalHasFloor1500",
    type: "ychoice",
    title: "건물 내에 바닥면적이 1,500㎡ 이상인 층이 있습니까?",
    help: "1992년 7월 28일 이후 자동화재속보설비 설치 조건입니다.",
    options: [
      { value: "yes", label: "예", description: "1,500㎡ 이상인 층이 있음" },
      { value: "no", label: "아니오", description: "해당 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "medical",
  },
  {
    key: "yBefore2004MedicalParkingElecSet",
    type: "ycompound",
    title: "주차장·전기실 정보를 입력하세요",
    help: "물분무등소화설비 판단에 사용됩니다. 해당 없으면 0을 입력하세요.",
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "medical",
  },

  // ── 소방법 분법 이전(~2004.5.29) 노유자시설 전용 스텝 ──
  {
    key: "yBefore2004ElderlyHasLargeFloor450",
    type: "ychoice",
    title: "지하층·무창층·4층 이상 층 중 바닥면적 450㎡ 이상인 층이 있습니까?",
    help: "1992년 7월 28일 이전 옥내소화전설비 설치 조건입니다. 해당 층이 하나라도 있으면 (1984년 이후에는 전 층) 설치합니다.",
    options: [
      { value: "yes", label: "예", description: "해당 조건의 층이 있음" },
      { value: "no", label: "아니오", description: "해당 조건의 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "elderly",
  },
  {
    key: "yBefore2004ElderlySprinklerFloor",
    type: "ychoice",
    title: "지하층·무창층 또는 4층 이상 10층 이하의 층 중 바닥면적 1,000㎡(1984년 이전 기준 1,500㎡) 이상인 층이 있습니까?",
    help: "1992년 7월 28일 이전 스프링클러설비 설치 조건입니다. 해당 층에 설치합니다.",
    options: [
      { value: "yes", label: "예", description: "해당 층이 있음" },
      { value: "no", label: "아니오", description: "해당 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "elderly",
  },
  {
    key: "yBefore2004ElderlyAutoDetFloor300",
    type: "ychoice",
    title: "지하층·무창층·3층 이상 층 중 바닥면적 300㎡ 이상인 층이 있습니까?",
    help: "연면적 600㎡ 미만이더라도 이 조건에 해당하면 자동화재탐지설비를 설치해야 합니다.",
    options: [
      { value: "yes", label: "예", description: "해당 층이 있음" },
      { value: "no", label: "아니오", description: "해당 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "elderly",
  },
  {
    key: "yBefore2004ElderlyHasLargeFloor300",
    type: "ychoice",
    title: "지하층·무창층·4층 이상 층 중 바닥면적 300㎡ 이상인 층이 있습니까?",
    help: "1992년 7월 28일 이후 노유자시설 옥내소화전설비 추가 설치 조건입니다.",
    options: [
      { value: "yes", label: "예", description: "해당 조건의 층이 있음" },
      { value: "no", label: "아니오", description: "해당 조건의 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "elderly",
  },
  {
    key: "yBefore2004ElderlyLargeFloor1000",
    type: "ychoice",
    title: "지하층·무창층·4층 이상 층 중 바닥면적 1,000㎡ 이상인 층이 있습니까?",
    help: "1992년 7월 28일 이후 스프링클러설비 전 층 설치 조건입니다. (2001년 5월 21일 이후에는 연면적 600㎡ 이상도 설치 대상)",
    options: [
      { value: "yes", label: "예", description: "해당 층이 있음" },
      { value: "no", label: "아니오", description: "해당 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "elderly",
  },
  {
    key: "yBefore2004ElderlyHasFloor500Plus",
    type: "ychoice",
    title: "바닥면적이 500㎡ 이상인 층이 있습니까?",
    help: "1999년 7월 29일 이후 노유자시설 자동화재속보설비 설치 조건입니다.",
    options: [
      { value: "yes", label: "있음", description: "500㎡ 이상인 층이 하나라도 있음" },
      { value: "no", label: "없음", description: "모든 층이 500㎡ 미만" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "elderly",
  },
  {
    key: "yBefore2004ElderlyParkingElecSet",
    type: "ycompound",
    title: "주차장·전기실 정보를 입력하세요",
    help: "물분무등소화설비 판단에 사용됩니다. 해당 없으면 0을 입력하세요.",
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "elderly",
  },

  // ── 소방법 분법 이전(~2004.5.29) 종교시설 전용 스텝 ──
  {
    key: "yBefore2004ReligiousHasLargeFloor600",
    type: "ychoice",
    title: "지하층·무창층·4층 이상 층 중 바닥면적 600㎡ 이상인 층이 있습니까?",
    help: "옥내소화전설비 설치 여부를 판단하는 조건입니다. 교회·사찰은 연면적 3,000㎡ 이상 또는 이 조건 충족 시 설치합니다.",
    options: [
      { value: "yes", label: "있음", description: "해당 조건의 층이 하나라도 있음" },
      { value: "no", label: "없음", description: "조건에 맞는 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "religious",
  },
  {
    key: "yBefore2004ReligiousParkingElecSet",
    type: "ycompound",
    title: "주차장·전기실 정보를 입력하세요",
    help: "물분무등소화설비 판단에 사용됩니다. 해당 없으면 0을 입력하세요.",
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "religious",
  },

  // ── 소방법 분법 이전(~2004.5.29) 공동주택(아파트) 전용 스텝 ──
  {
    key: "yBefore2004AptHouseholds",
    type: "ynumber",
    title: "공동주택 세대수",
    help: "자동화재탐지설비·물분무등소화설비(부설 차고)·공기안전매트의 의무관리대상(공동주택관리령 제7조) 판단에 사용됩니다. 300세대 이상, 또는 150세대 이상이면서 6층 이상(승강기 설치)인 경우 의무관리대상으로 봅니다.",
    placeholder: "예: 300",
    min: 0,
    step: 1,
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "apartment",
  },
  {
    key: "yBefore2004AptCorridorType",
    type: "ychoice",
    title: "복도 형태가 어떤가요?",
    help: "갓복도형 아파트는 제연설비가 면제(1995.8.10~)되고, 편복도형 아파트는 피난기구가 면제(1982.9.15~)됩니다.",
    options: [
      { value: "gat", label: "갓복도형", description: "복도 한쪽이 외기에 완전 개방된 구조 (제연·피난기구 면제)" },
      { value: "pyeon", label: "편복도형", description: "한쪽이 바깥과 접한 복도형 (피난기구 면제)" },
      { value: "none", label: "그 외 (계단실형 등)", description: "면제 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "apartment",
  },
  {
    key: "yBefore2004AptHasLargeFloor450",
    type: "ychoice",
    title: "지하층·무창층 또는 4층 이상 층 중 바닥면적 450㎡ 이상인 층이 있나요?",
    help: "1992년 7월 28일 이전 옥내소화전설비 설치 조건입니다. (동당·통합 면적 기준)",
    options: [
      { value: "yes", label: "예", description: "해당 층이 있음" },
      { value: "no", label: "아니오", description: "해당 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "apartment",
  },
  {
    key: "yBefore2004AptHasLargeFloor600",
    type: "ychoice",
    title: "지하층·무창층 또는 4층 이상 층 중 바닥면적 600㎡ 이상인 층이 있나요?",
    help: "1992년 7월 28일 이후 옥내소화전설비 전 층 설치 조건입니다. (동당·통합 면적 기준)",
    options: [
      { value: "yes", label: "예", description: "해당 층이 있음" },
      { value: "no", label: "아니오", description: "해당 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "apartment",
  },
  {
    key: "yBefore2004AptDetFloor600",
    type: "ychoice",
    title: "지하층·무창층 또는 3층 이상 층 중 바닥면적 600㎡ 이상인 층이 있나요?",
    help: "1992년 7월 28일 이전 자동화재탐지설비 설치 조건입니다. (동당·통합 면적 기준)",
    options: [
      { value: "yes", label: "예", description: "해당 층이 있음" },
      { value: "no", label: "아니오", description: "해당 층이 없음" },
    ],
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "apartment",
  },
  {
    key: "yBefore2004AptElecSet",
    type: "ycompound",
    title: "전기실·발전실 등 바닥면적을 입력하세요",
    help: "물분무등소화설비(전기실·발전실·변전실·전산실 바닥면적 300㎡ 이상) 판단에 사용됩니다. 없으면 0.",
    condition: (ya) => ya.yEraChoice === "before2004" && ya.yOccupancyType === "apartment",
  },
  {
    key: "yAptParkingBuildingSet",
    type: "ycompound",
    title: "주차장 정보를 입력하세요",
    help: "주차전용 별동(지하주차장 등)이 있으면 '예' 후 그 동의 연면적·층수·지하면적을 입력하면 주거동과 별개로 판정해 합산합니다. 별동이 아니면 '아니오' 후 건물 내부 차고·주차장 바닥면적을 입력하세요.",
    condition: (ya) => ya.yOccupancyType === "apartment",
  },
];

const yearStepOrder = new Map([
  // 시작 질문
  "yEraChoice",
  "yPermitDate",
  "yOccupancyType",
  "yApartmentSubtype",

  // 공통 건축물 정보
  "yTotalArea",
  "yAptBuildingCount",
  "yAptHouseholdCount",
  "yBefore2004AptHouseholds",
  "yAboveGroundFloors",
  "yBasementSet",
  "yWindowlessSet",
  "yNeighborhoodArea",
  "yLodgingArea",
  "yElderlyArea",
  "yMedicalArea",
  "ySalesArea",
  "yBefore2004SalesArea",

  // 용도 세부 질문
  "yBefore2004FacilitySubtype",
  "yFacilitySubtype",
  "yIsPostpartum",
  "yPostpartumAreaRange",
  "yIsClinicWithInpatient",
  "yHasHemodialysis",
  "yHas24HourStaff",
  "yLodgingIsLiving",
  "yLodgingIsTouristHotel",
  "yBefore2004LodgingIsTouristHotel",
  "yElderlySubtype",
  "yElderlyHasGrillWindow",
  "yElderlyHasFloor500Plus",
  "yElderlyHas24HourStaff",
  "yMedicalSubtype",
  "yBefore2004MedicalSubtype",
  "yReligiousOccupancy100Plus",
  "yReligiousIsWoodStructure",
  "yReligiousIsSacrificialBuilding",
  "yReligiousHasStage",
  "yReligiousStageArea",
  "ySalesIsTraditionalMarket",
  "ySalesIsLargeStore",
  "ySalesOccupancy500Plus",
  "ySalesOccupancy100Plus",
  "ySalesHasRestaurantKitchen",
  "ySalesHas24HourStaff",

  // 조건 보정 질문
  "yHasLargeTargetFloor",
  "yHasLargeFloorFor1000",
  "yElderlyHasLargeTargetFloor",
  "yReligiousHasLargeTargetFloor",
  "yBefore2004HasLargeFloor450",
  "yBefore2004SprinklerFloor",
  "yBefore2004HasDetFloor300",
  "yBefore2004LargeFloor1000",
  "yBefore2004LodgingHasLargeFloor450",
  "yBefore2004LodgingSprinklerFloor",
  "yBefore2004LodgingAutoDetFloor300",
  "yBefore2004LodgingHasLargeFloor300",
  "yBefore2004LodgingHasLargeFloor1000",
  "yBefore2004LodgingHasFloor1500",
  "yBefore2004MedicalHasLargeFloor450",
  "yBefore2004MedicalHasLargeFloor300",
  "yBefore2004MedicalSprinklerFloor",
  "yBefore2004MedicalAutoDetFloor300",
  "yBefore2004MedicalHasLargeFloor1000",
  "yBefore2004MedicalHasFloor1500",
  "yBefore2004ElderlyHasLargeFloor450",
  "yBefore2004ElderlySprinklerFloor",
  "yBefore2004ElderlyAutoDetFloor300",
  "yBefore2004ElderlyHasLargeFloor300",
  "yBefore2004ElderlyLargeFloor1000",
  "yBefore2004ElderlyHasFloor500Plus",
  "yBefore2004ReligiousHasLargeFloor600",
  "yBefore2004SalesHasLargeFloor450",
  "yBefore2004SalesHasLargeFloor300",
  "yBefore2004SalesSprinklerFloor",
  "yBefore2004SalesLargeFloor1000",
  "yBefore2004SalesAutoDetFloor600",
  "yBefore2004SalesHasFloor1500",
  "yLodgingHasLargeFloorFor1000",
  "yLodgingFirstSecondFloorArea",
  "yElderlyFirstSecondFloorArea",
  "yMedicalFirstSecondFloorArea",
  "yReligiousFirstSecondFloorArea",
  "ySalesHasLargeTargetFloor",
  "ySalesFirstSecondFloorArea",
  "yFirstSecondFloorArea",
  "yParkingElecSet",
  "yLodgingParkingElecSet",
  "yElderlyParkingElecSet",
  "yMedicalParkingElecSet",
  "yReligiousParkingElecSet",
  "ySalesParkingElecSet",
  "yBefore2004LodgingParkingElecSet",
  "yBefore2004MedicalParkingElecSet",
  "yBefore2004ElderlyParkingElecSet",
  "yBefore2004ReligiousParkingElecSet",
  "ySmokeControlArea",
  "yLodgingBasementAreaForSmoke",
  "yElderlyBasementAreaForSmoke",
  "yMedicalBasementAreaForSmoke",
  "yHasSmallUndergroundParking",

  // 공동주택 전용 질문
  "yAptParkingBuildingSet",
  "yAptParkingElecSet",
  "yAptUndergroundParkingArea",
  "yAptHasSpecialStair",
  "yAptIsGatBokdo",
  "yBefore2004AptCorridorType",
  "yAptHouseholds",
  "yAptIsNationalHousing",
  "yBefore2004AptElecSet",
  "yAptHasFloor600",
  "yAptHasFloor1000",
  "yAptFirstSecondFloorArea",
  "yBefore2004AptHasLargeFloor450",
  "yBefore2004AptHasLargeFloor600",
  "yBefore2004AptDetFloor600",

  // 가스시설 질문
  "yLodgingHasGasFacility",
  "yElderlyHasGasFacility",
  "yMedicalHasGasFacility",
  "yReligiousHasGasFacility",
  "ySalesHasGasFacility",

  // 다중이용업소 질문
  "yHasMultiuseBusiness",
  "yMultiuseSimpleSprinklerCheck",
  "yMultiuseOnSecondToTenthFloor",
  "yMultiuseOnGroundOrRefugeFloor",
  "yMultiuseUsesAV",
  "yMultiuseHasGasFacility",
  "yMultiuseHasRooms",
  "yMultiuseHasEvacuationRoute",
  "yLodgingHasMultiuseBusiness",
  "yLodgingMultiuseSimpleSprinklerCheck",
  "yLodgingMultiuseOnSecondToTenthFloor",
  "yLodgingMultiuseOnGroundOrRefugeFloor",
  "yLodgingMultiuseUsesAV",
  "yLodgingMultiuseHasGasFacility",
  "yLodgingMultiuseHasRooms",
  "yLodgingMultiuseHasEvacuationRoute",
].map((key, index) => [key, index]));

// 자세한 버전(분법 이전) 자동산정 대상 키 (자동 ON이면 화면에서 숨김, 수동이면 맨 뒤로)
const YEAR_AUTO_CANDIDATE_KEYS_BY_OCCUPANCY_BEFORE2004 = {
  neighborhood: new Set(["yBefore2004HasLargeFloor450", "yBefore2004SprinklerFloor", "yBefore2004HasDetFloor300", "yBefore2004LargeFloor1000", "yFirstSecondFloorArea", "ySmokeControlArea"]),
  lodging: new Set(["yBefore2004LodgingHasLargeFloor450", "yBefore2004LodgingSprinklerFloor", "yBefore2004LodgingAutoDetFloor300", "yBefore2004LodgingHasLargeFloor300", "yBefore2004LodgingHasLargeFloor1000", "yBefore2004LodgingHasFloor1500"]),
  medical: new Set(["yBefore2004MedicalHasLargeFloor450", "yBefore2004MedicalHasLargeFloor300", "yBefore2004MedicalSprinklerFloor", "yBefore2004MedicalAutoDetFloor300", "yBefore2004MedicalHasLargeFloor1000", "yBefore2004MedicalHasFloor1500"]),
  elderly: new Set(["yBefore2004ElderlyHasLargeFloor450", "yBefore2004ElderlySprinklerFloor", "yBefore2004ElderlyAutoDetFloor300", "yBefore2004ElderlyHasLargeFloor300", "yBefore2004ElderlyLargeFloor1000", "yBefore2004ElderlyHasFloor500Plus"]),
  religious: new Set(["yBefore2004ReligiousHasLargeFloor600"]),
  sales: new Set(["yBefore2004SalesHasLargeFloor450", "yBefore2004SalesHasLargeFloor300", "yBefore2004SalesSprinklerFloor", "yBefore2004SalesLargeFloor1000", "yBefore2004SalesAutoDetFloor600", "yBefore2004SalesHasFloor1500", "ySalesFirstSecondFloorArea"]),
};

// 자세한 버전(분법 이후) 수동 입력 모드일 때 면적 관련 질문을 맨 뒤로 (용도별)
const YEAR_AUTO_CANDIDATE_KEYS_BY_OCCUPANCY = {
  neighborhood: new Set(["yHasLargeTargetFloor", "yHasLargeFloorFor1000", "yFirstSecondFloorArea", "ySmokeControlArea"]),
  lodging: new Set(["yLodgingHasLargeFloorFor1000", "yLodgingFirstSecondFloorArea", "yLodgingBasementAreaForSmoke"]),
  elderly: new Set(["yElderlyHasLargeTargetFloor", "yElderlyHasFloor500Plus", "yElderlyFirstSecondFloorArea", "yElderlyBasementAreaForSmoke"]),
  medical: new Set(["yMedicalHasLargeTargetFloor", "yMedicalHasFloor500Plus", "yMedicalFirstSecondFloorArea", "yMedicalBasementAreaForSmoke"]),
  religious: new Set(["yReligiousHasLargeTargetFloor", "yReligiousFirstSecondFloorArea"]),
  sales: new Set(["ySalesHasLargeTargetFloor", "ySalesFirstSecondFloorArea"]),
};

function sortByYearStepOrder(activeSteps) {
  const ya = yearState.answers;
  let keysToEnd = null;
  if (ya.yAutoCalcAreas === "no") {
    if (ya.yEraChoice === "after2004") {
      keysToEnd = YEAR_AUTO_CANDIDATE_KEYS_BY_OCCUPANCY[ya.yOccupancyType];
    } else if (ya.yEraChoice === "before2004") {
      keysToEnd = YEAR_AUTO_CANDIDATE_KEYS_BY_OCCUPANCY_BEFORE2004[ya.yOccupancyType];
    }
  }
  const orderKey = (step) => {
    let idx = yearStepOrder.get(step.key) ?? Number.MAX_SAFE_INTEGER;
    if (keysToEnd && keysToEnd.has(step.key)) {
      idx += 100000;
    }
    return idx;
  };
  return [...activeSteps].sort((a, b) => {
    const pa = phaseOf(a.key), pb = phaseOf(b.key);
    if (pa !== pb) return pa - pb;
    const ai = orderKey(a);
    const bi = orderKey(b);
    if (ai !== bi) return ai - bi;
    return yearSteps.indexOf(a) - yearSteps.indexOf(b);
  });
}

const YEAR_NEIGHBORHOOD_MULTIUSE_KEYS = [
  "yHasMultiuseBusiness",
  "yMultiuseSimpleSprinklerCheck",
  "yMultiuseOnSecondToTenthFloor",
  "yMultiuseUsesAV",
  "yMultiuseHasGasFacility",
  "yMultiuseHasRooms",
  "yMultiuseHasEvacuationRoute",
];

const YEAR_LODGING_MULTIUSE_KEYS = [
  "yLodgingHasMultiuseBusiness",
  "yLodgingMultiuseSimpleSprinklerCheck",
  "yLodgingMultiuseOnSecondToTenthFloor",
  "yLodgingMultiuseUsesAV",
  "yLodgingMultiuseHasGasFacility",
  "yLodgingMultiuseHasRooms",
  "yLodgingMultiuseHasEvacuationRoute",
];

function yearGetActiveSteps() {
  const ya = yearState.answers;
  const pd = yPermitDateInt();
  const clinicApplicable = pd >= YD.D20190806 && ya.yIsClinicWithInpatient === "yes";
  const hemApplicable = pd >= YD.D20241231 && ya.yHasHemodialysis === "yes";
  const postpartumApplicable = pd >= YD.D20220225 && ya.yIsPostpartum === "yes";
  const autoDispatch = clinicApplicable || hemApplicable || postpartumApplicable;
  const YEAR_EXPLORER_MULTIUSE_KEYS = [
    "yHasMultiuseBusiness",
    "yMultiuseSimpleSprinklerCheck",
    "yMultiuseOnSecondToTenthFloor",
    "yMultiuseOnGroundOrRefugeFloor",
    "yMultiuseUsesAV",
    "yMultiuseHasGasFacility",
    "yMultiuseHasRooms",
    "yMultiuseHasEvacuationRoute",
    "yLodgingHasMultiuseBusiness",
    "yLodgingMultiuseSimpleSprinklerCheck",
    "yLodgingMultiuseOnSecondToTenthFloor",
    "yLodgingMultiuseOnGroundOrRefugeFloor",
    "yLodgingMultiuseUsesAV",
    "yLodgingMultiuseHasGasFacility",
    "yLodgingMultiuseHasRooms",
    "yLodgingMultiuseHasEvacuationRoute",
  ];
  const activeSteps = yearSteps.filter((step) => {
    if (step.key === "yEraChoice") return true;
    if (["yPermitDate", "yOccupancyType"].includes(step.key)) return !!ya.yEraChoice;
    if (YEAR_EXPLORER_MULTIUSE_KEYS.includes(step.key) && ya.yEraChoice !== "before2004") return false;

    // ── 분법 이전 근린생활시설 ──
    if (ya.yEraChoice === "before2004" && ya.yOccupancyType === "neighborhood") {
      if (ya.yAutoCalcAreas === "yes" && YEAR_AUTO_CANDIDATE_KEYS_BY_OCCUPANCY_BEFORE2004.neighborhood.has(step.key)) return false;
      const ta = parseFloat(ya.yTotalArea) || 0;
      const ag = parseInt(ya.yAboveGroundFloors) || 0;
      const preBefore1992 = pd > 0 && pd < YD.D19920728;
      const postAfter1992Before2004 = pd >= YD.D19920728;
      if (YEAR_NEIGHBORHOOD_MULTIUSE_KEYS.includes(step.key)) {
        if (pd < YD.D19970927) return false;
        if (step.key === "yHasMultiuseBusiness") return true;
        if (ya.yHasMultiuseBusiness !== "yes") return false;
        if (step.key === "yMultiuseSimpleSprinklerCheck") return pd >= YD.D20010521;
        return true;
      }
      // 항상 표시
      const alwaysShow = ["yOccupancyType", "yPermitDate", "yTotalArea", "yAboveGroundFloors", "yBasementSet", "yWindowlessSet", "yFirstSecondFloorArea", "yParkingElecSet"];
      if (alwaysShow.includes(step.key)) return true;
      // 제연설비: 1982.9.28 이후
      if (step.key === "ySmokeControlArea") return pd >= YD.D19820928;
      // 분법 이전 전용 스텝
      if (step.key === "yBefore2004FacilitySubtype") return preBefore1992;
      if (step.key === "yBefore2004HasLargeFloor450") return preBefore1992 && ta < 2100;
      if (step.key === "yBefore2004SprinklerFloor") return preBefore1992;
      if (step.key === "yBefore2004HasDetFloor300") {
        if (!preBefore1992) return false;
        const detThreshold = ya.yBefore2004FacilitySubtype === "marketBathhouse" ? 1000 : 600;
        return ta < detThreshold;
      }
      if (step.key === "yBefore2004LargeFloor1000") return postAfter1992Before2004 && ag < 11;
      // 재사용 스텝 (1992 이후)
      if (step.key === "yFacilitySubtype") return postAfter1992Before2004;
      if (step.key === "yHasLargeTargetFloor") return postAfter1992Before2004 && ta < 1500;
      return false;
    }
    // ── 분법 이전 숙박시설 ──
    if (ya.yEraChoice === "before2004" && ya.yOccupancyType === "lodging") {
      if (ya.yAutoCalcAreas === "yes" && YEAR_AUTO_CANDIDATE_KEYS_BY_OCCUPANCY_BEFORE2004.lodging.has(step.key)) return false;
      const ta = parseFloat(ya.yTotalArea) || 0;
      const ag = parseInt(ya.yAboveGroundFloors) || 0;
      const preBefore1992 = pd > 0 && pd < YD.D19920728;
      const postAfter1992 = pd >= YD.D19920728;
      if (YEAR_LODGING_MULTIUSE_KEYS.includes(step.key)) {
        if (pd < YD.D19970927) return false;
        if (step.key === "yLodgingHasMultiuseBusiness") return true;
        if (ya.yLodgingHasMultiuseBusiness !== "yes") return false;
        if (step.key === "yLodgingMultiuseSimpleSprinklerCheck") return pd >= YD.D20010521;
        return true;
      }
      const alwaysShow = ["yOccupancyType", "yPermitDate", "yTotalArea", "yAboveGroundFloors", "yBasementSet", "yWindowlessSet", "yBefore2004LodgingIsTouristHotel", "yBefore2004LodgingParkingElecSet"];
      if (alwaysShow.includes(step.key)) return true;
      // 1992년 이전 전용 스텝
      if (step.key === "yBefore2004LodgingHasLargeFloor450") return preBefore1992 && ta < 2100;
      if (step.key === "yBefore2004LodgingSprinklerFloor") return preBefore1992 && ag < 11;
      if (step.key === "yBefore2004LodgingAutoDetFloor300") return preBefore1992 && ta < 600;
      // 1992년 이후 전용 스텝
      if (step.key === "yBefore2004LodgingHasLargeFloor300") return postAfter1992 && ta < 1500;
      if (step.key === "yBefore2004LodgingHasLargeFloor1000") return postAfter1992 && ag < 11;
      if (step.key === "yBefore2004LodgingHasFloor1500") return postAfter1992;
      return false;
    }

    // ── 분법 이전 의료시설 ──
    if (ya.yEraChoice === "before2004" && ya.yOccupancyType === "medical") {
      if (ya.yAutoCalcAreas === "yes" && YEAR_AUTO_CANDIDATE_KEYS_BY_OCCUPANCY_BEFORE2004.medical.has(step.key)) return false;
      const ta = parseFloat(ya.yTotalArea) || 0;
      const ag = parseInt(ya.yAboveGroundFloors) || 0;
      const preBefore1992 = pd > 0 && pd < YD.D19920728;
      const postAfter1992 = pd >= YD.D19920728;
      const alwaysShow = ["yOccupancyType", "yPermitDate", "yTotalArea", "yAboveGroundFloors", "yBasementSet", "yWindowlessSet"];
      if (alwaysShow.includes(step.key)) return true;
      if (step.key === "yBefore2004MedicalSubtype") return true;
      if (step.key === "yBefore2004MedicalHasLargeFloor450") return preBefore1992 && ta < 2100;
      if (step.key === "yBefore2004MedicalSprinklerFloor") return preBefore1992;
      if (step.key === "yBefore2004MedicalAutoDetFloor300") return preBefore1992 && ta < 600;
      if (step.key === "yBefore2004MedicalHasLargeFloor300") return postAfter1992 && ta < 1500;
      if (step.key === "yBefore2004MedicalHasLargeFloor1000") return postAfter1992 && ag < 11;
      if (step.key === "yBefore2004MedicalHasFloor1500") return postAfter1992;
      if (step.key === "yBefore2004MedicalParkingElecSet") return true;
      return false;
    }

    // ── 분법 이전 노유자시설 ──
    if (ya.yEraChoice === "before2004" && ya.yOccupancyType === "elderly") {
      if (ya.yAutoCalcAreas === "yes" && YEAR_AUTO_CANDIDATE_KEYS_BY_OCCUPANCY_BEFORE2004.elderly.has(step.key)) return false;
      const ta = parseFloat(ya.yTotalArea) || 0;
      const ag = parseInt(ya.yAboveGroundFloors) || 0;
      const preBefore1992 = pd > 0 && pd < YD.D19920728;
      const postAfter1992 = pd >= YD.D19920728;
      const alwaysShow = ["yOccupancyType", "yPermitDate", "yTotalArea", "yAboveGroundFloors", "yBasementSet", "yWindowlessSet", "yBefore2004ElderlyParkingElecSet"];
      if (alwaysShow.includes(step.key)) return true;
      // 분법 이전 전용 스텝 (1981~1992)
      if (step.key === "yBefore2004ElderlyHasLargeFloor450") return preBefore1992 && ta < 2100;
      if (step.key === "yBefore2004ElderlySprinklerFloor") return preBefore1992;
      if (step.key === "yBefore2004ElderlyAutoDetFloor300") return preBefore1992 && ta < 600;
      // 1992 이후 스텝
      if (step.key === "yBefore2004ElderlyHasLargeFloor300") return postAfter1992 && ta < 1500;
      if (step.key === "yBefore2004ElderlyLargeFloor1000") return postAfter1992 && ag < 11;
      if (step.key === "yBefore2004ElderlyHasFloor500Plus") return pd >= YD.D19990729;
      return false;
    }

    // ── 분법 이전 종교시설 ──
    if (ya.yEraChoice === "before2004" && ya.yOccupancyType === "religious") {
      if (ya.yAutoCalcAreas === "yes" && YEAR_AUTO_CANDIDATE_KEYS_BY_OCCUPANCY_BEFORE2004.religious.has(step.key)) return false;
      const ta = parseFloat(ya.yTotalArea) || 0;
      const alwaysShow = ["yOccupancyType", "yPermitDate", "yTotalArea", "yAboveGroundFloors", "yBasementSet", "yWindowlessSet", "yBefore2004ReligiousParkingElecSet"];
      if (alwaysShow.includes(step.key)) return true;
      if (step.key === "yBefore2004ReligiousHasLargeFloor600") return ta < 3000;
      return false;
    }

    // ── 분법 이전 판매시설(구 「시장」) ──
    if (ya.yEraChoice === "before2004" && ya.yOccupancyType === "sales") {
      if (ya.yAutoCalcAreas === "yes" && YEAR_AUTO_CANDIDATE_KEYS_BY_OCCUPANCY_BEFORE2004.sales.has(step.key)) return false;
      const ta = parseFloat(ya.yTotalArea) || 0;
      const ag = parseInt(ya.yAboveGroundFloors) || 0;
      const preBefore1992 = pd > 0 && pd < YD.D19920728;
      const postAfter1992 = pd >= YD.D19920728;
      const alwaysShow = ["yOccupancyType", "yPermitDate", "yTotalArea", "yAboveGroundFloors", "yBasementSet", "yWindowlessSet", "yBefore2004SalesArea", "ySalesParkingElecSet"];
      if (alwaysShow.includes(step.key)) return true;
      // 옥외소화전 1·2층 면적 (수동 모드, 연면적 9,000㎡ 이상일 때만)
      if (step.key === "ySalesFirstSecondFloorArea") return ta >= 9000;
      // 1992년 이전 전용 스텝
      if (step.key === "yBefore2004SalesHasLargeFloor450") return preBefore1992 && ta < 2100;
      if (step.key === "yBefore2004SalesSprinklerFloor") return preBefore1992;
      if (step.key === "yBefore2004SalesAutoDetFloor600") return preBefore1992 && ta < 1000;
      // 1992년 이후 전용 스텝
      if (step.key === "yBefore2004SalesHasLargeFloor300") return postAfter1992 && ta < 1500;
      if (step.key === "yBefore2004SalesLargeFloor1000") return postAfter1992 && ag < 11;
      if (step.key === "yBefore2004SalesHasFloor1500") return postAfter1992;
      return false;
    }

    // ── 분법 이전 공동주택(아파트) ──
    if (ya.yEraChoice === "before2004" && ya.yOccupancyType === "apartment") {
      const ta = parseFloat(ya.yTotalArea) || 0;
      const perDongTa = ta / Math.max(parseInt(ya.yAptBuildingCount) || 1, 1); // 동당 연면적
      const alwaysShow = ["yOccupancyType", "yPermitDate", "yTotalArea", "yAptBuildingCount", "yAboveGroundFloors", "yBasementSet", "yWindowlessSet",
        "yBefore2004AptHouseholds", "yBefore2004AptElecSet", "yAptParkingBuildingSet"];
      if (alwaysShow.includes(step.key)) return true;
      if (step.key === "yBefore2004AptCorridorType") return ya.yAutoCalcAreas === "no";
      // 4층↑/3층↑ 바닥면적 질문: 자동산정 해제(상세) + 시기별 + 동당 연면적이 이미 설치기준 미만일 때만
      if (step.key === "yBefore2004AptHasLargeFloor450") return ya.yAutoCalcAreas === "no" && pd > 0 && pd < YD.D19920728 && perDongTa < 2100;
      if (step.key === "yBefore2004AptHasLargeFloor600") return ya.yAutoCalcAreas === "no" && pd >= YD.D19920728 && perDongTa < 3000;
      if (step.key === "yBefore2004AptDetFloor600") return ya.yAutoCalcAreas === "no" && pd > 0 && pd < YD.D19920728 && perDongTa < 1000;
      // 옥외소화전 1·2층 면적: 연면적 9,000㎡ 이상일 때만
      if (step.key === "yAptFirstSecondFloorArea") return ta >= 9000;
      return false;
    }

    if (ya.yEraChoice === "before2004") return step.key === "yOccupancyType";

    if (ya.yEraChoice !== "after2004") return false;
    return !step.condition || step.condition(ya, pd, autoDispatch);
  });
  return sortByYearStepOrder(activeSteps);
}

// 자세한 버전(분법 이후) 면적 자동산정 지원 용도
const YEAR_AUTO_OCCUPANCY_TYPES = ["neighborhood", "lodging", "elderly", "medical", "religious", "sales", "apartment"];

function yearSupportsAutoArea(eraChoice, occupancyType) {
  if (occupancyType === "apartment") return true; // 분법 이전/이후 모두 간단·상세 토글 노출
  return YEAR_AUTO_OCCUPANCY_TYPES.includes(occupancyType);
}

// 자동산정 모드 여부 (지원 용도 + 토글 ON, 분법 이전/이후 공통)
function yearIsAutoAreaMode() {
  const ya = yearState.answers;
  return (ya.yEraChoice === "after2004" || ya.yEraChoice === "before2004")
    && yearSupportsAutoArea(ya.yEraChoice, ya.yOccupancyType)
    && ya.yAutoCalcAreas === "yes";
}

// 직사각형 가정으로 "지하·무창·4층 이상 중 threshold㎡ 이상" 자동 판정
function yearAutoDeriveLargeFloor(threshold) {
  const ya = yearState.answers;
  const ta = parseFloat(ya.yTotalArea) || 0;
  const ba = parseFloat(ya.yBasementAreaSum) || 0;
  const bf = parseInt(ya.yBasementFloors) || 0;
  const ag = parseInt(ya.yAboveGroundFloors) || 0;
  const hasWl = ya.yHasWindowlessFloor === "yes";
  const wlA = hasWl ? (parseFloat(ya.yWindowlessArea) || 0) : 0;
  const aboveAvg = ag > 0 ? (ta - ba) / ag : 0;
  const basementAvg = bf > 0 ? ba / bf : 0;
  if (ag >= 4 && aboveAvg >= threshold) return "yes";
  if (bf > 0 && basementAvg >= threshold) return "yes";
  if (hasWl && wlA >= threshold) return "yes";
  return "no";
}

// 직사각형 가정으로 "지하·무창·3층 이상 중 threshold㎡ 이상" 자동 판정 (분법 이전 자탐 조건)
function yearAutoDeriveLargeFloorMin3(threshold) {
  const ya = yearState.answers;
  const ta = parseFloat(ya.yTotalArea) || 0;
  const ba = parseFloat(ya.yBasementAreaSum) || 0;
  const bf = parseInt(ya.yBasementFloors) || 0;
  const ag = parseInt(ya.yAboveGroundFloors) || 0;
  const hasWl = ya.yHasWindowlessFloor === "yes";
  const wlA = hasWl ? (parseFloat(ya.yWindowlessArea) || 0) : 0;
  const aboveAvg = ag > 0 ? (ta - ba) / ag : 0;
  const basementAvg = bf > 0 ? ba / bf : 0;
  if (ag >= 3 && aboveAvg >= threshold) return "yes";
  if (bf > 0 && basementAvg >= threshold) return "yes";
  if (hasWl && wlA >= threshold) return "yes";
  return "no";
}

// 직사각형 가정으로 "4층 이상(지상) 중 threshold㎡ 이상" 자동 판정 (지하·무창 제외, 분법 이전 근린·숙박 SP 조건)
function yearAutoDeriveAboveFloor4Plus(threshold) {
  const ya = yearState.answers;
  const ta = parseFloat(ya.yTotalArea) || 0;
  const ba = parseFloat(ya.yBasementAreaSum) || 0;
  const ag = parseInt(ya.yAboveGroundFloors) || 0;
  const aboveAvg = ag > 0 ? (ta - ba) / ag : 0;
  if (ag >= 4 && aboveAvg >= threshold) return "yes";
  return "no";
}

function yearApartmentAverageFloorArea() {
  const ya = yearState.answers;
  const ta = parseFloat(ya.yTotalArea) || 0;
  const dongCount = Math.max(parseInt(ya.yAptBuildingCount) || 1, 1);
  const ag = parseInt(ya.yAboveGroundFloors) || 0;
  const bf = parseInt(ya.yBasementFloors) || 0;
  const totalFloors = ag + bf;
  if (ta <= 0 || totalFloors <= 0) return 0;
  return (ta / dongCount) / totalFloors;
}

function yearAutoDeriveApartmentAboveFloor4Plus(threshold) {
  const ag = parseInt(yearState.answers.yAboveGroundFloors) || 0;
  return ag >= 4 && yearApartmentAverageFloorArea() >= threshold ? "yes" : "no";
}

// 분법 이전 공동주택: 지하(통합)·무창·지상 minAboveFloor층 이상 중 threshold㎡ 이상 층 자동 판정
// 지상은 동당 층당 평균, 지하는 통합 층당 면적 기준
function yearAutoDeriveApartmentLargeFloor(threshold, minAboveFloor) {
  const ya = yearState.answers;
  const ba = parseFloat(ya.yBasementAreaSum) || 0;
  const bf = parseInt(ya.yBasementFloors) || 0;
  const ag = parseInt(ya.yAboveGroundFloors) || 0;
  const hasWl = ya.yHasWindowlessFloor === "yes";
  const wlA = hasWl ? (parseFloat(ya.yWindowlessArea) || 0) : 0;
  const aptAvg = yearApartmentAverageFloorArea();
  if (ag >= minAboveFloor && aptAvg >= threshold) return "yes";
  if (bf > 0 && (ba / bf) >= threshold) return "yes";
  if (hasWl && wlA >= threshold) return "yes";
  return "no";
}

// 직사각형 가정으로 "어떤 층이든 threshold㎡ 이상" 자동 판정 (층 위치 제한 없음)
function yearAutoDeriveAnyFloor(threshold) {
  const ya = yearState.answers;
  const ta = parseFloat(ya.yTotalArea) || 0;
  const ba = parseFloat(ya.yBasementAreaSum) || 0;
  const bf = parseInt(ya.yBasementFloors) || 0;
  const ag = parseInt(ya.yAboveGroundFloors) || 0;
  const hasWl = ya.yHasWindowlessFloor === "yes";
  const wlA = hasWl ? (parseFloat(ya.yWindowlessArea) || 0) : 0;
  const aboveAvg = ag > 0 ? (ta - ba) / ag : 0;
  const basementAvg = bf > 0 ? ba / bf : 0;
  if (ag > 0 && aboveAvg >= threshold) return "yes";
  if (bf > 0 && basementAvg >= threshold) return "yes";
  if (hasWl && wlA >= threshold) return "yes";
  return "no";
}

// 자동산정 모드일 때 면적 관련 답변을 입력값으로부터 파생 채움
function yearApplyAutoCalc() {
  if (!yearIsAutoAreaMode()) return;
  yearRecalcF12();
  yearRecalcApartmentAreaTargets();
  yearRecalcSmokeAreaTargets();
  const ya = yearState.answers;
  // 분법 이전: 시기·용도별 분기로 면적 관련 답을 도출
  if (ya.yEraChoice === "before2004") {
    const pd = yPermitDateInt();
    const sprThreshold = (pd > 0 && pd < YD.D19840701) ? 1500 : 1000;
    switch (ya.yOccupancyType) {
      case "apartment":
        ya.yBefore2004AptHasLargeFloor450 = yearAutoDeriveApartmentLargeFloor(450, 4);
        ya.yBefore2004AptHasLargeFloor600 = yearAutoDeriveApartmentLargeFloor(600, 4);
        ya.yBefore2004AptDetFloor600 = yearAutoDeriveApartmentLargeFloor(600, 3);
        break;
      case "neighborhood":
        ya.yBefore2004HasLargeFloor450 = yearAutoDeriveLargeFloor(450);
        ya.yBefore2004HasDetFloor300 = yearAutoDeriveLargeFloorMin3(300);
        ya.yBefore2004LargeFloor1000 = yearAutoDeriveLargeFloor(1000);
        ya.yBefore2004SprinklerFloor = yearAutoDeriveAboveFloor4Plus(sprThreshold);
        break;
      case "lodging":
        ya.yBefore2004LodgingHasLargeFloor450 = yearAutoDeriveLargeFloor(450);
        ya.yBefore2004LodgingSprinklerFloor = yearAutoDeriveAboveFloor4Plus(sprThreshold);
        ya.yBefore2004LodgingAutoDetFloor300 = yearAutoDeriveLargeFloorMin3(300);
        ya.yBefore2004LodgingHasLargeFloor300 = yearAutoDeriveLargeFloor(300);
        ya.yBefore2004LodgingHasLargeFloor1000 = yearAutoDeriveLargeFloor(1000);
        ya.yBefore2004LodgingHasFloor1500 = yearAutoDeriveAnyFloor(1500);
        break;
      case "medical":
        ya.yBefore2004MedicalHasLargeFloor450 = yearAutoDeriveLargeFloor(450);
        ya.yBefore2004MedicalHasLargeFloor300 = yearAutoDeriveLargeFloor(300);
        ya.yBefore2004MedicalSprinklerFloor = yearAutoDeriveLargeFloor(sprThreshold);
        ya.yBefore2004MedicalAutoDetFloor300 = yearAutoDeriveLargeFloorMin3(300);
        ya.yBefore2004MedicalHasLargeFloor1000 = yearAutoDeriveLargeFloor(1000);
        ya.yBefore2004MedicalHasFloor1500 = yearAutoDeriveAnyFloor(1500);
        break;
      case "elderly":
        ya.yBefore2004ElderlyHasLargeFloor450 = yearAutoDeriveLargeFloor(450);
        ya.yBefore2004ElderlySprinklerFloor = yearAutoDeriveLargeFloor(sprThreshold);
        ya.yBefore2004ElderlyAutoDetFloor300 = yearAutoDeriveLargeFloorMin3(300);
        ya.yBefore2004ElderlyHasLargeFloor300 = yearAutoDeriveLargeFloor(300);
        ya.yBefore2004ElderlyLargeFloor1000 = yearAutoDeriveLargeFloor(1000);
        ya.yBefore2004ElderlyHasFloor500Plus = yearAutoDeriveAnyFloor(500);
        break;
      case "religious":
        ya.yBefore2004ReligiousHasLargeFloor600 = yearAutoDeriveLargeFloor(600);
        break;
      case "sales":
        ya.yBefore2004SalesHasLargeFloor450 = yearAutoDeriveLargeFloor(450);
        ya.yBefore2004SalesHasLargeFloor300 = yearAutoDeriveLargeFloor(300);
        ya.yBefore2004SalesSprinklerFloor = yearAutoDeriveAboveFloor4Plus(sprThreshold);
        ya.yBefore2004SalesLargeFloor1000 = yearAutoDeriveLargeFloor(1000);
        ya.yBefore2004SalesAutoDetFloor600 = yearAutoDeriveLargeFloorMin3(600);
        ya.yBefore2004SalesHasFloor1500 = yearAutoDeriveAnyFloor(1500);
        break;
    }
    return;
  }
  switch (ya.yOccupancyType) {
    case "neighborhood":
      ya.yHasLargeTargetFloor = yearAutoDeriveLargeFloor(300);
      ya.yHasLargeFloorFor1000 = yearAutoDeriveLargeFloor(1000);
      break;
    case "lodging":
      ya.yLodgingHasLargeFloorFor1000 = yearAutoDeriveLargeFloor(1000);
      break;
    case "elderly":
      ya.yElderlyHasLargeTargetFloor = yearAutoDeriveLargeFloor(300);
      if (ya.yElderlySubtype === "general") {
        ya.yElderlyHasFloor500Plus = yearAutoDeriveAnyFloor(500);
      }
      break;
    case "medical":
      ya.yMedicalHasLargeTargetFloor = yearAutoDeriveLargeFloor(300);
      if (ya.yMedicalSubtype === "psychiatricHospital" || ya.yMedicalSubtype === "rehabilitationFacility") {
        ya.yMedicalHasFloor500Plus = yearAutoDeriveAnyFloor(500);
      }
      break;
    case "religious":
      ya.yReligiousHasLargeTargetFloor = yearAutoDeriveLargeFloor(600);
      break;
    case "sales":
      ya.ySalesHasLargeTargetFloor = yearAutoDeriveLargeFloor(300);
      break;
    case "apartment":
      ya.yAptHasFloor600 = yearAutoDeriveApartmentAboveFloor4Plus(600);
      ya.yAptHasFloor1000 = yearAutoDeriveApartmentAboveFloor4Plus(1000);
      ya.yAptHasSpecialStair = ((parseInt(ya.yAboveGroundFloors) || 0) >= 11 || (parseInt(ya.yBasementFloors) || 0) >= 3) ? "yes" : "no";
      break;
  }
}

function yearRecalcF12() {
  const ta = parseFloat(yearState.answers.yTotalArea) || 0;
  const ba = parseFloat(yearState.answers.yBasementAreaSum) || 0;
  const ag = parseInt(yearState.answers.yAboveGroundFloors) || 1;
  const f12 = Math.round(((ta - ba) / ag) * 2 * 10) / 10;
  const s = String(f12);
  yearState.answers.yFirstSecondFloorArea = s;
  yearState.answers.yLodgingFirstSecondFloorArea = s;
  yearState.answers.yElderlyFirstSecondFloorArea = s;
  yearState.answers.yMedicalFirstSecondFloorArea = s;
  yearState.answers.yReligiousFirstSecondFloorArea = s;
  yearState.answers.ySalesFirstSecondFloorArea = s;
}

function yearRecalcApartmentAreaTargets() {
  const ya = yearState.answers;
  if (ya.yOccupancyType !== "apartment") return;
  const avgFloorArea = yearApartmentAverageFloorArea();
  const bf = parseInt(ya.yBasementFloors) || 0;
  const f12 = Math.round(avgFloorArea * Math.min(parseInt(ya.yAboveGroundFloors) || 0, 2) * 10) / 10;
  const basement = Math.round(avgFloorArea * bf * 10) / 10;
  ya.yAptFirstSecondFloorArea = String(f12);
  ya.yBasementAreaSum = String(basement);
}

function yearRecalcSmokeAreaTargets() {
  const basementArea = parseFloat(yearState.answers.yBasementAreaSum) || 0;
  const windowlessArea = yearState.answers.yHasWindowlessFloor === "yes"
    ? (parseFloat(yearState.answers.yWindowlessArea) || 0)
    : 0;
  const total = String(basementArea + windowlessArea);
  yearState.answers.ySmokeControlArea = total;
  yearState.answers.yLodgingBasementAreaForSmoke = total;
  yearState.answers.yElderlyBasementAreaForSmoke = total;
  yearState.answers.yMedicalBasementAreaForSmoke = total;
}

function makeYearField(labelText, name, value, extra = {}) {
  const wrapper = document.createElement("div");
  wrapper.className = "calc-form-row";
  const label = document.createElement("label");
  label.textContent = labelText;
  const input = document.createElement("input");
  input.className = "calc-input";
  input.type = "number";
  input.min = String(extra.min ?? 0);
  input.step = String(extra.step ?? 1);
  input.placeholder = extra.placeholder ?? "";
  input.value = value ?? "";
  input.addEventListener("input", (e) => {
    yearState.answers[name] = e.target.value;
    if (name === "yAptBuildingCount" && yearIsAutoAreaMode()) yearRecalcApartmentAreaTargets();
    if (name === "yBasementAreaSum") yearRecalcF12();
    if (name === "yBasementAreaSum" || name === "yWindowlessArea") yearRecalcSmokeAreaTargets();
  });
  wrapper.appendChild(label);
  wrapper.appendChild(input);
  return wrapper;
}

function makeYearBinaryField(labelText, name) {
  const wrapper = document.createElement("div");
  wrapper.className = "calc-form-row";
  const label = document.createElement("label");
  label.textContent = labelText;
  wrapper.appendChild(label);
  const buttons = document.createElement("div");
  buttons.className = "choice-list";
  [{ value: "yes", label: "예" }, { value: "no", label: "아니오" }].forEach((opt) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-button";
    if (yearState.answers[name] === opt.value) btn.classList.add("selected");
    btn.innerHTML = `<strong>${opt.label}</strong>`;
    btn.addEventListener("click", () => {
      yearState.answers[name] = opt.value;
      if (name === "yHasWindowlessFloor") yearRecalcSmokeAreaTargets();
      yearRenderCurrentStep();
    });
    buttons.appendChild(btn);
  });
  wrapper.appendChild(buttons);
  return wrapper;
}

function yearRenderChoiceStep(step) {
  const container = document.createElement("div");
  const wrapper = document.createElement("div");
  wrapper.className = "choice-list";
  step.options.forEach((option) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-button";
    if (String(yearState.answers[step.key]) === option.value) btn.classList.add("selected");
    btn.innerHTML = `<strong>${option.label}</strong><span>${option.description}</span>`;
    btn.addEventListener("click", () => {
      yearState.answers[step.key] = option.value;
      // 분법 이전/이후 선택 시 허가일 기본값 자동 전환
      if (step.key === "yEraChoice") {
        yearState.answers.yPermitDate = option.value === "before2004" ? "1992-07-28" : "2019-02-18";
      }
      yearRenderCurrentStep();
    });
    wrapper.appendChild(btn);
  });
  container.appendChild(wrapper);

  // 자세한 버전(지원 용도): 면적 자동산정 토글 (분법 이전/이후 공통)
  if (step.key === "yOccupancyType"
      && (yearState.answers.yEraChoice === "after2004" || yearState.answers.yEraChoice === "before2004")
      && yearSupportsAutoArea(yearState.answers.yEraChoice, yearState.answers.yOccupancyType)) {
    const toggleWrap = document.createElement("label");
    toggleWrap.className = "info-box blue";
    toggleWrap.style.display = "flex";
    toggleWrap.style.alignItems = "flex-start";
    toggleWrap.style.gap = "10px";
    toggleWrap.style.marginTop = "14px";
    toggleWrap.style.cursor = "pointer";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = yearState.answers.yAutoCalcAreas !== "no";
    cb.style.marginTop = "3px";
    cb.style.flexShrink = "0";
    cb.addEventListener("change", () => {
      yearState.answers.yAutoCalcAreas = cb.checked ? "yes" : "no";
    });
    const text = document.createElement("div");
    text.innerHTML = `<div class="ib-title">면적 자동 산정 (체크) · 직접 입력 (해제)</div>
      체크하면 연면적·층수를 기준으로 층별 바닥면적을 자동 산정합니다. 건물이 직사각형이고 모든 층의 바닥면적이 동일하다고 가정하며, 이 조건에 맞지 않으면 <strong>체크 해제</strong> 후 직접 입력하세요.`;
    toggleWrap.appendChild(cb);
    toggleWrap.appendChild(text);
    container.appendChild(toggleWrap);
  }

  return container;
}

function yearRenderNumberStep(step) {
  const input = document.createElement("input");
  input.className = "calc-input";
  input.type = "number";
  input.min = String(step.min ?? 0);
  input.step = String(step.step ?? 1);
  input.placeholder = step.placeholder ?? "";
  if (["ySmokeControlArea", "yLodgingBasementAreaForSmoke", "yElderlyBasementAreaForSmoke", "yMedicalBasementAreaForSmoke"].includes(step.key)) {
    yearRecalcSmokeAreaTargets();
  }
  if (step.key === "ySalesArea" && !yearState.answers.ySalesArea && yearState.answers.yTotalArea) {
    yearState.answers.ySalesArea = yearState.answers.yTotalArea;
  }
  if (step.key === "yBefore2004SalesArea" && !yearState.answers.yBefore2004SalesArea && yearState.answers.yTotalArea) {
    yearState.answers.yBefore2004SalesArea = yearState.answers.yTotalArea;
  }
  input.value = yearState.answers[step.key] ?? "";
  // 용도별 바닥면적 필드는 연면적을 초과할 수 없음
  const areaFields = ["yNeighborhoodArea", "yLodgingArea", "yElderlyArea", "yMedicalArea", "ySalesArea", "yBefore2004SalesArea"];
  if (areaFields.includes(step.key)) {
    const ta = parseFloat(yearState.answers.yTotalArea) || 0;
    if (ta > 0) input.max = String(ta);
  }
  input.addEventListener("input", (e) => {
    // 용도별 바닥면적이 연면적 초과 시 연면적 값으로 클램핑
    if (areaFields.includes(step.key)) {
      const ta = parseFloat(yearState.answers.yTotalArea) || 0;
      if (ta > 0 && parseFloat(e.target.value) > ta) {
        e.target.value = String(ta);
        showToast("해당 용도 바닥면적 합계는 건물 연면적(" + ta + "㎡)을 초과할 수 없습니다.");
      }
    }
    yearState.answers[step.key] = e.target.value;
    // yTotalArea 변경 시 관련 필드 자동 파생
    if (step.key === "yTotalArea") {
      yearState.answers.yLodgingArea = e.target.value;
      yearState.answers.yNeighborhoodArea = e.target.value;
      yearState.answers.yElderlyArea = e.target.value;
      yearState.answers.yMedicalArea = e.target.value;
      yearState.answers.ySalesArea = e.target.value;
      yearState.answers.yBefore2004SalesArea = e.target.value;
      yearRecalcF12();
      if (yearIsAutoAreaMode()) yearRecalcApartmentAreaTargets();
    }
    // 층수 변경 시 1·2층 면적 재계산
    if (step.key === "yAboveGroundFloors" || step.key === "yBasementFloors") {
      yearRecalcF12();
      if (yearIsAutoAreaMode()) yearRecalcApartmentAreaTargets();
    }
  });
  return input;
}

function yearRenderDateStep() {
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "display:flex;gap:8px;align-items:center;";

  const existing = yearState.answers.yPermitDate || "";
  const parts = existing.split("-");
  const ey = parts[0] || "";
  const em = parts[1] || "";
  const ed = parts[2] || "";

  function syncDate() {
    const y = yInp.value.trim();
    const m = String(mInp.value.trim()).padStart(2, "0");
    const d = String(dInp.value.trim()).padStart(2, "0");
    if (y && mInp.value.trim() && dInp.value.trim()) {
      yearState.answers.yPermitDate = y + "-" + m + "-" + d;
    } else {
      yearState.answers.yPermitDate = "";
    }
    // 분법 이전/이후에 따라 날짜 유효성 경고 표시
    const pd = yPermitDateInt();
    const isBefore2004Era = yearState.answers.yEraChoice === "before2004";
    let warn = wrapper.parentNode && wrapper.parentNode.querySelector(".year-date-warn");
    const tooEarly = isBefore2004Era ? (pd > 0 && pd < YD.D19811106) : (pd > 0 && pd < YD.D20040530);
    const tooLate  = isBefore2004Era && pd >= YD.D20040530;
    if (tooEarly || tooLate) {
      if (!warn) {
        warn = document.createElement("div");
        warn.className = "year-date-warn info-box amber";
        warn.style.marginTop = "10px";
        wrapper.insertAdjacentElement("afterend", warn);
      }
      if (isBefore2004Era) {
        warn.innerHTML = "<div class=\"ib-title\">⚠️ 범위 외 날짜</div>소방법 분법 이전 구간은 <strong>1981년 11월 6일 ~ 2004년 5월 29일</strong>입니다. 허가일을 다시 확인해 주세요.";
      } else {
        warn.innerHTML = "<div class=\"ib-title\">⚠️ 분석 불가 날짜</div>이 도구는 <strong>2004년 5월 30일 이후</strong> 건축허가 건물만 분석할 수 있습니다. 허가일을 다시 확인해 주세요.";
      }
    } else {
      if (warn) warn.remove();
    }
  }

  const yInp = document.createElement("input");
  yInp.className = "calc-input";
  yInp.type = "number";
  yInp.placeholder = "년 (예: 2024)";
  yInp.min = "1900"; yInp.max = "2100"; yInp.step = "1";
  yInp.style.cssText = "flex:3;min-width:0;";
  yInp.value = ey;
  yInp.addEventListener("input", syncDate);

  const mInp = document.createElement("input");
  mInp.className = "calc-input";
  mInp.type = "number";
  mInp.placeholder = "월";
  mInp.min = "1"; mInp.max = "12"; mInp.step = "1";
  mInp.style.cssText = "flex:1;min-width:0;";
  mInp.value = em ? String(parseInt(em, 10)) : "";
  mInp.addEventListener("input", syncDate);

  const dInp = document.createElement("input");
  dInp.className = "calc-input";
  dInp.type = "number";
  dInp.placeholder = "일";
  dInp.min = "1"; dInp.max = "31"; dInp.step = "1";
  dInp.style.cssText = "flex:1;min-width:0;";
  dInp.value = ed ? String(parseInt(ed, 10)) : "";
  dInp.addEventListener("input", syncDate);

  wrapper.appendChild(yInp);
  wrapper.appendChild(mInp);
  wrapper.appendChild(dInp);
  return wrapper;
}

function yearRenderCompoundStep(step) {
  const wrapper = document.createElement("div");
  wrapper.className = "choice-list";
  const ya = yearState.answers;

  if (step.key === "yBasementSet") {
    const floorsField = makeYearField("지하층수", "yBasementFloors", ya.yBasementFloors, { min: 0, step: 1, placeholder: "없으면 0" });
    const areaField = makeYearField("지하층 바닥면적 합계(㎡)", "yBasementAreaSum", ya.yBasementAreaSum, { min: 0, step: 0.1, placeholder: "없으면 0" });
    wrapper.appendChild(floorsField);
    wrapper.appendChild(areaField);
    const floorsInput = floorsField.querySelector("input");
    const areaInput = areaField.querySelector("input");
    floorsInput.addEventListener("input", () => {
      const basement = Number(ya.yBasementFloors);
      const totalArea = Number(ya.yTotalArea);
      const above = Number(ya.yAboveGroundFloors);
      if (!Number.isFinite(basement) || basement < 1) return;
      if (!Number.isFinite(totalArea) || totalArea <= 0) return;
      if (!Number.isFinite(above) || above < 0) return;
      const totalFloors = above + basement;
      if (totalFloors <= 0) return;
      const computed = yearIsAutoAreaMode() && ya.yOccupancyType === "apartment"
        ? Math.round(yearApartmentAverageFloorArea() * basement * 10) / 10
        : Math.round((totalArea / totalFloors) * basement * 10) / 10;
      ya.yBasementAreaSum = String(computed);
      areaInput.value = String(computed);
      if (typeof yearRecalcF12 === "function") yearRecalcF12();
      if (typeof yearRecalcApartmentAreaTargets === "function" && yearIsAutoAreaMode()) yearRecalcApartmentAreaTargets();
      if (typeof yearRecalcSmokeAreaTargets === "function") yearRecalcSmokeAreaTargets();
    });
  }

  if (step.key === "yWindowlessSet") {
    wrapper.appendChild(makeYearBinaryField("무창층이 있습니까?", "yHasWindowlessFloor"));
    if (ya.yHasWindowlessFloor === "yes") {
      wrapper.appendChild(makeYearField("무창층 바닥면적(㎡)", "yWindowlessArea", ya.yWindowlessArea, { min: 0, step: 0.1, placeholder: "예: 150" }));
    }
  }

  if (step.key === "yParkingElecSet") {
    wrapper.appendChild(makeYearField("건물 내부 차고·주차장 바닥면적(㎡)", "yIndoorParkingArea", ya.yIndoorParkingArea, { min: 0, step: 0.1, placeholder: "없으면 0" }));
    wrapper.appendChild(makeYearField("기계식 주차 대수(대)", "yMechanicalParkingCapacity", ya.yMechanicalParkingCapacity, { min: 0, step: 1, placeholder: "없으면 0" }));
    wrapper.appendChild(makeYearField("전기실·발전실·변전실·전산실 바닥면적(㎡)", "yElectricalRoomArea", ya.yElectricalRoomArea, { min: 0, step: 0.1, placeholder: "없으면 0" }));
  }

  if (step.key === "yLodgingParkingElecSet") {
    wrapper.appendChild(makeYearField("건물 내부 차고·주차장 바닥면적(㎡)", "yLodgingIndoorParkingArea", ya.yLodgingIndoorParkingArea, { min: 0, step: 0.1, placeholder: "없으면 0" }));
    wrapper.appendChild(makeYearField("기계식 주차 대수(대)", "yLodgingMechanicalParkingCapacity", ya.yLodgingMechanicalParkingCapacity, { min: 0, step: 1, placeholder: "없으면 0" }));
    wrapper.appendChild(makeYearField("전기실·발전실·변전실·전산실 바닥면적(㎡)", "yLodgingElectricalRoomArea", ya.yLodgingElectricalRoomArea, { min: 0, step: 0.1, placeholder: "없으면 0" }));
  }

  if (step.key === "yElderlyParkingElecSet") {
    wrapper.appendChild(makeYearField("건물 내부 차고·주차장 바닥면적(㎡)", "yElderlyIndoorParkingArea", ya.yElderlyIndoorParkingArea, { min: 0, step: 0.1, placeholder: "없으면 0" }));
    wrapper.appendChild(makeYearField("기계식 주차 대수(대)", "yElderlyMechanicalParkingCapacity", ya.yElderlyMechanicalParkingCapacity, { min: 0, step: 1, placeholder: "없으면 0" }));
    wrapper.appendChild(makeYearField("전기실·발전실·변전실·전산실 바닥면적(㎡)", "yElderlyElectricalRoomArea", ya.yElderlyElectricalRoomArea, { min: 0, step: 0.1, placeholder: "없으면 0" }));
  }

  if (step.key === "yMedicalParkingElecSet") {
    wrapper.appendChild(makeYearField("건물 내부 차고·주차장 바닥면적(㎡)", "yMedicalIndoorParkingArea", ya.yMedicalIndoorParkingArea, { min: 0, step: 0.1, placeholder: "없으면 0" }));
    wrapper.appendChild(makeYearField("기계식 주차 대수(대)", "yMedicalMechanicalParkingCapacity", ya.yMedicalMechanicalParkingCapacity, { min: 0, step: 1, placeholder: "없으면 0" }));
    wrapper.appendChild(makeYearField("전기실·발전실·변전실·전산실 바닥면적(㎡)", "yMedicalElectricalRoomArea", ya.yMedicalElectricalRoomArea, { min: 0, step: 0.1, placeholder: "없으면 0" }));
  }

  if (step.key === "yBefore2004LodgingParkingElecSet") {
    wrapper.appendChild(makeYearField("건물 내부 차고·주차장 바닥면적(㎡)", "yBefore2004LodgingIndoorParkingArea", ya.yBefore2004LodgingIndoorParkingArea, { min: 0, step: 0.1, placeholder: "없으면 0" }));
    wrapper.appendChild(makeYearField("기계식 주차 대수(대)", "yBefore2004LodgingMechanicalParkingCapacity", ya.yBefore2004LodgingMechanicalParkingCapacity, { min: 0, step: 1, placeholder: "없으면 0" }));
    wrapper.appendChild(makeYearField("전기실·발전실·변전실·전산실 바닥면적(㎡)", "yBefore2004LodgingElectricalRoomArea", ya.yBefore2004LodgingElectricalRoomArea, { min: 0, step: 0.1, placeholder: "없으면 0" }));
  }

  if (step.key === "yBefore2004MedicalParkingElecSet") {
    wrapper.appendChild(makeYearField("건물 내부 차고·주차장 바닥면적(㎡)", "yBefore2004MedicalIndoorParkingArea", ya.yBefore2004MedicalIndoorParkingArea, { min: 0, step: 0.1, placeholder: "없으면 0" }));
    wrapper.appendChild(makeYearField("기계식 주차 대수(대)", "yBefore2004MedicalMechanicalParkingCapacity", ya.yBefore2004MedicalMechanicalParkingCapacity, { min: 0, step: 1, placeholder: "없으면 0" }));
    wrapper.appendChild(makeYearField("전기실·발전실·변전실·전산실 바닥면적(㎡)", "yBefore2004MedicalElectricalRoomArea", ya.yBefore2004MedicalElectricalRoomArea, { min: 0, step: 0.1, placeholder: "없으면 0" }));
  }

  if (step.key === "yBefore2004ElderlyParkingElecSet") {
    wrapper.appendChild(makeYearField("건물 내부 차고·주차장 바닥면적(㎡)", "yBefore2004ElderlyIndoorParkingArea", ya.yBefore2004ElderlyIndoorParkingArea, { min: 0, step: 0.1, placeholder: "없으면 0" }));
    wrapper.appendChild(makeYearField("기계식 주차 대수(대)", "yBefore2004ElderlyMechanicalParkingCapacity", ya.yBefore2004ElderlyMechanicalParkingCapacity, { min: 0, step: 1, placeholder: "없으면 0" }));
    wrapper.appendChild(makeYearField("전기실·발전실·변전실·전산실 바닥면적(㎡)", "yBefore2004ElderlyElectricalRoomArea", ya.yBefore2004ElderlyElectricalRoomArea, { min: 0, step: 0.1, placeholder: "없으면 0" }));
  }

  if (step.key === "yReligiousParkingElecSet") {
    wrapper.appendChild(makeYearField("건물 내부 차고·주차장 바닥면적(㎡)", "yReligiousIndoorParkingArea", ya.yReligiousIndoorParkingArea, { min: 0, step: 0.1, placeholder: "없으면 0" }));
    wrapper.appendChild(makeYearField("기계식 주차 대수(대)", "yReligiousMechanicalParkingCapacity", ya.yReligiousMechanicalParkingCapacity, { min: 0, step: 1, placeholder: "없으면 0" }));
    wrapper.appendChild(makeYearField("전기실·발전실·변전실·전산실 바닥면적(㎡)", "yReligiousElectricalRoomArea", ya.yReligiousElectricalRoomArea, { min: 0, step: 0.1, placeholder: "없으면 0" }));
  }

  if (step.key === "ySalesParkingElecSet") {
    wrapper.appendChild(makeYearField("건물 내부 차고·주차장 바닥면적(㎡)", "ySalesIndoorParkingArea", ya.ySalesIndoorParkingArea, { min: 0, step: 0.1, placeholder: "없으면 0" }));
    wrapper.appendChild(makeYearField("지하 차고·주차장 바닥면적 합계(㎡)", "ySalesUndergroundParkingArea", ya.ySalesUndergroundParkingArea, { min: 0, step: 0.1, placeholder: "없으면 0" }));
    wrapper.appendChild(makeYearField("기계식 주차 대수(대)", "ySalesMechanicalParkingCapacity", ya.ySalesMechanicalParkingCapacity, { min: 0, step: 1, placeholder: "없으면 0" }));
    wrapper.appendChild(makeYearField("전기실·발전실·변전실·전산실 바닥면적(㎡)", "ySalesElectricalRoomArea", ya.ySalesElectricalRoomArea, { min: 0, step: 0.1, placeholder: "없으면 0" }));
  }

  if (step.key === "yAptParkingElecSet") {
    wrapper.appendChild(makeYearField("기계식 주차 대수(대)", "yAptMechanicalParkingCapacity", ya.yAptMechanicalParkingCapacity, { min: 0, step: 1, placeholder: "없으면 0" }));
    wrapper.appendChild(makeYearField("전기실·발전실·변전실·전산실 바닥면적(㎡)", "yAptElectricalRoomArea", ya.yAptElectricalRoomArea, { min: 0, step: 0.1, placeholder: "없으면 0" }));
  }

  if (step.key === "yBefore2004AptElecSet") {
    wrapper.appendChild(makeYearField("전기실·발전실·변전실·전산실 바닥면적(㎡)", "yAptElectricalRoomArea", ya.yAptElectricalRoomArea, { min: 0, step: 0.1, placeholder: "없으면 0" }));
  }

  if (step.key === "yAptParkingBuildingSet") {
    wrapper.appendChild(makeYearBinaryField("주차전용 별동(지하주차장 등)이 있습니까?", "yAptHasParkingBuilding"));
    if (ya.yAptHasParkingBuilding === "yes") {
      wrapper.appendChild(makeYearField("주차장동 연면적(㎡)", "yAptParkingArea", ya.yAptParkingArea, { min: 0, step: 0.1, placeholder: "예: 5000" }));
      wrapper.appendChild(makeYearField("주차장동 지상 층수", "yAptParkingAbove", ya.yAptParkingAbove, { min: 0, step: 1, placeholder: "예: 0" }));
      wrapper.appendChild(makeYearField("주차장동 지하 층수", "yAptParkingBelow", ya.yAptParkingBelow, { min: 0, step: 1, placeholder: "예: 2" }));
      wrapper.appendChild(makeYearField("주차장동 지하 바닥면적 합계(㎡)", "yAptParkingBasementArea", ya.yAptParkingBasementArea, { min: 0, step: 0.1, placeholder: "예: 5000" }));
    } else {
      wrapper.appendChild(makeYearField("건물 내부 차고·주차장 바닥면적(㎡)", "yAptIndoorParkingArea", ya.yAptIndoorParkingArea, { min: 0, step: 0.1, placeholder: "없으면 0" }));
    }
  }

  if (step.key === "yBefore2004ReligiousParkingElecSet") {
    wrapper.appendChild(makeYearField("건물 내부 차고·주차장 바닥면적(㎡)", "yBefore2004ReligiousIndoorParkingArea", ya.yBefore2004ReligiousIndoorParkingArea, { min: 0, step: 0.1, placeholder: "없으면 0" }));
    wrapper.appendChild(makeYearField("기계식 주차 대수(대)", "yBefore2004ReligiousMechanicalParkingCapacity", ya.yBefore2004ReligiousMechanicalParkingCapacity, { min: 0, step: 1, placeholder: "없으면 0" }));
    wrapper.appendChild(makeYearField("전기실·발전실·변전실·전산실 바닥면적(㎡)", "yBefore2004ReligiousElectricalRoomArea", ya.yBefore2004ReligiousElectricalRoomArea, { min: 0, step: 0.1, placeholder: "없으면 0" }));
  }

  if (step.key === "yMultiuseSimpleSprinklerCheck") {
    const selectedKeys = ["yMultiuseInBasement", "yMultiuseIsSealed", "yMultiuseIsPostpartum", "yMultiuseIsGosiwon", "yMultiuseIsGunRange"];
    const toggleOption = (name) => { yearState.answers[name] = yearState.answers[name] === "yes" ? "no" : "yes"; yearRenderCurrentStep(); };
    const optionList = document.createElement("div");
    optionList.className = "choice-list";
    const options = yearState.answers.yEraChoice === "before2004"
      ? [
        { name: "yMultiuseInBasement", label: "지하층 영업장 바닥면적 150㎡ 이상", description: "2001.5.21 이후 분법 이전 다중이용업소 간이스프링클러 기준" },
      ]
      : [
      { name: "yMultiuseInBasement", label: "지하층에 설치돼 있음", description: "해당되면 선택" },
      { name: "yMultiuseIsSealed", label: "밀폐구조의 영업장", description: "해당되면 선택" },
      { name: "yMultiuseIsPostpartum", label: "산후조리업", description: "해당되면 선택" },
      { name: "yMultiuseIsGosiwon", label: "고시원", description: "해당되면 선택" },
      { name: "yMultiuseIsGunRange", label: "권총사격장", description: "해당되면 선택" },
    ];
    options.forEach((option) => {
      optionList.appendChild(makeToggleChoiceButton({ label: option.label, description: option.description, selected: ya[option.name] === "yes", onClick: () => toggleOption(option.name) }));
    });
    const noneSelected = selectedKeys.every((name) => ya[name] !== "yes");
    optionList.appendChild(makeToggleChoiceButton({ label: "해당사항 없음", description: "선택한 항목이 없으면 선택", selected: noneSelected, onClick: () => { selectedKeys.forEach((name) => { yearState.answers[name] = "no"; }); yearRenderCurrentStep(); } }));
    wrapper.appendChild(optionList);
  }

  if (step.key === "yLodgingMultiuseSimpleSprinklerCheck") {
    const selectedKeys = ["yLodgingMultiuseInBasement", "yLodgingMultiuseIsSealed", "yLodgingMultiuseIsPostpartum", "yLodgingMultiuseIsGosiwon", "yLodgingMultiuseIsGunRange"];
    const toggleOption = (name) => { yearState.answers[name] = yearState.answers[name] === "yes" ? "no" : "yes"; yearRenderCurrentStep(); };
    const optionList = document.createElement("div");
    optionList.className = "choice-list";
    const options = yearState.answers.yEraChoice === "before2004"
      ? [
        { name: "yLodgingMultiuseInBasement", label: "지하층 영업장 바닥면적 150㎡ 이상", description: "2001.5.21 이후 분법 이전 다중이용업소 간이스프링클러 기준" },
      ]
      : [
      { name: "yLodgingMultiuseInBasement", label: "지하층에 설치돼 있음", description: "해당되면 선택" },
      { name: "yLodgingMultiuseIsSealed", label: "밀폐구조의 영업장", description: "해당되면 선택" },
      { name: "yLodgingMultiuseIsPostpartum", label: "산후조리업", description: "해당되면 선택" },
      { name: "yLodgingMultiuseIsGosiwon", label: "고시원", description: "해당되면 선택" },
      { name: "yLodgingMultiuseIsGunRange", label: "권총사격장", description: "해당되면 선택" },
    ];
    options.forEach((option) => {
      optionList.appendChild(makeToggleChoiceButton({ label: option.label, description: option.description, selected: ya[option.name] === "yes", onClick: () => toggleOption(option.name) }));
    });
    const noneSelected = selectedKeys.every((name) => ya[name] !== "yes");
    optionList.appendChild(makeToggleChoiceButton({ label: "해당사항 없음", description: "선택한 항목이 없으면 선택", selected: noneSelected, onClick: () => { selectedKeys.forEach((name) => { yearState.answers[name] = "no"; }); yearRenderCurrentStep(); } }));
    wrapper.appendChild(optionList);
  }

  return wrapper;
}

function updateYearLawChip() {
  const chip = document.getElementById("explorer-year-law-chip");
  if (!chip) return;
  const era = (yearState && yearState.answers && yearState.answers.yEraChoice) || "after2004";
  chip.dataset.lawKey = era === "before2004" ? "explorer-year-pre" : "explorer-year-post";
}

function yearRenderCurrentStep() {
  updateYearLawChip();
  const activeSteps = yearGetActiveSteps();
  const step = activeSteps[yearState.currentStep];
  document.getElementById("year-question-kicker").textContent = `QUESTION ${yearState.currentStep + 1}`;
  document.getElementById("year-question-title").textContent = step.title;
  document.getElementById("year-question-help").textContent = step.help;
  const inputEl = document.getElementById("year-question-input");
  inputEl.innerHTML = "";

  let node;
  if (step.type === "ychoice") node = yearRenderChoiceStep(step);
  else if (step.type === "ycompound") node = yearRenderCompoundStep(step);
  else if (step.type === "ydate") node = yearRenderDateStep();
  else node = yearRenderNumberStep(step);
  inputEl.appendChild(node);

  const prevBtn = document.getElementById("year-prev-btn");
  const nextBtn = document.getElementById("year-next-btn");
  prevBtn.disabled = false;
  nextBtn.textContent = yearState.currentStep === activeSteps.length - 1 ? "결과 보기" : "다음";
  yearUpdateProgress();
}

function yearUpdateProgress() {
  const activeSteps = yearGetActiveSteps();
  const step = activeSteps[yearState.currentStep];
  renderPhaseBar(document.getElementById("year-phase-steps"), step ? phaseOf(step.key) : 0);
}

function yearCurrentStepIsValid() {
  const step = yearGetActiveSteps()[yearState.currentStep];
  if (step.type === "ynumber") {
    const v = yearState.answers[step.key];
    return v !== "" && !Number.isNaN(Number(v));
  }
  if (step.type === "ydate") {
    if (!yearState.answers.yPermitDate) return false;
    const pd = yPermitDateInt();
    if (yearState.answers.yEraChoice === "before2004") {
      return pd >= YD.D19811106 && pd < YD.D20040530;
    }
    return pd >= YD.D20040530;
  }
  return true;
}

function yearScrollToTop() {
  const el = document.querySelector("#screen-explorer-year .scroll-content");
  if (el) el.scrollTop = 0;
}

function showYearResultWithLoading() {
  showIlguLoading(() => {
    document.getElementById("year-question-card").classList.add("hidden");
    document.getElementById("year-result-card").classList.remove("hidden");
    document.getElementById("year-multiuse-safety-card").classList.add("hidden");
    // 결과 화면에서도 단계바 유지하고 ④결과 점등
    renderPhaseBar(document.getElementById("year-phase-steps"), 3);
    yearScrollToTop();
  });
}

function yearMoveStep(direction) {
  if (direction > 0 && !yearCurrentStepIsValid()) {
    const step = yearGetActiveSteps()[yearState.currentStep];
    if (step.type === "ydate") {
      if (yearState.answers.yEraChoice === "before2004") {
        showToast("1981년 11월 6일 ~ 2004년 5월 29일 사이의 허가일을 입력해 주세요.");
      } else {
        showToast("2004년 5월 30일 이후의 허가일을 입력해 주세요.");
      }
    } else {
      showToast("현재 질문의 값을 먼저 입력해 주세요.");
    }
    return;
  }

  const activeSteps = yearGetActiveSteps();
  yearState.currentStep = Math.max(0, Math.min(yearState.currentStep + direction, activeSteps.length - 1));
  yearRenderCurrentStep();
  yearScrollToTop();
}

function yearNormalizeAnswers() {
  const ya = yearState.answers;
  const pd = yPermitDateInt();
  const bf = parseInt(ya.yBasementFloors) || 0;
  const ba = parseFloat(ya.yBasementAreaSum) || 0;
  const wlArea = parseFloat(ya.yWindowlessArea) || 0;
  return {
    pd,
    permitDateInt: pd,
    eraChoice: ya.yEraChoice,
    occupancyType: ya.yOccupancyType,
    totalArea: parseFloat(ya.yTotalArea) || 0,
    aboveGroundFloors: parseInt(ya.yAboveGroundFloors) || 0,
    basementFloors: bf,
    basementAreaSum: ba,
    hasWindowlessFloor: ya.yHasWindowlessFloor === "yes",
    windowlessArea: wlArea,
    hasLargeTargetFloor: ya.yHasLargeTargetFloor === "yes",
    hasLargeFloorFor1000: ya.yHasLargeFloorFor1000 === "yes",
    before2004FacilitySubtype: ya.yBefore2004FacilitySubtype || "general",
    before2004HasLargeFloor450: ya.yBefore2004HasLargeFloor450 === "yes",
    before2004SprinklerFloor: ya.yBefore2004SprinklerFloor === "yes",
    before2004HasDetFloor300: ya.yBefore2004HasDetFloor300 === "yes",
    before2004LargeFloor1000: ya.yBefore2004LargeFloor1000 === "yes",
    neighborhoodArea: parseFloat(ya.yNeighborhoodArea) || 0,
    facilitySubtype: ya.yFacilitySubtype,
    isPostpartum: ya.yIsPostpartum === "yes",
    postpartumAreaRange: ya.yPostpartumAreaRange,
    isClinicWithInpatient: ya.yIsClinicWithInpatient === "yes",
    hasHemodialysis: ya.yHasHemodialysis === "yes",
    has24HourStaff: ya.yHas24HourStaff === "yes",
    firstSecondFloorArea: parseFloat(ya.yFirstSecondFloorArea) || 0,
    indoorParkingArea: parseFloat(ya.yIndoorParkingArea) || 0,
    mechanicalParkingCapacity: parseInt(ya.yMechanicalParkingCapacity) || 0,
    electricalRoomArea: parseFloat(ya.yElectricalRoomArea) || 0,
    smokeControlArea: parseFloat(ya.ySmokeControlArea) || 0,
    hasSmallUndergroundParking: ya.yHasSmallUndergroundParking === "yes",
    // 근린생활시설 다중이용업소
    hasMultiuseBusiness: ya.yHasMultiuseBusiness === "yes",
    multiuseInBasement: ya.yMultiuseInBasement === "yes",
    multiuseIsSealed: ya.yMultiuseIsSealed === "yes",
    multiuseIsPostpartum: ya.yMultiuseIsPostpartum === "yes",
    multiuseIsGosiwon: ya.yMultiuseIsGosiwon === "yes",
    multiuseIsGunRange: ya.yMultiuseIsGunRange === "yes",
    multiuseOnSecondToTenthFloor: ya.yMultiuseOnSecondToTenthFloor === "yes",
    multiuseOnGroundOrRefugeFloor: ya.yMultiuseOnGroundOrRefugeFloor === "yes",
    multiuseUsesAV: ya.yMultiuseUsesAV === "yes",
    multiuseHasGasFacility: ya.yMultiuseHasGasFacility === "yes",
    multiuseHasRooms: ya.yMultiuseHasRooms === "yes",
    multiuseHasEvacuationRoute: ya.yMultiuseHasEvacuationRoute === "yes",
    basementAvg: bf > 0 ? ba / bf : 0,
    totalFloors: (parseInt(ya.yAboveGroundFloors) || 0) + bf,
    // 숙박시설 전용
    lodgingArea: parseFloat(ya.yLodgingArea) || 0,
    lodgingIsLiving: ya.yLodgingIsLiving === "yes",
    lodgingIsTouristHotel: ya.yLodgingIsTouristHotel === "yes",
    lodgingHasLargeFloorFor1000: ya.yLodgingHasLargeFloorFor1000 === "yes",
    lodgingHasGasFacility: ya.yLodgingHasGasFacility === "yes",
    lodgingFirstSecondFloorArea: parseFloat(ya.yLodgingFirstSecondFloorArea) || 0,
    lodgingIndoorParkingArea: parseFloat(ya.yLodgingIndoorParkingArea) || 0,
    lodgingMechanicalParkingCapacity: parseInt(ya.yLodgingMechanicalParkingCapacity) || 0,
    lodgingElectricalRoomArea: parseFloat(ya.yLodgingElectricalRoomArea) || 0,
    lodgingBasementAreaForSmoke: parseFloat(ya.yLodgingBasementAreaForSmoke) || 0,
    // 숙박시설 다중이용업소
    lodgingHasMultiuseBusiness: ya.yLodgingHasMultiuseBusiness === "yes",
    lodgingMultiuseInBasement: ya.yLodgingMultiuseInBasement === "yes",
    lodgingMultiuseIsSealed: ya.yLodgingMultiuseIsSealed === "yes",
    lodgingMultiuseIsPostpartum: ya.yLodgingMultiuseIsPostpartum === "yes",
    lodgingMultiuseIsGosiwon: ya.yLodgingMultiuseIsGosiwon === "yes",
    lodgingMultiuseIsGunRange: ya.yLodgingMultiuseIsGunRange === "yes",
    lodgingMultiuseOnSecondToTenthFloor: ya.yLodgingMultiuseOnSecondToTenthFloor === "yes",
    lodgingMultiuseOnGroundOrRefugeFloor: ya.yLodgingMultiuseOnGroundOrRefugeFloor === "yes",
    lodgingMultiuseUsesAV: ya.yLodgingMultiuseUsesAV === "yes",
    lodgingMultiuseHasGasFacility: ya.yLodgingMultiuseHasGasFacility === "yes",
    lodgingMultiuseHasRooms: ya.yLodgingMultiuseHasRooms === "yes",
    lodgingMultiuseHasEvacuationRoute: ya.yLodgingMultiuseHasEvacuationRoute === "yes",
    // 노유자시설 전용
    elderlySubtype: ya.yElderlySubtype,
    elderlyArea: parseFloat(ya.yElderlyArea) || 0,
    elderlyHasLargeTargetFloor: ya.yElderlyHasLargeTargetFloor === "yes",
    elderlyHasGrillWindow: ya.yElderlyHasGrillWindow === "yes",
    elderlyHasGasFacility: ya.yElderlyHasGasFacility === "yes",
    elderlyHasFloor500Plus: ya.yElderlyHasFloor500Plus === "yes",
    elderlyHas24HourStaff: ya.yElderlyHas24HourStaff === "yes",
    elderlyFirstSecondFloorArea: parseFloat(ya.yElderlyFirstSecondFloorArea) || 0,
    elderlyIndoorParkingArea: parseFloat(ya.yElderlyIndoorParkingArea) || 0,
    elderlyMechanicalParkingCapacity: parseInt(ya.yElderlyMechanicalParkingCapacity) || 0,
    elderlyElectricalRoomArea: parseFloat(ya.yElderlyElectricalRoomArea) || 0,
    elderlyBasementAreaForSmoke: parseFloat(ya.yElderlyBasementAreaForSmoke) || 0,
    elderlyHasSmallUndergroundParking: ya.yElderlyHasSmallUndergroundParking === "yes",
    // 의료시설 전용
    medicalSubtype: ya.yMedicalSubtype,
    medicalArea: parseFloat(ya.yMedicalArea) || 0,
    medicalHasLargeTargetFloor: ya.yMedicalHasLargeTargetFloor === "yes",
    medicalHasGrillWindow: ya.yMedicalHasGrillWindow === "yes",
    medicalHasGasFacility: ya.yMedicalHasGasFacility === "yes",
    medicalHasFloor500Plus: ya.yMedicalHasFloor500Plus === "yes",
    medicalFirstSecondFloorArea: parseFloat(ya.yMedicalFirstSecondFloorArea) || 0,
    medicalIndoorParkingArea: parseFloat(ya.yMedicalIndoorParkingArea) || 0,
    medicalMechanicalParkingCapacity: parseInt(ya.yMedicalMechanicalParkingCapacity) || 0,
    medicalElectricalRoomArea: parseFloat(ya.yMedicalElectricalRoomArea) || 0,
    medicalBasementAreaForSmoke: parseFloat(ya.yMedicalBasementAreaForSmoke) || 0,
    // 분법 이전 숙박시설 전용
    before2004LodgingIsTouristHotel: ya.yBefore2004LodgingIsTouristHotel === "yes",
    before2004LodgingHasLargeFloor450: ya.yBefore2004LodgingHasLargeFloor450 === "yes",
    before2004LodgingSprinklerFloor: ya.yBefore2004LodgingSprinklerFloor === "yes",
    before2004LodgingAutoDetFloor300: ya.yBefore2004LodgingAutoDetFloor300 === "yes",
    before2004LodgingHasLargeFloor300: ya.yBefore2004LodgingHasLargeFloor300 === "yes",
    before2004LodgingHasLargeFloor1000: ya.yBefore2004LodgingHasLargeFloor1000 === "yes",
    before2004LodgingHasFloor1500: ya.yBefore2004LodgingHasFloor1500 === "yes",
    before2004LodgingElectricalRoomArea: parseFloat(ya.yBefore2004LodgingElectricalRoomArea) || 0,
    before2004LodgingIndoorParkingArea: parseFloat(ya.yBefore2004LodgingIndoorParkingArea) || 0,
    before2004LodgingMechanicalParkingCapacity: parseInt(ya.yBefore2004LodgingMechanicalParkingCapacity) || 0,
    // 분법 이전 의료시설 전용
    before2004MedicalSubtype: ya.yBefore2004MedicalSubtype || "hospital",
    before2004MedicalHasLargeFloor450: ya.yBefore2004MedicalHasLargeFloor450 === "yes",
    before2004MedicalHasLargeFloor300: ya.yBefore2004MedicalHasLargeFloor300 === "yes",
    before2004MedicalSprinklerFloor: ya.yBefore2004MedicalSprinklerFloor === "yes",
    before2004MedicalAutoDetFloor300: ya.yBefore2004MedicalAutoDetFloor300 === "yes",
    before2004MedicalHasLargeFloor1000: ya.yBefore2004MedicalHasLargeFloor1000 === "yes",
    before2004MedicalHasFloor1500: ya.yBefore2004MedicalHasFloor1500 === "yes",
    before2004MedicalElectricalRoomArea: parseFloat(ya.yBefore2004MedicalElectricalRoomArea) || 0,
    before2004MedicalIndoorParkingArea: parseFloat(ya.yBefore2004MedicalIndoorParkingArea) || 0,
    before2004MedicalMechanicalParkingCapacity: parseInt(ya.yBefore2004MedicalMechanicalParkingCapacity) || 0,
    // 분법 이전 노유자시설 전용
    before2004ElderlyHasLargeFloor450: ya.yBefore2004ElderlyHasLargeFloor450 === "yes",
    before2004ElderlyHasLargeFloor300: ya.yBefore2004ElderlyHasLargeFloor300 === "yes",
    before2004ElderlySprinklerFloor: ya.yBefore2004ElderlySprinklerFloor === "yes",
    before2004ElderlyLargeFloor1000: ya.yBefore2004ElderlyLargeFloor1000 === "yes",
    before2004ElderlyHasFloor500Plus: ya.yBefore2004ElderlyHasFloor500Plus === "yes",
    before2004ElderlyAutoDetFloor300: ya.yBefore2004ElderlyAutoDetFloor300 === "yes",
    before2004ElderlyElectricalRoomArea: parseFloat(ya.yBefore2004ElderlyElectricalRoomArea) || 0,
    before2004ElderlyIndoorParkingArea: parseFloat(ya.yBefore2004ElderlyIndoorParkingArea) || 0,
    before2004ElderlyMechanicalParkingCapacity: parseInt(ya.yBefore2004ElderlyMechanicalParkingCapacity) || 0,
    // 분법 이전 종교시설 전용
    before2004ReligiousHasLargeFloor600: ya.yBefore2004ReligiousHasLargeFloor600 === "yes",
    before2004ReligiousElectricalRoomArea: parseFloat(ya.yBefore2004ReligiousElectricalRoomArea) || 0,
    before2004ReligiousIndoorParkingArea: parseFloat(ya.yBefore2004ReligiousIndoorParkingArea) || 0,
    before2004ReligiousMechanicalParkingCapacity: parseInt(ya.yBefore2004ReligiousMechanicalParkingCapacity) || 0,
    // 종교시설 전용
    religiousHasLargeTargetFloor: ya.yReligiousHasLargeTargetFloor === "yes",
    religiousFirstSecondFloorArea: parseFloat(ya.yReligiousFirstSecondFloorArea) || 0,
    religiousIndoorParkingArea: parseFloat(ya.yReligiousIndoorParkingArea) || 0,
    religiousMechanicalParkingCapacity: parseInt(ya.yReligiousMechanicalParkingCapacity) || 0,
    religiousElectricalRoomArea: parseFloat(ya.yReligiousElectricalRoomArea) || 0,
    religiousOccupancy100Plus: ya.yReligiousOccupancy100Plus === "yes",
    religiousIsWoodStructure: ya.yReligiousIsWoodStructure === "yes",
    religiousIsSacrificialBuilding: ya.yReligiousIsSacrificialBuilding === "yes",
    religiousHasStage: ya.yReligiousHasStage === "yes",
    religiousStageArea: parseFloat(ya.yReligiousStageArea) || 0,
    religiousHasGasFacility: ya.yReligiousHasGasFacility === "yes",
    // 판매시설 전용
    salesArea: parseFloat(ya.ySalesArea) || 0,
    salesHasLargeTargetFloor: ya.ySalesHasLargeTargetFloor === "yes",
    salesFirstSecondFloorArea: parseFloat(ya.ySalesFirstSecondFloorArea) || 0,
    salesIndoorParkingArea: parseFloat(ya.ySalesIndoorParkingArea) || 0,
    salesUndergroundParkingArea: parseFloat(ya.ySalesUndergroundParkingArea) || 0,
    salesMechanicalParkingCapacity: parseInt(ya.ySalesMechanicalParkingCapacity) || 0,
    salesElectricalRoomArea: parseFloat(ya.ySalesElectricalRoomArea) || 0,
    salesOccupancy500Plus: ya.ySalesOccupancy500Plus === "yes",
    salesOccupancy100Plus: ya.ySalesIsLargeStore === "yes",
    salesIsTraditionalMarket: ya.ySalesIsTraditionalMarket === "yes",
    salesIsLargeStore: ya.ySalesIsLargeStore === "yes",
    salesHasRestaurantKitchen: ya.ySalesHasRestaurantKitchen === "yes",
    salesHas24HourStaff: ya.ySalesHas24HourStaff === "yes",
    salesHasGasFacility: ya.ySalesHasGasFacility === "yes",
    // 분법 이전 판매시설(구 「시장」) 전용
    before2004SalesArea: parseFloat(ya.yBefore2004SalesArea) || 0,
    before2004SalesHasLargeFloor450: ya.yBefore2004SalesHasLargeFloor450 === "yes",
    before2004SalesHasLargeFloor300: ya.yBefore2004SalesHasLargeFloor300 === "yes",
    before2004SalesSprinklerFloor: ya.yBefore2004SalesSprinklerFloor === "yes",
    before2004SalesLargeFloor1000: ya.yBefore2004SalesLargeFloor1000 === "yes",
    before2004SalesAutoDetFloor600: ya.yBefore2004SalesAutoDetFloor600 === "yes",
    before2004SalesHasFloor1500: ya.yBefore2004SalesHasFloor1500 === "yes",
    // 공동주택 전용 (분법 이후)
    apartmentSubtype: ya.yApartmentSubtype || "apt",
    aptBuildingCount: Math.max(parseInt(ya.yAptBuildingCount) || 1, 1),
    aptHouseholdCount: parseInt(ya.yAptHouseholdCount) || 0,
    aptHasFloor600: ya.yAptHasFloor600 === "yes",
    aptHasFloor1000: ya.yAptHasFloor1000 === "yes",
    aptFirstSecondFloorArea: parseFloat(ya.yAptFirstSecondFloorArea) || 0,
    aptHouseholdsUnder50: ya.yAptHouseholds === "yes",
    aptIsNationalHousing: ya.yAptIsNationalHousing === "yes",
    aptIsGatBokdo: ya.yAptIsGatBokdo === "yes",
    aptHasCO2System: ya.yAptHasCO2System === "yes",
    aptIndoorParkingArea: parseFloat(ya.yAptIndoorParkingArea) || 0,
    aptMechanicalParkingCapacity: parseInt(ya.yAptMechanicalParkingCapacity) || 0,
    aptElectricalRoomArea: parseFloat(ya.yAptElectricalRoomArea) || 0,
    aptUndergroundParkingArea: parseFloat(ya.yAptUndergroundParkingArea) || parseFloat(ya.yAptParkingBasementArea) || 0,
    aptHasSpecialStair: ya.yAptHasSpecialStair === "yes",
    // 공동주택 전용 (분법 이전)
    before2004AptHouseholds: parseInt(ya.yBefore2004AptHouseholds) || 0,
    before2004AptCorridorType: ya.yBefore2004AptCorridorType || "none",
    aptHasParkingBuilding: ya.yAptHasParkingBuilding === "yes",
    aptParkingArea: parseFloat(ya.yAptParkingArea) || 0,
    aptParkingAbove: parseInt(ya.yAptParkingAbove) || 0,
    aptParkingBelow: parseInt(ya.yAptParkingBelow) || 0,
    aptParkingBasementArea: parseFloat(ya.yAptParkingBasementArea) || 0,
    before2004AptHasLargeFloor450: ya.yBefore2004AptHasLargeFloor450 === "yes",
    before2004AptHasLargeFloor600: ya.yBefore2004AptHasLargeFloor600 === "yes",
    before2004AptDetFloor600: ya.yBefore2004AptDetFloor600 === "yes",
  };
}

function yearEvaluateLodgingBefore2004(inp) {
  const results = [];
  const { pd } = inp;
  const ta  = inp.totalArea;
  const ag  = inp.aboveGroundFloors;
  const bf  = inp.basementFloors;
  const ba  = inp.basementAreaSum;
  const tf  = ag + bf;
  const wl  = inp.windowlessArea;
  const bsmtAvg = bf > 0 ? ba / bf : 0;

  const hasBasement = bf > 0;
  const hasWL       = inp.hasWindowlessFloor;

  const pre1984       = pd < YD.D19840701;
  const preBefore1992 = pd < YD.D19920728;
  const pre1991       = pd < YD.D19910108;
  const pre1994       = pd < YD.D19940720;
  const pre2001       = pd < YD.D20010521;
  const pre2002       = pd < YD.D20020330;

  const elecArea    = inp.before2004LodgingElectricalRoomArea;
  const parkingArea = inp.before2004LodgingIndoorParkingArea;
  const mechParking = inp.before2004LodgingMechanicalParkingCapacity;
  const isTouristHotel = inp.before2004LodgingIsTouristHotel;
  const f12 = inp.lodgingFirstSecondFloorArea;

  // ── 소화기구 ──
  let extReq, extReason;
  if (preBefore1992) {
    extReq = ta >= 150;
    extReason = extReq
      ? "여관·호텔·여인숙(제1종 장소)으로서 연면적 150㎡ 이상입니다."
      : "연면적 150㎡ 미만이어서 설치 대상이 아닙니다. 다만 지하층·무창층·3층 이상 층 중 바닥면적 50㎡ 이상인 층이 있으면 설치 대상입니다.";
  } else {
    extReq = ta >= 33;
    extReason = extReq ? "연면적 33㎡ 이상입니다." : "연면적 33㎡ 미만이어서 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.extinguishing, "소화기구", "", extReq ? "required" : "notRequired", extReason, ""));

  // ── 옥내소화전설비 ──
  let hydrantReq, hydrantReason;
  if (preBefore1992) {
    hydrantReq = ta >= 2100 || inp.before2004LodgingHasLargeFloor450;
    hydrantReason = ta >= 2100
      ? "연면적 2,100㎡ 이상입니다."
      : inp.before2004LodgingHasLargeFloor450
        ? (pre1984
            ? "지하층·무창층·4층 이상 층 중 바닥면적 450㎡ 이상인 층이 있어 해당 층에 설치합니다."
            : "지하층·무창층·4층 이상 층 중 바닥면적 450㎡ 이상인 층이 있어 건물 전 층에 설치합니다.")
        : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    hydrantReq = ta >= 1500 || inp.before2004LodgingHasLargeFloor300;
    hydrantReason = ta >= 1500
      ? "숙박시설 연면적 1,500㎡ 이상입니다."
      : inp.before2004LodgingHasLargeFloor300
        ? (pre1994
            ? "지하층·무창층·지하층을 제외한 4층 이상 층 중 바닥면적 300㎡ 이상인 층이 있어 전 층에 설치합니다."
            : "지하층·무창층·4층 이상 층 중 바닥면적 300㎡ 이상인 층이 있어 전 층에 설치합니다.")
        : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.extinguishing, "옥내소화전설비", "", hydrantReq ? "required" : "notRequired", hydrantReason, ""));

  // ── 스프링클러설비 ──
  let sprinklerReq, sprinklerReason;
  if (preBefore1992) {
    sprinklerReq = ag >= 11 || inp.before2004LodgingSprinklerFloor;
    if (ag >= 11) {
      sprinklerReason = pre1984
        ? "층수가 11층 이상인 여관·호텔·여인숙으로서 해당 부분에 스프링클러를 설치합니다."
        : "층수가 11층 이상인 숙박시설로서 건물 전 층에 스프링클러를 설치합니다.";
    } else if (inp.before2004LodgingSprinklerFloor) {
      const threshold = pre1984 ? "1,500" : "1,000";
      sprinklerReason = `4층 이상 10층 이하의 층 중 바닥면적 ${threshold}㎡ 이상인 층이 있어 해당 층에 설치합니다.`;
    } else {
      sprinklerReason = "현재 입력 기준으로는 설치 대상이 아닙니다.";
    }
  } else {
    sprinklerReq = ag >= 11 || inp.before2004LodgingHasLargeFloor1000;
    sprinklerReason = ag >= 11
      ? "층수가 11층 이상인 숙박시설로서 전 층에 스프링클러를 설치합니다."
      : inp.before2004LodgingHasLargeFloor1000
        ? "지하층·무창층·4층 이상 층 중 바닥면적 1,000㎡ 이상인 층이 있어 전 층에 설치합니다."
        : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.extinguishing, "스프링클러설비", "", sprinklerReq ? "required" : "notRequired", sprinklerReason, ""));

  // ── 간이스프링클러설비 ──
  if (pre2001) {
    results.push(makeResult(categories.extinguishing, "간이스프링클러설비", "", "notRequired",
      "해당 시행 시기에는 간이스프링클러설비 규정이 없었습니다.", ""));
  } else {
    results.push(makeResult(categories.extinguishing, "간이스프링클러설비", "", "notRequired",
      "분법 이전 시기에는 숙박시설 자체에 대한 간이스프링클러설비 설치 의무가 없었습니다. (다중이용업소 지하층 150㎡ 이상 시 별도 확인)", ""));
  }

  // ── 물분무등소화설비 ──
  let waterSprayReq, waterSprayReason;
  if (preBefore1992) {
    if (pre1984) {
      waterSprayReq = elecArea >= 300;
      waterSprayReason = waterSprayReq
        ? "건물 내 발전실·변전실 바닥면적이 300㎡ 이상입니다."
        : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    } else {
      waterSprayReq = elecArea >= 300;
      waterSprayReason = waterSprayReq
        ? "건물 내 전기실·통신기기실·전산기기실 바닥면적이 300㎡ 이상입니다."
        : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    }
  } else {
    waterSprayReq = parkingArea >= 200 || mechParking >= 20 || elecArea >= 300;
    waterSprayReason = buildWaterSprayReason(0, parkingArea, mechParking, elecArea);
  }
  results.push(makeResult(categories.extinguishing, "물분무등소화설비", "", waterSprayReq ? "required" : "notRequired", waterSprayReason, ""));

  // ── 옥외소화전설비 ──
  results.push(makeResult(categories.extinguishing, "옥외소화전설비", "",
    f12 >= 9000 ? "required" : "notRequired",
    f12 >= 9000 ? "지상 1층과 2층의 바닥면적 합계가 9,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 비상경보설비 ──
  if (pre1991) {
    results.push(makeResult(categories.alarm, "비상경보설비", "", "review",
      "1991년 1월 8일 이전에는 수용인원 기준으로, 여관·호텔·여인숙은 수용인원 40인 이상일 때 비상벨 또는 자동식싸이렌을 설치합니다. 수용인원을 직접 확인하세요.", ""));
  } else {
    const emergAlarmReq = ta >= 400 || (hasBasement && ba >= 150) || (hasWL && wl >= 150);
    const emergAlarmReason = ta >= 400 ? "연면적이 400㎡ 이상입니다." :
      (hasBasement && ba >= 150) ? "지하층 바닥면적 합계가 150㎡ 이상입니다." :
      (hasWL && wl >= 150) ? "무창층 바닥면적이 150㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.alarm, "비상경보설비", "", emergAlarmReq ? "required" : "notRequired", emergAlarmReason, ""));
  }

  // ── 비상방송설비 ──
  let broadcastReq, broadcastReason;
  if (pre1991) {
    broadcastReq = ag >= 11 || bf >= 3;
    broadcastReason = ag >= 11 ? "지상층수가 11층 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다. (수용인원 300인 이상인 경우도 설치 대상이나 면적만으로 확정이 어렵습니다.)";
  } else if (pre1994) {
    broadcastReq = ta >= 3500 || ag >= 11 || bf >= 3;
    broadcastReason = ta >= 3500 ? "연면적이 3,500㎡ 이상입니다." :
      ag >= 11 ? "지상층수가 11층 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    broadcastReq = ta >= 3500 || tf >= 11 || bf >= 3;
    broadcastReason = ta >= 3500 ? "연면적이 3,500㎡ 이상입니다." :
      tf >= 11 ? "전체 층수가 11층 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.alarm, "비상방송설비", "", broadcastReq ? "required" : "notRequired", broadcastReason, ""));

  // ── 자동화재탐지설비 ──
  let autoDetReq, autoDetReason;
  if (preBefore1992) {
    autoDetReq = ta >= 600 || inp.before2004LodgingAutoDetFloor300;
    if (ta >= 600) {
      autoDetReason = "연면적 600㎡ 이상인 숙박시설(제1종 장소)입니다.";
    } else if (inp.before2004LodgingAutoDetFloor300) {
      autoDetReason = pre1984
        ? "지하층·무창층·3층 이상 층 중 바닥면적 300㎡ 이상인 층이 있어 해당 층에 설치합니다."
        : "지하층·무창층·3층 이상 층 중 바닥면적 300㎡ 이상인 층이 있어 전 층에 설치합니다.";
    } else {
      autoDetReason = "현재 입력 기준으로는 설치 대상이 아닙니다.";
    }
  } else {
    autoDetReq = ta >= 600;
    autoDetReason = autoDetReq ? "숙박시설 연면적 600㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.alarm, "자동화재탐지설비", "", autoDetReq ? "required" : "notRequired", autoDetReason, ""));

  // ── 자동화재속보설비 ──
  let autoDispatchReq, autoDispatchReason;
  if (preBefore1992) {
    autoDispatchReq = ta >= 1500;
    autoDispatchReason = autoDispatchReq
      ? "연면적 1,500㎡ 이상인 여관·호텔·여인숙으로 설치 대상입니다."
      : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    autoDispatchReq = inp.before2004LodgingHasFloor1500;
    autoDispatchReason = autoDispatchReq
      ? "건물 내 바닥면적이 1,500㎡ 이상인 층이 있어 설치 대상입니다."
      : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.alarm, "자동화재속보설비", "", autoDispatchReq ? "required" : "notRequired", autoDispatchReason, ""));

  // ── 피난기구 ──
  if (pd >= YD.D19840816) {
    results.push(makeResult(categories.evacuation, "피난기구(복도 등)", "",
      ag >= 3 ? "required" : "notRequired",
      ag >= 3 ? "지상 3층~10층에 완강기등의 피난기구를 설치해야 합니다. 양방향 피난이 가능한 경우 제외 가능합니다."
      : "3층 이상 층이 없어 설치 대상이 아닙니다.", ""));

    results.push(makeResult(categories.evacuation, "간이완강기(객실 내부)", "",
      ag >= 3 ? "required" : "notRequired",
      ag >= 3 ? "3층 이상 각 객실마다 간이완강기를 설치해야 합니다. 양방향 피난이 가능해도 제외되지 않습니다."
      : "3층 이상 층이 없어 설치 대상이 아닙니다.", ""));
  } else if (preBefore1992) {
    const hasEligibleFloor = ag >= 3 || bf > 0;
    results.push(makeResult(categories.evacuation, "피난기구", "", hasEligibleFloor ? "required" : "review",
      "1992년 7월 28일 이전에는 수용인원 30인 이상인 숙박시설에서 피난층·2층·11층 이상의 층을 제외한 나머지 층에 설치합니다. (건축법상 특별피난계단이 없는 호텔·여관은 11층 이상에도 설치) 설치 여부는 수용인원 기준으로 판단하므로 실제 충족 여부는 소방법 시행규칙 [별표1] 수용인원산정법에 따라 직접 확인하세요.", ""));
  } else {
    const evacReq = ag >= 3 || bf > 0;
    const evacReason = evacReq
      ? (pre1994
          ? "숙박시설은 피난층·2층·지하층을 제외한 층수가 11층 이상인 층을 제외한 모든 층에 피난기구를 설치합니다."
          : "숙박시설은 피난층·2층·11층 이상의 층을 제외한 모든 층에 피난기구를 설치합니다.")
      : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.evacuation, "피난기구", "", evacReq ? "required" : "notRequired", evacReason, ""));
  }

  // ── 인명구조기구 ──
  if (isTouristHotel) {
    if (preBefore1992) {
      results.push(makeResult(categories.evacuation, "인명구조기구", "", "review",
        "관광호텔로서 지하층을 제외한 층수가 7층 이상이고 수용인원 200인 이상인 경우 방열복·공기호흡기 등을 설치해야 합니다. 수용인원을 직접 확인하세요.", ""));
    } else if (pre1994) {
      const rescueReq = ag >= 7;
      results.push(makeResult(categories.evacuation, "인명구조기구", "", rescueReq ? "review" : "notRequired",
        rescueReq
          ? "관광호텔로서 지하층을 제외한 층수가 7층 이상이고 수용인원 200인 이상인 경우 방열복·공기호흡기 등을 설치해야 합니다. 수용인원을 직접 확인하세요."
          : "지상층수가 7층 미만으로 설치 대상이 아닙니다.", ""));
    } else {
      const rescueReq = tf >= 7;
      results.push(makeResult(categories.evacuation, "인명구조기구", "", rescueReq ? "required" : "notRequired",
        rescueReq
          ? "관광호텔로서 층수(지하 포함)가 7층 이상으로 방열복·공기호흡기 등을 설치해야 합니다."
          : "전체 층수가 7층 미만으로 설치 대상이 아닙니다.", ""));
    }
  } else {
    results.push(makeResult(categories.evacuation, "인명구조기구", "", "notRequired",
      "일반 숙박시설(관광호텔 아님)은 인명구조기구 설치 대상이 아닙니다.", ""));
  }

  // ── 유도등 및 유도표지 ──
  if (pre1984) {
    if (hasBasement || hasWL || ag >= 11) {
      results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "required",
        "지하층·무창층 또는 11층 이상의 층에 피난구·통로유도등을 설치하고, 나머지 층에는 유도표지를 설치합니다.", ""));
    } else {
      results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "required",
        "기본적으로 유도표지를 설치하며, 지하층·무창층 또는 11층 이상의 층에는 피난구·통로유도등을 설치합니다.", ""));
    }
  } else if (preBefore1992) {
    results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "required",
      "숙박시설의 규모(호텔=대형, 여관·기숙사=중형, 여인숙=소형)에 따른 피난구유도등·통로유도등을 건물 전 층에 설치합니다.", ""));
  } else {
    results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "required",
      "모든 숙박시설에 피난구유도등, 통로유도등, 유도표지를 설치합니다.", ""));
  }

  // ── 비상조명등 ──
  if (pd < YD.D19840701) {
    results.push(makeResult(categories.evacuation, "비상조명등", "", "notRequired",
      "1984년 7월 이전에는 비상조명등 규정이 없었습니다.", ""));
  } else {
    const bsmtAvg450 = hasBasement && bsmtAvg >= 450;
    const wlss450    = hasWL && wl >= 450;
    const emLightReq = (tf >= 5 && ta >= 3000) || bsmtAvg450 || wlss450;
    const emLightReason = tf >= 5 && ta >= 3000
      ? "전체 층수가 5층 이상이고 연면적이 3,000㎡ 이상입니다."
      : bsmtAvg450 ? "지하층 바닥면적이 450㎡ 이상입니다."
      : wlss450    ? "무창층 바닥면적이 450㎡ 이상입니다."
      : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.evacuation, "비상조명등", "", emLightReq ? "required" : "notRequired", emLightReason, ""));
  }

  // ── 휴대용 비상조명등 ──
  if (pre2002) {
    results.push(makeResult(categories.evacuation, "휴대용 비상조명등", "", "notRequired",
      "2002년 3월 30일 이전에는 휴대용 비상조명등 규정이 없었습니다.", ""));
  } else {
    results.push(makeResult(categories.evacuation, "휴대용 비상조명등", "", "required",
      "숙박시설(오피스텔 제외)은 2002년 3월 30일 이후부터 휴대용 비상조명등 의무 설치 대상입니다.", ""));
  }

  // ── 상수도소화용수설비 ──
  if (preBefore1992) {
    results.push(makeResult(categories.waterSupply, "상수도소화용수설비", "", "notRequired",
      "1992년 7월 28일 이전에는 상수도소화용수설비 기준이 없었습니다.", ""));
  } else {
    const waterSupplyReq = ta >= 5000;
    results.push(makeResult(categories.waterSupply, "상수도소화용수설비", "",
      waterSupplyReq ? "required" : "notRequired",
      waterSupplyReq ? "연면적이 5,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  }

  // ── 소화수조 및 저수지 ──
  let waterTankReq, waterTankReason;
  if (preBefore1992) {
    waterTankReq = false;
    waterTankReason = "1992년 이전에는 대지 20,000㎡ 이상이고 1·2층 합계 15,000㎡ 이상인 초대형 건물에만 적용합니다. 해당 시 별도 확인이 필요합니다.";
  } else {
    waterTankReq = ag >= 11;
    waterTankReason = ag >= 11
      ? "층수가 11층 이상이거나 연면적이 매우 큰 경우 소화수조를 설치해야 합니다. 상세 기준을 확인하세요."
      : "현재 입력 기준으로는 설치 대상이 아닙니다. (1·2층 합계 15,000㎡ 이상인 경우 해당)";
  }
  results.push(makeResult(categories.waterSupply, "소화수조 및 저수지", "", waterTankReq ? "review" : "notRequired", waterTankReason, ""));

  // ── 제연설비 ──
  if (pd < YD.D19820928) {
    results.push(makeResult(categories.fireSupport, "제연설비", "", "notRequired",
      "1982년 9월 28일 이전에는 배연설비(현 제연설비) 규정이 없었습니다.", ""));
  } else {
    const floorsAfter1992 = pd >= YD.D19920728 && ag >= 11;
    const smokeCtrlReq = (hasBasement && ba >= 1000) || (hasWL && wl >= 1000) || floorsAfter1992;
    const smokeCtrlReason = (hasBasement && ba >= 1000)
      ? "숙박시설의 지하층 바닥면적이 1,000㎡ 이상입니다."
      : (hasWL && wl >= 1000)
        ? "숙박시설의 무창층 바닥면적이 1,000㎡ 이상입니다."
        : floorsAfter1992
          ? "지상 11층 이상으로 특별피난계단에 제연설비를 설치해야 합니다."
          : "현재 입력 기준으로는 설치 대상이 아닙니다. (지하층 또는 무창층 바닥면적 1,000㎡ 이상 시 설치)";
    results.push(makeResult(categories.fireSupport, "제연설비", "", smokeCtrlReq ? "required" : "notRequired", smokeCtrlReason, ""));
  }

  // ── 연결송수관설비 ──
  let standpipeReq, standpipeReason;
  if (preBefore1992) {
    standpipeReq = ag >= 7 || (ag >= 5 && ta >= 6000);
    standpipeReason = ag >= 7 ? "지상층수가 7층 이상입니다." :
      (ag >= 5 && ta >= 6000) ? "지상층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (pre1994) {
    standpipeReq = ag >= 7 || (ag >= 5 && ta >= 6000) || bf >= 3;
    standpipeReason = ag >= 7 ? "지상층수가 7층 이상입니다." :
      (ag >= 5 && ta >= 6000) ? "지상층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    standpipeReq = tf >= 7 || (tf >= 5 && ta >= 6000) || (bf >= 3 && ba >= 1000);
    standpipeReason = tf >= 7 ? "전체 층수가 7층 이상입니다." :
      (tf >= 5 && ta >= 6000) ? "전체 층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다." :
      (bf >= 3 && ba >= 1000) ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.fireSupport, "연결송수관설비", "", standpipeReq ? "required" : "notRequired", standpipeReason, ""));

  // ── 연결살수설비 ──
  let connSprayReq, connSprayReason;
  if (pd < YD.D19900701) {
    connSprayReq = ba >= 700;
    connSprayReason = connSprayReq ? "지하층 바닥면적 합계가 700㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    connSprayReq = ba >= 150;
    connSprayReason = connSprayReq ? "지하층 바닥면적 합계가 150㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.fireSupport, "연결살수설비", "", connSprayReq ? "required" : "notRequired", connSprayReason, ""));

  // ── 비상콘센트설비 ──
  let emConsentReq, emConsentReason;
  if (preBefore1992) {
    emConsentReq = ag >= 11;
    emConsentReason = emConsentReq ? "지상층수가 11층 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (pre1994) {
    emConsentReq = ag >= 11 || bf >= 3;
    emConsentReason = ag >= 11 ? "지상층수가 11층 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    emConsentReq = ag >= 11 || (bf >= 3 && ba >= 1000);
    emConsentReason = ag >= 11 ? "지상층수가 11층 이상입니다." :
      (bf >= 3 && ba >= 1000) ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.fireSupport, "비상콘센트설비", "", emConsentReq ? "required" : "notRequired", emConsentReason, ""));

  // ── 무선통신보조설비 ──
  let radioReq, radioReason;
  if (preBefore1992) {
    radioReason = "1992년 7월 28일 이전에는 무선통신보조설비 기준이 일반 소방대상물에 적용되지 않았습니다.";
    results.push(makeResult(categories.fireSupport, "무선통신보조설비", "", "notRequired", radioReason, ""));
  } else if (pre1994) {
    radioReq = ba >= 3000 || bf >= 3;
    radioReason = ba >= 3000 ? "지하층 바닥면적 합계가 3,000㎡ 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.fireSupport, "무선통신보조설비", "", radioReq ? "required" : "notRequired", radioReason, ""));
  } else {
    radioReq = ba >= 3000 || (bf >= 3 && ba >= 1000);
    radioReason = ba >= 3000 ? "지하층 바닥면적 합계가 3,000㎡ 이상입니다." :
      (bf >= 3 && ba >= 1000) ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.fireSupport, "무선통신보조설비", "", radioReq ? "required" : "notRequired", radioReason, ""));
  }

  return results;
}

// 분법 이전(1981.11.6 ~ 2004.5.29) 공용 설치 제외·대체 안내 빌더
// - A 그룹(자동 제외): results에서 status를 notRequired로 바꿔 필요 목록·이유 목록에서 제거
// - B 그룹(검토 필요): results는 그대로 두고 검토 안내 카드만 추가
function buildBefore2004ExceptionItems(results, pd, options = {}) {
  // 스프링클러설비가 전층이 아니라 일부 층(예: 아파트 16층 이상)만 설치되는 경우,
  // 지하층 기준 연결살수설비를 SP로 면제할 수 없으므로 false로 전달
  const sprinklerSuppressesConnSpray = options.sprinklerSuppressesConnSpray !== false;
  const exceptionItems = [];
  const isReq = (name) => results.some((r) => r.name === name && r.status === "required");
  const autoExclude = (name, reason) => {
    const r = results.find((x) => x.name === name && x.status === "required");
    if (!r) return false;
    r.status = "notRequired";
    r.reason = reason;
    return true;
  };

  // ── A. 자동 제외 ──
  // A-1) 자동화재탐지설비 설치 → 비상경보설비 자동 제외 (1991.1.8 이전 수용인원 기준 검토(review) 상태 포함)
  const emergAlarmItem = results.find((r) => r.name === "비상경보설비" && (r.status === "required" || r.status === "review"));
  if (isReq("자동화재탐지설비") && emergAlarmItem) {
    emergAlarmItem.status = "notRequired";
    emergAlarmItem.reason = "자동화재탐지설비가 설치되어 비상경보설비(비상벨·자동식싸이렌)는 면제됩니다.";
    exceptionItems.push({ category: "자동 제외", name: "비상경보설비", status: "notRequired",
      reason: "자동화재탐지설비가 설치되어 비상경보설비(비상벨·자동식싸이렌)는 면제됩니다." });
  }
  // A-2) SP/물분무등 설치 → 간이스프링클러설비 자동 제외 (2001.5.21~)
  if (pd >= YD.D20010521 && isReq("간이스프링클러설비") && (isReq("스프링클러설비") || isReq("물분무등소화설비"))) {
    autoExclude("간이스프링클러설비", "스프링클러설비 또는 물분무등소화설비가 설치되어 간이스프링클러설비는 면제됩니다.");
    exceptionItems.push({ category: "자동 제외", name: "간이스프링클러설비", status: "notRequired",
      reason: "스프링클러설비 또는 물분무등소화설비가 설치되어 간이스프링클러설비는 면제됩니다." });
  }
  // A-3) SP/물분무등/간이SP 설치 → 연결살수설비 자동 제외
  // (단, 스프링클러가 전층이 아닌 일부 층만 설치되는 경우 SP로는 면제 불가 — 아파트 16층 등)
  if (isReq("연결살수설비") && ((sprinklerSuppressesConnSpray && isReq("스프링클러설비")) || isReq("물분무등소화설비") || isReq("간이스프링클러설비"))) {
    autoExclude("연결살수설비", "스프링클러설비·물분무등소화설비·간이스프링클러설비 중 하나가 설치되어 연결살수설비는 면제됩니다.");
    exceptionItems.push({ category: "자동 제외", name: "연결살수설비", status: "notRequired",
      reason: "송수구가 부설된 스프링클러설비·물분무등소화설비·간이스프링클러설비 중 하나가 설치되어 연결살수설비는 면제됩니다." });
  }

  // ── B. 검토 필요 ──
  // B-4) 자탐 + SP/연결살수 → 헤드 설치 층의 자탐 감지기 생략 가능
  if (isReq("자동화재탐지설비") && (isReq("스프링클러설비") || isReq("연결살수설비"))) {
    exceptionItems.push({ category: "설치 제외 검토", name: "자동화재탐지설비 감지기 (헤드 설치 층)", status: "review",
      reason: "스프링클러설비 또는 연결살수설비가 함께 설치된 경우, 해당 헤드가 설치된 층(또는 부분)에는 자동화재탐지설비의 감지기를 생략할 수 있습니다. 실무적으로 흔히 적용됩니다." });
  }

  if (exceptionItems.length === 0) {
    exceptionItems.push({ category: "안내", name: "설치 제외·대체 없음", status: "notRequired",
      reason: "현재 입력 기준으로는 별도의 설치 제외·대체 안내가 없습니다." });
  }
  return exceptionItems;
}

function yearEvaluateNeighborhoodBefore2004(inp) {
  const results = [];
  const { pd } = inp;
  const ta = inp.totalArea;
  const ag = inp.aboveGroundFloors;
  const bf = inp.basementFloors;
  const ba = inp.basementAreaSum;
  const tf = inp.totalFloors;
  const wl = inp.windowlessArea;
  const bsmtAvg = bf > 0 ? ba / bf : 0;
  const sub = inp.before2004FacilitySubtype; // "restaurant" | "marketBathhouse" | "general"  (pre-1992)
  const subAfter92 = inp.facilitySubtype;    // "general" | "bathhouse" (1992+)

  const preBefore1992  = pd < YD.D19920728;
  const pre1984        = pd < YD.D19840701;
  const pre1994        = pd < YD.D19940720;
  const pre1991        = pd < YD.D19910108;
  const hasBasement    = bf > 0;
  const hasWL          = inp.hasWindowlessFloor;

  // ── 소화기구 ──
  let extReq, extReason;
  if (preBefore1992) {
    if (sub === "restaurant") {
      extReq = ta >= 33;
      extReason = extReq ? "음식점 등으로서 연면적 33㎡ 이상입니다." : "연면적 33㎡ 미만이어서 설치 대상이 아닙니다. 다만 지하층·무창층·3층 이상 층 중 바닥면적 50㎡ 이상인 층이 있으면 설치 대상입니다.";
    } else {
      extReq = ta >= 150;
      extReason = extReq ? (sub === "marketBathhouse" ? "시장·공중목욕장으로서 연면적 150㎡ 이상입니다." : "연면적 150㎡ 이상입니다.") : "연면적 150㎡ 미만이어서 설치 대상이 아닙니다. 다만 지하층·무창층·3층 이상 층 중 바닥면적 50㎡ 이상인 층이 있으면 설치 대상입니다.";
    }
  } else {
    extReq = ta >= 33;
    extReason = extReq ? "연면적 33㎡ 이상입니다." : "연면적 33㎡ 미만이어서 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.extinguishing, "소화기구", "", extReq ? "required" : "notRequired", extReason, ""));

  // ── 옥내소화전설비 ──
  let hydrantReq, hydrantReason;
  if (preBefore1992) {
    hydrantReq = ta >= 2100 || inp.before2004HasLargeFloor450;
    hydrantReason = ta >= 2100 ? "연면적 2,100㎡ 이상입니다." :
      inp.before2004HasLargeFloor450 ? (pre1984 ? "지하층·무창층·4층 이상 층 중 바닥면적 450㎡ 이상인 층이 있습니다. (해당 조건 해당 시 전 층 설치)" : "지하층·무창층·4층 이상 층 중 바닥면적 450㎡ 이상인 층이 있어 전 층에 설치합니다.") :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    hydrantReq = ta >= 1500 || inp.hasLargeTargetFloor;
    hydrantReason = ta >= 1500 ? "연면적 1,500㎡ 이상입니다." :
      inp.hasLargeTargetFloor ? "지하층·무창층·4층 이상 층 중 바닥면적 300㎡ 이상인 층이 있어 전 층에 설치합니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.extinguishing, "옥내소화전설비", "", hydrantReq ? "required" : "notRequired", hydrantReason, ""));

  // ── 스프링클러설비 ──
  let sprinklerReq, sprinklerReason;
  if (preBefore1992) {
    sprinklerReq = inp.before2004SprinklerFloor;
    if (pre1984) {
      sprinklerReason = sprinklerReq ? "4층 이상 10층 이하의 층 중 바닥면적 1,500㎡ 이상인 층이 있어 해당 층에 설치합니다." : "현재 입력 기준으로는 설치 대상이 아닙니다. (4~10층 층 중 1,500㎡ 이상인 층이 없음)";
    } else {
      sprinklerReason = sprinklerReq ? "4층 이상 10층 이하의 층 중 바닥면적 1,000㎡ 이상인 층이 있어 해당 층에 설치합니다." : "현재 입력 기준으로는 설치 대상이 아닙니다. (4~10층 층 중 1,000㎡ 이상인 층이 없음)";
    }
  } else {
    // 1992.07.28 ~ 2004.05.29
    sprinklerReq = ag >= 11 || inp.before2004LargeFloor1000;
    sprinklerReason = ag >= 11 ? "층수가 11층 이상으로 전 층 설치 대상입니다." :
      inp.before2004LargeFloor1000 ? "지하층·무창층·4층 이상 층 중 바닥면적 1,000㎡ 이상인 층이 있어 전 층에 설치합니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.extinguishing, "스프링클러설비", "", sprinklerReq ? "required" : "notRequired", sprinklerReason, ""));

  // ── 간이스프링클러설비 ──
  if (pd < YD.D20010521) {
    results.push(makeResult(categories.extinguishing, "간이스프링클러설비", "", "notRequired",
      "해당 시행 시기에는 간이스프링클러설비 규정이 없었습니다.", ""));
  } else {
    results.push(makeResult(categories.extinguishing, "간이스프링클러설비", "", "notRequired",
      "분법 이전 시기에는 근린생활시설 자체에 대한 간이스프링클러설비 설치 의무가 없었습니다. 다중이용업소의 지하층 영업장 바닥면적이 150㎡ 이상인 경우에는 다중이용업소 안전시설에서 별도로 확인합니다.", ""));
  }

  // ── 물분무등소화설비 ──
  let waterSprayReq, waterSprayReason;
  if (pre1984) {
    // 1981~1984: 발전실·변전실 300㎡ 이상
    waterSprayReq = inp.electricalRoomArea >= 300;
    waterSprayReason = waterSprayReq ? "발전실·변전실 바닥면적이 300㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (preBefore1992) {
    // 1984~1992: 전기실·통신기기실·전산기기실 300㎡ 이상
    waterSprayReq = inp.electricalRoomArea >= 300;
    waterSprayReason = waterSprayReq ? "전기실·통신기기실·전산기기실 바닥면적이 300㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    // 1992~2004: 차고 200㎡ OR 기계식주차 20대 OR 전기실 300㎡ 추가
    waterSprayReq = inp.indoorParkingArea >= 200 || inp.mechanicalParkingCapacity >= 20 || inp.electricalRoomArea >= 300;
    waterSprayReason = buildWaterSprayReason(0, inp.indoorParkingArea, inp.mechanicalParkingCapacity, inp.electricalRoomArea);
  }
  results.push(makeResult(categories.extinguishing, "물분무등소화설비", "", waterSprayReq ? "required" : "notRequired", waterSprayReason, ""));

  // ── 옥외소화전설비 ──
  results.push(makeResult(categories.extinguishing, "옥외소화전설비", "",
    inp.firstSecondFloorArea >= 9000 ? "required" : "notRequired",
    inp.firstSecondFloorArea >= 9000 ? "지상 1층과 2층의 바닥면적 합계가 9,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 비상경보설비 ──
  let emergAlarmReq, emergAlarmReason;
  if (pre1991) {
    // ~1991.01.07: 수용인원 기준
    emergAlarmReq = null; // 수용인원 기준으로 확정 불가
    emergAlarmReason = "1991년 1월 8일 이전에는 수용인원 기준(100인 이상이거나, 지하·무창층 있는 건물의 경우 40인 이상)으로 설치 여부를 판단합니다. 수용인원을 직접 확인하세요.";
    results.push(makeResult(categories.alarm, "비상경보설비", "", "review", emergAlarmReason, ""));
  } else {
    // 1991.01.08~: 연면적 400㎡ OR 지하/무창 합계 150㎡
    emergAlarmReq = ta >= 400 || (hasBasement && ba >= 150) || (hasWL && wl >= 150);
    emergAlarmReason = ta >= 400 ? "연면적이 400㎡ 이상입니다." :
      (hasBasement && ba >= 150) ? "지하층 바닥면적 합계가 150㎡ 이상입니다." :
      (hasWL && wl >= 150) ? "무창층 바닥면적이 150㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.alarm, "비상경보설비", "", emergAlarmReq ? "required" : "notRequired", emergAlarmReason, ""));
  }

  // ── 자동화재탐지설비 ──
  let autoDetReq, autoDetReason;
  if (preBefore1992) {
    const detThreshold = sub === "marketBathhouse" ? 1000 : 600;
    autoDetReq = ta >= detThreshold || inp.before2004HasDetFloor300;
    autoDetReason = ta >= detThreshold ? (sub === "marketBathhouse" ? "시장·공중목욕장으로서 연면적 1,000㎡ 이상입니다." : "연면적 600㎡ 이상입니다.") :
      inp.before2004HasDetFloor300 ? (pre1984 ? "지하층·무창층·3층 이상 층 중 바닥면적 300㎡ 이상인 층이 있어 해당 층에 설치합니다." : "지하층·무창층·3층 이상 층 중 바닥면적 300㎡ 이상인 층이 있어 전 층에 설치합니다.") :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    const detThreshold = subAfter92 === "bathhouse" ? 1000 : 600;
    autoDetReq = ta >= detThreshold;
    autoDetReason = autoDetReq ? (subAfter92 === "bathhouse" ? "일반목욕장으로서 연면적 1,000㎡ 이상입니다." : "연면적 600㎡ 이상입니다.") : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.alarm, "자동화재탐지설비", "", autoDetReq ? "required" : "notRequired", autoDetReason, ""));

  // ── 비상방송설비 ──
  let broadcastReq, broadcastReason;
  if (pre1991) {
    // ~1991.01.07: 수용인원 800인이상, 11층이상, 지하3층이상
    broadcastReq = ag >= 11 || bf >= 3;
    broadcastReason = ag >= 11 ? "지상층수가 11층 이상입니다." : bf >= 3 ? "지하층수가 3층 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다. (수용인원 800인 이상인 경우도 설치 대상이나 면적만으로 확정이 어렵습니다.)";
  } else if (pre1994) {
    // 1991~1994.07.19: 연면적 3500㎡ OR 지하층 제외 11층(=ag) 이상 OR 지하3층이상
    broadcastReq = ta >= 3500 || ag >= 11 || bf >= 3;
    broadcastReason = ta >= 3500 ? "연면적이 3,500㎡ 이상입니다." : ag >= 11 ? "지상층수가 11층 이상입니다." : bf >= 3 ? "지하층수가 3층 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    // 1994.07.20~: 연면적 3500㎡ OR 층수(전체) 11층 이상 OR 지하3층이상
    broadcastReq = ta >= 3500 || tf >= 11 || bf >= 3;
    broadcastReason = ta >= 3500 ? "연면적이 3,500㎡ 이상입니다." : tf >= 11 ? "전체 층수가 11층 이상입니다." : bf >= 3 ? "지하층수가 3층 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.alarm, "비상방송설비", "", broadcastReq ? "required" : "notRequired", broadcastReason, ""));

  // ── 자동화재속보설비 ── (근린생활시설은 해당 없음)
  results.push(makeResult(categories.alarm, "자동화재속보설비", "", "notRequired",
    "근린생활시설은 해당 시행 시기에 자동화재속보설비 설치 대상이 아닙니다.", ""));

  // ── 피난기구 ──
  let evacReq, evacReason;
  if (preBefore1992) {
    // ~1992.07.27: 수용인원 기준(음식점 50인 이상 등)으로 복잡
    const hasEligibleFloor = ag >= 3 || bf > 0;
    evacReason = "1992년 7월 28일 이전에는 수용인원 기준(음식점 등 50인 이상)으로 설치 여부를 판단합니다. 피난층·2층·11층 이상 층을 제외한 층에 설치하며, 설치 여부는 수용인원 기준으로 판단하므로 실제 충족 여부는 소방법 시행규칙 [별표1] 수용인원산정법에 따라 직접 확인하세요.";
    results.push(makeResult(categories.evacuation, "피난기구", "", hasEligibleFloor ? "required" : "review", evacReason, ""));
  } else {
    // 1992.07.28~: 피난층·2층·11층 이상 층을 제외한 층에 설치 (연면적 기준 없음)
    evacReq = ag >= 3 || bf > 0;
    evacReason = evacReq ? "피난층·2층·11층 이상을 제외한 모든 층에 피난기구를 설치합니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.evacuation, "피난기구", "", evacReq ? "required" : "notRequired", evacReason, ""));
  }

  // ── 유도등 및 유도표지 ──
  let guideReq, guideReason;
  if (preBefore1992) {
    // ~1992.07.27: 지하/무창/11층이상에만 유도등, 나머지는 유도표지
    if (hasBasement || hasWL || ag >= 11) {
      guideReason = "지하층·무창층 또는 11층 이상의 층에 피난구·통로유도등을 설치하고, 나머지 층에는 유도표지를 설치합니다.";
      results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "required", guideReason, ""));
    } else {
      guideReason = "기본적으로 유도표지를 설치하며, 지하층·무창층 또는 11층 이상의 층에는 피난구·통로유도등을 설치합니다.";
      results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "required", guideReason, ""));
    }
  } else {
    // 1992.07.28~: 전 층에 피난구유도등·통로유도등·유도표지 설치
    results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "required", "전 층에 피난구유도등, 통로유도등, 유도표지를 설치합니다.", ""));
  }

  // ── 비상조명등 ──
  let emLightReq, emLightReason;
  if (pd < YD.D19840701) {
    // 1981~1984.06.30: 비상조명등 규정 없음
    emLightReason = "1984년 7월 이전에는 비상조명등 규정이 없었습니다.";
    results.push(makeResult(categories.evacuation, "비상조명등", "", "notRequired", emLightReason, ""));
  } else {
    // 1984.07.01~: 5층 이상 연면적 3000㎡ 이상, 또는 지하/무창 450㎡ 이상
    const bsmtAvg450 = hasBasement && bsmtAvg >= 450;
    const wlss450 = hasWL && wl >= 450;
    emLightReq = (tf >= 5 && ta >= 3000) || bsmtAvg450 || wlss450;
    emLightReason = tf >= 5 && ta >= 3000 ? "전체 층수가 5층 이상이고 연면적이 3,000㎡ 이상입니다." :
      bsmtAvg450 ? "지하층 바닥면적이 450㎡ 이상입니다." :
      wlss450 ? "무창층 바닥면적이 450㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.evacuation, "비상조명등", "", emLightReq ? "required" : "notRequired", emLightReason, ""));
  }

  // ── 상수도소화용수설비 ──
  let waterSupplyReq, waterSupplyReason;
  if (pd < YD.D19920728) {
    // ~1992.07.27: 대지면적 20,000㎡ 이상 + 1·2층 합계 15,000㎡ 이상 (초대형만, 일반적으로 해당 없음)
    waterSupplyReason = "1992년 7월 28일 이전에는 상수도소화용수설비 기준이 없었습니다. (초대형 건물의 소화수조·저수지 기준만 존재)";
    results.push(makeResult(categories.waterSupply, "상수도소화용수설비", "", "notRequired", waterSupplyReason, ""));
  } else {
    // 1992.07.28~: 연면적 5,000㎡ 이상
    waterSupplyReq = ta >= 5000;
    waterSupplyReason = waterSupplyReq ? "연면적이 5,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.waterSupply, "상수도소화용수설비", "", waterSupplyReq ? "required" : "notRequired", waterSupplyReason, ""));
  }

  // ── 제연설비 (구 배연설비) ──
  let smokeReq, smokeReason;
  if (pd < YD.D19820928) {
    smokeReason = "1982년 9월 28일 이전에는 배연설비(현 제연설비) 규정이 없었습니다.";
    results.push(makeResult(categories.fireSupport, "제연설비", "", "notRequired", smokeReason, ""));
  } else {
    const floorsAfter1992 = pd >= YD.D19920728 && ag >= 11;
    smokeReq = inp.smokeControlArea >= 1000 || floorsAfter1992;
    smokeReason = inp.smokeControlArea >= 1000 ? "지하층·무창층 바닥면적 합계가 1,000㎡ 이상입니다." : floorsAfter1992 ? "지상 11층 이상으로 특별피난계단에 제연설비를 설치해야 합니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.fireSupport, "제연설비", "", smokeReq ? "required" : "notRequired", smokeReason, ""));
  }

  // ── 연결송수관설비 ──
  let standpipeReq, standpipeReason;
  if (pd < YD.D19840701) {
    standpipeReason = "1984년 7월 1일 이전에는 연결송수관설비 규정이 없었습니다.";
    results.push(makeResult(categories.fireSupport, "연결송수관설비", "", "notRequired", standpipeReason, ""));
  } else if (preBefore1992) {
    // 1984~1992: 지하층 제외 7층이상 OR 지하층 제외 5층이상+연면적 6000㎡이상
    standpipeReq = ag >= 7 || (ag >= 5 && ta >= 6000);
    standpipeReason = ag >= 7 ? "지상층수가 7층 이상입니다." : (ag >= 5 && ta >= 6000) ? "지상층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.fireSupport, "연결송수관설비", "", standpipeReq ? "required" : "notRequired", standpipeReason, ""));
  } else if (pre1994) {
    // 1992~1994: 5층이상+6000㎡ OR 7층이상 OR 지하3층이상 추가
    standpipeReq = ag >= 7 || (ag >= 5 && ta >= 6000) || bf >= 3;
    standpipeReason = ag >= 7 ? "지상층수가 7층 이상입니다." : (ag >= 5 && ta >= 6000) ? "지상층수가 5층이상이고 연면적 6,000㎡ 이상입니다." : bf >= 3 ? "지하층수가 3층 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.fireSupport, "연결송수관설비", "", standpipeReq ? "required" : "notRequired", standpipeReason, ""));
  } else {
    // 1994~2004: 5층이상+6000㎡ OR 7층이상 OR 지하3층이상+지하1000㎡이상
    standpipeReq = tf >= 7 || (tf >= 5 && ta >= 6000) || (bf >= 3 && ba >= 1000);
    standpipeReason = tf >= 7 ? "전체 층수가 7층 이상입니다." : (tf >= 5 && ta >= 6000) ? "전체 층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다." : (bf >= 3 && ba >= 1000) ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.fireSupport, "연결송수관설비", "", standpipeReq ? "required" : "notRequired", standpipeReason, ""));
  }

  // ── 연결살수설비 ──
  let connSprayReq, connSprayReason;
  if (pd < YD.D19840701) {
    connSprayReason = "1984년 7월 1일 이전에는 연결살수설비 규정이 없었습니다.";
    results.push(makeResult(categories.fireSupport, "연결살수설비", "", "notRequired", connSprayReason, ""));
  } else if (pd < YD.D19900701) {
    // 1984~1990.06.30: 지하층 바닥면적 합계 700㎡ 이상
    connSprayReq = ba >= 700;
    connSprayReason = connSprayReq ? "지하층 바닥면적 합계가 700㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.fireSupport, "연결살수설비", "", connSprayReq ? "required" : "notRequired", connSprayReason, ""));
  } else {
    // 1990.07.01~: 지하층 바닥면적 합계 150㎡ 이상
    connSprayReq = ba >= 150;
    connSprayReason = connSprayReq ? "지하층 바닥면적 합계가 150㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.fireSupport, "연결살수설비", "", connSprayReq ? "required" : "notRequired", connSprayReason, ""));
  }

  // ── 비상콘센트설비 ──
  let emConsentReq, emConsentReason;
  if (preBefore1992) {
    // 1981~1992: 지하층 제외 11층이상
    emConsentReq = ag >= 11;
    emConsentReason = emConsentReq ? "지상층수가 11층 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (pre1994) {
    // 1992~1994: 11층이상 OR 지하3층이상
    emConsentReq = ag >= 11 || bf >= 3;
    emConsentReason = ag >= 11 ? "지상층수가 11층 이상입니다." : bf >= 3 ? "지하층수가 3층 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    // 1994~2004: 11층이상 OR 지하3층이상+지하1000㎡이상
    emConsentReq = ag >= 11 || (bf >= 3 && ba >= 1000);
    emConsentReason = ag >= 11 ? "지상층수가 11층 이상입니다." : (bf >= 3 && ba >= 1000) ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.fireSupport, "비상콘센트설비", "", emConsentReq ? "required" : "notRequired", emConsentReason, ""));

  // ── 무선통신보조설비 ──
  let radioReq, radioReason;
  if (pd < YD.D19920728) {
    radioReason = "1992년 7월 28일 이전에는 무선통신보조설비 기준이 일반 소방대상물에 적용되지 않았습니다.";
    results.push(makeResult(categories.fireSupport, "무선통신보조설비", "", "notRequired", radioReason, ""));
  } else if (pre1994) {
    // 1992~1994: 지하3000㎡이상 OR 지하3층이상
    radioReq = ba >= 3000 || bf >= 3;
    radioReason = ba >= 3000 ? "지하층 바닥면적 합계가 3,000㎡ 이상입니다." : bf >= 3 ? "지하층수가 3층 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.fireSupport, "무선통신보조설비", "", radioReq ? "required" : "notRequired", radioReason, ""));
  } else {
    // 1994~2004: 지하3000㎡이상 OR 지하3층이상+지하1000㎡이상
    radioReq = ba >= 3000 || (bf >= 3 && ba >= 1000);
    radioReason = ba >= 3000 ? "지하층 바닥면적 합계가 3,000㎡ 이상입니다." : (bf >= 3 && ba >= 1000) ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.fireSupport, "무선통신보조설비", "", radioReq ? "required" : "notRequired", radioReason, ""));
  }

  return results;
}

function yearEvaluateReligiousBefore2004(inp) {
  const results = [];
  const { pd } = inp;

  const ta       = inp.totalArea;
  const ag       = inp.aboveGroundFloors;
  const bf       = inp.basementFloors;
  const tf       = ag + bf;
  const ba       = inp.basementAreaSum;
  const bsmtAvg  = bf > 0 ? ba / bf : 0;
  const wl       = inp.windowlessArea;

  const hasBasement = bf > 0;
  const hasWL       = inp.hasWindowlessFloor;

  const pre1984       = pd < YD.D19840701;
  const preBefore1992 = pd < YD.D19920728;
  const pre1991       = pd < YD.D19910108;
  const pre1994       = pd < YD.D19940720;

  const elecArea    = inp.before2004ReligiousElectricalRoomArea;
  const parkingArea = inp.before2004ReligiousIndoorParkingArea;
  const mechParking = inp.before2004ReligiousMechanicalParkingCapacity;
  const hydrantFloor600 = inp.before2004ReligiousHasLargeFloor600;
  const hasBasement600  = hasBasement && bsmtAvg >= 600;
  const hasWindowless600 = hasWL && wl >= 600;
  const f12 = inp.religiousFirstSecondFloorArea;

  // ── 소화기구 ──
  if (preBefore1992) {
    const extReq = ta >= 300;
    results.push(makeResult(categories.extinguishing, "소화기구", "",
      extReq ? "required" : "review",
      extReq
        ? "교회·사찰(제2종 장소)로서 연면적 300㎡ 이상입니다."
        : "연면적 300㎡ 미만이나 지하층·무창층·3층 이상 층 중 바닥면적 50㎡ 이상인 층이 있으면 해당 층에 설치해야 합니다. 현장을 직접 확인하세요.", ""));
  } else {
    const extReq = ta >= 33;
    results.push(makeResult(categories.extinguishing, "소화기구", "",
      extReq ? "required" : "notRequired",
      extReq ? "연면적이 33㎡ 이상입니다." : "연면적이 33㎡ 미만으로 설치 대상이 아닙니다.", ""));
  }

  // ── 옥내소화전설비 ──
  const hydrantReq = ta >= 3000 || hydrantFloor600 || hasBasement600 || hasWindowless600;
  if (pre1984) {
    results.push(makeResult(categories.extinguishing, "옥내소화전설비", "",
      hydrantReq ? "required" : "notRequired",
      ta >= 3000 ? "연면적 3,000㎡ 이상인 교회·사찰입니다." :
      (hydrantFloor600 || hasBasement600 || hasWindowless600) ? "지하층·무창층·4층 이상 층 중 바닥면적 600㎡ 이상인 층이 있어 해당 층에 설치합니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  } else if (preBefore1992) {
    results.push(makeResult(categories.extinguishing, "옥내소화전설비", "",
      hydrantReq ? "required" : "notRequired",
      ta >= 3000 ? "연면적 3,000㎡ 이상인 교회·사찰로 전 층에 설치합니다." :
      (hydrantFloor600 || hasBasement600 || hasWindowless600) ? "지하층·무창층·4층 이상 층 중 바닥면적 600㎡ 이상인 층이 있어 전 층에 설치합니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  } else if (pre1994) {
    results.push(makeResult(categories.extinguishing, "옥내소화전설비", "",
      hydrantReq ? "required" : "notRequired",
      ta >= 3000 ? "연면적 3,000㎡ 이상인 종교시설로 전 층에 설치합니다." :
      (hydrantFloor600 || hasBasement600 || hasWindowless600) ? "지하층·무창층·지하층을 제외한 4층 이상 층 중 바닥면적 600㎡ 이상인 층이 있어 전 층에 설치합니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  } else {
    results.push(makeResult(categories.extinguishing, "옥내소화전설비", "",
      hydrantReq ? "required" : "notRequired",
      ta >= 3000 ? "연면적 3,000㎡ 이상인 종교시설로 전 층에 설치합니다." :
      (hydrantFloor600 || hasBasement600 || hasWindowless600) ? "지하층·무창층·4층 이상 층 중 바닥면적 600㎡ 이상인 층이 있어 전 층에 설치합니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  }

  // ── 스프링클러설비 ──
  if (preBefore1992) {
    results.push(makeResult(categories.extinguishing, "스프링클러설비", "", "notRequired",
      "1992년 7월 28일 이전에는 교회·사찰은 스프링클러설비 설치 대상에서 제외되어 있었습니다.", ""));
  } else {
    const splkReq = ag >= 11;
    results.push(makeResult(categories.extinguishing, "스프링클러설비", "",
      splkReq ? "required" : "notRequired",
      ag >= 11 ? "지상층수가 11층 이상으로 11층 이상 부분에 스프링클러설비를 설치합니다." :
      "지상층수가 11층 미만으로 설치 대상이 아닙니다. (1992~2004 기준: 11층 이상 부분에 한하여 설치)", ""));
  }

  // ── 간이스프링클러설비 ──
  results.push(makeResult(categories.extinguishing, "간이스프링클러설비", "", "notRequired",
    "분법 이전(~2004.5.29) 종교시설은 간이스프링클러설비 설치 대상이 아닙니다.", ""));

  // ── 물분무등소화설비 ──
  if (pre1984) {
    const waterSprayReq = elecArea >= 300;
    results.push(makeResult(categories.extinguishing, "물분무등소화설비", "",
      waterSprayReq ? "required" : "notRequired",
      waterSprayReq ? "발전실·변전실 바닥면적이 300㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  } else if (preBefore1992) {
    const waterSprayReq = elecArea >= 300;
    results.push(makeResult(categories.extinguishing, "물분무등소화설비", "",
      waterSprayReq ? "required" : "notRequired",
      waterSprayReq ? "전기실·통신기기실·전산기기실 바닥면적이 300㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  } else {
    const waterSprayReq = parkingArea >= 200 || mechParking >= 20 || elecArea >= 300;
    results.push(makeResult(categories.extinguishing, "물분무등소화설비", "",
      waterSprayReq ? "required" : "notRequired",
      parkingArea >= 200 ? "차고·주차장 바닥면적이 200㎡ 이상입니다." :
      mechParking >= 20 ? "기계식 주차 대수가 20대 이상입니다." :
      elecArea >= 300 ? "전기실·발전실·변전실·전산실 바닥면적이 300㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  }

  // ── 옥외소화전설비 ──
  results.push(makeResult(categories.extinguishing, "옥외소화전설비", "",
    f12 >= 9000 ? "required" : "notRequired",
    f12 >= 9000 ? "지상 1·2층 바닥면적 합계가 9,000㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 비상경보설비 ──
  if (pre1991) {
    results.push(makeResult(categories.alarm, "비상경보설비", "", "review",
      "1991년 7월 이전에는 수용인원 100인 이상인 소방대상물에 비상경보설비를 설치해야 합니다. 수용인원을 직접 확인하세요.", ""));
  } else {
    const alarmReq = ta >= 400 || (hasBasement && bsmtAvg >= 150) || (hasWL && wl >= 150);
    results.push(makeResult(categories.alarm, "비상경보설비", "",
      alarmReq ? "required" : "notRequired",
      ta >= 400 ? "연면적이 400㎡ 이상입니다." :
      (hasBasement && bsmtAvg >= 150) ? "지하층 평균 바닥면적이 150㎡ 이상입니다." :
      (hasWL && wl >= 150) ? "무창층 바닥면적이 150㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  }

  // ── 비상방송설비 ──
  if (pre1991) {
    if (ag >= 11 || bf >= 3) {
      results.push(makeResult(categories.alarm, "비상방송설비", "", "required",
        ag >= 11 ? "지상층수가 11층 이상입니다." : "지하층수가 3층 이상입니다.", ""));
    } else {
      results.push(makeResult(categories.alarm, "비상방송설비", "", "review",
        "1991년 7월 이전에는 수용인원 300인 이상인 소방대상물에 비상방송설비를 설치해야 합니다. 수용인원을 직접 확인하세요.", ""));
    }
  } else if (pre1994) {
    const bcReq = ta >= 3500 || ag >= 11 || bf >= 3;
    results.push(makeResult(categories.alarm, "비상방송설비", "",
      bcReq ? "required" : "notRequired",
      ta >= 3500 ? "연면적이 3,500㎡ 이상입니다." :
      ag >= 11 ? "지상층수가 11층 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  } else {
    const bcReq = ta >= 3500 || tf >= 11 || bf >= 3;
    results.push(makeResult(categories.alarm, "비상방송설비", "",
      bcReq ? "required" : "notRequired",
      ta >= 3500 ? "연면적이 3,500㎡ 이상입니다." :
      tf >= 11 ? "전체 층수가 11층 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  }

  // ── 자동화재탐지설비 ──
  const detReq = ta >= 1000;
  results.push(makeResult(categories.alarm, "자동화재탐지설비", "",
    detReq ? "required" : "notRequired",
    detReq
      ? (preBefore1992 ? "교회·사찰(제2종 장소)로서 연면적 1,000㎡ 이상입니다." : "종교시설로서 연면적 1,000㎡ 이상입니다.")
      : "연면적 1,000㎡ 미만으로 설치 대상이 아닙니다.", ""));

  // ── 자동화재속보설비 ──
  results.push(makeResult(categories.alarm, "자동화재속보설비", "", "notRequired",
    "분법 이전(~2004.5.29) 종교시설은 자동화재속보설비 설치 대상이 아닙니다.", ""));

  // ── 피난기구 ──
  if (preBefore1992) {
    const hasEligibleFloor = ag >= 3 || bf > 0;
    results.push(makeResult(categories.evacuation, "피난기구", "", hasEligibleFloor ? "required" : "review",
      "1992년 7월 28일 이전에는 수용인원 20인 이상인 소방대상물에 피난기구를 설치해야 합니다. 설치 여부는 수용인원 기준으로 판단하므로 실제 충족 여부는 소방법 시행규칙 [별표1] 수용인원산정법에 따라 직접 확인하세요.", ""));
  } else {
    const evacReq = ag >= 3 || bf > 0;
    results.push(makeResult(categories.evacuation, "피난기구", "",
      evacReq ? "required" : "notRequired",
      evacReq ? "종교시설은 피난층·1층·2층·11층 이상 층을 제외한 층에 피난기구를 설치합니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  }

  // ── 인명구조기구 ──
  results.push(makeResult(categories.evacuation, "인명구조기구", "", "notRequired",
    "분법 이전(~2004.5.29) 종교시설은 인명구조기구 설치 대상이 아닙니다.", ""));

  // ── 유도등 및 유도표지 ──
  if (pre1984) {
    if (hasBasement || hasWL || ag >= 11) {
      results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "required",
        "지하층·무창층 또는 11층 이상의 층에 피난구·통로유도등을 설치하고, 나머지 층에는 유도표지를 설치합니다.", ""));
    } else {
      results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "required",
        "기본적으로 유도표지를 설치하며, 지하층·무창층 또는 11층 이상의 층에는 피난구·통로유도등을 설치합니다.", ""));
    }
  } else if (preBefore1992) {
    results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "required",
      "교회·사찰로 건물 전 층에 피난구유도등·통로유도등을 설치합니다.", ""));
  } else {
    results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "required",
      "모든 종교시설에 피난구유도등, 통로유도등, 유도표지를 설치합니다.", ""));
  }

  // ── 비상조명등 ──
  if (pre1984) {
    results.push(makeResult(categories.evacuation, "비상조명등", "", "notRequired",
      "1984년 7월 이전에는 비상조명등 규정이 없었습니다.", ""));
  } else {
    const bsmtAvg450 = hasBasement && bsmtAvg >= 450;
    const wlss450    = hasWL && wl >= 450;
    const emLightReq = (tf >= 5 && ta >= 3000) || bsmtAvg450 || wlss450;
    results.push(makeResult(categories.evacuation, "비상조명등", "", emLightReq ? "required" : "notRequired",
      tf >= 5 && ta >= 3000 ? "전체 층수가 5층 이상이고 연면적이 3,000㎡ 이상입니다." :
      bsmtAvg450 ? "지하층 바닥면적이 450㎡ 이상입니다." :
      wlss450    ? "무창층 바닥면적이 450㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  }

  // ── 상수도소화용수설비 ──
  if (preBefore1992) {
    results.push(makeResult(categories.waterSupply, "상수도소화용수설비", "", "notRequired",
      "1992년 7월 28일 이전에는 상수도소화용수설비 기준이 없었습니다.", ""));
  } else {
    const waterSupplyReq = ta >= 5000;
    results.push(makeResult(categories.waterSupply, "상수도소화용수설비", "",
      waterSupplyReq ? "required" : "notRequired",
      waterSupplyReq ? "연면적이 5,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  }

  // ── 제연설비 ──
  if (pd < YD.D19820928) {
    results.push(makeResult(categories.fireSupport, "제연설비", "", "notRequired",
      "1982년 9월 28일 이전에는 배연설비(현 제연설비) 규정이 없었습니다.", ""));
  } else if (preBefore1992) {
    const smokeCtrlReq = (hasBasement && ba >= 1000) || (hasWL && wl >= 1000);
    results.push(makeResult(categories.fireSupport, "제연설비", "",
      smokeCtrlReq ? "required" : "notRequired",
      (hasBasement && ba >= 1000) ? "지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
      (hasWL && wl >= 1000) ? "무창층 바닥면적이 1,000㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다. (분법 이전 종교시설의 일반 거실에는 별도 제연설비 기준이 없었습니다)", ""));
  } else {
    // 1992~2004: 11층 이상이면 특별피난계단에 제연설비 필요
    const smokeCtrlReq = ag >= 11;
    results.push(makeResult(categories.fireSupport, "제연설비", "", smokeCtrlReq ? "required" : "notRequired",
      smokeCtrlReq ? "지상 11층 이상으로 특별피난계단에 제연설비를 설치해야 합니다."
      : "분법 이전(1992~2004) 종교시설 일반 거실은 제연설비 설치 대상이 아닙니다. (무대부 200㎡ 이상 기준은 2011년 7월 이후 신설)", ""));
  }

  // ── 연결송수관설비 ──
  let standpipeReq, standpipeReason;
  if (preBefore1992) {
    standpipeReq = ag >= 7 || (ag >= 5 && ta >= 6000);
    standpipeReason = ag >= 7 ? "지상층수가 7층 이상입니다." :
      (ag >= 5 && ta >= 6000) ? "지상층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (pre1994) {
    standpipeReq = ag >= 7 || (ag >= 5 && ta >= 6000) || bf >= 3;
    standpipeReason = ag >= 7 ? "지상층수가 7층 이상입니다." :
      (ag >= 5 && ta >= 6000) ? "지상층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    standpipeReq = tf >= 7 || (tf >= 5 && ta >= 6000) || (bf >= 3 && ba >= 1000);
    standpipeReason = tf >= 7 ? "전체 층수가 7층 이상입니다." :
      (tf >= 5 && ta >= 6000) ? "전체 층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다." :
      (bf >= 3 && ba >= 1000) ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.fireSupport, "연결송수관설비", "", standpipeReq ? "required" : "notRequired", standpipeReason, ""));

  // ── 연결살수설비 ──
  let connSprayReq, connSprayReason;
  if (pd < YD.D19900701) {
    connSprayReq = ba >= 700;
    connSprayReason = connSprayReq ? "지하층 바닥면적 합계가 700㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    connSprayReq = ba >= 150;
    connSprayReason = connSprayReq ? "지하층 바닥면적 합계가 150㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.fireSupport, "연결살수설비", "", connSprayReq ? "required" : "notRequired", connSprayReason, ""));

  // ── 비상콘센트설비 ──
  let emConsentReq, emConsentReason;
  if (preBefore1992) {
    emConsentReq = ag >= 11;
    emConsentReason = emConsentReq ? "지상층수가 11층 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (pre1994) {
    emConsentReq = ag >= 11 || bf >= 3;
    emConsentReason = ag >= 11 ? "지상층수가 11층 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    emConsentReq = ag >= 11 || (bf >= 3 && ba >= 1000);
    emConsentReason = ag >= 11 ? "지상층수가 11층 이상입니다." :
      (bf >= 3 && ba >= 1000) ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.fireSupport, "비상콘센트설비", "", emConsentReq ? "required" : "notRequired", emConsentReason, ""));

  // ── 무선통신보조설비 ──
  if (preBefore1992) {
    results.push(makeResult(categories.fireSupport, "무선통신보조설비", "", "notRequired",
      "1992년 7월 28일 이전에는 무선통신보조설비 기준이 일반 소방대상물에 적용되지 않았습니다.", ""));
  } else if (pre1994) {
    const radioReq = ba >= 3000 || bf >= 3;
    results.push(makeResult(categories.fireSupport, "무선통신보조설비", "",
      radioReq ? "required" : "notRequired",
      ba >= 3000 ? "지하층 바닥면적 합계가 3,000㎡ 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  } else {
    const radioReq = ba >= 3000 || (bf >= 3 && ba >= 1000);
    results.push(makeResult(categories.fireSupport, "무선통신보조설비", "",
      radioReq ? "required" : "notRequired",
      ba >= 3000 ? "지하층 바닥면적 합계가 3,000㎡ 이상입니다." :
      (bf >= 3 && ba >= 1000) ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  }

  return results;
}

function yearEvaluateMedicalBefore2004(inp) {
  const results = [];
  const { pd } = inp;
  const ta = inp.totalArea;
  const ag = inp.aboveGroundFloors;
  const bf = inp.basementFloors;
  const ba = inp.basementAreaSum;
  const tf = inp.totalFloors;
  const wl = inp.windowlessArea;
  const bsmtAvg = bf > 0 ? ba / bf : 0;
  const hasBasement = bf > 0;
  const hasWL = inp.hasWindowlessFloor;

  const pre1984       = pd < YD.D19840701;
  const preBefore1992 = pd < YD.D19920728;
  const pre1994       = pd < YD.D19940720;
  const pre1991       = pd < YD.D19910108;
  const pre2001       = pd < YD.D20010521;
  const isGeneralHospital = inp.before2004MedicalSubtype === "generalHospital";

  // ── 소화기구 ──
  let extReq, extReason;
  if (preBefore1992) {
    extReq = ta >= 150;
    extReason = extReq
      ? "연면적 150㎡ 이상인 의료시설(제1종 장소)입니다."
      : "연면적 150㎡ 미만이어서 설치 대상이 아닙니다. 다만 지하층·무창층·3층 이상 층 중 바닥면적 50㎡ 이상인 층이 있으면 설치 대상입니다.";
  } else {
    extReq = ta >= 33;
    extReason = extReq ? "연면적 33㎡ 이상입니다." : "연면적 33㎡ 미만이어서 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.extinguishing, "소화기구", "", extReq ? "required" : "notRequired", extReason, ""));

  // ── 옥내소화전설비 ──
  let hydrantReq, hydrantReason;
  if (preBefore1992) {
    hydrantReq = ta >= 2100 || inp.before2004MedicalHasLargeFloor450;
    hydrantReason = ta >= 2100
      ? "연면적 2,100㎡ 이상입니다."
      : inp.before2004MedicalHasLargeFloor450
        ? (pre1984
            ? "지하층·무창층·4층 이상 층 중 바닥면적 450㎡ 이상인 층이 있어 해당 층에 설치합니다."
            : "지하층·무창층·4층 이상 층 중 바닥면적 450㎡ 이상인 층이 있어 건물 전 층에 설치합니다.")
        : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    hydrantReq = ta >= 1500 || inp.before2004MedicalHasLargeFloor300;
    hydrantReason = ta >= 1500
      ? "의료시설 연면적 1,500㎡ 이상입니다."
      : inp.before2004MedicalHasLargeFloor300
        ? "지하층·무창층·4층 이상 층 중 바닥면적 300㎡ 이상인 층이 있어 건물 전 층에 설치합니다."
        : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.extinguishing, "옥내소화전설비", "", hydrantReq ? "required" : "notRequired", hydrantReason, ""));

  // ── 스프링클러설비 ──
  let sprinklerReq, sprinklerReason;
  if (preBefore1992) {
    sprinklerReq = inp.before2004MedicalSprinklerFloor || ag >= 11;
    if (ag >= 11) {
      sprinklerReason = "지상층수가 11층 이상인 건물의 11층 이상 부분에 스프링클러설비를 설치합니다.";
    } else if (inp.before2004MedicalSprinklerFloor) {
      const threshold = pre1984 ? "1,500" : "1,000";
      sprinklerReason = `지하층·무창층 또는 4층 이상 10층 이하의 층 중 바닥면적 ${threshold}㎡ 이상인 층이 있어 해당 층에 설치합니다.`;
    } else {
      sprinklerReason = "현재 입력 기준으로는 설치 대상이 아닙니다.";
    }
  } else {
    sprinklerReq = ag >= 11 || inp.before2004MedicalHasLargeFloor1000;
    sprinklerReason = ag >= 11
      ? "층수가 11층 이상으로 전 층 설치 대상입니다."
      : inp.before2004MedicalHasLargeFloor1000
        ? "지하층·무창층·4층 이상 층 중 바닥면적 1,000㎡ 이상인 층이 있어 건물 전 층에 설치합니다."
        : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.extinguishing, "스프링클러설비", "", sprinklerReq ? "required" : "notRequired", sprinklerReason, ""));

  // ── 간이스프링클러설비 ──
  if (pre2001) {
    results.push(makeResult(categories.extinguishing, "간이스프링클러설비", "", "notRequired",
      "해당 시행 시기에는 간이스프링클러설비 규정이 없었습니다.", ""));
  } else {
    results.push(makeResult(categories.extinguishing, "간이스프링클러설비", "", "notRequired",
      "분법 이전 시기에는 의료시설 자체에 대한 간이스프링클러설비 설치 의무가 없었습니다.", ""));
  }

  // ── 물분무등소화설비 ──
  const elecArea   = inp.before2004MedicalElectricalRoomArea;
  const parkingArea = inp.before2004MedicalIndoorParkingArea;
  const mechParking = inp.before2004MedicalMechanicalParkingCapacity;
  let waterSprayReq, waterSprayReason;
  if (preBefore1992) {
    waterSprayReq = elecArea >= 300;
    waterSprayReason = waterSprayReq
      ? "건물 내 발전실·변전실 바닥면적이 300㎡ 이상입니다."
      : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    waterSprayReq = parkingArea >= 200 || mechParking >= 20 || elecArea >= 300;
    waterSprayReason = buildWaterSprayReason(0, parkingArea, mechParking, elecArea);
  }
  results.push(makeResult(categories.extinguishing, "물분무등소화설비", "", waterSprayReq ? "required" : "notRequired", waterSprayReason, ""));

  // ── 옥외소화전설비 ──
  const f12 = inp.medicalFirstSecondFloorArea;
  results.push(makeResult(categories.extinguishing, "옥외소화전설비", "",
    f12 >= 9000 ? "required" : "notRequired",
    f12 >= 9000 ? "지상 1층과 2층의 바닥면적 합계가 9,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 비상경보설비 ──
  if (pre1991) {
    results.push(makeResult(categories.alarm, "비상경보설비", "", "review",
      "1991년 1월 8일 이전에는 의료원의 경우 수용인원 40인 이상(지하층·무창층이 있는 경우 포함)일 때 설치 대상입니다. 수용인원을 직접 확인하세요.", ""));
  } else {
    const emergAlarmReq = ta >= 400 || (hasBasement && ba >= 150) || (hasWL && wl >= 150);
    const emergAlarmReason = ta >= 400 ? "연면적이 400㎡ 이상입니다." :
      (hasBasement && ba >= 150) ? "지하층 바닥면적 합계가 150㎡ 이상입니다." :
      (hasWL && wl >= 150) ? "무창층 바닥면적이 150㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.alarm, "비상경보설비", "", emergAlarmReq ? "required" : "notRequired", emergAlarmReason, ""));
  }

  // ── 자동화재탐지설비 ──
  let autoDetReq, autoDetReason;
  if (preBefore1992) {
    autoDetReq = ta >= 600 || inp.before2004MedicalAutoDetFloor300;
    if (ta >= 600) {
      autoDetReason = "연면적 600㎡ 이상인 의료시설(제1종 장소)입니다.";
    } else if (inp.before2004MedicalAutoDetFloor300) {
      autoDetReason = pre1984
        ? "지하층·무창층·3층 이상 층 중 바닥면적 300㎡ 이상인 층이 있어 해당 층에 설치합니다."
        : "지하층·무창층·3층 이상 층 중 바닥면적 300㎡ 이상인 층이 있어 건물 전 층에 설치합니다.";
    } else {
      autoDetReason = "현재 입력 기준으로는 설치 대상이 아닙니다.";
    }
  } else {
    autoDetReq = ta >= 600;
    autoDetReason = autoDetReq ? "의료시설 연면적 600㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.alarm, "자동화재탐지설비", "", autoDetReq ? "required" : "notRequired", autoDetReason, ""));

  // ── 비상방송설비 ──
  let broadcastReq, broadcastReason;
  if (pre1991) {
    broadcastReq = ag >= 11 || bf >= 3;
    broadcastReason = ag >= 11 ? "지상층수가 11층 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다. (수용인원 300인 이상인 경우도 설치 대상이나 면적만으로 확정이 어렵습니다.)";
  } else if (pre1994) {
    broadcastReq = ta >= 3500 || ag >= 11 || bf >= 3;
    broadcastReason = ta >= 3500 ? "연면적이 3,500㎡ 이상입니다." :
      ag >= 11 ? "지상층수가 11층 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    broadcastReq = ta >= 3500 || tf >= 11 || bf >= 3;
    broadcastReason = ta >= 3500 ? "연면적이 3,500㎡ 이상입니다." :
      tf >= 11 ? "전체 층수가 11층 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.alarm, "비상방송설비", "", broadcastReq ? "required" : "notRequired", broadcastReason, ""));

  // ── 자동화재속보설비 ──
  let autoDispatchReq, autoDispatchReason;
  if (preBefore1992) {
    autoDispatchReq = ta >= 1500;
    autoDispatchReason = autoDispatchReq
      ? "연면적 1,500㎡ 이상인 의료원으로 설치 대상입니다."
      : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    autoDispatchReq = inp.before2004MedicalHasFloor1500;
    autoDispatchReason = autoDispatchReq
      ? "건물 내 바닥면적이 1,500㎡ 이상인 층이 있습니다."
      : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.alarm, "자동화재속보설비", "", autoDispatchReq ? "required" : "notRequired", autoDispatchReason, ""));

  // ── 피난기구 ──
  if (preBefore1992) {
    const hasEligibleFloor = ag >= 3 || bf > 0;
    results.push(makeResult(categories.evacuation, "피난기구", "", hasEligibleFloor ? "required" : "review",
      "1992년 7월 28일 이전에는 수용인원 20인 이상인 의료원에서 피난층·2층·11층 이상의 층을 제외한 나머지 층에 설치합니다. 설치 여부는 수용인원 기준으로 판단하므로 실제 충족 여부는 소방법 시행규칙 [별표1] 수용인원산정법에 따라 직접 확인하세요.", ""));
  } else {
    const evacReq = ag >= 3 || bf > 0;
    const evacReason = evacReq
      ? "의료시설은 피난층·2층·11층 이상의 층을 제외한 모든 층에 피난기구를 설치합니다."
      : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.evacuation, "피난기구", "", evacReq ? "required" : "notRequired", evacReason, ""));
  }

  // ── 인명구조기구 ──
  if (preBefore1992) {
    if (ag >= 5) {
      results.push(makeResult(categories.evacuation, "인명구조기구", "", "review",
        "1992년 7월 28일 이전에는 지하층을 제외한 층수가 5층 이상이고 수용인원 200인 이상인 병원에 방열복·공기호흡기를 설치해야 합니다. 수용인원을 직접 확인하세요.", ""));
    } else {
      results.push(makeResult(categories.evacuation, "인명구조기구", "", "notRequired",
        "지상층수가 5층 미만으로 설치 대상이 아닙니다.", ""));
    }
  } else if (pre1994) {
    const rescueReq = ag >= 5;
    results.push(makeResult(categories.evacuation, "인명구조기구", "", rescueReq ? "required" : "notRequired",
      rescueReq
        ? "지하층을 제외한 층수가 5층 이상인 병원으로 방열복·공기호흡기 등을 설치해야 합니다."
        : "지상층수가 5층 미만으로 설치 대상이 아닙니다.", ""));
  } else {
    const rescueReq = ag >= 5;
    results.push(makeResult(categories.evacuation, "인명구조기구", "", rescueReq ? "required" : "notRequired",
      rescueReq
        ? "층수가 5층 이상인 병원으로 방열복·공기호흡기 등(인공소생기 제외)을 설치해야 합니다."
        : "지상층수가 5층 미만으로 설치 대상이 아닙니다.", ""));
  }

  // ── 유도등 및 유도표지 ──
  if (pre1984) {
    if (hasBasement || hasWL || ag >= 11) {
      results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "required",
        "지하층·무창층 또는 11층 이상의 층에 피난구·통로유도등을 설치하고, 나머지 층에는 유도표지를 설치합니다.", ""));
    } else {
      results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "required",
        "기본적으로 유도표지를 설치하며, 지하층·무창층 또는 11층 이상의 층에는 피난구·통로유도등을 설치합니다.", ""));
    }
  } else if (preBefore1992) {
    const guideReason = isGeneralHospital
      ? "종합병원으로 건물 전 층에 대형 피난구유도등·통로유도등을 설치합니다."
      : "병원·의원으로 건물 전 층에 중형(병원) 또는 소형(의원) 피난구유도등·통로유도등을 설치합니다.";
    results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "required", guideReason, ""));
  } else {
    results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "required",
      "모든 의료시설에 피난구유도등, 통로유도등, 유도표지를 설치합니다.", ""));
  }

  // ── 비상조명등 ──
  if (pd < YD.D19840701) {
    results.push(makeResult(categories.evacuation, "비상조명등", "", "notRequired",
      "1984년 7월 이전에는 비상조명등 규정이 없었습니다.", ""));
  } else {
    const bsmtAvg450 = hasBasement && bsmtAvg >= 450;
    const wlss450 = hasWL && wl >= 450;
    const emLightReq = (tf >= 5 && ta >= 3000) || bsmtAvg450 || wlss450;
    const note = preBefore1992 ? " (이 시기 의료원 거실은 제외 대상, 통로 위주로 적용)" : "";
    const emLightReason = tf >= 5 && ta >= 3000
      ? `전체 층수가 5층 이상이고 연면적이 3,000㎡ 이상입니다.${note}`
      : bsmtAvg450 ? "지하층 바닥면적이 450㎡ 이상입니다."
      : wlss450 ? "무창층 바닥면적이 450㎡ 이상입니다."
      : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.evacuation, "비상조명등", "", emLightReq ? "required" : "notRequired", emLightReason, ""));
  }

  // ── 상수도소화용수설비 ──
  if (pd < YD.D19920728) {
    results.push(makeResult(categories.waterSupply, "상수도소화용수설비", "", "notRequired",
      "1992년 7월 28일 이전에는 상수도소화용수설비 기준이 없었습니다.", ""));
  } else {
    const waterSupplyReq = ta >= 5000;
    results.push(makeResult(categories.waterSupply, "상수도소화용수설비", "",
      waterSupplyReq ? "required" : "notRequired",
      waterSupplyReq ? "연면적이 5,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  }

  // ── 제연설비 ──
  if (pd < YD.D19820928) {
    results.push(makeResult(categories.fireSupport, "제연설비", "", "notRequired",
      "1982년 9월 28일 이전에는 배연설비(현 제연설비) 규정이 없었습니다.", ""));
  } else if (preBefore1992) {
    results.push(makeResult(categories.fireSupport, "제연설비", "", "notRequired",
      "이 시기 의료시설의 일반 거실(병실 등)은 배연설비(현 제연설비) 설치 대상에서 제외됩니다.", ""));
  } else {
    const smokeCtrlReq = ag >= 11;
    if (smokeCtrlReq) {
      results.push(makeResult(categories.fireSupport, "제연설비", "", "required",
        "지상 11층 이상으로 특별피난계단에 제연설비를 설치해야 합니다.", ""));
    }
  }

  // ── 연결송수관설비 ──
  let standpipeReq, standpipeReason;
  if (preBefore1992) {
    standpipeReq = ag >= 7 || (ag >= 5 && ta >= 6000);
    standpipeReason = ag >= 7 ? "지상층수가 7층 이상입니다." :
      (ag >= 5 && ta >= 6000) ? "지상층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (pre1994) {
    standpipeReq = ag >= 7 || (ag >= 5 && ta >= 6000) || bf >= 3;
    standpipeReason = ag >= 7 ? "지상층수가 7층 이상입니다." :
      (ag >= 5 && ta >= 6000) ? "지상층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    standpipeReq = tf >= 7 || (tf >= 5 && ta >= 6000) || (bf >= 3 && ba >= 1000);
    standpipeReason = tf >= 7 ? "전체 층수가 7층 이상입니다." :
      (tf >= 5 && ta >= 6000) ? "전체 층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다." :
      (bf >= 3 && ba >= 1000) ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.fireSupport, "연결송수관설비", "", standpipeReq ? "required" : "notRequired", standpipeReason, ""));

  // ── 연결살수설비 ──
  let connSprayReq, connSprayReason;
  if (pd < YD.D19900701) {
    connSprayReq = ba >= 700;
    connSprayReason = connSprayReq ? "지하층 바닥면적 합계가 700㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    connSprayReq = ba >= 150;
    connSprayReason = connSprayReq ? "지하층 바닥면적 합계가 150㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.fireSupport, "연결살수설비", "", connSprayReq ? "required" : "notRequired", connSprayReason, ""));

  // ── 비상콘센트설비 ──
  let emConsentReq, emConsentReason;
  if (preBefore1992) {
    emConsentReq = ag >= 11;
    emConsentReason = emConsentReq ? "지상층수가 11층 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (pre1994) {
    emConsentReq = ag >= 11 || bf >= 3;
    emConsentReason = ag >= 11 ? "지상층수가 11층 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    emConsentReq = ag >= 11 || (bf >= 3 && ba >= 1000);
    emConsentReason = ag >= 11 ? "지상층수가 11층 이상입니다." :
      (bf >= 3 && ba >= 1000) ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.fireSupport, "비상콘센트설비", "", emConsentReq ? "required" : "notRequired", emConsentReason, ""));

  // ── 무선통신보조설비 ──
  let radioReq, radioReason;
  if (pd < YD.D19920728) {
    radioReason = "1992년 7월 28일 이전에는 무선통신보조설비 기준이 일반 소방대상물에 적용되지 않았습니다.";
    results.push(makeResult(categories.fireSupport, "무선통신보조설비", "", "notRequired", radioReason, ""));
  } else if (pre1994) {
    radioReq = ba >= 3000 || bf >= 3;
    radioReason = ba >= 3000 ? "지하층 바닥면적 합계가 3,000㎡ 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.fireSupport, "무선통신보조설비", "", radioReq ? "required" : "notRequired", radioReason, ""));
  } else {
    radioReq = ba >= 3000 || (bf >= 3 && ba >= 1000);
    radioReason = ba >= 3000 ? "지하층 바닥면적 합계가 3,000㎡ 이상입니다." :
      (bf >= 3 && ba >= 1000) ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.fireSupport, "무선통신보조설비", "", radioReq ? "required" : "notRequired", radioReason, ""));
  }

  return results;
}

// 분법 이전 공동주택(아파트) 의무관리대상(공동주택관리령 제7조) 판정
// 자동화재탐지설비·물분무등(부설 차고)·공기안전매트에 공통 사용
function yIsAptMgmtTarget(households, aboveFloors) {
  if (households >= 300) return true;
  if (households >= 150 && aboveFloors >= 6) return true; // 6층 이상 = 승강기 설치로 간주
  return false;
}

function yearEvaluateApartmentBefore2004(inp) {
  const results = [];
  const { pd } = inp;
  // 단지 단위 근사: 지상 연면적만 동당 평균(단지 합계÷동수)으로 판정.
  // 지하 바닥면적(통합 지하주차장 등)·층수·세대수는 단지 통합/최고 기준이라 나누지 않음.
  const dongCount = inp.aptBuildingCount || 1;
  const ta = dongCount > 0 ? inp.totalArea / dongCount : inp.totalArea;
  const ag = inp.aboveGroundFloors;
  const bf = inp.basementFloors;
  const ba = inp.basementAreaSum; // 통합 지하 기준 — 동수로 나누지 않음
  const tf = inp.totalFloors;
  const wl = inp.windowlessArea;
  const hasBasement = bf > 0;
  const hasWL = inp.hasWindowlessFloor;
  const bsmtAvg = bf > 0 ? ba / bf : 0;
  const hasBasement450 = hasBasement && bsmtAvg >= 450;
  const hasBasement600 = hasBasement && bsmtAvg >= 600;
  const hasWL450 = hasWL && wl >= 450;
  const hasWL600 = hasWL && wl >= 600;
  const households = inp.before2004AptHouseholds;
  const corridor = inp.before2004AptCorridorType; // 'gat' | 'pyeon' | 'none'
  const elecArea = inp.aptElectricalRoomArea;
  const parkingArea = inp.aptIndoorParkingArea;
  const f12 = inp.aptFirstSecondFloorArea;
  const mgmtTarget = yIsAptMgmtTarget(households, ag);

  const pre1984 = pd < YD.D19840701;
  const preBefore1992 = pd < YD.D19920728;
  const pre1994 = pd < YD.D19940720;

  // ── 소화기구 ──
  let extReq, extReason;
  if (preBefore1992) {
    extReq = ta >= 150;
    extReason = extReq
      ? "연면적 150㎡ 이상인 공동주택입니다. (당시 4층 이상 공동주택 기준)"
      : "연면적 150㎡ 미만이어서 설치 대상이 아닙니다. 다만 지하층·무창층·3층 이상 층 중 바닥면적 50㎡ 이상인 층이 있으면 설치 대상입니다.";
  } else {
    extReq = ta >= 33;
    extReason = extReq ? "연면적 33㎡ 이상입니다. (용도무관 공통 기준)" : "연면적 33㎡ 미만이어서 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.extinguishing, "소화기구", "", extReq ? "required" : "notRequired", extReason, ""));

  // ── 자동식소화기(주방) ── 아파트 전용
  let kitReq, kitReason;
  if (pre1994) {
    kitReq = false;
    kitReason = "1994년 7월 20일 이전에는 아파트 자동식소화기 의무 기준이 없었습니다. (가스 사용 주방에는 자동확산소화용구를 별도로 둘 수 있습니다.)";
  } else if (pd < YD.D19970927) {
    kitReq = ag >= 11;
    kitReason = ag >= 11
      ? "11층 이상 아파트로 11층 이상의 층 주방에 자동식소화기를 설치합니다."
      : "11층 미만 아파트는 자동식소화기 의무 대상이 아닙니다.";
  } else {
    kitReq = ag >= 11;
    kitReason = ag >= 11
      ? "11층 이상 아파트로 6층 이상의 층 주방에 자동식소화기를 설치합니다. (1997.9.27~ 6층 이상으로 확대)"
      : "11층 미만 아파트는 자동식소화기 의무 대상이 아닙니다.";
  }
  results.push(makeResult(categories.extinguishing, "자동식소화기", "", kitReq ? "required" : "notRequired", kitReason, ""));

  // ── 옥내소화전설비 ──
  let hydrantReq, hydrantReason;
  if (preBefore1992) {
    const lf = inp.before2004AptHasLargeFloor450;
    hydrantReq = ta >= 2100 || lf;
    hydrantReason = ta >= 2100
      ? (pre1984 ? "연면적 2,100㎡ 이상입니다." : "연면적 2,100㎡ 이상으로 전 층에 설치합니다.")
      : lf
        ? (pre1984
            ? "지하층·무창층·4층 이상 층 중 바닥면적 450㎡ 이상인 층이 있어 해당 층에 설치합니다."
            : "지하층·무창층·4층 이상 층 중 바닥면적 450㎡ 이상인 층이 있어 전 층에 설치합니다.")
        : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    const lf = inp.before2004AptHasLargeFloor600;
    hydrantReq = ta >= 3000 || lf;
    hydrantReason = ta >= 3000
      ? "연면적 3,000㎡ 이상으로 전 층에 설치합니다."
      : lf
        ? "지하층·무창층·4층 이상 층 중 바닥면적 600㎡ 이상인 층이 있어 전 층에 설치합니다."
        : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    if (pd >= YD.D20020330 && hydrantReq) hydrantReason += " (2002.3.30~ 아파트는 호스릴옥내소화전설비로 갈음 가능)";
  }
  results.push(makeResult(categories.extinguishing, "옥내소화전설비", "", hydrantReq ? "required" : "notRequired", hydrantReason, ""));

  // ── 스프링클러설비 ── 아파트 16층 기준 (1990.7.1~, 그 이전에는 항목 미표시)
  if (pd >= YD.D19900701) {
    let spStatus, spReason;
    if (ag >= 16) {
      spStatus = "required";
      spReason = "16층 이상 아파트로 16층 이상의 층에 스프링클러설비를 설치합니다.";
    } else {
      spStatus = "notRequired";
      spReason = "16층 미만 아파트는 스프링클러 의무 대상이 아닙니다. (11층 이상 층 중 방화구획되지 않은 부분은 별도 검토)";
    }
    results.push(makeResult(categories.extinguishing, "스프링클러설비", "", spStatus, spReason, ""));
  }

  // ── 간이스프링클러설비 ──
  results.push(makeResult(categories.extinguishing, "간이스프링클러설비", "", "notRequired",
    "분법 이전 시기에는 공동주택에 대한 간이스프링클러설비 설치 의무가 없었습니다.", ""));

  // ── 물분무등소화설비 ──
  let wsReq, wsReason;
  if (preBefore1992) {
    wsReq = elecArea >= 300;
    wsReason = wsReq ? "전기실·발전실·변전실 등 바닥면적이 300㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (pd < YD.D19950810) {
    const garageReq = parkingArea >= 200 && mgmtTarget;
    wsReq = elecArea >= 300 || garageReq;
    wsReason = elecArea >= 300 ? "전기실·발전실 등 바닥면적이 300㎡ 이상입니다."
      : garageReq ? "의무관리대상 아파트의 부설 차고·주차장 바닥면적이 200㎡ 이상입니다. (1992.7.28~1995.8.9 공동주택관리령 제7조 한정)"
      : (parkingArea >= 200 ? "부설 차고가 200㎡ 이상이나 의무관리대상(300세대↑ 또는 150세대↑·6층↑) 아파트가 아니어서 이 시기에는 제외됩니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.");
  } else {
    wsReq = elecArea >= 300 || parkingArea >= 200;
    wsReason = elecArea >= 300 ? "전기실·발전실 등 바닥면적이 300㎡ 이상입니다."
      : parkingArea >= 200 ? "건물 내 차고·주차장 바닥면적이 200㎡ 이상입니다."
      : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.extinguishing, "물분무등소화설비", "", wsReq ? "required" : "notRequired", wsReason, ""));

  // ── 옥외소화전설비 ──
  results.push(makeResult(categories.extinguishing, "옥외소화전설비", "",
    f12 >= 9000 ? "required" : "notRequired",
    f12 >= 9000 ? "지상 1층과 2층의 바닥면적 합계가 9,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 비상경보설비 ──
  const emAlarmReq = ta >= 400 || (hasBasement && ba >= 150) || (hasWL && wl >= 150);
  const emAlarmReason = ta >= 400 ? "연면적이 400㎡ 이상입니다."
    : (hasBasement && ba >= 150) ? "지하층 바닥면적 합계가 150㎡ 이상입니다."
    : (hasWL && wl >= 150) ? "무창층 바닥면적이 150㎡ 이상입니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  results.push(makeResult(categories.alarm, "비상경보설비", "", emAlarmReq ? "required" : "notRequired", emAlarmReason, ""));

  // ── 자동화재탐지설비 ── 아파트 제7조 한정 구간 처리
  let detReq, detReason;
  if (preBefore1992) {
    detReq = ta >= 1000 || inp.before2004AptDetFloor600;
    detReason = ta >= 1000 ? "연면적 1,000㎡ 이상인 공동주택입니다."
      : inp.before2004AptDetFloor600 ? "지하층·무창층·3층 이상 층 중 바닥면적 600㎡ 이상인 층이 있어 설치 대상입니다."
      : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (pd < YD.D19940720) {
    detReq = ta >= 1000;
    detReason = detReq ? "아파트·기숙사로서 연면적 1,000㎡ 이상입니다." : "연면적 1,000㎡ 미만이어서 설치 대상이 아닙니다.";
  } else if (pd < YD.D20010320) {
    detReq = ta >= 1000 && mgmtTarget;
    detReason = (ta >= 1000)
      ? (mgmtTarget
          ? "연면적 1,000㎡ 이상이고 의무관리대상(300세대↑ 또는 150세대↑·6층↑) 아파트로 설치 대상입니다. (1994.7.20~2001.3.19 공동주택관리령 제7조 한정)"
          : "연면적 1,000㎡ 이상이나 의무관리대상 아파트가 아니어서 이 시기에는 설치 대상이 아닙니다. (공동주택관리령 제7조 한정)")
      : "연면적 1,000㎡ 미만이어서 설치 대상이 아닙니다.";
  } else {
    detReq = ta >= 1000;
    detReason = detReq ? "아파트·기숙사로서 연면적 1,000㎡ 이상입니다. (2001.3.20~ 모든 아파트로 확대)" : "연면적 1,000㎡ 미만이어서 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.alarm, "자동화재탐지설비", "", detReq ? "required" : "notRequired", detReason, ""));

  // ── 비상방송설비 ──
  let bcReq, bcReason;
  if (pre1994) {
    bcReq = ta >= 3500 || ag >= 11 || bf >= 3;
    bcReason = ta >= 3500 ? "연면적이 3,500㎡ 이상입니다." : ag >= 11 ? "지상층수가 11층 이상입니다." : bf >= 3 ? "지하층수가 3층 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    bcReq = ta >= 3500 || tf >= 11 || bf >= 3;
    bcReason = ta >= 3500 ? "연면적이 3,500㎡ 이상입니다." : tf >= 11 ? "전체 층수가 11층 이상입니다." : bf >= 3 ? "지하층수가 3층 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.alarm, "비상방송설비", "", bcReq ? "required" : "notRequired", bcReason, ""));

  // ── 자동화재속보설비 ──
  results.push(makeResult(categories.alarm, "자동화재속보설비", "", "notRequired",
    "분법 이전 시기에는 공동주택(아파트)에 대한 자동화재속보설비 설치 의무가 없었습니다.", ""));

  // ── 피난기구 ──
  const corridorExempt = corridor !== "none" && pd >= YD.D19820915;
  if (corridorExempt) {
    results.push(makeResult(categories.evacuation, "피난기구", "", "notRequired",
      (corridor === "gat" ? "갓복도형" : "편복도형") + " 아파트로 피난기구 설치가 면제됩니다. (1982.9.15~ 편복도형 면제)", ""));
  } else {
    results.push(makeResult(categories.evacuation, "피난기구", "", "review",
      "피난층·2층·11층 이상의 층을 제외한 층에 피난기구를 설치합니다. 설치 여부·수량은 층별 수용인원 등에 따라 달라지므로 직접 확인하세요. (편복도형·갓복도형 아파트는 면제)", ""));
  }

  // ── 공기안전매트 (피난기구, 별도 추가) ──
  if (pd < YD.D19931111) {
    results.push(makeResult(categories.evacuation, "공기안전매트", "", "notRequired",
      "1993년 11월 11일 이전에는 공동주택 공기안전매트 규정이 없었습니다.", ""));
  } else if (mgmtTarget) {
    results.push(makeResult(categories.evacuation, "공기안전매트", "", "required",
      "150세대 이상(승강기 설치) 또는 300세대 이상 아파트로 공기안전매트를 추가로 설치합니다. (1993.11.11~, 편복도형이어도 별도 설치)", ""));
  } else {
    results.push(makeResult(categories.evacuation, "공기안전매트", "", "notRequired",
      "300세대 미만(또는 150세대 미만·6층 미만) 아파트로 공기안전매트 추가 설치 대상이 아닙니다.", ""));
  }

  // ── 인명구조기구 ──
  results.push(makeResult(categories.evacuation, "인명구조기구", "", "notRequired",
    "인명구조기구는 관광호텔(7층 이상)·병원(5층 이상)에만 설치하며, 공동주택은 의무 대상이 아닙니다.", ""));

  // ── 유도등 및 유도표지 ──
  if (preBefore1992) {
    results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "required",
      "지하층·무창층 또는 11층 이상의 층에는 피난구·통로유도등을 설치하고, 그 밖의 층에는 유도표지를 설치합니다.", ""));
  } else {
    results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "required",
      "모든 소방대상물에 피난구유도등·통로유도등·유도표지를 설치합니다. (1992.7.28~ 용도무관)", ""));
  }

  // ── 비상조명등 ──
  if (pd < YD.D19840701) {
    results.push(makeResult(categories.evacuation, "비상조명등", "", "notRequired",
      "1984년 7월 1일 이전에는 비상조명등 규정이 없었습니다.", ""));
  } else {
    const bsmt450 = hasBasement && bsmtAvg >= 450;
    const wl450 = hasWL && wl >= 450;
    const emReq = (tf >= 5 && ta >= 3000) || bsmt450 || wl450;
    const emReason = (tf >= 5 && ta >= 3000)
      ? "전체 층수 5층 이상이고 연면적 3,000㎡ 이상입니다. (공동주택 거실은 제외, 복도·계단·통로 등에 설치)"
      : bsmt450 ? "지하층 바닥면적이 450㎡ 이상입니다."
      : wl450 ? "무창층 바닥면적이 450㎡ 이상입니다."
      : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.evacuation, "비상조명등", "", emReq ? "required" : "notRequired", emReason, ""));
  }

  // ── 상수도소화용수설비 ──
  if (pd < YD.D19920728) {
    results.push(makeResult(categories.waterSupply, "상수도소화용수설비", "", "notRequired",
      "1992년 7월 28일 이전에는 상수도소화용수설비 기준이 없었습니다. (아파트는 소화수조 설치 대상에서 제외)", ""));
  } else {
    const wsupReq = ta >= 5000;
    results.push(makeResult(categories.waterSupply, "상수도소화용수설비", "", wsupReq ? "required" : "notRequired",
      wsupReq ? "연면적이 5,000㎡ 이상입니다. (아파트는 소화수조 대상에서 제외되어 상수도소화용수설비로 적용)" : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  }

  // ── 제연설비 ── 특별피난계단·비상용승강기 승강장 유무를 층수로 도출
  // (비상용승강기: 높이 31m 초과 ≈ 지상 11층 이상 / 특별피난계단: 지하 3층 이상 등. 피난용승강기는 분법 이전 미존재)
  const hasHighRiseStairElev = ag >= 11 || bf >= 3;
  if (pd < YD.D19920728) {
    results.push(makeResult(categories.fireSupport, "제연설비", "", "notRequired",
      "1992년 7월 28일 이전에는 공동주택 제연설비(배연설비) 의무 기준이 없었습니다.", ""));
  } else if (!hasHighRiseStairElev) {
    results.push(makeResult(categories.fireSupport, "제연설비", "", "notRequired",
      "지상 11층 미만이고 지하 3층 미만이어서 특별피난계단·비상용승강기 승강장 제연설비 대상이 아닙니다.", ""));
  } else if (corridor === "gat" && pd >= YD.D19950810) {
    results.push(makeResult(categories.fireSupport, "제연설비", "", "notRequired",
      "갓복도형 아파트로 특별피난계단·비상용승강기 승강장 제연설비가 면제됩니다. (1995.8.10~)", ""));
  } else {
    const why = ag >= 11 ? "지상 11층 이상(비상용승강기·특별피난계단 설치 대상)" : "지하 3층 이상(특별피난계단 설치 대상)";
    results.push(makeResult(categories.fireSupport, "제연설비", "", "required",
      why + "으로 특별피난계단 및 비상용승강기의 승강장에 제연설비를 설치합니다.", ""));
  }

  // ── 연결송수관설비 ──
  let spipeReq, spipeReason;
  if (preBefore1992) {
    spipeReq = ag >= 7 || (ag >= 5 && ta >= 6000);
    spipeReason = ag >= 7 ? "지상층수가 7층 이상입니다." : (ag >= 5 && ta >= 6000) ? "지상층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (pre1994) {
    spipeReq = ag >= 7 || (ag >= 5 && ta >= 6000) || bf >= 3;
    spipeReason = ag >= 7 ? "지상층수가 7층 이상입니다." : (ag >= 5 && ta >= 6000) ? "지상층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다." : bf >= 3 ? "지하층수가 3층 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    spipeReq = tf >= 7 || (tf >= 5 && ta >= 6000) || (bf >= 3 && ba >= 1000);
    spipeReason = tf >= 7 ? "전체 층수가 7층 이상입니다." : (tf >= 5 && ta >= 6000) ? "전체 층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다." : (bf >= 3 && ba >= 1000) ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.fireSupport, "연결송수관설비", "", spipeReq ? "required" : "notRequired", spipeReason, ""));

  // ── 연결살수설비 ──
  let csReq, csReason;
  if (pd < YD.D19900701) {
    csReq = ba >= 700;
    csReason = csReq ? "지하층 바닥면적 합계가 700㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    csReq = ba >= 150;
    csReason = csReq ? "지하층 바닥면적 합계가 150㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.fireSupport, "연결살수설비", "", csReq ? "required" : "notRequired", csReason, ""));

  // ── 비상콘센트설비 ──
  let ecReq, ecReason;
  if (preBefore1992) {
    ecReq = ag >= 11;
    ecReason = ecReq ? "지상층수가 11층 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (pre1994) {
    ecReq = ag >= 11 || bf >= 3;
    ecReason = ag >= 11 ? "지상층수가 11층 이상입니다." : bf >= 3 ? "지하층수가 3층 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    ecReq = ag >= 11 || (bf >= 3 && ba >= 1000);
    ecReason = ag >= 11 ? "지상층수가 11층 이상입니다." : (bf >= 3 && ba >= 1000) ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.fireSupport, "비상콘센트설비", "", ecReq ? "required" : "notRequired", ecReason, ""));

  // ── 무선통신보조설비 ──
  if (pd < YD.D19920728) {
    results.push(makeResult(categories.fireSupport, "무선통신보조설비", "", "notRequired",
      "1992년 7월 28일 이전에는 일반 건축물·공동주택에 무선통신보조설비 기준이 적용되지 않았습니다.", ""));
  } else if (pre1994) {
    const rdReq = ba >= 3000 || bf >= 3;
    const rdReason = ba >= 3000 ? "지하층 바닥면적 합계가 3,000㎡ 이상입니다." : bf >= 3 ? "지하층수가 3층 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.fireSupport, "무선통신보조설비", "", rdReq ? "required" : "notRequired", rdReason, ""));
  } else {
    const rdReq = ba >= 3000 || (bf >= 3 && ba >= 1000);
    let rdReason = ba >= 3000 ? "지하층 바닥면적 합계가 3,000㎡ 이상입니다." : (bf >= 3 && ba >= 1000) ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    if (pd >= YD.D19950810 && rdReq) rdReason += " (이동통신구내선로설비 등을 설치한 경우 면제 가능)";
    results.push(makeResult(categories.fireSupport, "무선통신보조설비", "", rdReq ? "required" : "notRequired", rdReason, ""));
  }

  return results;
}

// 시설명별 합집합: 동일 시설은 더 강한 상태(required>review>notRequired) 채택, 없던 시설은 추가
function mergeAptUnionResults(base, extra) {
  const rank = { required: 3, review: 2, notRequired: 1 };
  extra.forEach((e) => {
    const b = base.find((x) => x.name === e.name);
    if (!b) { base.push(e); return; }
    if ((rank[e.status] || 0) > (rank[b.status] || 0)) {
      b.status = e.status;
      b.reason = e.reason;
    }
  });
  return base;
}

// 별동 주차장(주차전용 건축물)을 독립 소방대상물로 판정. 주거동 엔진 재사용 + 주차장 무관 항목 제거.
function yearEvaluateParkingBuildingBefore2004(inp) {
  const pAg = inp.aptParkingAbove || 0;
  const pBf = inp.aptParkingBelow || 0;
  const pInp = Object.assign({}, inp, {
    totalArea: inp.aptParkingArea,
    aboveGroundFloors: pAg,
    basementFloors: pBf,
    basementAreaSum: inp.aptParkingBasementArea,
    totalFloors: pAg + pBf,
    windowlessArea: 0,
    hasWindowlessFloor: false,
    aptBuildingCount: 1,                 // 주차장 별동은 1동 취급(면적 안 나눔)
    before2004AptHouseholds: 999999,     // 독립 주차장: 차고 물분무·자탐을 제7조 무관하게 적용되도록 강제
    before2004AptCorridorType: "none",
    aptElectricalRoomArea: 0,
    aptIndoorParkingArea: inp.aptParkingArea, // 전체가 주차 용도 → 물분무(200㎡) 판정
    aptFirstSecondFloorArea: 0,
  });
  let r = yearEvaluateApartmentBefore2004(pInp);
  // 주차장 별동에 무의미한 항목 제거 (주방 자동식소화기·공기안전매트)
  r = r.filter((x) => !["자동식소화기", "공기안전매트"].includes(x.name));
  r.forEach((x) => { x.reason = "[별동 주차장] " + x.reason; });
  return r;
}

function yearEvaluateElderlyBefore2004(inp) {
  const results = [];
  const { pd } = inp;

  const ta  = inp.totalArea;
  const ag  = inp.aboveGroundFloors;
  const bf  = inp.basementFloors;
  const tf  = ag + bf;
  const ba  = inp.basementArea;
  const bsmtAvg = bf > 0 ? ba / bf : 0;
  const wl  = inp.windowlessArea;

  const hasBasement  = bf > 0;
  const hasWL        = wl > 0;

  const pre1984      = pd < YD.D19840701;
  const preBefore1992 = pd < YD.D19920728;
  const pre1991      = pd < YD.D19910723;
  const pre1994      = pd < YD.D19940620;
  const pre2001      = pd < YD.D20010724;
  const pre1999      = pd < YD.D19990729;

  const parkingArea  = inp.before2004ElderlyIndoorParkingArea;
  const mechParking  = inp.before2004ElderlyMechanicalParkingCapacity;
  const elecArea     = inp.before2004ElderlyElectricalRoomArea;

  // ── 소화기구 ──
  if (preBefore1992) {
    const extReq = ta >= 150;
    results.push(makeResult(categories.extinguishing, "소화기구", "",
      extReq ? "required" : "notRequired",
      extReq ? "연면적이 150㎡ 이상입니다." : "연면적 150㎡ 미만으로 설치 대상이 아닙니다.", ""));
  } else {
    const extReq = ta >= 33;
    results.push(makeResult(categories.extinguishing, "소화기구", "",
      extReq ? "required" : "notRequired",
      extReq ? "연면적이 33㎡ 이상입니다." : "연면적 33㎡ 미만으로 설치 대상이 아닙니다.", ""));
  }

  // ── 옥내소화전설비 ──
  if (pre1984) {
    const ihReq = ta >= 2100 || inp.before2004ElderlyHasLargeFloor450;
    results.push(makeResult(categories.extinguishing, "옥내소화전설비", "",
      ihReq ? "required" : "notRequired",
      ta >= 2100 ? "연면적이 2,100㎡ 이상입니다." :
      inp.before2004ElderlyHasLargeFloor450 ? "지하층·무창층·4층 이상 층 중 바닥면적 450㎡ 이상인 층이 있어 해당 층에 설치 대상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  } else if (preBefore1992) {
    const ihReq = ta >= 2100 || inp.before2004ElderlyHasLargeFloor450;
    results.push(makeResult(categories.extinguishing, "옥내소화전설비", "",
      ihReq ? "required" : "notRequired",
      ta >= 2100 ? "연면적이 2,100㎡ 이상입니다." :
      inp.before2004ElderlyHasLargeFloor450 ? "지하층·무창층·4층 이상 층 중 바닥면적 450㎡ 이상인 층이 있어 전 층 설치 대상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  } else {
    const ihReq = ta >= 1500 || inp.before2004ElderlyHasLargeFloor300;
    results.push(makeResult(categories.extinguishing, "옥내소화전설비", "",
      ihReq ? "required" : "notRequired",
      ta >= 1500 ? "연면적이 1,500㎡ 이상입니다." :
      inp.before2004ElderlyHasLargeFloor300 ? "지하층·무창층·4층 이상 층 중 바닥면적 300㎡ 이상인 층이 있어 전 층 설치 대상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  }

  // ── 스프링클러설비 ──
  if (pre1984) {
    // 1,500㎡ 기준, 해당 층 설치
    const splkReq = inp.before2004ElderlySprinklerFloor || ag >= 11;
    results.push(makeResult(categories.extinguishing, "스프링클러설비", "",
      splkReq ? "required" : "notRequired",
      ag >= 11 ? "지상층수가 11층 이상으로 11층 이상 부분에 설치 대상입니다." :
      inp.before2004ElderlySprinklerFloor ? "지하층·무창층 또는 4층~10층 중 바닥면적 1,500㎡ 이상인 층이 있어 해당 층에 설치 대상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  } else if (preBefore1992) {
    // 1984~1992: 1,000㎡ 기준, 해당 층 설치
    const splkReq = inp.before2004ElderlySprinklerFloor || ag >= 11;
    results.push(makeResult(categories.extinguishing, "스프링클러설비", "",
      splkReq ? "required" : "notRequired",
      ag >= 11 ? "지상층수가 11층 이상으로 11층 이상 부분에 설치 대상입니다." :
      inp.before2004ElderlySprinklerFloor ? "지하층·무창층 또는 4층~10층 중 바닥면적 1,000㎡ 이상인 층이 있어 해당 층에 설치 대상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  } else if (pre2001) {
    // 1992~2001: 전 층 설치
    const splkReq = inp.before2004ElderlyLargeFloor1000 || ag >= 11;
    results.push(makeResult(categories.extinguishing, "스프링클러설비", "",
      splkReq ? "required" : "notRequired",
      ag >= 11 ? "지상층수가 11층 이상으로 전 층 설치 대상입니다." :
      inp.before2004ElderlyLargeFloor1000 ? "지하층·무창층·4층 이상 층 중 바닥면적 1,000㎡ 이상인 층이 있어 전 층 설치 대상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  } else {
    // 2001~2004: ta>=600이면 전 층 설치
    const splkReq = ta >= 600 || inp.before2004ElderlyLargeFloor1000 || ag >= 11;
    results.push(makeResult(categories.extinguishing, "스프링클러설비", "",
      splkReq ? "required" : "notRequired",
      ta >= 600 ? "연면적이 600㎡ 이상으로 전 층 설치 대상입니다." :
      ag >= 11 ? "지상층수가 11층 이상으로 전 층 설치 대상입니다." :
      inp.before2004ElderlyLargeFloor1000 ? "지하층·무창층·4층 이상 층 중 바닥면적 1,000㎡ 이상인 층이 있어 전 층 설치 대상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  }

  // ── 간이스프링클러 ──
  results.push(makeResult(categories.extinguishing, "간이스프링클러설비", "", "notRequired",
    "분법 이전(~2004.5.29) 노유자시설은 간이스프링클러설비 설치 대상이 아닙니다.", ""));

  // ── 물분무등소화설비 ──
  if (pre1984) {
    const waterSprayReq = elecArea >= 300;
    results.push(makeResult(categories.extinguishing, "물분무등소화설비", "",
      waterSprayReq ? "required" : "notRequired",
      waterSprayReq ? "발전실·변전실 바닥면적이 300㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  } else if (preBefore1992) {
    const waterSprayReq = elecArea >= 300;
    results.push(makeResult(categories.extinguishing, "물분무등소화설비", "",
      waterSprayReq ? "required" : "notRequired",
      waterSprayReq ? "전기실·발전실·변전실·전산실 바닥면적이 300㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  } else {
    const waterSprayReq = parkingArea >= 200 || mechParking >= 20 || elecArea >= 300;
    results.push(makeResult(categories.extinguishing, "물분무등소화설비", "",
      waterSprayReq ? "required" : "notRequired",
      parkingArea >= 200 ? "차고·주차장 바닥면적이 200㎡ 이상입니다." :
      mechParking >= 20 ? "기계식 주차 대수가 20대 이상입니다." :
      elecArea >= 300 ? "전기실·발전실·변전실·전산실 바닥면적이 300㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  }

  // ── 비상경보설비 ──
  if (pre1991) {
    results.push(makeResult(categories.alarm, "비상경보설비", "", "review",
      "1991년 7월 이전에는 수용인원 100인 이상인 소방대상물에 비상경보설비를 설치해야 합니다. 수용인원을 직접 확인하세요.", ""));
  } else {
    const alarmReq = ta >= 400 || (hasBasement && bsmtAvg >= 150) || (hasWL && wl >= 150);
    results.push(makeResult(categories.alarm, "비상경보설비", "",
      alarmReq ? "required" : "notRequired",
      ta >= 400 ? "연면적이 400㎡ 이상입니다." :
      (hasBasement && bsmtAvg >= 150) ? "지하층 평균 바닥면적이 150㎡ 이상입니다." :
      (hasWL && wl >= 150) ? "무창층 바닥면적이 150㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  }

  // ── 비상방송설비 ──
  if (pre1991) {
    if (ag >= 11 || bf >= 3) {
      results.push(makeResult(categories.alarm, "비상방송설비", "", "required",
        ag >= 11 ? "지상층수가 11층 이상입니다." : "지하층수가 3층 이상입니다.", ""));
    } else {
      results.push(makeResult(categories.alarm, "비상방송설비", "", "review",
        "1991년 7월 이전에는 수용인원 300인 이상인 소방대상물에 비상방송설비를 설치해야 합니다. 수용인원을 직접 확인하세요.", ""));
    }
  } else if (preBefore1992) {
    // 1991~1992: 노유자시설 전용 기준 ta>=1500
    const bcReq = ta >= 1500;
    results.push(makeResult(categories.alarm, "비상방송설비", "",
      bcReq ? "required" : "notRequired",
      bcReq ? "연면적이 1,500㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  } else if (pre1994) {
    const bcReq = ta >= 3500 || ag >= 11 || bf >= 3;
    results.push(makeResult(categories.alarm, "비상방송설비", "",
      bcReq ? "required" : "notRequired",
      ta >= 3500 ? "연면적이 3,500㎡ 이상입니다." :
      ag >= 11 ? "지상층수가 11층 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  } else {
    const bcReq = ta >= 3500 || tf >= 11 || bf >= 3;
    results.push(makeResult(categories.alarm, "비상방송설비", "",
      bcReq ? "required" : "notRequired",
      ta >= 3500 ? "연면적이 3,500㎡ 이상입니다." :
      tf >= 11 ? "전체 층수가 11층 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  }

  // ── 자동화재탐지설비 ──
  if (pre1984) {
    const detReq = ta >= 600 || inp.before2004ElderlyAutoDetFloor300;
    results.push(makeResult(categories.alarm, "자동화재탐지설비", "",
      detReq ? "required" : "notRequired",
      ta >= 600 ? "연면적이 600㎡ 이상입니다." :
      inp.before2004ElderlyAutoDetFloor300 ? "지하층·무창층·3층 이상 층 중 바닥면적 300㎡ 이상인 층이 있어 해당 층에 설치 대상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  } else if (preBefore1992) {
    const detReq = ta >= 600 || inp.before2004ElderlyAutoDetFloor300;
    results.push(makeResult(categories.alarm, "자동화재탐지설비", "",
      detReq ? "required" : "notRequired",
      ta >= 600 ? "연면적이 600㎡ 이상입니다." :
      inp.before2004ElderlyAutoDetFloor300 ? "지하층·무창층·3층 이상 층 중 바닥면적 300㎡ 이상인 층이 있어 전 층 설치 대상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  } else if (pre2001) {
    const detReq = ta >= 600;
    results.push(makeResult(categories.alarm, "자동화재탐지설비", "",
      detReq ? "required" : "notRequired",
      detReq ? "연면적이 600㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  } else {
    // 2001~2004: ta>=600 required, 400<=ta<600 review
    if (ta >= 600) {
      results.push(makeResult(categories.alarm, "자동화재탐지설비", "", "required",
        "연면적이 600㎡ 이상입니다.", ""));
    } else if (ta >= 400) {
      results.push(makeResult(categories.alarm, "자동화재탐지설비", "", "review",
        "연면적이 400㎡ 이상 600㎡ 미만인 경우 수용인원 100인 이상이면 설치 대상입니다. 수용인원을 직접 확인하세요.", ""));
    } else {
      results.push(makeResult(categories.alarm, "자동화재탐지설비", "", "notRequired",
        "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
    }
  }

  // ── 자동화재속보설비 ──
  if (pre1999) {
    results.push(makeResult(categories.alarm, "자동화재속보설비", "", "notRequired",
      "1999년 7월 29일 이전에는 노유자시설의 자동화재속보설비 설치 기준이 없었습니다.", ""));
  } else {
    const notifyReq = inp.before2004ElderlyHasFloor500Plus;
    results.push(makeResult(categories.alarm, "자동화재속보설비", "",
      notifyReq ? "required" : "notRequired",
      notifyReq ? "바닥면적이 500㎡ 이상인 층이 있어 설치 대상입니다." :
      "바닥면적이 500㎡ 이상인 층이 없어 설치 대상이 아닙니다.", ""));
  }

  // ── 피난기구 ──
  if (preBefore1992) {
    const hasEligibleFloor = ag >= 3 || bf > 0;
    results.push(makeResult(categories.evacuation, "피난기구", "", hasEligibleFloor ? "required" : "review",
      "1992년 7월 28일 이전에는 수용인원 20인 이상인 소방대상물에 피난기구를 설치해야 합니다. 설치 여부는 수용인원 기준으로 판단하므로 실제 충족 여부는 소방법 시행규칙 [별표1] 수용인원산정법에 따라 직접 확인하세요.", ""));
  } else {
    const evacReq = ag >= 3 || bf > 0;
    results.push(makeResult(categories.evacuation, "피난기구", "",
      evacReq ? "required" : "notRequired",
      evacReq
        ? "노유자시설은 피난층·1층·2층·11층 이상 층을 제외한 층에 피난기구를 설치합니다."
        : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  }

  // ── 인명구조기구 ──
  results.push(makeResult(categories.evacuation, "인명구조기구", "", "notRequired",
    "분법 이전(~2004.5.29) 노유자시설은 인명구조기구 설치 대상이 아닙니다.", ""));

  // ── 유도등 및 유도표지 ──
  if (pre1984) {
    if (hasBasement || hasWL || ag >= 11) {
      results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "required",
        "지하층·무창층 또는 11층 이상의 층에 피난구·통로유도등을 설치하고, 나머지 층에는 유도표지를 설치합니다.", ""));
    } else {
      results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "required",
        "기본적으로 유도표지를 설치하며, 지하층·무창층 또는 11층 이상의 층에는 피난구·통로유도등을 설치합니다.", ""));
    }
  } else if (preBefore1992) {
    results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "required",
      "노유자시설로 건물 전 층에 소형 피난구유도등·통로유도등을 설치합니다.", ""));
  } else {
    results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "required",
      "모든 노유자시설에 피난구유도등, 통로유도등, 유도표지를 설치합니다.", ""));
  }

  // ── 비상조명등 ──
  if (pre1984) {
    results.push(makeResult(categories.evacuation, "비상조명등", "", "notRequired",
      "1984년 7월 이전에는 비상조명등 규정이 없었습니다.", ""));
  } else {
    const bsmtAvg450 = hasBasement && bsmtAvg >= 450;
    const wlss450 = hasWL && wl >= 450;
    const emLightReq = (tf >= 5 && ta >= 3000) || bsmtAvg450 || wlss450;
    const emLightReason = tf >= 5 && ta >= 3000
      ? "전체 층수가 5층 이상이고 연면적이 3,000㎡ 이상입니다."
      : bsmtAvg450 ? "지하층 바닥면적이 450㎡ 이상입니다."
      : wlss450 ? "무창층 바닥면적이 450㎡ 이상입니다."
      : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.evacuation, "비상조명등", "", emLightReq ? "required" : "notRequired", emLightReason, ""));
  }

  // ── 상수도소화용수설비 ──
  if (preBefore1992) {
    results.push(makeResult(categories.waterSupply, "상수도소화용수설비", "", "notRequired",
      "1992년 7월 28일 이전에는 상수도소화용수설비 기준이 없었습니다.", ""));
  } else {
    const waterSupplyReq = ta >= 5000;
    results.push(makeResult(categories.waterSupply, "상수도소화용수설비", "",
      waterSupplyReq ? "required" : "notRequired",
      waterSupplyReq ? "연면적이 5,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  }

  // ── 제연설비 ──
  if (preBefore1992) {
    results.push(makeResult(categories.fireSupport, "제연설비", "", "notRequired",
      "1992년 7월 28일 이전에는 노유자시설에 대한 배연설비(현 제연설비) 기준이 없었습니다.", ""));
  } else {
    const smokeCtrlReq = ag >= 11;
    if (smokeCtrlReq) {
      results.push(makeResult(categories.fireSupport, "제연설비", "", "required",
        "지상 11층 이상으로 특별피난계단에 제연설비를 설치해야 합니다.", ""));
    }
  }

  // ── 연결송수관설비 ──
  let standpipeReq, standpipeReason;
  if (preBefore1992) {
    standpipeReq = ag >= 7 || (ag >= 5 && ta >= 6000);
    standpipeReason = ag >= 7 ? "지상층수가 7층 이상입니다." :
      (ag >= 5 && ta >= 6000) ? "지상층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (pre1994) {
    standpipeReq = ag >= 7 || (ag >= 5 && ta >= 6000) || bf >= 3;
    standpipeReason = ag >= 7 ? "지상층수가 7층 이상입니다." :
      (ag >= 5 && ta >= 6000) ? "지상층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    standpipeReq = tf >= 7 || (tf >= 5 && ta >= 6000) || (bf >= 3 && ba >= 1000);
    standpipeReason = tf >= 7 ? "전체 층수가 7층 이상입니다." :
      (tf >= 5 && ta >= 6000) ? "전체 층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다." :
      (bf >= 3 && ba >= 1000) ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.fireSupport, "연결송수관설비", "", standpipeReq ? "required" : "notRequired", standpipeReason, ""));

  // ── 연결살수설비 ──
  let connSprayReq, connSprayReason;
  if (pd < YD.D19900701) {
    connSprayReq = ba >= 700;
    connSprayReason = connSprayReq ? "지하층 바닥면적 합계가 700㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    connSprayReq = ba >= 150;
    connSprayReason = connSprayReq ? "지하층 바닥면적 합계가 150㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.fireSupport, "연결살수설비", "", connSprayReq ? "required" : "notRequired", connSprayReason, ""));

  // ── 비상콘센트설비 ──
  let emConsentReq, emConsentReason;
  if (preBefore1992) {
    emConsentReq = ag >= 11;
    emConsentReason = emConsentReq ? "지상층수가 11층 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (pre1994) {
    emConsentReq = ag >= 11 || bf >= 3;
    emConsentReason = ag >= 11 ? "지상층수가 11층 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    emConsentReq = ag >= 11 || (bf >= 3 && ba >= 1000);
    emConsentReason = ag >= 11 ? "지상층수가 11층 이상입니다." :
      (bf >= 3 && ba >= 1000) ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.fireSupport, "비상콘센트설비", "", emConsentReq ? "required" : "notRequired", emConsentReason, ""));

  // ── 무선통신보조설비 ──
  let radioReq, radioReason;
  if (preBefore1992) {
    radioReason = "1992년 7월 28일 이전에는 무선통신보조설비 기준이 일반 소방대상물에 적용되지 않았습니다.";
    results.push(makeResult(categories.fireSupport, "무선통신보조설비", "", "notRequired", radioReason, ""));
  } else if (pre1994) {
    radioReq = ba >= 3000 || bf >= 3;
    radioReason = ba >= 3000 ? "지하층 바닥면적 합계가 3,000㎡ 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.fireSupport, "무선통신보조설비", "", radioReq ? "required" : "notRequired", radioReason, ""));
  } else {
    radioReq = ba >= 3000 || (bf >= 3 && ba >= 1000);
    radioReason = ba >= 3000 ? "지하층 바닥면적 합계가 3,000㎡ 이상입니다." :
      (bf >= 3 && ba >= 1000) ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.fireSupport, "무선통신보조설비", "", radioReq ? "required" : "notRequired", radioReason, ""));
  }

  return results;
}

function yearEvaluateSalesBefore2004(inp) {
  const results = [];
  const { pd } = inp;
  const ta = inp.totalArea;
  const ag = inp.aboveGroundFloors;
  const bf = inp.basementFloors;
  const ba = inp.basementAreaSum;
  const tf = inp.totalFloors;
  const wl = inp.windowlessArea;
  const bsmtAvg = bf > 0 ? ba / bf : 0;
  const hasBasement = bf > 0;
  const hasWL = inp.hasWindowlessFloor;
  const salesArea = inp.before2004SalesArea;

  const pre1984       = pd < YD.D19840701;
  const preBefore1992 = pd < YD.D19920728;
  const pre1994       = pd < YD.D19940720;
  const pre1991       = pd < YD.D19910108;
  const pre2001       = pd < YD.D20010521;

  // ── 소화기구 ──
  let extReq, extReason;
  if (preBefore1992) {
    extReq = ta >= 150;
    extReason = extReq
      ? "연면적 150㎡ 이상인 판매시설(구 「시장」, 제1종 장소)입니다."
      : "연면적 150㎡ 미만이어서 설치 대상이 아닙니다. 다만 지하층·무창층·3층 이상 층 중 바닥면적 50㎡ 이상인 층이 있으면 설치 대상입니다.";
  } else {
    extReq = ta >= 33;
    extReason = extReq ? "연면적 33㎡ 이상입니다." : "연면적 33㎡ 미만이어서 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.extinguishing, "소화기구", "", extReq ? "required" : "notRequired", extReason, ""));

  // ── 옥내소화전설비 ──
  let hydrantReq, hydrantReason;
  if (preBefore1992) {
    hydrantReq = ta >= 2100 || inp.before2004SalesHasLargeFloor450;
    hydrantReason = ta >= 2100
      ? "구 「시장」으로서 연면적 2,100㎡ 이상입니다."
      : inp.before2004SalesHasLargeFloor450
        ? (pre1984
            ? "지하층·무창층·4층 이상 층 중 바닥면적 450㎡ 이상인 층이 있어 해당 층에 설치합니다."
            : "지하층·무창층·4층 이상 층 중 바닥면적 450㎡ 이상인 층이 있어 건물 전 층에 설치합니다.")
        : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    hydrantReq = ta >= 1500 || inp.before2004SalesHasLargeFloor300;
    hydrantReason = ta >= 1500
      ? "판매시설 연면적 1,500㎡ 이상입니다."
      : inp.before2004SalesHasLargeFloor300
        ? "지하층·무창층·4층 이상 층 중 바닥면적 300㎡ 이상인 층이 있어 건물 전 층에 설치합니다."
        : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.extinguishing, "옥내소화전설비", "", hydrantReq ? "required" : "notRequired", hydrantReason, ""));

  // ── 스프링클러설비 ──
  let sprinklerReq, sprinklerReason;
  if (preBefore1992) {
    const areaThreshold = ag <= 4 ? 9000 : 6000;
    const areaHit = salesArea >= areaThreshold;
    sprinklerReq = areaHit || inp.before2004SalesSprinklerFloor || ag >= 11;
    if (areaHit) {
      sprinklerReason = `구 「시장」 판매장 바닥면적 합계가 ${ag <= 4 ? "4층 이하 9,000" : "5층 이상 6,000"}㎡ 이상이어서 전 층에 설치합니다.`;
    } else if (ag >= 11) {
      sprinklerReason = "지상층수가 11층 이상인 건물의 11층 이상 부분에 스프링클러설비를 설치합니다.";
    } else if (inp.before2004SalesSprinklerFloor) {
      sprinklerReason = `4층 이상 10층 이하의 층 중 바닥면적 ${pre1984 ? "1,500" : "1,000"}㎡ 이상인 층이 있어 해당 층에 설치합니다.`;
    } else {
      sprinklerReason = "현재 입력 기준으로는 설치 대상이 아닙니다.";
    }
  } else {
    const areaThreshold = ag <= 3 ? 6000 : 5000;
    const areaHit = salesArea >= areaThreshold;
    sprinklerReq = areaHit || ag >= 11 || inp.before2004SalesLargeFloor1000;
    if (areaHit) {
      sprinklerReason = `판매시설 바닥면적 합계가 ${ag <= 3 ? "3층 이하 6,000" : "4층 이상 5,000"}㎡ 이상이어서 전 층에 설치합니다.`;
    } else if (ag >= 11) {
      sprinklerReason = "층수가 11층 이상으로 전 층 설치 대상입니다.";
    } else if (inp.before2004SalesLargeFloor1000) {
      sprinklerReason = "지하층·무창층·4층 이상 층 중 바닥면적 1,000㎡ 이상인 층이 있어 건물 전 층에 설치합니다.";
    } else {
      sprinklerReason = "현재 입력 기준으로는 설치 대상이 아닙니다.";
    }
  }
  results.push(makeResult(categories.extinguishing, "스프링클러설비", "", sprinklerReq ? "required" : "notRequired", sprinklerReason, ""));

  // ── 간이스프링클러설비 ──
  if (pre2001) {
    results.push(makeResult(categories.extinguishing, "간이스프링클러설비", "", "notRequired",
      "해당 시행 시기에는 간이스프링클러설비 규정이 없었습니다.", ""));
  } else {
    results.push(makeResult(categories.extinguishing, "간이스프링클러설비", "", "notRequired",
      "분법 이전 시기에는 판매시설 자체에 대한 간이스프링클러설비 설치 의무가 없었습니다. 판매시설 내부 다중이용업소(지하층 영업장 바닥면적 150㎡ 이상)는 다중이용업소 안전시설에서 별도로 확인합니다.", ""));
  }

  // ── 물분무등소화설비 ──
  const elecArea    = inp.salesElectricalRoomArea;
  const parkingArea = inp.salesIndoorParkingArea;
  const mechParking = inp.salesMechanicalParkingCapacity;
  let waterSprayReq, waterSprayReason;
  if (preBefore1992) {
    waterSprayReq = elecArea >= 300;
    waterSprayReason = waterSprayReq
      ? (pre1984
          ? "건물 내 발전실·변전실 바닥면적이 300㎡ 이상입니다."
          : "건물 내 전기실·통신기기실·전산기기실 바닥면적이 300㎡ 이상입니다.")
      : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    waterSprayReq = parkingArea >= 200 || mechParking >= 20 || elecArea >= 300;
    waterSprayReason = buildWaterSprayReason(0, parkingArea, mechParking, elecArea);
  }
  results.push(makeResult(categories.extinguishing, "물분무등소화설비", "", waterSprayReq ? "required" : "notRequired", waterSprayReason, ""));

  // ── 옥외소화전설비 ──
  const f12 = inp.salesFirstSecondFloorArea;
  results.push(makeResult(categories.extinguishing, "옥외소화전설비", "",
    f12 >= 9000 ? "required" : "notRequired",
    f12 >= 9000 ? "지상 1층과 2층의 바닥면적 합계가 9,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 비상경보설비 ──
  if (pre1991) {
    results.push(makeResult(categories.alarm, "비상경보설비", "", "review",
      "1991년 1월 8일 이전에는 수용인원 기준(100인 이상이거나, 지하층·무창층이 있는 경우 40인 이상)으로 설치 여부를 판단합니다. 수용인원을 직접 확인하세요.", ""));
  } else {
    const emergAlarmReq = ta >= 400 || (hasBasement && ba >= 150) || (hasWL && wl >= 150);
    const emergAlarmReason = ta >= 400 ? "연면적이 400㎡ 이상입니다." :
      (hasBasement && ba >= 150) ? "지하층 바닥면적 합계가 150㎡ 이상입니다." :
      (hasWL && wl >= 150) ? "무창층 바닥면적이 150㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.alarm, "비상경보설비", "", emergAlarmReq ? "required" : "notRequired", emergAlarmReason, ""));
  }

  // ── 자동화재탐지설비 ──
  let autoDetReq, autoDetReason;
  if (preBefore1992) {
    autoDetReq = ta >= 1000 || inp.before2004SalesAutoDetFloor600;
    if (ta >= 1000) {
      autoDetReason = "구 「시장」으로서 연면적 1,000㎡ 이상입니다.";
    } else if (inp.before2004SalesAutoDetFloor600) {
      autoDetReason = pre1984
        ? "지하층·무창층·3층 이상 층 중 바닥면적 600㎡ 이상인 층이 있어 해당 층에 설치합니다."
        : "지하층·무창층·3층 이상 층 중 바닥면적 600㎡ 이상인 층이 있어 건물 전 층에 설치합니다.";
    } else {
      autoDetReason = "현재 입력 기준으로는 설치 대상이 아닙니다.";
    }
  } else {
    autoDetReq = ta >= 1000;
    autoDetReason = autoDetReq ? "판매시설 연면적 1,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.alarm, "자동화재탐지설비", "", autoDetReq ? "required" : "notRequired", autoDetReason, ""));

  // ── 비상방송설비 ──
  let broadcastReq, broadcastReason;
  if (pre1991) {
    broadcastReq = ag >= 11 || bf >= 3;
    broadcastReason = ag >= 11 ? "지상층수가 11층 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다. (수용인원 800인 이상인 경우도 설치 대상이나 면적만으로 확정이 어렵습니다.)";
  } else if (pre1994) {
    broadcastReq = ta >= 3500 || ag >= 11 || bf >= 3;
    broadcastReason = ta >= 3500 ? "연면적이 3,500㎡ 이상입니다." :
      ag >= 11 ? "지상층수가 11층 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    broadcastReq = ta >= 3500 || tf >= 11 || bf >= 3;
    broadcastReason = ta >= 3500 ? "연면적이 3,500㎡ 이상입니다." :
      tf >= 11 ? "전체 층수가 11층 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.alarm, "비상방송설비", "", broadcastReq ? "required" : "notRequired", broadcastReason, ""));

  // ── 자동화재속보설비 ──
  let autoDispatchReq, autoDispatchReason;
  if (preBefore1992) {
    autoDispatchReq = salesArea >= 1500;
    autoDispatchReason = autoDispatchReq
      ? "구 「시장」으로서 바닥면적 1,500㎡ 이상입니다."
      : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    autoDispatchReq = inp.before2004SalesHasFloor1500;
    autoDispatchReason = autoDispatchReq
      ? "판매시설로서 바닥면적 1,500㎡ 이상인 층이 있습니다."
      : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.alarm, "자동화재속보설비", "", autoDispatchReq ? "required" : "notRequired", autoDispatchReason, ""));

  // ── 피난기구 ──
  if (preBefore1992) {
    const hasEligibleFloor = ag >= 3 || bf > 0;
    results.push(makeResult(categories.evacuation, "피난기구", "", hasEligibleFloor ? "review" : "notRequired",
      "1992년 7월 28일 이전에는 구 「시장」으로 사용하는 층의 수용인원이 50인 이상인 경우, 피난층·2층(주요구조부 내화구조)·11층 이상의 층을 제외한 나머지 층에 설치합니다. 설치 여부는 수용인원 기준이므로 소방법 시행규칙 [별표1] 수용인원 산정법에 따라 직접 확인하세요.", ""));
  } else {
    const evacReq = ag >= 3 || bf > 0;
    results.push(makeResult(categories.evacuation, "피난기구", "", evacReq ? "required" : "notRequired",
      evacReq
        ? "피난층·2층·11층 이상의 층을 제외한 모든 층에 피난기구를 설치합니다."
        : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  }

  // ── 인명구조기구 ──
  results.push(makeResult(categories.evacuation, "인명구조기구", "", "notRequired",
    "판매시설은 인명구조기구 의무 설치 대상이 아닙니다. (관광호텔·병원에 한정)", ""));

  // ── 유도등 및 유도표지 ──
  if (preBefore1992) {
    const guideReason = pre1984
      ? "구 「시장」으로서 피난구유도등 및 통로유도등을 설치합니다."
      : "구 「시장」으로서 대형 피난구유도등 및 통로유도등을 설치합니다.";
    results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "required", guideReason, ""));
  } else {
    results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "required",
      "모든 소방대상물에 피난구유도등, 통로유도등, 유도표지를 설치합니다.", ""));
  }

  // ── 비상조명등 ──
  if (pd < YD.D19840701) {
    results.push(makeResult(categories.evacuation, "비상조명등", "", "notRequired",
      "1984년 7월 이전에는 비상조명등 규정이 없었습니다.", ""));
  } else {
    const bsmtAvg450 = hasBasement && bsmtAvg >= 450;
    const wlss450 = hasWL && wl >= 450;
    const emLightReq = (tf >= 5 && ta >= 3000) || bsmtAvg450 || wlss450;
    const emLightReason = tf >= 5 && ta >= 3000
      ? "전체 층수가 5층 이상이고 연면적이 3,000㎡ 이상입니다."
      : bsmtAvg450 ? "지하층 바닥면적이 450㎡ 이상입니다."
      : wlss450 ? "무창층 바닥면적이 450㎡ 이상입니다."
      : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.evacuation, "비상조명등", "", emLightReq ? "required" : "notRequired", emLightReason, ""));
  }

  // ── 상수도소화용수설비 ──
  if (pd < YD.D19920728) {
    results.push(makeResult(categories.waterSupply, "상수도소화용수설비", "", "notRequired",
      "1992년 7월 28일 이전에는 상수도소화용수설비 기준이 없었습니다.", ""));
  } else {
    const waterSupplyReq = ta >= 5000;
    results.push(makeResult(categories.waterSupply, "상수도소화용수설비", "",
      waterSupplyReq ? "required" : "notRequired",
      waterSupplyReq ? "연면적이 5,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
  }

  // ── 제연설비 ──
  if (pd < YD.D19820928) {
    results.push(makeResult(categories.fireSupport, "제연설비", "", "notRequired",
      "1982년 9월 28일 이전에는 배연설비(현 제연설비) 규정이 없었습니다.", ""));
  } else {
    const smokeBsmt = hasBasement && ba >= 1000;
    const smokeWl = hasWL && wl >= 1000;
    const smoke11 = !preBefore1992 && ag >= 11;
    const smokeReq = smokeBsmt || smokeWl || smoke11;
    const smokeReason = smokeBsmt ? "지하층 바닥면적 합계가 1,000㎡ 이상입니다."
      : smokeWl ? "무창층 바닥면적이 1,000㎡ 이상입니다."
      : smoke11 ? "지상 11층 이상으로 특별피난계단에 제연설비를 설치해야 합니다."
      : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.fireSupport, "제연설비", "", smokeReq ? "required" : "notRequired", smokeReason, ""));
  }

  // ── 연결송수관설비 ──
  let standpipeReq, standpipeReason;
  if (preBefore1992) {
    standpipeReq = ag >= 7 || (ag >= 5 && ta >= 6000);
    standpipeReason = ag >= 7 ? "지상층수가 7층 이상입니다." :
      (ag >= 5 && ta >= 6000) ? "지상층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (pre1994) {
    standpipeReq = ag >= 7 || (ag >= 5 && ta >= 6000) || bf >= 3;
    standpipeReason = ag >= 7 ? "지상층수가 7층 이상입니다." :
      (ag >= 5 && ta >= 6000) ? "지상층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    standpipeReq = tf >= 7 || (tf >= 5 && ta >= 6000) || (bf >= 3 && ba >= 1000);
    standpipeReason = tf >= 7 ? "전체 층수가 7층 이상입니다." :
      (tf >= 5 && ta >= 6000) ? "전체 층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다." :
      (bf >= 3 && ba >= 1000) ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.fireSupport, "연결송수관설비", "", standpipeReq ? "required" : "notRequired", standpipeReason, ""));

  // ── 연결살수설비 ──
  let connSprayReq, connSprayReason;
  if (pd < YD.D19900701) {
    connSprayReq = ba >= 700;
    connSprayReason = connSprayReq ? "지하층 바닥면적 합계가 700㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (preBefore1992) {
    connSprayReq = ba >= 150;
    connSprayReason = connSprayReq ? "지하층 바닥면적 합계가 150㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    connSprayReq = salesArea >= 1000 || ba >= 150;
    connSprayReason = salesArea >= 1000 ? "판매시설 바닥면적 합계가 1,000㎡ 이상입니다."
      : ba >= 150 ? "지하층 바닥면적 합계가 150㎡ 이상입니다."
      : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.fireSupport, "연결살수설비", "", connSprayReq ? "required" : "notRequired", connSprayReason, ""));

  // ── 비상콘센트설비 ──
  let emConsentReq, emConsentReason;
  if (preBefore1992) {
    emConsentReq = ag >= 11;
    emConsentReason = emConsentReq ? "지상층수가 11층 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (pre1994) {
    emConsentReq = ag >= 11 || bf >= 3;
    emConsentReason = ag >= 11 ? "지상층수가 11층 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    emConsentReq = ag >= 11 || (bf >= 3 && ba >= 1000);
    emConsentReason = ag >= 11 ? "지상층수가 11층 이상입니다." :
      (bf >= 3 && ba >= 1000) ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.fireSupport, "비상콘센트설비", "", emConsentReq ? "required" : "notRequired", emConsentReason, ""));

  // ── 무선통신보조설비 ──
  if (pd < YD.D19920728) {
    results.push(makeResult(categories.fireSupport, "무선통신보조설비", "", "notRequired",
      "1992년 7월 28일 이전에는 무선통신보조설비 기준이 일반 소방대상물(지상 판매시설)에 적용되지 않았습니다.", ""));
  } else if (pre1994) {
    const radioReq = ba >= 3000 || bf >= 3;
    const radioReason = ba >= 3000 ? "지하층 바닥면적 합계가 3,000㎡ 이상입니다." :
      bf >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.fireSupport, "무선통신보조설비", "", radioReq ? "required" : "notRequired", radioReason, ""));
  } else {
    const radioReq = ba >= 3000 || (bf >= 3 && ba >= 1000);
    const radioReason = ba >= 3000 ? "지하층 바닥면적 합계가 3,000㎡ 이상입니다." :
      (bf >= 3 && ba >= 1000) ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
    results.push(makeResult(categories.fireSupport, "무선통신보조설비", "", radioReq ? "required" : "notRequired", radioReason, ""));
  }

  return results;
}

function yearEvaluateNeighborhood(inp) {
  const results = [];
  const { pd } = inp;

  // ── 소화기 ──
  results.push(makeResult(categories.extinguishing, "소화기구", "",
    inp.totalArea >= 33 ? "required" : "notRequired",
    inp.totalArea >= 33 ? "연면적이 33㎡ 이상입니다." : "연면적이 33㎡ 미만입니다.", ""));

  // ── 옥내소화전 (기준 동일) ──
  const indoorHydrantReq = inp.totalArea >= 1500 || inp.hasLargeTargetFloor;
  results.push(makeResult(categories.extinguishing, "옥내소화전설비", "",
    indoorHydrantReq ? "required" : "notRequired",
    inp.totalArea >= 1500 ? "연면적이 1,500㎡ 이상입니다." :
      inp.hasLargeTargetFloor ? "지하층·무창층 또는 4층 이상 층 중 바닥면적 300㎡ 이상인 층이 있습니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 스프링클러 ──
  let sprinklerReq = false;
  let sprinklerReason = "";
  if (pd >= YD.D20040530 && pd < YD.D20180128) {
    sprinklerReq = inp.aboveGroundFloors >= 11 || inp.hasLargeFloorFor1000;
    sprinklerReason = inp.aboveGroundFloors >= 11 ? "층수가 11층 이상으로 전층 설치 대상입니다." :
      inp.hasLargeFloorFor1000 ? "지하층·무창층·4층 이상 층 중 바닥면적 1,000㎡ 이상인 층이 있어 해당 층에 설치 대상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (pd >= YD.D20180128 && pd < YD.D20220225) {
    sprinklerReq = inp.aboveGroundFloors >= 6;
    sprinklerReason = inp.aboveGroundFloors >= 6 ? "층수가 6층 이상으로 전층 설치 대상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (pd >= YD.D20220225) {
    const postpartumBig = inp.isPostpartum && inp.postpartumAreaRange === "over600";
    sprinklerReq = inp.aboveGroundFloors >= 6 || postpartumBig;
    sprinklerReason = inp.aboveGroundFloors >= 6 ? "층수가 6층 이상으로 전층 설치 대상입니다." :
      postpartumBig ? "조산원·산후조리원이고 바닥면적이 600㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.extinguishing, "스프링클러설비", "",
    sprinklerReq ? "required" : "notRequired", sprinklerReason, ""));

  // ── 간이스프링클러 ──
  let simpleSprinklerReq = false;
  let simpleSprinklerReason = "";
  if (sprinklerReq) {
    simpleSprinklerReason = "스프링클러설비 전층 설치 대상이므로 간이스프링클러설비는 제외됩니다.";
  } else if (pd >= YD.D20040530 && pd < YD.D20061207) {
    simpleSprinklerReq = inp.totalArea >= 1000;
    simpleSprinklerReason = inp.totalArea >= 1000 ?
      "주용도 근린생활시설로서 연면적이 1,000㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (pd >= YD.D20061207 && pd < YD.D20180627) {
    simpleSprinklerReq = inp.neighborhoodArea >= 1000;
    simpleSprinklerReason = inp.neighborhoodArea >= 1000 ?
      "근린생활시설로 사용하는 바닥면적 합계가 1,000㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (pd >= YD.D20180627 && pd < YD.D20221201) {
    simpleSprinklerReq = inp.neighborhoodArea >= 1000 || inp.isClinicWithInpatient;
    simpleSprinklerReason = inp.neighborhoodArea >= 1000 ? "근린생활시설로 사용하는 바닥면적 합계가 1,000㎡ 이상입니다." :
      inp.isClinicWithInpatient ? "입원실이 있는 의원·치과의원·한의원입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (pd >= YD.D20221201 && pd < YD.D20241231) {
    const smallPostpartum = inp.isPostpartum && inp.postpartumAreaRange === "under600";
    simpleSprinklerReq = inp.neighborhoodArea >= 1000 || inp.isClinicWithInpatient || smallPostpartum;
    simpleSprinklerReason = inp.neighborhoodArea >= 1000 ? "근린생활시설로 사용하는 바닥면적 합계가 1,000㎡ 이상입니다." :
      inp.isClinicWithInpatient ? "입원실이 있는 의원·치과의원·한의원입니다." :
      smallPostpartum ? "조산원·산후조리원이고 바닥면적이 600㎡ 미만입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (pd >= YD.D20241231) {
    const smallPostpartum = inp.isPostpartum && inp.postpartumAreaRange === "under600";
    const clinicReq = inp.isClinicWithInpatient || inp.hasHemodialysis;
    simpleSprinklerReq = inp.neighborhoodArea >= 1000 || clinicReq || smallPostpartum;
    simpleSprinklerReason = inp.neighborhoodArea >= 1000 ? "근린생활시설로 사용하는 바닥면적 합계가 1,000㎡ 이상입니다." :
      inp.isClinicWithInpatient ? "입원실이 있는 의원·치과의원·한의원입니다." :
      inp.hasHemodialysis ? "인공신장실이 있는 의원·치과의원·한의원입니다." :
      smallPostpartum ? "조산원·산후조리원이고 바닥면적이 600㎡ 미만입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.extinguishing, "간이스프링클러설비", "",
    sprinklerReq ? "notRequired" : (simpleSprinklerReq ? "required" : "notRequired"),
    sprinklerReq ? simpleSprinklerReason : (simpleSprinklerReason || "현재 입력 기준으로는 설치 대상이 아닙니다."), ""));

  // ── 물분무등소화설비 (기준 동일) ──
  const waterSprayReq = inp.indoorParkingArea >= 200 || inp.mechanicalParkingCapacity >= 20 || inp.electricalRoomArea >= 300;
  results.push(makeResult(categories.extinguishing, "물분무등소화설비", "",
    waterSprayReq ? "required" : "notRequired",
    buildWaterSprayReason(0, inp.indoorParkingArea, inp.mechanicalParkingCapacity, inp.electricalRoomArea), ""));

  // ── 옥외소화전 (기준 동일) ──
  results.push(makeResult(categories.extinguishing, "옥외소화전설비", "",
    inp.firstSecondFloorArea >= 9000 ? "required" : "notRequired",
    inp.firstSecondFloorArea >= 9000 ? "지상 1층과 2층의 바닥면적 합계가 9,000㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 비상경보설비 ──
  const bsmtAvg150 = inp.basementFloors > 0 && inp.basementAvg >= 150;
  const wlss150 = inp.hasWindowlessFloor && inp.windowlessArea >= 150;
  let emergAlarmReq = inp.totalArea >= 400 || bsmtAvg150 || wlss150;
  let emergAlarmReason = inp.totalArea >= 400 ? "연면적이 400㎡ 이상입니다." :
    bsmtAvg150 ? "지하층 평균 면적이 150㎡ 이상입니다." :
    wlss150 ? "무창층 면적이 150㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.";
  if (pd >= YD.D20251201 && inp.hasSmallUndergroundParking) {
    emergAlarmReq = true;
    emergAlarmReason = "지하 차고·주차장이 200㎡ 미만으로 건물 전층에 설치 대상입니다.";
  }
  results.push(makeResult(categories.alarm, "비상경보설비", "",
    emergAlarmReq ? "required" : "notRequired", emergAlarmReason, ""));

  // ── 자동화재탐지설비 ──
  let autoDetReq = false;
  let autoDetReason = "";
  const detThreshold = inp.facilitySubtype === "bathhouse" ? 1000 : 600;
  if (pd >= YD.D20040530 && pd < YD.D20220225) {
    autoDetReq = inp.totalArea >= detThreshold;
    autoDetReason = autoDetReq ?
      (inp.facilitySubtype === "bathhouse" ? "목욕장이며 연면적이 1,000㎡ 이상입니다." : "연면적이 600㎡ 이상입니다.") :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (pd >= YD.D20220225) {
    const floorTrig = inp.aboveGroundFloors >= 6;
    const areaTrig = inp.totalArea >= detThreshold;
    const postpartumTrig = inp.isPostpartum;
    autoDetReq = floorTrig || areaTrig || postpartumTrig;
    autoDetReason = floorTrig ? "층수가 6층 이상으로 모든 층에 설치 대상입니다." :
      areaTrig ? (inp.facilitySubtype === "bathhouse" ? "목욕장이며 연면적이 1,000㎡ 이상입니다." : "연면적이 600㎡ 이상입니다.") :
      postpartumTrig ? "조산원·산후조리원으로 면적에 관계없이 설치 대상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.alarm, "자동화재탐지설비", "",
    autoDetReq ? "required" : "notRequired", autoDetReason, ""));

  // ── 시각경보기 ──
  results.push(makeResult(categories.alarm, "시각경보기", "",
    autoDetReq ? "required" : "notRequired",
    autoDetReq ? "자동화재탐지설비 설치 대상이므로 함께 설치해야 합니다." :
      "자동화재탐지설비 설치 대상이 아니므로 해당 없습니다.", ""));

  // ── 비상방송설비 (기준 동일) ──
  const broadcastReq = inp.totalArea >= 3500 || inp.aboveGroundFloors >= 11 || inp.basementFloors >= 3;
  results.push(makeResult(categories.alarm, "비상방송설비", "",
    broadcastReq ? "required" : "notRequired",
    inp.totalArea >= 3500 ? "연면적이 3,500㎡ 이상입니다." :
      inp.aboveGroundFloors >= 11 ? "지상층수가 11층 이상입니다." :
      inp.basementFloors >= 3 ? "지하층수가 3층 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 자동화재속보설비 ──
  if (pd < YD.D20190806) {
    results.push(makeResult(categories.alarm, "자동화재속보설비", "", "notRequired",
      "허가일 기준 당시 근린생활시설에 대한 자동화재속보설비 설치 기준이 없었습니다.", ""));
  } else {
    const clinicApply = inp.isClinicWithInpatient || (pd >= YD.D20241231 && inp.hasHemodialysis);
    const postpartumApply = pd >= YD.D20220225 && inp.isPostpartum;
    const autoDispatchTarget = clinicApply || postpartumApply;
    if (autoDispatchTarget) {
      const dispatchReason = inp.isClinicWithInpatient ? "입원실이 있는 의원급에 해당합니다." :
        (pd >= YD.D20241231 && inp.hasHemodialysis) ? "인공신장실이 있는 의원급에 해당합니다." :
        "조산원·산후조리원에 해당합니다.";
      results.push(makeResult(categories.alarm, "자동화재속보설비", "",
        inp.has24HourStaff ? "review" : "required",
        inp.has24HourStaff ? "24시간 상주 근무자가 있어 면제 검토가 필요합니다." : dispatchReason, ""));
    } else {
      results.push(makeResult(categories.alarm, "자동화재속보설비", "", "notRequired",
        "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));
    }
  }

  // ── 피난기구 (기준 동일) ──
  results.push(makeResult(categories.evacuation, "피난기구", "",
    inp.aboveGroundFloors >= 3 ? "required" : "notRequired",
    inp.aboveGroundFloors >= 3 ? "건축물 3층 이상 층에 설치합니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 유도등 (기준 동일) ──
  results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "required",
    "기본적으로 건물 전체에 설치합니다.", ""));

  // ── 비상조명등 (기준 동일) ──
  const bsmtAvg450 = inp.basementFloors > 0 && inp.basementAvg >= 450;
  const wlss450 = inp.hasWindowlessFloor && inp.windowlessArea >= 450;
  const emLightReq = (inp.totalFloors >= 5 && inp.totalArea >= 3000) || bsmtAvg450 || wlss450;
  results.push(makeResult(categories.evacuation, "비상조명등", "",
    emLightReq ? "required" : "notRequired",
    inp.totalFloors >= 5 && inp.totalArea >= 3000 ? "전체 층수가 5층 이상이고 연면적이 3,000㎡ 이상입니다." :
      bsmtAvg450 ? "지하층 평균 면적이 450㎡ 이상입니다." :
      wlss450 ? "무창층 면적이 450㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 상수도소화용수설비 (기준 동일) ──
  results.push(makeResult(categories.waterSupply, "상수도소화용수설비", "",
    inp.totalArea >= 5000 ? "required" : "notRequired",
    inp.totalArea >= 5000 ? "연면적이 5,000㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 제연설비 ──
  const smokeReqN = inp.smokeControlArea >= 1000 || inp.aboveGroundFloors >= 11;
  results.push(makeResult(categories.fireSupport, "제연설비", "",
    smokeReqN ? "required" : "notRequired",
    inp.smokeControlArea >= 1000 ? "지하층·무창층 내 근린생활시설 바닥면적 합계가 1,000㎡ 이상입니다."
    : inp.aboveGroundFloors >= 11 ? "지상 11층 이상으로 특별피난계단에 제연설비를 설치해야 합니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 연결송수관 (기준 동일) ──
  const standpipeReq = (inp.totalFloors >= 5 && inp.totalArea >= 6000) || inp.totalFloors >= 7 ||
    (inp.basementFloors >= 3 && inp.basementAreaSum >= 1000);
  results.push(makeResult(categories.fireSupport, "연결송수관설비", "",
    standpipeReq ? "required" : "notRequired",
    inp.totalFloors >= 5 && inp.totalArea >= 6000 ? "전체 층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다." :
      inp.totalFloors >= 7 ? "전체 층수가 7층 이상입니다." :
      inp.basementFloors >= 3 && inp.basementAreaSum >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 연결살수설비 ──
  let connSprayReq = inp.basementAreaSum >= 150;
  let connSprayReason = inp.basementAreaSum >= 150 ? "지하층 바닥면적 합계가 150㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.";
  if (pd >= YD.D20240517 && inp.hasSmallUndergroundParking && !connSprayReq) {
    connSprayReq = true;
    connSprayReason = "지하 차고·주차장 바닥면적이 200㎡ 미만인 소규모 주차장이 있어 설치 대상입니다.";
  }
  results.push(makeResult(categories.fireSupport, "연결살수설비", "",
    connSprayReq ? "required" : "notRequired", connSprayReason, ""));

  // ── 비상콘센트 (기준 동일) ──
  const emConsentReq = inp.aboveGroundFloors >= 11 || (inp.basementFloors >= 3 && inp.basementAreaSum >= 1000);
  results.push(makeResult(categories.fireSupport, "비상콘센트설비", "",
    emConsentReq ? "required" : "notRequired",
    inp.aboveGroundFloors >= 11 ? "지상층수가 11층 이상입니다." :
      inp.basementFloors >= 3 && inp.basementAreaSum >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 무선통신보조설비 ──
  const radioBase = inp.basementAreaSum >= 3000 || (inp.basementFloors >= 3 && inp.basementAreaSum >= 1000);
  const radioHigh = pd >= YD.D20111123 && inp.aboveGroundFloors >= 30;
  results.push(makeResult(categories.fireSupport, "무선통신보조설비", "",
    radioBase || radioHigh ? "required" : "notRequired",
    inp.basementAreaSum >= 3000 ? "지하층 바닥면적 합계가 3,000㎡ 이상입니다." :
      inp.basementFloors >= 3 && inp.basementAreaSum >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
      radioHigh ? "지상층수가 30층 이상으로 16층 이상 부분에 설치 대상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  return results;
}

function yearEvaluateLodging(inp) {
  const results = [];
  const { pd } = inp;
  const ag = inp.aboveGroundFloors;
  const bf = inp.basementFloors;
  const ba = inp.basementAreaSum;
  const ta = inp.totalArea;
  const tf = inp.totalFloors;
  const la = inp.lodgingArea;
  const wl = inp.windowlessArea;
  const bsmtAvg = bf > 0 ? ba / bf : 0;

  const hasBasement150 = bf > 0 && bsmtAvg >= 150;
  const hasBasement300 = bf > 0 && bsmtAvg >= 300;
  const hasBasement450 = bf > 0 && bsmtAvg >= 450;
  const hasBasement1000 = bf > 0 && bsmtAvg >= 1000;
  const hasWindowless150 = inp.hasWindowlessFloor && wl >= 150;
  const hasWindowless300 = inp.hasWindowlessFloor && wl >= 300;
  const hasWindowless450 = inp.hasWindowlessFloor && wl >= 450;
  const hasWindowless1000 = inp.hasWindowlessFloor && wl >= 1000;

  // ── 소화기구 ──
  results.push(makeResult(categories.extinguishing, "소화기구", "",
    ta >= 33 ? "required" : "notRequired",
    ta >= 33 ? "연면적이 33㎡ 이상입니다." : "연면적이 33㎡ 미만입니다.", ""));

  // ── 옥내소화전설비 (기준 20년 동일) ──
  const indoorHydrantReq = ta >= 1500 || hasBasement300 || hasWindowless300 || (ag >= 4 && inp.hasLargeTargetFloor);
  results.push(makeResult(categories.extinguishing, "옥내소화전설비", "",
    indoorHydrantReq ? "required" : "notRequired",
    ta >= 1500 ? "연면적이 1,500㎡ 이상입니다." :
    hasBasement300 ? "지하층 바닥면적이 300㎡ 이상인 층이 있습니다." :
    hasWindowless300 ? "무창층 바닥면적이 300㎡ 이상인 층이 있습니다." :
    inp.hasLargeTargetFloor ? "4층 이상 층 중 바닥면적 300㎡ 이상인 층이 있습니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 스프링클러설비 ──
  let sprinklerReq = false;
  let sprinklerReason = "";
  if (pd >= YD.D20040530 && pd < YD.D20170128) {
    sprinklerReq = ag >= 11 || inp.lodgingHasLargeFloorFor1000;
    sprinklerReason = ag >= 11 ? "층수가 11층 이상으로 전층 설치 대상입니다." :
      inp.lodgingHasLargeFloorFor1000 ? "지하층·무창층·4층 이상 층 중 바닥면적 1,000㎡ 이상인 층이 있어 해당 층에 설치 대상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (pd >= YD.D20170128 && pd < YD.D20221201) {
    sprinklerReq = ag >= 6;
    sprinklerReason = ag >= 6 ? "층수가 6층 이상으로 전층 설치 대상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (pd >= YD.D20221201) {
    sprinklerReq = ag >= 6 || la >= 600;
    sprinklerReason = ag >= 6 ? "층수가 6층 이상으로 전층 설치 대상입니다." :
      la >= 600 ? "숙박시설 사용 바닥면적이 600㎡ 이상으로 전층 설치 대상입니다." :
      "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.extinguishing, "스프링클러설비", "",
    sprinklerReq ? "required" : "notRequired", sprinklerReason, ""));

  // ── 간이스프링클러설비 ──
  let simpleSprinklerReq = false;
  let simpleSprinklerReason = "";
  if (sprinklerReq) {
    simpleSprinklerReason = "스프링클러설비 설치 대상이므로 간이스프링클러설비는 제외됩니다.";
  } else if (pd >= YD.D20040530 && pd < YD.D20130210) {
    simpleSprinklerReason = "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (pd >= YD.D20130210 && pd < YD.D20221201) {
    // 2013.2.10~2022.11.30: 생활형 숙박시설로서 바닥면적 600㎡ 이상인 경우에만 간이스프링클러 설치 대상
    if (inp.lodgingIsLiving && la >= 600) {
      simpleSprinklerReq = true;
      simpleSprinklerReason = "생활형 숙박시설(레지던스 등)로서 숙박시설 사용 바닥면적이 600㎡ 이상이어서 간이스프링클러설비 설치 대상입니다.";
    } else {
      simpleSprinklerReason = inp.lodgingIsLiving
        ? "생활형 숙박시설이나 숙박시설 사용 바닥면적이 600㎡ 미만이어서 설치 대상이 아닙니다."
        : "일반 숙박시설은 해당 기간(2013.2.10~2022.11.30)에 간이스프링클러설비 설치 대상이 아닙니다.";
    }
  } else {
    // pd >= YD.D20221201: 300~600㎡ 미만 → 간이스프링클러
    simpleSprinklerReq = la >= 300 && la < 600;
    simpleSprinklerReason = simpleSprinklerReq
      ? "숙박시설 사용 바닥면적이 300㎡ 이상 600㎡ 미만으로 간이스프링클러설비 설치 대상입니다."
      : la < 300 ? "숙박시설 사용 바닥면적이 300㎡ 미만이어서 설치 대상이 아닙니다."
      : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.extinguishing, "간이스프링클러설비", "",
    simpleSprinklerReq ? "required" : "notRequired",
    sprinklerReq ? "스프링클러설비 설치 대상이므로 제외됩니다." : simpleSprinklerReason, ""));

  // ── 물분무등소화설비 ──
  const waterSprayReq = inp.lodgingIndoorParkingArea >= 200 || inp.lodgingMechanicalParkingCapacity >= 20 || inp.lodgingElectricalRoomArea >= 300;
  results.push(makeResult(categories.extinguishing, "물분무등소화설비", "",
    waterSprayReq ? "required" : "notRequired",
    buildWaterSprayReason(0, inp.lodgingIndoorParkingArea, inp.lodgingMechanicalParkingCapacity, inp.lodgingElectricalRoomArea), ""));

  // ── 옥외소화전설비 ──
  results.push(makeResult(categories.extinguishing, "옥외소화전설비", "",
    inp.lodgingFirstSecondFloorArea >= 9000 ? "required" : "notRequired",
    inp.lodgingFirstSecondFloorArea >= 9000 ? "지상 1층과 2층의 바닥면적 합계가 9,000㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 비상경보설비 ──
  const emergAlarm = ta >= 400 || hasBasement150 || hasWindowless150;
  results.push(makeResult(categories.alarm, "비상경보설비", "",
    emergAlarm ? "required" : "notRequired",
    ta >= 400 ? "연면적이 400㎡ 이상입니다." :
    hasBasement150 ? "지하층 바닥면적이 150㎡ 이상입니다." :
    hasWindowless150 ? "무창층 바닥면적이 150㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 자동화재탐지설비 ──
  let autoDetReq = false;
  let autoDetReason = "";
  if (pd >= YD.D20221201) {
    autoDetReq = true;
    autoDetReason = "2022년 12월 이후 모든 숙박시설은 면적에 관계없이 자동화재탐지설비를 설치해야 합니다.";
  } else {
    autoDetReq = ta >= 600;
    autoDetReason = autoDetReq ? "연면적이 600㎡ 이상인 숙박시설입니다." : "연면적이 600㎡ 미만이어서 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.alarm, "자동화재탐지설비", "", autoDetReq ? "required" : "notRequired", autoDetReason, ""));

  // ── 시각경보기 ──
  results.push(makeResult(categories.alarm, "시각경보기", "",
    autoDetReq ? "required" : "notRequired",
    autoDetReq ? "자동화재탐지설비 설치 대상 숙박시설에 함께 설치해야 합니다." :
    "자동화재탐지설비 설치 대상이 아닙니다.", ""));

  // ── 비상방송설비 ──
  const broadcastReq = ta >= 3500 || ag >= 11 || bf >= 3;
  results.push(makeResult(categories.alarm, "비상방송설비", "",
    broadcastReq ? "required" : "notRequired",
    ta >= 3500 ? "연면적이 3,500㎡ 이상입니다." :
    ag >= 11 ? "지상층수가 11층 이상입니다." :
    bf >= 3 ? "지하층수가 3층 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 자동화재속보설비 ── (숙박시설 해당 없음)
  results.push(makeResult(categories.alarm, "자동화재속보설비", "", "notRequired",
    "숙박시설은 자동화재속보설비 설치 대상이 아닙니다.", ""));

  // ── 가스누설경보기 ──
  results.push(makeResult(categories.alarm, "가스누설경보기", "",
    inp.lodgingHasGasFacility ? "required" : "notRequired",
    inp.lodgingHasGasFacility ? "가스시설이 설치된 숙박시설입니다." : "가스시설이 없어 설치 대상이 아닙니다.", ""));

  // ── 피난기구 ──
  results.push(makeResult(categories.evacuation, "피난기구(복도 등)", "",
    ag >= 3 ? "required" : "notRequired",
    ag >= 3 ? "지상 3층~10층에 완강기등의 피난기구를 설치해야 합니다. 양방향 피난이 가능한 경우 제외 가능합니다." :
    "3층 이상 층이 없어 설치 대상이 아닙니다.", ""));

  results.push(makeResult(categories.evacuation, "간이완강기(객실 내부)", "",
    ag >= 3 ? "required" : "notRequired",
    ag >= 3 ? "3층 이상 각 객실마다 간이완강기를 설치해야 합니다. 양방향 피난이 가능해도 제외되지 않습니다." :
    "3층 이상 층이 없어 설치 대상이 아닙니다.", ""));

  // ── 인명구조기구 ──
  results.push(makeResult(categories.evacuation, "인명구조기구(방열복·공기호흡기)", "",
    inp.lodgingIsTouristHotel && tf >= 7 ? "required" : "notRequired",
    inp.lodgingIsTouristHotel && tf >= 7 ? "지하층을 포함한 층수가 7층 이상인 관광호텔로 설치 대상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 유도등 ──
  results.push(makeResult(categories.evacuation, "유도등(피난구유도등·통로유도등)", "", "required",
    "모든 숙박시설에 피난구유도등, 통로유도등, 유도표지를 설치해야 합니다.", ""));

  // ── 비상조명등 ──
  const emLightReq = (tf >= 5 && ta >= 3000) || hasBasement450 || hasWindowless450;
  results.push(makeResult(categories.evacuation, "비상조명등", "",
    emLightReq ? "required" : "notRequired",
    tf >= 5 && ta >= 3000 ? "전체 층수가 5층 이상이고 연면적이 3,000㎡ 이상입니다." :
    hasBasement450 ? "지하층 바닥면적이 450㎡ 이상입니다." :
    hasWindowless450 ? "무창층 바닥면적이 450㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 휴대용비상조명등 ── (숙박시설 전용, 면적·층수 불문 전체)
  results.push(makeResult(categories.evacuation, "휴대용비상조명등", "", "required",
    "면적·층수에 관계없이 모든 숙박시설에 설치해야 합니다.", ""));

  // ── 소화용수설비 ──
  results.push(makeResult(categories.waterSupply, "상수도소화용수설비", "",
    ta >= 5000 ? "required" : "notRequired",
    ta >= 5000 ? "연면적이 5,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 제연설비 ──
  const smokeReqL = inp.lodgingBasementAreaForSmoke >= 1000 || ag >= 11;
  results.push(makeResult(categories.fireSupport, "제연설비", "",
    smokeReqL ? "required" : "notRequired",
    inp.lodgingBasementAreaForSmoke >= 1000 ? "지하층·무창층 내 숙박시설 사용 바닥면적 합계가 1,000㎡ 이상입니다."
    : ag >= 11 ? "지상 11층 이상으로 특별피난계단에 제연설비를 설치해야 합니다."
    : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 연결송수관설비 ──
  const standpipeReq = (tf >= 5 && ta >= 6000) || tf >= 7 || (bf >= 3 && ba >= 1000);
  results.push(makeResult(categories.fireSupport, "연결송수관설비", "",
    standpipeReq ? "required" : "notRequired",
    tf >= 5 && ta >= 6000 ? "전체 층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다." :
    tf >= 7 ? "전체 층수가 7층 이상입니다." :
    bf >= 3 && ba >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 연결살수설비 ──
  results.push(makeResult(categories.fireSupport, "연결살수설비", "",
    ba >= 150 ? "required" : "notRequired",
    ba >= 150 ? "지하층 바닥면적 합계가 150㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 비상콘센트설비 ──
  const emConsentReq = ag >= 11 || (bf >= 3 && ba >= 1000);
  results.push(makeResult(categories.fireSupport, "비상콘센트설비", "",
    emConsentReq ? "required" : "notRequired",
    ag >= 11 ? "지상층수가 11층 이상입니다." :
    bf >= 3 && ba >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 무선통신보조설비 ──
  const radioBase = ba >= 3000 || (bf >= 3 && ba >= 1000);
  const radioHigh = pd >= YD.D20111123 && ag >= 30;
  results.push(makeResult(categories.fireSupport, "무선통신보조설비", "",
    radioBase || radioHigh ? "required" : "notRequired",
    ba >= 3000 ? "지하층 바닥면적 합계가 3,000㎡ 이상입니다." :
    bf >= 3 && ba >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
    radioHigh ? "지상층수가 30층 이상으로 16층 이상 부분에 설치 대상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  return results;
}

function yearEvaluateElderly(inp) {
  const results = [];
  const { pd } = inp;
  const ag = inp.aboveGroundFloors;
  const bf = inp.basementFloors;
  const ba = inp.basementAreaSum;
  const ta = inp.totalArea;
  const tf = inp.totalFloors;
  const ea = inp.elderlyArea;
  const wl = inp.windowlessArea;
  const isLiving = inp.elderlySubtype === "living";
  const bsmtAvg = bf > 0 ? ba / bf : 0;

  const hasBasement150 = bf > 0 && bsmtAvg >= 150;
  const hasBasement300 = bf > 0 && bsmtAvg >= 300;
  const hasBasement450 = bf > 0 && bsmtAvg >= 450;
  const hasBasement1000 = bf > 0 && bsmtAvg >= 1000;
  const hasWindowless150 = inp.hasWindowlessFloor && wl >= 150;
  const hasWindowless300 = inp.hasWindowlessFloor && wl >= 300;
  const hasWindowless450 = inp.hasWindowlessFloor && wl >= 450;
  const hasWindowless1000 = inp.hasWindowlessFloor && wl >= 1000;

  // ── 소화기구 (면적 불문, 투척용 특례) ──
  results.push(makeResult(categories.extinguishing, "소화기구", "",
    "required",
    "노유자시설은 연면적에 관계없이 설치 대상이며, 투척용 소화용구 등을 전체 소화기 수량의 1/2 이상으로 갖출 수 있습니다.", ""));

  // ── 옥내소화전설비 (기준 20년 동일) ──
  const indoorHydrantReq = ta >= 1500 || hasBasement300 || hasWindowless300 || inp.elderlyHasLargeTargetFloor;
  results.push(makeResult(categories.extinguishing, "옥내소화전설비", "",
    indoorHydrantReq ? "required" : "notRequired",
    ta >= 1500 ? "연면적이 1,500㎡ 이상입니다." :
    hasBasement300 ? "지하층 바닥면적이 300㎡ 이상인 층이 있습니다." :
    hasWindowless300 ? "무창층 바닥면적이 300㎡ 이상입니다." :
    inp.elderlyHasLargeTargetFloor ? "4층 이상 층 중 바닥면적 300㎡ 이상인 층이 있습니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 스프링클러설비 ──
  let sprinklerReq = false;
  let sprinklerReason = "";
  if (pd >= YD.D20040530 && pd < YD.D20130109) {
    sprinklerReq = ta >= 600;
    sprinklerReason = ta >= 600 ? "연면적이 600㎡ 이상인 노유자시설입니다." :
      "연면적이 600㎡ 미만이어서 설치 대상이 아닙니다.";
  } else {
    // 2013.1.9 이후: 해당 용도 사용면적 600㎡
    sprinklerReq = ea >= 600;
    sprinklerReason = ea >= 600 ? "노유자시설 사용 바닥면적 합계가 600㎡ 이상으로 전층 설치 대상입니다." :
      "노유자시설 사용 바닥면적이 600㎡ 미만이어서 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.extinguishing, "스프링클러설비", "",
    sprinklerReq ? "required" : "notRequired", sprinklerReason, ""));

  // ── 간이스프링클러설비 (2008.2.29 이후부터 법령 도입) ──
  if (pd >= YD.D20080229) {
    let simpleSprinklerReq = false;
    let simpleSprinklerReason = "";
    if (sprinklerReq) {
      simpleSprinklerReason = "스프링클러설비 설치 대상이므로 간이스프링클러설비는 제외됩니다.";
    } else if (pd < YD.D20120914) {
      // 2008.2.29 ~ 2012.9.13: 300~600㎡ 또는 창살
      if (!isLiving) {
        simpleSprinklerReq = (ea >= 300 && ea < 600) || inp.elderlyHasGrillWindow;
        simpleSprinklerReason = ea >= 300 && ea < 600
          ? "노유자시설 사용 바닥면적이 300㎡ 이상 600㎡ 미만입니다."
          : inp.elderlyHasGrillWindow
          ? "창살이 설치된 노유자시설로 면적에 관계없이 설치 대상입니다."
          : "현재 입력 기준으로는 설치 대상이 아닙니다.";
      } else {
        simpleSprinklerReason = "현재 입력 기준으로는 설치 대상이 아닙니다. (이 시기 생활시설에는 간이스프링클러 조항 없음)";
      }
    } else {
      // 2012.9.14 이후
      if (isLiving) {
        simpleSprinklerReq = true;
        simpleSprinklerReason = "노유자 생활시설은 면적에 관계없이 간이스프링클러설비를 설치해야 합니다.";
      } else {
        simpleSprinklerReq = (ea >= 300 && ea < 600) || inp.elderlyHasGrillWindow;
        simpleSprinklerReason = ea >= 300 && ea < 600
          ? "노유자시설 사용 바닥면적이 300㎡ 이상 600㎡ 미만입니다."
          : inp.elderlyHasGrillWindow
          ? "창살이 설치된 노유자시설로 면적에 관계없이 설치 대상입니다."
          : "현재 입력 기준으로는 설치 대상이 아닙니다.";
      }
    }
    results.push(makeResult(categories.extinguishing, "간이스프링클러설비", "",
      sprinklerReq ? "notRequired" : (simpleSprinklerReq ? "required" : "notRequired"),
      sprinklerReq ? "스프링클러설비 설치 대상이므로 제외됩니다." : simpleSprinklerReason, ""));
  }

  // ── 물분무등소화설비 ──
  const waterSprayReq = inp.elderlyIndoorParkingArea >= 200 || inp.elderlyMechanicalParkingCapacity >= 20 || inp.elderlyElectricalRoomArea >= 300;
  results.push(makeResult(categories.extinguishing, "물분무등소화설비", "",
    waterSprayReq ? "required" : "notRequired",
    buildWaterSprayReason(0, inp.elderlyIndoorParkingArea, inp.elderlyMechanicalParkingCapacity, inp.elderlyElectricalRoomArea), ""));

  // ── 옥외소화전설비 ──
  results.push(makeResult(categories.extinguishing, "옥외소화전설비", "",
    inp.elderlyFirstSecondFloorArea >= 9000 ? "required" : "notRequired",
    inp.elderlyFirstSecondFloorArea >= 9000 ? "지상 1층과 2층의 바닥면적 합계가 9,000㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 비상경보설비 ──
  let emergAlarmReq = ta >= 400 || hasBasement150 || hasWindowless150;
  let emergAlarmReason = ta >= 400 ? "연면적이 400㎡ 이상입니다." :
    hasBasement150 ? "지하층 바닥면적이 150㎡ 이상입니다." :
    hasWindowless150 ? "무창층 바닥면적이 150㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.";
  if (pd >= YD.D20251201 && inp.elderlyHasSmallUndergroundParking) {
    emergAlarmReq = true;
    emergAlarmReason = "지하 차고·주차장이 200㎡ 미만으로 건물 전층에 설치 대상입니다.";
  }
  results.push(makeResult(categories.alarm, "비상경보설비", "",
    emergAlarmReq ? "required" : "notRequired", emergAlarmReason, ""));

  // ── 자동화재탐지설비 ──
  let autoDetReq = false;
  let autoDetReason = "";
  if (pd >= YD.D20120914) {
    if (isLiving) {
      autoDetReq = true;
      autoDetReason = "노유자 생활시설은 면적에 관계없이 자동화재탐지설비를 설치해야 합니다.";
    } else {
      autoDetReq = ta >= 400;
      autoDetReason = ta >= 400 ? "일반 노유자시설로 연면적이 400㎡ 이상입니다." :
        "연면적이 400㎡ 미만이어서 설치 대상이 아닙니다.";
    }
  } else {
    autoDetReq = ta >= 400;
    autoDetReason = ta >= 400 ? "연면적이 400㎡ 이상입니다." : "연면적이 400㎡ 미만이어서 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.alarm, "자동화재탐지설비", "", autoDetReq ? "required" : "notRequired", autoDetReason, ""));

  // ── 시각경보기 ──
  results.push(makeResult(categories.alarm, "시각경보기", "",
    autoDetReq ? "required" : "notRequired",
    autoDetReq ? "자동화재탐지설비 설치 대상 노유자시설에 함께 설치해야 합니다." :
    "자동화재탐지설비 설치 대상이 아닙니다.", ""));

  // ── 비상방송설비 ──
  const broadcastReq = ta >= 3500 || ag >= 11 || bf >= 3;
  results.push(makeResult(categories.alarm, "비상방송설비", "",
    broadcastReq ? "required" : "notRequired",
    ta >= 3500 ? "연면적이 3,500㎡ 이상입니다." :
    ag >= 11 ? "지상층수가 11층 이상입니다." :
    bf >= 3 ? "지하층수가 3층 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 자동화재속보설비 ──
  let autoDispatchReq = false;
  let autoDispatchReason = "";
  if (pd >= YD.D20120914) {
    if (isLiving) {
      if (inp.elderlyHas24HourStaff) {
        autoDispatchReq = false;
        autoDispatchReason = "노유자 생활시설이지만 24시간 상주 근무자가 있어 설치를 면제할 수 있습니다.";
      } else {
        autoDispatchReq = true;
        autoDispatchReason = "노유자 생활시설은 면적에 관계없이 자동화재속보설비를 설치해야 합니다.";
      }
    } else {
      // 일반 노유자시설: 500㎡ 이상 층이 있는 경우
      if (inp.elderlyHasFloor500Plus) {
        if (inp.elderlyHas24HourStaff) {
          autoDispatchReq = false;
          autoDispatchReason = "바닥면적 500㎡ 이상 층이 있으나 24시간 상주 근무자가 있어 설치를 면제할 수 있습니다.";
        } else {
          autoDispatchReq = true;
          autoDispatchReason = "바닥면적이 500㎡ 이상인 층이 있습니다.";
        }
      } else {
        autoDispatchReason = "바닥면적 500㎡ 이상인 층이 없어 설치 대상이 아닙니다.";
      }
    }
  } else {
    // 2004~2012: 500㎡ 이상 층
    if (inp.elderlyHasFloor500Plus) {
      autoDispatchReq = true;
      autoDispatchReason = "바닥면적이 500㎡ 이상인 층이 있습니다.";
    } else {
      autoDispatchReason = "바닥면적 500㎡ 이상인 층이 없어 설치 대상이 아닙니다.";
    }
  }
  results.push(makeResult(categories.alarm, "자동화재속보설비", "", autoDispatchReq ? "required" : "notRequired", autoDispatchReason, ""));

  // ── 가스누설경보기 ──
  results.push(makeResult(categories.alarm, "가스누설경보기", "",
    inp.elderlyHasGasFacility ? "required" : "notRequired",
    inp.elderlyHasGasFacility ? "가스시설이 설치된 노유자시설입니다." : "가스시설이 없어 설치 대상이 아닙니다.", ""));

  // ── 피난기구 ──
  let escapeReason = "";
  let escapeReq = false;
  if (pd >= YD.D20160101) {
    // 2016년 이후: 피난층이 아닌 1층·2층도 포함 (실질적으로 모든 층 3~10층)
    escapeReq = ag >= 1;
    escapeReason = ag >= 1
      ? "노유자시설은 피난층이 아닌 지상 1층·2층을 포함하여 3층 이상 10층 이하 층에 설치해야 합니다. (2016년 이후 적용)"
      : "지상층이 없어 설치 대상이 아닙니다.";
  } else {
    escapeReq = ag >= 3;
    escapeReason = ag >= 3 ? "3층 이상 10층 이하 층에 피난기구를 설치해야 합니다." :
      "3층 이상 층이 없어 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.evacuation, "피난기구(구조대·미끄럼대 등)", "",
    escapeReq ? "required" : "notRequired", escapeReason, ""));

  // ── 유도등 ──
  results.push(makeResult(categories.evacuation, "유도등(피난구유도등·통로유도등)", "", "required",
    "모든 노유자시설에 피난구유도등, 통로유도등, 유도표지를 설치해야 합니다.", ""));

  // ── 비상조명등 ──
  const emLightReq = (tf >= 5 && ta >= 3000) || hasBasement450 || hasWindowless450;
  results.push(makeResult(categories.evacuation, "비상조명등", "",
    emLightReq ? "required" : "notRequired",
    tf >= 5 && ta >= 3000 ? "전체 층수가 5층 이상이고 연면적이 3,000㎡ 이상입니다." :
    hasBasement450 ? "지하층 바닥면적이 450㎡ 이상입니다." :
    hasWindowless450 ? "무창층 바닥면적이 450㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 소화용수설비 ──
  results.push(makeResult(categories.waterSupply, "상수도소화용수설비", "",
    ta >= 5000 ? "required" : "notRequired",
    ta >= 5000 ? "연면적이 5,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 제연설비 ──
  let smokeReq = false;
  let smokeReason = "";
  if (ag >= 11) {
    smokeReq = true;
    smokeReason = "지상 11층 이상으로 특별피난계단에 제연설비를 설치해야 합니다.";
  } else if (pd >= YD.D20150108) {
    smokeReq = inp.elderlyBasementAreaForSmoke >= 1000;
    smokeReason = smokeReq
      ? "지하층·무창층 내 노유자시설 사용 바닥면적 합계가 1,000㎡ 이상입니다."
      : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    smokeReason = "2015년 1월 8일 이전에는 노유자시설은 제연설비 설치 대상이 아니었습니다.";
  }
  results.push(makeResult(categories.fireSupport, "제연설비", "",
    smokeReq ? "required" : "notRequired", smokeReason, ""));

  // ── 연결송수관설비 ──
  const standpipeReq = (tf >= 5 && ta >= 6000) || tf >= 7 || (bf >= 3 && ba >= 1000);
  results.push(makeResult(categories.fireSupport, "연결송수관설비", "",
    standpipeReq ? "required" : "notRequired",
    tf >= 5 && ta >= 6000 ? "전체 층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다." :
    tf >= 7 ? "전체 층수가 7층 이상입니다." :
    bf >= 3 && ba >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 연결살수설비 ──
  results.push(makeResult(categories.fireSupport, "연결살수설비", "",
    ba >= 150 ? "required" : "notRequired",
    ba >= 150 ? "지하층 바닥면적 합계가 150㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 비상콘센트설비 ──
  const emConsentReq = ag >= 11 || (bf >= 3 && ba >= 1000);
  results.push(makeResult(categories.fireSupport, "비상콘센트설비", "",
    emConsentReq ? "required" : "notRequired",
    ag >= 11 ? "지상층수가 11층 이상입니다." :
    bf >= 3 && ba >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 무선통신보조설비 ──
  const radioBase = ba >= 3000 || (bf >= 3 && ba >= 1000);
  const radioHigh = pd >= YD.D20111123 && ag >= 30;
  results.push(makeResult(categories.fireSupport, "무선통신보조설비", "",
    radioBase || radioHigh ? "required" : "notRequired",
    ba >= 3000 ? "지하층 바닥면적 합계가 3,000㎡ 이상입니다." :
    bf >= 3 && ba >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
    radioHigh ? "지상층수가 30층 이상으로 16층 이상 부분에 설치 대상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  return results;
}

function yearEvaluateMedical(inp) {
  const results = [];
  const { pd } = inp;
  const ag = inp.aboveGroundFloors;
  const bf = inp.basementFloors;
  const ba = inp.basementAreaSum;
  const ta = inp.totalArea;
  const tf = inp.totalFloors;
  const ma = inp.medicalArea;
  const wl = inp.windowlessArea;
  const bsmtAvg = bf > 0 ? ba / bf : 0;

  const subtype = inp.medicalSubtype;
  const isNursingHome = subtype === "nursingHome";
  const isPsychiatric = subtype === "psychiatricHospital";
  const isRehabilitation = subtype === "rehabilitationFacility";
  const isHospitalGrade = subtype === "hospital" || subtype === "generalHospital";
  const isBigHospital = isHospitalGrade || isNursingHome;

  const hasBasement150 = bf > 0 && bsmtAvg >= 150;
  const hasBasement300 = bf > 0 && bsmtAvg >= 300;
  const hasBasement450 = bf > 0 && bsmtAvg >= 450;
  const hasWindowless150 = inp.hasWindowlessFloor && wl >= 150;
  const hasWindowless300 = inp.hasWindowlessFloor && wl >= 300;
  const hasWindowless450 = inp.hasWindowlessFloor && wl >= 450;

  // ── 소화기구 ──
  results.push(makeResult(categories.extinguishing, "소화기구", "",
    ta >= 33 ? "required" : "notRequired",
    ta >= 33 ? "연면적이 33㎡ 이상입니다." : "연면적이 33㎡ 미만입니다.", ""));

  // ── 옥내소화전설비 (기준 20년 동일) ──
  const indoorHydrantReq = ta >= 1500 || hasBasement300 || hasWindowless300 || inp.medicalHasLargeTargetFloor;
  results.push(makeResult(categories.extinguishing, "옥내소화전설비", "",
    indoorHydrantReq ? "required" : "notRequired",
    ta >= 1500 ? "연면적이 1,500㎡ 이상입니다." :
    hasBasement300 ? "지하층 바닥면적이 300㎡ 이상인 층이 있습니다." :
    hasWindowless300 ? "무창층 바닥면적이 300㎡ 이상입니다." :
    inp.medicalHasLargeTargetFloor ? "4층 이상 층 중 바닥면적 300㎡ 이상인 층이 있습니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 스프링클러설비 ──
  let sprinklerReq = false;
  let sprinklerReason = "";
  const commonSprinkler = ag >= 11;

  if (pd >= YD.D20040530 && pd < YD.D20140708) {
    if (isPsychiatric) {
      sprinklerReq = ma >= 600 || commonSprinkler;
      sprinklerReason = ma >= 600 ? "정신의료기관 바닥면적 합계가 600㎡ 이상으로 전층 설치 대상입니다." :
        commonSprinkler ? "층수가 11층 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    } else {
      sprinklerReq = commonSprinkler;
      sprinklerReason = commonSprinkler ? "층수가 11층 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    }
  } else if (pd >= YD.D20140708 && pd < YD.D20190806) {
    if (isNursingHome || isPsychiatric) {
      sprinklerReq = ma >= 600 || commonSprinkler;
      const label = isNursingHome ? "요양병원" : "정신의료기관";
      sprinklerReason = ma >= 600 ? `${label} 바닥면적 합계가 600㎡ 이상으로 전층 설치 대상입니다.` :
        commonSprinkler ? "층수가 11층 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    } else {
      sprinklerReq = commonSprinkler;
      sprinklerReason = commonSprinkler ? "층수가 11층 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    }
  } else {
    if (isBigHospital || isPsychiatric) {
      sprinklerReq = ma >= 600 || commonSprinkler;
      sprinklerReason = ma >= 600 ? "의료시설 바닥면적 합계가 600㎡ 이상으로 전층 설치 대상입니다." :
        commonSprinkler ? "층수가 11층 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    } else {
      sprinklerReq = commonSprinkler;
      sprinklerReason = commonSprinkler ? "층수가 11층 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.";
    }
  }
  results.push(makeResult(categories.extinguishing, "스프링클러설비", "",
    sprinklerReq ? "required" : "notRequired", sprinklerReason, ""));

  // ── 간이스프링클러설비 ──
  let simpleSprinklerReq = false;
  let simpleSprinklerReason = "";
  if (sprinklerReq) {
    simpleSprinklerReason = "스프링클러설비 설치 대상이므로 간이스프링클러설비는 제외됩니다.";
  } else if (pd < YD.D20120215) {
    simpleSprinklerReason = "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else if (pd >= YD.D20120215 && pd < YD.D20140708) {
    if (isPsychiatric || isRehabilitation) {
      simpleSprinklerReq = (ma >= 300 && ma < 600) || inp.medicalHasGrillWindow;
      simpleSprinklerReason = ma >= 300 && ma < 600 ? "정신의료기관 바닥면적이 300㎡ 이상 600㎡ 미만입니다." :
        inp.medicalHasGrillWindow ? "창살이 설치된 시설로 면적에 관계없이 설치 대상입니다." :
        "현재 입력 기준으로는 설치 대상이 아닙니다.";
    } else {
      simpleSprinklerReason = "현재 입력 기준으로는 설치 대상이 아닙니다.";
    }
  } else if (pd >= YD.D20140708 && pd < YD.D20190806) {
    if (isNursingHome) {
      simpleSprinklerReq = true;
      simpleSprinklerReason = "요양병원은 바닥면적에 관계없이 간이스프링클러설비 설치 대상입니다.";
    } else if (isPsychiatric || isRehabilitation) {
      simpleSprinklerReq = (ma >= 300 && ma < 600) || inp.medicalHasGrillWindow;
      simpleSprinklerReason = ma >= 300 && ma < 600 ? "정신의료기관·의료재활시설 바닥면적이 300㎡ 이상 600㎡ 미만입니다." :
        inp.medicalHasGrillWindow ? "창살이 설치된 시설로 면적에 관계없이 설치 대상입니다." :
        "현재 입력 기준으로는 설치 대상이 아닙니다.";
    } else {
      simpleSprinklerReason = "현재 입력 기준으로는 설치 대상이 아닙니다.";
    }
  } else {
    if (isBigHospital) {
      simpleSprinklerReq = true;
      simpleSprinklerReason = "병원급 의료시설은 바닥면적에 관계없이 간이스프링클러설비 설치 대상입니다.";
    } else if (isPsychiatric || isRehabilitation) {
      simpleSprinklerReq = (ma >= 300 && ma < 600) || inp.medicalHasGrillWindow;
      simpleSprinklerReason = ma >= 300 && ma < 600 ? "정신의료기관·의료재활시설 바닥면적이 300㎡ 이상 600㎡ 미만입니다." :
        inp.medicalHasGrillWindow ? "창살이 설치된 시설로 면적에 관계없이 설치 대상입니다." :
        "현재 입력 기준으로는 설치 대상이 아닙니다.";
    } else {
      simpleSprinklerReason = "현재 입력 기준으로는 설치 대상이 아닙니다.";
    }
  }
  results.push(makeResult(categories.extinguishing, "간이스프링클러설비", "",
    sprinklerReq ? "notRequired" : (simpleSprinklerReq ? "required" : "notRequired"),
    sprinklerReq ? "스프링클러설비 설치 대상이므로 제외됩니다." : simpleSprinklerReason, ""));

  // ── 물분무등소화설비 ──
  const waterSprayReq = inp.medicalIndoorParkingArea >= 200 || inp.medicalMechanicalParkingCapacity >= 20 || inp.medicalElectricalRoomArea >= 300;
  results.push(makeResult(categories.extinguishing, "물분무등소화설비", "",
    waterSprayReq ? "required" : "notRequired",
    buildWaterSprayReason(0, inp.medicalIndoorParkingArea, inp.medicalMechanicalParkingCapacity, inp.medicalElectricalRoomArea), ""));

  // ── 옥외소화전설비 ──
  results.push(makeResult(categories.extinguishing, "옥외소화전설비", "",
    inp.medicalFirstSecondFloorArea >= 9000 ? "required" : "notRequired",
    inp.medicalFirstSecondFloorArea >= 9000 ? "지상 1층과 2층의 바닥면적 합계가 9,000㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 비상경보설비 (기준 20년 동일) ──
  const emergAlarmReq = ta >= 400 || hasBasement150 || hasWindowless150;
  results.push(makeResult(categories.alarm, "비상경보설비", "",
    emergAlarmReq ? "required" : "notRequired",
    ta >= 400 ? "연면적이 400㎡ 이상입니다." :
    hasBasement150 ? "지하층 바닥면적이 150㎡ 이상입니다." :
    hasWindowless150 ? "무창층 바닥면적이 150㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 자동화재탐지설비 ──
  let autoDetReq = false;
  let autoDetReason = "";
  if (pd >= YD.D20040530 && pd < YD.D20140708) {
    autoDetReq = ta >= 600;
    autoDetReason = ta >= 600 ? "연면적이 600㎡ 이상인 의료시설입니다." : "연면적이 600㎡ 미만이어서 설치 대상이 아닙니다.";
  } else if (pd >= YD.D20140708 && pd < YD.D20150701) {
    if (isNursingHome || isPsychiatric || isRehabilitation) {
      autoDetReq = ma >= 300 || inp.medicalHasGrillWindow;
      autoDetReason = ma >= 300 ? "요양병원·정신의료기관·의료재활시설로 바닥면적이 300㎡ 이상입니다." :
        inp.medicalHasGrillWindow ? "창살이 설치된 시설로 면적에 관계없이 설치 대상입니다." :
        "현재 입력 기준으로는 설치 대상이 아닙니다.";
    } else {
      autoDetReq = ta >= 600;
      autoDetReason = ta >= 600 ? "연면적이 600㎡ 이상인 의료시설입니다." : "연면적이 600㎡ 미만이어서 설치 대상이 아닙니다.";
    }
  } else {
    if (isNursingHome) {
      autoDetReq = true;
      autoDetReason = "요양병원(의료재활시설 제외)은 면적에 관계없이 자동화재탐지설비를 설치해야 합니다.";
    } else if (isPsychiatric || isRehabilitation) {
      autoDetReq = ma >= 300 || inp.medicalHasGrillWindow;
      autoDetReason = ma >= 300 ? "정신의료기관·의료재활시설로 바닥면적이 300㎡ 이상입니다." :
        inp.medicalHasGrillWindow ? "창살이 설치된 시설로 면적에 관계없이 설치 대상입니다." :
        "현재 입력 기준으로는 설치 대상이 아닙니다.";
    } else {
      autoDetReq = ta >= 600;
      autoDetReason = ta >= 600 ? "연면적이 600㎡ 이상인 의료시설입니다." : "연면적이 600㎡ 미만이어서 설치 대상이 아닙니다.";
    }
  }
  results.push(makeResult(categories.alarm, "자동화재탐지설비", "", autoDetReq ? "required" : "notRequired", autoDetReason, ""));

  // ── 시각경보기 (자동화재탐지설비 설치 의료시설에 세트) ──
  results.push(makeResult(categories.alarm, "시각경보기", "",
    autoDetReq ? "required" : "notRequired",
    autoDetReq ? "자동화재탐지설비 설치 대상 의료시설에 시각경보기를 함께 설치해야 합니다." :
    "자동화재탐지설비 설치 대상이 아닙니다.", ""));

  // ── 비상방송설비 (기준 20년 동일) ──
  const broadcastReq = ta >= 3500 || ag >= 11 || bf >= 3;
  results.push(makeResult(categories.alarm, "비상방송설비", "",
    broadcastReq ? "required" : "notRequired",
    ta >= 3500 ? "연면적이 3,500㎡ 이상입니다." :
    ag >= 11 ? "지상층수가 11층 이상입니다." :
    bf >= 3 ? "지하층수가 3층 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 자동화재속보설비 ──
  let autoDispatchReq = false;
  let autoDispatchReason = "";
  if (pd < YD.D20140708) {
    autoDispatchReason = "해당 허가 시기에는 의료시설에 자동화재속보설비 설치 의무가 없었습니다.";
  } else if (pd >= YD.D20140708 && pd < YD.D20150701) {
    if (isNursingHome) {
      autoDispatchReq = inp.medicalHasFloor500Plus;
      autoDispatchReason = inp.medicalHasFloor500Plus ? "요양병원으로 바닥면적이 500㎡ 이상인 층이 있습니다." :
        "바닥면적 500㎡ 이상인 층이 없어 설치 대상이 아닙니다.";
    } else {
      autoDispatchReason = "해당 허가 시기에는 요양병원 이외의 의료시설은 자동화재속보설비 설치 의무가 없었습니다.";
    }
  } else if (pd >= YD.D20150701 && pd < YD.D20190806) {
    if (isNursingHome) {
      autoDispatchReq = true;
      autoDispatchReason = "요양병원(정신병원·의료재활시설 제외)은 면적에 관계없이 자동화재속보설비를 설치해야 합니다.";
    } else if (isPsychiatric || isRehabilitation) {
      autoDispatchReq = inp.medicalHasFloor500Plus;
      autoDispatchReason = inp.medicalHasFloor500Plus ? "정신병원·의료재활시설로 바닥면적이 500㎡ 이상인 층이 있습니다." :
        "바닥면적 500㎡ 이상인 층이 없어 설치 대상이 아닙니다.";
    } else {
      autoDispatchReason = "해당 허가 시기에는 요양병원 이외의 병원급 의료시설은 자동화재속보설비 설치 의무가 없었습니다.";
    }
  } else {
    if (isBigHospital) {
      autoDispatchReq = true;
      autoDispatchReason = "병원급 의료시설(종합병원·병원·치과병원·한방병원·요양병원)은 면적에 관계없이 자동화재속보설비를 설치해야 합니다.";
    } else if (isPsychiatric || isRehabilitation) {
      autoDispatchReq = inp.medicalHasFloor500Plus;
      autoDispatchReason = inp.medicalHasFloor500Plus ? "정신병원·의료재활시설로 바닥면적이 500㎡ 이상인 층이 있습니다." :
        "바닥면적 500㎡ 이상인 층이 없어 설치 대상이 아닙니다.";
    }
  }
  results.push(makeResult(categories.alarm, "자동화재속보설비", "", autoDispatchReq ? "required" : "notRequired", autoDispatchReason, ""));

  // ── 가스누설경보기 (가스시설 있으면 무조건) ──
  results.push(makeResult(categories.alarm, "가스누설경보기", "",
    inp.medicalHasGasFacility ? "required" : "notRequired",
    inp.medicalHasGasFacility ? "가스시설이 설치된 의료시설입니다." : "가스시설이 없어 설치 대상이 아닙니다.", ""));

  // ── 피난기구 (일반 기준과 동일) ──
  results.push(makeResult(categories.evacuation, "피난기구(구조대·완강기 등)", "",
    ag >= 3 ? "required" : "notRequired",
    ag >= 3 ? "3층 이상 10층 이하 층에 피난기구를 설치해야 합니다." :
    "3층 이상 층이 없어 설치 대상이 아닙니다.", ""));

  // ── 인명구조기구 (병원급에만 적용) ──
  let rescueReq = false;
  let rescueReason = "";
  if (isHospitalGrade) {
    if (tf >= 5) {
      rescueReq = true;
      rescueReason = pd >= YD.D20221201
        ? "지하층 포함 5층 이상이고 병원 용도로 사용하는 층이 있어 인명구조기구(방열복 또는 방화복·공기호흡기) 설치 대상입니다."
        : "지하층을 포함한 층수가 5층 이상인 병원으로 인명구조기구(방열복·공기호흡기) 설치 대상입니다.";
    } else {
      rescueReason = "지하층을 포함한 층수가 5층 미만이어서 설치 대상이 아닙니다.";
    }
  } else {
    rescueReason = "종합병원·병원·치과병원·한방병원에만 해당하여 현재 시설은 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.evacuation, "인명구조기구(방열복·공기호흡기)", "",
    rescueReq ? "required" : "notRequired", rescueReason, ""));

  // ── 유도등 ──
  results.push(makeResult(categories.evacuation, "유도등(피난구유도등·통로유도등)", "", "required",
    "모든 의료시설에 피난구유도등, 통로유도등, 유도표지를 설치해야 합니다.", ""));

  // ── 비상조명등 ──
  const emLightReq = (tf >= 5 && ta >= 3000) || hasBasement450 || hasWindowless450;
  results.push(makeResult(categories.evacuation, "비상조명등", "",
    emLightReq ? "required" : "notRequired",
    tf >= 5 && ta >= 3000 ? "전체 층수가 5층 이상이고 연면적이 3,000㎡ 이상입니다." :
    hasBasement450 ? "지하층 바닥면적이 450㎡ 이상입니다." :
    hasWindowless450 ? "무창층 바닥면적이 450㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 소화용수설비 ──
  results.push(makeResult(categories.waterSupply, "상수도소화용수설비", "",
    ta >= 5000 ? "required" : "notRequired",
    ta >= 5000 ? "연면적이 5,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 제연설비 ──
  let smokeReq = false;
  let smokeReason = "";
  if (ag >= 11) {
    smokeReq = true;
    smokeReason = "지상 11층 이상으로 특별피난계단에 제연설비를 설치해야 합니다.";
  } else if (pd >= YD.D20150108) {
    smokeReq = inp.medicalBasementAreaForSmoke >= 1000;
    smokeReason = smokeReq
      ? "지하층·무창층 내 의료시설 사용 바닥면적 합계가 1,000㎡ 이상입니다."
      : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    smokeReason = "2015년 1월 8일 이전에는 의료시설은 제연설비 설치 대상이 아니었습니다.";
  }
  results.push(makeResult(categories.fireSupport, "제연설비", "",
    smokeReq ? "required" : "notRequired", smokeReason, ""));

  // ── 연결송수관설비 (기준 20년 동일) ──
  const standpipeReq = (tf >= 5 && ta >= 6000) || tf >= 7 || (bf >= 3 && ba >= 1000);
  results.push(makeResult(categories.fireSupport, "연결송수관설비", "",
    standpipeReq ? "required" : "notRequired",
    tf >= 5 && ta >= 6000 ? "전체 층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다." :
    tf >= 7 ? "전체 층수가 7층 이상입니다." :
    bf >= 3 && ba >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 연결살수설비 (지하층 150㎡ 이상) ──
  results.push(makeResult(categories.fireSupport, "연결살수설비", "",
    ba >= 150 ? "required" : "notRequired",
    ba >= 150 ? "지하층 바닥면적 합계가 150㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 비상콘센트설비 (기준 20년 동일) ──
  const emConsentReq = ag >= 11 || (bf >= 3 && ba >= 1000);
  results.push(makeResult(categories.fireSupport, "비상콘센트설비", "",
    emConsentReq ? "required" : "notRequired",
    ag >= 11 ? "지상층수가 11층 이상입니다." :
    bf >= 3 && ba >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 무선통신보조설비 ──
  const radioBase = ba >= 3000 || (bf >= 3 && ba >= 1000);
  const radioHigh = pd >= YD.D20111123 && ag >= 30;
  results.push(makeResult(categories.fireSupport, "무선통신보조설비", "",
    radioBase || radioHigh ? "required" : "notRequired",
    ba >= 3000 ? "지하층 바닥면적 합계가 3,000㎡ 이상입니다." :
    bf >= 3 && ba >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
    radioHigh ? "지상층수가 30층 이상으로 16층 이상 부분에 설치 대상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  return results;
}

// ── 공동주택 (분법 이후, 2004.5.30~) ──
// subtype: apt(아파트등) / row(연립·다세대) / dorm(기숙사)
function yearEvaluateApartment(inp) {
  const results = [];
  const { pd } = inp;
  const sub = inp.apartmentSubtype;
  const isApt = sub === "apt";
  const isRow = sub === "row";
  const isDorm = sub === "dorm";
  // 단지 단위 근사: 면적 임계는 동당 평균 연면적(단지 연면적÷동수)으로 판정.
  // 층수·지하면적(ag/bf/ba/wl)은 가장 높은 동·통합 지하 기준이므로 나누지 않음.
  const dongCount = inp.aptBuildingCount || 1;
  const taTotal = inp.totalArea;
  const ta = dongCount > 0 ? taTotal / dongCount : taTotal; // 동당 평균 연면적
  const ag = inp.aboveGroundFloors;
  const bf = inp.basementFloors;
  const ba = inp.basementAreaSum;
  const tf = ag + bf;
  const wl = inp.windowlessArea;
  const bsmtAvg = bf > 0 ? ba / bf : 0;
  const post2022 = pd >= YD.D20221201;

  const hasBasement150 = bf > 0 && bsmtAvg >= 150;
  const hasBasement450 = bf > 0 && bsmtAvg >= 450;
  const hasBasement600 = bf > 0 && bsmtAvg >= 600;
  const hasBasement1000 = bf > 0 && bsmtAvg >= 1000;
  const hasWindowless150 = inp.hasWindowlessFloor && wl >= 150;
  const hasWindowless450 = inp.hasWindowlessFloor && wl >= 450;
  const hasWindowless600 = inp.hasWindowlessFloor && wl >= 600;
  const hasWindowless1000 = inp.hasWindowlessFloor && wl >= 1000;
  const has4FFloor600 = ag >= 4 && inp.aptHasFloor600;
  const has4FFloor1000 = ag >= 4 && inp.aptHasFloor1000;
  const airMatReq = isApt && yIsAptMgmtTarget(inp.aptHouseholdCount || 0, ag);

  // 1. 소화기 (용도무관: 연면적 33㎡ 이상)
  results.push(makeResult(categories.extinguishing, "소화기", "",
    ta >= 33 ? "required" : "notRequired",
    ta >= 33 ? "연면적 33㎡ 이상입니다. (용도무관 공통 기준)" : "연면적 33㎡ 미만입니다.", ""));

  // 2. 주거용 주방자동소화장치 (아파트등만)
  if (isApt) {
    const kitName = pd < YD.D20120206 ? "자동식소화기"
      : pd < YD.D20140708 ? "주방용 자동소화장치"
      : "주거용 주방자동소화장치";
    results.push(makeResult(categories.extinguishing, kitName, "", "required",
      "아파트등은 모든 층의 주방에 " + kitName + "를 설치해야 합니다.", ""));
  } else {
    results.push(makeResult(categories.extinguishing, "주거용 주방자동소화장치", "", "notRequired",
      (isRow ? "연립주택·다세대주택" : "기숙사") + "은 주거용 주방자동소화장치 의무 설치 대상이 아닙니다. (아파트등·오피스텔 대상)", ""));
  }

  // 3. 스프링클러설비 (용도무관: 6층/11층, 4층·지하·무창 1000㎡)
  const spThreshold = pd >= YD.D20170726 ? 6 : 11;
  let spReq = false, spReason = "";
  if (ag >= spThreshold) {
    spReq = true;
    spReason = "지상 층수가 " + spThreshold + "층 이상이어서 모든 층에 설치해야 합니다. (" + (spThreshold === 6 ? "2017.7.26~ 6층 이상" : "11층 이상") + " 용도무관 기준)";
  } else if (hasBasement1000 || hasWindowless1000 || has4FFloor1000) {
    spReq = true;
    spReason = hasBasement1000 ? "지하층 바닥면적 1,000㎡ 이상인 층이 있어 해당 층에 설치해야 합니다."
      : hasWindowless1000 ? "무창층 바닥면적 1,000㎡ 이상인 층이 있어 해당 층에 설치해야 합니다."
      : "4층 이상 층 중 바닥면적 1,000㎡ 이상인 층이 있어 해당 층에 설치해야 합니다.";
  } else {
    spReason = "현재 입력 기준으로는 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.extinguishing, "스프링클러설비", "", spReq ? "required" : "notRequired", spReason, ""));

  // 4. 간이스프링클러설비 (연립·다세대, 2022.12.1~ 주택전용)
  if (isRow && post2022) {
    results.push(makeResult(categories.extinguishing, "간이스프링클러설비", "", "required",
      "연립주택·다세대주택은 2022.12.1부터 주택전용 간이스프링클러설비 설치 대상입니다.", ""));
  } else {
    results.push(makeResult(categories.extinguishing, "간이스프링클러설비", "", "notRequired",
      isRow ? "연립주택·다세대주택의 간이스프링클러 의무는 2022.12.1 이후 허가분부터 적용됩니다."
            : "아파트등·기숙사는 간이스프링클러설비 의무 설치 대상이 아닙니다.", ""));
  }

  // 5. 물분무등소화설비 (용도무관: 주차장 200㎡·기계식 20대·전기실 300㎡)
  const parkingExcluded = isRow && inp.aptHouseholdsUnder50 && post2022;
  const parkingArea = inp.aptHasParkingBuilding ? inp.aptParkingArea : inp.aptIndoorParkingArea;
  const parkingTrigger = !parkingExcluded && parkingArea >= 200;
  const wsReq = parkingTrigger || inp.aptMechanicalParkingCapacity >= 20 || inp.aptElectricalRoomArea >= 300;
  let wsReason;
  if (inp.aptElectricalRoomArea >= 300) wsReason = "전기실·발전실 등 바닥면적이 300㎡ 이상입니다.";
  else if (inp.aptMechanicalParkingCapacity >= 20) wsReason = "기계식 주차장치가 20대 이상입니다.";
  else if (parkingTrigger) wsReason = (inp.aptHasParkingBuilding ? "주차장동 연면적" : "건물 내 차고·주차장 면적") + "이 200㎡ 이상입니다.";
  else if (parkingExcluded && parkingArea >= 200) wsReason = "50세대 미만 연립주택·다세대주택은 차고·주차장(200㎡ 이상) 기준에서 제외됩니다. (2022.12.1~)";
  else wsReason = "현재 입력 기준으로는 설치 대상이 아닙니다.";
  results.push(makeResult(categories.extinguishing, "물분무등소화설비", "", wsReq ? "required" : "notRequired", wsReason, ""));

  // 6. 옥내소화전설비 (용도무관: 연면적 3000㎡·지하무창4층 600㎡)
  const indoorReq = ta >= 3000 || hasBasement600 || hasWindowless600 || has4FFloor600;
  results.push(makeResult(categories.extinguishing, "옥내소화전설비", "",
    indoorReq ? "required" : "notRequired",
    ta >= 3000 ? "연면적 3,000㎡ 이상입니다. (모든 층)"
      : hasBasement600 ? "지하층 바닥면적 600㎡ 이상인 층이 있습니다."
      : hasWindowless600 ? "무창층 바닥면적 600㎡ 이상입니다."
      : has4FFloor600 ? "4층 이상 층 중 바닥면적 600㎡ 이상인 층이 있습니다."
      : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // 7. 옥외소화전설비 (용도무관: 1·2층 합계 9000㎡, 아파트등 2011.10.28~ 제외)
  let outdoorReq = false, outdoorReason = "";
  if (isApt && pd >= YD.D20111028) {
    outdoorReason = "아파트등은 2011.10.28부터 옥외소화전설비 설치 대상에서 제외됩니다.";
  } else if (inp.aptFirstSecondFloorArea >= 9000) {
    outdoorReq = true; outdoorReason = "지상 1·2층 바닥면적 합계가 9,000㎡ 이상입니다. (용도무관 기준)";
  } else {
    outdoorReason = "지상 1·2층 바닥면적 합계 9,000㎡ 미만으로 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.extinguishing, "옥외소화전설비", "", outdoorReq ? "required" : "notRequired", outdoorReason, ""));

  // 9. 자동화재탐지설비
  let facpReq = false, facpReason = "";
  if (post2022) {
    if (isApt || isDorm) { facpReq = true; facpReason = (isApt ? "아파트등" : "기숙사") + "은 2022.12.1부터 면적·층수와 무관하게 모든 층에 설치해야 합니다."; }
    else if (ag >= 6) { facpReq = true; facpReason = "층수가 6층 이상인 건축물입니다. (2022.12.1~ 용도무관 기준)"; }
    else facpReason = "연립주택·다세대주택은 2022.12.1부터 자동화재탐지설비 대신 연동형 단독경보형감지기 대상입니다.";
  } else {
    if (ta >= 1000) { facpReq = true; facpReason = "연면적 1,000㎡ 이상인 공동주택입니다."; }
    else facpReason = "연면적 1,000㎡ 미만으로 자동화재탐지설비 대상이 아닙니다. (단독경보형감지기 대상)";
  }
  results.push(makeResult(categories.alarm, "자동화재탐지설비", "", facpReq ? "required" : "notRequired", facpReason, ""));

  // 7. 단독경보형감지기 (자동화재탐지설비를 설치하면 면제)
  let singleReq = false, singleReason = "";
  if (facpReq) {
    singleReason = "자동화재탐지설비 설치 대상이어서 단독경보형감지기는 면제됩니다.";
  } else if (post2022) {
    if (isRow) { singleReq = true; singleReason = "연립주택·다세대주택은 2022.12.1부터 연동형 단독경보형감지기를 설치해야 합니다."; }
    else singleReason = (isApt ? "아파트등" : "기숙사") + "은 자동화재탐지설비 대상이어서 단독경보형감지기 대상에서 제외됩니다.";
  } else if (isApt && ta < 1000) {
    singleReq = true; singleReason = "연면적 1,000㎡ 미만 아파트등으로 단독경보형감지기 설치 대상입니다.";
  } else {
    singleReason = "현재 입력 기준으로는 단독경보형감지기 대상이 아닙니다.";
  }
  results.push(makeResult(categories.alarm, "단독경보형감지기", "", singleReq ? "required" : "notRequired", singleReason, ""));

  // 8. 비상경보설비 (용도무관: 연면적 400㎡·지하무창 150㎡, 2025.12.1~ 소규모 지하주차장)
  const smallUgParking = pd >= YD.D20251201 && inp.aptUndergroundParkingArea > 0 && inp.aptUndergroundParkingArea < 200;
  const alarmReq = ta >= 400 || hasBasement150 || hasWindowless150 || smallUgParking;
  results.push(makeResult(categories.alarm, "비상경보설비", "",
    alarmReq ? "required" : "notRequired",
    ta >= 400 ? "연면적 400㎡ 이상입니다. (모든 층)"
      : hasBasement150 ? "지하층 바닥면적 150㎡ 이상입니다."
      : hasWindowless150 ? "무창층 바닥면적 150㎡ 이상입니다."
      : smallUgParking ? "지하 차고·주차장 면적이 200㎡ 미만입니다. (2025.12.1~ 신설 기준)"
      : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // 12. 비상방송설비 (용도무관: 연면적 3500㎡·11층·지하 3층)
  const broadcastReq = ta >= 3500 || ag >= 11 || bf >= 3;
  results.push(makeResult(categories.alarm, "비상방송설비", "",
    broadcastReq ? "required" : "notRequired",
    ta >= 3500 ? "연면적 3,500㎡ 이상입니다. (모든 층)"
      : ag >= 11 ? "층수가 11층 이상입니다. (모든 층)"
      : bf >= 3 ? "지하층 층수가 3층 이상입니다. (모든 층)"
      : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // 13. 자동화재속보설비 (2012.9.14~2022.11.30 30층 이상, 이후 공동주택 제외)
  let notifyReq = false, notifyReason = "";
  if (post2022) notifyReason = "공동주택은 2022.12.1부터 자동화재속보설비 설치 대상에서 제외됩니다.";
  else if (pd >= YD.D20120914 && ag >= 30) { notifyReq = true; notifyReason = "층수가 30층 이상입니다. (2012.9.14~2022.11.30 용도무관 기준)"; }
  else notifyReason = "현재 입력 기준으로는 자동화재속보설비 대상이 아닙니다.";
  results.push(makeResult(categories.alarm, "자동화재속보설비", "", notifyReq ? "required" : "notRequired", notifyReason, ""));

  // 18. 인명구조기구(공기호흡기) — 이산화탄소소화설비 연계 (2012.9.14~)
  if (pd >= YD.D20120914 && inp.aptHasCO2System) {
    results.push(makeResult(categories.evacuation, "인명구조기구(공기호흡기)", "", "required",
      "이산화탄소소화설비가 설치된 장소로 공기호흡기를 비치해야 합니다. (호스릴 방식 제외)", ""));
  }

  // 19. 유도등 (항상 설치)
  results.push(makeResult(categories.evacuation, "유도등", "", "required",
    "공동주택은 시행일·규모와 무관하게 유도등 설치 대상입니다.", ""));

  // 17. 피난기구 (3~10층 및 피난층 아닌 지하층, 1·2·11층 이상 면제)
  const escapeReq = ag >= 3 || bf >= 1;
  results.push(makeResult(categories.evacuation, "피난기구", "",
    escapeReq ? "required" : "notRequired",
    escapeReq ? "3층~10층 및 피난층이 아닌 지하층에 설치해야 합니다. (1·2층, 11층 이상, 피난층 면제)"
      : "1·2층 및 피난층만 있어 피난기구 설치가 면제됩니다.", ""));

  results.push(makeResult(categories.evacuation, "공기안전매트", "",
    airMatReq ? "required" : "notRequired",
    airMatReq
      ? "300세대 이상이거나 150세대 이상이면서 승강기가 설치된 아파트등으로 공기안전매트 설치 대상입니다."
      : "300세대 미만이고 150세대 이상·승강기 설치 조건에도 해당하지 않아 공기안전매트 설치 대상이 아닙니다.", ""));

  // 20. 비상조명등 (용도무관: 5층 이상+3000㎡, 지하무창 450㎡)
  const emerLightReq = (tf >= 5 && ta >= 3000) || hasBasement450 || hasWindowless450;
  results.push(makeResult(categories.evacuation, "비상조명등", "",
    emerLightReq ? "required" : "notRequired",
    (tf >= 5 && ta >= 3000) ? "지하 포함 5층 이상이고 연면적 3,000㎡ 이상입니다. (모든 층)"
      : hasBasement450 ? "지하층 바닥면적 450㎡ 이상입니다. (해당 층)"
      : hasWindowless450 ? "무창층 바닥면적 450㎡ 이상입니다. (해당 층)"
      : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // 22. 소화용수설비 (용도무관: 연면적 5000㎡)
  results.push(makeResult(categories.waterSupply, "상수도소화용수설비", "",
    ta >= 5000 ? "required" : "notRequired",
    ta >= 5000 ? "연면적 5,000㎡ 이상입니다. (대지경계선 180m 내 75mm 이상 배수관이 없으면 소화수조·저수조로 대체)"
      : "연면적 5,000㎡ 미만으로 설치 대상이 아닙니다.", ""));

  // 23. 제연설비 (특별피난계단·비상용/피난용승강기 승강장, 갓복도형 아파트등 제외)
  let smokeReq = false, smokeReason = "";
  if (inp.aptHasSpecialStair) {
    if (isApt && inp.aptIsGatBokdo) smokeReason = "갓복도형 아파트등은 제연설비 설치 대상에서 제외됩니다.";
    else { smokeReq = true; smokeReason = "특별피난계단·비상용승강기" + (post2022 ? "·피난용승강기" : "") + "의 승강장에 제연설비를 설치해야 합니다."; }
  } else {
    smokeReason = "특별피난계단·비상용승강기 등이 없어 제연설비 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.fireSupport, "제연설비", "", smokeReq ? "required" : "notRequired", smokeReason, ""));

  // 24. 연결송수관설비 (용도무관: 5층+6000㎡, 지하포함 7층, 지하 3층+1000㎡)
  const standpipeReq = (ag >= 5 && ta >= 6000) || tf >= 7 || (bf >= 3 && ba >= 1000);
  results.push(makeResult(categories.fireSupport, "연결송수관설비", "",
    standpipeReq ? "required" : "notRequired",
    (ag >= 5 && ta >= 6000) ? "지상 5층 이상이고 연면적 6,000㎡ 이상입니다. (모든 층)"
      : tf >= 7 ? "지하 포함 층수가 7층 이상입니다. (모든 층)"
      : (bf >= 3 && ba >= 1000) ? "지하 3층 이상이고 지하층 바닥면적 합계 1,000㎡ 이상입니다. (모든 층)"
      : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // 25. 연결살수설비 (용도무관: 지하 150㎡, 국민주택규모 대피시설 700㎡ 특례, 2025.12.1~ 소규모 지하주차장)
  const sprayThreshold = (isApt && inp.aptIsNationalHousing) ? 700 : 150;
  const sprayMain = bf > 0 && ba >= sprayThreshold;
  const sprayUgPark = pd >= YD.D20251201 && inp.aptUndergroundParkingArea > 0 && inp.aptUndergroundParkingArea < 200;
  results.push(makeResult(categories.fireSupport, "연결살수설비", "",
    (sprayMain || sprayUgPark) ? "required" : "notRequired",
    sprayMain ? (sprayThreshold === 700
        ? "국민주택규모 이하 아파트등의 대피용 지하층 바닥면적 합계가 700㎡ 이상입니다. (지하층 모든 층)"
        : "지하층 바닥면적 합계가 150㎡ 이상입니다. (지하층 모든 층)")
      : sprayUgPark ? "지하 차고·주차장 면적이 200㎡ 미만입니다. (2025.12.1~ 신설 기준)"
      : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // 26. 비상콘센트설비 (용도무관: 11층, 지하 3층+1000㎡)
  const consol11 = post2022 ? ag >= 11 : tf >= 11;
  const consoleReq = consol11 || (bf >= 3 && ba >= 1000);
  results.push(makeResult(categories.fireSupport, "비상콘센트설비", "",
    consoleReq ? "required" : "notRequired",
    consol11 ? (post2022 ? "지상 층수가 11층 이상입니다. (11층 이상의 층)" : "지하 포함 층수가 11층 이상입니다. (11층 이상의 층)")
      : (bf >= 3 && ba >= 1000) ? "지하 3층 이상이고 지하층 바닥면적 합계 1,000㎡ 이상입니다. (지하층 모든 층)"
      : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // 27. 무선통신보조설비 (용도무관: 지하 3000㎡, 지하 3층+1000㎡, 2012.9.14~ 30층)
  const radioReq = ba >= 3000 || (bf >= 3 && ba >= 1000) || (pd >= YD.D20120914 && ag >= 30);
  results.push(makeResult(categories.fireSupport, "무선통신보조설비", "",
    radioReq ? "required" : "notRequired",
    ba >= 3000 ? "지하층 바닥면적 합계 3,000㎡ 이상입니다. (지하층 모든 층)"
      : (bf >= 3 && ba >= 1000) ? "지하 3층 이상이고 지하층 바닥면적 합계 1,000㎡ 이상입니다. (지하층 모든 층)"
      : (pd >= YD.D20120914 && ag >= 30) ? "층수가 30층 이상입니다. (16층 이상의 모든 층, 2012.9.14~)"
      : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  return results;
}

// 공동주택 설치 제외·대체 안내
function yearBuildApartmentExceptionItems(results, inp) {
  const { pd } = inp;
  const items = [
    { category: "설치 제외", name: "시각경보기", status: "notRequired", reason: "공동주택은 시각경보기 의무 설치 대상 용도가 아닙니다." },
    { category: "설치 제외", name: "화재알림설비", status: "notRequired", reason: "화재알림설비는 전통시장 전용으로 공동주택은 대상이 아닙니다." },
    { category: "설치 제외", name: "휴대용비상조명등", status: "notRequired", reason: "공동주택은 휴대용비상조명등 의무 설치 대상이 아닙니다." },
    { category: "설치 제외", name: "가스누설경보기", status: "notRequired", reason: "공동주택은 가스누설경보기 단독 설치 대상이 아닙니다. (주방자동소화장치에 가스탐지 기능 포함)" },
    { category: "설치 제외", name: "누전경보기", status: "notRequired", reason: "내화구조 공동주택은 누전경보기 설치 조건(비내화구조)에 해당하지 않습니다." },
  ];
  if (inp.apartmentSubtype === "apt" && pd >= YD.D20111028) {
    items.push({ category: "설치 제외", name: "옥외소화전설비", status: "notRequired", reason: "아파트등은 2011.10.28부터 옥외소화전설비 설치 대상에서 제외됩니다." });
  }
  if (pd >= YD.D20221201) {
    items.push({ category: "설치 제외", name: "자동화재속보설비", status: "notRequired", reason: "공동주택은 2022.12.1부터 자동화재속보설비 설치 대상에서 제외됩니다." });
  }

  // 시설 간 면제 관계
  const sprinkler = results.find((r) => r.name === "스프링클러설비");
  const simpleSprinkler = results.find((r) => r.name === "간이스프링클러설비");
  const drencher = results.find((r) => r.name === "연결살수설비");
  const autoDetection = results.find((r) => r.name === "자동화재탐지설비");
  const emergencyAlarm = results.find((r) => r.name === "비상경보설비");
  if (sprinkler && sprinkler.status === "required" && simpleSprinkler && simpleSprinkler.status === "required") {
    items.push({ category: "설치 제외", name: "간이스프링클러설비", status: "review", reason: "스프링클러설비가 전층 설치 대상이면 간이스프링클러설비는 제외 대상으로 봅니다." });
  }
  if (sprinkler && sprinkler.status === "required" && drencher && drencher.status === "required") {
    items.push({ category: "설치 제외", name: "연결살수설비", status: "review", reason: "스프링클러설비가 설치 대상이면 연결살수설비는 설치 제외 대상으로 봅니다." });
  }
  if (autoDetection && autoDetection.status === "required" && emergencyAlarm && emergencyAlarm.status === "required") {
    items.push({ category: "설치 제외", name: "비상경보설비", status: "review", reason: "자동화재탐지설비가 설치되면 비상경보설비는 면제 관계로 검토할 수 있습니다." });
  }
  return items;
}

function yearEvaluateReligious(inp) {
  const results = [];
  const { pd } = inp;
  const ag = inp.aboveGroundFloors;
  const bf = inp.basementFloors;
  const ba = inp.basementAreaSum;
  const ta = inp.totalArea;
  const tf = inp.totalFloors;
  const wl = inp.windowlessArea;
  const bsmtAvg = bf > 0 ? ba / bf : 0;

  const hasBasement150 = bf > 0 && bsmtAvg >= 150;
  const hasBasement450 = bf > 0 && bsmtAvg >= 450;
  const hasBasement600 = bf > 0 && bsmtAvg >= 600;
  const hasWindowless150 = inp.hasWindowlessFloor && wl >= 150;
  const hasWindowless450 = inp.hasWindowlessFloor && wl >= 450;
  const hasWindowless600 = inp.hasWindowlessFloor && wl >= 600;

  // ── 소화기구 ──
  results.push(makeResult(categories.extinguishing, "소화기구", "",
    ta >= 33 ? "required" : "notRequired",
    ta >= 33 ? "연면적이 33㎡ 이상입니다." : "연면적이 33㎡ 미만입니다.", ""));

  // ── 옥내소화전설비 (종교시설: 연면적 3,000㎡ 이상 또는 층 바닥면적 600㎡ 이상) ──
  const indoorHydrantReq = ta >= 3000 || hasBasement600 || hasWindowless600 || inp.religiousHasLargeTargetFloor;
  results.push(makeResult(categories.extinguishing, "옥내소화전설비", "",
    indoorHydrantReq ? "required" : "notRequired",
    ta >= 3000 ? "연면적이 3,000㎡ 이상입니다." :
    hasBasement600 ? "지하층 평균 바닥면적이 600㎡ 이상입니다." :
    hasWindowless600 ? "무창층 바닥면적이 600㎡ 이상입니다." :
    inp.religiousHasLargeTargetFloor ? "4층 이상 층 중 바닥면적 600㎡ 이상인 층이 있습니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 스프링클러설비 ──
  let sprinklerReq = false;
  let sprinklerReason = "";
  if (!inp.religiousOccupancy100Plus) {
    sprinklerReason = "수용인원이 100명 미만이어서 설치 대상이 아닙니다.";
  } else if (pd >= YD.D20170128) {
    if (inp.religiousIsWoodStructure) {
      sprinklerReason = "주요구조부가 목조인 종교시설로 스프링클러설비 설치 대상에서 제외됩니다. (2017년 1월 28일 이후 기준)";
    } else {
      sprinklerReq = true;
      sprinklerReason = "수용인원이 100명 이상이고 주요구조부가 목조가 아닌 종교시설로 전층 설치 대상입니다.";
    }
  } else {
    if (inp.religiousIsSacrificialBuilding) {
      sprinklerReason = "사찰·제실·사당에 해당하여 이 허가 시기에는 스프링클러설비 설치 대상에서 제외됩니다.";
    } else {
      sprinklerReq = true;
      sprinklerReason = "수용인원이 100명 이상인 종교시설로 전층 설치 대상입니다.";
    }
  }
  results.push(makeResult(categories.extinguishing, "스프링클러설비", "",
    sprinklerReq ? "required" : "notRequired", sprinklerReason, ""));

  // ── 물분무등소화설비 ──
  const waterSprayReq = inp.religiousIndoorParkingArea >= 200 || inp.religiousMechanicalParkingCapacity >= 20 || inp.religiousElectricalRoomArea >= 300;
  results.push(makeResult(categories.extinguishing, "물분무등소화설비", "",
    waterSprayReq ? "required" : "notRequired",
    buildWaterSprayReason(0, inp.religiousIndoorParkingArea, inp.religiousMechanicalParkingCapacity, inp.religiousElectricalRoomArea), ""));

  // ── 옥외소화전설비 ──
  results.push(makeResult(categories.extinguishing, "옥외소화전설비", "",
    inp.religiousFirstSecondFloorArea >= 9000 ? "required" : "notRequired",
    inp.religiousFirstSecondFloorArea >= 9000 ? "지상 1층과 2층의 바닥면적 합계가 9,000㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 비상경보설비 ──
  const emergAlarmReq = ta >= 400 || hasBasement150 || hasWindowless150;
  results.push(makeResult(categories.alarm, "비상경보설비", "",
    emergAlarmReq ? "required" : "notRequired",
    ta >= 400 ? "연면적이 400㎡ 이상입니다." :
    hasBasement150 ? "지하층 바닥면적이 150㎡ 이상입니다." :
    hasWindowless150 ? "무창층 바닥면적이 150㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 자동화재탐지설비 (종교시설: 연면적 1,000㎡ 이상, 20년간 동일) ──
  const autoDetReq = ta >= 1000;
  results.push(makeResult(categories.alarm, "자동화재탐지설비", "",
    autoDetReq ? "required" : "notRequired",
    autoDetReq ? "연면적이 1,000㎡ 이상인 종교시설입니다." :
    "연면적이 1,000㎡ 미만이어서 설치 대상이 아닙니다.", ""));

  // ── 시각경보기 (2011년 7월 7일 이후 종교시설 편입) ──
  let visualAlarmReq = false;
  let visualAlarmReason = "";
  if (pd >= YD.D20110707) {
    visualAlarmReq = autoDetReq;
    visualAlarmReason = autoDetReq
      ? "자동화재탐지설비 설치 대상 종교시설에 함께 설치해야 합니다."
      : "자동화재탐지설비 설치 대상이 아닙니다.";
  } else {
    visualAlarmReason = "2011년 7월 7일 이전에는 종교시설은 시각경보기 설치 대상이 아니었습니다.";
  }
  results.push(makeResult(categories.alarm, "시각경보기", "",
    visualAlarmReq ? "required" : "notRequired", visualAlarmReason, ""));

  // ── 비상방송설비 (20년간 동일) ──
  const broadcastReq = ta >= 3500 || ag >= 11 || bf >= 3;
  results.push(makeResult(categories.alarm, "비상방송설비", "",
    broadcastReq ? "required" : "notRequired",
    ta >= 3500 ? "연면적이 3,500㎡ 이상입니다." :
    ag >= 11 ? "지상층수가 11층 이상입니다." :
    bf >= 3 ? "지하층수가 3층 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 자동화재속보설비 (종교시설 해당 없음) ──
  results.push(makeResult(categories.alarm, "자동화재속보설비", "", "notRequired",
    "종교시설은 자동화재속보설비 설치 대상이 아닙니다.", ""));

  // ── 가스누설경보기 (2011년 7월 7일 이후 종교시설 편입) ──
  let gasAlarmReq = false;
  let gasAlarmReason = "";
  if (pd >= YD.D20110707) {
    gasAlarmReq = inp.religiousHasGasFacility;
    gasAlarmReason = inp.religiousHasGasFacility
      ? "가스시설이 설치된 종교시설입니다."
      : "가스시설이 없어 설치 대상이 아닙니다.";
  } else {
    gasAlarmReason = "2011년 7월 7일 이전에는 종교시설은 가스누설경보기 설치 대상이 아니었습니다.";
  }
  results.push(makeResult(categories.alarm, "가스누설경보기", "",
    gasAlarmReq ? "required" : "notRequired", gasAlarmReason, ""));

  // ── 피난기구 (3층 이상 10층 이하) ──
  results.push(makeResult(categories.evacuation, "피난기구(구조대·완강기 등)", "",
    ag >= 3 ? "required" : "notRequired",
    ag >= 3 ? "3층 이상 10층 이하 층에 피난기구를 설치해야 합니다." :
    "3층 이상 층이 없어 설치 대상이 아닙니다.", ""));

  // ── 유도등 ──
  results.push(makeResult(categories.evacuation, "유도등(피난구유도등·통로유도등)", "", "required",
    "모든 종교시설에 피난구유도등, 통로유도등, 유도표지를 설치해야 합니다.", ""));

  // ── 비상조명등 ──
  const emLightReq = (tf >= 5 && ta >= 3000) || hasBasement450 || hasWindowless450;
  results.push(makeResult(categories.evacuation, "비상조명등", "",
    emLightReq ? "required" : "notRequired",
    tf >= 5 && ta >= 3000 ? "전체 층수가 5층 이상이고 연면적이 3,000㎡ 이상입니다." :
    hasBasement450 ? "지하층 바닥면적이 450㎡ 이상입니다." :
    hasWindowless450 ? "무창층 바닥면적이 450㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 소화용수설비 ──
  results.push(makeResult(categories.waterSupply, "상수도소화용수설비", "",
    ta >= 5000 ? "required" : "notRequired",
    ta >= 5000 ? "연면적이 5,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 제연설비 ──
  let smokeReq = false;
  let smokeReason = "";
  if (ag >= 11) {
    smokeReq = true;
    smokeReason = "지상 11층 이상으로 특별피난계단에 제연설비를 설치해야 합니다.";
  } else if (pd >= YD.D20110707) {
    const stageArea = inp.religiousHasStage ? inp.religiousStageArea : 0;
    smokeReq = stageArea >= 200;
    smokeReason = smokeReq
      ? `무대부 바닥면적이 ${stageArea}㎡로 200㎡ 이상입니다. 해당 무대부에 제연설비를 설치해야 합니다.`
      : inp.religiousHasStage
      ? `무대부 바닥면적이 ${stageArea}㎡로 200㎡ 미만이어서 설치 대상이 아닙니다.`
      : "무대부가 없어 설치 대상이 아닙니다.";
  } else {
    smokeReason = "2011년 7월 7일 이전에는 종교시설은 제연설비 설치 대상이 아니었습니다.";
  }
  results.push(makeResult(categories.fireSupport, "제연설비", "",
    smokeReq ? "required" : "notRequired", smokeReason, ""));

  // ── 연결송수관설비 ──
  const standpipeReq = (tf >= 5 && ta >= 6000) || tf >= 7 || (bf >= 3 && ba >= 1000);
  results.push(makeResult(categories.fireSupport, "연결송수관설비", "",
    standpipeReq ? "required" : "notRequired",
    tf >= 5 && ta >= 6000 ? "전체 층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다." :
    tf >= 7 ? "전체 층수가 7층 이상입니다." :
    bf >= 3 && ba >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 연결살수설비 ──
  results.push(makeResult(categories.fireSupport, "연결살수설비", "",
    ba >= 150 ? "required" : "notRequired",
    ba >= 150 ? "지하층 바닥면적 합계가 150㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 비상콘센트설비 ──
  const emConsentReq = ag >= 11 || (bf >= 3 && ba >= 1000);
  results.push(makeResult(categories.fireSupport, "비상콘센트설비", "",
    emConsentReq ? "required" : "notRequired",
    ag >= 11 ? "지상층수가 11층 이상입니다." :
    bf >= 3 && ba >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 무선통신보조설비 ──
  const radioBase = ba >= 3000 || (bf >= 3 && ba >= 1000);
  const radioHigh = pd >= YD.D20111123 && ag >= 30;
  results.push(makeResult(categories.fireSupport, "무선통신보조설비", "",
    radioBase || radioHigh ? "required" : "notRequired",
    ba >= 3000 ? "지하층 바닥면적 합계가 3,000㎡ 이상입니다." :
    bf >= 3 && ba >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
    radioHigh ? "지상층수가 30층 이상으로 16층 이상 부분에 설치 대상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  return results;
}

function yearEvaluateSales(inp) {
  const results = [];
  const { pd } = inp;
  const ag = inp.aboveGroundFloors;
  const bf = inp.basementFloors;
  const ba = inp.basementAreaSum;
  const ta = inp.totalArea;
  const tf = inp.totalFloors;
  const wl = inp.windowlessArea;
  const sa = inp.salesArea;
  const bsmtAvg = bf > 0 ? ba / bf : 0;

  const hasBasement150 = bf > 0 && bsmtAvg >= 150;
  const hasBasement300 = bf > 0 && bsmtAvg >= 300;
  const hasBasement450 = bf > 0 && bsmtAvg >= 450;
  const hasWindowless150 = inp.hasWindowlessFloor && wl >= 150;
  const hasWindowless300 = inp.hasWindowlessFloor && wl >= 300;
  const hasWindowless450 = inp.hasWindowlessFloor && wl >= 450;

  // ── 소화기구 ──
  results.push(makeResult(categories.extinguishing, "소화기구", "",
    ta >= 33 ? "required" : "notRequired",
    ta >= 33 ? "연면적이 33㎡ 이상입니다." : "연면적이 33㎡ 미만입니다.", ""));

  const smallUndergroundParking = pd >= YD.D20251201 && inp.salesUndergroundParkingArea > 0 && inp.salesUndergroundParkingArea < 200;
  const largeUndergroundParking = pd >= YD.D20251201 && inp.salesUndergroundParkingArea >= 200;

  // ── 상업용 주방자동소화장치 (2023년 12월 1일 시행: 대규모점포 입점 일반음식점 주방) ──
  let kitchenReq = false;
  let kitchenReason = "";
  if (pd < YD.D20231201) {
    kitchenReason = "2023년 12월 1일 이전에는 판매시설 특화 상업용 주방자동소화장치 의무 규정이 없었습니다.";
  } else if (inp.salesIsLargeStore && inp.salesHasRestaurantKitchen) {
    kitchenReq = true;
    kitchenReason = "대규모점포에 입점한 일반음식점의 주방에는 상업용 주방자동소화장치를 설치해야 합니다.";
  } else {
    kitchenReason = "대규모점포 입점 일반음식점 주방에 해당하지 않아 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.extinguishing, "상업용 주방자동소화장치", "",
    kitchenReq ? "required" : "notRequired", kitchenReason, ""));

  // ── 옥내소화전설비 (판매시설: 연면적 1,500㎡ 이상 또는 지하·무창·4층 이상 층 300㎡ 이상) ──
  const indoorHydrantReq = ta >= 1500 || hasBasement300 || hasWindowless300 || inp.salesHasLargeTargetFloor;
  results.push(makeResult(categories.extinguishing, "옥내소화전설비", "",
    indoorHydrantReq ? "required" : "notRequired",
    ta >= 1500 ? "연면적이 1,500㎡ 이상인 판매시설입니다." :
    hasBasement300 ? "지하층 평균 바닥면적이 300㎡ 이상입니다." :
    hasWindowless300 ? "무창층 바닥면적이 300㎡ 이상입니다." :
    inp.salesHasLargeTargetFloor ? "지하층·무창층·4층 이상 층 중 바닥면적 300㎡ 이상인 층이 있습니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 단독경보형 감지기 (2025.12.1 소규모 지하 차고·주차장 공통 기준 신설) ──
  results.push(makeResult(categories.alarm, "단독경보형 감지기", "",
    smallUndergroundParking ? "required" : "notRequired",
    smallUndergroundParking ? "2025년 12월 1일 이후 지하 차고·주차장 면적 합계가 200㎡ 미만인 경우 해당 주차장 부분에 설치해야 합니다." :
    pd < YD.D20251201 ? "2025년 12월 1일 이전에는 판매시설에 적용되는 단독경보형 감지기 의무 기준이 없습니다." :
    "지하 차고·주차장 면적 합계가 200㎡ 미만인 경우에 해당하지 않습니다.", ""));

  // ── 스프링클러설비 (2014.7.8 면적 잣대 통합) ──
  let sprinklerReq = false;
  let sprinklerReason = "";
  if (pd >= YD.D20140708) {
    sprinklerReq = sa >= 5000 || inp.salesOccupancy500Plus;
    sprinklerReason = sa >= 5000 ? "판매시설 바닥면적 합계가 5,000㎡ 이상입니다. (전층)" :
      inp.salesOccupancy500Plus ? "수용인원이 500명 이상입니다. (전층)" :
      "바닥면적 합계 5,000㎡ 미만이고 수용인원 500명 미만이어서 설치 대상이 아닙니다.";
  } else {
    const threshold = ag <= 3 ? 6000 : 5000;
    sprinklerReq = sa >= threshold || inp.salesOccupancy500Plus;
    sprinklerReason = sa >= threshold ? `${ag <= 3 ? "3층 이하 건축물로 바닥면적 합계 6,000㎡" : "4층 이상 건축물로 바닥면적 합계 5,000㎡"} 이상입니다. (전층)` :
      inp.salesOccupancy500Plus ? "수용인원이 500명 이상입니다. (전층)" :
      `${ag <= 3 ? "바닥면적 합계 6,000㎡" : "바닥면적 합계 5,000㎡"} 미만이고 수용인원 500명 미만이어서 설치 대상이 아닙니다.`;
  }
  results.push(makeResult(categories.extinguishing, "스프링클러설비", "",
    sprinklerReq ? "required" : "notRequired", sprinklerReason, ""));

  // ── 물분무등소화설비 ──
  const salesParkingAreaForWaterSpray = Math.max(inp.salesIndoorParkingArea, inp.salesUndergroundParkingArea || 0);
  const waterSprayReq = salesParkingAreaForWaterSpray >= 200 || inp.salesMechanicalParkingCapacity >= 20 || inp.salesElectricalRoomArea >= 300;
  results.push(makeResult(categories.extinguishing, "물분무등소화설비", "",
    waterSprayReq ? "required" : "notRequired",
    buildWaterSprayReason(0, salesParkingAreaForWaterSpray, inp.salesMechanicalParkingCapacity, inp.salesElectricalRoomArea), ""));

  // ── 옥외소화전설비 ──
  results.push(makeResult(categories.extinguishing, "옥외소화전설비", "",
    inp.salesFirstSecondFloorArea >= 9000 ? "required" : "notRequired",
    inp.salesFirstSecondFloorArea >= 9000 ? "지상 1층과 2층의 바닥면적 합계가 9,000㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 비상경보설비 ──
  const emergAlarmReq = ta >= 400 || hasBasement150 || hasWindowless150 || smallUndergroundParking;
  results.push(makeResult(categories.alarm, "비상경보설비", "",
    emergAlarmReq ? "required" : "notRequired",
    ta >= 400 ? "연면적이 400㎡ 이상입니다." :
    hasBasement150 ? "지하층 바닥면적이 150㎡ 이상입니다." :
    hasWindowless150 ? "무창층 바닥면적이 150㎡ 이상입니다." :
    smallUndergroundParking ? "2025년 12월 1일 이후 지하 차고·주차장 면적 합계가 200㎡ 미만인 경우 건물의 모든 층에 설치해야 합니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 자동화재탐지설비 (판매시설 1,000㎡ + 전통시장(2019.8.6~) + 6층 이상(2022.12.1~) + 지하 주차장 200㎡ 이상(2025.12.1~)) ──
  const autoDetByMarket = pd >= YD.D20190806 && inp.salesIsTraditionalMarket;
  const autoDetBy6F = pd >= YD.D20221201 && ag >= 6;
  const autoDetReq = ta >= 1000 || autoDetByMarket || autoDetBy6F || largeUndergroundParking;
  results.push(makeResult(categories.alarm, "자동화재탐지설비", "",
    autoDetReq ? "required" : "notRequired",
    ta >= 1000 ? "연면적이 1,000㎡ 이상인 판매시설입니다." :
    autoDetByMarket ? "전통시장은 면적과 무관하게 설치 대상입니다." :
    autoDetBy6F ? "2022년 12월 1일 이후 층수가 6층 이상인 건축물입니다." :
    largeUndergroundParking ? "2025년 12월 1일 이후 지하 차고·주차장 면적 합계가 200㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 시각경보기 (자동화재탐지설비 대상 판매시설에 함께 설치) ──
  results.push(makeResult(categories.alarm, "시각경보기", "",
    autoDetReq ? "required" : "notRequired",
    autoDetReq ? "자동화재탐지설비 설치 대상 판매시설에 함께 설치해야 합니다." :
    "자동화재탐지설비 설치 대상이 아닙니다.", ""));

  // ── 화재알림설비 (2022년 12월 1일 신설: 판매시설 중 전통시장) ──
  let fireNotifyReq = false;
  let fireNotifyReason = "";
  if (pd < YD.D20221201) {
    fireNotifyReason = "2022년 12월 1일 이전에는 화재알림설비 의무 규정이 없었습니다.";
  } else if (inp.salesIsTraditionalMarket) {
    fireNotifyReq = true;
    fireNotifyReason = "전통시장은 화재알림설비를 설치해야 합니다.";
  } else {
    fireNotifyReason = "전통시장이 아니어서 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.alarm, "화재알림설비", "",
    fireNotifyReq ? "required" : "notRequired", fireNotifyReason, ""));

  // ── 비상방송설비 (2022.12.1 '지하층 제외' 삭제) ──
  const broadcastFloorCond = pd >= YD.D20221201 ? tf >= 11 : ag >= 11;
  const broadcastReq = ta >= 3500 || broadcastFloorCond || bf >= 3;
  results.push(makeResult(categories.alarm, "비상방송설비", "",
    broadcastReq ? "required" : "notRequired",
    ta >= 3500 ? "연면적이 3,500㎡ 이상입니다." :
    broadcastFloorCond ? (pd >= YD.D20221201 ? "지하층을 포함한 층수가 11층 이상입니다." : "지상층수가 11층 이상입니다.") :
    bf >= 3 ? "지하층수가 3층 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 자동화재속보설비 (30층 이상 공통 기준: 2015.7.1~2022.11.30, 전통시장: 2017.1.28~) ──
  let autoNotifyReq = false;
  let autoNotifyReason = "";
  const notifyByMarket = pd >= YD.D20170128 && inp.salesIsTraditionalMarket;
  const notifyByHighRise = pd >= YD.D20150701 && pd < YD.D20221201 && ag >= 30;
  if (notifyByMarket) {
    if (pd >= YD.D20221201 && inp.salesHas24HourStaff) {
      autoNotifyReq = false;
      autoNotifyReason = "전통시장이지만 24시간 화재 감시 근무자가 있어 자동화재속보설비를 설치하지 않을 수 있습니다.";
    } else {
      autoNotifyReq = true;
      autoNotifyReason = "전통시장은 자동화재속보설비를 설치해야 합니다.";
    }
  } else if (notifyByHighRise) {
    autoNotifyReq = true;
    autoNotifyReason = "2015년 7월 1일부터 2022년 11월 30일까지는 층수가 30층 이상인 특정소방대상물에 설치해야 합니다.";
  } else {
    autoNotifyReason = pd < YD.D20170128
      ? "현재 입력 기준으로는 설치 대상이 아닙니다."
      : "전통시장이 아니어서 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.alarm, "자동화재속보설비", "",
    autoNotifyReq ? "required" : "notRequired", autoNotifyReason, ""));

  // ── 가스누설경보기 ──
  results.push(makeResult(categories.alarm, "가스누설경보기", "",
    inp.salesHasGasFacility ? "required" : "notRequired",
    inp.salesHasGasFacility ? "가스시설이 설치된 판매시설입니다." :
    "가스시설이 없어 설치 대상이 아닙니다.", ""));

  // ── 피난기구 (3층 이상 10층 이하) ──
  results.push(makeResult(categories.evacuation, "피난기구(구조대·완강기 등)", "",
    ag >= 3 ? "required" : "notRequired",
    ag >= 3 ? "3층 이상 10층 이하 층에 피난기구를 설치해야 합니다." :
    "3층 이상 층이 없어 설치 대상이 아닙니다.", ""));

  // ── 인명구조기구(공기호흡기) (대규모점포: 수용인원 100명 이상 기준 유지) ──
  let airReq = false;
  let airReason = "";
  if (!inp.salesIsLargeStore) {
    airReason = "대규모점포가 아니어서 공기호흡기 설치 대상이 아닙니다.";
  } else if (inp.salesOccupancy100Plus) {
    airReq = true;
    airReason = "수용인원 100명 이상인 대규모점포로 공기호흡기를 비치해야 합니다.";
  } else {
    airReason = "수용인원이 100명 미만이어서 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.evacuation, "인명구조기구(공기호흡기)", "",
    airReq ? "required" : "notRequired", airReason, ""));

  // ── 유도등 ──
  results.push(makeResult(categories.evacuation, "유도등(피난구유도등·통로유도등)", "", "required",
    "모든 판매시설에 피난구유도등, 통로유도등, 유도표지를 설치해야 합니다.", ""));

  // ── 비상조명등 ──
  const emLightReq = (tf >= 5 && ta >= 3000) || hasBasement450 || hasWindowless450;
  results.push(makeResult(categories.evacuation, "비상조명등", "",
    emLightReq ? "required" : "notRequired",
    tf >= 5 && ta >= 3000 ? "전체 층수가 5층 이상이고 연면적이 3,000㎡ 이상입니다." :
    hasBasement450 ? "지하층 바닥면적이 450㎡ 이상입니다." :
    hasWindowless450 ? "무창층 바닥면적이 450㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 휴대용 비상조명등 (대규모점포: 수용인원 100명 이상 기준 유지) ──
  let portableReq = false;
  let portableReason = "";
  if (!inp.salesIsLargeStore) {
    portableReason = "대규모점포가 아니어서 휴대용 비상조명등 설치 대상이 아닙니다.";
  } else if (inp.salesOccupancy100Plus) {
    portableReq = true;
    portableReason = "수용인원 100명 이상인 대규모점포로 휴대용 비상조명등을 비치해야 합니다.";
  } else {
    portableReason = "수용인원이 100명 미만이어서 설치 대상이 아닙니다.";
  }
  results.push(makeResult(categories.evacuation, "휴대용비상조명등", "",
    portableReq ? "required" : "notRequired", portableReason, ""));

  // ── 소화용수설비 ──
  results.push(makeResult(categories.waterSupply, "상수도소화용수설비", "",
    ta >= 5000 ? "required" : "notRequired",
    ta >= 5000 ? "연면적이 5,000㎡ 이상입니다." : "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 제연설비 (판매시설: 지하층 또는 무창층 바닥면적 합계 1,000㎡ 이상) ──
  const smokeBasement1000 = ba >= 1000;
  const smokeWindowless1000 = inp.hasWindowlessFloor && wl >= 1000;
  const smokeReq = smokeBasement1000 || smokeWindowless1000;
  results.push(makeResult(categories.fireSupport, "제연설비", "",
    smokeReq ? "required" : "notRequired",
    smokeBasement1000 ? "지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
    smokeWindowless1000 ? "무창층 바닥면적이 1,000㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 연결송수관설비 ──
  const standpipeReq = (tf >= 5 && ta >= 6000) || tf >= 7 || (bf >= 3 && ba >= 1000);
  results.push(makeResult(categories.fireSupport, "연결송수관설비", "",
    standpipeReq ? "required" : "notRequired",
    tf >= 5 && ta >= 6000 ? "전체 층수가 5층 이상이고 연면적이 6,000㎡ 이상입니다." :
    tf >= 7 ? "전체 층수가 7층 이상입니다." :
    bf >= 3 && ba >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 연결살수설비 (판매시설: 해당 용도 1,000㎡ 또는 지하층 150㎡) ──
  const drencherReq = sa >= 1000 || ba >= 150 || smallUndergroundParking;
  results.push(makeResult(categories.fireSupport, "연결살수설비", "",
    drencherReq ? "required" : "notRequired",
    sa >= 1000 ? "판매시설 해당 용도 바닥면적 합계가 1,000㎡ 이상입니다." :
    ba >= 150 ? "지하층 바닥면적 합계가 150㎡ 이상입니다." :
    smallUndergroundParking ? "2025년 12월 1일 이후 지하 차고·주차장 면적 합계가 200㎡ 미만인 경우 해당 부분에 설치해야 합니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 비상콘센트설비 (2022.12.1 '지하층 포함' 삭제 → 지상층수 11층) ──
  const consentFloorCond = pd >= YD.D20221201 ? ag >= 11 : tf >= 11;
  const emConsentReq = consentFloorCond || (bf >= 3 && ba >= 1000);
  results.push(makeResult(categories.fireSupport, "비상콘센트설비", "",
    emConsentReq ? "required" : "notRequired",
    consentFloorCond ? (pd >= YD.D20221201 ? "지상층수가 11층 이상입니다." : "지하층을 포함한 층수가 11층 이상입니다.") :
    bf >= 3 && ba >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  // ── 무선통신보조설비 ──
  const radioBase = ba >= 3000 || (bf >= 3 && ba >= 1000);
  const radioHigh = pd >= YD.D20120914 && ag >= 30;
  results.push(makeResult(categories.fireSupport, "무선통신보조설비", "",
    radioBase || radioHigh ? "required" : "notRequired",
    ba >= 3000 ? "지하층 바닥면적 합계가 3,000㎡ 이상입니다." :
    bf >= 3 && ba >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
    radioHigh ? "지상층수가 30층 이상으로 16층 이상 부분에 설치 대상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  return results;
}

// ── 연도별 탐색기: 제외·대체 항목 계산 ──

function yearBuildLodgingExceptionItems(results, inp) {
  const exceptionItems = [];
  const autoDetection = results.find((r) => r.name === "자동화재탐지설비");
  const emergencyAlarm = results.find((r) => r.name === "비상경보설비");
  const singleDetector = results.find((r) => r.name === "단독경보형 감지기");
  const sprinkler = results.find((r) => r.name === "스프링클러설비");
  const simpleSprinkler = results.find((r) => r.name === "간이스프링클러설비");
  const drencher = results.find((r) => r.name === "연결살수설비");
  const waterSpray = results.find((r) => r.name === "물분무등소화설비");
  const emLight = results.find((r) => r.name === "비상조명등");
  const portableLight = results.find((r) => r.name === "휴대용비상조명등");
  const parkingCondition = inp.lodgingIndoorParkingArea >= 200 || inp.lodgingMechanicalParkingCapacity >= 20;

  if (sprinkler && sprinkler.status === "required" && simpleSprinkler && simpleSprinkler.status === "notRequired") {
    exceptionItems.push({ category: "설치 제외", name: "간이스프링클러설비", status: "review", reason: "스프링클러설비가 전층 설치 대상이므로 간이스프링클러설비는 제외됩니다." });
  }
  if (sprinkler && sprinkler.status === "required" && drencher && drencher.status === "required") {
    exceptionItems.push({ category: "설치 제외", name: "연결살수설비", status: "review", reason: "스프링클러설비가 설치 대상이면 연결살수설비는 설치 제외 대상입니다." });
  }
  if (autoDetection && autoDetection.status === "required" && emergencyAlarm && emergencyAlarm.status === "required") {
    exceptionItems.push({ category: "설치 제외", name: "비상경보설비", status: "review", reason: "자동화재탐지설비가 설치되면 비상경보설비는 면제 관계로 검토할 수 있습니다." });
  }
  if (autoDetection && autoDetection.status === "required" && singleDetector && singleDetector.status === "required") {
    exceptionItems.push({ category: "설치 제외", name: "단독경보형 감지기", status: "review", reason: "자동화재탐지설비가 설치되면 단독경보형 감지기는 중복 설치가 불필요합니다." });
  }
  if (inp.pd >= YD.D20040604 && emLight && emLight.status === "required" && portableLight && portableLight.status === "required") {
    exceptionItems.push({ category: "설치 제외", name: "휴대용비상조명등", status: "review", reason: "숙박시설 복도에 비상조명등이 설치되면 객실에 설치하는 휴대용비상조명등의 설치는 제외될 수 있습니다." });
  }
  if (waterSpray && waterSpray.status === "required" && parkingCondition) {
    exceptionItems.push({ category: "대체설비", name: "주차장 관련 스프링클러설비 대체 가능", status: "review", reason: "주차 관련 공간은 물분무등소화설비 기준이 적용되나, 대체설비로 스프링클러설비를 설치할 수 있습니다." });
  }
  if (!exceptionItems.length) {
    exceptionItems.push({ category: "안내", name: "설치 제외·대체 없음", status: "notRequired", reason: "현재 입력값 기준으로 별도 면제 또는 대체로 표시할 항목이 없습니다." });
  }
  return exceptionItems;
}

function yearBuildElderlyExceptionItems(results, inp) {
  const exceptionItems = [];
  const autoDetection = results.find((r) => r.name === "자동화재탐지설비");
  const emergencyAlarm = results.find((r) => r.name === "비상경보설비");
  const singleDetector = results.find((r) => r.name === "단독경보형 감지기");
  const sprinkler = results.find((r) => r.name === "스프링클러설비");
  const simpleSprinkler = results.find((r) => r.name === "간이스프링클러설비");
  const drencher = results.find((r) => r.name === "연결살수설비");
  const waterSpray = results.find((r) => r.name === "물분무등소화설비");
  const parkingCondition = inp.elderlyIndoorParkingArea >= 200 || inp.elderlyMechanicalParkingCapacity >= 20;

  if (sprinkler && sprinkler.status === "required" && simpleSprinkler && simpleSprinkler.status === "notRequired") {
    exceptionItems.push({ category: "설치 제외", name: "간이스프링클러설비", status: "review", reason: "스프링클러설비가 전층 설치 대상이므로 간이스프링클러설비는 제외됩니다." });
  }
  if (sprinkler && sprinkler.status === "required" && drencher && drencher.status === "required") {
    exceptionItems.push({ category: "설치 제외", name: "연결살수설비", status: "review", reason: "스프링클러설비가 설치 대상이면 연결살수설비는 설치 제외 대상입니다." });
  }
  if (autoDetection && autoDetection.status === "required" && emergencyAlarm && emergencyAlarm.status === "required") {
    exceptionItems.push({ category: "설치 제외", name: "비상경보설비", status: "review", reason: "자동화재탐지설비가 설치되면 비상경보설비는 면제 관계로 검토할 수 있습니다." });
  }
  if (autoDetection && autoDetection.status === "required" && singleDetector && singleDetector.status === "required") {
    exceptionItems.push({ category: "설치 제외", name: "단독경보형 감지기", status: "review", reason: "자동화재탐지설비가 설치되면 단독경보형 감지기는 중복 설치가 불필요합니다." });
  }
  if (waterSpray && waterSpray.status === "required" && parkingCondition) {
    exceptionItems.push({ category: "대체설비", name: "주차장 관련 스프링클러설비 대체 가능", status: "review", reason: "주차 관련 공간은 물분무등소화설비 기준이 적용되나, 대체설비로 스프링클러설비를 설치할 수 있습니다." });
  }
  if (!exceptionItems.length) {
    exceptionItems.push({ category: "안내", name: "설치 제외·대체 없음", status: "notRequired", reason: "현재 입력값 기준으로 별도 면제 또는 대체로 표시할 항목이 없습니다." });
  }
  return exceptionItems;
}

function yearBuildMedicalExceptionItems(results, inp) {
  const exceptionItems = [];
  const autoDetection = results.find((r) => r.name === "자동화재탐지설비");
  const emergencyAlarm = results.find((r) => r.name === "비상경보설비");
  const singleDetector = results.find((r) => r.name === "단독경보형 감지기");
  const sprinkler = results.find((r) => r.name === "스프링클러설비");
  const simpleSprinkler = results.find((r) => r.name === "간이스프링클러설비");
  const drencher = results.find((r) => r.name === "연결살수설비");
  const waterSpray = results.find((r) => r.name === "물분무등소화설비");
  const parkingCondition = inp.medicalIndoorParkingArea >= 200 || inp.medicalMechanicalParkingCapacity >= 20;

  // 간이스프링클러는 2012년 2월 15일 이후 허가 건물에서만 설치 대상이므로,
  // 그 이전 허가 건물은 애초에 설치 대상이 아니라 제외 항목 표시 대상이 아님
  if (sprinkler && sprinkler.status === "required" && simpleSprinkler && simpleSprinkler.status === "notRequired" && inp.pd >= YD.D20120215) {
    exceptionItems.push({ category: "설치 제외", name: "간이스프링클러설비", status: "review", reason: "스프링클러설비가 전층 설치 대상이므로 간이스프링클러설비는 제외됩니다." });
  }
  if (sprinkler && sprinkler.status === "required" && drencher && drencher.status === "required") {
    exceptionItems.push({ category: "설치 제외", name: "연결살수설비", status: "review", reason: "스프링클러설비가 설치 대상이면 연결살수설비는 설치 제외 대상입니다." });
  }
  if (autoDetection && autoDetection.status === "required" && emergencyAlarm && emergencyAlarm.status === "required") {
    exceptionItems.push({ category: "설치 제외", name: "비상경보설비", status: "review", reason: "자동화재탐지설비가 설치되면 비상경보설비는 면제 관계로 검토할 수 있습니다." });
  }
  if (autoDetection && autoDetection.status === "required" && singleDetector && singleDetector.status === "required") {
    exceptionItems.push({ category: "설치 제외", name: "단독경보형 감지기", status: "review", reason: "자동화재탐지설비가 설치되면 단독경보형 감지기는 중복 설치가 불필요합니다." });
  }
  if (waterSpray && waterSpray.status === "required" && parkingCondition) {
    exceptionItems.push({ category: "대체설비", name: "주차장 관련 스프링클러설비 대체 가능", status: "review", reason: "주차 관련 공간은 물분무등소화설비 기준이 적용되나, 대체설비로 스프링클러설비를 설치할 수 있습니다." });
  }
  if (!exceptionItems.length) {
    exceptionItems.push({ category: "안내", name: "설치 제외·대체 없음", status: "notRequired", reason: "현재 입력값 기준으로 별도 면제 또는 대체로 표시할 항목이 없습니다." });
  }
  return exceptionItems;
}

function yearBuildReligiousExceptionItems(results, inp) {
  const exceptionItems = [];
  const autoDetection = results.find((r) => r.name === "자동화재탐지설비");
  const emergencyAlarm = results.find((r) => r.name === "비상경보설비");
  const sprinkler = results.find((r) => r.name === "스프링클러설비");
  const drencher = results.find((r) => r.name === "연결살수설비");
  const waterSpray = results.find((r) => r.name === "물분무등소화설비");
  const parkingCondition = inp.religiousIndoorParkingArea >= 200 || inp.religiousMechanicalParkingCapacity >= 20;

  if (sprinkler && sprinkler.status === "required" && drencher && drencher.status === "required") {
    exceptionItems.push({ category: "설치 제외", name: "연결살수설비", status: "review", reason: "스프링클러설비가 설치 대상이면 연결살수설비는 설치 제외 대상으로 봅니다." });
  }
  if (autoDetection && autoDetection.status === "required" && emergencyAlarm && emergencyAlarm.status === "required") {
    exceptionItems.push({ category: "설치 제외", name: "비상경보설비", status: "review", reason: "자동화재탐지설비가 설치되면 비상경보설비는 면제 관계로 검토할 수 있습니다." });
  }
  if (waterSpray && waterSpray.status === "required" && parkingCondition) {
    exceptionItems.push({ category: "대체설비", name: "주차장 관련 스프링클러설비 대체 가능", status: "review", reason: "주차 관련 공간의 기본 기준은 물분무등소화설비이며, 그 대체설비로 해당 주차 공간에 스프링클러설비를 설치할 수 있습니다." });
  }
  if (!exceptionItems.length) {
    exceptionItems.push({ category: "안내", name: "설치 제외·대체 없음", status: "notRequired", reason: "현재 입력값 기준으로 별도 면제 또는 대체로 표시할 항목이 없습니다." });
  }
  return exceptionItems;
}

function yearBuildSalesExceptionItems(results, inp) {
  const exceptionItems = [];
  const autoDetection = results.find((r) => r.name === "자동화재탐지설비");
  const emergencyAlarm = results.find((r) => r.name === "비상경보설비");
  const sprinkler = results.find((r) => r.name === "스프링클러설비");
  const drencher = results.find((r) => r.name === "연결살수설비");
  const waterSpray = results.find((r) => r.name === "물분무등소화설비");
  const parkingCondition = Math.max(inp.salesIndoorParkingArea, inp.salesUndergroundParkingArea || 0) >= 200 || inp.salesMechanicalParkingCapacity >= 20;

  if (sprinkler && sprinkler.status === "required" && drencher && drencher.status === "required") {
    exceptionItems.push({ category: "설치 제외", name: "연결살수설비", status: "review", reason: "스프링클러설비가 설치 대상이면 연결살수설비는 설치 제외 대상으로 봅니다." });
  }
  if (autoDetection && autoDetection.status === "required" && emergencyAlarm && emergencyAlarm.status === "required") {
    exceptionItems.push({ category: "설치 제외", name: "비상경보설비", status: "review", reason: "자동화재탐지설비가 설치되면 비상경보설비는 면제 관계로 검토할 수 있습니다." });
  }
  if (waterSpray && waterSpray.status === "required" && parkingCondition) {
    exceptionItems.push({ category: "대체설비", name: "주차장 관련 스프링클러설비 대체 가능", status: "review", reason: "주차 관련 공간의 기본 기준은 물분무등소화설비이며, 그 대체설비로 해당 주차 공간에 스프링클러설비를 설치할 수 있습니다." });
  }
  if (!exceptionItems.length) {
    exceptionItems.push({ category: "안내", name: "설치 제외·대체 없음", status: "notRequired", reason: "현재 입력값 기준으로 별도 면제 또는 대체로 표시할 항목이 없습니다." });
  }
  return exceptionItems;
}

function yearBuildNeighborhoodExceptionItems(results, inp) {
  const exceptionItems = [];
  const autoDetection = results.find((r) => r.name === "자동화재탐지설비");
  const emergencyAlarm = results.find((r) => r.name === "비상경보설비");
  const sprinkler = results.find((r) => r.name === "스프링클러설비");
  const simpleSprinkler = results.find((r) => r.name === "간이스프링클러설비");
  const drencher = results.find((r) => r.name === "연결살수설비");
  const waterSpray = results.find((r) => r.name === "물분무등소화설비");
  const parkingCondition = inp.indoorParkingArea >= 200 || inp.mechanicalParkingCapacity >= 20;

  if (sprinkler && sprinkler.status === "required" && simpleSprinkler && simpleSprinkler.status === "notRequired") {
    exceptionItems.push({ category: "설치 제외", name: "간이스프링클러설비", status: "review", reason: "스프링클러설비가 전층 설치 대상이면 간이스프링클러설비는 제외 대상으로 봅니다." });
  }
  if (sprinkler && sprinkler.status === "required" && drencher && drencher.status === "required") {
    exceptionItems.push({ category: "설치 제외", name: "연결살수설비", status: "review", reason: "스프링클러설비가 설치 대상이면 연결살수설비는 설치 제외 대상으로 봅니다." });
  }
  if (autoDetection && autoDetection.status === "required" && emergencyAlarm && emergencyAlarm.status === "required") {
    exceptionItems.push({ category: "설치 제외", name: "비상경보설비", status: "review", reason: "자동화재탐지설비가 설치되면 비상경보설비는 면제 관계로 검토할 수 있습니다." });
  }
  if (waterSpray && waterSpray.status === "required" && parkingCondition) {
    exceptionItems.push({ category: "대체설비", name: "주차장 관련 스프링클러설비 대체 가능", status: "review", reason: "주차 관련 공간의 기본 기준은 물분무등소화설비이며, 그 대체설비로 해당 공간에 스프링클러설비가 설치될 수 있습니다." });
  }
  if (!exceptionItems.length) {
    exceptionItems.push({ category: "안내", name: "설치 제외·대체 없음", status: "notRequired", reason: "현재 입력값 기준으로 별도 면제 또는 대체로 표시할 항목이 없습니다." });
  }
  return exceptionItems;
}

function yearShouldShowMultiuseSafetyButton(inp) {
  if (inp.eraChoice === "before2004" && inp.permitDateInt < YD.D19970927) return false;
  return (inp.occupancyType === "neighborhood" && inp.hasMultiuseBusiness) ||
    (inp.occupancyType === "lodging" && inp.lodgingHasMultiuseBusiness);
}

function yearUpdateMultiuseSafetyButton(inp) {
  const btn = document.getElementById("year-open-multiuse-safety");
  if (!btn) return;
  btn.classList.toggle("hidden", !yearShouldShowMultiuseSafetyButton(inp));
}

function insertAfterFirstItem(items, newItem) {
  const next = [...items];
  next.splice(Math.min(1, next.length), 0, newItem);
  return next;
}

function normalizeBefore2004MultiuseFacilities(input, multiuse, isLodging = false) {
  if (input.eraChoice !== "before2004") return multiuse;
  const underground150 = isLodging ? input.lodgingMultiuseInBasement : input.multiuseInBasement;
  const simpleItem = {
    category: categories.extinguishing,
    name: "간이스프링클러설비",
    status: "required",
    reason: "2001년 5월 21일부터 분법 이전까지 다중이용업소의 지하층 영업장 바닥면적이 150㎡ 이상이면 간이스프링클러설비 설치 대상입니다.",
  };
  const stripSimple = (items) => (items || []).filter((item) => item.name !== "간이스프링클러설비");
  let requiredItems = stripSimple(multiuse.requiredItems);
  let reasonItems = stripSimple(multiuse.reasonItems);
  if (input.permitDateInt >= YD.D20010521 && underground150) {
    requiredItems = insertAfterFirstItem(requiredItems, simpleItem);
    reasonItems = insertAfterFirstItem(reasonItems, simpleItem);
  }
  return { ...multiuse, requiredItems, reasonItems };
}

function yearEvaluateMultiuseFacilitiesForCurrentEra(inp) {
  if (inp.occupancyType === "lodging" && inp.lodgingHasMultiuseBusiness) {
    return normalizeBefore2004MultiuseFacilities(inp, evaluateLodgingMultiuseFacilities(inp), true);
  }
  return normalizeBefore2004MultiuseFacilities(inp, evaluateMultiuseFacilities(inp), false);
}

function yearShowResults() {
  if (!yearCurrentStepIsValid()) {
    showToast("현재 질문의 값을 먼저 입력해 주세요.");
    return;
  }
  // 면적 자동산정 모드면 분기 진입 전에 파생 답 채우기 (분법 이전/이후 공통)
  yearApplyAutoCalc();
  // 다중이용업소 버튼/카드 초기화
  const _ymBtn = document.getElementById("year-open-multiuse-safety");
  if (_ymBtn) _ymBtn.classList.add("hidden");
  document.getElementById("year-multiuse-safety-card").classList.add("hidden");
  // ── 분법 이전 근린생활시설 처리 ──
  if (yearState.answers.yEraChoice === "before2004" && yearState.answers.yOccupancyType === "neighborhood") {
    const pd = yPermitDateInt();
    if (pd < YD.D19811106 || pd >= YD.D20040530) {
      showToast("1981년 11월 6일 ~ 2004년 5월 29일 사이의 허가일을 입력해 주세요.");
      return;
    }
    const inp = yearNormalizeAnswers();
    const rawPermit = yearState.answers.yPermitDate;
    const [py, pm, pd2] = rawPermit.split("-").map(Number);
    const permitStr = `${py}년 ${pm}월 ${pd2}일`;
    const subtypeLabel = pd < YD.D19920728
      ? ({ restaurant: "음식점 등", marketBathhouse: "시장·공중목욕장", general: "기타 근린생활시설" }[inp.before2004FacilitySubtype] || "근린생활시설")
      : (inp.facilitySubtype === "bathhouse" ? "일반목욕장" : "근린생활시설");
    const results = yearEvaluateNeighborhoodBefore2004(inp);
    ensureEmergencyElevatorSmokeControl(results, inp, { allowRefugeElevator: true, requirePermitDateForRefugeElevator: true, usePermitBasedLodgingFlameproof: true });
    suppressBefore2004LowRiseEscapeItems(results, inp);
    const summaryHtml = `<div class="ib-title">입력값 기준</div>근린생활시설(${subtypeLabel}), 건축허가일 ${permitStr}, 연면적 ${inp.totalArea}㎡, 지상 ${inp.aboveGroundFloors}층, 지하 ${inp.basementFloors}층`;
    const exceptionItems = buildBefore2004ExceptionItems(results, pd);
    const allRequiredItems = results.filter((r) => r.status === "required" || r.status === "review");
    document.getElementById("year-result-summary").innerHTML = summaryHtml;
    renderSimpleRequiredList(allRequiredItems, "year-required-list");
    renderYearExtraItems(inp);
    renderResultGroup("year-criteria-list", results, [], allRequiredItems.map((i) => i.name));
    renderResultGroup("year-exception-list", exceptionItems);
    yearUpdateMultiuseSafetyButton(inp);
    showYearResultWithLoading();
    return;
  }
  // ── 분법 이전 숙박시설 처리 ──
  if (yearState.answers.yEraChoice === "before2004" && yearState.answers.yOccupancyType === "lodging") {
    const pd = yPermitDateInt();
    if (pd < YD.D19811106 || pd >= YD.D20040530) {
      showToast("1981년 11월 6일 ~ 2004년 5월 29일 사이의 허가일을 입력해 주세요.");
      return;
    }
    const inp = yearNormalizeAnswers();
    const rawPermit = yearState.answers.yPermitDate;
    const [py, pm, pd2] = rawPermit.split("-").map(Number);
    const permitStr = `${py}년 ${pm}월 ${pd2}일`;
    const results = yearEvaluateLodgingBefore2004(inp);
    ensureEmergencyElevatorSmokeControl(results, inp, { allowRefugeElevator: true, requirePermitDateForRefugeElevator: true, usePermitBasedLodgingFlameproof: true });
    suppressBefore2004LowRiseEscapeItems(results, inp);
    const summaryHtml = `<div class="ib-title">입력값 기준</div>숙박시설, 건축허가일 ${permitStr}, 연면적 ${inp.totalArea}㎡, 지상 ${inp.aboveGroundFloors}층, 지하 ${inp.basementFloors}층`;
    const exceptionItems = buildBefore2004ExceptionItems(results, pd);
    const allRequiredItems = results.filter((r) => r.status === "required" || r.status === "review");
    document.getElementById("year-result-summary").innerHTML = summaryHtml;
    renderSimpleRequiredList(allRequiredItems, "year-required-list");
    renderYearExtraItems(inp);
    renderResultGroup("year-criteria-list", results, [], allRequiredItems.map((i) => i.name));
    renderResultGroup("year-exception-list", exceptionItems);
    yearUpdateMultiuseSafetyButton(inp);
    showYearResultWithLoading();
    return;
  }
  // ── 분법 이전 노유자시설 처리 ──
  if (yearState.answers.yEraChoice === "before2004" && yearState.answers.yOccupancyType === "elderly") {
    const pd = yPermitDateInt();
    if (pd < YD.D19811106 || pd >= YD.D20040530) {
      showToast("1981년 11월 6일 ~ 2004년 5월 29일 사이의 허가일을 입력해 주세요.");
      return;
    }
    const inp = yearNormalizeAnswers();
    const rawPermit = yearState.answers.yPermitDate;
    const [py, pm, pd2] = rawPermit.split("-").map(Number);
    const permitStr = `${py}년 ${pm}월 ${pd2}일`;
    const results = yearEvaluateElderlyBefore2004(inp);
    ensureEmergencyElevatorSmokeControl(results, inp, { allowRefugeElevator: true, requirePermitDateForRefugeElevator: true, usePermitBasedLodgingFlameproof: true });
    suppressBefore2004LowRiseEscapeItems(results, inp);
    const summaryHtml = `<div class="ib-title">입력값 기준</div>노유자시설, 건축허가일 ${permitStr}, 연면적 ${inp.totalArea}㎡, 지상 ${inp.aboveGroundFloors}층, 지하 ${inp.basementFloors}층`;
    const exceptionItems = buildBefore2004ExceptionItems(results, pd);
    const allRequiredItems = results.filter((r) => r.status === "required" || r.status === "review");
    document.getElementById("year-result-summary").innerHTML = summaryHtml;
    renderSimpleRequiredList(allRequiredItems, "year-required-list");
    renderYearExtraItems(inp);
    renderResultGroup("year-criteria-list", results, [], allRequiredItems.map((i) => i.name));
    renderResultGroup("year-exception-list", exceptionItems);
    yearUpdateMultiuseSafetyButton(inp);
    showYearResultWithLoading();
    return;
  }
  // ── 분법 이전 의료시설 처리 ──
  if (yearState.answers.yEraChoice === "before2004" && yearState.answers.yOccupancyType === "medical") {
    const pd = yPermitDateInt();
    if (pd < YD.D19811106 || pd >= YD.D20040530) {
      showToast("1981년 11월 6일 ~ 2004년 5월 29일 사이의 허가일을 입력해 주세요.");
      return;
    }
    const inp = yearNormalizeAnswers();
    const rawPermit = yearState.answers.yPermitDate;
    const [py, pm, pd2] = rawPermit.split("-").map(Number);
    const permitStr = `${py}년 ${pm}월 ${pd2}일`;
    const subtypeLabel = inp.before2004MedicalSubtype === "hospital" ? "종합병원" : "병원·의원 등";
    const results = yearEvaluateMedicalBefore2004(inp);
    ensureEmergencyElevatorSmokeControl(results, inp, { allowRefugeElevator: true, requirePermitDateForRefugeElevator: true, usePermitBasedLodgingFlameproof: true });
    suppressBefore2004LowRiseEscapeItems(results, inp);
    const summaryHtml = `<div class="ib-title">입력값 기준</div>의료시설(${subtypeLabel}), 건축허가일 ${permitStr}, 연면적 ${inp.totalArea}㎡, 지상 ${inp.aboveGroundFloors}층, 지하 ${inp.basementFloors}층`;
    const exceptionItems = buildBefore2004ExceptionItems(results, pd);
    const allRequiredItems = results.filter((r) => r.status === "required" || r.status === "review");
    document.getElementById("year-result-summary").innerHTML = summaryHtml;
    renderSimpleRequiredList(allRequiredItems, "year-required-list");
    renderYearExtraItems(inp);
    renderResultGroup("year-criteria-list", results, [], allRequiredItems.map((i) => i.name));
    renderResultGroup("year-exception-list", exceptionItems);
    yearUpdateMultiuseSafetyButton(inp);
    showYearResultWithLoading();
    return;
  }
  // ── 분법 이전 종교시설 처리 ──
  if (yearState.answers.yEraChoice === "before2004" && yearState.answers.yOccupancyType === "religious") {
    const pd = yPermitDateInt();
    if (pd < YD.D19811106 || pd >= YD.D20040530) {
      showToast("1981년 11월 6일 ~ 2004년 5월 29일 사이의 허가일을 입력해 주세요.");
      return;
    }
    const inp = yearNormalizeAnswers();
    const rawPermit = yearState.answers.yPermitDate;
    const [py, pm, pd2] = rawPermit.split("-").map(Number);
    const permitStr = `${py}년 ${pm}월 ${pd2}일`;
    const results = yearEvaluateReligiousBefore2004(inp);
    ensureEmergencyElevatorSmokeControl(results, inp, { allowRefugeElevator: true, requirePermitDateForRefugeElevator: true, usePermitBasedLodgingFlameproof: true });
    suppressBefore2004LowRiseEscapeItems(results, inp);
    const summaryHtml = `<div class="ib-title">입력값 기준</div>종교시설, 건축허가일 ${permitStr}, 연면적 ${inp.totalArea}㎡, 지상 ${inp.aboveGroundFloors}층, 지하 ${inp.basementFloors}층`;
    const exceptionItems = buildBefore2004ExceptionItems(results, pd);
    const allRequiredItems = results.filter((r) => r.status === "required" || r.status === "review");
    document.getElementById("year-result-summary").innerHTML = summaryHtml;
    renderSimpleRequiredList(allRequiredItems, "year-required-list");
    renderResultGroup("year-criteria-list", results, [], allRequiredItems.map((i) => i.name));
    renderResultGroup("year-exception-list", exceptionItems);
    yearUpdateMultiuseSafetyButton(inp);
    showYearResultWithLoading();
    return;
  }
  // ── 분법 이전 판매시설(구 「시장」) 처리 ──
  if (yearState.answers.yEraChoice === "before2004" && yearState.answers.yOccupancyType === "sales") {
    const pd = yPermitDateInt();
    if (pd < YD.D19811106 || pd >= YD.D20040530) {
      showToast("1981년 11월 6일 ~ 2004년 5월 29일 사이의 허가일을 입력해 주세요.");
      return;
    }
    const inp = yearNormalizeAnswers();
    const rawPermit = yearState.answers.yPermitDate;
    const [py, pm, pd2] = rawPermit.split("-").map(Number);
    const permitStr = `${py}년 ${pm}월 ${pd2}일`;
    const eraNote = pd < YD.D19920728 ? "(허가일 기준 구 「시장」 적용)" : "";
    const results = yearEvaluateSalesBefore2004(inp);
    ensureEmergencyElevatorSmokeControl(results, inp, { allowRefugeElevator: true, requirePermitDateForRefugeElevator: true, usePermitBasedLodgingFlameproof: true });
    suppressBefore2004LowRiseEscapeItems(results, inp);
    const summaryHtml = `<div class="ib-title">입력값 기준</div>판매시설${eraNote}, 건축허가일 ${permitStr}, 연면적 ${inp.totalArea}㎡, 판매 사용면적 ${inp.before2004SalesArea}㎡, 지상 ${inp.aboveGroundFloors}층, 지하 ${inp.basementFloors}층`;
    const exceptionItems = buildBefore2004ExceptionItems(results, pd);
    const allRequiredItems = results.filter((r) => r.status === "required" || r.status === "review");
    document.getElementById("year-result-summary").innerHTML = summaryHtml;
    renderSimpleRequiredList(allRequiredItems, "year-required-list");
    renderYearExtraItems(inp);
    renderResultGroup("year-criteria-list", results, [], allRequiredItems.map((i) => i.name));
    renderResultGroup("year-exception-list", exceptionItems);
    yearUpdateMultiuseSafetyButton(inp);
    showYearResultWithLoading();
    return;
  }
  // ── 분법 이전 공동주택(아파트) 처리 ──
  if (yearState.answers.yEraChoice === "before2004" && yearState.answers.yOccupancyType === "apartment") {
    const pd = yPermitDateInt();
    if (pd < YD.D19811106 || pd >= YD.D20040530) {
      showToast("1981년 11월 6일 ~ 2004년 5월 29일 사이의 허가일을 입력해 주세요.");
      return;
    }
    yearApplyAutoCalc();
    const inp = yearNormalizeAnswers();
    const rawPermit = yearState.answers.yPermitDate;
    const [py, pm, pd2] = rawPermit.split("-").map(Number);
    const permitStr = `${py}년 ${pm}월 ${pd2}일`;
    const results = yearEvaluateApartmentBefore2004(inp);
    const hasParkingBuilding = inp.aptHasParkingBuilding && (inp.aptParkingArea || 0) > 0;
    if (hasParkingBuilding) {
      mergeAptUnionResults(results, yearEvaluateParkingBuildingBefore2004(inp));
    }
    ensureEmergencyElevatorSmokeControl(results, inp, { allowRefugeElevator: true, requirePermitDateForRefugeElevator: true, usePermitBasedLodgingFlameproof: true });
    suppressBefore2004LowRiseEscapeItems(results, inp);
    const dongCount = Math.max(inp.aptBuildingCount || 1, 1);
    const perDong = Math.round(inp.totalArea / dongCount);
    const parkingNote = hasParkingBuilding
      ? ` + 별동 주차장 ${inp.aptParkingArea}㎡(지상 ${inp.aptParkingAbove}층·지하 ${inp.aptParkingBelow}층)` : "";
    const summaryHtml = `<div class="ib-title">입력값 기준</div>공동주택(아파트), 건축허가일 ${permitStr}, 연면적 ${inp.totalArea}㎡ · ${dongCount}개 동(동당 약 ${perDong}㎡), ${inp.before2004AptHouseholds}세대, 가장 높은 지상 ${inp.aboveGroundFloors}층, 가장 깊은 지하 ${inp.basementFloors}층${parkingNote}`
      + `<br><span style="font-size:11px;opacity:0.85;">※ 단지 단위 근사: 지상 연면적만 동당 평균(÷동수), 지하 바닥면적(통합 주차장 포함)·층수·세대수는 단지 통합/최고 기준. 별동 주차장은 따로 판정해 합산. 동마다 규모가 크게 다르면 동별로 따로 확인하세요.</span>`;
    // 아파트 스프링클러는 16층 이상 층만 설치(전층 아님) → SP로 연결살수설비 면제 불가
    const exceptionItems = buildBefore2004ExceptionItems(results, pd, { sprinklerSuppressesConnSpray: false });
    const allRequiredItems = results.filter((r) => r.status === "required" || r.status === "review");
    document.getElementById("year-result-summary").innerHTML = summaryHtml;
    renderSimpleRequiredList(allRequiredItems, "year-required-list");
    renderYearExtraItems(inp);
    renderResultGroup("year-criteria-list", results, [], allRequiredItems.map((i) => i.name));
    renderResultGroup("year-exception-list", exceptionItems);
    yearUpdateMultiuseSafetyButton(inp);
    showYearResultWithLoading();
    return;
  }
  if (yearState.answers.yEraChoice === "before2004") {
    document.getElementById("year-result-summary").innerHTML =
      `<div class="ib-title">소방법 분법 이전 (1981. 11. 6. ~ 2004. 5. 29.)</div>` +
      `해당 용도에 대한 분법 이전 기준은 현재 준비 중입니다.`;
    document.getElementById("year-required-list").innerHTML = "";
    renderExtraItemsToTarget({}, "year-extra-items-section", "year-extra-items-list");
    document.getElementById("year-criteria-list").innerHTML = "";
    document.getElementById("year-exception-list").innerHTML = "";
    showYearResultWithLoading();
    return;
  }
  const pd = yPermitDateInt();
  if (pd < YD.D20040530) {
    showToast("이 도구는 2004년 5월 30일 이후 건축허가 건물만 분석 가능합니다.");
    return;
  }
  yearApplyAutoCalc();
  const inp = yearNormalizeAnswers();
  const rawPermit = yearState.answers.yPermitDate;
  const [py, pm, pd2] = rawPermit.split("-").map(Number);
  const permitStr = `${py}년 ${pm}월 ${pd2}일`;
  let results;
  let summaryHtml;

  let exceptionItems = [];
  const autoNoteParts = (kind) => {
    if (!yearIsAutoAreaMode()) return "";
    const parts = [];
    if (kind === "neighborhood") {
      parts.push(`1·2층 ${inp.firstSecondFloorArea}㎡`);
      parts.push(`지하·무창 근생 ${inp.smokeControlArea}㎡`);
      parts.push(`300㎡ 이상 층 ${inp.hasLargeTargetFloor ? "있음" : "없음"}`);
      parts.push(`1,000㎡ 이상 층 ${inp.hasLargeFloorFor1000 ? "있음" : "없음"}`);
    } else if (kind === "lodging") {
      parts.push(`1·2층 ${inp.lodgingFirstSecondFloorArea}㎡`);
      parts.push(`지하·무창 숙박 ${inp.lodgingBasementAreaForSmoke}㎡`);
      parts.push(`1,000㎡ 이상 층 ${inp.lodgingHasLargeFloorFor1000 ? "있음" : "없음"}`);
    } else if (kind === "elderly") {
      parts.push(`1·2층 ${inp.elderlyFirstSecondFloorArea}㎡`);
      parts.push(`지하·무창 노유자 ${inp.elderlyBasementAreaForSmoke}㎡`);
      parts.push(`300㎡ 이상 층 ${inp.elderlyHasLargeTargetFloor ? "있음" : "없음"}`);
    } else if (kind === "medical") {
      parts.push(`1·2층 ${inp.medicalFirstSecondFloorArea}㎡`);
      parts.push(`지하·무창 의료 ${inp.medicalBasementAreaForSmoke}㎡`);
      parts.push(`300㎡ 이상 층 ${inp.medicalHasLargeTargetFloor ? "있음" : "없음"}`);
    } else if (kind === "religious") {
      parts.push(`1·2층 ${inp.religiousFirstSecondFloorArea}㎡`);
      parts.push(`600㎡ 이상 층 ${inp.religiousHasLargeTargetFloor ? "있음" : "없음"}`);
    } else if (kind === "sales") {
      parts.push(`1·2층 ${inp.salesFirstSecondFloorArea}㎡`);
      parts.push(`300㎡ 이상 층 ${inp.salesHasLargeTargetFloor ? "있음" : "없음"}`);
    } else if (kind === "apartment") {
      const dongCount = inp.aptBuildingCount || 1;
      const avgFloor = Math.round(yearApartmentAverageFloorArea() * 10) / 10;
      parts.push(`동당 평균 층면적 ${avgFloor}㎡`);
      parts.push(`1·2층 ${inp.aptFirstSecondFloorArea}㎡`);
      parts.push(`지하층 합계 ${inp.basementAreaSum}㎡`);
      parts.push(`600㎡ 이상 층 ${inp.aptHasFloor600 ? "있음" : "없음"}`);
      parts.push(`1,000㎡ 이상 층 ${inp.aptHasFloor1000 ? "있음" : "없음"}`);
      parts.push(`동 수 ${dongCount}개`);
    }
    return `<br><span style="font-size:11px;opacity:0.85;">※ 면적 자동산정 적용: ${parts.join(", ")} (직사각형·전 층 동일 용도 가정)</span>`;
  };
  if (inp.occupancyType === "lodging") {
    results = yearEvaluateLodging(inp);
    exceptionItems = yearBuildLodgingExceptionItems(results, inp);
    summaryHtml = `<div class="ib-title">입력값 기준</div>숙박시설, 건축허가일 ${permitStr}, 연면적 ${inp.totalArea}㎡, 숙박 사용면적 ${inp.lodgingArea}㎡, 지상 ${inp.aboveGroundFloors}층, 지하 ${inp.basementFloors}층${autoNoteParts("lodging")}`;
  } else if (inp.occupancyType === "elderly") {
    results = yearEvaluateElderly(inp);
    exceptionItems = yearBuildElderlyExceptionItems(results, inp);
    const subtypeLabel = inp.elderlySubtype === "living" ? "노유자 생활시설" : "일반 노유자시설";
    summaryHtml = `<div class="ib-title">입력값 기준</div>노유자시설(${subtypeLabel}), 건축허가일 ${permitStr}, 연면적 ${inp.totalArea}㎡, 노유자 사용면적 ${inp.elderlyArea}㎡, 지상 ${inp.aboveGroundFloors}층, 지하 ${inp.basementFloors}층${autoNoteParts("elderly")}`;
  } else if (inp.occupancyType === "medical") {
    results = yearEvaluateMedical(inp);
    exceptionItems = yearBuildMedicalExceptionItems(results, inp);
    const medicalSubtypeLabels = {
      generalHospital: "종합병원",
      hospital: "병원·치과병원·한방병원",
      nursingHome: "요양병원",
      psychiatricHospital: "정신의료기관",
      rehabilitationFacility: "의료재활시설",
    };
    const subtypeLabel = medicalSubtypeLabels[inp.medicalSubtype] || "의료시설";
    summaryHtml = `<div class="ib-title">입력값 기준</div>의료시설(${subtypeLabel}), 건축허가일 ${permitStr}, 연면적 ${inp.totalArea}㎡, 의료 사용면적 ${inp.medicalArea}㎡, 지상 ${inp.aboveGroundFloors}층, 지하 ${inp.basementFloors}층${autoNoteParts("medical")}`;
  } else if (inp.occupancyType === "religious") {
    results = yearEvaluateReligious(inp);
    exceptionItems = yearBuildReligiousExceptionItems(results, inp);
    summaryHtml = `<div class="ib-title">입력값 기준</div>종교시설, 건축허가일 ${permitStr}, 연면적 ${inp.totalArea}㎡, 지상 ${inp.aboveGroundFloors}층, 지하 ${inp.basementFloors}층${autoNoteParts("religious")}`;
  } else if (inp.occupancyType === "sales") {
    results = yearEvaluateSales(inp);
    exceptionItems = yearBuildSalesExceptionItems(results, inp);
    const salesTags = [];
    if (inp.salesIsTraditionalMarket) salesTags.push("전통시장");
    if (inp.salesIsLargeStore) salesTags.push("대규모점포");
    const salesTagStr = salesTags.length ? `(${salesTags.join("·")})` : "";
    summaryHtml = `<div class="ib-title">입력값 기준</div>판매시설${salesTagStr}, 건축허가일 ${permitStr}, 연면적 ${inp.totalArea}㎡, 판매 사용면적 ${inp.salesArea}㎡, 지상 ${inp.aboveGroundFloors}층, 지하 ${inp.basementFloors}층${autoNoteParts("sales")}`;
  } else if (inp.occupancyType === "apartment") {
    results = yearEvaluateApartment(inp);
    exceptionItems = yearBuildApartmentExceptionItems(results, inp);
    const aptSubtypeLabels = { apt: "아파트등", row: "연립주택·다세대주택", dorm: "기숙사" };
    const subtypeLabel = aptSubtypeLabels[inp.apartmentSubtype] || "공동주택";
    const dongCount = inp.aptBuildingCount || 1;
    const perDong = dongCount > 0 ? Math.round(inp.totalArea / dongCount) : inp.totalArea;
    const householdText = inp.apartmentSubtype === "apt" ? `, ${inp.aptHouseholdCount}세대` : "";
    summaryHtml = `<div class="ib-title">입력값 기준</div>공동주택(${subtypeLabel}), 건축허가일 ${permitStr}, 연면적 ${inp.totalArea}㎡ · ${dongCount}개 동(동당 약 ${perDong}㎡)${householdText}, 가장 높은 지상 ${inp.aboveGroundFloors}층, 가장 깊은 지하 ${inp.basementFloors}층`
      + `<br><span style="font-size:11px;opacity:0.85;">※ 단지 단위 근사: 면적 기준은 동당 평균(연면적÷동수), 층수·지하는 최고 동·통합 지하 기준. 동마다 규모가 크게 다르면 동별로 따로 확인하세요.</span>${autoNoteParts("apartment")}`;
  } else {
    results = yearEvaluateNeighborhood(inp);
    exceptionItems = yearBuildNeighborhoodExceptionItems(results, inp);
    summaryHtml = `<div class="ib-title">입력값 기준</div>근린생활시설, 건축허가일 ${permitStr}, 연면적 ${inp.totalArea}㎡, 지상 ${inp.aboveGroundFloors}층, 지하 ${inp.basementFloors}층${autoNoteParts("neighborhood")}`;
  }

  ensureEmergencyElevatorSmokeControl(results, inp, { allowRefugeElevator: true, requirePermitDateForRefugeElevator: true, usePermitBasedLodgingFlameproof: true });
  ensureAutoFireNotify30F(results, inp);

  const excludedNames = new Set(exceptionItems.filter((e) => e.category === "설치 제외").map((e) => e.name));
  const hasParkingReplacement = exceptionItems.some((e) => e.category === "대체설비" && e.name === "주차장 관련 스프링클러설비 대체 가능");
  let allRequiredItems = results.filter((r) => r.status === "required" || r.status === "review");
  let requiredItems = allRequiredItems.filter((r) => !excludedNames.has(r.name));

  // 주차 대체설비: 물분무등소화설비를 목록에서 제거하고, 스프링클러(주차 관련)를 별도 항목으로 추가
  // 단, 전기실 조건(전기실 300㎡↑)으로 물분무가 설치되는 경우는 유지
  if (hasParkingReplacement) {
    let elecArea = 0;
    if (inp.occupancyType === "lodging") elecArea = inp.lodgingElectricalRoomArea;
    else if (inp.occupancyType === "elderly") elecArea = inp.elderlyElectricalRoomArea;
    else if (inp.occupancyType === "medical") elecArea = inp.medicalElectricalRoomArea;
    else if (inp.occupancyType === "sales") elecArea = inp.salesElectricalRoomArea;
    else elecArea = inp.electricalRoomArea;

    if (elecArea < 300) {
      // 물분무등소화설비 제거 (주차 조건으로만 설치되는 경우)
      requiredItems = requiredItems.filter((r) => r.name !== "물분무등소화설비");
    }

    // 이미 일반 스프링클러설비가 required(전층)가 아닌 경우에만 주차 전용 항목 추가
    const mainSprinkler = requiredItems.find((r) => r.name === "스프링클러설비");
    if (!mainSprinkler) {
      requiredItems.push({
        category: categories.extinguishing,
        name: "스프링클러설비(주차 관련 대체설비)",
        status: "required",
        reason: "주차 관련 공간은 물분무등소화설비 기준이 적용되지만, 대체설비로 해당 주차 공간에 스프링클러설비를 설치할 수 있습니다.",
      });
    }
  }

  document.getElementById("year-result-summary").innerHTML = summaryHtml;
  renderSimpleRequiredList(requiredItems, "year-required-list");
  renderYearExtraItems(inp);
  renderResultGroup("year-criteria-list", results, [...excludedNames], requiredItems.map((i) => i.name));
  const visibleExceptionItems = inp.occupancyType === "apartment"
    ? exceptionItems.filter((item) => item.status !== "notRequired")
    : exceptionItems;
  renderResultGroup("year-exception-list", visibleExceptionItems);

  // 다중이용업소 버튼 표시 여부
  yearUpdateMultiuseSafetyButton(inp);

  showYearResultWithLoading();
}

function yearWizardRestart() {
  yearState.currentStep = 0;
  const ya = yearState.answers;
  ya.yEraChoice = "after2004";
  ya.yOccupancyType = "neighborhood";
  ya.yPermitDate = "2019-02-18";
  ya.yTotalArea = "1500";
  ya.yAboveGroundFloors = "4";
  ya.yBasementFloors = "0";
  ya.yBasementAreaSum = "0";
  ya.yHasWindowlessFloor = "no";
  ya.yWindowlessArea = "";
  ya.yHasLargeTargetFloor = "no";
  ya.yHasLargeFloorFor1000 = "no";
  ya.yNeighborhoodArea = "1500";
  ya.yFacilitySubtype = "general";
  ya.yIsPostpartum = "no";
  ya.yPostpartumAreaRange = "under600";
  ya.yIsClinicWithInpatient = "no";
  ya.yHasHemodialysis = "no";
  ya.yHas24HourStaff = "no";
  ya.yBefore2004FacilitySubtype = "general";
  ya.yBefore2004HasLargeFloor450 = "no";
  ya.yBefore2004SprinklerFloor = "no";
  ya.yBefore2004HasDetFloor300 = "no";
  ya.yBefore2004LargeFloor1000 = "no";
  ya.yFirstSecondFloorArea = "750";
  ya.yIndoorParkingArea = "";
  ya.yMechanicalParkingCapacity = "";
  ya.yElectricalRoomArea = "";
  ya.ySmokeControlArea = "0";
  ya.yHasSmallUndergroundParking = "no";
  // 근린생활시설 다중이용업소
  ya.yHasMultiuseBusiness = "no";
  ya.yMultiuseInBasement = "no";
  ya.yMultiuseIsSealed = "no";
  ya.yMultiuseIsPostpartum = "no";
  ya.yMultiuseIsGosiwon = "no";
  ya.yMultiuseIsGunRange = "no";
  ya.yMultiuseOnSecondToTenthFloor = "no";
  ya.yMultiuseOnGroundOrRefugeFloor = "no";
  ya.yMultiuseUsesAV = "no";
  ya.yMultiuseHasGasFacility = "no";
  ya.yMultiuseHasRooms = "no";
  ya.yMultiuseHasEvacuationRoute = "no";
  // 숙박시설 전용
  ya.yLodgingArea = "1500";
  ya.yLodgingIsTouristHotel = "no";
  ya.yLodgingHasLargeFloorFor1000 = "no";
  ya.yLodgingHasGasFacility = "no";
  ya.yLodgingFirstSecondFloorArea = "750";
  ya.yLodgingIndoorParkingArea = "";
  ya.yLodgingMechanicalParkingCapacity = "";
  ya.yLodgingElectricalRoomArea = "";
  ya.yLodgingBasementAreaForSmoke = "0";
  // 숙박시설 다중이용업소
  ya.yLodgingHasMultiuseBusiness = "no";
  ya.yLodgingMultiuseInBasement = "no";
  ya.yLodgingMultiuseIsSealed = "no";
  ya.yLodgingMultiuseIsPostpartum = "no";
  ya.yLodgingMultiuseIsGosiwon = "no";
  ya.yLodgingMultiuseIsGunRange = "no";
  ya.yLodgingMultiuseOnSecondToTenthFloor = "no";
  ya.yLodgingMultiuseOnGroundOrRefugeFloor = "no";
  ya.yLodgingMultiuseUsesAV = "no";
  ya.yLodgingMultiuseHasGasFacility = "no";
  ya.yLodgingMultiuseHasRooms = "no";
  ya.yLodgingMultiuseHasEvacuationRoute = "no";
  // 노유자시설 전용
  ya.yElderlySubtype = "general";
  ya.yElderlyArea = "1500";
  ya.yElderlyHasLargeTargetFloor = "no";
  ya.yElderlyHasGrillWindow = "no";
  ya.yElderlyHasGasFacility = "no";
  ya.yElderlyHasFloor500Plus = "no";
  ya.yElderlyHas24HourStaff = "no";
  ya.yElderlyFirstSecondFloorArea = "750";
  ya.yElderlyIndoorParkingArea = "";
  ya.yElderlyMechanicalParkingCapacity = "";
  ya.yElderlyElectricalRoomArea = "";
  ya.yElderlyBasementAreaForSmoke = "0";
  ya.yElderlyHasSmallUndergroundParking = "no";
  // 의료시설 전용
  ya.yMedicalSubtype = "hospital";
  ya.yMedicalArea = "1500";
  ya.yMedicalHasLargeTargetFloor = "no";
  ya.yMedicalHasGrillWindow = "no";
  ya.yMedicalHasGasFacility = "no";
  ya.yMedicalHasFloor500Plus = "no";
  ya.yMedicalFirstSecondFloorArea = "750";
  ya.yMedicalIndoorParkingArea = "";
  ya.yMedicalMechanicalParkingCapacity = "";
  ya.yMedicalElectricalRoomArea = "";
  ya.yMedicalBasementAreaForSmoke = "0";
  // 분법 이전 의료시설 전용
  ya.yBefore2004MedicalSubtype = "hospital";
  ya.yBefore2004MedicalHasLargeFloor450 = "no";
  ya.yBefore2004MedicalHasLargeFloor300 = "no";
  ya.yBefore2004MedicalSprinklerFloor = "no";
  ya.yBefore2004MedicalAutoDetFloor300 = "no";
  ya.yBefore2004MedicalHasLargeFloor1000 = "no";
  ya.yBefore2004MedicalHasFloor1500 = "no";
  ya.yBefore2004MedicalElectricalRoomArea = "";
  ya.yBefore2004MedicalIndoorParkingArea = "";
  ya.yBefore2004MedicalMechanicalParkingCapacity = "";
  // 종교시설 전용
  ya.yReligiousHasLargeTargetFloor = "no";
  ya.yReligiousFirstSecondFloorArea = "750";
  ya.yReligiousIndoorParkingArea = "";
  ya.yReligiousMechanicalParkingCapacity = "";
  ya.yReligiousElectricalRoomArea = "";
  ya.yReligiousOccupancy100Plus = "no";
  ya.yReligiousIsWoodStructure = "no";
  ya.yReligiousIsSacrificialBuilding = "no";
  ya.yReligiousHasStage = "no";
  ya.yReligiousStageArea = "";
  ya.yReligiousHasGasFacility = "no";
  // 분법 이전 종교시설 전용
  ya.yBefore2004ReligiousHasLargeFloor600 = "no";
  ya.yBefore2004ReligiousIndoorParkingArea = "";
  ya.yBefore2004ReligiousMechanicalParkingCapacity = "";
  ya.yBefore2004ReligiousElectricalRoomArea = "";
  ya.ySalesArea = ya.yTotalArea;
  // 공동주택 전용
  ya.yAptHouseholdCount = "150";
  ya.yBefore2004AptHouseholds = "150";
  ya.yAptIndoorParkingArea = "0";
  ya.yAptMechanicalParkingCapacity = "0";
  ya.yAptElectricalRoomArea = "0";

  document.getElementById("year-question-card").classList.remove("hidden");
  document.getElementById("year-result-card").classList.add("hidden");
  document.getElementById("year-multiuse-safety-card").classList.add("hidden");
  document.getElementById("year-prog-wrap").classList.remove("hidden");
  yearRenderCurrentStep();
}

document.getElementById("back-from-explorer-year").addEventListener("click", () => showScreen("explorerSelect"));
document.getElementById("year-prev-btn").addEventListener("click", () => {
  if (yearState.currentStep === 0) showScreen("explorerSelect");
  else yearMoveStep(-1);
});
document.getElementById("year-next-btn").addEventListener("click", () => {
  const activeSteps = yearGetActiveSteps();
  if (yearState.currentStep === activeSteps.length - 1) yearShowResults();
  else yearMoveStep(1);
});
document.getElementById("year-result-prev-btn").addEventListener("click", () => {
  const activeSteps = yearGetActiveSteps();
  yearState.currentStep = activeSteps.length - 1;
  document.getElementById("year-result-card").classList.add("hidden");
  document.getElementById("year-question-card").classList.remove("hidden");
  document.getElementById("year-prog-wrap").classList.remove("hidden");
  yearRenderCurrentStep();
  yearScrollToTop();
});
document.getElementById("year-restart-btn").addEventListener("click", () => yearWizardRestart());

document.getElementById("year-open-multiuse-safety").addEventListener("click", () => {
  const inp = yearNormalizeAnswers();
  const yearMultiuseSafetyCard = document.getElementById("year-multiuse-safety-card");
  const yearResultCard = document.getElementById("year-result-card");
  document.getElementById("year-multiuse-safety-summary").innerHTML = `<div class="ib-title">다중이용업소 안전시설 기준</div>입력한 조건을 기준으로 다중이용업소에 설치해야 하는 안전시설만 별도로 정리했습니다.`;
  const multiuse = yearEvaluateMultiuseFacilitiesForCurrentEra(inp);
  renderMultiuseRequiredSafetyList(multiuse, "year-multiuse-required-list");
  renderResultGroup("year-multiuse-reason-list", multiuse.reasonItems);
  const transitionalContainer = document.getElementById("year-multiuse-transitional-notes");
  if (transitionalContainer && multiuse.transitionalNotes && multiuse.transitionalNotes.length > 0) {
    const items = multiuse.transitionalNotes.map((n) => `<div class="transitional-item"><strong>${n.title}</strong><br>${n.text}</div>`).join("");
    transitionalContainer.innerHTML = `<div class="info-box amber"><div class="ib-title">경과규정 안내 — 기존 영업장 적용 제외 가능</div>${items}</div>`;
  } else if (transitionalContainer) {
    transitionalContainer.innerHTML = "";
  }
  yearResultCard.classList.add("hidden");
  yearMultiuseSafetyCard.classList.remove("hidden");
  yearScrollToTop();
});

document.getElementById("year-back-to-main-result").addEventListener("click", () => {
  document.getElementById("year-multiuse-safety-card").classList.add("hidden");
  document.getElementById("year-result-card").classList.remove("hidden");
  yearScrollToTop();
});

document.getElementById("year-restart-from-multiuse").addEventListener("click", () => yearWizardRestart());
document.getElementById("back-from-date").addEventListener("click", () => showScreen("home"));
document.getElementById("back-from-guide").addEventListener("click", () => showScreen("home"));
document.getElementById("open-guide").addEventListener("click", () => {
  trackMenuClick("이용 안내");
  showScreen("guide");
});

(function initIntroVideo() {
  const INTRO_SEEN_KEY = "introVideoSeen_v5";
  const INTRO_DURATION_MS = 105000;
  const overlay = document.getElementById("intro-video-overlay");
  const frame = document.getElementById("intro-video-frame");
  const closeBtn = document.getElementById("intro-video-close");
  const openBtn = document.getElementById("open-intro-video");
  let closeTimer = null;

  if (!overlay || !frame || !closeBtn) return;

  window.addEventListener("message", (e) => {
    if (e.data && e.data.type === "INTRO_DONE") closeIntroVideo();
  });

  function openIntroVideo(markSeen) {
    clearTimeout(closeTimer);
    try { localStorage.removeItem("fire-intro:t"); } catch {}
    document.documentElement.setAttribute("data-intro-active", "true");
    // Show overlay BEFORE setting iframe src so iframe isn't loaded
    // inside a display:none parent (which throttles its timers/RAF)
    overlay.classList.remove("hidden");
    requestAnimationFrame(() => {
      frame.src = "./video/chat streaming.html";
    });
    if (markSeen) localStorage.setItem(INTRO_SEEN_KEY, "true");
    closeTimer = setTimeout(closeIntroVideo, INTRO_DURATION_MS);
  }

  function closeIntroVideo() {
    clearTimeout(closeTimer);
    closeTimer = null;
    overlay.classList.add("hidden");
    frame.src = "about:blank";
    document.documentElement.removeAttribute("data-intro-active");
  }

  closeBtn.addEventListener("click", closeIntroVideo);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.classList.contains("hidden")) {
      closeIntroVideo();
    }
  });

  if (openBtn) {
    openBtn.addEventListener("click", () => openIntroVideo(false));
  }

  if (!localStorage.getItem(INTRO_SEEN_KEY)) {
    document.documentElement.setAttribute("data-intro-active", "true");
    requestAnimationFrame(() => openIntroVideo(true));
  }
})();

// 메일 링크: 모바일은 mailto 그대로, PC는 Gmail 웹 작성 페이지로
(function initMailLink() {
  const mailLink = document.querySelector(".contact-right-link");
  if (!mailLink) return;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (!isMobile) {
    mailLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.open(
        "https://mail.google.com/mail/?view=cm&fs=1&to=carrotcakehope%40gmail.com&su=%EC%98%88%EB%B0%A9GPT%20%EA%B1%B4%EC%9D%98%EC%82%AC%ED%95%AD",
        "_blank"
      );
    });
  }
})();
document.getElementById("prev-step").addEventListener("click", () => {
  if (state.currentStep === 0) {
    if (explorerRuntime.mode === "multiuse-only") {
      showScreen("multiuseSelect");
    } else {
      showScreen("explorerSelect");
    }
  } else {
    moveStep(-1);
  }
});
document.getElementById("next-step").addEventListener("click", () => {
  const activeSteps = getActiveSteps();
  if (explorerRuntime.mode === "year" && state.currentStep === activeSteps.length - 1) {
    showToast("연도별_테스트중은 아직 결과 계산을 준비 중입니다. 질문 흐름만 테스트할 수 있습니다.");
    return;
  }
  if (state.currentStep === activeSteps.length - 1) showResults();
  else moveStep(1);
});
document.getElementById("open-multiuse-safety").addEventListener("click", () => {
  if (!explorerViewState.lastInput) return;
  const input = explorerViewState.lastInput;
  if (input.occupancyType === "lodging") {
    renderLodgingMultiuseSafetyCard(input);
  } else {
    renderMultiuseSafetyCard(input);
  }
  const backBtn = document.getElementById("back-to-main-result");
  if (backBtn) backBtn.textContent = "기본 결과로";
  showIlguLoading(() => { showExplorerCard("multiuse-result"); scrollToTop(); });
});
document.getElementById("back-to-main-result").addEventListener("click", () => {
  if (explorerRuntime.mode === "multiuse-only") {
    const activeSteps = getActiveSteps();
    state.currentStep = activeSteps.length - 1;
    showExplorerCard("question");
    renderCurrentStep();
    scrollToTop();
    return;
  }
  if (explorerViewState.lastInput) {
    const input = explorerViewState.lastInput;
    if (input.occupancyType === "lodging") {
      renderLodgingMultiuseEntryButton(input);
    } else {
      renderMultiuseEntryButton(input);
    }
  }
  showExplorerCard("main-result");
  scrollToTop();
});
document.getElementById("restart-explorer").addEventListener("click", () => {
  if (explorerRuntime.mode === "multiuse-only") { restartMultiuseOnly(); return; }
  restartExplorer();
});
document.getElementById("restart-explorer-from-multiuse").addEventListener("click", () => {
  if (explorerRuntime.mode === "multiuse-only") { restartMultiuseOnly(); return; }
  restartExplorer();
});
document.getElementById("result-back-to-select").addEventListener("click", () => {
  const activeSteps = getActiveSteps();
  state.currentStep = activeSteps.length - 1;
  showExplorerCard("question");
  renderCurrentStep();
  scrollToTop();
});

renderCurrentStep();

// ── Reminder System ──

const REMINDERS_KEY = "fire_safety_reminders";

function loadReminders() {
  try { return JSON.parse(localStorage.getItem(REMINDERS_KEY) || "[]"); }
  catch { return []; }
}

function persistReminders(reminders) {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function deleteReminderById(id) {
  persistReminders(loadReminders().filter((r) => r.id !== id));
  renderHomeReminders();
}

function bindReminderPanelEvents(container) {
  container.querySelectorAll("[data-reminder-id]").forEach((btn) => {
    btn.addEventListener("click", () => deleteReminderById(btn.dataset.reminderId));
  });

  const addBtn = container.querySelector("#open-manual-reminder");
  if (addBtn) {
    addBtn.addEventListener("click", openManualReminderModal);
  }

  // 디버그: 알림판 제목 5번 빠르게 클릭 → 업데이트 안내 오버레이 미리보기
  const title = container.querySelector(".reminder-panel-title");
  if (title) {
    let taps = 0;
    let timer = null;
    title.addEventListener("click", () => {
      taps += 1;
      clearTimeout(timer);
      timer = setTimeout(() => { taps = 0; }, 600);
      if (taps >= 5) {
        taps = 0;
        clearTimeout(timer);
        if (typeof window.showUpdateOverlay === "function") {
          const o = window.showUpdateOverlay();
          if (o) setTimeout(() => o.remove(), 1800);
        }
      }
    });
  }
}

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = parseDate(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / 86400000);
}

const REMINDER_TYPE_LABELS = {
  inspect_report: "자체점검",
  fire_safety_manager: "소방안전관리자 선임",
  fire_safety_assistant_manager: "소방안전관리보조자 선임",
  hazardous_material_manager: "위험물안전관리자 선임",
  noncompliance_action: "부적합 조치기한",
  manual: "직접 입력",
};

const REMINDER_BASE_LABELS = {
  inspect_report: "점검완료일",
  fire_safety_manager: "해임·퇴직일",
  fire_safety_assistant_manager: "해임·퇴직일",
  hazardous_material_manager: "해임·퇴직일",
  noncompliance_action: "보고일",
  manual: "등록일",
};

function renderHomeReminders() {
  const container = document.getElementById("home-reminders");
  if (!container) return;

  const reminders = loadReminders();

  if (reminders.length === 0) {
    container.innerHTML = `
      <div class="reminder-panel">
        <div class="reminder-panel-header">
          <span class="reminder-panel-title">📌 제출기한 알림판</span>
          <button class="reminder-add-btn" id="open-manual-reminder" type="button" aria-label="직접 알림 추가">+</button>
        </div>
        <div class="reminder-empty">법정기한 계산기에서 결과를 추가하거나<br>오른쪽 + 버튼으로<br>직접 알림을 등록할 수 있습니다.</div>
      </div>`;
    bindReminderPanelEvents(container);
    return;
  }

  const sorted = [...reminders].sort((a, b) => {
    const da = new Date(a.secondDeadline || a.deadline);
    const db = new Date(b.secondDeadline || b.deadline);
    return da - db;
  });

  const cards = sorted.map((r) => {
    const finalDeadline = r.secondDeadline || r.deadline;
    const remaining = daysUntil(finalDeadline);
    const isUrgent = remaining >= 0 && remaining <= 7;
    const isOverdue = remaining < 0;

    let warningHtml = "";
    if (isOverdue) {
      warningHtml = `<div class="reminder-card-warning">⚠ 기한 초과 (${Math.abs(remaining)}일 경과)</div>`;
    } else if (isUrgent) {
      warningHtml = `<div class="reminder-card-warning">⚠ D-${remaining} 기한 임박!</div>`;
    }

    const baseLabel = REMINDER_BASE_LABELS[r.type] || "시작일";
    let datesHtml = `<div class="reminder-date-row"><span class="reminder-date-label">${baseLabel}</span><span class="reminder-date-val">${formatDate(parseDate(r.baseDate))}</span></div>`;

    if (r.secondDeadline) {
      const label1 = r.type === "noncompliance_action" ? "이행완료기한" : "선임기한";
      const label2 = r.type === "noncompliance_action" ? "완료신고기한" : "선임신고기한";
      datesHtml += `<div class="reminder-date-row"><span class="reminder-date-label">${label1}</span><span class="reminder-date-val">${formatDate(parseDate(r.deadline))}</span></div>`;
      datesHtml += `<div class="reminder-date-row"><span class="reminder-date-label">${label2}</span><span class="reminder-date-val${isUrgent || isOverdue ? " reminder-date-urgent" : ""}">${formatDate(parseDate(r.secondDeadline))}</span></div>`;
    } else {
      datesHtml += `<div class="reminder-date-row"><span class="reminder-date-label">마감일</span><span class="reminder-date-val${isUrgent || isOverdue ? " reminder-date-urgent" : ""}">${formatDate(parseDate(r.deadline))}</span></div>`;
    }

    const cardClass = `reminder-card${isOverdue ? " reminder-overdue" : isUrgent ? " reminder-urgent" : ""}`;
    return `
      <div class="${cardClass}">
        <button class="reminder-delete-btn" type="button" data-reminder-id="${r.id}" aria-label="삭제">×</button>
        <div class="reminder-card-name">${escapeHtml(r.objectName)}</div>
        <span class="reminder-card-type">${escapeHtml(REMINDER_TYPE_LABELS[r.type] || r.type)}</span>
        <div class="reminder-card-dates">${datesHtml}</div>
        ${r.note ? `<div class="reminder-manual-note">${escapeHtml(r.note)}</div>` : ""}
        ${warningHtml}
      </div>`;
  }).join("");

  container.innerHTML = `
    <div class="reminder-panel">
      <div class="reminder-panel-header">
        <span class="reminder-panel-title">📌 제출기한 알림판</span>
        <div class="reminder-header-actions">
          <span class="reminder-count">${reminders.length}건</span>
          <button class="reminder-add-btn" id="open-manual-reminder" type="button" aria-label="직접 알림 추가">+</button>
        </div>
      </div>
      <div class="reminder-list">${cards}</div>
    </div>`;

  bindReminderPanelEvents(container);
}

// Modal
let pendingReminderData = null;
let pendingReminderIsManual = false;

function initReminderModal() {
  const modal = document.getElementById("reminder-modal");
  const nameInput = document.getElementById("reminder-object-name");
  const manualDateInput = document.getElementById("manual-reminder-date");
  const manualNoteInput = document.getElementById("manual-reminder-note");

  document.getElementById("reminder-cancel-btn").addEventListener("click", () => {
    modal.classList.add("hidden");
    pendingReminderData = null;
    pendingReminderIsManual = false;
  });

  document.getElementById("reminder-confirm-btn").addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (!name) { nameInput.focus(); return; }
    if (pendingReminderData) {
      const payload = { ...pendingReminderData, objectName: name, id: Date.now().toString() };
      if (pendingReminderIsManual) {
        const manualDate = manualDateInput.value;
        if (!manualDate) { manualDateInput.focus(); return; }
        payload.deadline = manualDate;
        payload.note = manualNoteInput.value.trim();
      }
      const reminders = loadReminders();
      reminders.unshift(payload);
      persistReminders(reminders);
      renderHomeReminders();
      showToast("메인화면 알림판에 추가되었습니다.");
    }
    modal.classList.add("hidden");
    pendingReminderData = null;
    pendingReminderIsManual = false;
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
      pendingReminderData = null;
      pendingReminderIsManual = false;
    }
  });

  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("reminder-confirm-btn").click();
  });

  manualDateInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("reminder-confirm-btn").click();
  });

  manualNoteInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      document.getElementById("reminder-confirm-btn").click();
    }
  });
}

function showAddReminderModal(data, options = {}) {
  pendingReminderData = data;
  pendingReminderIsManual = Boolean(options.manual);

  const modal = document.getElementById("reminder-modal");
  const title = modal.querySelector(".reminder-modal-title");
  const desc = modal.querySelector(".reminder-modal-desc");
  const nameInput = document.getElementById("reminder-object-name");
  const nameLabel = nameInput.closest(".calc-form-row")?.querySelector("label");
  const manualFields = document.getElementById("manual-reminder-fields");
  const manualDateInput = document.getElementById("manual-reminder-date");
  const manualNoteInput = document.getElementById("manual-reminder-note");

  if (title) title.textContent = pendingReminderIsManual ? "직접 알림 추가" : "메인화면에 표시";
  if (desc) {
    desc.textContent = pendingReminderIsManual
      ? "알림판에 표시할 제목, 날짜, 내용을 입력하세요."
      : "대상물 이름을 입력하면 메인화면 알림판에 추가됩니다.";
  }
  if (nameLabel) nameLabel.textContent = pendingReminderIsManual ? "제목" : "대상물 이름";

  nameInput.value = "";
  nameInput.placeholder = pendingReminderIsManual ? "예: 소방서 제출, 현장 방문" : "예: 홍길동빌딩";
  manualDateInput.value = pendingReminderIsManual ? todayString() : "";
  manualNoteInput.value = "";
  manualFields.classList.toggle("hidden", !pendingReminderIsManual);
  modal.classList.remove("hidden");
  setTimeout(() => document.getElementById("reminder-object-name").focus(), 50);
}

function openManualReminderModal() {
  showAddReminderModal({
    type: "manual",
    baseDate: todayString(),
    deadline: todayString(),
    secondDeadline: null,
  }, { manual: true });
}

initReminderModal();
renderHomeReminders();

// ── Theme Toggle ──────────────────────────────────────────────
(function initTheme() {
  const SEASON_DAY   = { spring: 'blossom', summer: 'summer', autumn: 'autumn', winter: 'winter' };
  const SEASON_NIGHT = { spring: 'dark', summer: 'summer-night', autumn: 'dark', winter: 'dark' };
  const THEME_ICONS  = {
    blossom: '🌸', summer: '🌊', autumn: '🍂', winter: '❄️',
    'summer-night': '🌌', official: '☀️', dark: '🌙',
  };
  const THEME_LABELS = {
    blossom: '벚꽃 테마로', summer: '여름 해변으로', autumn: '가을 테마로', winter: '겨울 테마로',
    'summer-night': '여름밤으로', official: '낮 모드로', dark: '밤 모드로',
  };
  const DEV_ALL = ['blossom', 'summer', 'autumn', 'winter', 'official', 'dark', 'summer-night'];
  const SEASONAL = new Set(['blossom', 'summer', 'autumn', 'winter']);
  const NIGHTS   = new Set(['dark', 'summer-night']);

  function getSeason() {
    const m = new Date().getMonth() + 1;
    if (m >= 3 && m <= 5) return 'spring';
    if (m >= 6 && m <= 8) return 'summer';
    if (m >= 9 && m <= 11) return 'autumn';
    return 'winter';
  }

  function getSummerTheme() {
    const h = new Date().getHours();
    return (h >= 9 && h < 18) ? 'summer' : 'summer-night';
  }

  function getNextTheme(cur) {
    if (localStorage.getItem('devMode') === 'true') {
      return DEV_ALL[(DEV_ALL.indexOf(cur) + 1) % DEV_ALL.length];
    }
    const s = getSeason();
    const slots = [SEASON_DAY[s], 'official', SEASON_NIGHT[s]];
    const idx = slots.indexOf(cur);
    return slots[(idx < 0 ? 1 : idx + 1) % slots.length];
  }

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
    const next = getNextTheme(t);
    const icon  = THEME_ICONS[next]  || '☀️';
    const title = (THEME_LABELS[next] || '테마 전환') + ' 전환';
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.textContent = icon;
      btn.title = title;
    });
  }

  document.querySelectorAll('.topbar').forEach(tb => {
    const btn = document.createElement('button');
    btn.className = 'theme-toggle-btn';
    btn.type = 'button';
    tb.appendChild(btn);
  });

  const s = getSeason();
  const isDev = localStorage.getItem('devMode') === 'true';
  let saved = localStorage.getItem('theme') || SEASON_DAY[s];
  if (saved === 'light') saved = 'official';
  if (!isDev) {
    if (s === 'summer') {
      if (SEASONAL.has(saved) || saved === 'summer-night') saved = getSummerTheme();
    } else {
      if (SEASONAL.has(saved)) saved = SEASON_DAY[s];
      else if (NIGHTS.has(saved)) saved = SEASON_NIGHT[s];
    }
  }
  applyTheme(saved);

  document.addEventListener('click', e => {
    if (e.target.closest('.theme-toggle-btn')) {
      const cur = document.documentElement.getAttribute('data-theme');
      applyTheme(getNextTheme(cur));
    }
  });
})();
showScreen("home");
history.replaceState({ screen: 'home' }, '');

// ── Android 뒤로가기 버튼 ─────────────────────────────────────
(function initBackButton() {
  function getCurrentScreen() {
    return Object.keys(screens).find(k => screens[k].classList.contains("active")) || "home";
  }

  function exitApp() {
    var app = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
    if (app && typeof app.exitApp === "function") {
      app.exitApp();
      return true;
    }
    if (window.AndroidBack && typeof window.AndroidBack.exitApp === "function") {
      window.AndroidBack.exitApp();
      return true;
    }
    return false;
  }

  function leaveWebApp() {
    if (exitApp()) return;
    try { window.close(); } catch {}
    setTimeout(function () {
      try {
        history.go(-Math.max(1, history.length - 1));
      } catch {
        history.back();
      }
    }, 0);
  }

  // true 반환 = 화면 내부 이동(re-push 필요), false = 다른 screen으로 전환(re-push 불필요)
  function doHandleBack(current) {
    if (current === "home") {
      leaveWebApp();
      return false;
    }

    // 연도별 탐색기
    if (current === "explorerYear") {
      const yearMultiuseCard = document.getElementById("year-multiuse-safety-card");
      if (yearMultiuseCard && !yearMultiuseCard.classList.contains("hidden")) {
        document.getElementById("year-back-to-main-result").click();
        return true;
      }
      const yearResultCard = document.getElementById("year-result-card");
      if (yearResultCard && !yearResultCard.classList.contains("hidden")) {
        document.getElementById("year-result-prev-btn").click();
        return true;
      }
      if (yearState.currentStep > 0) {
        yearMoveStep(-1);
        return true;
      }
      showScreen("explorerSelect");
      return false;
    }

    // 소방시설탐색기
    if (current === "explorer") {
      const multiuseCard = document.getElementById("multiuse-safety-card");
      if (multiuseCard && !multiuseCard.classList.contains("hidden")) {
        // back-to-main-result 버튼의 로직에 위임(다중이용업소 전용 모드면 마지막 질문으로,
        // 아니면 기본 결과로). 직접 main-result를 띄우면 전용 모드에서 빈 결과창이 뜬다.
        document.getElementById("back-to-main-result").click();
        return true;
      }
      const resultCard = document.getElementById("result-card");
      if (resultCard && !resultCard.classList.contains("hidden")) {
        // 결과 → 마지막 질문 (UI '이전 질문' 버튼 result-back-to-select와 동일 동작)
        state.currentStep = getActiveSteps().length - 1;
        showExplorerCard("question");
        renderCurrentStep();
        scrollToTop();
        return true;
      }
      if (state.currentStep > 0) {
        moveStep(-1);
        return true;
      }
      // 첫 질문 → explorerSelect (또는 multiuseSelect)
      if (explorerRuntime.mode === "multiuse-only") {
        showScreen("multiuseSelect");
      } else {
        showScreen("explorerSelect");
      }
      return false;
    }

    // 작동·종합 대상 판독기
    if (current === "inspection") {
      if (typeof inspectionState !== "undefined" && inspectionState.history && inspectionState.history.length > 0) {
        inspectionBack();
        return true;
      }
    }

    // 다중이용업소 판독기
    if (current === "multiuse") {
      if (typeof multiuseState !== "undefined" && multiuseState.history && multiuseState.history.length > 0) {
        multiuseBack();
        return true;
      }
    }

    // 그 외 모든 화면 → 홈으로
    showScreen("home");
    return false;
  }

  // ── 뒤로가기 모델 ──────────────────────────────────────────
  // 크롬/안드로이드 WebView의 history-manipulation intervention 때문에,
  // popstate 안에서 (사용자 제스처 없이) pushState로 되감는 "트랩" 방식은
  // 그 엔트리가 "건너뛸 엔트리"로 찍혀 다음 뒤로가기 때 통째로 스킵 → 사이트 밖으로
  // 튕긴다(= 두 번 누르면 종료 버그). 그래서 트랩을 버리고 다음 모델을 쓴다:
  //   1) 앞으로 갈 때(사용자 클릭=제스처)마다 진짜 히스토리 엔트리 1개를 쌓는다.
  //      제스처로 만든 엔트리는 intervention이 건너뛰지 않는다 = "연료".
  //   2) 뒤로가기(popstate)는 그 연료를 자연 소비하며 doHandleBack으로 한 단계만
  //      복원한다. 절대 re-push 하지 않는다.
  // 단계마다 최소 1클릭을 하므로 (연료 ≥ 뒤로횟수)가 보장돼 조기 탈출이 없다.

  var _homeExitArmedAt = 0;
  var HOME_EXIT_MS = 2000;

  function handleBack() {
    // 패치노트 모달이 history.back()으로 자체 종료 중 — 이 popstate는 무시
    if (window._pnConsumeSelfClosing && window._pnConsumeSelfClosing()) {
      return;
    }
    // 패치노트 모달이 열려 있으면 화면 이동/종료 대신 모달만 닫기
    if (window._pnIsOpen && window._pnIsOpen()) {
      window._pnClose();
      return;
    }

    const current = getCurrentScreen();
    if (window.__bl) window.__bl('HB scr=' + current + ' len=' + history.length);

    if (current === "home") {
      var now = Date.now();
      // 두 번째 뒤로(2초 내) = 실제 종료. APK는 exitApp, 웹은 그냥 종료 시도(브라우저가 떠남).
      if (_homeExitArmedAt && now - _homeExitArmedAt <= HOME_EXIT_MS) {
        if (window.__bl) window.__bl('  HOME→EXIT');
        leaveWebApp();
        return;
      }
      // 첫 번째 뒤로 = 종료 예고 토스트만(종료 안 함).
      // 네이티브 APK는 히스토리를 건드리지 않으므로 여기서 그냥 머문다.
      // (웹/PWA는 소비할 히스토리 엔트리가 없으면 브라우저가 떠날 수 있음 — intervention 한계)
      _homeExitArmedAt = now;
      if (window.__bl) window.__bl('  HOME→arm(토스트)');
      showToast("한 번 더 누르면 종료됩니다.");
      return;
    }

    // 한 단계만 뒤로. re-push 없음 — forward 때 클릭으로 쌓아둔 실제 엔트리를 소비한다.
    _suppressHistoryPush = true;
    try {
      doHandleBack(current);
    } finally {
      _suppressHistoryPush = false;
    }
    if (window.__bl) window.__bl('  back→' + getCurrentScreen() + ' len=' + history.length);
  }

  // forward(사용자 클릭)마다 실제 히스토리 엔트리 1개 적재 = 뒤로가기 "연료".
  // 클릭 핸들러 안(사용자 제스처)에서 push하므로 intervention이 안 건너뛴다.
  document.addEventListener("click", function () {
    if (_suppressHistoryPush) return;                       // 뒤로 처리 중 프로그램적 .click()은 제외
    if (window._pnIsOpen && window._pnIsOpen()) return;       // 패치노트 모달은 자체 히스토리 관리
    // 홈 포함 모든 화면에서 클릭마다 연료 적재. (홈에서 연료를 안 쌓으면 어떤 화면에 잠깐
    // 들어갔다 홈으로 돌아왔을 때 홈에 소비할 엔트리가 없어, 뒤로가기 한 번에 Capacitor가
    // 바로 종료해버린다 — "한 번 더 누르면 종료" 토스트가 안 뜨는 원인.)
    history.pushState({ screen: getCurrentScreen() }, '');
    if (window.__bl) window.__bl('FUEL+ (' + getCurrentScreen() + ') len=' + history.length);
  }, true);

  // (호환용) 글로벌 핸들러
  window._appHandleBack = handleBack;

  // 네이티브 APK 뒤로가기는 MainActivity.java 의 OnBackPressedDispatcher 콜백이
  // window._appHandleBack() 을 직접 호출해 처리한다(히스토리/연료/intervention 무관 → 켜자마자 첫 뒤로도 동작).
  // 여기서 @capacitor/app backButton 리스너를 또 등록하면 같은 입력에 handleBack 이 두 번 불릴 위험
  // (홈에서 첫 뒤로에 arm→exit 동시 발생 = 즉시 종료)이 있어 등록하지 않는다.

  // 웹/PWA: history/popstate 방식. (APK는 위 네이티브 경로만 사용)
  window.addEventListener("popstate", function () {
    if (window.__bl) window.__bl('POPSTATE len=' + history.length + ' st=' + (history.state && history.state.screen));
    handleBack();
  });
})();

// ── 바로가기 추가 ─────────────────────────────────────
(function initInstall() {
  if (window.Capacitor) return; // APK 환경에서는 불필요

  const APP_URL = 'https://fire-assistant.github.io/app/';
  const APP_NAME = '예방업무 어시스턴트';

  const isIOS     = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);
  const isPC      = !isIOS && !isAndroid;
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  let deferredPrompt = null;

  // Android / PC Chrome: 설치 프롬프트 대기
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
  });
  window.addEventListener('appinstalled', function () {
    deferredPrompt = null;
  });

  // ── 메인 바로가기 버튼: 앱으로 실행 중이면 숨김 ──
  const cardBtn = document.getElementById('open-install-guide');
  if (cardBtn) {
    if (isStandalone) {
      cardBtn.style.display = 'none';
    } else {
      const desc = document.getElementById('install-card-desc');
      if (desc) {
        if (isIOS)          desc.textContent = '홈 화면에 앱 아이콘 추가하기';
        else if (isAndroid) desc.textContent = '홈 화면에 앱 설치하기';
        else                desc.textContent = '바탕화면에 브라우저 바로가기 만들기';
      }
      cardBtn.addEventListener('click', openInstallModal);
    }
  }

  // ── iOS 구버튼 (기존 팝업 연결 유지) ──
  const iosGuide = document.getElementById('ios-install-guide');
  const iosClose = document.getElementById('ios-guide-close');
  if (iosClose) iosClose.addEventListener('click', () => iosGuide.classList.add('hidden'));
  if (iosGuide) iosGuide.addEventListener('click', e => { if (e.target === iosGuide) iosGuide.classList.add('hidden'); });

  // ── 통합 모달 ──
  const modal       = document.getElementById('install-modal');
  const modalTitle  = document.getElementById('install-modal-title');
  const modalBody   = document.getElementById('install-modal-body');
  const modalAction = document.getElementById('install-modal-action');
  const modalClose  = document.getElementById('install-modal-close');

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal)      modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  function closeModal() { modal.classList.add('hidden'); }

  function openInstallModal() {
    if (!modal) return;
    modalAction.style.display = 'none';
    modalAction.onclick = null;

    if (isIOS) {
      modalTitle.textContent = '홈 화면에 추가 (iPhone)';
      modalBody.innerHTML =
        '<p class="ios-guide-desc">사파리에서 아래 순서로 진행하세요.</p>' +
        '<div class="ios-guide-steps">' +
          step(1, '하단 가운데 <strong>공유 버튼</strong> 탭 (□↑)') +
          step(2, '스크롤 내려서 <strong>홈 화면에 추가</strong> 탭') +
          step(3, '오른쪽 위 <strong>추가</strong> 탭') +
        '</div>';
    } else if (isAndroid || deferredPrompt) {
      if (deferredPrompt) {
        modalTitle.textContent = '홈 화면에 설치';
        modalBody.innerHTML = '<p class="ios-guide-desc">아래 버튼을 누르면 홈 화면에 앱 아이콘이 추가됩니다.</p>';
        modalAction.textContent = '📲 홈 화면에 추가';
        modalAction.style.display = '';
        modalAction.onclick = async function () {
          deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          deferredPrompt = null;
          closeModal();
        };
      } else {
        modalTitle.textContent = '홈 화면에 추가';
        modalBody.innerHTML =
          '<p class="ios-guide-desc">Chrome 메뉴에서 직접 추가할 수 있습니다.</p>' +
          '<div class="ios-guide-steps">' +
            step(1, 'Chrome 주소창 오른쪽 <strong>⋮ 메뉴</strong> 탭') +
            step(2, '<strong>홈 화면에 추가</strong> 선택') +
          '</div>';
      }
    } else {
      // PC
      modalTitle.textContent = '바탕화면 바로가기 추가';
      modalBody.innerHTML =
        '<p class="ios-guide-desc">바로가기 파일을 다운로드해서<br>바탕화면에 옮겨두세요.</p>' +
        '<div class="ios-guide-steps">' +
          step(1, '아래 <strong>다운로드</strong> 버튼 클릭') +
          step(2, '다운로드된 <strong>.url 파일</strong>을 바탕화면으로 이동') +
          step(3, '더블클릭하면 바로 열립니다') +
        '</div>';
      modalAction.textContent = '⬇️ 바로가기 파일 다운로드';
      modalAction.style.display = '';
      modalAction.onclick = function () {
        var content = '[InternetShortcut]\r\nURL=' + APP_URL + '\r\n';
        var blob = new Blob([content], { type: 'text/plain' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = APP_NAME + '.url';
        a.click();
      };
    }

    modal.classList.remove('hidden');
  }

  function step(n, text) {
    return '<div class="ios-guide-step"><span class="ios-step-num">' + n + '</span><span>' + text + '</span></div>';
  }
})();

// ── 자체점검 보고서 읽는법 ────────────────────────────────────────

pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.min.js';

let _pdfDocCache = null;

function getPdfDoc() {
  if (_pdfDocCache) return Promise.resolve(_pdfDocCache);
  return fetch('./report-guide.pdf')
    .then(function (res) {
      if (!res.ok) throw new Error('report-guide.pdf 파일을 찾을 수 없습니다 (HTTP ' + res.status + ')');
      return res.arrayBuffer();
    })
    .then(function (buf) {
      return pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
    })
    .then(function (doc) {
      _pdfDocCache = doc;
      return doc;
    });
}

function renderPdfPageToCanvas(canvas, pageNum) {
  var wrapper = canvas.parentElement;
  return getPdfDoc()
    .then(function (pdf) { return pdf.getPage(pageNum); })
    .then(function (page) {
      var containerWidth = wrapper.clientWidth || window.innerWidth - 32;
      var dpr = window.devicePixelRatio || 1;
      var base = page.getViewport({ scale: 1 });
      var scale = containerWidth / base.width;
      var vp = page.getViewport({ scale: scale * dpr });
      canvas.width = vp.width;
      canvas.height = vp.height;
      canvas.style.width = containerWidth + 'px';
      canvas.style.height = (base.height * scale) + 'px';
      return page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
    });
}

function createPdfBlock(pageNum) {
  var wrapper = document.createElement('div');
  wrapper.className = 'rg-pdf-wrapper';

  var loading = document.createElement('div');
  loading.className = 'rg-pdf-loading';
  loading.textContent = pageNum + '페이지 불러오는 중…';
  wrapper.appendChild(loading);

  var canvas = document.createElement('canvas');
  canvas.className = 'rg-pdf-canvas';
  canvas.style.display = 'none';
  wrapper.appendChild(canvas);

  requestAnimationFrame(function () {
    renderPdfPageToCanvas(canvas, pageNum)
      .then(function () {
        loading.remove();
        canvas.style.display = 'block';
      })
      .catch(function (err) {
        console.error('PDF load error (page ' + pageNum + '):', err);
        // PDF.js 실패 시 iframe fallback
        canvas.remove();
        loading.remove();
        var iframe = document.createElement('iframe');
        iframe.className = 'rg-pdf-iframe';
        iframe.src = './report-guide.pdf#page=' + pageNum;
        wrapper.appendChild(iframe);
      });
  });
  return wrapper;
}

function createCroppedPdfBlock(pageNum, searchText, nextSearchText) {
  var outer = document.createElement('div');
  outer.className = 'rg-pdf-wrapper';

  var loading = document.createElement('div');
  loading.className = 'rg-pdf-loading';
  loading.textContent = '불러오는 중…';
  outer.appendChild(loading);

  requestAnimationFrame(function () {
    var containerWidth = outer.clientWidth || window.innerWidth - 32;
    var dpr = window.devicePixelRatio || 1;
    var pageObj;

    getPdfDoc()
      .then(function (pdf) { return pdf.getPage(pageNum); })
      .then(function (page) {
        pageObj = page;
        return page.getTextContent();
      })
      .then(function (tc) {
        var baseVp = pageObj.getViewport({ scale: 1 });
        var scale = containerWidth / baseVp.width;
        var renderVp = pageObj.getViewport({ scale: scale * dpr });
        var pageH = baseVp.height;
        var items = tc.items;

        var topPdfY = null, bottomPdfY = null;
        var i, j;

        for (i = 0; i < items.length; i++) {
          if (searchText && items[i].str && items[i].str.indexOf(searchText) >= 0) {
            topPdfY = items[i].transform[5] + (items[i].height || 12);
            break;
          }
        }

        if (topPdfY !== null && nextSearchText) {
          for (j = 0; j < items.length; j++) {
            if (items[j].str && items[j].str.indexOf(nextSearchText) >= 0) {
              bottomPdfY = items[j].transform[5] + (items[j].height || 12);
              break;
            }
          }
        }

        var PAD = 8;
        var topCanvasY = topPdfY !== null
          ? Math.max(0, (pageH - topPdfY) * scale - PAD)
          : 0;

        var clipHeight = null;
        if (topPdfY !== null && bottomPdfY !== null) {
          clipHeight = Math.max(40, (pageH - bottomPdfY) * scale - topCanvasY + PAD * 2);
        } else if (topPdfY !== null) {
          clipHeight = Math.max(60, pageH * scale - topCanvasY);
        }

        if (clipHeight !== null) {
          outer.style.height = clipHeight + 'px';
        }

        var canvas = document.createElement('canvas');
        canvas.className = 'rg-pdf-canvas';
        canvas.width = renderVp.width;
        canvas.height = renderVp.height;
        canvas.style.width = containerWidth + 'px';
        canvas.style.height = (pageH * scale) + 'px';
        if (topCanvasY > 0) canvas.style.marginTop = '-' + topCanvasY + 'px';
        canvas.style.display = 'none';

        loading.remove();
        outer.appendChild(canvas);

        return pageObj.render({ canvasContext: canvas.getContext('2d'), viewport: renderVp }).promise
          .then(function () { canvas.style.display = 'block'; });
      })
      .catch(function (err) {
        console.error('PDF crop error (page ' + pageNum + '):', err);
        loading.remove();
        var iframe = document.createElement('iframe');
        iframe.className = 'rg-pdf-iframe';
        iframe.src = './report-guide.pdf#page=' + pageNum;
        outer.appendChild(iframe);
      });
  });

  return outer;
}

function rgInfoBox(type, title, body) {
  var box = document.createElement('div');
  box.className = 'info-box ' + type;
  box.innerHTML = '<div class="ib-title">' + title + '</div>' + body;
  return box;
}

function rgSectionLabel(text) {
  var el = document.createElement('p');
  el.className = 'section-label';
  el.textContent = text;
  return el;
}

function appendRgPage(container, pageNum) {
  container.appendChild(rgSectionLabel(pageNum + '페이지'));
  container.appendChild(createPdfBlock(pageNum));
}

// 설비 ID → 점검표 이미지 경로 (image 폴더에 파일 추가 시 여기에 등록)
// 다른 설비 점검표 안에 포함되어 표시되는 항목 { 항목ID: 포함된 부모ID }
const RG_MERGED_WITH = {
  'a10': 'a05',  // 시각경보기 → 자동화재탐지설비 점검표 내 표시
};

// 설비별 점검표 이미지 (image 폴더 기준)
const RG_SECTION_IMAGES = {
  'w01': './image/inspection/소화기구.png',
  'w03': './image/inspection/옥내소화전.png',
  'w04': './image/inspection/스프링클러설비.png',
  'w05': './image/inspection/간이스프링클러설비.png',
  'w11': './image/inspection/옥외소화전.png',
  'g01': './image/inspection/가스계소화설비.png',
  'a03': './image/inspection/비상방송설비.png',
  'a05': './image/inspection/자동화재탐지설비.png',
  'a06': './image/inspection/자동화재속보설비.png',
  'a08': './image/inspection/가스누설경보기.png',
  'a10': './image/inspection/자동화재탐지설비.png',  // 시각경보기는 자탐 점검표 내 포함
  'e01': './image/inspection/피난기구.png',
  'e02': './image/inspection/인명구조기구.png',
  'e03': './image/inspection/유도등.png',
  'e04': './image/inspection/비상조명등.png',
  'e05': './image/inspection/휴대용비상조명등.png',
  's01': './image/inspection/소화용수설비.png',
  'ac02': './image/inspection/연결송수관설비.png',
  'ac03': './image/inspection/연결살수설비.png',
  'ac04': './image/inspection/비상콘센트설비.png',
  'ac05': './image/inspection/무선통신보조설비.png',
};

// 설비별 작성방법 설명
const RG_FACILITY_DESCS = {
  'w01': [
    '소화기 종류(분말/기타)와 동별·층별 설치 수량을 합계란에 기재합니다.',
    '투척용 소화용구, 간이소화용구, 자동확산소화기는 별도 칸에 수량을 기재합니다.',
    '층별 소계와 전체 합계를 정확히 맞춰 기재합니다.',
  ],
  'w02': [
    '주거용·상업용 주방자동소화장치, 캐비닛형 등 종류를 구분하여 설치 수량을 기재합니다.',
    '설치 위치(층, 호)를 층별로 기재합니다.',
  ],
  'w03': [
    '설치장소 동명을 기재(건물이 1동이면 미기입 가능)하고, 전체층/일부층 중 해당하는 란에 ✔ 표시합니다.',
    '설치 층수 범위를 지상/지하로 구분하여 기재합니다. (예: 지상 1층~3층)',
    '옥내소화전의 설치개수가 가장 많은 층의 설치 개수를 기재합니다.',
  ],
  'w04': [
    '종류(습식/부압식/준비작동식/건식/일제살수식) 중 해당하는 란에 ✔ 표시합니다.',
    '스프링클러설비(헤드) 설치 층수 범위를 지상/지하로 구분하여 기재합니다. (예: 지상 1층~3층 or 지하 1층)',
  ],
  'w05': [
    '간이스프링클러 종류와 설치장소(동명, 층 범위)를 기재합니다.',
    '간이스프링클러설비(헤드) 설치 층수 범위를 지상/지하로 구분하여 기재합니다. (예: 지상 1층~3층)',
  ],
  'w06': [
    '화재조기진압용 스프링클러는 랙식 창고 등 특수한 용도에 설치합니다.',
    '설치장소 동명, 층 범위, 헤드 수량을 기재합니다.',
  ],
  'w11': [
    '옥외소화전이 설치 된 총 개수를 기재합니다.',
  ],
  'g01': [
    '이산화탄소, 할론, 할로겐화합물 및 불활성기체, 분말, 강화액, 고체에어로졸 소화설비가 해당합니다.',
  ],
  'a03': [
    '<b>전용/겸용</b>: 비상방송설비 전용으로 쓰이는 장비인지, 일반 방송설비와 겸용해서 사용하는지 확인합니다.',
    '겸용은 평상시에는 일반 BGM이나 안내 방송용 등 다른 방송설비와 공용으로 사용할 수 있으나, 화재 시에는 비상경보 외의 일반 방송이 즉시 차단되는 구조입니다.',
    '<b>전층경보/우선경보</b>: 화재시 피난중 병목현상을 방지하기 위해 일정규모 이상의 건물에는 우선경보 방식을 사용하여 위험한 층에 있는 사람부터 대피할 수 있게 하는 방식입니다. 대부분의 작은 규모의 건물(11층 이하)에는 전층경보 방식을 사용합니다.', 
    '증폭기 설치장소(동명, 층)와 실명을 기재합니다.',
  ],
  'a05': [
    '수신기 위치(동명, 지상/지하 층수, 수신기가 설치된 실명)를 기재합니다.',
    '경보방식(전층경보/우선경보, 시각경보기 유무)에 해당하는 란에 ✔ 표시합니다.',
    '설치장소: 감지기가 설치된 층의 범위를 기입합니다.',
    '감지기 종류(열/연기/그 밖의 것)를 기재합니다. 작은 규모의 건물에는 주로 열과 연기 감지기를 설치합니다.',
  ],
  'a06': [
    '자동화재속보설비가 설치된 위치(동명, 지상/지하 층수, 자동화재속보설비가 설치된 실명)를 기재합니다.',
    '자동화재속보설비는 주로 수신기 바로 근처에 설치돼있지만, 해당건물에 일부의 용도(노유자 등)로 인해 설치된 경우에는 수신기가 있는 위치가 아닌 곳에 따로 설치된 경우도 있습니다(예시 : 수신기는 1층 식당에 있는데, 자동화재속보설비는 3층 요양원에 설치된 경우)', 
  ],
  'a08': [
    '단독형(검지부와 수신부 일체)은 소규모 건물, 분리형(김지부와 수신부 분리)은 비교적 대형건물에 사용합니다.',
    '가스 종류(LPG/LNG)를 확인하고 경계구역 수를 기재합니다.',
  ],
  'a10': [
    '시각경보기는 자동화재탐지설비 점검표 내에 함께 표시됩니다.',
    '경보방식 항목에서 시각경보기 유/무 란에 ✔ 표시합니다.',
  ],
  'e01': [
    '피난기구 종류(피난사다리/완강기/구조대 등)와 동별·층별 수량을 기재합니다.',
    '건물의 용도, 규모 등의 조건에 따라 피난기구의 종류와 수량이 달라집니다.',
    '대부분의 일반 건물에는 완강기를 설치(상대적으로 비용 낮음)하고, 노유자시설에는 구조대(최근에는 승강식 피난기도 많이 설치중), 다중이용업소에는 피난사다리가 많이 설치됩니다.',
  ],
  'e02': [
    '<b>종류</b>: 공기호흡기, 방열복, 공기안전매트, 인공소생기 중 설치된 것을 기재합니다.',
    '<b>설치장소</b>: 인명구조기구가 설치된 위치(동명, 층)를 비고란에 기재합니다.',
    '<b>대상물의 용도</b>: 인명구조기구가 설치된 법적기준(왜 설치했는지)을 확인하여 기입합니다. 대상물의 용도에 따라 설치되는 인명구조기구가 다르고, 전체층 또는 일부층에 설치하는지도 달라집니다.',
  ],
  'e03': [
    '피난구유도등, 통로유도등, 유도표지 등 해당 특정소방대상물에 설치된 모든 종류를 기재합니다.',
    '대부분의 작은 건물에는 피난구유도등고 통로유도등이 설치돼있고 1992년 7월 28일 이전에 설치된 건물에는 유도표지가 설치된 곳도 있습니다.(10층 이하 유도표지 설치, 11층 이상 유도등 설치)',
  ],
  'e04': [
    '비상조명등이 설치된 장소(동명, 층)를 기재합니다.',
    '비상전원의 종류를 확인하고 기재합니다.',
  ],
  'e05': [
    '휴대용비상조명등이 설치된 장소(동명, 층)를 기재합니다.',
    '전원은 대부분 건전지식을 사용합니다.',
  ],
  's01': [
    '상수도소화용수설비의 소화전 호칭지름과 설치 장소를 기재합니다.',
  ],
  's02': [
    '소화수조·저수조의 용량(㎥)과 위치(동명, 지하층 등)를 기재합니다.',
    '흡수관 투입구 위치와 채수구 개수를 확인합니다.',
  ],
  'ac01': [
    '제연구역과 제연경계 구획 방식을 기재합니다.',
    '설치 위치(동명, 층)와 제연 방식(자연/기계)을 기재합니다.',
  ],
  'ac02': [
    '<b>전용, 겸용</b>: 해당 특정소방대상물에 옥내소화전설비나 스프링클러설비 등 수계소화설비가 설치되어 있고, 규모가 엄청 큰 경우가 아니면 연결송수관 설비는 대부분 다른 수계소화설비와 배관을 겸용하여 설치합니다.',
    '<b>설치장소</b>: 연결송수관 설비가 설치된 동명과 층 범위를 기재합니다.',
    '<b>방수구 위치 및 송수구 설치장소</b>: 방수구와 송수구가 설치된 장소를 확인하여 기입합니다.',
    '<b>방수구/<b>는 옥내소화전함 내에 있는 경우가 많으며, 배관이 직상으로 설치되기 때문에 층마다 같은 위치에 설치되는 경우가 많습니다.',
    '<b>가압송수장치 설치장소</b>: 가압송수장치가 설치된 장소 및 전양정과 토출량(펌프 명판에 기재돼있음) 등을 기입합니다.',
    '건물의 층수가 높을 경우(70m이상, 약 23층~24층 이상) 소방차의 압력만으로는 건물의 꼭대기 층까지 방수에 필요한 압력으로 물이 도달할 수 없습니다. 그래서 별도의 가압송수장치를 설치합니다.',
    '<b>기동스위치 설치장소</b>: 가압송수장치를 기동시키는 스위치가 설치된 장소를 기입합니다.',
  ],
  'ac03': [
    '<b>방식</b>: 살수설비가 습식(폐쇄형 헤드사용, 배관내부 물로 차있음)인지 건식(개방형 헤드사용, 배관내부 평상시 공기)인지 확인하여 기입합니다. 대부분 건식으로 설치됩니다.',
    '<b>지하층과 판매시설, 가스시설 등</b> 중 살수설비가 설치된 법적기준(왜 설치했는지)을 확인하여 기입합니다.',
    '<b>송수구가 설치된 장소와 송수구역 수</b>를 확인하여 기입합니다.',
  ],
  'ac04': [
    '비상콘센트 설비가 설치된 동명과 층을 기재합니다.',
    '<b>전원방식과 접속기 형식</b>을 확인하여 해당하는 란에 ✔표시합니다. 오래된 건물(고층 빌딩 등)을 제외하고 현재는 단상 220V와 접지형 2극 플러그접속기를 설치합니다.',
  ],
  'ac05': [
    '무선통신보조설비가 설치된 장소(동명, 층 범위)를 기재합니다.',
    '누설동축케이블/안테나 방식, 혼합방식을 확인하여 기재합니다.',
    '접속단자가 설치된 장소를 확인하여 기입합니다.',
  ],
  'ac06': [
    '연소방지설비는 지하구(공동구)에 설치합니다.',
    '설치 구간과 방화구획 위치를 기재합니다.',
  ],
};

// 설비별 참고 박스 (noteTitle + noteItems)
const RG_FACILITY_NOTES = {
  'a05': {
    noteTitle: '전층경보 vs 우선경보 방식',
    noteItems: [
      { tag: '전층경보', text: '화재 감지 시 건물 전체에 즉시 경보를 발령하는 방식입니다. <b>11층 미만(공동주택은 16층 미만)</b>인 건축물에 적용됩니다.' },
      { tag: '우선경보', text: '화재가 발생한 층과 위험도가 높은 인접 층에 우선 경보를 발령하는 방식입니다. <b>11층 이상(공동주택은 16층 이상)</b>인 특정소방대상물에 적용됩니다. 대형 건물에서 일시 대피로 인한 병목 현상과 혼란을 방지하기 위해 사용됩니다.' },
    ],
  },
};

const RG_FACILITY_GROUPS = [
  {
    id: 'water', sectionLabel: '3-3', page: 5, name: '수계소화설비',
    items: [
      { id: 'w01', label: '소화기구',                          st: '소화기구' },
      { id: 'w02', label: '자동소화장치',                      st: '자동소화장치' },
      { id: 'w03', label: '옥내소화전설비',                    st: '옥내소화전' },
      { id: 'w04', label: '스프링클러설비',                    st: '스프링클러설비' },
      { id: 'w05', label: '간이스프링클러설비',                st: '간이스프링클러' },
      { id: 'w06', label: '화재조기진압용 스프링클러설비',     st: '화재조기진압' },
      { id: 'w07', label: '물분무소화설비',                    st: '물분무소화설비' },
      { id: 'w08', label: '미분무소화설비',                    st: '미분무소화설비' },
      { id: 'w09', label: '포소화설비',                        st: '포소화설비' },
      { id: 'w11', label: '옥외소화전설비',                    st: '옥외소화전' },
    ],
  },
  {
    id: 'gas', sectionLabel: '3-4', page: 5, name: '가스계소화설비',
    items: [
      { id: 'g01', label: '가스계소화설비',                    st: '가스계소화설비' },
    ],
  },
  {
    id: 'alarm', sectionLabel: '3-5', page: 6, name: '경보설비',
    items: [
      { id: 'a01', label: '단독경보형감지기',                  st: '단독경보' },
      { id: 'a02', label: '비상경보설비',                      st: '비상경보설비' },
      { id: 'a03', label: '비상방송설비',                      st: '비상방송설비' },
      { id: 'a04', label: '누전경보기',                        st: '누전경보기' },
      { id: 'a05', label: '자동화재탐지설비',                  st: '자동화재탐지' },
      { id: 'a06', label: '자동화재속보설비',                  st: '자동화재속보' },
      { id: 'a07', label: '통합감시시설',                      st: '통합감시시설' },
      { id: 'a08', label: '가스누설경보기',                    st: '가스누설경보기' },
      { id: 'a09', label: '화재알림설비',                      st: '화재알림설비' },
      { id: 'a10', label: '시각경보기',                        st: '시각경보기' },
    ],
  },
  {
    id: 'escape', sectionLabel: '3-6', page: 6, name: '피난구조설비',
    items: [
      { id: 'e01', label: '피난기구',                          st: '피난기구' },
      { id: 'e02', label: '인명구조기구',                      st: '인명구조기구' },
      { id: 'e03', label: '유도등',                            st: '유도등' },
      { id: 'e04', label: '비상조명등',                        st: '비상조명등' },
      { id: 'e05', label: '휴대용 비상조명등',                 st: '휴대용' },
    ],
  },
  {
    id: 'wsupply', sectionLabel: '3-7', page: 6, name: '소화용수설비',
    items: [
      { id: 's01', label: '상수도소화용수설비',                st: '상수도소화용수' },
      { id: 's02', label: '소화수조 및 저수조',               st: '소화수조' },
    ],
  },
  {
    id: 'activity', sectionLabel: '3-8', page: 7, name: '소화활동설비',
    items: [
      { id: 'ac01', label: '제연설비',                         st: '제연설비' },
      { id: 'ac02', label: '연결송수관설비',                   st: '연결송수관' },
      { id: 'ac03', label: '연결살수설비',                     st: '연결살수설비' },
      { id: 'ac04', label: '비상콘센트설비',                   st: '비상콘센트' },
      { id: 'ac05', label: '무선통신보조설비',                 st: '무선통신보조' },
      { id: 'ac06', label: '연소방지설비',                     st: '연소방지설비' },
    ],
  },
];

const rgState = {
  mode: 'select', // 'select' | 'guide'
  tab: 'page1',
  selected: new Set(),
  grade: null,   // 'special1' | 'grade2' | 'grade3' | 'custom'
};

// 등급별 자동 선택 프리셋 (항목 ID 배열)
const RG_GRADE_PRESETS = {
  special: ['w01','w03','w04','a03','a05','a08','a10','e01','e03','e04','s01','ac02','w11','g01','ac01','ac04','ac05'],
  grade12: ['w01','w03','w04','a03','a05','a08','a10','e01','e03','e04','s01','ac02'],
  grade3:  ['w01','a05','a10','e01','e03','ac03'],
  custom:  null,
};

const RG_GRADE_DEFS = [
  { id: 'special',  label: '특급',    note: '17종 자동 선택' },
  { id: 'grade12',  label: '1,2급',   note: '12종 자동 선택' },
  { id: 'grade3',   label: '3급',     note: '6종 자동 선택' },
  { id: 'custom',   label: '직접선택', note: '전체 초기화' },
];

// 수계소화설비 공동사항을 표시할 설비 ID
const RG_WATER_IDS = new Set(['w03', 'w04', 'w05', 'w06', 'w07', 'w08', 'w09', 'w11']);

// 수계소화설비 공동사항 항목
const RG_WATER_COMMON = [
  {
    id: '_wc_su', label: '수원', img: './image/inspection/수원.png',
    desc: [
      '<b>설비의 종류</b>: 수원을 사용하는 소방설비를 기재합니다.',
      '주수원과 보조수원으로 구분하여 각각 용량과 위치를 기재합니다.',
    ],
  },
  {
    id: '_wc_ga', label: '가압송수장치', img: './image/inspection/가압송수장치.png',
    desc: [
      '펌프방식/고가수조방식/압력수조방식 중 해당하는 □에 ✔ 표시합니다.',
      '설치장소(동명, 지상/지하 층, 실명)를 기재합니다.',
      '토출량(ℓ/min)과 전양정(m) 또는 압력(㎫), 동력(㎾)을 기재합니다.',
    ],
  },
  {
    id: '_wc_so', label: '송수구', img: './image/inspection/송수구.png',
    desc: [
      '송수구 설치 위치(동명, 층)와 단구형/쌍구형 구분을 기재합니다.',
      '<b>설치장소</b>: 송수구가 설치된 장소, 설치 개수를 확인하여 기재합니다. 주로 출입구 쪽에 있습니다.',
    ],
  },
  {
    id: '_wc_bi', label: '비상전원', img: './image/inspection/비상전원.png',
    desc: [
      '비상전원 종류(자가발전설비/비상전원수전설비/축전지설비/전기저장장치)에 해당하는 란에 ✔ 표시합니다.',
      '<b>설치장소</b>: 동명, 층, 실명을 기재합니다.',
    ],
  },
];

function renderReportGuide(restoreScroll) {
  var root = document.getElementById('report-guide-content');

  // 모드별 상단 제목·근거법령 칩 (select=가이드 메뉴, guide=보고서 읽는법)
  var rgTitleEl = document.getElementById('report-guide-title');
  var rgLawChip = document.getElementById('report-guide-law-chip');
  if (rgState.mode === 'select') {
    if (rgTitleEl) rgTitleEl.textContent = '자체점검 가이드';
    if (rgLawChip) rgLawChip.classList.add('hidden');
  } else {
    if (rgTitleEl) rgTitleEl.textContent = '자체점검 보고서 읽는법';
    if (rgLawChip) rgLawChip.classList.remove('hidden');
  }

  if (rgState.mode === 'select') {
    root.innerHTML = '';
    var selWrap = document.createElement('div');
    selWrap.className = 'scroll-content';
    selWrap.innerHTML = `
      <section class="wq-card menu-select">
        <p class="wq-label">자체점검 가이드</p>
        <h2 class="wq-title">어떤 내용이 필요하세요?</h2>
        <p class="wq-sub">목적에 맞는 항목을 선택하세요.</p>
        <div class="choice-list" style="margin-top:16px;">
          <button id="rg-sel-inspection" class="choice-button choice-card" type="button">
            <span class="cc-icon mc-red">🏢</span>
            <span class="cc-body">
              <span class="cc-num">01</span>
              <strong>작동·종합 대상 판독기</strong>
              <span class="cc-desc">작동기능점검과 종합정밀점검 대상 여부를 판정합니다.</span>
            </span>
            <span class="cc-arrow">›</span>
          </button>
          <button id="rg-sel-guide" class="choice-button choice-card" type="button">
            <span class="cc-icon mc-blue">📋</span>
            <span class="cc-body">
              <span class="cc-num">02</span>
              <strong>자체점검 보고서 읽는법</strong>
              <span class="cc-desc">자체점검 실시결과 보고서 작성·읽기 안내</span>
            </span>
            <span class="cc-arrow">›</span>
          </button>
        </div>
      </section>
    `;
    root.appendChild(selWrap);
    document.getElementById('rg-sel-inspection').addEventListener('click', function () {
      trackMenuClick("자체점검 가이드-작동·종합 대상 판독기");
      inspectionRestart();
      showScreen('inspection');
    });
    document.getElementById('rg-sel-guide').addEventListener('click', function () {
      trackMenuClick("자체점검 가이드-보고서 읽는법");
      rgState.mode = 'guide';
      rgState.tab = 'page1';
      renderReportGuide();
    });
    return;
  }

  // 현재 스크롤 위치 저장
  var savedScroll = 0;
  if (restoreScroll) {
    var prevContent = root.querySelector('.rg-content');
    if (prevContent) savedScroll = prevContent.scrollTop;
  }

  root.innerHTML = '';

  // ── 탭 바 ──
  var tabDefs = [
    { id: 'page1',    main: '1페이지',   sub: '보고서 표지' },
    { id: 'page2',    main: '2페이지',   sub: '대상물 정보' },
    { id: 'checklist',main: '3페이지',   sub: '소방시설 선택' },
    { id: 'sections', main: '4-8페이지', sub: '점검표' },
  ];

  attachHorizontalSwipeNavigation(root, function () {
    return {
      keys: tabDefs.map(function (t) { return t.id; }),
      current: rgState.tab,
      onChange: function (nextTab) {
        rgState.tab = nextTab;
        renderReportGuide();
      },
    };
  });

  var tabBar = document.createElement('div');
  tabBar.className = 'rg-tab-bar';

  tabDefs.forEach(function (t) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'rg-tab-btn' + (rgState.tab === t.id ? ' active' : '');
    btn.innerHTML =
      '<span class="rg-tab-main">' + t.main + '</span>' +
      '<span class="rg-tab-sub">'  + t.sub  + '</span>';
    btn.addEventListener('click', function () {
      if (rgState.tab !== t.id) {
        rgState.tab = t.id;
        renderReportGuide();
      }
    });
    tabBar.appendChild(btn);
  });
  root.appendChild(tabBar);

  // ── 콘텐츠 ──
  var content = document.createElement('div');
  content.className = 'rg-content';

  if (rgState.tab === 'page1')     renderRgPage1(content);
  if (rgState.tab === 'page2')     renderRgPage2(content);
  if (rgState.tab === 'checklist') renderRgChecklist(content);
  if (rgState.tab === 'sections')  renderRgSections(content);

  root.appendChild(content);
  animateSwipeNavigation(root);

  // 스크롤 위치 복원
  if (savedScroll > 0) {
    requestAnimationFrame(function () { content.scrollTop = savedScroll; });
  }
}

// ── 1페이지 아코디언 데이터 ──────────────────────────────────────
const RG_PAGE1_SECTIONS = [
  {
    id: 'p1-type',
    label: '점검 종류',
    img: './image/inspection/page 1/page1-점검종류.png',
    desc: [
      '작동기능점검, 종합정밀점검, 최초점검 중 해당하는 부분에 ✔ 표시합니다.',
      '3급 소방대상물의 관계인이 직접 점검하는 경우 대부분 <b>작동기능점검</b>에 해당합니다.',
      '최초점검은 해당 특정소방대상물의 소방시설등이 신설된 경우에만 표시합니다.',
    ],
  },
  {
    id: 'p1-building',
    label: '특정소방대상물 정보',
    img: './image/inspection/page 1/page1-대상물설명.png',
    desc: [
      '<b>명칭(상호)</b>: 건물명을 기재합니다.',
      '<b>대상물 구분(용도)</b>: 「소방시설 설치 및 관리에 관한 법률 시행령」 별표 2에 따른 특정소방대상물 구분을 기재합니다. 소방법에는 "근린생활시설"로만 구분되지만, 점검업체가 건축법 기준인 제1종·제2종으로 나눠 기재하는 경우가 많습니다. 또한 제1종 또는 제2종 "근린생활시설"로 적혀 있더라도 소방법에서는 용도와 면적에 따라 업무시설이나 종교시설 등으로 분류되는 경우도 있습니다.',
      '<b>소재지</b>: 특정소방대상물의 주소를 기재합니다.',
    ],
    noteTable: {
      title: '제1종·제2종 근린생활시설',
      head: ['구분', '대표 업종'],
      rows: [
        ['제1종', '소매점(1,000㎡ 미만), 의원·치과·한의원, 이용원·미용원·목욕장, 파출소·우체국·보건소 등 소규모 생활편의시설'],
        ['제2종', '일반음식점, 휴게음식점(300㎡ 이상), 학원·독서실, 노래연습장·단란주점, PC방·게임장, 공연장(500㎡ 미만) 등'],
      ],
      footnote: '※ 휴게음식점·제과점처럼 같은 업종이라도 면적에 따라 제1종과 제2종이 달라지는 경우도 있습니다.',
    },
  },
  {
    id: 'p1-period',
    label: '점검기간',
    img: './image/inspection/page 1/page1-점검기간.png',
    desc: [
      '소방시설등 자체점검을 실시한 전체 기간(시작일~종료일)을 기재합니다.',
      '<b>총 점검일수</b>는 해당 기간 중 실제 점검한 날 수의 합을 기입합니다. 연속 날짜가 아닐 수 있습니다.',
      '예: 3일 기간 중 이틀만 점검했다면 시작일~종료일은 3일이지만 총 점검일수는 2일로 기재할 수도 있습니다.',
    ],
  },
  {
    id: 'p1-inspector',
    label: '점검자',
    img: './image/inspection/page 1/page1-점검자.png',
    desc: [
      '<b>관계인·소방안전관리자·소방시설관리업자 </b> 중 점검을 실시한 자에 ✔ 표시하고 전화번호를 기입합니다.',
      '<b>전자우편 송달에 동의</b>하는 경우, 불량사항 조치에 대한 사전통지와 조치명령서가 우편 대신 정보통신망을 통해 발송됩니다.',
    ],
  },
  {
    id: 'p1-personnel',
    label: '점검인력',
    img: './image/inspection/page 1/page1-점검인력.png',
    desc: [
      '주된 점검인력과 보조 점검인력으로 구분하여 <b>참여한 인력을 모두 기입</b>합니다.',
      '「소방시설 설치 및 관리에 관한 법률 시행규칙」 별표 4에 따라 보조 점검인력을 추가한 경우, 추가된 보조 인력도 함께 기입해야 합니다.',
      '성명, 자격구분, 자격번호, 점검참여일(기간)을 정확히 기재합니다.',
      '3급 관계인 자체점검 시에는 <b>주인력 1명과 보조인력 2명을 기본 1단위</b>로 합니다.',
    ],
  },
  {
    id: 'p1-sign',
    label: '제출일과 서명',
    img: './image/inspection/page 1/page1-날짜서명.png',
    desc: [
      '소방서로 제출하는 자체점검의 서명(또는 인)부분에는 <b>관계인의 서명(또는 인)</b>이 있어야 합니다.(관계인이 아닌 안전관리자 불가)</b>',
      '관계인은 <b>점검 끝난 날부터 15일 이내</b>에 이행계획서(점검결과 부적합 사항이 있는 경우)를 첨부하여 제출해야 합니다.',
      '위임장을 첨부하는 경우에는 소방시설관리업자 등이 대신 보고할 수 있습니다.',
    ],
  },
];

function createRgAccordion(section, num) {
  var wrap = document.createElement('div');
  wrap.className = 'rg-accordion';
  if (section.id) wrap.id = 'rgacc-' + section.id;

  var header = document.createElement('button');
  header.type = 'button';
  header.className = 'rg-accordion-header';
  var numBadge = (num != null) ? '<span class="rg-acc-num">' + num + '</span>' : '';
  header.innerHTML =
    numBadge + '<span class="rg-acc-label">' + section.label + '</span>' +
    '<span class="rg-acc-chevron">▼</span>';

  var body = document.createElement('div');
  body.className = 'rg-accordion-body';
  body.hidden = false;
  header.classList.add('open');

  if (section.img) {
    var imgWrap = document.createElement('div');
    imgWrap.className = 'rg-acc-img-wrap';
    var img = document.createElement('img');
    img.className = 'rg-section-img';
    img.src = section.img;
    img.alt = section.label;
    imgWrap.appendChild(img);
    body.appendChild(imgWrap);
  }

  if (section.desc && section.desc.length) {
    var ul = document.createElement('ul');
    ul.className = 'rg-acc-desc';
    section.desc.forEach(function (line) {
      var li = document.createElement('li');
      li.innerHTML = line;
      ul.appendChild(li);
    });
    body.appendChild(ul);
  }

  if (section.noteItems && section.noteItems.length) {
    var noteBox = document.createElement('div');
    noteBox.className = 'rg-role-note';
    var noteTitle = document.createElement('div');
    noteTitle.className = 'rg-role-note-title';
    noteTitle.innerHTML = '<span class="rg-note-badge">참고</span> ' + (section.noteTitle || '구분');
    noteBox.appendChild(noteTitle);
    section.noteItems.forEach(function (item) {
      var row = document.createElement('div');
      row.className = 'rg-role-item';
      row.innerHTML = '<span class="rg-role-tag">' + item.tag + '</span>' + item.text;
      noteBox.appendChild(row);
    });
    body.appendChild(noteBox);
  }

  if (section.noteTable) {
    var ntBox = document.createElement('div');
    ntBox.className = 'rg-role-note';
    var ntTitle = document.createElement('div');
    ntTitle.className = 'rg-role-note-title';
    ntTitle.innerHTML = '<span class="rg-note-badge">참고</span> ' + section.noteTable.title;
    ntBox.appendChild(ntTitle);
    var ntWrap = document.createElement('div');
    ntWrap.className = 'calc-table-wrap';
    ntWrap.style.marginTop = '8px';
    var ntTable = document.createElement('table');
    ntTable.className = 'calc-table';
    var ntThead = document.createElement('thead');
    var ntHr = document.createElement('tr');
    section.noteTable.head.forEach(function (h) {
      var th = document.createElement('th');
      th.textContent = h;
      ntHr.appendChild(th);
    });
    ntThead.appendChild(ntHr);
    ntTable.appendChild(ntThead);
    var ntTbody = document.createElement('tbody');
    section.noteTable.rows.forEach(function (rowData) {
      var tr = document.createElement('tr');
      rowData.forEach(function (cell, ci) {
        var td = document.createElement('td');
        td.innerHTML = cell;
        if (ci === 0) td.style.whiteSpace = 'nowrap';
        tr.appendChild(td);
      });
      ntTbody.appendChild(tr);
    });
    ntTable.appendChild(ntTbody);
    ntWrap.appendChild(ntTable);
    ntBox.appendChild(ntWrap);
    if (section.noteTable.footnote) {
      var ntFn = document.createElement('div');
      ntFn.style.cssText = 'margin-top:6px;font-size:11px;color:var(--text-dim);line-height:1.55;';
      ntFn.textContent = section.noteTable.footnote;
      ntBox.appendChild(ntFn);
    }
    body.appendChild(ntBox);
  }

  if (section.extraNotes && section.extraNotes.length) {
    section.extraNotes.forEach(function (note) {
      var noteBox = document.createElement('div');
      noteBox.className = 'rg-role-note';
      var noteTitleEl = document.createElement('div');
      noteTitleEl.className = 'rg-role-note-title';
      noteTitleEl.innerHTML = '<span class="rg-note-badge">참고</span> ' + (note.title || '구분');
      noteBox.appendChild(noteTitleEl);
      note.items.forEach(function (item) {
        var row = document.createElement('div');
        row.className = 'rg-role-item';
        row.innerHTML = '<span class="rg-role-tag">' + item.tag + '</span>' + item.text;
        noteBox.appendChild(row);
      });
      body.appendChild(noteBox);
    });
  }

  header.addEventListener('click', function () {
    body.hidden = !body.hidden;
    header.classList.toggle('open', !body.hidden);
  });

  wrap.appendChild(header);
  wrap.appendChild(body);
  return wrap;
}

// ── 2페이지 아코디언 데이터 ──────────────────────────────────────
const RG_PAGE2_SECTIONS = [
  {
    id: 'p2-owner',
    label: '관계인 정보 (대표자)',
    img: './image/inspection/page 2/page2-관계인정보.png',
    desc: [
      '<b>대표자</b>는 소유자·관리자·점유자 중 해당하는 란에 ✔ 표시하고 성명과 전화번호를 기재합니다.',
      '<b>소방안전관리등급</b>: 「화재의 예방 및 안전관리에 관한 법률 시행령」 별표 4에 따른 등급(특급·1급·2급·3급)을 기재하고, 현재 선임된 소방안전관리자 정보를 기입합니다.',
      '<b>소방안전관리자</b>에는 현재 선임된 소방안전관리자 정보를 기입합니다. 최근 교육이수일은 최근에 받은 보수교육(2년마다 실시)을 받은 날을 기입합니다.',
    ],
    noteTitle: '관계인 구분',
    noteItems: [
      { tag: '소유자 (건물주)', text: '법적으로 그 건물의 소유권(등기명의)을 가진 사람입니다. 건축물대장·등기부등본에 이름이 올라 있는 건물의 진짜 주인입니다.' },
      { tag: '관리자 (관리소장)', text: '소유자를 대신해 건물·시설을 실질적으로 유지·관리할 권한과 책임을 부여받은 사람입니다. 관리소장이나 위탁 관리업체 등이 해당합니다.' },
      { tag: '점유자 (세입자)', text: '소유권이나 전체 관리 권한은 없지만, 현재 그 공간을 실제로 점유·사용(영업·거주 등)하는 사람입니다. 보증금과 월세를 내고 입점한 임차인·세입자가 대표적입니다.' },
    ],
  },
  {
    id: 'p2-safety',
    label: '소방안전 정보',
    img: './image/inspection/page 2/page2-대상물정보.png',
    desc: [
      '<b>소방계획서 / 자체점검(전년도) / 교육훈련(전년도)</b>: 「화재의 예방 및 안전관리에 관한 법률」 제24조에 따른 소방안전관리업무 실시사항을 기입합니다.',
      '<b>소방계획서(매년 작성)</b>는 연초에는 작성되어 있어야 하고, 관계인은 2년치를 보관하고 있어야 합니다.',
      '<b>화재보험</b>: 해당 특정소방대상물에 화재보험이 가입되어 있는 경우 가입에 ✔ 표시하고, 가입기간과 가입금액(대인/대물)을 기재합니다.',
    ],
  },
  {
    id: 'p2-multi',
    label: '다중이용업소 현황',
    img: './image/inspection/page 2/page2-다중이용업소.png',
    desc: [
      '해당 특정소방대상물에 현재 입점 중인 다중이용업소 업종에 ✔ 표시하고, 그 업소 숫자를 기입합니다.',
      '휴게음식점, 일반음식점, 단란주점, 유흥주점 등이 해당됩니다.(해당 업소가 다중이용업소인지는 <b>다중이용업소판독기</b> 사용)',
      '해당 없는 경우 해당없음에 ✔ 표시합니다.',
    ],
  },
  {
    id: 'p2-building1',
    label: '건축물 정보 ①',
    img: './image/inspection/page 2/page2-건축물정보01.png',
    desc: [
      '<b>건축허가일 등 </b>: 세움터 등의 사이트에서 건축물대장을 통해 해당내용을 확인해서 기입합니다.',
    ],
    noteTitle: '건축물구조 구분',
    noteItems: [
      { tag: '콘크리트구조 (RC)', text: '압축력에 강한 콘크리트와 인장력에 강한 철근을 결합한 방식입니다. 내화성·내구성·방음성이 뛰어나지만, 건물이 무겁고 공사 기간이 깁니다.' },
      { tag: '철골구조 (S)', text: 'H형강 등 강철 부재를 볼트·용접으로 조립합니다. 강도가 높아 고층 빌딩·대형 공장에 적합하고 공사가 빠릅니다. 다만 열에 취약해 화재 시 강도가 급격히 떨어지므로 반드시 내화 피복이 필요합니다.' },
      { tag: '조적조 (Masonry)', text: '벽돌·돌·블록을 모르타르로 쌓아 올리는 방식입니다. 시공이 단순하지만 횡력(옆에서 미는 힘)에 약해 지진에 취약합니다.' },
      { tag: '목구조', text: '나무를 주재료로 사용하는 친환경 방식입니다. 가볍고 단열이 좋으며 탄성이 있어 지진에 의외로 강합니다. 다만 습기·화재에 민감합니다.' },
      { tag: '기타', text: '철골철근콘크리트구조(SRC), 막구조, PC구조(프리캐스트 콘크리트) 등이 해당합니다.' },
    ],
  },
  {
    id: 'p2-building2',
    label: '건축물 정보 ②',
    img: './image/inspection/page 2/page2-건축물정보02.png',
    desc: [
      '<b>지붕구조 등</b>: 세움터 등의 사이트에서 건축물대장을 통해 해당내용을 확인해서 기입합니다.',
    ],
    noteTitle: '지붕구조 구분',
    noteItems: [
      { tag: '슬래브', text: '철근콘크리트로 만든 평평한 판 형태의 지붕입니다. 옥상을 공간으로 활용할 수 있고 내화성이 좋지만, 물이 고이지 않도록 방수 처리와 배수 기울기(구배) 확보가 중요합니다.' },
      { tag: '기와', text: '낱개를 겹쳐 잇는 방식으로 배수 성능과 통기성이 뛰어나고 수명이 깁니다. 전통 한식 기와 외에도 스페니쉬 기와, 금속 기와 등 종류가 다양합니다.' },
      { tag: '슬레이트', text: '얇은 판 형태의 지붕재로 가볍고 시공비가 저렴합니다. 과거의 석면 슬레이트는 건강 문제로 현재는 철거 대상이며, 요즘은 무석면 슬레이트나 합성수지 제품이 사용됩니다.' },
      { tag: '기타', text: '샌드위치 패널, 아스팔트 싱글, 징크(아연도금강판), 막구조 등이 해당합니다.' },
    ],
    extraNotes: [
      {
        title: '계단 종류 구분',
        items: [
          { tag: '직통계단', text: '어느 층에서든 피난층(1층)까지 중단 없이 연결되는 계단입니다. 4층 이하 저층 건물에 주로 적용됩니다.' },
          { tag: '피난계단', text: '직통계단에 내화구조 벽과 방화문을 설치해 불길과 연기를 차단한 계단입니다. <b>5층 이상 또는 지하 2층 이하</b> 건물에 설치 의무가 있습니다.' },
          { tag: '특별피난계단', text: '피난계단 구조에 더해, 계단실 진입 전 <b>부속실(전실)</b>을 두어 연기 유입을 2중으로 차단합니다. <b>11층 이상(공동주택은 16층 이상) 또는 지하 3층 이하</b> 건물에 설치 의무가 있습니다.' },
        ],
      },
      {
        title: '승강기 종류 구분',
        items: [
          { tag: '비상용승강기', text: '화재 시 소방대원이 장비를 들고 고층으로 진입하기 위한 승강기입니다. <b>높이 31m 초과</b> 건물(대략 10~11층 이상)에 설치 의무가 있습니다.' },
          { tag: '피난용승강기', text: '계단 대피가 어려운 거주자(노약자·장애인 등)가 화재 시 안전하게 피난하는 승강기입니다. <b>30층 이상 또는 높이 120m 이상</b> 고층건축물에 승용승강기 중 1대 이상을 설치해야 합니다.' },
        ],
      },
    ],
  },
];

function rgPageBlock(imgSrc, altText) {
  var wrap = document.createElement('div');
  wrap.className = 'rg-pdf-wrapper';
  var img = document.createElement('img');
  img.className = 'rg-section-img';
  img.src = imgSrc;
  img.alt = altText;
  wrap.appendChild(img);
  return wrap;
}

function renderRgPage1(c) {
  c.appendChild(rgInfoBox('blue', '📄 1페이지 — 보고서 표지',
    '점검 기본 정보를 기재하는 페이지입니다. 각 항목을 클릭하면 작성 방법을 확인할 수 있습니다.'));
  c.appendChild(rgPageBlock('./image/inspection/page 1/page1-full.png', '1페이지 전체'));

  var accLabel = document.createElement('div');
  accLabel.className = 'rg-section-label';
  accLabel.textContent = '항목별 작성 방법';
  c.appendChild(accLabel);
  RG_PAGE1_SECTIONS.forEach(function (s, i) { c.appendChild(createRgAccordion(s, i + 1)); });
}

function renderRgPage2(c) {
  c.appendChild(rgInfoBox('blue', '📄 2페이지 — 특정소방대상물 정보',
    '대상물의 소방안전 현황과 건축물 정보를 기재하는 페이지입니다. 각 항목을 클릭하면 작성 방법을 확인할 수 있습니다.'));
  c.appendChild(rgPageBlock('./image/inspection/page 2/page2-full.png', '2페이지 전체'));

  var accLabel = document.createElement('div');
  accLabel.className = 'rg-section-label';
  accLabel.textContent = '항목별 작성 방법';
  c.appendChild(accLabel);
  RG_PAGE2_SECTIONS.forEach(function (s, i) { c.appendChild(createRgAccordion(s, i + 1)); });
}

function renderRgChecklist(c) {
  // ── 3페이지 전체 이미지 ──
  c.appendChild(rgPageBlock('./image/inspection/page 3/page3-full.png', '3페이지 전체'));

  // ── (추후) 페이지 항목별 아코디언 추가 예정 ──

  // ── 소방대상물 등급 선택 ──
  c.appendChild(rgSectionLabel('소방대상물 등급 선택'));
  c.appendChild(rgInfoBox('blue', '💡 등급별 자동 선택',
    '등급을 선택하면 해당 대상물에 일반적으로 설치되는 설비가 자동으로 체크됩니다. 이후 직접 수정할 수 있습니다.'));

  var gradeGrid = document.createElement('div');
  gradeGrid.className = 'rg-grade-selector';

  RG_GRADE_DEFS.forEach(function (g) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'rg-grade-btn' + (rgState.grade === g.id ? ' active' : '');
    btn.innerHTML =
      '<span class="rg-grade-main">' + g.label + '</span>' +
      '<span class="rg-grade-note">' + g.note + '</span>';

    btn.addEventListener('click', function () {
      rgState.grade = g.id;
      if (g.id === 'custom') {
        rgState.selected = new Set();   // 직접선택: 전체 초기화
      } else {
        rgState.selected = new Set(RG_GRADE_PRESETS[g.id]);
      }
      renderReportGuide(true);  // 스크롤 위치 유지
    });
    gradeGrid.appendChild(btn);
  });
  c.appendChild(gradeGrid);

  // ── 설치된 소방시설 선택 ──
  c.appendChild(rgSectionLabel('설치된 소방시설 선택'));

  RG_FACILITY_GROUPS.forEach(function (group) {
    var allItems = group.items;

    var header = document.createElement('div');
    header.className = 'rg-group-header';
    if (allItems.length === 1) header.classList.add('single');

    var groupCb = document.createElement('input');
    groupCb.type = 'checkbox';
    groupCb.className = 'rg-group-cb';
    var allChecked = allItems.every(function (i) { return rgState.selected.has(i.id); });
    var anyChecked = allItems.some(function (i) { return rgState.selected.has(i.id); });
    groupCb.checked = allChecked;
    groupCb.indeterminate = anyChecked && !allChecked;

    var groupName = document.createElement('span');
    groupName.className = 'rg-group-name';
    groupName.textContent = group.name;

    var groupSub = document.createElement('span');
    groupSub.className = 'rg-group-sub';
    groupSub.textContent = group.sectionLabel;

    header.appendChild(groupCb);
    header.appendChild(groupName);
    header.appendChild(groupSub);
    c.appendChild(header);

    var grid = document.createElement('div');
    grid.className = 'rg-item-grid';
    var itemCbs = [];

    if (allItems.length > 1) {
      allItems.forEach(function (item) {
        var lbl = document.createElement('label');
        lbl.className = 'rg-item-label';

        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = rgState.selected.has(item.id);
        itemCbs.push(cb);

        cb.addEventListener('change', function () {
          rgState.grade = 'custom';   // 수동 변경 시 직접선택으로 전환
          rgState.selected[cb.checked ? 'add' : 'delete'](item.id);
          var a2 = allItems.every(function (i) { return rgState.selected.has(i.id); });
          var b2 = allItems.some(function (i) { return rgState.selected.has(i.id); });
          groupCb.checked = a2;
          groupCb.indeterminate = b2 && !a2;
        });

        var span = document.createElement('span');
        span.textContent = item.label;

        lbl.appendChild(cb);
        lbl.appendChild(span);
        grid.appendChild(lbl);
      });
    }

    groupCb.addEventListener('change', function () {
      rgState.grade = 'custom';
      allItems.forEach(function (item, idx) {
        if (groupCb.checked) rgState.selected.add(item.id);
        else rgState.selected.delete(item.id);
        if (itemCbs[idx]) itemCbs[idx].checked = groupCb.checked;
      });
      groupCb.indeterminate = false;
    });
    header.addEventListener('click', function (ev) {
      if (ev.target === groupCb) return;
      groupCb.checked = !groupCb.checked;
      groupCb.dispatchEvent(new Event('change'));
    });

    if (allItems.length > 1) c.appendChild(grid);
  });

  var goBtn = document.createElement('button');
  goBtn.type = 'button';
  goBtn.className = 'btn btn-primary';
  goBtn.style.cssText = 'width:100%;margin-top:16px;';
  goBtn.textContent = '선택한 설비 점검표 보기 →';
  goBtn.addEventListener('click', function () {
    rgState.tab = 'sections';
    renderReportGuide();
  });
  c.appendChild(goBtn);
}

function renderRgSections(c) {
  var allFlat = [];
  RG_FACILITY_GROUPS.forEach(function (g) {
    g.items.forEach(function (item) {
      allFlat.push({ id: item.id, label: item.label, sectionLabel: g.sectionLabel });
    });
  });

  var selectedFlat = allFlat.filter(function (item) {
    return rgState.selected.has(item.id);
  });

  if (selectedFlat.length === 0) {
    c.appendChild(rgInfoBox('amber', '⚠️ 선택된 설비 없음',
      '이전 탭(소방시설 선택)에서 해당 설비를 먼저 선택해 주세요.'));
    var backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'btn btn-ghost';
    backBtn.style.cssText = 'width:100%;margin-top:8px;';
    backBtn.textContent = '← 소방시설 선택으로';
    backBtn.addEventListener('click', function () {
      rgState.tab = 'checklist';
      renderReportGuide();
    });
    c.appendChild(backBtn);
    return;
  }

  // 선택된 ID 집합 (중복 여부 판단용)
  var selectedIds = new Set(selectedFlat.map(function (i) { return i.id; }));

  // ── 소화기구(w01): 무조건 최우선 표시 ──
  var w01Item = selectedFlat.find(function (i) { return i.id === 'w01'; });
  if (w01Item) renderFacilityBlock(c, w01Item, selectedIds);

  // ── 수계소화설비 공동사항: 해당 설비 1개 이상 선택 시 표시 ──
  var hasWater = selectedFlat.some(function (i) { return RG_WATER_IDS.has(i.id); });
  if (hasWater) {
    var wCommonLabel = document.createElement('div');
    wCommonLabel.className = 'rg-section-label';
    wCommonLabel.textContent = '3-2  수계소화설비 (공동사항)';
    c.appendChild(wCommonLabel);

    RG_WATER_COMMON.forEach(function (wItem) {
      var wrapAcc = document.createElement('div');
      wrapAcc.className = 'rg-accordion';
      wrapAcc.style.marginBottom = '6px';

      var wHeader = document.createElement('button');
      wHeader.type = 'button';
      wHeader.className = 'rg-accordion-header';
      wHeader.innerHTML =
        '<span class="rg-acc-label">' + wItem.label + '</span>' +
        '<span class="rg-acc-chevron">▼</span>';

      var wBody = document.createElement('div');
      wBody.className = 'rg-accordion-body';
      wBody.hidden = true;

      var imgWrapW = document.createElement('div');
      imgWrapW.className = 'rg-acc-img-wrap';
      var imgW = document.createElement('img');
      imgW.className = 'rg-section-img';
      imgW.src = wItem.img;
      imgW.alt = wItem.label;
      imgWrapW.appendChild(imgW);
      wBody.appendChild(imgWrapW);

      if (wItem.desc && wItem.desc.length) {
        var descWrapW = document.createElement('div');
        descWrapW.className = 'rg-facility-desc';
        var ulW = document.createElement('ul');
        ulW.className = 'rg-acc-desc';
        wItem.desc.forEach(function (line) {
          var li = document.createElement('li');
          li.innerHTML = line;
          ulW.appendChild(li);
        });
        descWrapW.appendChild(ulW);
        wBody.appendChild(descWrapW);
      }

      wHeader.addEventListener('click', function () {
        wBody.hidden = !wBody.hidden;
        wHeader.classList.toggle('open', !wBody.hidden);
      });

      wrapAcc.appendChild(wHeader);
      wrapAcc.appendChild(wBody);
      c.appendChild(wrapAcc);
    });
  }

  selectedFlat.forEach(function (item) {
    // 소화기구(w01)는 이미 최상단에 표시했으므로 건너뜀
    if (item.id === 'w01') return;

    // 다른 설비 안에 포함된 항목이고, 부모 설비도 선택됐으면 건너뜀
    var parentId = RG_MERGED_WITH[item.id];
    if (parentId && selectedIds.has(parentId)) return;

    renderFacilityBlock(c, item, selectedIds);
  });
}

function renderFacilityBlock(c, item, selectedIds) {
  // 아코디언 래퍼
  var wrap = document.createElement('div');
  wrap.className = 'rg-accordion';
  wrap.style.marginBottom = '6px';

  var header = document.createElement('button');
  header.type = 'button';
  header.className = 'rg-accordion-header';
  header.innerHTML =
    '<span class="rg-acc-label">' + item.sectionLabel + '&nbsp;&nbsp;' + item.label + '</span>' +
    '<span class="rg-acc-chevron">▼</span>';

  var body = document.createElement('div');
  body.className = 'rg-accordion-body';
  body.hidden = true;

  // 포함 항목인 경우 안내 뱃지
  var parentId = RG_MERGED_WITH[item.id];
  if (parentId) {
    var badge = document.createElement('div');
    badge.className = 'rg-merged-badge';
    badge.textContent = '아래 점검표는 ' + item.label + '이(가) 포함된 자동화재탐지설비 점검표입니다.';
    body.appendChild(badge);
  }

  var imgSrc = RG_SECTION_IMAGES[item.id];
  if (imgSrc) {
    var imgWrap = document.createElement('div');
    imgWrap.className = 'rg-acc-img-wrap';
    var img = document.createElement('img');
    img.className = 'rg-section-img';
    img.src = imgSrc;
    img.alt = item.label;
    imgWrap.appendChild(img);
    body.appendChild(imgWrap);
  } else {
    var noImg = document.createElement('div');
    noImg.className = 'rg-section-rare';
    noImg.innerHTML =
      '<span class="rg-rare-icon">ℹ️</span>' +
      '<span>이 시설은 특정한 상황에만 설치됩니다. 잘 쓰이지 않습니다.</span>';
    body.appendChild(noImg);
  }

  var descs = RG_FACILITY_DESCS[item.id];
  if (descs && descs.length) {
    var descWrap = document.createElement('div');
    descWrap.className = 'rg-facility-desc';
    var ul = document.createElement('ul');
    ul.className = 'rg-acc-desc';
    descs.forEach(function (line) {
      var li = document.createElement('li');
      li.innerHTML = line;
      ul.appendChild(li);
    });
    descWrap.appendChild(ul);
    body.appendChild(descWrap);
  }

  var facilityNote = RG_FACILITY_NOTES[item.id];
  if (facilityNote) {
    var noteBox = document.createElement('div');
    noteBox.className = 'rg-role-note';
    var noteTitleEl = document.createElement('div');
    noteTitleEl.className = 'rg-role-note-title';
    noteTitleEl.innerHTML = '<span class="rg-note-badge">참고</span> ' + facilityNote.noteTitle;
    noteBox.appendChild(noteTitleEl);
    facilityNote.noteItems.forEach(function (ni) {
      var row = document.createElement('div');
      row.className = 'rg-role-item';
      row.innerHTML = '<span class="rg-role-tag">' + ni.tag + '</span>' + ni.text;
      noteBox.appendChild(row);
    });
    body.appendChild(noteBox);
  }

  header.addEventListener('click', function () {
    body.hidden = !body.hidden;
    header.classList.toggle('open', !body.hidden);
  });

  wrap.appendChild(header);
  wrap.appendChild(body);
  c.appendChild(wrap);
}

document.getElementById('open-report-guide').addEventListener('click', function () {
  rgState.mode = 'select';
  showScreen('reportGuide');
  renderReportGuide();
});

document.getElementById('back-from-report-guide').addEventListener('click', function () {
  if (rgState.mode === 'guide') {
    rgState.mode = 'select';
    renderReportGuide();
  } else {
    showScreen('home');
  }
});

document.getElementById('open-contact').addEventListener('click', function () {
  document.getElementById('contact-confirm-modal').classList.remove('hidden');
});

document.getElementById('contact-confirm-cancel').addEventListener('click', function () {
  document.getElementById('contact-confirm-modal').classList.add('hidden');
});

document.getElementById('contact-confirm-modal').addEventListener('click', function (e) {
  if (e.target === this) this.classList.add('hidden');
});

document.getElementById('contact-confirm-ok').addEventListener('click', function () {
  document.getElementById('contact-confirm-modal').classList.add('hidden');
  var isAndroid = /android/i.test(navigator.userAgent);
  var isStandaloneApp = window.matchMedia('(display-mode: standalone)').matches;
  if (isAndroid || isStandaloneApp) {
    window.location.href = 'mailto:carrotcakehope@gmail.com?subject=예방GPT 건의사항';
  } else {
    window.open('https://mail.google.com/mail/?view=cm&fs=1&to=carrotcakehope@gmail.com&su=예방GPT 건의사항', '_blank');
  }
});

(function () {
  var EMAIL = 'carrotcakehope@gmail.com';

  function copyEmail() {
    navigator.clipboard.writeText(EMAIL).then(function () {
      showToast('이메일 주소가 복사됐습니다.');
    }).catch(function () {
      showToast('복사 실패 — 직접 선택 후 복사해주세요.');
    });
  }

  // 복사 버튼
  document.getElementById('contact-copy-btn').addEventListener('click', function (e) {
    e.stopPropagation();
    copyEmail();
  });

  // 안드로이드/앱: 이메일 텍스트 클릭 시 복사
  var emailText = document.getElementById('contact-email-text');
  var isAndroid = /android/i.test(navigator.userAgent);
  var isStandaloneApp = window.matchMedia('(display-mode: standalone)').matches;
  if (isAndroid || isStandaloneApp) {
    emailText.style.cursor = 'pointer';
    emailText.addEventListener('click', copyEmail);
  }
})();

// home-meta를 PATCH_NOTES와 동기화
function renderHomeMeta() {
  var on = localStorage.getItem('devMode') === 'true';
  document.getElementById('home-meta').innerHTML =
    PATCH_NOTES.version + ' / 최종 수정 ' + PATCH_NOTES.date +
    (on ? ' <span class="home-meta-dev">DEV MODE</span>' : '');
}
renderHomeMeta();

// ── 개발자 모드 숨겨진 토글 (버전 5번 탭) ────────────────────────────────
function applyDevMode() {
  var on = localStorage.getItem('devMode') === 'true';
  document.getElementById('open-lab').style.display = on ? '' : 'none';
  renderHomeMeta();
  if (typeof window.syncIlguAssistantAvailability === 'function') {
    window.syncIlguAssistantAvailability();
  }
  if (typeof window.syncIlguSummonButton === 'function') {
    window.syncIlguSummonButton();
  }
}
applyDevMode();

(function () {
  var tapCount = 0;
  var tapTimer = null;
  document.getElementById('home-meta').addEventListener('click', function () {
    tapCount++;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(function () { tapCount = 0; }, 1500);
    if (tapCount >= 5) {
      tapCount = 0;
      var isOn = localStorage.getItem('devMode') === 'true';
      if (isOn) {
        localStorage.removeItem('devMode');
        localStorage.setItem('gaSuppressedUntil', String(Date.now() + 5 * 60 * 1000));
        window['ga-disable-G-LKQZX5YS2H'] = true;
        showToast('개발자 모드 OFF — 실험실 숨김');
      } else {
        localStorage.setItem('devMode', 'true');
        localStorage.removeItem('gaSuppressedUntil');
        window['ga-disable-G-LKQZX5YS2H'] = true;
        showToast('개발자 모드 ON — 실험실 표시됨 🧪');
      }
      applyDevMode();
    }
  });
})();

// ── 패치노트 모달 ────────────────────────────────────────────────────────
(function () {
  var typeLabel = { new: '추가기능', fix: '버그수정', improve: '개선사항', notice: '공지사항' };
  var typeClass = { new: 'pn-tag-new', fix: 'pn-tag-fix', improve: 'pn-tag-improve', notice: 'pn-tag-notice' };

  var itemsHtml = PATCH_NOTES.items.map(function (item) {
    var t = item.type;
    return '<li class="pn-item"><span class="pn-tag ' + (typeClass[t] || '') + '">' + (typeLabel[t] || t) + '</span><span class="pn-text">' + item.text + '</span></li>';
  }).join('');

  var today = todayString();
  var modal = document.getElementById('patch-notes-modal');
  document.getElementById('pn-version').textContent = PATCH_NOTES.version;
  document.getElementById('pn-date').textContent = PATCH_NOTES.date;
  document.getElementById('pn-list').innerHTML = itemsHtml;

  var pnSelfClosing = false;

  function pnIsOpen() { return !modal.classList.contains('hidden'); }

  function openPn() {
    modal.classList.remove('hidden');
    history.pushState({ patchModal: true }, '');
  }

  // 모달 닫기. UI 클릭/네이티브 뒤로가기로 닫을 땐 직접 push한 history 항목을
  // history.back()으로 되감음(웹 popstate로 이미 pop된 경우는 건드리지 않음).
  function closePn() {
    if (!pnIsOpen()) return;
    modal.classList.add('hidden');
    if (history.state && history.state.patchModal) {
      pnSelfClosing = true;
      history.back();
    }
  }

  // 뒤로가기 핸들러(initBackButton)에서 참조
  window._pnIsOpen = pnIsOpen;
  window._pnClose = closePn;
  window._pnConsumeSelfClosing = function () {
    if (pnSelfClosing) { pnSelfClosing = false; return true; }
    return false;
  };

  document.getElementById('pn-close-btn').addEventListener('click', closePn);

  document.getElementById('pn-hide-today-btn').addEventListener('click', function () {
    localStorage.setItem('lastPatchSeen', today);
    closePn();
  });

  // 모달 바깥(오버레이) 클릭 시 닫기 — 확인과 동일
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closePn();
  });

  var lastSeen = localStorage.getItem('lastPatchSeen');
  if (lastSeen !== today) {
    openPn();
  }
})();

// 대상 아코디언으로 스크롤. render 직후엔 레이아웃이 아직 안정되지 않아
// scrollIntoView가 무효일 수 있으므로 약간 지연 후 정렬하고,
// 펼쳐진 아코디언 이미지가 늦게 로드되며 위쪽 높이가 커져 대상이 밀리는 경우를 대비해
// 이미지가 로드될 때마다 위치를 다시 맞춘다.
function scrollToWhenReady(container, el) {
  if (!el) return;
  function align() { el.scrollIntoView({ behavior: 'auto', block: 'start' }); }
  setTimeout(function () {
    align();
    el.classList.add('search-flash');
    setTimeout(function () { el.classList.remove('search-flash'); }, 1600);
    if (!container) return;
    [].slice.call(container.querySelectorAll('img')).forEach(function (img) {
      if (img.complete) return;
      img.addEventListener('load', align, { once: true });
      img.addEventListener('error', align, { once: true });
    });
  }, 60);
}

// 자체점검 가이드의 특정 페이지·아코디언으로 바로 이동
function goToRgGuideSection(tab, sectionId) {
  rgState.mode = 'guide';
  rgState.tab = tab;
  showScreen('reportGuide');
  renderReportGuide();
  scrollToWhenReady(
    document.getElementById('report-guide-content'),
    document.getElementById('rgacc-' + sectionId)
  );
}

// ── 홈 검색 기능 ─────────────────────────────────────────────────
(function initHomeSearch() {
  const SEARCH_ITEMS = [
    {
      icon: "🏗️", title: "소방시설 배치 배우기", desc: "건물 구조 입력 후 소방시설 배치 시각화",
      keywords: ["배치", "배우기", "시각화", "단면도", "레이아웃"],
      action: () => { showScreen("lab"); },
    },
    {
      icon: "🧪", title: "실험실", desc: "앞으로 만들 기능들을 먼저 작업하고 시험하는 공간",
      keywords: ["실험실", "테스트", "개발중", "소방시설 배치 배우기", "배치"],
      action: () => { showScreen("lab"); },
    },
    {
      icon: "🧯", title: "소방시설 탐색기 (간단한 버전)", desc: "현행 법령 기준으로 빠르게 설치 의무 도출",
      keywords: ["탐색기", "소방시설", "간단", "의무", "설치", "소화기", "스프링클러"],
      action: () => { showScreen("explorerSelect"); },
    },
    {
      icon: "🔍", title: "소방시설 탐색기 (자세한 버전)", desc: "건축허가일 기준 법령 적용 상세 결과",
      keywords: ["탐색기", "자세한", "연도별", "건축허가", "법령", "소방시설"],
      action: () => { showScreen("explorerSelect"); },
    },
    {
      icon: "📅", title: "자체점검 제출기한 계산", desc: "점검 완료일로부터 15일 이내 제출기한",
      keywords: ["자체점검", "제출기한", "점검", "날짜", "기한", "보고서"],
      action: () => {
        state.dateCalc.mode = "inspect_report";
        renderDateCalculator();
        showScreen("date");
      },
    },
    {
      icon: "📅", title: "소방안전관리자 선임기한 계산", desc: "해임·퇴직일로부터 선임 및 신고기한 계산",
      keywords: ["소방안전관리자", "선임기한", "신고", "날짜", "해임", "퇴직", "기한"],
      action: () => {
        state.dateCalc.mode = "fire_safety_manager";
        renderDateCalculator();
        showScreen("date");
      },
    },
    {
      icon: "📅", title: "소방안전관리보조자 선임기한 계산", desc: "해임·퇴직일로부터 선임 및 신고기한 계산",
      keywords: ["보조자", "소방안전관리보조자", "선임기한", "신고", "기한"],
      action: () => {
        state.dateCalc.mode = "fire_safety_assistant_manager";
        renderDateCalculator();
        showScreen("date");
      },
    },
    {
      icon: "🧮", title: "소방안전관리보조자 선임인원 계산", desc: "아파트 세대수·연면적으로 필요 인원 계산",
      keywords: ["보조자", "인원", "선임인원", "계산기", "세대", "아파트", "연면적"],
      action: () => {
        occupancyState.tool = "staffing";
        renderOccupancyCalculator();
        showScreen("occupancy");
      },
    },
    {
      icon: "📅", title: "위험물안전관리자 선임기한 계산", desc: "해임·퇴직일로부터 선임 및 신고기한 계산",
      keywords: ["위험물", "위험물안전관리자", "선임기한", "기한", "신고"],
      action: () => {
        state.dateCalc.mode = "hazardous_material_manager";
        renderDateCalculator();
        showScreen("date");
      },
    },
    {
      icon: "📅", title: "부적합 조치기한 계산", desc: "보고일로부터 10일/20일 이행완료 기한",
      keywords: ["부적합", "조치기한", "이행", "10일", "20일", "기한"],
      action: () => {
        state.dateCalc.mode = "noncompliance_action";
        renderDateCalculator();
        showScreen("date");
      },
    },
    {
      icon: "📋", title: "자체점검 가이드", desc: "자체점검 실시결과 보고서 작성·읽기 안내",
      keywords: ["보고서", "읽는법", "자체점검", "작성", "점검표", "가이드"],
      action: () => { showScreen("reportGuide"); },
    },
    {
      icon: "📖", title: "소방시설 도감", desc: "소방시설별 개요·종류·구성·설치기준",
      keywords: ["소방시설", "도감", "설명", "종류", "구성", "설치기준", "유도등", "감지기"],
      action: () => {
        showScreen("facilities");
        if (typeof window.initFacilities === "function") window.initFacilities();
      },
    },
    {
      icon: "🏢", title: "작동·종합 대상 판독기", desc: "작동기능점검·종합정밀점검 대상 판정",
      keywords: ["작동", "종합", "판독기", "점검", "작동기능점검", "종합정밀점검"],
      action: () => {
        inspectionRestart();
        showScreen("inspection");
      },
    },
    {
      icon: "👥", title: "다중이용업소 탐색기", desc: "업종별 다중이용업소 해당 여부 판정",
      keywords: ["다중이용업소", "탐색기", "업종", "해당여부", "노래방", "pc방", "식당"],
      action: () => { multiuseRestart(); showScreen("multiuse"); },
    },
    {
      icon: "🛡", title: "다중이용업소 안전시설 탐색", desc: "다중이용업소에 설치할 안전시설 확인",
      keywords: ["다중이용업소", "안전시설", "설치", "탐색"],
      action: () => {
        explorerRuntime.mode = "multiuse-only";
        applyExplorerModeUI();
        showScreen("explorer");
        restartMultiuseOnly();
      },
    },
    {
      icon: "🧮", title: "수용인원 계산기", desc: "용도별 법정 수용인원 산정",
      keywords: ["수용인원", "계산기", "면적", "용도", "강의실", "숙박", "유틸리티", "도구함"],
      action: () => {
        occupancyState.tool = "occupancy";
        occupancyState.step = "category";
        occupancyState.type = "lodging_bed";
        occupancyState.values = {};
        renderOccupancyCalculator();
        showScreen("occupancy");
      },
    },
  ];

  // ── 참고 박스·도감 항목을 검색 색인에 자동 편입 ──
  const stripTags = (html) => String(html || "").replace(/<[^>]*>/g, " ");

  function buildRgEntries(tab, pageLabel, sections) {
    const entries = [];
    sections.forEach((sec) => {
      const ctx = "자체점검 가이드 " + pageLabel + " · " + sec.label;
      const base = [sec.label, ...(sec.desc || []).map(stripTags)];
      // 항목(필드) 자체
      entries.push({
        icon: "📋", title: sec.label, desc: ctx,
        keywords: base,
        action: () => goToRgGuideSection(tab, sec.id),
      });
      // 참고 박스(noteItems / noteTable / extraNotes)를 개별 검색 항목으로
      const groups = [];
      if (sec.noteItems && sec.noteItems.length) {
        groups.push({ title: sec.noteTitle || "구분", items: sec.noteItems });
      }
      if (sec.noteTable) {
        groups.push({ title: sec.noteTable.title, rows: sec.noteTable.rows });
      }
      (sec.extraNotes || []).forEach((n) => groups.push({ title: n.title || "구분", items: n.items }));

      groups.forEach((g) => {
        const kw = [g.title, sec.label];
        (g.items || []).forEach((it) => { kw.push(it.tag); kw.push(stripTags(it.text)); });
        (g.rows || []).forEach((row) => row.forEach((cell) => kw.push(stripTags(cell))));
        entries.push({
          icon: "📋", title: g.title, desc: ctx,
          keywords: kw,
          action: () => goToRgGuideSection(tab, sec.id),
        });
      });
    });
    return entries;
  }

  function buildFacilityEntries() {
    if (typeof FACILITIES_DATA === "undefined") return [];
    const entries = [];
    FACILITIES_DATA.forEach((tab, idx) => {
      (tab.items || []).forEach((item) => {
        const kw = [item.name, item.category, stripTags(item.definition), stripTags(item.description), tab.tabLabel];
        (item.types || []).forEach((t) => { kw.push(t.name); kw.push(stripTags(t.desc)); });
        (item.components || []).forEach((c) => { kw.push(c.name); kw.push(stripTags(c.desc)); });
        (item.criteria || []).forEach((s) => kw.push(stripTags(s)));
        (item.usage || []).forEach((s) => kw.push(stripTags(s)));
        (item.storage || []).forEach((s) => kw.push(stripTags(s)));
        (item.inspection || []).forEach((s) => kw.push(stripTags(s)));
        (item.tips || []).forEach((s) => kw.push(stripTags(s)));
        entries.push({
          icon: "📖", title: item.name, desc: (item.category ? item.category + " · " : "") + "소방시설 도감",
          keywords: kw.filter(Boolean),
          action: () => { if (typeof window.openFacilityItem === "function") window.openFacilityItem(idx, item.id); },
        });
      });

      // 탭 상단 intro(수계 공통 구성요소 / 비교표 등)도 색인
      const intro = tab.intro;
      if (intro) {
        if (intro.type === "components" && (intro.components || []).length) {
          // 수계 공통 구성요소: 항목 내 접힘 패널로 이동(없으면 intro 카드로)
          const waterItem = (tab.items || []).find((it) => it.showWaterSystemComponents);
          const nav = waterItem
            ? () => { if (typeof window.openFacilityWaterComp === "function") window.openFacilityWaterComp(idx, waterItem.id); }
            : () => { if (typeof window.openFacilityIntro === "function") window.openFacilityIntro(idx); };
          intro.components.forEach((c) => {
            entries.push({
              icon: "📖", title: c.name, desc: intro.title + " · 소방시설 도감",
              keywords: [c.name, stripTags(c.desc), c.analogy, intro.title, tab.tabLabel].filter(Boolean),
              action: nav,
            });
          });
          entries.push({
            icon: "📖", title: intro.title, desc: "소방시설 도감",
            keywords: [intro.title, stripTags(intro.description), tab.tabLabel].filter(Boolean),
            action: nav,
          });
        } else {
          // 비교표 등: 탭 상단 intro 카드로 이동
          const kw = [intro.title, stripTags(intro.description), tab.tabLabel];
          (intro.headers || []).forEach((h) => kw.push(h));
          (intro.rows || []).forEach((r) => r.forEach((cell) => kw.push(stripTags(cell))));
          entries.push({
            icon: "📖", title: intro.title, desc: "소방시설 도감",
            keywords: kw.filter(Boolean),
            action: () => { if (typeof window.openFacilityIntro === "function") window.openFacilityIntro(idx); },
          });
        }
      }
    });
    return entries;
  }

  let dynamicItems = null;
  function getAllSearchItems() {
    if (!dynamicItems) {
      dynamicItems = [].concat(
        buildRgEntries("page1", "1페이지", RG_PAGE1_SECTIONS),
        buildRgEntries("page2", "2페이지", RG_PAGE2_SECTIONS),
        buildFacilityEntries()
      );
    }
    return SEARCH_ITEMS.concat(dynamicItems);
  }

  const input = document.getElementById("home-search-input");
  const clearBtn = document.getElementById("home-search-clear");
  const resultsList = document.getElementById("home-search-results");
  let focusedIndex = -1;

  function highlight(text, query) {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return text.replace(new RegExp(`(${escaped})`, "gi"), "<mark>$1</mark>");
  }

  // 제목에 검색어가 없을 때 "왜 걸렸는지" 보여줄 매칭 조각
  function matchSnippet(item, q) {
    if (String(item.title).toLowerCase().includes(q)) return null;
    let best = null;
    item.keywords.forEach((kw) => {
      const k = String(kw);
      const idx = k.toLowerCase().indexOf(q);
      if (idx === -1) return;
      if (best === null || k.length < best.text.length) best = { text: k, idx };
    });
    if (!best) return null;
    const text = best.text;
    if (text.length <= 40) return text;
    let start = Math.max(0, best.idx - 12);
    let end = Math.min(text.length, best.idx + q.length + 24);
    let snip = text.slice(start, end);
    if (start > 0) snip = "…" + snip;
    if (end < text.length) snip = snip + "…";
    return snip;
  }

  function renderResults(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      resultsList.classList.add("hidden");
      return;
    }

    const matched = getAllSearchItems().filter(item => {
      const haystack = [item.title, item.desc, ...item.keywords].join(" ").toLowerCase();
      return haystack.includes(q);
    });

    if (matched.length === 0) {
      resultsList.innerHTML = `<li class="hsr-empty">검색 결과가 없습니다</li>`;
    } else {
      resultsList.innerHTML = matched.map((item, i) => {
        const snippet = matchSnippet(item, q);
        const matchLine = snippet
          ? `<span class="hsr-match">↳ ${highlight(snippet, query.trim())}</span>`
          : "";
        return `
        <li class="hsr-item" data-index="${i}" tabindex="-1">
          <span class="hsr-icon mc-${iconColor(item.icon)}">${item.icon}</span>
          <span class="hsr-text">
            <span class="hsr-title">${highlight(item.title, query.trim())}</span>
            <span class="hsr-desc">${item.desc}</span>
            ${matchLine}
          </span>
          <span class="hsr-arrow">›</span>
        </li>
      `;
      }).join("");

      resultsList.querySelectorAll(".hsr-item").forEach((el, i) => {
        el.addEventListener("mousedown", (e) => {
          e.preventDefault();
          navigate(matched[i]);
        });
      });
    }

    focusedIndex = -1;
    resultsList.classList.remove("hidden");
  }

  function iconColor(icon) {
    const map = { "🏗️": "blue", "🧪": "blue", "🧯": "red", "🔍": "red", "📅": "blue", "📋": "amber",
                  "⚙️": "purple", "🏢": "amber", "👥": "green", "🛡": "green", "🧮": "amber" };
    return map[icon] || "red";
  }

  function navigate(item) {
    input.value = "";
    clearBtn.classList.add("hidden");
    resultsList.classList.add("hidden");
    input.blur();
    item.action();
  }

  function moveFocus(dir) {
    const items = resultsList.querySelectorAll(".hsr-item");
    if (!items.length) return;
    items[focusedIndex]?.classList.remove("focused");
    focusedIndex = (focusedIndex + dir + items.length) % items.length;
    items[focusedIndex].classList.add("focused");
    items[focusedIndex].scrollIntoView({ block: "nearest" });
  }

  input.addEventListener("input", () => {
    const val = input.value;
    clearBtn.classList.toggle("hidden", !val);
    renderResults(val);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); moveFocus(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); moveFocus(-1); }
    else if (e.key === "Enter") {
      const matched = SEARCH_ITEMS.filter(item => {
        const q = input.value.trim().toLowerCase();
        return [item.title, item.desc, ...item.keywords].join(" ").toLowerCase().includes(q);
      });
      if (focusedIndex >= 0 && matched[focusedIndex]) navigate(matched[focusedIndex]);
      else if (matched.length === 1) navigate(matched[0]);
    }
    else if (e.key === "Escape") { resultsList.classList.add("hidden"); input.blur(); }
  });

  input.addEventListener("blur", () => {
    setTimeout(() => resultsList.classList.add("hidden"), 150);
  });

  input.addEventListener("focus", () => {
    if (input.value.trim()) renderResults(input.value);
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    clearBtn.classList.add("hidden");
    resultsList.classList.add("hidden");
    input.focus();
  });
})();

(function initIlguAssistant() {
  const SHEET = "./assets/pets/mailpup/spritesheet.webp";
  const RUNNING_SHEET = "./assets/pets/mailpup/references/running.png";
  const SALUTING_SHEET = "./assets/pets/mailpup/references/saluting.png";
  const EATING_SHEET = "./assets/pets/mailpup/references/eating.png";
  const STUDYING_SHEET = "./assets/pets/mailpup/references/studying.png";
  const DANCING_SHEET = "./assets/pets/mailpup/references/dancing.png";
  const PUSHUP_SHEET = "./assets/pets/mailpup/references/pushup.png";
  const SLEEPING_SHEET = "./assets/pets/mailpup/references/sleeping.png";
  const CELL_W = 96;
  const CELL_H = 104;
  const RUNNING_CELL_W = 118;
  const RUNNING_CELL_H = 118;
  const SALUTING_CELL_W = 118;
  const SALUTING_CELL_H = 118;
  const EATING_CELL_W = 118;
  const EATING_CELL_H = 118;
  const STUDYING_CELL_W = 118;
  const STUDYING_CELL_H = 118;
  const DANCING_CELL_W = 118;
  const DANCING_CELL_H = 118;
  const PUSHUP_CELL_W = 118;
  const PUSHUP_CELL_H = 118;
  const SLEEPING_CELL_W = 144;
  const SLEEPING_CELL_H = 144;
  const SLEEPING_RENDER_SCALE = 118 / 144;
  const MIN_PET_SCALE = 0.7;
  const MAX_PET_SCALE = 2;
  const MOBILE_MEDIA = "(max-width: 768px)";
  const MOBILE_DEVICE_RE = /Android|iPhone|iPad|iPod|Mobile/i;
  const states = {
    idle: { row: 0, frames: 6, ms: 260 },
    "running-right": { row: 0, frames: 4, ms: 210, sheet: RUNNING_SHEET, frameW: RUNNING_CELL_W, frameH: RUNNING_CELL_H, flip: true },
    "running-left": { row: 0, frames: 4, ms: 210, sheet: RUNNING_SHEET, frameW: RUNNING_CELL_W, frameH: RUNNING_CELL_H },
    saluting: { row: 0, frames: 4, ms: 220, sheet: SALUTING_SHEET, frameW: SALUTING_CELL_W, frameH: SALUTING_CELL_H },
    eating: { row: 0, frames: 4, ms: 240, sheet: EATING_SHEET, frameW: EATING_CELL_W, frameH: EATING_CELL_H },
    studying: { row: 0, frames: 4, ms: 240, sheet: STUDYING_SHEET, frameW: STUDYING_CELL_W, frameH: STUDYING_CELL_H },
    dancing: { row: 0, frames: 8, ms: 240, sheet: DANCING_SHEET, frameW: DANCING_CELL_W, frameH: DANCING_CELL_H, cols: 4, rows: 2 },
    pushup: { row: 0, frames: 8, ms: 140, sheet: PUSHUP_SHEET, frameW: PUSHUP_CELL_W, frameH: PUSHUP_CELL_H, cols: 4, rows: 2, loops: 4 },
    sleeping: { row: 0, frames: 12, ms: 200, sheet: SLEEPING_SHEET, frameW: SLEEPING_CELL_W, frameH: SLEEPING_CELL_H, cols: 4, rows: 3, loops: 2, renderScale: SLEEPING_RENDER_SCALE },
    waving: { row: 3, frames: 4, ms: 220 },
    jumping: { row: 4, frames: 5, ms: 190 },
    failed: { row: 5, frames: 8, ms: 220 },
    waiting: { row: 6, frames: 6, ms: 260 },
    running: { row: 7, frames: 6, ms: 160 },
    review: { row: 8, frames: 6, ms: 240 },
  };
  const text = {
    kicker: "ILGU ASSISTANT",
    title: "\uc77c\uad6c \ub3c4\uc6b0\ubbf8",
    intro: "\ud544\uc694\ud558\uba74 \uc5b8\uc81c\ub4e0 \ubd88\ub7ec\uc8fc\uc138\uc694. \uc228\uae30\uae30\ub97c \ub204\ub974\uba74 \uc77c\uad6c\uac00 \uc9d1\uc5d0 \uc26c\ub7ec \ub3cc\uc544\uac00\uc694. \uc77c\uad6c\ub97c \ub354\ube14\ud074\ub9ad\ud558\uba74 \uba54\uc778\ud654\uba74\uc73c\ub85c \ub3cc\uc544\uac08 \uc218 \uc788\uc5b4\uc694.",
    search: "\uae30\ub2a5 \ucc3e\uae30",
    guide: "\uc774\uc6a9 \uc548\ub0b4",
    contact: "\ubb38\uc758\ud558\uae30",
    hide: "\uc228\uae30\uae30",
    open: "\ubc14\ub85c \uc5f4\uae30",
    close: "\ub2eb\uae30",
    homeConfirmTitle: "\uba54\uc778\ud654\uba74\uc73c\ub85c \ub3cc\uc544\uac08\uae4c\uc694?",
    homeConfirmBody: "\uc9c0\uae08 \ubcf4\ub358 \ud654\uba74\uc744 \ub2eb\uace0 \uba54\uc778\ud654\uba74\uc73c\ub85c \uc774\ub3d9\ud569\ub2c8\ub2e4.",
    homeConfirmCancel: "\uc544\ub2c8\uc694",
    homeConfirmOk: "\ub3cc\uc544\uac00\uae30",
    droppedTitle: "\uc774 \uae30\ub2a5\uc740 \uc774\ub807\uac8c \uc368\uc694",
  };
  const helpById = {
    "open-explorer": { title: "\uc18c\ubc29\uc2dc\uc124 \ud0d0\uc0c9\uae30", body: "\uac74\ubb3c \uc815\ubcf4\ub97c \uc785\ub825\ud574 \ud544\uc694\ud55c \uc18c\ubc29\uc2dc\uc124\uc744 \ube60\ub974\uac8c \ud655\uc778\ud558\ub294 \uacf5\uac04\uc774\uc5d0\uc694." },
    "open-multiuse-decoder": { title: "\ub2e4\uc911\uc774\uc6a9\uc5c5\uc18c \ud0d0\uc0c9\uae30", body: "\uc5c5\uc885\uacfc \uc0c1\ud669\uc744 \ub530\ub77c \ub2e4\uc911\uc774\uc6a9\uc5c5\uc18c \ud574\ub2f9 \uc5ec\ubd80\uc640 \ud544\uc694 \uc548\uc804\uc2dc\uc124\uc744 \ud655\uc778\ud574\uc694." },
    "open-date-calculator": { title: "\ubc95\uc815\uae30\ud55c \uacc4\uc0b0\uae30", body: "\uc790\uccb4\uc810\uac80, \uc120\uc784, \ubd80\uc801\ud569 \uc870\uce58\ucc98\ub7fc \ub0a0\uc9dc \uae30\uc900\uc774 \uc911\uc694\ud55c \uae30\ud55c\uc744 \uacc4\uc0b0\ud574\uc694." },
    "open-report-guide": { title: "\uc790\uccb4\uc810\uac80 \uac00\uc774\ub4dc", body: "\uc790\uccb4\uc810\uac80 \ubcf4\uace0\uc11c\ub97c \uc5b4\ub5bb\uac8c \uc77d\uace0 \uc791\uc131\ud560\uc9c0 \ud55c \ubc88\uc5d0 \ubcf4\ub294 \uc548\ub0b4\uc5d0\uc694." },
    "open-facilities": { title: "\uc18c\ubc29\uc2dc\uc124 \uc0ac\uc804", body: "\uc18c\ubc29\uc2dc\uc124\uc758 \uc885\ub958, \uad6c\uc131, \uc124\uce58 \uae30\uc900\uc744 \uae30\ub2a5\ubcc4\ub85c \ud655\uc778\ud558\ub294 \uc790\ub8cc\uc2e4\uc774\uc5d0\uc694." },
    "open-occupancy-calculator": { title: "\uc720\ud2f8\ub9ac\ud2f0 \uacf5\uad6c\ud568", body: "\uc218\uc6a9\uc778\uc6d0\uacfc \uc18c\ubc29\uc548\uc804\uad00\ub9ac\ubcf4\uc870\uc790 \ud544\uc694 \uc778\uc6d0\ucc98\ub7fc \uc791\uc740 \uacc4\uc0b0\uc744 \ubaa8\uc544\ub454 \uacf3\uc774\uc5d0\uc694." },
    "open-lab": { title: "\uc2e4\ud5d8\uc2e4", body: "\uc544\uc9c1 \uc900\ube44 \uc911\uc778 \uae30\ub2a5\uc744 \uba3c\uc800 \ub9cc\uc838\ubcf4\ub294 \uacf5\uac04\uc774\uc5d0\uc694." },
    "open-install-guide": { title: "\ubc14\ub85c\uac00\uae30 \ucd94\uac00", body: "\uc790\uc8fc \uc4f0\ub294 \uae30\uae30\uc5d0 \uc571\ucc98\ub7fc \uc5f4 \uc218 \uc788\uac8c \ud648 \ud654\uba74\uc774\ub098 \ubc14\ud0d5\ud654\uba74\uc5d0 \ucd94\uac00\ud558\ub294 \uc548\ub0b4\uc5d0\uc694." },
    "open-guide": { title: "\uc0ac\uc6a9 \uc548\ub0b4", body: "\uc0ac\uc774\ud2b8\uc758 \uae30\ubcf8 \uc0ac\uc6a9\ubc95\uacfc \uc8fc\uc694 \uae30\ub2a5\uc744 \uc9e7\uac8c \ud655\uc778\ud560 \uc218 \uc788\uc5b4\uc694." },
    "open-contact": { title: "\uac1c\ubc1c\uc790\uc5d0\uac8c \ubb38\uc758", body: "\uc624\ub958, \uac1c\uc120 \uc81c\uc548, \ucd94\uac00\ud558\uace0 \uc2f6\uc740 \uae30\ub2a5\uc744 \uba54\uc77c\ub85c \ubcf4\ub0b4\ub294 \uc785\uad6c\uc5d0\uc694." },
  };

  function isDesktopDevModeEnabled() {
    const isMobile = window.matchMedia(MOBILE_MEDIA).matches || MOBILE_DEVICE_RE.test(navigator.userAgent);
    return !isMobile;
  }

  const shouldShowAtStart = isDesktopDevModeEnabled() &&
    localStorage.getItem("ilguAssistantDisabled") !== "true" &&
    localStorage.getItem("ilguAssistantVisible") === "true";

  window.addEventListener("appinstalled", function () {
    localStorage.setItem("ilguAssistantVisible", "true");
    localStorage.removeItem("ilguAssistantDisabled");
  });

  if (document.getElementById("ilgu-assistant")) return;

  const root = document.createElement("div");
  root.id = "ilgu-assistant";
  root.className = "ilgu-assistant";
  root.innerHTML =
    '<div class="ilgu-assistant-panel" role="dialog" aria-live="polite">' +
      '<div class="ilgu-panel-kicker">' + text.kicker + '</div>' +
      '<h2 class="ilgu-panel-title"></h2>' +
      '<p class="ilgu-panel-text"></p>' +
      '<div class="ilgu-panel-actions"></div>' +
    '</div>' +
    '<button class="ilgu-pet-button" type="button" aria-label="Ilgu assistant">' +
      '<span class="ilgu-pet-sprite"></span>' +
      '<span class="ilgu-resize-handle" aria-hidden="true" title="크기 조절"></span>' +
    '</button>';
  document.body.appendChild(root);

  const sprite = root.querySelector(".ilgu-pet-sprite");
  const button = root.querySelector(".ilgu-pet-button");
  const resizeHandle = root.querySelector(".ilgu-resize-handle");
  const panelTitle = root.querySelector(".ilgu-panel-title");
  const panelText = root.querySelector(".ilgu-panel-text");
  const panelActions = root.querySelector(".ilgu-panel-actions");
  let currentState = "idle";
  let frame = 0;
  let timer = null;
  let suppressClick = false;
  let activeTarget = null;
  let petScale = 1;
  let transitionMode = null;
  let transitionToken = 0;
  let panelAutoCloseTimer = null;

  sprite.style.backgroundImage = 'url("' + SHEET + '")';
  applyPetScale(readPetScale());

  const savedPos = readPosition();
  if (savedPos) setPosition(savedPos.x, savedPos.y);
  if (!shouldShowAtStart) root.style.display = "none";

  function syncAvailability() {
    const allowed = isDesktopDevModeEnabled();
    if (!allowed) {
      closePanel();
      root.style.display = "none";
      setState("idle");
      return false;
    }

    if (localStorage.getItem("ilguAssistantDisabled") === "true") {
      closePanel();
      root.style.display = "none";
      setState("idle");
      return true;
    }

    if (localStorage.getItem("ilguAssistantVisible") !== "true") {
      closePanel();
      root.style.display = "none";
      setState("idle");
      return true;
    }

    root.style.display = "flex";
    return true;
  }

  window.syncIlguAssistantAvailability = syncAvailability;
  syncAvailability();

  function readPosition() {
    try { return JSON.parse(localStorage.getItem("ilguAssistantPosition") || "null"); }
    catch { return null; }
  }

  function readPetScale() {
    const value = Number(localStorage.getItem("ilguAssistantScale") || "1");
    if (!Number.isFinite(value)) return 1;
    return Math.max(MIN_PET_SCALE, Math.min(value, MAX_PET_SCALE));
  }

  function applyPetScale(scale) {
    petScale = Math.max(MIN_PET_SCALE, Math.min(scale, MAX_PET_SCALE));
    root.style.setProperty("--ilgu-pet-scale", String(petScale));
    root.style.setProperty("--ilgu-pet-button-w", (82 * petScale) + "px");
    root.style.setProperty("--ilgu-pet-button-h", (88 * petScale) + "px");
    root.style.setProperty("--ilgu-sprite-scale", String(0.8 * petScale));
  }

  function savePetScale() {
    localStorage.setItem("ilguAssistantScale", String(Math.round(petScale * 100) / 100));
  }

  function setPosition(x, y) {
    const btnLeft = button.offsetLeft;
    const btnW = button.offsetWidth;
    const minX = 8 - btnLeft;
    const maxX = window.innerWidth - 8 - btnLeft - btnW;
    const maxY = window.innerHeight - root.offsetHeight - 8;
    root.style.left = Math.max(minX, Math.min(x, maxX)) + "px";
    root.style.top = Math.max(8, Math.min(y, maxY)) + "px";
    root.style.right = "auto";
    root.style.bottom = "auto";
    updatePanelPlacement();
  }

  function updatePanelPlacement() {
    const buttonRect = button.getBoundingClientRect();
    const panelWidth = Math.min(282, Math.max(0, window.innerWidth - 112));
    root.classList.toggle("panel-right", buttonRect.left < panelWidth + 16);
  }

  function savePosition() {
    if (!root.style.left || !root.style.top) return;
    localStorage.setItem("ilguAssistantPosition", JSON.stringify({
      x: parseFloat(root.style.left),
      y: parseFloat(root.style.top),
    }));
  }

  function saveCurrentPosition() {
    const rect = root.getBoundingClientRect();
    localStorage.setItem("ilguAssistantPosition", JSON.stringify({
      x: rect.left,
      y: rect.top,
    }));
  }

  function setState(name, options) {
    if (transitionMode && !(options && options.force)) return;
    if (!states[name]) name = "idle";
    currentState = name;
    frame = 0;
    clearInterval(timer);
    paintFrame();
    const stateMs = states[currentState].ms;
    let loopsDone = 0;
    timer = setInterval(function () {
      const state = states[currentState];
      if (state.holdLast && frame >= state.frames - 1) return;
      const next = (frame + 1) % state.frames;
      if (next < frame) {
        loopsDone++;
        if (state.loops && loopsDone >= state.loops) {
          clearInterval(timer);
          timer = null;
          setState("idle");
          return;
        }
      }
      frame = next;
      paintFrame();
    }, stateMs);
  }

  function paintFrame() {
    const state = states[currentState];
    const frameW = state.frameW || CELL_W;
    const frameH = state.frameH || CELL_H;
    const sheet = state.sheet || SHEET;
    const cols = state.cols || state.frames;
    const rows = state.rows || 1;
    const frameCol = frame % cols;
    const frameRow = state.row + Math.floor(frame / cols);
    sprite.style.width = frameW + "px";
    sprite.style.height = frameH + "px";
    sprite.style.backgroundImage = 'url("' + sheet + '")';
    sprite.style.backgroundSize = state.sheet ? (frameW * cols) + "px " + (frameH * rows) + "px" : "";
    sprite.style.transform = (state.flip ? "scaleX(-1) " : "") + "scale(var(--ilgu-sprite-scale)) scale(" + (state.renderScale || 1) + ")";
    sprite.style.backgroundPosition = (-frameCol * frameW) + "px " + (-frameRow * frameH) + "px";
  }

  function setStateIfChanged(name) {
    if (transitionMode) return;
    if (currentState !== name) setState(name);
  }

  function holdStateFrame(name, frameIndex, options) {
    if (transitionMode && !(options && options.force)) return;
    if (!states[name]) name = "idle";
    currentState = name;
    frame = Math.max(0, Math.min(frameIndex, states[name].frames - 1));
    clearInterval(timer);
    paintFrame();
  }

  function clearPanelAutoClose() {
    if (panelAutoCloseTimer) {
      clearTimeout(panelAutoCloseTimer);
      panelAutoCloseTimer = null;
    }
  }

  function closePanel() {
    clearPanelAutoClose();
    root.classList.remove("is-open");
  }

  function schedulePanelAutoClose() {
    clearPanelAutoClose();
    panelAutoCloseTimer = setTimeout(function () {
      closePanel();
    }, 15000);
  }

  function openPanel(title, body, actions) {
    panelTitle.textContent = title;
    panelText.textContent = body;
    panelActions.innerHTML = "";
    actions.forEach(function (action) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ilgu-panel-action" + (action.primary ? " primary" : "");
      btn.textContent = action.label;
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        clearPanelAutoClose();
        action.onClick();
      });
      panelActions.appendChild(btn);
    });
    updatePanelPlacement();
    root.classList.add("is-open");
    schedulePanelAutoClose();
  }

  const MAIN_MENU_JUMPS = [
    { id: "open-explorer", short: "소방시설 탐색기" },
    { id: "open-multiuse-decoder", short: "다중이용업소 탐색기" },
    { id: "open-date-calculator", short: "법정기한 계산기" },
    { id: "open-report-guide", short: "자체점검 가이드" },
    { id: "open-facilities", short: "소방시설 도감" },
    { id: "open-occupancy-calculator", short: "유틸리티 도구함" },
  ];

  function openMenuJumpPanel() {
    setState("waving");
    const actions = MAIN_MENU_JUMPS.map(function (m) {
      return {
        label: m.short,
        onClick: function () {
          closePanel();
          document.getElementById(m.id)?.click();
        }
      };
    });
    actions.push({ label: "← 뒤로", onClick: openHomePanel });
    openPanel("어디로 갈까요?", "메뉴를 선택하면 바로 이동해요.", actions);
  }

  function openHomePanel() {
    setState("waving");
    openPanel(text.title, text.intro, [
      { label: text.search, onClick: focusSearch },
      { label: "메뉴 이동", onClick: openMenuJumpPanel },
      { label: text.guide, onClick: function () { closePanel(); showScreen("guide"); } },
      { label: text.contact, onClick: function () { closePanel(); document.getElementById("open-contact")?.click(); } },
      { label: text.hide, onClick: hideAssistant },
    ]);
  }

  function focusSearch() {
    closePanel();
    showScreen("home");
    setTimeout(function () {
      const input = document.getElementById("home-search-input");
      input?.focus();
    }, 80);
  }

  let leaveTimer = null;
  let enterTimer = null;

  function cancelLeaving() {
    if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; }
    if (transitionMode === "leaving") transitionMode = null;
    root.classList.remove("is-leaving");
    const existing = root.querySelector(".ilgu-house");
    if (existing) existing.remove();
  }

  function cancelEntering() {
    if (enterTimer) { clearTimeout(enterTimer); enterTimer = null; }
    if (transitionMode === "entering") transitionMode = null;
    root.classList.remove("is-entering");
    const existing = root.querySelector(".ilgu-house");
    if (existing) existing.remove();
  }

  function playEnteringAnimation(onDone) {
    cancelEntering();
    cancelLeaving();
    if (typeof stopWander === "function") { try { stopWander(); } catch {} }
    cancelPetThrow();
    behaviorMode = "idle";
    transitionMode = "entering";
    const token = ++transitionToken;
    holdStateFrame("saluting", 2, { force: true });
    const house = document.createElement("div");
    house.className = "ilgu-house";
    house.textContent = "🏠";
    house.setAttribute("aria-hidden", "true");
    root.appendChild(house);
    root.classList.add("is-entering");
    enterTimer = setTimeout(function () {
      if (transitionMode !== "entering" || token !== transitionToken) return;
      root.classList.remove("is-entering");
      house.remove();
      enterTimer = null;
      holdStateFrame("saluting", 2, { force: true });
      transitionMode = null;
      setTimeout(function () {
        if (token === transitionToken) setState("idle");
      }, 800);
      onDone();
    }, 1500);
  }

  function playLeavingAnimation(onDone) {
    cancelLeaving();
    if (typeof stopWander === "function") { try { stopWander(); } catch {} }
    cancelPetThrow();
    behaviorMode = "idle";
    transitionMode = "leaving";
    const token = ++transitionToken;
    setState("failed", { force: true });
    const house = document.createElement("div");
    house.className = "ilgu-house";
    house.textContent = "🏠";
    house.setAttribute("aria-hidden", "true");
    root.appendChild(house);
    root.classList.add("is-leaving");
    leaveTimer = setTimeout(() => {
      if (transitionMode !== "leaving" || token !== transitionToken) return;
      root.classList.remove("is-leaving");
      house.remove();
      leaveTimer = null;
      transitionMode = null;
      onDone();
    }, 1500);
  }

  function hideAssistant() {
    cancelEntering();
    localStorage.setItem("ilguAssistantDisabled", "true");
    localStorage.removeItem("ilguAssistantVisible");
    closePanel();
    saveCurrentPosition();
    playLeavingAnimation(() => {
      root.style.display = "none";
      setState("idle");
    });
  }

  function showCardHelp(card) {
    const info = helpById[card.id];
    if (!info) return;
    setState("review");
    openPanel(info.title || text.droppedTitle, info.body, [
      { label: text.open, primary: true, onClick: function () { closePanel(); card.click(); } },
      { label: text.close, onClick: function () { closePanel(); setState("idle"); } },
    ]);
  }

  function clearDropTarget() {
    if (activeTarget) activeTarget.classList.remove("ilgu-drop-target");
    activeTarget = null;
  }

  function findDropTarget(x, y) {
    root.style.pointerEvents = "none";
    const target = document.elementFromPoint(x, y);
    root.style.pointerEvents = "";
    return target?.closest?.(".menu-card, .shortcut-add-btn");
  }

  let drag = null;
  let resizeDrag = null;
  let throwRAF = null;

  function cancelPetThrow() {
    if (throwRAF) cancelAnimationFrame(throwRAF);
    throwRAF = null;
    root.classList.remove("throwing");
  }

  function glideAfterDrop(vx, vy, onDone) {
    const speed = Math.hypot(vx, vy);
    if (speed < 0.05) {
      onDone();
      return;
    }

    cancelPetThrow();
    root.classList.add("throwing");
    setStateIfChanged(vx >= 0 ? "running-right" : "running-left");

    let x = root.getBoundingClientRect().left;
    let y = root.getBoundingClientRect().top;
    let dx = Math.max(-0.48, Math.min(vx * 0.42, 0.48));
    let dy = Math.max(-0.42, Math.min(vy * 0.36, 0.42));
    let last = performance.now();

    const step = function (now) {
      const dt = Math.min(32, now - last);
      last = now;
      x += dx * dt;
      y += dy * dt;
      setPosition(x, y);

      dx *= Math.pow(0.92, dt / 16);
      dy *= Math.pow(0.92, dt / 16);

      if (Math.hypot(dx, dy) < 0.025) {
        throwRAF = null;
        root.classList.remove("throwing");
        savePosition();
        onDone();
        return;
      }
      throwRAF = requestAnimationFrame(step);
    };
    throwRAF = requestAnimationFrame(step);
  }

  button.addEventListener("pointerdown", function (event) {
    if (resizeDrag) return;
    stopWander();
    cancelPetThrow();
    drag = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      rootX: root.getBoundingClientRect().left,
      rootY: root.getBoundingClientRect().top,
      lastX: event.clientX,
      lastY: event.clientY,
      lastT: performance.now(),
      vx: 0,
      vy: 0,
      moved: false,
    };
    button.setPointerCapture(event.pointerId);
  });

  button.addEventListener("pointermove", function (event) {
    if (!drag || drag.id !== event.pointerId) return;
    const now = performance.now();
    const dt = Math.max(1, now - drag.lastT);
    drag.vx = (event.clientX - drag.lastX) / dt;
    drag.vy = (event.clientY - drag.lastY) / dt;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.lastT = now;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (Math.abs(dx) + Math.abs(dy) > 8) drag.moved = true;
    if (!drag.moved) return;
    suppressClick = true;
    root.classList.add("dragging");
    closePanel();
    if (event.movementX > 0.3) setStateIfChanged("running-right");
    else if (event.movementX < -0.3) setStateIfChanged("running-left");
    setPosition(drag.rootX + dx, drag.rootY + dy);
    const target = findDropTarget(event.clientX, event.clientY);
    if (target !== activeTarget) {
      clearDropTarget();
      if (target && helpById[target.id]) {
        activeTarget = target;
        activeTarget.classList.add("ilgu-drop-target");
      }
    }
  });

  button.addEventListener("pointerup", function (event) {
    if (!drag || drag.id !== event.pointerId) return;
    button.releasePointerCapture(event.pointerId);
    root.classList.remove("dragging");
    const target = activeTarget;
    clearDropTarget();
    savePosition();
    const wasMoved = drag.moved;
    const release = drag;
    drag = null;
    if (wasMoved && target) {
      glideAfterDrop(release.vx, release.vy, function () { showCardHelp(target); });
    } else if (wasMoved) {
      glideAfterDrop(release.vx, release.vy, function () { setState("idle"); });
    }
    if (wasMoved) wanderPauseUntil = Date.now() + 10000;
    setTimeout(function () { suppressClick = false; }, 0);
  });

  resizeHandle.addEventListener("pointerdown", function (event) {
    event.preventDefault();
    event.stopPropagation();
    stopWander();
    cancelPetThrow();
    closePanel();
    suppressClick = true;
    resizeDrag = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startScale: petScale,
      rootX: root.getBoundingClientRect().left,
      rootY: root.getBoundingClientRect().top,
    };
    resizeHandle.setPointerCapture(event.pointerId);
  });

  resizeHandle.addEventListener("pointermove", function (event) {
    if (!resizeDrag || resizeDrag.id !== event.pointerId) return;
    const delta = ((event.clientX - resizeDrag.startX) + (event.clientY - resizeDrag.startY)) / 170;
    const nextScale = Math.max(MIN_PET_SCALE, Math.min(resizeDrag.startScale + delta, MAX_PET_SCALE));
    applyPetScale(nextScale);
    setPosition(resizeDrag.rootX, resizeDrag.rootY);
  });

  resizeHandle.addEventListener("pointerup", function (event) {
    if (!resizeDrag || resizeDrag.id !== event.pointerId) return;
    resizeHandle.releasePointerCapture(event.pointerId);
    savePetScale();
    savePosition();
    resizeDrag = null;
    wanderPauseUntil = Date.now() + 5000;
    setTimeout(function () { suppressClick = false; }, 0);
  });

  resizeHandle.addEventListener("click", function (event) {
    event.stopPropagation();
  });

  button.addEventListener("click", function () {
    if (suppressClick) return;
    if (root.classList.contains("is-open")) {
      closePanel();
      setState("idle");
    } else {
      openHomePanel();
    }
  });

  document.addEventListener("click", function (e) {
    if (root.classList.contains("is-open") && !root.contains(e.target)) {
      closePanel();
      setState("idle");
    }
  });

  button.addEventListener("dblclick", function () {
    showHomeConfirm(function () {
      showScreen("home");
      closePanel();
      setState("jumping");
      setTimeout(function () { setState("idle"); }, 1000);
    });
  });

  function showHomeConfirm(onConfirm) {
    document.querySelector(".ilgu-home-confirm-overlay")?.remove();
    const overlay = document.createElement("div");
    overlay.className = "ilgu-home-confirm-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML =
      '<div class="ilgu-home-confirm-box">' +
        '<div class="ilgu-home-confirm-head">' +
          '<img class="ilgu-home-confirm-face" src="./assets/pets/mailpup/summon-face.png" alt="" aria-hidden="true">' +
          '<div>' +
            '<div class="ilgu-home-confirm-kicker">ILGU ASSISTANT</div>' +
            '<h3 class="ilgu-home-confirm-title"></h3>' +
          '</div>' +
        '</div>' +
        '<p class="ilgu-home-confirm-desc"></p>' +
        '<div class="ilgu-home-confirm-actions">' +
          '<button class="btn btn-ghost ilgu-home-confirm-cancel" type="button"></button>' +
          '<button class="btn btn-primary ilgu-home-confirm-ok" type="button"></button>' +
        '</div>' +
      '</div>';
    const title = overlay.querySelector(".ilgu-home-confirm-title");
    const desc = overlay.querySelector(".ilgu-home-confirm-desc");
    const cancel = overlay.querySelector(".ilgu-home-confirm-cancel");
    const ok = overlay.querySelector(".ilgu-home-confirm-ok");
    title.textContent = text.homeConfirmTitle;
    desc.textContent = text.homeConfirmBody;
    cancel.textContent = text.homeConfirmCancel;
    ok.textContent = text.homeConfirmOk;

    function close() {
      document.removeEventListener("keydown", onKeyDown);
      overlay.remove();
    }
    function confirm() {
      close();
      onConfirm();
    }
    function onKeyDown(event) {
      if (event.key === "Escape") close();
    }

    cancel.addEventListener("click", close);
    ok.addEventListener("click", confirm);
    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) close();
    });
    document.addEventListener("keydown", onKeyDown);
    document.body.appendChild(overlay);
    cancel.focus();
  }

  function showAssistant(options) {
    const opts = options || {};
    cancelLeaving();
    if (!syncAvailability()) return;
    localStorage.removeItem("ilguAssistantDisabled");
    localStorage.setItem("ilguAssistantVisible", "true");
    root.style.display = "flex";

    if (opts.bottomRight) {
      const saved = readPosition();
      if (saved) {
        setPosition(saved.x, saved.y);
      } else {
        root.style.left = "";
        root.style.top = "";
        root.style.right = "";
        root.style.bottom = "";
      }
    } else if (opts.anchor) {
      const rect = opts.anchor.getBoundingClientRect();
      const x = rect.right - (root.offsetWidth || 374);
      const y = rect.bottom + 10;
      setPosition(x, y);
      savePosition();
    }

    playEnteringAnimation(function () {
      if (opts.open) openHomePanel();
      else {
        closePanel();
        setState("idle");
      }
    });
  }

  window.showIlguAssistant = showAssistant;
  window.hideIlguAssistant = hideAssistant;

  window.addEventListener("resize", function () {
    syncAvailability();
    const rect = root.getBoundingClientRect();
    setPosition(rect.left, rect.top);
    savePosition();
  });

  // --- Autonomous left/right wander ---
  let wanderRAF = null;
  let wanderX = null;
  let wanderDir = 1;
  const WANDER_SPEED = 0.5;
  let wanderPauseUntil = 0;
  let nextBehaviorAt = 0;
  let behaviorMode = "idle";
  const idleBehaviorStates = ["eating", "studying", "dancing", "pushup", "sleeping"];

  function canWander() {
    if (transitionMode) return false;
    if (root.classList.contains("is-entering")) return false;
    if (root.classList.contains("is-leaving")) return false;
    if (root.style.display === "none") return false;
    if (root.classList.contains("is-open")) return false;
    if (root.classList.contains("dragging")) return false;
    if (drag) return false;
    if (Date.now() < wanderPauseUntil) return false;
    return true;
  }

  function startWander() {
    if (wanderRAF) return;
    const rect = root.getBoundingClientRect();
    wanderX = parseFloat(root.style.left) || rect.left;
    wanderDir = Math.random() < 0.5 ? -1 : 1;
    setStateIfChanged(wanderDir > 0 ? "running-right" : "running-left");
    const step = function () {
      if (!canWander()) { stopWander(); return; }
      wanderX += wanderDir * WANDER_SPEED;
      const btnLeft = button.offsetLeft;
      const minX = 8 - btnLeft;
      const maxX = window.innerWidth - 8 - btnLeft - button.offsetWidth;
      if (wanderX <= minX) { wanderX = minX; wanderDir = 1; setStateIfChanged("running-right"); }
      else if (wanderX >= maxX) { wanderX = maxX; wanderDir = -1; setStateIfChanged("running-left"); }
      const y = parseFloat(root.style.top) || root.getBoundingClientRect().top;
      setPosition(wanderX, y);
      wanderRAF = requestAnimationFrame(step);
    };
    wanderRAF = requestAnimationFrame(step);
  }

  function stopWander() {
    if (wanderRAF) cancelAnimationFrame(wanderRAF);
    wanderRAF = null;
    if (currentState === "running-right" || currentState === "running-left") {
      setState("idle");
    }
  }

  function stopIdleBehavior() {
    if (idleBehaviorStates.includes(currentState)) setState("idle");
  }

  function behaviorTick() {
    if (!canWander()) {
      if (wanderRAF) stopWander();
      stopIdleBehavior();
      nextBehaviorAt = Date.now() + 1500;
      behaviorMode = "idle";
      return;
    }
    if (Date.now() < nextBehaviorAt) return;
    if (behaviorMode === "wander") {
      behaviorMode = "idle";
      stopWander();
      nextBehaviorAt = Date.now() + 3000 + Math.random() * 5000;
    } else if (behaviorMode === "idle-animation") {
      behaviorMode = "idle";
      stopIdleBehavior();
      nextBehaviorAt = Date.now() + 3000 + Math.random() * 5000;
    } else {
      if (Math.random() < 0.775) {
        behaviorMode = "idle-animation";
        stopWander();
        const idleState = idleBehaviorStates[Math.floor(Math.random() * idleBehaviorStates.length)];
        setState(idleState);
        const state = states[idleState];
        nextBehaviorAt = Date.now() + (state.durationMs || (state.loops ? state.frames * state.ms * state.loops + 80 : 3200 + Math.random() * 1800));
      } else {
        behaviorMode = "wander";
        startWander();
        nextBehaviorAt = Date.now() + 4000 + Math.random() * 6000;
      }
    }
  }
  setInterval(behaviorTick, 300);

  setState("idle");
})();

(function initIlguSummonButton() {
  function createSummonButton() {
    const btn = document.createElement("button");
    btn.className = "ilgu-summon-btn";
    btn.type = "button";
    btn.setAttribute("aria-label", "일구 부르기");
    btn.title = "일구 부르기";
    btn.hidden = true;
    btn.innerHTML = '<img class="ilgu-summon-face" src="./assets/pets/mailpup/summon-face.png" alt="" aria-hidden="true">';
    return btn;
  }

  document.querySelectorAll(".topbar").forEach((tb) => {
    if (tb.querySelector(".ilgu-summon-btn")) return;
    const themeBtn = tb.querySelector(".theme-toggle-btn");
    const btn = createSummonButton();
    if (themeBtn) tb.insertBefore(btn, themeBtn);
    else tb.appendChild(btn);
  });

  const buttons = Array.from(document.querySelectorAll(".ilgu-summon-btn"));
  if (!buttons.length) return;

  function syncSummonButton() {
    const isMobile = window.matchMedia("(max-width: 768px)").matches || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    const visible = !isMobile;
    buttons.forEach((btn) => {
      btn.hidden = !visible;
      btn.style.display = visible ? "flex" : "none";
      btn.setAttribute("aria-hidden", visible ? "false" : "true");
    });
  }

  window.syncIlguSummonButton = syncSummonButton;
  syncSummonButton();
  window.addEventListener("resize", syncSummonButton);

  function isIlguCurrentlyVisible() {
    const root = document.getElementById("ilgu-assistant");
    if (!root) return false;
    if (localStorage.getItem("ilguAssistantDisabled") === "true") return false;
    return window.getComputedStyle(root).display !== "none";
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", function (event) {
      event.stopPropagation();
      if (btn.hidden) return;
      if (isIlguCurrentlyVisible()) {
        if (typeof window.hideIlguAssistant === "function") {
          window.hideIlguAssistant();
        }
        buttons.forEach((b) => b.classList.remove("is-active"));
      } else {
        if (typeof window.showIlguAssistant === "function") {
          window.showIlguAssistant({ open: true, bottomRight: true });
        }
        buttons.forEach((b) => b.classList.add("is-active"));
      }
    });
  });
})();

/* ============================================================
   개발자 이야기 — txt fetch + 챕터 파싱 + 보상카드
   ============================================================ */
(function initDevLetter() {
  const openBtn = document.getElementById("open-dev-letter");
  const backBtn = document.getElementById("back-from-dev-letter");
  const introEl = document.getElementById("devletter-intro-text");
  const chaptersEl = document.getElementById("devletter-chapters");
  const feedbackBtn = document.getElementById("devletter-feedback-btn");
  const musicBox = document.getElementById("devletter-music");
  const musicPanel = document.getElementById("devletter-music-panel");
  const musicAudio = document.getElementById("devletter-audio");
  const musicPlayBtn = document.getElementById("devletter-music-play");
  const musicStopBtn = document.getElementById("devletter-music-stop");
  const musicProgress = document.getElementById("devletter-music-progress");
  const musicVolume = document.getElementById("devletter-music-volume");
  const musicTimeEl = document.getElementById("devletter-music-time");
  const reward = document.getElementById("devletter-reward");
  const rewardFortuneEl = document.getElementById("devletter-reward-fortune");
  const rewardCloseBtn = document.getElementById("devletter-reward-close");
  const musicModal = document.getElementById("devletter-music-modal");
  const musicModalYes = document.getElementById("devletter-music-yes");
  const musicModalNo = document.getElementById("devletter-music-no");
  const musicPromptSessionKey = "devLetterMusicPromptShown";

  if (!openBtn) return;

  // 개발자 모드일 때만 버튼 노출
  try {
    if (localStorage.getItem("devMode") === "true") {
      openBtn.hidden = false;
    }
  } catch {}

  const FORTUNES = [
    "퇴근길에 만 원짜리 한 장 발견함",
    "오늘 밤 출동 없이 긴 밤 보냄",
    "매수한 주식 5% 상승함",
    "오늘 점심으로 제일 좋아하는 메뉴 나옴",
  ];
  const READ_FLAG = "devLetterFullyRead_v1";

  // 글 본문 — 수정은 이 LETTER_TEXT 상수만 고치면 됨.
  // 형식: 첫 문단 = 도입부 / "[개발자가 전하는 글]" = 구분선 / "숫자. 제목" = 챕터 시작
  const LETTER_TEXT = `작년, 화재안전조사를 하면서 자주 들었던 생각이 있습니다. 건물의 규모와 용도, 허가일자 같은 정보를 넣으면 이 건물에 어떤 소방시설이 필요한지 한눈에 정리해주는 도구가 있으면 좋겠다는 생각이었습니다.

예방업무는 처음 접하면 부담이 큰 업무라고 생각합니다. 법도 많고, 예외도 많고, 법을 찾아도 그 내용을 실제 건물에 어떻게 적용해야 하는지 막막할 때가 많습니다. 그런데 어느 정도 알고 보면, 건물을 보면서 필요한 시설을 하나씩 떠올려보는 과정이 꽤 재미있기도 합니다.

이 앱은 그런 생각에서 시작했습니다. 예방업무를 대신해주는 정답지가 아니라, 처음 방향을 잡고 반복해서 연습해볼 수 있는 작은 도구가 있으면 좋겠다는 마음으로 만들었습니다.

[개발자가 전하는 글]
1. 막연한 생각을 도구로
처음에는 막연한 생각이었습니다. 건물 정보를 넣으면 필요한 소방시설이 바로 정리되어 나오면 좋겠다는 정도였습니다. AI라면 금방 만들 수 있지 않을까 싶어 ChatGPT, Gemini, Claude 같은 여러 도구로도 시도해봤습니다. 하지만 소방 법령과 현장 예외를 원하는 만큼 다루는 일은 생각보다 쉽지 않았습니다. 결국 조금 돌아가더라도 직접 만들어보기로 했습니다. 대단한 기술이 있어서라기보다, 현장에서 필요하다고 느낀 것을 한번 끝까지 붙잡아보고 싶었습니다.

2. 만든 사람 이야기
솔직히 말하면 저는 예방업무에 통달한 사람은 아닙니다. 아직 배울 것도 많고, 남들이 한 번에 이해하는 내용을 두세 번씩 다시 봐야 할 때도 많습니다. 다만 예방업무에 관심이 많았고, 어렵지만 알수록 재미있는 업무라고 느꼈습니다. 건물의 규모와 용도, 구조를 보면서 어떤 시설이 필요할지 혼자 떠올려보는 연습도 자주 했습니다. 그런 시간이 쌓이다 보니, 처음 예방업무를 접하는 분들도 이런 감각을 조금 더 쉽게 연습해볼 수 있으면 좋겠다는 생각을 하게 됐습니다.

3. 누구를 위해 만들었나
이 앱은 예방업무를 처음 맡았거나, 소방시설이 아직 낯선 분들을 가장 많이 떠올리며 만들었습니다. 예방업무는 결국 직접 찾아보고, 물어보고, 현장에서 부딪히며 배워야 하는 부분이 많습니다. 그런데 곁에서 차근히 알려줄 사람이 항상 있는 것도 아니고, 법제처를 열어도 그 내용을 업무에 바로 연결하기 어려울 때가 있습니다. 그래서 이 앱이 정답을 알려주는 도구라기보다, 어디서부터 봐야 할지 감을 잡는 데 도움이 되는 도구였으면 했습니다.

4. 어떤 도구이고, 어디까지 믿어야 하나
가장 중심이 되는 기능은 '소방시설 탐색기'입니다. 건물의 규모, 용도, 허가일자 등을 입력하면 확인해야 할 소방시설을 정리해 보여주는 기능입니다. 여기에 법정기한 계산기처럼 실무에서 자주 헷갈리거나 놓치기 쉬운 기능도 함께 담았습니다. 다만 실제 건물에는 면제 조건, 자진 설치, 과거 법령 적용 등 여러 예외가 있을 수 있습니다. 그래서 이 앱은 최종 판단을 대신하는 도구는 아닙니다. 먼저 방향을 잡고, 이후 관련 법령과 현장 조건을 확인하는 참고용 길잡이로 봐주시면 좋겠습니다.

5. 배포를 앞두고
업무를 마친 뒤의 시간과 비번 날의 시간을 모아 조금씩 만들었습니다. 다 만들고 나서도 공개하기까지는 망설임이 있었습니다. 괜히 나선 것처럼 보이지 않을까 하는 걱정도 있었습니다. 그래도 제가 소방에서 일하며 받았던 도움과 가르침을 조금이라도 돌려드릴 수 있다면 좋겠다고 생각했습니다. 부족한 부분이 분명 있을 수 있습니다. 버그 제보, 기능 제안, 법적 오류에 대한 의견을 주시면 확인하고 가능한 범위에서 계속 고쳐가겠습니다.`;

  let loaded = false;
  let totalChapters = 0;
  const openedOnce = new Set();

  function formatMusicTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return min + ":" + String(sec).padStart(2, "0");
  }

  function syncMusicProgress() {
    if (!musicAudio) return;
    const duration = musicAudio.duration || 0;
    if (musicProgress && duration > 0) {
      const progressValue = Math.round((musicAudio.currentTime / duration) * 1000);
      musicProgress.value = String(progressValue);
      musicProgress.style.setProperty("--range-fill", (progressValue / 10) + "%");
    } else if (musicProgress) {
      musicProgress.value = "0";
      musicProgress.style.setProperty("--range-fill", "0%");
    }
    if (musicTimeEl) {
      // 재생 중일 때만 경과시간 노출, 정지/일시정지면 숨김 (미니멀)
      musicTimeEl.textContent = (musicAudio.paused || !musicAudio.currentTime)
        ? ""
        : formatMusicTime(musicAudio.currentTime);
    }
  }

  function syncMusicVolume() {
    if (!musicVolume) return;
    musicVolume.style.setProperty("--range-fill", musicVolume.value + "%");
  }

  function syncMusicButtons() {
    const playing = musicAudio && !musicAudio.paused;
    if (musicPlayBtn) {
      musicPlayBtn.classList.toggle("is-active", !!playing);
      musicPlayBtn.textContent = playing ? "일시정지" : "듣기";
    }
    if (musicBox) musicBox.setAttribute("aria-label", playing ? "배경음악 일시정지" : "배경음악 재생");
    if (musicStopBtn) musicStopBtn.classList.toggle("is-active", !!musicAudio && musicAudio.paused && musicAudio.currentTime === 0);
    syncMusicProgress();
  }

  function playDevLetterMusic() {
    if (!musicAudio) return;
    musicAudio.volume = musicVolume ? Number(musicVolume.value) / 100 : 0.45;
    syncMusicVolume();
    const playPromise = musicAudio.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise.then(syncMusicButtons).catch(syncMusicButtons);
    } else {
      syncMusicButtons();
    }
  }

  function stopDevLetterMusic() {
    if (!musicAudio) return;
    musicAudio.pause();
    try { musicAudio.currentTime = 0; } catch {}
    syncMusicButtons();
  }

  function toggleDevLetterMusic() {
    if (!musicAudio) return;
    if (musicAudio.paused) playDevLetterMusic();
    else {
      musicAudio.pause();
      syncMusicButtons();
    }
  }

  function pauseDevLetterMusic() {
    if (!musicAudio || musicAudio.paused) return;
    musicAudio.pause();
    syncMusicButtons();
  }

  function pauseDevLetterMusicOnBackground() {
    if (document.visibilityState === "hidden") pauseDevLetterMusic();
  }

  function toggleMusicPanel() {
    if (!musicPanel) return;
    musicPanel.hidden = !musicPanel.hidden;
  }

  function showMusicPrompt() {
    try {
      if (sessionStorage.getItem(musicPromptSessionKey) === "1") return;
      sessionStorage.setItem(musicPromptSessionKey, "1");
    } catch {}
    if (!musicModal) { playDevLetterMusic(); return; }
    musicModal.classList.remove("hidden");
  }
  function hideMusicPrompt() {
    if (musicModal) musicModal.classList.add("hidden");
  }

  function closeDevLetterMusic() {
    hideMusicPrompt();
    stopDevLetterMusic();
  }

  function pickFortune() {
    return FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function parseLetter(raw) {
    // 줄 단위, [개발자가 전하는 글] 제거, 숫자. 제목 = 챕터 시작
    const lines = raw.replace(/\r\n/g, "\n").split("\n");
    let intro = [];
    const chapters = [];
    let cur = null;
    let inBody = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (trimmed === "[개발자가 전하는 글]") { inBody = true; continue; }

      const m = trimmed.match(/^(\d+)\.\s*(.+)$/);
      if (m && inBody) {
        if (cur) chapters.push(cur);
        cur = { num: m[1], title: m[2], body: [] };
        continue;
      }

      if (cur) {
        cur.body.push(line);
      } else if (!inBody && trimmed) {
        intro.push(line);
      }
    }
    if (cur) chapters.push(cur);

    // 챕터에 본문 없으면 다음 라인이 본문일 가능성 — 위 파서가 처리함
    chapters.forEach(c => { c.body = c.body.join("\n").replace(/^\n+|\n+$/g, ""); });
    return { intro: intro.join("\n").trim().replace(/\\\s*$/, ""), chapters };
  }

  function render(data) {
    introEl.textContent = data.intro;
    chaptersEl.innerHTML = "";
    totalChapters = data.chapters.length;
    openedOnce.clear();
    data.chapters.forEach((c) => {
      const det = document.createElement("details");
      det.className = "devletter-chapter";
      det.dataset.chapterNum = c.num;
      det.innerHTML = `
        <summary class="devletter-chapter-summary">
          <span class="devletter-chapter-num">${escapeHtml(String(c.num).padStart(2,"0"))}</span>
          <span class="devletter-chapter-title">${escapeHtml(c.title)}</span>
        </summary>
        <div class="devletter-chapter-body">${escapeHtml(c.body)}</div>
      `;
      det.addEventListener("toggle", () => onChapterToggle(det));
      chaptersEl.appendChild(det);
    });
  }

  function onChapterToggle(det) {
    if (!det.open) return;
    openedOnce.add(det.dataset.chapterNum);
    if (localStorage.getItem(READ_FLAG)) return;
    if (openedOnce.size >= totalChapters && totalChapters > 0) {
      try { localStorage.setItem(READ_FLAG, "1"); } catch {}
      setTimeout(showReward, 350);
    }
  }

  function showReward() {
    if (!reward) return;
    rewardFortuneEl.textContent = pickFortune();
    reward.classList.remove("hidden");
    reward.setAttribute("aria-hidden", "false");
  }
  function hideReward() {
    if (!reward) return;
    reward.classList.add("hidden");
    reward.setAttribute("aria-hidden", "true");
  }

  function loadLetter() {
    if (loaded) return;
    try {
      const data = parseLetter(LETTER_TEXT);
      render(data);
      loaded = true;
    } catch (e) {
      introEl.textContent = "글을 불러오지 못했습니다.";
      chaptersEl.innerHTML = "";
      console.error("[devletter] parse failed:", e);
    }
  }

  loadLetter();
  syncMusicVolume();

  openBtn.addEventListener("click", () => {
    loadLetter();
    if (typeof showScreen === "function") {
      showScreen("developer-letter");
    } else {
      document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
      document.getElementById("screen-developer-letter").classList.add("active");
    }
    showMusicPrompt();
  });

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      closeDevLetterMusic();
      if (typeof showScreen === "function") showScreen("home");
    });
  }

  if (musicAudio) {
    musicAudio.addEventListener("play", syncMusicButtons);
    musicAudio.addEventListener("pause", syncMusicButtons);
    musicAudio.addEventListener("ended", syncMusicButtons);
    musicAudio.addEventListener("loadedmetadata", syncMusicProgress);
    musicAudio.addEventListener("timeupdate", syncMusicProgress);
  }

  document.addEventListener("visibilitychange", pauseDevLetterMusicOnBackground);
  window.addEventListener("pagehide", pauseDevLetterMusic);
  window.addEventListener("blur", pauseDevLetterMusic);

  const devLetterScreen = document.getElementById("screen-developer-letter");
  if (devLetterScreen) {
    new MutationObserver(() => {
      if (!devLetterScreen.classList.contains("active")) closeDevLetterMusic();
    }).observe(devLetterScreen, { attributes: true, attributeFilter: ["class"] });
  }

  if (musicProgress && musicAudio) {
    musicProgress.addEventListener("pointerdown", (event) => event.stopPropagation());
    musicProgress.addEventListener("click", (event) => event.stopPropagation());
    musicProgress.addEventListener("input", () => {
      const duration = musicAudio.duration || 0;
      if (duration > 0) {
        musicAudio.currentTime = (Number(musicProgress.value) / 1000) * duration;
      }
      syncMusicProgress();
    });
  }

  if (musicVolume && musicAudio) {
    musicVolume.addEventListener("pointerdown", (event) => event.stopPropagation());
    musicVolume.addEventListener("click", (event) => event.stopPropagation());
    musicVolume.addEventListener("input", () => {
      musicAudio.volume = Number(musicVolume.value) / 100;
      syncMusicVolume();
    });
  }

  if (musicBox) {
    musicBox.addEventListener("click", toggleDevLetterMusic);
  }

  if (feedbackBtn) {
    feedbackBtn.addEventListener("click", () => {
      const contact = document.getElementById("open-contact");
      if (contact) contact.click();
    });
  }

  if (musicModalYes) musicModalYes.addEventListener("click", () => { hideMusicPrompt(); playDevLetterMusic(); });
  if (musicModalNo) musicModalNo.addEventListener("click", hideMusicPrompt);
  if (musicModal) musicModal.addEventListener("click", (e) => { if (e.target === musicModal) hideMusicPrompt(); });

  if (rewardCloseBtn) rewardCloseBtn.addEventListener("click", hideReward);
  if (reward) reward.addEventListener("click", (e) => {
    if (e.target === reward) hideReward();
  });

  // 점검용: '— 한 센터 대원 드림' 서명 5번 연속 클릭 시 보상카드 강제 출력
  (function attachSignSecret() {
    const sign = document.querySelector("#screen-developer-letter .devletter-sign");
    if (!sign) return;
    sign.style.cursor = "pointer";
    let count = 0;
    let timer = null;
    sign.addEventListener("click", () => {
      count++;
      clearTimeout(timer);
      timer = setTimeout(() => { count = 0; }, 1500);
      if (count >= 5) {
        count = 0;
        showReward();
      }
    });
  })();
})();

/* ── 근거 법령 안내 모달 ── */
(function () {
  const LAW_SEARCH = "https://www.law.go.kr/lsSc.do?menuId=1&subMenuId=15&tabMenuId=81&query=";
  const ADMRUL_SEARCH = "https://www.law.go.kr/admRulSc.do?menuId=5&subMenuId=41&tabMenuId=183&query=";
  const LAW_SOURCES = {
    facilities: [
      { kind: "행정규칙", name: "화재안전기준", url: ADMRUL_SEARCH + encodeURIComponent("화재안전기준") }
    ],
    "multiuse-reader": [
      { kind: "시행령", name: "다중이용업소의 안전관리에 관한 특별법 시행령",
        url: "https://www.law.go.kr/lsSc.do?menuId=1&subMenuId=15&tabMenuId=81&query=%EB%8B%A4%EC%A4%91%EC%9D%B4%EC%9A%A9%EC%97%85%EC%86%8C%EC%9D%98%20%EC%95%88%EC%A0%84%EA%B4%80%EB%A6%AC%EC%97%90%20%EA%B4%80%ED%95%9C%20%ED%8A%B9%EB%B3%84%EB%B2%95%20%EC%8B%9C%ED%96%89%EB%A0%B9" }
    ],
    "multiuse-safety": [
      { kind: "시행령", name: "다중이용업소의 안전관리에 관한 특별법 시행령",
        url: "https://www.law.go.kr/lsSc.do?menuId=1&subMenuId=15&tabMenuId=81&query=%EB%8B%A4%EC%A4%91%EC%9D%B4%EC%9A%A9%EC%97%85%EC%86%8C%EC%9D%98%20%EC%95%88%EC%A0%84%EA%B4%80%EB%A6%AC%EC%97%90%20%EA%B4%80%ED%95%9C%20%ED%8A%B9%EB%B3%84%EB%B2%95%20%EC%8B%9C%ED%96%89%EB%A0%B9" },
      { kind: "시행규칙", name: "다중이용업소의 안전관리에 관한 특별법 시행규칙",
        url: "https://www.law.go.kr/lsSc.do?menuId=1&subMenuId=15&query=%EB%8B%A4%EC%A4%91%EC%9D%B4%EC%9A%A9%EC%97%85%EC%86%8C%EC%9D%98%20%EC%95%88%EC%A0%84%EA%B4%80%EB%A6%AC%EC%97%90%20%EA%B4%80%ED%95%9C%20%ED%8A%B9%EB%B3%84%EB%B2%95%20%EC%8B%9C%ED%96%89%EA%B7%9C%EC%B9%99&dt=20201211" }
    ],
    "date-inspect_report": [
      { kind: "시행규칙", name: "소방시설 설치 및 관리에 관한 법률 시행규칙",
        url: "https://www.law.go.kr/lsSc.do?menuId=1&subMenuId=15&query=%09%EC%86%8C%EB%B0%A9%EC%8B%9C%EC%84%A4%20%EC%84%A4%EC%B9%98%20%EB%B0%8F%20%EA%B4%80%EB%A6%AC%EC%97%90%20%EA%B4%80%ED%95%9C%20%EB%B2%95%EB%A5%A0%20%EC%8B%9C%ED%96%89%EA%B7%9C%EC%B9%99&dt=20201211" }
    ],
    "date-fire_safety_manager": [
      { kind: "시행규칙", name: "화재의 예방 및 안전관리에 관한 법률 시행규칙",
        url: "https://www.law.go.kr/lsSc.do?menuId=1&subMenuId=15&query=%ED%99%94%EC%9E%AC%EC%9D%98%20%EC%98%88%EB%B0%A9%20%EB%B0%8F%20%EC%95%88%EC%A0%84%EA%B4%80%EB%A6%AC%EC%97%90%20%EA%B4%80%ED%95%9C%20%EB%B2%95%EB%A5%A0%20%EC%8B%9C%ED%96%89%EA%B7%9C%EC%B9%99&dt=20201211" }
    ],
    "date-fire_safety_assistant_manager": [
      { kind: "시행규칙", name: "화재의 예방 및 안전관리에 관한 법률 시행규칙",
        url: "https://www.law.go.kr/lsSc.do?menuId=1&subMenuId=15&query=%ED%99%94%EC%9E%AC%EC%9D%98%20%EC%98%88%EB%B0%A9%20%EB%B0%8F%20%EC%95%88%EC%A0%84%EA%B4%80%EB%A6%AC%EC%97%90%20%EA%B4%80%ED%95%9C%20%EB%B2%95%EB%A5%A0%20%EC%8B%9C%ED%96%89%EA%B7%9C%EC%B9%99&dt=20201211" }
    ],
    "date-hazardous_material_manager": [
      { kind: "법률", name: "위험물안전관리법",
        url: "https://www.law.go.kr/lsSc.do?menuId=1&subMenuId=15&query=%EC%9C%84%ED%97%98%EB%AC%BC%EC%95%88%EC%A0%84%EA%B4%80%EB%A6%AC%EB%B2%95&dt=20201211" }
    ],
    "date-noncompliance_action": [
      { kind: "시행규칙", name: "소방시설 설치 및 관리에 관한 법률 시행규칙",
        url: "https://www.law.go.kr/lsSc.do?menuId=1&subMenuId=15&query=%09%EC%86%8C%EB%B0%A9%EC%8B%9C%EC%84%A4%20%EC%84%A4%EC%B9%98%20%EB%B0%8F%20%EA%B4%80%EB%A6%AC%EC%97%90%20%EA%B4%80%ED%95%9C%20%EB%B2%95%EB%A5%A0%20%EC%8B%9C%ED%96%89%EA%B7%9C%EC%B9%99&dt=20201211" }
    ],
    "occupancy-occupancy": [
      { kind: "시행령", name: "소방시설 설치 및 관리에 관한 법률 시행령",
        url: "https://www.law.go.kr/lsSc.do?menuId=1&subMenuId=15&query=%EC%86%8C%EB%B0%A9%EC%8B%9C%EC%84%A4%20%EC%84%A4%EC%B9%98%20%EB%B0%8F%20%EA%B4%80%EB%A6%AC%EC%97%90%20%EA%B4%80%ED%95%9C%20%EB%B2%95%EB%A5%A0%20%EC%8B%9C%ED%96%89%EB%A0%B9&dt=20201211" }
    ],
    "occupancy-staffing": [
      { kind: "시행령", name: "화재의 예방 및 안전관리에 관한 법률 시행령",
        url: "https://www.law.go.kr/lsSc.do?menuId=1&subMenuId=15&query=%ED%99%94%EC%9E%AC%EC%9D%98%20%EC%98%88%EB%B0%A9%20%EB%B0%8F%20%EC%95%88%EC%A0%84%EA%B4%80%EB%A6%AC%EC%97%90%20%EA%B4%80%ED%95%9C%20%EB%B2%95%EB%A5%A0%20%EC%8B%9C%ED%96%89%EB%A0%B9&dt=20201211" }
    ],
    "report-guide": [
      { kind: "시행규칙", name: "소방시설 설치 및 관리에 관한 법률 시행규칙",
        url: "https://www.law.go.kr/lsSc.do?menuId=1&subMenuId=15&query=%EC%86%8C%EB%B0%A9%EC%8B%9C%EC%84%A4%20%EC%84%A4%EC%B9%98%20%EB%B0%8F%20%EA%B4%80%EB%A6%AC%EC%97%90%20%EA%B4%80%ED%95%9C%20%EB%B2%95%EB%A5%A0%20%EC%8B%9C%ED%96%89%EA%B7%9C%EC%B9%99&dt=20201211" }
    ],
    "inspection-reader": [
      { kind: "시행령", name: "소방시설 설치 및 관리에 관한 법률 시행령",
        url: "https://www.law.go.kr/lsSc.do?menuId=1&subMenuId=15&query=%EC%86%8C%EB%B0%A9%EC%8B%9C%EC%84%A4%20%EC%84%A4%EC%B9%98%20%EB%B0%8F%20%EA%B4%80%EB%A6%AC%EC%97%90%20%EA%B4%80%ED%95%9C%20%EB%B2%95%EB%A5%A0%20%EC%8B%9C%ED%96%89%EB%A0%B9&dt=20201211" }
    ],
    "explorer-simple": [
      { kind: "시행령", name: "소방시설 설치 및 관리에 관한 법률 시행령",
        url: "https://www.law.go.kr/lsSc.do?menuId=1&subMenuId=15&query=%EC%86%8C%EB%B0%A9%EC%8B%9C%EC%84%A4%20%EC%84%A4%EC%B9%98%20%EB%B0%8F%20%EA%B4%80%EB%A6%AC%EC%97%90%20%EA%B4%80%ED%95%9C%20%EB%B2%95%EB%A5%A0%20%EC%8B%9C%ED%96%89%EB%A0%B9&dt=20201211" },
      { kind: "행정규칙", name: "화재안전기준",
        url: "https://www.law.go.kr/admRulSc.do?menuId=5&subMenuId=41&tabMenuId=183&query=%ED%99%94%EC%9E%AC%EC%95%88%EC%A0%84%EA%B8%B0%EC%A4%80" }
    ],
    "explorer-year-pre": [
      { kind: "시행령", name: "소방법 시행령 (연혁)",
        url: "https://www.law.go.kr/lsSc.do?menuId=1&subMenuId=17&tabMenuId=93&query=%EC%86%8C%EB%B0%A9%EB%B2%95%20%EC%8B%9C%ED%96%89%EB%A0%B9" },
      { kind: "부령", name: "소방기술기준에관한 규칙 (연혁)",
        url: "https://www.law.go.kr/lsSc.do?menuId=1&subMenuId=17&tabMenuId=93&query=%EC%9C%84%ED%97%98%EB%AC%BC" }
    ],
    "explorer-year-post": [
      { kind: "시행령", name: "소방시설 설치 및 관리에 관한 법률 시행령 (연혁)",
        url: "https://www.law.go.kr/lsSc.do?menuId=1&subMenuId=17&tabMenuId=93&query=%EC%86%8C%EB%B0%A9%EC%8B%9C%EC%84%A4%20%EC%84%A4%EC%B9%98%20%EB%B0%8F%20%EC%9C%A0%EC%A7%80%EA%B4%80%EB%A6%AC%EC%97%90%20%EA%B4%80%ED%95%9C%20%EB%B2%95%EB%A5%A0%20%EC%8B%9C%ED%96%89%EB%A0%B9" },
      { kind: "행정규칙", name: "화재안전기준 (연혁)",
        url: "https://www.law.go.kr/admRulSc.do?menuId=5&subMenuId=43&tabMenuId=193&query=%ED%99%94%EC%9E%AC%EC%95%88%EC%A0%84%EA%B8%B0%EC%A4%80" }
    ]
  };

  const LAW_NOTES = {
    "explorer-year-pre": "법령명은 시기에 따라 달라질 수 있어요. 연혁법령 페이지에서 해당 시점 버전을 확인하세요.",
    "explorer-year-post": "법령명은 시기에 따라 달라질 수 있어요. 연혁법령 페이지에서 해당 시점 버전을 확인하세요."
  };

  const modal = document.getElementById("law-link-modal");
  const list = document.getElementById("law-link-list");
  const noteEl = document.getElementById("law-link-note");
  const cancelBtn = document.getElementById("law-link-cancel");
  if (!modal || !list || !cancelBtn) return;

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  function openModal(key) {
    const items = LAW_SOURCES[key];
    if (!items || !items.length) return;
    if (noteEl) {
      const note = LAW_NOTES[key];
      if (note) {
        noteEl.textContent = note;
        noteEl.classList.remove("hidden");
      } else {
        noteEl.textContent = "";
        noteEl.classList.add("hidden");
      }
    }
    list.innerHTML = items.map(function (it) {
      return '<li><button type="button" class="law-link-item" data-url="' +
        escapeHtml(it.url) + '">' +
        '<span class="lli-kind">' + escapeHtml(it.kind) + '</span>' +
        '<span class="lli-name">' + escapeHtml(it.name) + '</span>' +
        '<span class="lli-arr">↗</span></button></li>';
    }).join("");
    modal.classList.remove("hidden");
  }

  function closeModal() {
    modal.classList.add("hidden");
  }

  document.addEventListener("click", function (e) {
    const chip = e.target.closest(".law-link-chip");
    if (!chip || !chip.dataset.lawKey) return;
    e.preventDefault();
    openModal(chip.dataset.lawKey);
  });

  cancelBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });
  list.addEventListener("click", function (e) {
    const btn = e.target.closest(".law-link-item");
    if (!btn) return;
    const url = btn.dataset.url;
    if (url) window.open(url, "_blank", "noopener");
    closeModal();
  });
})();
