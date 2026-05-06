// ── 개발자 모드 (GA 추적 비활성화) ───────────────────────────────────────
// 본인 기기에서 콘솔에 한 번만 실행: localStorage.setItem('devMode', 'true')
if (localStorage.getItem('devMode') === 'true') {
  window['ga-disable-G-LKQZX5YS2H'] = true;
}

// ── 패치노트 설정 (여기만 수정하면 됩니다) ──────────────────────────────
const PATCH_NOTES = {
  version: "v1.2.4",
  date: "2026-05-04",
  items: [
    { type: "notice",  text: "법적기준이 아닙니다. 참고만해주세요!" },
    { type: "new",     text: "①소방안전관리보조자 선임인원 계산기 추가(날짜 계산기에 위치)<br>②벚꽃테마 추가. 눈 아프면🌙버튼 누르세요." },
    { type: "improve", text: "Google Analytics 및 GTM 트래킹 적용" },
    { type: "fix",     text: "전반적인 UI 개선 및 버그 수정" },
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
  { key: "basementFloors", title: "지하층수는 몇 층인가요?", help: "지하층 조건이 들어가는 설비를 판정합니다.", type: "number", onlyFor: "neighborhood", min: 0, step: 1, placeholder: "예: 1" },
  { key: "basementAreaSum", title: "지하층 바닥면적 합계는 얼마인가요?", help: "지하층수와 함께 지하층 평균 면적을 계산합니다.", type: "number", onlyFor: "neighborhood", min: 0, step: 0.1, placeholder: "예: 180" },
  {
    key: "hasWindowlessFloor",
    title: "무창층이 있나요?",
    help: "무창층이 있으면 면적을 이어서 입력합니다.",
    type: "choice",
    onlyFor: "neighborhood",
    options: [
      { value: "yes", label: "있음", description: "무창층이 하나 이상 있는 경우" },
      { value: "no", label: "없음", description: "무창층이 없는 경우" },
    ],
  },
  { key: "windowlessArea", title: "무창층 바닥면적은 얼마인가요?", help: "무창층이 있으면 바닥면적 합계를 입력해 주세요.", type: "number", onlyFor: "neighborhood", min: 0, step: 0.1, placeholder: "예: 200" },
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
  {
    key: "hasMultiuseBusiness",
    title: "다중이용업소가 있나요?",
    help: "다중이용업소가 있으면 설치해야 하는 소방시설을 별도로 표시합니다.",
    type: "choice",
    onlyFor: "neighborhood",
    options: [
      { value: "yes", label: "예", description: "다중이용업소 추가 설치시설까지 확인" },
      { value: "no", label: "아니오", description: "기존 근린생활시설 결과만 표시" },
    ],
  },
  {
    key: "multiuseSimpleSprinklerCheck",
    title: "간이스프링클러설비 설치 대상인지 확인합니다.",
    help: "해당되는 항목은 중복 선택할 수 있습니다. 하나라도 해당하면 간이스프링클러설비 설치대상입니다.",
    type: "compound",
    onlyFor: "neighborhood",
  },
  {
    key: "multiuseOnSecondToTenthFloor",
    title: "다중이용업소가 2층~10층 사이에 설치돼있나요?",
    help: "맞다면 피난기구를 설치해야 합니다.",
    type: "choice",
    onlyFor: "neighborhood",
    options: [
      { value: "yes", label: "예", description: "2층부터 10층 사이에 설치돼 있음" },
      { value: "no", label: "아니오", description: "해당 층 범위가 아님" },
    ],
  },
  {
    key: "multiuseOnGroundOrRefugeFloor",
    title: "지상 1층이나 피난층에 설치돼있나요?",
    help: "산후조리업이나 고시원에 해당할 때만 확인하며, 맞다면 간이스프링클러설비 대상에서 제외합니다.",
    type: "choice",
    onlyFor: "neighborhood",
    options: [
      { value: "yes", label: "예", description: "지상 1층 또는 피난층에 설치돼 있음" },
      { value: "no", label: "아니오", description: "지상 1층 또는 피난층이 아님" },
    ],
  },
  {
    key: "multiuseUsesAV",
    title: "'노래반주기 등 영상음향장치를 사용하는 영업장'인가요?",
    help: "맞다면 자동화재탐지설비와 영상음향차단장치를 설치해야 합니다.",
    type: "choice",
    onlyFor: "neighborhood",
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
    onlyFor: "neighborhood",
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
    onlyFor: "neighborhood",
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
    onlyFor: "neighborhood",
    options: [
      { value: "yes", label: "예", description: "피난통로 또는 복도가 있음" },
      { value: "no", label: "아니오", description: "해당 통로가 없음" },
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
  { key: "lodgingBasementFloors", title: "지하층수는 몇 층인가요?", help: "지하층 조건이 들어가는 설비를 판정합니다.", type: "number", onlyFor: "lodging", min: 0, step: 1, placeholder: "예: 1" },
  { key: "lodgingBasementAreaSum", title: "지하층 바닥면적 합계는 얼마인가요?", help: "없으면 0을 입력하세요.", type: "number", onlyFor: "lodging", min: 0, step: 0.1, placeholder: "예: 200" },
  {
    key: "lodgingHasWindowlessFloor",
    title: "무창층이 있나요?",
    help: "무창층이 있으면 면적을 이어서 입력합니다.",
    type: "choice",
    onlyFor: "lodging",
    options: [
      { value: "yes", label: "있음", description: "무창층이 하나 이상 있는 경우" },
      { value: "no", label: "없음", description: "무창층이 없는 경우" },
    ],
  },
  { key: "lodgingWindowlessArea", title: "무창층 바닥면적은 얼마인가요?", help: "무창층이 있으면 바닥면적을 입력하세요.", type: "number", onlyFor: "lodging", min: 0, step: 0.1, placeholder: "예: 300" },
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
  { key: "elderlyBasementFloors", title: "지하층수는 몇 층인가요?", help: "없으면 0을 입력하세요.", type: "number", onlyFor: "elderly", min: 0, step: 1, placeholder: "예: 1" },
  { key: "elderlyBasementAreaSum", title: "지하층 바닥면적 합계는 얼마인가요?", help: "없으면 0을 입력하세요.", type: "number", onlyFor: "elderly", min: 0, step: 0.1, placeholder: "예: 200" },
  {
    key: "elderlyHasWindowlessFloor",
    title: "무창층이 있나요?",
    help: "무창층이 있으면 면적을 이어서 입력합니다.",
    type: "choice",
    onlyFor: "elderly",
    options: [
      { value: "yes", label: "있음", description: "무창층이 하나 이상 있는 경우" },
      { value: "no", label: "없음", description: "무창층이 없는 경우" },
    ],
  },
  { key: "elderlyWindowlessArea", title: "무창층 바닥면적은 얼마인가요?", help: "무창층이 있으면 바닥면적을 입력하세요.", type: "number", onlyFor: "elderly", min: 0, step: 0.1, placeholder: "예: 200" },
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
  { key: "medicalBasementFloors", title: "지하층수는 몇 층인가요?", help: "없으면 0을 입력하세요.", type: "number", onlyFor: "medical", min: 0, step: 1, placeholder: "예: 1" },
  { key: "medicalBasementAreaSum", title: "지하층 바닥면적 합계는 얼마인가요?", help: "없으면 0을 입력하세요.", type: "number", onlyFor: "medical", min: 0, step: 0.1, placeholder: "예: 300" },
  {
    key: "medicalHasWindowlessFloor",
    title: "무창층이 있나요?",
    help: "무창층이 있으면 바닥면적을 이어서 입력합니다.",
    type: "choice",
    onlyFor: "medical",
    options: [
      { value: "yes", label: "있음", description: "무창층이 하나 이상 있는 경우" },
      { value: "no", label: "없음", description: "무창층이 없는 경우" },
    ],
  },
  { key: "medicalWindowlessArea", title: "무창층 바닥면적은 얼마인가요?", help: "무창층이 있으면 바닥면적을 입력하세요.", type: "number", onlyFor: "medical", min: 0, step: 0.1, placeholder: "예: 200" },
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
  { key: "medicalDetailSet", title: "주차·전기실 추가 조건을 입력해 주세요.", help: "해당 공간이 없으면 0으로 입력해 주세요.", type: "compound", onlyFor: "medical" },
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
  },
  dateCalc: {
    mode: "inspect_report",
    baseDate: todayString(),
    holidays: [],
    selectMode: "base",
    noncomplianceType: "repair",
    assistantTargetType: "apartment",
    assistantHouseholds: "",
    assistantArea: "",
    viewYear: new Date().getFullYear(),
    viewMonth: new Date().getMonth(),
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
    assistantCalculator: true,
    tableTitle: "선임 구분별 제출 서류",
    tableHead: ["구분", "제출 서류"],
    tableBody: [
      ["공통신고<br>서류", "① 소방안전관리보조자 선임신고서"],
      ["자격증명<br>서류<br>(중 1택)", "① 소방안전관리보조자 자격증 사본<br>② 소방안전관리자 자격증 사본(특,1,2,3급)<br>③ 소방안전관리자 강습교육 수료증 사본(특,1,2,3급,<br>공공기관)<br>④ 국가기술자격증 사본(건축, 위험물, 안전관리 등)<br>⑤ 소방안전 관련 업무에 2년 이상 근무경력 증명서류"],
    ],
    extraSections: [
      {
        title: "선임 대상",
        content: `<b>가.</b> 300세대 이상인 아파트<br><b>나.</b> 연면적 1만5천㎡ 이상인 특정소방대상물(아파트·연립주택 제외)<br><b>다.</b> 가·나 외 특정소방대상물 중 다음 어느 하나에 해당하는 것<br>&nbsp;&nbsp;1) 공동주택 중 기숙사<br>&nbsp;&nbsp;2) 의료시설<br>&nbsp;&nbsp;3) 노유자 시설<br>&nbsp;&nbsp;4) 수련시설<br>&nbsp;&nbsp;5) 숙박시설(바닥면적 합계 1,500㎡ 미만이고 관계인이 24시간 상시 근무하는 경우 제외)`,
      },
      {
        title: "선임 인원",
        content: `<b>가.</b> 아파트(300세대 이상): 1명. 초과되는 300세대마다 1명 이상 추가 선임<br><b>나.</b> 연면적 1만5천㎡ 이상: 1명. 초과되는 연면적 1만5천㎡마다 1명 추가 선임<br><b>다.</b> 그 밖의 대상: 1명. 야간·휴일에 이용되지 않는 것이 확인된 경우 선임 제외 가능`,
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
  multiuse: document.getElementById("screen-multiuse"),
  guide: document.getElementById("screen-guide"),
  reportGuide: document.getElementById("screen-report-guide"),
  occupancy: document.getElementById("screen-occupancy"),
  facilities: document.getElementById("screen-facilities"),
};

const questionElements = {
  kicker: document.getElementById("question-kicker"),
  title: document.getElementById("question-title"),
  help: document.getElementById("question-help"),
  input: document.getElementById("question-input"),
};

const explorerRuntime = {
  mode: "default", // "default" | "year"
};

const explorerTitleEl = document.getElementById("explorer-title");
const explorerModeBadgeEl = document.getElementById("explorer-mode-badge");

function applyExplorerModeUI() {
  if (!explorerTitleEl || !explorerModeBadgeEl) return;
  const isYearMode = explorerRuntime.mode === "year";
  explorerTitleEl.textContent = isYearMode ? "소방시설탐색기 (연도별)" : "소방시설탐색기";
  explorerModeBadgeEl.classList.toggle("hidden", !isYearMode);
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

function getActiveSteps() {
  return steps.filter((step) => {
    if (["isThirdClassNeighborhood", "permitBefore1992", "pre1992PermitRange", "thirdClassDetailUse"].includes(step.key)) return false;
    if (!step.onlyFor) return true;
    if (step.onlyFor !== state.answers.occupancyType) return false;
    if (step.key === "windowlessArea") return state.answers.hasWindowlessFloor === "yes";
    if (step.key === "hasLargeTargetFloor") return toNumber(state.answers.totalArea) < 1500;
    if (step.key === "firstSecondFloorArea") return toNumber(state.answers.totalArea) >= 9000;
    if (step.key === "postpartumAreaRange") return state.answers.facilitySubtype === "postpartum";
    if (step.key === "has24HourStaff") return ["clinicInpatient", "postpartum"].includes(state.answers.facilitySubtype);
    if (step.key === "multiuseOnGroundOrRefugeFloor") {
      return state.answers.hasMultiuseBusiness === "yes"
        && (state.answers.multiuseIsPostpartum === "yes" || state.answers.multiuseIsGosiwon === "yes");
    }
    if (step.key === "multiuseOnSecondToTenthFloor") {
      return state.answers.hasMultiuseBusiness === "yes" && state.answers.multiuseInBasement !== "yes";
    }
    if (["multiuseSimpleSprinklerCheck", "multiuseUsesAV", "multiuseHasGasFacility", "multiuseHasRooms", "multiuseHasEvacuationRoute"].includes(step.key)) {
      return state.answers.hasMultiuseBusiness === "yes";
    }
    // 숙박시설 전용 조건
    if (step.key === "lodgingWindowlessArea") return state.answers.lodgingHasWindowlessFloor === "yes";
    if (step.key === "lodgingHasLargeFloorFor1000") {
      // 이미 전층 스프링클러 대상이면 skip
      const la = toNumber(state.answers.lodgingArea);
      const ag = toNumber(state.answers.lodgingAboveGroundFloors);
      const totalF = toNumber(state.answers.lodgingAboveGroundFloors) + toNumber(state.answers.lodgingBasementFloors);
      return la < 600 && ag < 6 && totalF < 6;
    }

    if (step.key === "lodgingMultiuseOnGroundOrRefugeFloor") {
      return state.answers.lodgingHasMultiuseBusiness === "yes"
        && (state.answers.lodgingMultiuseIsPostpartum === "yes" || state.answers.lodgingMultiuseIsGosiwon === "yes");
    }
    if (step.key === "lodgingMultiuseOnSecondToTenthFloor") {
      return state.answers.lodgingHasMultiuseBusiness === "yes" && state.answers.lodgingMultiuseInBasement !== "yes";
    }
    if (["lodgingMultiuseSimpleSprinklerCheck", "lodgingMultiuseUsesAV", "lodgingMultiuseHasGasFacility", "lodgingMultiuseHasRooms", "lodgingMultiuseHasEvacuationRoute"].includes(step.key)) {
      return state.answers.lodgingHasMultiuseBusiness === "yes";
    }
    // 노유자시설 전용 조건
    if (step.key === "elderlyWindowlessArea") return state.answers.elderlyHasWindowlessFloor === "yes";
    if (step.key === "elderlyHasGrillWindow") {
      return state.answers.elderlySubtype === "general"
        && toNumber(state.answers.elderlyArea) < 300;
    }
    if (step.key === "elderlyHasFloor500Plus") return state.answers.elderlySubtype === "general";
    if (step.key === "elderlyHas24HourStaff") {
      return state.answers.elderlySubtype === "general"
        && state.answers.elderlyHasFloor500Plus === "yes";
    }
    // 의료시설 전용 조건
    if (step.key === "medicalWindowlessArea") return state.answers.medicalHasWindowlessFloor === "yes";
    if (step.key === "medicalHasGrillWindow") {
      const sub = state.answers.medicalSubtype;
      const ma = toNumber(state.answers.medicalArea);
      return (sub === "psychiatricHospital" || sub === "rehabilitationFacility") && ma < 300;
    }
    return true;
  });
}

const screenLabels = {
  home: "홈",
  explorerSelect: "소방시설탐색기",
  explorer: "소방시설탐색기",
  explorerYear: "소방시설탐색기",
  date: "날짜 계산기",
  inspection: "작동·종합 대상 판독기",
  multiuse: "다중이용업소 판독기",
  guide: "이용 안내",
  reportGuide: "자체점검 보고서 읽는법",
  occupancy: "수용인원 계산기",
  facilities: "소방시설 설명",
};

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
  if (typeof gtag === "function") {
    gtag("event", "screen_view", {
      screen_name: screenLabels[name] || name,
    });
  }
}

function getTotalFloors() {
  return toNumber(state.answers.aboveGroundFloors) + toNumber(state.answers.basementFloors);
}

function updateProgress() {
  const activeSteps = getActiveSteps();
  const current = state.currentStep + 1;
  const total = activeSteps.length;
  const percent = Math.round((current / total) * 100);
  document.getElementById("progress-text").textContent = `${current} / ${total}`;
  document.getElementById("progress-percent").textContent = `${percent}%`;
  document.getElementById("progress-bar").style.width = `${percent}%`;
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

function renderNumberStep(step) {
  const input = document.createElement("input");
  input.className = "calc-input";
  input.type = "number";
  input.min = String(step.min ?? 0);
  input.step = String(step.step ?? 1);
  input.placeholder = step.placeholder ?? "";
  input.value = state.answers[step.key] ?? "";
  input.addEventListener("input", (event) => {
    state.answers[step.key] = event.target.value;
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

  if (step.key === "multiuseSimpleSprinklerCheck") {
    const selectedKeys = [
      "multiuseInBasement",
      "multiuseIsSealed",
      "multiuseIsPostpartum",
      "multiuseIsGosiwon",
      "multiuseIsGunRange",
    ];

    const toggleOption = (name) => {
      state.answers[name] = state.answers[name] === "yes" ? "no" : "yes";
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
    multiuseOnSecondToTenthFloor: toBool(state.answers.multiuseOnSecondToTenthFloor) && state.answers.multiuseInBasement !== "yes",
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
  ["multiuse-reason-list", "multiuse-transitional-notes"].forEach((id) => {
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

  // 피난기구 (2~10층)
  if (input.multiuseOnSecondToTenthFloor) {
    requiredItems.push({ category: categories.evacuation, name: "피난기구", status: "required", reason: "다중이용업소가 2층부터 10층 사이에 설치돼 있어 피난기구 설치대상입니다. 주로 구조대나 피난사다리를 설치하며, 법에는 완강기 설치가 가능하지만 대구에서는 완강기 설치가 불가합니다." });
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
}

function renderMultiuseEntryButton(input) {
  const button = document.getElementById("open-multiuse-safety");
  if (!button) return;
  const multiuse = evaluateMultiuseFacilities(input);
  button.classList.toggle("hidden", !input.hasMultiuseBusiness || (multiuse.requiredItems.length === 0 && multiuse.extraSafetyItems.length === 0));
}

function renderLodgingMultiuseEntryButton(input) {
  const button = document.getElementById("open-multiuse-safety");
  if (!button) return;
  const multiuse = evaluateLodgingMultiuseFacilities(input);
  button.classList.toggle("hidden", !input.lodgingHasMultiuseBusiness || (multiuse.requiredItems.length === 0 && multiuse.extraSafetyItems.length === 0));
}

function renderMultiuseSafetyCard(input) {
  clearMultiuseSections();
  const multiuse = evaluateMultiuseFacilities(input);
  document.getElementById("multiuse-safety-summary").innerHTML = `<div class="ib-title">다중이용업소 안전시설 기준</div>입력한 조건을 기준으로 다중이용업소에 설치해야 하는 안전시설만 별도로 정리했습니다.`;
  renderResultGroup("multiuse-reason-list", multiuse.reasonItems);
  renderTransitionalNotes(multiuse.transitionalNotes);
}

function renderLodgingMultiuseSafetyCard(input) {
  clearMultiuseSections();
  const multiuse = evaluateLodgingMultiuseFacilities(input);
  document.getElementById("multiuse-safety-summary").innerHTML = `<div class="ib-title">다중이용업소 안전시설 기준</div>입력한 조건을 기준으로 다중이용업소에 설치해야 하는 안전시설만 별도로 정리했습니다.`;
  renderResultGroup("multiuse-reason-list", multiuse.reasonItems);
  renderTransitionalNotes(multiuse.transitionalNotes);
}

function renderResults(results, input) {
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
  if (!["neighborhood", "lodging", "elderly", "medical"].includes(state.answers.occupancyType)) {
    showToast("지금은 근린생활시설, 숙박시설, 노유자시설, 의료시설만 판정할 수 있습니다. 해당 용도를 선택해 주세요.");
    return;
  }
  const input = normalizeAnswers();

  if (input.occupancyType === "lodging") {
    const results = evaluateLodgingFacility(input);
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
    showExplorerCard("main-result");
    scrollToTop();
    return;
  }

  if (input.occupancyType === "elderly") {
    const results = evaluateElderlyFacility(input);
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
    showExplorerCard("main-result");
    scrollToTop();
    return;
  }

  if (input.occupancyType === "medical") {
    const results = evaluateMedicalFacility(input);
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
    showExplorerCard("main-result");
    scrollToTop();
    return;
  }

  const results = evaluateNeighborhoodFacility(input);
  renderExtraItems(input);
  showExplorerCard("main-result");
  renderResults(results, input);
  scrollToTop();
}

function getFloorCount(input) {
  switch (input.occupancyType) {
    case "lodging": return input.lodgingAboveGroundFloors || 0;
    case "elderly": return input.elderlyAboveGroundFloors || 0;
    case "medical": return input.medicalAboveGroundFloors || 0;
    default: return input.aboveGroundFloors || 0;
  }
}

function renderExtraItems(input) {
  const section = document.getElementById("extra-items-section");
  const list = document.getElementById("extra-items-list");
  if (!section || !list) return;

  const items = [];

  const facilityNames = { lodging: "숙박시설", elderly: "노유자시설", medical: "의료시설" };
  const floors = getFloorCount(input);

  if (["lodging", "elderly", "medical"].includes(input.occupancyType)) {
    items.push({ name: "방염", reason: `${facilityNames[input.occupancyType]}은 방염 규정 적용 대상입니다.` });
  } else if (input.occupancyType === "neighborhood" && floors >= 11) {
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
    items.push({ name: "비상용 승강기", reason: "11층 이상 건물에 설치 대상입니다." });
  }

  list.innerHTML = "";
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "facility-row";
    row.innerHTML = `<span class="fr-dot" style="background:var(--amber);"></span><span>${item.name}</span>`;
    list.appendChild(row);
  });

  section.classList.toggle("hidden", items.length === 0);
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

function renderDateCalculator() {
  const root = document.getElementById("date-content");
  const prevLeftScroll = root.querySelector(".date-left")?.scrollTop ?? 0;
  const prevRightScroll = root.querySelector(".date-right")?.scrollTop ?? 0;
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
  const holidayKeys = new Set(mode.supportsHolidaySelection ? state.dateCalc.holidays : []);
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
    : "calc-table";

  if (mode.kind === "inspect_report") {
    const countedDates = addInspectReportDays(baseDate, mode.days, holidayKeys);
    countedDates.forEach((date) => rangeKeys.add(dateKey(date)));
    deadline = countedDates[countedDates.length - 1];
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
      <div class="cl-item"><span class="cl-dot" style="background: #cda7ff;"></span>입력 공휴일</div>
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
      <div class="cl-item"><span class="cl-dot" style="background: rgba(217, 48, 37, 0.18);"></span>선임기한 범위</div>
      <div class="cl-item"><span class="cl-dot" style="background: rgba(217, 48, 37, 0.45); border: 1.5px solid rgba(217, 48, 37, 0.85);"></span>선임기한</div>
      <div class="cl-item"><span class="cl-dot" style="background: rgba(66, 133, 244, 0.14);"></span>선임신고 범위</div>
      <div class="cl-item"><span class="cl-dot" style="background: rgba(66, 133, 244, 0.42); border: 1.5px solid rgba(66, 133, 244, 0.85);"></span>선임신고기한</div>
      <div class="cl-item"><span class="cl-dot" style="background: #cda7ff;"></span>입력 공휴일</div>
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
      <div class="cl-item"><span class="cl-dot" style="background: rgba(217, 48, 37, 0.18);"></span>이행완료 범위</div>
      <div class="cl-item"><span class="cl-dot" style="background: rgba(217, 48, 37, 0.45); border: 1.5px solid rgba(217, 48, 37, 0.85);"></span>이행완료기한</div>
      <div class="cl-item"><span class="cl-dot" style="background: rgba(66, 133, 244, 0.14);"></span>완료신고 범위</div>
      <div class="cl-item"><span class="cl-dot" style="background: rgba(66, 133, 244, 0.42); border: 1.5px solid rgba(66, 133, 244, 0.85);"></span>완료신고기한</div>
      <div class="cl-item"><span class="cl-dot" style="background: #cda7ff;"></span>입력 공휴일</div>
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
      <section class="calc-card assistant-staffing-card">
        <h3 class="calc-title">소방안전관리보조자 선임인원 계산기</h3>
        <p class="calc-copy">위의 선임대상·선임인원 기준으로 그대로 계산합니다.</p>
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

  root.innerHTML = `
    <div class="date-mode-header">
      <div class="calc-mode-tabs">
        ${Object.entries(CALC_MODES).map(([key, cfg]) => `<button class="calc-mode-btn${key === state.dateCalc.mode ? " active" : ""}" type="button" data-mode="${key}">${cfg.short}</button>`).join("")}
      </div>
    </div>
    <div class="date-layout">
      <div class="date-left">
        <section class="calc-card">
          <h3 class="calc-title">${mode.label}</h3>
          <p class="calc-copy">${modeIntroBody}</p>
          ${mode.kind === "noncompliance_dual" ? `
          <div class="calc-mode-tabs calc-mode-tabs-detail">
            ${Object.entries(mode.actionTypes).map(([key, cfg]) => `
              <div class="calc-mode-option">
                <button class="calc-mode-btn calc-mode-btn-info${key === state.dateCalc.noncomplianceType ? " active" : ""}" type="button" data-noncompliance-type="${key}">
                  <span class="calc-mode-btn-label">${cfg.label}</span>
                  <span class="calc-mode-info" tabindex="0" aria-label="${cfg.tooltip}" data-floating-tooltip="${cfg.tooltip}">i</span>
                </button>
              </div>
            `).join("")}
          </div>
          ` : ""}
          ${mode.supportsHolidaySelection ? `
          <div class="holiday-toggle">
            <button class="holiday-toggle-btn${state.dateCalc.selectMode === "base" ? " active" : ""}" type="button" data-select-mode="base">기산일 선택</button>
            <button class="holiday-toggle-btn${state.dateCalc.selectMode === "holiday" ? " active" : ""}" type="button" data-select-mode="holiday">입력 공휴일 지정</button>
          </div>
          <p class="calc-copy">${mode.kind === "noncompliance_dual" ? "완료신고기한 계산에 반영할 공휴일이 있으면 입력 공휴일 지정 버튼을 눌러 추가해주세요. 이행완료기한에는 반영되지 않습니다." : "기간 내에 공휴일이 있으면 입력 공휴일 지정 버튼을 눌러서 수동으로 공휴일을 추가해주세요."}</p>
          ` : ""}
          <div class="cal-wrap">
            <div class="cal-nav">
              <button class="cal-nav-btn" type="button" data-cal-nav="-1">‹</button>
              <div class="cal-month">${viewYear}년 ${viewMonth + 1}월</div>
              <button class="cal-nav-btn" type="button" data-cal-nav="1">›</button>
            </div>
            <div class="cal-dow">
              <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>
            </div>
            <div class="cal-grid">${cells.join("")}</div>
          </div>
          <div class="cal-legend">
            ${legendMarkup}
          </div>
          <div class="calc-form-row">
            <label>${mode.baseDateLabel}</label>
            <input id="calc-base-date" class="calc-input" type="date" value="${state.dateCalc.baseDate}">
          </div>
        </section>
      </div>
      <div class="date-right">
        ${resultSection || '<div class="date-empty">📅<br>날짜를 선택하면<br>결과가 여기에 표시됩니다.</div>'}
        ${resultSection ? '<button id="add-to-home-btn" class="btn btn-primary add-to-home-btn" type="button">📌 제출기한 메인화면에 표시</button>' : ""}
        <section class="calc-card">
          <div class="info-box ${mode.infoTone}"><div class="ib-title">${mode.infoTitle}</div>${modeInfoBody}</div>
          <p class="section-label">${mode.tableTitle}</p>
          <div class="calc-table-wrap">
            <table class="${tableClassName}">
              <thead><tr>${mode.tableHead.map((head) => `<th>${head}</th>`).join("")}</tr></thead>
              <tbody>${tableBody.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
            </table>
          </div>
          ${(mode.extraSections || []).map((sec) => `
            <p class="section-label" style="margin-top:16px;${sec.titleColor === 'red' ? 'color:var(--red-soft);' : ''}">${sec.title}</p>
            <div class="info-box blue" style="margin-bottom:0;">${sec.content}</div>
          `).join("")}
        </section>
        ${assistantCalculatorSection}
      </div>
    </div>
  `;

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
  root.querySelectorAll("[data-date]").forEach((button) => {
    button.addEventListener("click", () => {
      if (mode.supportsHolidaySelection && state.dateCalc.selectMode === "holiday") {
        const clicked = button.dataset.date;
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
  root.querySelector("#calc-base-date").addEventListener("input", (event) => {
    state.dateCalc.baseDate = event.target.value;
    const selected = parseDate(event.target.value);
    state.dateCalc.viewYear = selected.getFullYear();
    state.dateCalc.viewMonth = selected.getMonth();
    renderDateCalculator();
  });
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

function renderInspection() {
  const root = document.getElementById("inspection-content");
  const current = inspectionState.current;
  const currentStep = inspectionState.history.length + 1;

  if (current && typeof current === "object") {
    const isComp = current.result === "comprehensive";
    root.innerHTML = "";
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
    root.appendChild(card);
    return;
  }

  const node = inspectionNodes[current];
  if (!node) return;

  root.innerHTML = "";
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
    btn.addEventListener("click", () => inspectionSelect(option));
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

  root.appendChild(card);
}

function inspectionSelect(option) {
  inspectionState.history.push(inspectionState.current);
  inspectionState.current = option.next;
  renderInspection();
  const scrollEl = document.querySelector("#screen-inspection .scroll-content");
  if (scrollEl) scrollEl.scrollTo({ top: 0, behavior: "smooth" });
}

function inspectionBack() {
  if (inspectionState.history.length > 0) {
    inspectionState.current = inspectionState.history.pop();
    renderInspection();
  }
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

function renderMultiuse() {
  const root = document.getElementById("multiuse-content");
  const current = multiuseState.current;
  const currentStep = multiuseState.history.length + 1;

  if (current && typeof current === "object") {
    const isYes = current.result === "yes";
    root.innerHTML = "";
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
    root.appendChild(card);
    return;
  }

  const node = multiuseNodes[current];
  if (!node) return;

  root.innerHTML = "";
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
    btn.addEventListener("click", () => multiuseSelect(option));
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

  root.appendChild(card);
  initFloatingTooltips(card);
}

function multiuseSelect(option) {
  multiuseState.history.push(multiuseState.current);
  multiuseState.current = option.next;
  renderMultiuse();
  const scrollEl = document.querySelector("#screen-multiuse .scroll-content");
  if (scrollEl) scrollEl.scrollTo({ top: 0, behavior: "smooth" });
}

function multiuseBack() {
  if (multiuseState.history.length > 0) {
    multiuseState.current = multiuseState.history.pop();
    renderMultiuse();
  }
}

function multiuseRestart() {
  multiuseState.history = [];
  multiuseState.current = "start";
  renderMultiuse();
}

// ─────────────────────────────────────────────────────────────────────────────

document.getElementById("open-explorer").addEventListener("click", () => {
  gtag("event", "menu_click", { menu_name: "소방시설탐색기" });
  showScreen("explorerSelect");
});
document.getElementById("back-from-explorer-select").addEventListener("click", () => showScreen("home"));
document.getElementById("explorer-select-simple").addEventListener("click", () => {
  explorerRuntime.mode = "default";
  applyExplorerModeUI();
  showScreen("explorer");
  restartExplorer();
});
document.getElementById("explorer-select-detailed").addEventListener("click", () => {
  showScreen("explorerYear");
  yearWizardRestart();
});
document.getElementById("open-date-calculator").addEventListener("click", () => {
  gtag("event", "menu_click", { menu_name: "날짜계산기" });
  showScreen("date");
  renderDateCalculator();
});
document.getElementById("open-inspection-decoder").addEventListener("click", () => {
  gtag("event", "menu_click", { menu_name: "작동종합대상판독기" });
  inspectionRestart();
  showScreen("inspection");
});
document.getElementById("open-multiuse-decoder").addEventListener("click", () => {
  gtag("event", "menu_click", { menu_name: "다중이용업소판독기" });
  multiuseRestart();
  showScreen("multiuse");
});
document.getElementById("back-from-multiuse").addEventListener("click", () => showScreen("home"));

// ── 수용인원 계산기 ──────────────────────────────────────────

const occupancyState = {
  step: "category",  // "category" | "lodging_sub" | "assembly_sub" | "input"
  type: "lodging_bed",
  values: {},
};

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

  if (occupancyState.step === "category") {
    root.innerHTML = `
      <section class="wq-card occ-full-card">
        <p class="wq-label">STEP 1</p>
        <h2 class="wq-title">용도 선택</h2>
        <p class="wq-sub">산정 방식이 다른 용도를 먼저 선택하세요.</p>
        <div class="occ-category-list">
          <button class="choice-button" data-occ-cat="lodging"><strong>숙박시설</strong><span>호텔·모텔·여관 등 — 침대 유무에 따라 산정 방식이 다릅니다</span></button>
          <button class="choice-button" data-occ-cat="classroom"><strong>강의실·교무실·상담실·실습실·휴게실</strong><span>바닥면적 ÷ 1.9㎡</span></button>
          <button class="choice-button" data-occ-cat="assembly"><strong>강당·문화집회·운동·종교시설</strong><span>좌석 형태에 따라 산정 방식이 다릅니다</span></button>
          <button class="choice-button" data-occ-cat="other"><strong>그 밖의 특정소방대상물</strong><span>바닥면적 ÷ 3㎡</span></button>
        </div>
      </section>
    `;
    root.querySelectorAll("[data-occ-cat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cat = btn.dataset.occCat;
        if (cat === "lodging") {
          occupancyState.step = "lodging_sub";
        } else if (cat === "assembly") {
          occupancyState.step = "assembly_sub";
        } else {
          occupancyState.step = "input";
          occupancyState.type = cat === "classroom" ? "classroom" : "other";
          occupancyState.values = {};
        }
        renderOccupancyCalculator();
      });
    });
    return;
  }

  if (occupancyState.step === "lodging_sub") {
    root.innerHTML = `
      <section class="wq-card occ-full-card">
        <p class="wq-label">STEP 2</p>
        <h2 class="wq-title">숙박시설</h2>
        <p class="wq-sub">침대 여부에 따라 산정 방식이 달라집니다.</p>
        <div class="occ-category-list">
          <button class="choice-button" data-occ-type="lodging_bed"><strong>침대가 있는 숙박시설</strong><span>종사자 수 + 침대 수 (2인용은 2개로 산정)</span></button>
          <button class="choice-button" data-occ-type="lodging_no_bed"><strong>침대가 없는 숙박시설</strong><span>종사자 수 + 숙박 바닥면적 ÷ 3㎡</span></button>
        </div>
        <button class="btn btn-ghost" style="width:100%;margin-top:12px;" data-occ-back>← 이전으로</button>
      </section>
    `;
    root.querySelectorAll("[data-occ-type]").forEach((btn) => {
      btn.addEventListener("click", () => {
        occupancyState.type = btn.dataset.occType;
        occupancyState.step = "input";
        occupancyState.values = {};
        renderOccupancyCalculator();
      });
    });
    root.querySelector("[data-occ-back]").addEventListener("click", () => {
      occupancyState.step = "category";
      renderOccupancyCalculator();
    });
    return;
  }

  if (occupancyState.step === "assembly_sub") {
    root.innerHTML = `
      <section class="wq-card occ-full-card">
        <p class="wq-label">STEP 2</p>
        <h2 class="wq-title">강당·문화집회·운동·종교시설</h2>
        <p class="wq-sub">좌석 형태를 선택하세요.</p>
        <div class="occ-category-list">
          <button class="choice-button" data-occ-type="assembly_free"><strong>자유석</strong><span>바닥면적 ÷ 4.6㎡</span></button>
          <button class="choice-button" data-occ-type="assembly_fixed"><strong>고정 의자</strong><span>의자 수</span></button>
          <button class="choice-button" data-occ-type="assembly_bench"><strong>긴 의자</strong><span>의자 너비 × 개수 ÷ 0.45m</span></button>
        </div>
        <button class="btn btn-ghost" style="width:100%;margin-top:12px;" data-occ-back>← 이전으로</button>
      </section>
    `;
    root.querySelectorAll("[data-occ-type]").forEach((btn) => {
      btn.addEventListener("click", () => {
        occupancyState.type = btn.dataset.occType;
        occupancyState.step = "input";
        occupancyState.values = {};
        renderOccupancyCalculator();
      });
    });
    root.querySelector("[data-occ-back]").addEventListener("click", () => {
      occupancyState.step = "category";
      renderOccupancyCalculator();
    });
    return;
  }

  // step === "input"
  const type = occupancyState.type;
  const typeInfo = occupancyTypes.find((t) => t.key === type);
  const fields = getOccupancyFields(type);
  const fieldValues = occupancyState.values || {};
  const inputStep = ["lodging_bed", "lodging_no_bed", "assembly_free", "assembly_fixed", "assembly_bench"].includes(type) ? 3 : 2;

  root.innerHTML = `
    <section class="wq-card occ-full-card">
      <p class="wq-label">STEP ${inputStep}</p>
      <h2 class="wq-title">${typeInfo.label}</h2>
      <p class="wq-sub">${typeInfo.desc}<br><span style="font-size:11px;color:var(--text-dim);">※ 복도·계단·화장실 바닥면적은 포함하지 않습니다.</span></p>
      ${fields.map((f) => `
        <div class="calc-form-row">
          <label>${f.label}</label>
          <input class="calc-input" type="number" min="0" step="0.1" placeholder="${f.placeholder}" data-occ-field="${f.key}" value="${fieldValues[f.key] ?? ""}">
        </div>
      `).join("")}
      <button class="btn btn-ghost" style="width:100%;margin-top:14px;" data-occ-back>← 이전으로</button>
    </section>
  `;

  root.querySelector("[data-occ-back]").addEventListener("click", () => {
    occupancyState.step = getOccupancyBackStep(type);
    renderOccupancyCalculator();
  });

  root.querySelectorAll("[data-occ-field]").forEach((input) => {
    input.addEventListener("input", () => {
      if (!occupancyState.values) occupancyState.values = {};
      occupancyState.values[input.dataset.occField] = input.value;
      const fields2 = getOccupancyFields(occupancyState.type);
      const allFilled = fields2.every((f) => {
        const v = occupancyState.values[f.key];
        return v !== undefined && v !== "";
      });
      const resultEl = root.querySelector(".calc-result");
      if (allFilled) {
        const newResult = calcOccupancy(occupancyState.type, occupancyState.values);
        if (resultEl) {
          resultEl.querySelector(".calc-result-date").textContent = `${newResult.toLocaleString()} 명`;
        } else {
          const currentTypeInfo = occupancyTypes.find((t) => t.key === occupancyState.type);
          const newResultEl = document.createElement("section");
          newResultEl.className = "calc-result";
          newResultEl.innerHTML = `<div class="calc-result-label">산정 결과</div><div class="calc-result-date">${newResult.toLocaleString()} 명</div><div class="calc-result-meta">${currentTypeInfo.label} 기준 법정 수용인원입니다.<br>소수점 이하는 반올림합니다.</div>`;
          root.appendChild(newResultEl);
        }
      } else if (resultEl) {
        resultEl.remove();
      }
    });
  });
}

screens.occupancy = document.getElementById("screen-occupancy");
screens.facilities = document.getElementById("screen-facilities");
document.getElementById("open-occupancy-calculator").addEventListener("click", () => {
  gtag("event", "menu_click", { menu_name: "수용인원계산기" });
  occupancyState.step = "category";
  occupancyState.type = "lodging_bed";
  occupancyState.values = {};
  renderOccupancyCalculator();
  showScreen("occupancy");
});
document.getElementById("back-from-occupancy").addEventListener("click", () => showScreen("home"));
document.getElementById("back-from-inspection").addEventListener("click", () => showScreen("home"));
document.getElementById("back-from-explorer").addEventListener("click", () => showScreen("home"));
// =============================================
// 연도별 탐색기 (Year-based Explorer)
// =============================================

const YD = {
  D19811106: 19811106,
  D19840701: 19840701,
  D19820928: 19820928,
  D19900701: 19900701,
  D19910108: 19910108,
  D19920728: 19920728,
  D19940720: 19940720,
  D19970927: 19970927,
  D19990729: 19990729,
  D20010521: 20010521,
  D20020330: 20020330,
  D20040530: 20040530,
  D20061207: 20061207,
  D20080229: 20080229,
  D20110707: 20110707,
  D20120215: 20120215, // 정신의료기관 간이스프링클러 신설 (2012년 2월)
  D20120914: 20120914,
  D20130109: 20130109,
  D20130210: 20130210,
  D20140708: 20140708, // 요양병원 스프링클러·간이스프링클러·FACP·속보 추가 (2014년 7월)
  D20150701: 20150701,
  D20160101: 20160101,
  D20170128: 20170128,
  D20180128: 20180128,
  D20180627: 20180627,
  D20190806: 20190806,
  D20220225: 20220225,
  D20221201: 20221201,
  D20240517: 20240517,
  D20241231: 20241231,
  D20251201: 20251201,
};

const yearState = {
  currentStep: 0,
  answers: {
    yEraChoice: "after2004",
    yOccupancyType: "neighborhood",
    yPermitDate: "2019-02-18",
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
    ],
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
    condition: (ya) => ya.yOccupancyType === "neighborhood" && (parseFloat(ya.yTotalArea) || 0) < 1500,
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
    condition: (ya, pd) => ya.yOccupancyType === "neighborhood" && pd >= YD.D20040530 && pd < YD.D20180128,
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
      { value: "general", label: "일반 근린생활시설", description: "상가, 식당, 사무실, 의원 등" },
      { value: "bathhouse", label: "일반목욕장(욕탕)", description: "목욕장으로 쓰이는 경우" },
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
    condition: (ya) => ya.yOccupancyType === "neighborhood",
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
    condition: (ya) => ya.yOccupancyType === "neighborhood",
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
    condition: (ya, pd) => ya.yOccupancyType === "lodging" && pd >= YD.D20040530 && pd < YD.D20170128,
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
    condition: (ya) => ya.yOccupancyType === "lodging",
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
    condition: (ya) => ya.yOccupancyType === "lodging",
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
    condition: (ya, pd) => ya.yOccupancyType === "elderly" && pd >= YD.D20080229,
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
    condition: (ya) => ya.yOccupancyType === "elderly" && (parseFloat(ya.yTotalArea) || 0) < 1500,
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
    condition: (ya) => ya.yOccupancyType === "elderly" && ya.yElderlySubtype === "general",
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
    condition: (ya, pd) => ya.yOccupancyType === "elderly" && pd >= YD.D20120914,
  },
  {
    key: "yElderlyFirstSecondFloorArea",
    type: "ynumber",
    title: "지상 1층·2층 바닥면적 합계(㎡)",
    help: "옥외소화전 설치 여부를 판단합니다. 해당 없으면 0을 입력하세요.",
    placeholder: "예: 0",
    min: 0,
    step: 0.1,
    condition: (ya) => ya.yOccupancyType === "elderly",
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
    help: "제연설비 설치 여부를 판단합니다. (2015년 7월 1일 이후 적용) 해당 없으면 0을 입력하세요.",
    placeholder: "예: 0",
    min: 0,
    step: 0.1,
    condition: (ya) => ya.yOccupancyType === "elderly",
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
    condition: (ya) => ya.yOccupancyType === "medical" && (parseFloat(ya.yTotalArea) || 0) < 1500,
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
      pd >= YD.D20140708,
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
    condition: (ya) => ya.yOccupancyType === "medical",
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
    help: "제연설비 설치 여부를 판단합니다. (2015년 7월 1일 이후 적용) 해당 없으면 0을 입력하세요.",
    placeholder: "예: 0",
    min: 0,
    step: 0.1,
    condition: (ya, pd) => ya.yOccupancyType === "medical" && pd >= YD.D20150701,
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
    condition: (ya) => ya.yOccupancyType === "religious" && (parseFloat(ya.yTotalArea) || 0) < 3000,
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
    condition: (ya) => ya.yOccupancyType === "religious",
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
];

function yearGetActiveSteps() {
  const ya = yearState.answers;
  const pd = yPermitDateInt();
  const clinicApplicable = pd >= YD.D20190806 && ya.yIsClinicWithInpatient === "yes";
  const hemApplicable = pd >= YD.D20241231 && ya.yHasHemodialysis === "yes";
  const postpartumApplicable = pd >= YD.D20220225 && ya.yIsPostpartum === "yes";
  const autoDispatch = clinicApplicable || hemApplicable || postpartumApplicable;
  return yearSteps.filter((step) => {
    if (step.key === "yEraChoice") return true;

    // ── 분법 이전 근린생활시설 ──
    if (ya.yEraChoice === "before2004" && ya.yOccupancyType === "neighborhood") {
      const ta = parseFloat(ya.yTotalArea) || 0;
      const ag = parseInt(ya.yAboveGroundFloors) || 0;
      const preBefore1992 = pd > 0 && pd < YD.D19920728;
      const postAfter1992Before2004 = pd >= YD.D19920728;
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
      const ta = parseFloat(ya.yTotalArea) || 0;
      const ag = parseInt(ya.yAboveGroundFloors) || 0;
      const preBefore1992 = pd > 0 && pd < YD.D19920728;
      const postAfter1992 = pd >= YD.D19920728;
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
      const ta = parseFloat(ya.yTotalArea) || 0;
      const alwaysShow = ["yOccupancyType", "yPermitDate", "yTotalArea", "yAboveGroundFloors", "yBasementSet", "yWindowlessSet", "yBefore2004ReligiousParkingElecSet"];
      if (alwaysShow.includes(step.key)) return true;
      if (step.key === "yBefore2004ReligiousHasLargeFloor600") return ta < 3000;
      return false;
    }

    if (ya.yEraChoice === "before2004") return step.key === "yOccupancyType";

    if (ya.yEraChoice !== "after2004") return false;
    return !step.condition || step.condition(ya, pd, autoDispatch);
  });
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
    if (name === "yBasementAreaSum") yearRecalcF12();
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
    btn.addEventListener("click", () => { yearState.answers[name] = opt.value; yearRenderCurrentStep(); });
    buttons.appendChild(btn);
  });
  wrapper.appendChild(buttons);
  return wrapper;
}

function yearRenderChoiceStep(step) {
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
  return wrapper;
}

function yearRenderNumberStep(step) {
  const input = document.createElement("input");
  input.className = "calc-input";
  input.type = "number";
  input.min = String(step.min ?? 0);
  input.step = String(step.step ?? 1);
  input.placeholder = step.placeholder ?? "";
  input.value = yearState.answers[step.key] ?? "";
  // 용도별 바닥면적 필드는 연면적을 초과할 수 없음
  const areaFields = ["yNeighborhoodArea", "yLodgingArea", "yElderlyArea", "yMedicalArea"];
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
      yearRecalcF12();
    }
    // 층수 변경 시 1·2층 면적 재계산
    if (step.key === "yAboveGroundFloors" || step.key === "yBasementFloors") {
      yearRecalcF12();
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
    wrapper.appendChild(makeYearField("지하층수", "yBasementFloors", ya.yBasementFloors, { min: 0, step: 1, placeholder: "없으면 0" }));
    wrapper.appendChild(makeYearField("지하층 바닥면적 합계(㎡)", "yBasementAreaSum", ya.yBasementAreaSum, { min: 0, step: 0.1, placeholder: "없으면 0" }));
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
    [
      { name: "yMultiuseInBasement", label: "지하층에 설치돼 있음", description: "해당되면 선택" },
      { name: "yMultiuseIsSealed", label: "밀폐구조의 영업장", description: "해당되면 선택" },
      { name: "yMultiuseIsPostpartum", label: "산후조리업", description: "해당되면 선택" },
      { name: "yMultiuseIsGosiwon", label: "고시원", description: "해당되면 선택" },
      { name: "yMultiuseIsGunRange", label: "권총사격장", description: "해당되면 선택" },
    ].forEach((option) => {
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
    [
      { name: "yLodgingMultiuseInBasement", label: "지하층에 설치돼 있음", description: "해당되면 선택" },
      { name: "yLodgingMultiuseIsSealed", label: "밀폐구조의 영업장", description: "해당되면 선택" },
      { name: "yLodgingMultiuseIsPostpartum", label: "산후조리업", description: "해당되면 선택" },
      { name: "yLodgingMultiuseIsGosiwon", label: "고시원", description: "해당되면 선택" },
      { name: "yLodgingMultiuseIsGunRange", label: "권총사격장", description: "해당되면 선택" },
    ].forEach((option) => {
      optionList.appendChild(makeToggleChoiceButton({ label: option.label, description: option.description, selected: ya[option.name] === "yes", onClick: () => toggleOption(option.name) }));
    });
    const noneSelected = selectedKeys.every((name) => ya[name] !== "yes");
    optionList.appendChild(makeToggleChoiceButton({ label: "해당사항 없음", description: "선택한 항목이 없으면 선택", selected: noneSelected, onClick: () => { selectedKeys.forEach((name) => { yearState.answers[name] = "no"; }); yearRenderCurrentStep(); } }));
    wrapper.appendChild(optionList);
  }

  return wrapper;
}

function yearRenderCurrentStep() {
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
  const total = activeSteps.length;
  const current = yearState.currentStep + 1;
  const pct = Math.round((current / total) * 100);
  document.getElementById("year-progress-text").textContent = `${current} / ${total}`;
  document.getElementById("year-progress-percent").textContent = `${pct}%`;
  document.getElementById("year-progress-bar").style.width = `${pct}%`;
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
  if (preBefore1992) {
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
      results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "review",
        "지하층·무창층·11층 이상 층이 없어 유도표지 설치 대상입니다. (유도등은 해당 없음)", ""));
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
  } else if (bf > 0 && ba >= 150) {
    // 2001.05.21~2004.05.29: 다중이용업소의 지하층 영업장 150㎡이상이면 설치 대상
    results.push(makeResult(categories.extinguishing, "간이스프링클러설비", "", "review",
      "2001년 5월 21일부터 건물 내 다중이용업소(노래연습장·단란주점·휴게음식점 등)의 지하층 영업장 바닥면적이 150㎡ 이상이면 간이스프링클러설비 설치 대상입니다. 해당 영업장 여부를 확인하세요.", ""));
  } else {
    results.push(makeResult(categories.extinguishing, "간이스프링클러설비", "", "notRequired",
      "다중이용업소 지하층 영업장이 없거나 면적 기준에 해당하지 않아 설치 대상이 아닙니다.", ""));
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
      guideReason = "지하층·무창층·11층 이상 층이 없어 유도표지 설치 대상입니다. (유도등은 해당 없음)";
      results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "review", guideReason, ""));
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
      results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "review",
        "지하층·무창층·11층 이상 층이 없어 유도표지 설치 대상입니다. (유도등은 해당 없음)", ""));
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
      results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "review",
        "지하층·무창층·11층 이상 층이 없어 유도표지 설치 대상입니다. (유도등은 해당 없음)", ""));
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
    results.push(makeResult(categories.fireSupport, "제연설비", "", smokeCtrlReq ? "required" : "review",
      smokeCtrlReq ? "지상 11층 이상으로 특별피난계단에 제연설비를 설치해야 합니다."
      : "의료시설의 일반 거실·병실은 제연설비 설치 대상이 아닙니다. 다만 특별피난계단 및 비상용승강기의 계단실·승강장 부분에는 제연설비를 설치해야 합니다.", ""));
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
      results.push(makeResult(categories.evacuation, "유도등 및 유도표지", "", "review",
        "지하층·무창층·11층 이상 층이 없어 유도표지 설치 대상입니다. (유도등은 해당 없음)", ""));
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
    results.push(makeResult(categories.fireSupport, "제연설비", "", smokeCtrlReq ? "required" : "review",
      smokeCtrlReq ? "지상 11층 이상으로 특별피난계단에 제연설비를 설치해야 합니다."
      : "노유자시설의 일반 거실은 제연설비 설치 대상이 아닙니다. 다만 특별피난계단 및 비상용승강기의 계단실·승강장 부분에는 제연설비를 설치해야 합니다.", ""));
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
  const radioHigh = pd >= YD.D20120914 && inp.aboveGroundFloors >= 30;
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
  results.push(makeResult(categories.evacuation, "피난기구(구조대·완강기 등)", "",
    ag >= 3 ? "required" : "notRequired",
    ag >= 3 ? "숙박시설은 3층 이상 10층 이하 층에 피난기구를 설치해야 합니다." :
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
  const radioHigh = pd >= YD.D20120914 && ag >= 30;
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
  } else if (pd >= YD.D20150701) {
    smokeReq = inp.elderlyBasementAreaForSmoke >= 1000;
    smokeReason = smokeReq
      ? "지하층·무창층 내 노유자시설 사용 바닥면적 합계가 1,000㎡ 이상입니다."
      : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    smokeReason = "2015년 7월 1일 이전에는 노유자시설은 제연설비 설치 대상이 아니었습니다.";
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
  const radioHigh = pd >= YD.D20120914 && ag >= 30;
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
  } else if (pd >= YD.D20150701) {
    smokeReq = inp.medicalBasementAreaForSmoke >= 1000;
    smokeReason = smokeReq
      ? "지하층·무창층 내 의료시설 사용 바닥면적 합계가 1,000㎡ 이상입니다."
      : "현재 입력 기준으로는 설치 대상이 아닙니다.";
  } else {
    smokeReason = "2015년 7월 1일 이전에는 의료시설은 제연설비 설치 대상이 아니었습니다.";
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
  const radioHigh = pd >= YD.D20120914 && ag >= 30;
  results.push(makeResult(categories.fireSupport, "무선통신보조설비", "",
    radioBase || radioHigh ? "required" : "notRequired",
    ba >= 3000 ? "지하층 바닥면적 합계가 3,000㎡ 이상입니다." :
    bf >= 3 && ba >= 1000 ? "지하층이 3층 이상이고 지하층 바닥면적 합계가 1,000㎡ 이상입니다." :
    radioHigh ? "지상층수가 30층 이상으로 16층 이상 부분에 설치 대상입니다." :
    "현재 입력 기준으로는 설치 대상이 아닙니다.", ""));

  return results;
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
  if (emLight && emLight.status === "required" && portableLight && portableLight.status === "required") {
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

function yearShowResults() {
  if (!yearCurrentStepIsValid()) {
    showToast("현재 질문의 값을 먼저 입력해 주세요.");
    return;
  }
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
    const summaryHtml = `<div class="ib-title">입력값 기준</div>근린생활시설(${subtypeLabel}), 건축허가일 ${permitStr}, 연면적 ${inp.totalArea}㎡, 지상 ${inp.aboveGroundFloors}층, 지하 ${inp.basementFloors}층`;
    const exceptionItems = [{ category: "안내", name: "설치 제외·대체 없음", status: "notRequired", reason: "구 소방법 적용 구간으로 별도 제외·대체 안내는 제공되지 않습니다." }];
    const allRequiredItems = results.filter((r) => r.status === "required" || r.status === "review");
    document.getElementById("year-result-summary").innerHTML = summaryHtml;
    renderSimpleRequiredList(allRequiredItems, "year-required-list");
    renderResultGroup("year-criteria-list", results, [], allRequiredItems.map((i) => i.name));
    renderResultGroup("year-exception-list", exceptionItems);
    document.getElementById("year-question-card").classList.add("hidden");
    document.getElementById("year-result-card").classList.remove("hidden");
    document.getElementById("year-prog-wrap").classList.add("hidden");
    yearScrollToTop();
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
    const summaryHtml = `<div class="ib-title">입력값 기준</div>숙박시설, 건축허가일 ${permitStr}, 연면적 ${inp.totalArea}㎡, 지상 ${inp.aboveGroundFloors}층, 지하 ${inp.basementFloors}층`;
    const exceptionItems = [{ category: "안내", name: "설치 제외·대체 없음", status: "notRequired", reason: "구 소방법 적용 구간으로 별도 제외·대체 안내는 제공되지 않습니다." }];
    const allRequiredItems = results.filter((r) => r.status === "required" || r.status === "review");
    document.getElementById("year-result-summary").innerHTML = summaryHtml;
    renderSimpleRequiredList(allRequiredItems, "year-required-list");
    renderResultGroup("year-criteria-list", results, [], allRequiredItems.map((i) => i.name));
    renderResultGroup("year-exception-list", exceptionItems);
    document.getElementById("year-question-card").classList.add("hidden");
    document.getElementById("year-result-card").classList.remove("hidden");
    document.getElementById("year-prog-wrap").classList.add("hidden");
    yearScrollToTop();
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
    const summaryHtml = `<div class="ib-title">입력값 기준</div>노유자시설, 건축허가일 ${permitStr}, 연면적 ${inp.totalArea}㎡, 지상 ${inp.aboveGroundFloors}층, 지하 ${inp.basementFloors}층`;
    const exceptionItems = [{ category: "안내", name: "설치 제외·대체 없음", status: "notRequired", reason: "구 소방법 적용 구간으로 별도 제외·대체 안내는 제공되지 않습니다." }];
    const allRequiredItems = results.filter((r) => r.status === "required" || r.status === "review");
    document.getElementById("year-result-summary").innerHTML = summaryHtml;
    renderSimpleRequiredList(allRequiredItems, "year-required-list");
    renderResultGroup("year-criteria-list", results, [], allRequiredItems.map((i) => i.name));
    renderResultGroup("year-exception-list", exceptionItems);
    document.getElementById("year-question-card").classList.add("hidden");
    document.getElementById("year-result-card").classList.remove("hidden");
    document.getElementById("year-prog-wrap").classList.add("hidden");
    yearScrollToTop();
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
    const summaryHtml = `<div class="ib-title">입력값 기준</div>의료시설(${subtypeLabel}), 건축허가일 ${permitStr}, 연면적 ${inp.totalArea}㎡, 지상 ${inp.aboveGroundFloors}층, 지하 ${inp.basementFloors}층`;
    const exceptionItems = [{ category: "안내", name: "설치 제외·대체 없음", status: "notRequired", reason: "구 소방법 적용 구간으로 별도 제외·대체 안내는 제공되지 않습니다." }];
    const allRequiredItems = results.filter((r) => r.status === "required" || r.status === "review");
    document.getElementById("year-result-summary").innerHTML = summaryHtml;
    renderSimpleRequiredList(allRequiredItems, "year-required-list");
    renderResultGroup("year-criteria-list", results, [], allRequiredItems.map((i) => i.name));
    renderResultGroup("year-exception-list", exceptionItems);
    document.getElementById("year-question-card").classList.add("hidden");
    document.getElementById("year-result-card").classList.remove("hidden");
    document.getElementById("year-prog-wrap").classList.add("hidden");
    yearScrollToTop();
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
    const summaryHtml = `<div class="ib-title">입력값 기준</div>종교시설, 건축허가일 ${permitStr}, 연면적 ${inp.totalArea}㎡, 지상 ${inp.aboveGroundFloors}층, 지하 ${inp.basementFloors}층`;
    const exceptionItems = [{ category: "안내", name: "설치 제외·대체 없음", status: "notRequired", reason: "구 소방법 적용 구간으로 별도 제외·대체 안내는 제공되지 않습니다." }];
    const allRequiredItems = results.filter((r) => r.status === "required" || r.status === "review");
    document.getElementById("year-result-summary").innerHTML = summaryHtml;
    renderSimpleRequiredList(allRequiredItems, "year-required-list");
    renderResultGroup("year-criteria-list", results, [], allRequiredItems.map((i) => i.name));
    renderResultGroup("year-exception-list", exceptionItems);
    document.getElementById("year-question-card").classList.add("hidden");
    document.getElementById("year-result-card").classList.remove("hidden");
    document.getElementById("year-prog-wrap").classList.add("hidden");
    yearScrollToTop();
    return;
  }
  if (yearState.answers.yEraChoice === "before2004") {
    document.getElementById("year-result-summary").innerHTML =
      `<div class="ib-title">소방법 분법 이전 (1981. 11. 6. ~ 2004. 5. 29.)</div>` +
      `해당 용도에 대한 분법 이전 기준은 현재 준비 중입니다.`;
    document.getElementById("year-required-list").innerHTML = "";
    document.getElementById("year-criteria-list").innerHTML = "";
    document.getElementById("year-exception-list").innerHTML = "";
    document.getElementById("year-question-card").classList.add("hidden");
    document.getElementById("year-result-card").classList.remove("hidden");
    document.getElementById("year-prog-wrap").classList.add("hidden");
    yearScrollToTop();
    return;
  }
  const pd = yPermitDateInt();
  if (pd < YD.D20040530) {
    showToast("이 도구는 2004년 5월 30일 이후 건축허가 건물만 분석 가능합니다.");
    return;
  }
  const inp = yearNormalizeAnswers();
  const rawPermit = yearState.answers.yPermitDate;
  const [py, pm, pd2] = rawPermit.split("-").map(Number);
  const permitStr = `${py}년 ${pm}월 ${pd2}일`;
  let results;
  let summaryHtml;

  let exceptionItems = [];
  if (inp.occupancyType === "lodging") {
    results = yearEvaluateLodging(inp);
    exceptionItems = yearBuildLodgingExceptionItems(results, inp);
    summaryHtml = `<div class="ib-title">입력값 기준</div>숙박시설, 건축허가일 ${permitStr}, 연면적 ${inp.totalArea}㎡, 숙박 사용면적 ${inp.lodgingArea}㎡, 지상 ${inp.aboveGroundFloors}층, 지하 ${inp.basementFloors}층`;
  } else if (inp.occupancyType === "elderly") {
    results = yearEvaluateElderly(inp);
    exceptionItems = yearBuildElderlyExceptionItems(results, inp);
    const subtypeLabel = inp.elderlySubtype === "living" ? "노유자 생활시설" : "일반 노유자시설";
    summaryHtml = `<div class="ib-title">입력값 기준</div>노유자시설(${subtypeLabel}), 건축허가일 ${permitStr}, 연면적 ${inp.totalArea}㎡, 노유자 사용면적 ${inp.elderlyArea}㎡, 지상 ${inp.aboveGroundFloors}층, 지하 ${inp.basementFloors}층`;
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
    summaryHtml = `<div class="ib-title">입력값 기준</div>의료시설(${subtypeLabel}), 건축허가일 ${permitStr}, 연면적 ${inp.totalArea}㎡, 의료 사용면적 ${inp.medicalArea}㎡, 지상 ${inp.aboveGroundFloors}층, 지하 ${inp.basementFloors}층`;
  } else if (inp.occupancyType === "religious") {
    results = yearEvaluateReligious(inp);
    exceptionItems = yearBuildReligiousExceptionItems(results, inp);
    summaryHtml = `<div class="ib-title">입력값 기준</div>종교시설, 건축허가일 ${permitStr}, 연면적 ${inp.totalArea}㎡, 지상 ${inp.aboveGroundFloors}층, 지하 ${inp.basementFloors}층`;
  } else {
    results = yearEvaluateNeighborhood(inp);
    exceptionItems = yearBuildNeighborhoodExceptionItems(results, inp);
    summaryHtml = `<div class="ib-title">입력값 기준</div>근린생활시설, 건축허가일 ${permitStr}, 연면적 ${inp.totalArea}㎡, 지상 ${inp.aboveGroundFloors}층, 지하 ${inp.basementFloors}층`;
  }

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
  renderResultGroup("year-criteria-list", results, [...excludedNames], requiredItems.map((i) => i.name));
  renderResultGroup("year-exception-list", exceptionItems);

  // 다중이용업소 버튼 표시 여부
  const yearMultiuseBtn = document.getElementById("year-open-multiuse-safety");
  if (yearMultiuseBtn) {
    if (inp.occupancyType === "neighborhood" && inp.hasMultiuseBusiness) {
      const mu = evaluateMultiuseFacilities(inp);
      yearMultiuseBtn.classList.toggle("hidden", mu.requiredItems.length === 0 && (mu.extraSafetyItems || []).length === 0);
    } else if (inp.occupancyType === "lodging" && inp.lodgingHasMultiuseBusiness) {
      const mu = evaluateLodgingMultiuseFacilities(inp);
      yearMultiuseBtn.classList.toggle("hidden", mu.requiredItems.length === 0 && (mu.extraSafetyItems || []).length === 0);
    } else {
      yearMultiuseBtn.classList.add("hidden");
    }
  }

  document.getElementById("year-question-card").classList.add("hidden");
  document.getElementById("year-result-card").classList.remove("hidden");
  document.getElementById("year-multiuse-safety-card").classList.add("hidden");
  document.getElementById("year-prog-wrap").classList.add("hidden");
  yearScrollToTop();
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
  let multiuse;
  if (inp.occupancyType === "lodging" && inp.lodgingHasMultiuseBusiness) {
    multiuse = evaluateLodgingMultiuseFacilities(inp);
  } else {
    multiuse = evaluateMultiuseFacilities(inp);
  }
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
document.getElementById("open-guide").addEventListener("click", () => showScreen("guide"));

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
    showScreen("explorerSelect");
  } else {
    moveStep(-1);
  }
});
document.getElementById("next-step").addEventListener("click", () => {
  const activeSteps = getActiveSteps();
  const currentStep = activeSteps[state.currentStep];
  if (explorerRuntime.mode === "year" && state.currentStep === activeSteps.length - 1) {
    showToast("연도별_테스트중은 아직 결과 계산을 준비 중입니다. 질문 흐름만 테스트할 수 있습니다.");
    return;
  }
  if (currentStep?.key === "hasMultiuseBusiness" && state.answers.hasMultiuseBusiness === "no") {
    if (explorerRuntime.mode === "year") {
      showToast("연도별_테스트중은 아직 결과 계산을 준비 중입니다. 질문 흐름만 테스트할 수 있습니다.");
      return;
    }
    showResults();
    return;
  }
  if (currentStep?.key === "lodgingHasMultiuseBusiness" && state.answers.lodgingHasMultiuseBusiness === "no") {
    if (explorerRuntime.mode === "year") {
      showToast("연도별_테스트중은 아직 결과 계산을 준비 중입니다. 질문 흐름만 테스트할 수 있습니다.");
      return;
    }
    showResults();
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
  showExplorerCard("multiuse-result");
  scrollToTop();
});
document.getElementById("back-to-main-result").addEventListener("click", () => {
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
document.getElementById("restart-explorer").addEventListener("click", restartExplorer);
document.getElementById("restart-explorer-from-multiuse").addEventListener("click", restartExplorer);
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

function deleteReminderById(id) {
  persistReminders(loadReminders().filter((r) => r.id !== id));
  renderHomeReminders();
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
};

const REMINDER_BASE_LABELS = {
  inspect_report: "점검완료일",
  fire_safety_manager: "해임·퇴직일",
  fire_safety_assistant_manager: "해임·퇴직일",
  hazardous_material_manager: "해임·퇴직일",
  noncompliance_action: "보고일",
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
        </div>
        <div class="reminder-empty">날짜 계산기에서 결과를 확인한 후<br>'메인화면에 표시' 버튼으로<br>추가할 수 있습니다.</div>
      </div>`;
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
        <div class="reminder-card-name">${r.objectName}</div>
        <span class="reminder-card-type">${REMINDER_TYPE_LABELS[r.type] || r.type}</span>
        <div class="reminder-card-dates">${datesHtml}</div>
        ${warningHtml}
      </div>`;
  }).join("");

  container.innerHTML = `
    <div class="reminder-panel">
      <div class="reminder-panel-header">
        <span class="reminder-panel-title">📌 제출기한 알림판</span>
        <span class="reminder-count">${reminders.length}건</span>
      </div>
      <div class="reminder-list">${cards}</div>
    </div>`;

  container.querySelectorAll("[data-reminder-id]").forEach((btn) => {
    btn.addEventListener("click", () => deleteReminderById(btn.dataset.reminderId));
  });
}

// Modal
let pendingReminderData = null;

function initReminderModal() {
  const modal = document.getElementById("reminder-modal");
  const nameInput = document.getElementById("reminder-object-name");

  document.getElementById("reminder-cancel-btn").addEventListener("click", () => {
    modal.classList.add("hidden");
    pendingReminderData = null;
  });

  document.getElementById("reminder-confirm-btn").addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (!name) { nameInput.focus(); return; }
    if (pendingReminderData) {
      const reminders = loadReminders();
      reminders.unshift({ ...pendingReminderData, objectName: name, id: Date.now().toString() });
      persistReminders(reminders);
      renderHomeReminders();
      showToast("메인화면 알림판에 추가되었습니다.");
    }
    modal.classList.add("hidden");
    pendingReminderData = null;
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) { modal.classList.add("hidden"); pendingReminderData = null; }
  });

  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("reminder-confirm-btn").click();
  });
}

function showAddReminderModal(data) {
  pendingReminderData = data;
  document.getElementById("reminder-object-name").value = "";
  document.getElementById("reminder-modal").classList.remove("hidden");
  setTimeout(() => document.getElementById("reminder-object-name").focus(), 50);
}

initReminderModal();
renderHomeReminders();

// ── Theme Toggle ──────────────────────────────────────────────
(function initTheme() {
  const THEMES = ['blossom', 'dark', 'official'];
  const THEME_META = {
    blossom:  { icon: '🌙',  title: '어두운 테마로 전환' },
    dark:     { icon: '☀️',  title: '낮 테마로 전환' },
    official: { icon: '🌸',  title: '벚꽃 테마로 전환' },
  };

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
    const meta = THEME_META[t];
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.textContent = meta.icon;
      btn.title = meta.title;
    });
  }

  document.querySelectorAll('.topbar').forEach(tb => {
    const btn = document.createElement('button');
    btn.className = 'theme-toggle-btn';
    btn.type = 'button';
    tb.appendChild(btn);
  });

  let saved = localStorage.getItem('theme') || 'blossom';
  if (saved === 'light') saved = 'official';
  applyTheme(saved);

  document.addEventListener('click', e => {
    if (e.target.closest('.theme-toggle-btn')) {
      const cur = document.documentElement.getAttribute('data-theme');
      const next = THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length];
      applyTheme(next);
    }
  });
})();
showScreen("home");

// ── Android 뒤로가기 버튼 ─────────────────────────────────────
(function initBackButton() {
  function getCurrentScreen() {
    return Object.keys(screens).find(k => screens[k].classList.contains("active")) || "home";
  }

  function handleBack() {
    const current = getCurrentScreen();

    if (current === "home") {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        window.Capacitor.Plugins.App.exitApp();
      }
      return;
    }

    // 연도별 탐색기
    if (current === "explorerYear") {
      const yearResultCard = document.getElementById("year-result-card");
      if (yearResultCard && !yearResultCard.classList.contains("hidden")) {
        document.getElementById("year-restart-btn").click();
        return;
      }
      if (yearState.currentStep > 0) {
        yearMoveStep(-1);
        return;
      }
    }

    // 소방시설탐색기
    if (current === "explorer") {
      const multiuseCard = document.getElementById("multiuse-safety-card");
      if (multiuseCard && !multiuseCard.classList.contains("hidden")) {
        document.getElementById("back-to-main-result").click();
        return;
      }
      const resultCard = document.getElementById("result-card");
      if (resultCard && !resultCard.classList.contains("hidden")) {
        document.getElementById("restart-explorer").click();
        return;
      }
      if (state.currentStep > 0) {
        document.getElementById("prev-step").click();
        return;
      }
    }

    // 작동·종합 대상 판독기
    if (current === "inspection") {
      if (inspectionState.history.length > 0) {
        inspectionBack();
        return;
      }
    }

    // 다중이용업소 판독기
    if (current === "multiuse") {
      if (multiuseState.history.length > 0) {
        multiuseBack();
        return;
      }
    }

    // 수용인원 계산기
    if (current === "occupancy") {
      if (occupancyState.step !== "category") {
        occupancyState.step = getOccupancyBackStep(occupancyState.type);
        renderOccupancyCalculator();
        return;
      }
    }

    showScreen("home");
  }

  function setup() {
    const App = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
    if (App) {
      App.addListener("backButton", handleBack);
    }
  }

  // Capacitor 네이티브 뒤로가기 리스너
  if (window.Capacitor) {
    var _capBackDone = false;
    function setup() {
      if (_capBackDone) return;
      var App = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
      if (App) {
        App.addListener("backButton", handleBack);
        _capBackDone = true;
      }
    }
    // 즉시 시도 + load 후 재시도 (브릿지 초기화 지연 대비)
    setup();
    window.addEventListener("load", setup);
  }

  // 네이티브 MainActivity.onBackPressed()에서 직접 호출하는 글로벌 함수
  window._appHandleBack = handleBack;

  // history/popstate 방식: 브라우저 및 Capacitor 폴백 모두 커버
  history.pushState({ app: true }, "");
  window.addEventListener("popstate", function () {
    history.pushState({ app: true }, "");
    handleBack();
  });
})();

// ── 바로가기 추가 ─────────────────────────────────────
(function initInstall() {
  if (window.Capacitor) return; // APK 환경에서는 불필요

  const APP_URL = 'https://carrotcakehope.github.io/fireapp/';
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
    '설치장소 동명을 기재(동이 1개면 미기입 가능)하고, 전체층/일부층 중 해당하는 □에 ✔ 표시합니다.',
    '설치 층수 범위를 지상/지하로 구분하여 기재합니다. (예: 지상 1층~3층)',
    '옥내소화전의 설치개수가 가장 많은 층의 설치 개수를 기재합니다.',
  ],
  'w04': [
    '종류(습식/부압식/준비작동식/건식/일제살수식) 중 해당하는 란에 ✔ 표시합니다.',
    '스프링클러설비(헤드) 설치 층수 범위를 지상/지하로 구분하여 기재합니다. (예: 지상 1층~3층 or 지하 1층)',
  ],
  'w05': [
    '간이스프링클러 종류와 설치장소(동명, 층 범위)를 기재합니다.',
    '스프링클러설비(헤드) 설치 층수 범위를 지상/지하로 구분하여 기재합니다. (예: 지상 1층~3층)',
  ],
  'w06': [
    '화재조기진압용 스프링클러는 랙식 창고 등 특수한 용도에 설치합니다.',
    '설치장소 동명, 층 범위, 헤드 수량을 기재합니다.',
  ],
  'w11': [
    '옥외소화전이 설치 된 총 개수를 기재합니다.',
  ],
  'a03': [
    '전용/겸용 여부를 확인하고 설치장소 동명, 전체층/일부층을 기재합니다.',
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
    '자동화재속보설비는 주로 수신기 바로 근처에 설치돼있지만, 해당건물에 일부의 용도(노유자 등)로 인해 설치된 경우 따로 설치된 경우도 있습니다(예시 : 수신기는 1층식당에 있는데, 자동화재속보설비는 3층 요양원에 설치된 경우)', 
  ],
  'a08': [
    '단독형(검지부와 수신부 일체)은 소규모 건물, 분리형(김지부와 수신부 분리)은 비교적 대형건물에 사용합니다.',
    '단독형일 경우, 수신기 설치장소는 기입하지 않아도 됩니다.',
    '가스 종류(LPG/LNG)를 확인하고 경계구역 수를 기재합니다.',
  ],
  'a10': [
    '시각경보기는 자동화재탐지설비 점검표 내에 함께 표시됩니다.',
    '경보방식 항목에서 시각경보기 유/무 □에 ✔ 표시합니다.',
  ],
  'e01': [
    '피난기구 종류(피난사다리/완강기/구조대 등)와 동별·층별 수량을 기재합니다.',
    '건물의 용도, 규모 등에 의해 피난기구의 종류와 수량이 달라집니다.',
    '대부분의 일반 건물에는 완강기를 설치(비용 적음)하고, 노유자시설에는 구조대, 다중이용업소에는 피난사다리가 많이 설치됩니다.',
  ],
  'e02': [
    '공기호흡기, 방열복, 공기안전매트, 인공소생기 중 설치된 것을 기재합니다.',
    '인명구조기구가 설치된 위치(동명, 층)를 비고란에 기재합니다.',
    '대상물의 용도에 따라 설치되는 인명구조기구가 다르고, 전체층 또는 일부층에 설치하는도 달라집니다.',
  ],
  'e03': [
    '피난구유도등, 통로유도등, 유도표지 등 해당 특정소방대상물에 설치된 유도등의 모든 종류를 기재합니다.',
    '대부분의 작은 건물에는 피난구와 통로유도등이 설치돼있고 1992년 7월 28일이전어 설치된 건물에는 유도표지가 설치된 곳도 있습니다.(10층 이하 유도표지, 11층 이상 유도등)',
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
    '<b>설치장소</b>: 연결송수관 설비가 설치된 설치장소 동명과 층 범위를 기재합니다.',
    '<b>방수구 위치 및 송수구 설치장소</b>: 방수구와 송수구가 설치된 장소를 확인하여 기입합니다.',
    '연결송수관설비 방수구는 옥내소화전함 내에 있는 경우가 많으며, 배관이 직상으로 설치되기 때문에 층마다 같은 위치에 설치되는 경우가 많습니다.',
    '<b>가압송수장치 설치장소</b>: 가압송수장치가 설치된 장소 및 전양정과 토출량 등을 기입합니다.',
    '건물의 층수가 높을 경우(70m이상, 약 23층~24층 이상) 소방차의 압력만으로는 건물의 꼭대기층까지 물이 도달할 수 없습니다. 그래서 별도로 가압송수장치를 설치합니다.',
    '<b>기동스위치 설치장소</b>: 가압송수장치를 기동시키는 스위치가 설치된 장소를 기입합니다. 주로 송수구 근처에 설치됩니다.',
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
      { id: 'w10', label: '강화액소화설비',                    st: '강화액소화설비' },
      { id: 'w11', label: '옥외소화전설비',                    st: '옥외소화전' },
    ],
  },
  {
    id: 'gas', sectionLabel: '3-4', page: 5, name: '가스계·분말소화설비',
    items: [
      { id: 'g01', label: '이산화탄소소화설비',                st: '이산화탄소' },
      { id: 'g02', label: '할론소화설비',                      st: '할론소화설비' },
      { id: 'g03', label: '할로겐화합물 및 불활성기체소화설비',st: '할로겐화합물' },
      { id: 'g04', label: '분말소화설비',                      st: '분말소화설비' },
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
const RG_WATER_IDS = new Set(['w03', 'w04', 'w05', 'w06', 'w07', 'w08', 'w09', 'w10', 'w11']);

// 수계소화설비 공동사항 항목
const RG_WATER_COMMON = [
  {
    id: '_wc_su', label: '수원', img: './image/inspection/수원.png',
    desc: [
      '수원의 종류(수조/고가수조/압력수조)와 저수량(㎥)을 기재합니다.',
      '주수원과 보조수원으로 구분하여 각각 용량과 위치를 기재합니다.',
      '고가수조 방식은 낙차(m)를, 압력수조 방식은 압력(㎫)을 기재합니다.',
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
      '설치 개수와 구경(65㎜)을 확인하여 기재합니다.',
    ],
  },
  {
    id: '_wc_bi', label: '비상전원', img: './image/inspection/비상전원.png',
    desc: [
      '비상전원 종류(자가발전설비/축전지설비/전기저장장치)에 해당하는 □에 ✔ 표시합니다.',
      '설치장소(동명, 층, 실명)와 용량(㎾ 또는 ㎾h)을 기재합니다.',
    ],
  },
];

function renderReportGuide(restoreScroll) {
  var root = document.getElementById('report-guide-content');

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
      '<b>대상물 구분(용도)</b>: 「소방시설 설치 및 관리에 관한 법률 시행령」 별표 2에 따른 특정소방대상물 구분을 기재합니다.',
      '<b>소재지</b>: 특정소방대상물의 주소를 기재합니다.',
    ],
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

    groupCb.addEventListener('change', function () {
      rgState.grade = 'custom';
      allItems.forEach(function (item, idx) {
        if (groupCb.checked) rgState.selected.add(item.id);
        else rgState.selected.delete(item.id);
        itemCbs[idx].checked = groupCb.checked;
      });
      groupCb.indeterminate = false;
    });

    c.appendChild(grid);
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
  gtag("event", "menu_click", { menu_name: "자체점검보고서읽는법" });
  rgState.tab = 'page1';
  showScreen('reportGuide');
  renderReportGuide();
});

document.getElementById('back-from-report-guide').addEventListener('click', function () {
  showScreen('home');
});

document.getElementById('open-contact').addEventListener('click', function () {
  document.getElementById('contact-confirm-modal').classList.remove('hidden');
});

document.getElementById('contact-confirm-cancel').addEventListener('click', function () {
  document.getElementById('contact-confirm-modal').classList.add('hidden');
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
document.getElementById('home-meta').textContent = PATCH_NOTES.version + ' / 최종 수정 ' + PATCH_NOTES.date;

// ── 개발자 모드 숨겨진 토글 (버전 5번 탭) ────────────────────────────────
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
        window['ga-disable-G-LKQZX5YS2H'] = false;
        showToast('개발자 모드 비활성화됨 — GA 추적 켜짐');
      } else {
        localStorage.setItem('devMode', 'true');
        window['ga-disable-G-LKQZX5YS2H'] = true;
        showToast('개발자 모드 활성화됨 — GA 추적 꺼짐');
      }
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

  if (localStorage.getItem('lastPatchSeen') !== today) {
    modal.classList.remove('hidden');
  }

  document.getElementById('pn-close-btn').addEventListener('click', function () {
    modal.classList.add('hidden');
  });

  document.getElementById('pn-hide-today-btn').addEventListener('click', function () {
    modal.classList.add('hidden');
    localStorage.setItem('lastPatchSeen', today);
  });
})();
