// feature-cards.jsx
// 7 feature intro cards. Each is a Sprite-driven scene that uses the bold
// Korean title + number + minimalist visual.

const FEATURES = [
  {
    num: '01',
    title: '소방시설탐색기',
    titleEn: 'FACILITY EXPLORER',
    desc: '건물 정보를 입력하면\n의무 설치 소방시설을 도출합니다.',
    visual: 'building',
  },
  {
    num: '02',
    title: '날짜 계산기',
    titleEn: 'DATE CALCULATOR',
    desc: '자체점검·선임·부적합 조치\n법정 기한을 자동 산정합니다.',
    visual: 'calendar',
  },
  {
    num: '03',
    title: '자체점검 보고서 읽는법',
    titleEn: 'REPORT GUIDE',
    desc: '실시결과 보고서 페이지마다\n작성·읽기 요령을 안내합니다.',
    visual: 'report',
  },
  {
    num: '04',
    title: '소방시설 설명',
    titleEn: 'FACILITY DETAIL',
    desc: '시설별 개요·종류·구성·기준을\n한눈에 정리해 보여줍니다.',
    visual: 'spec',
  },
  {
    num: '05',
    title: '작동·종합 대상 판독기',
    titleEn: 'INSPECTION DECODER',
    desc: '작동기능점검·종합정밀점검\n대상 여부를 즉시 판정합니다.',
    visual: 'decode',
  },
  {
    num: '06',
    title: '다중이용업소 판독기',
    titleEn: 'MULTI-USE DECODER',
    desc: '업종·면적·층수 조건으로\n다중이용업소를 판별합니다.',
    visual: 'people',
  },
  {
    num: '07',
    title: '수용인원 계산기',
    titleEn: 'OCCUPANCY CALCULATOR',
    desc: '용도별 법정 수용인원을\n바닥면적 입력만으로 산정합니다.',
    visual: 'occupancy',
  },
];

function FeatureCard({ feature, colIndex }) {
  const { progress, localTime, duration } = useSprite();
  const t = useTime();

  // Card sits over the active column in the data-field
  const colCenter = COL_W * colIndex + COL_W / 2;

  // Big number — slides in from left
  const numProg = clamp(localTime / 0.6, 0, 1);
  const numEase = Easing.easeOutCubic(numProg);
  const numX = -120 + numEase * 120;
  const numOpacity = numEase;

  // Title — slides up after number
  const titleStart = 0.35;
  const titleProg = clamp((localTime - titleStart) / 0.55, 0, 1);
  const titleEase = Easing.easeOutCubic(titleProg);
  const titleY = (1 - titleEase) * 28;
  const titleOpacity = titleEase;

  // Description — fades in last
  const descStart = 0.75;
  const descProg = clamp((localTime - descStart) / 0.6, 0, 1);
  const descOpacity = descProg;
  const descY = (1 - descProg) * 16;

  // Exit
  const exitStart = duration - 0.55;
  let exitOpacity = 1;
  let exitX = 0;
  if (localTime > exitStart) {
    const e = clamp((localTime - exitStart) / 0.55, 0, 1);
    const eased = Easing.easeInCubic(e);
    exitOpacity = 1 - eased;
    exitX = -eased * 60;
  }

  // Connector line from card to its column
  const connectorProg = clamp((localTime - 0.5) / 0.6, 0, 1);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      opacity: exitOpacity,
      transform: `translateX(${exitX}px)`,
      fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
    }}>
      {/* Soft vignette so card text reads cleanly above the data field */}
      <div style={{
        position: 'absolute',
        left: 110, top: 230,
        width: 1100, height: 620,
        background: 'radial-gradient(ellipse at 30% 50%, rgba(5,5,5,0.78) 0%, rgba(5,5,5,0.6) 40%, rgba(5,5,5,0) 78%)',
        opacity: titleOpacity * 0.95,
        pointerEvents: 'none',
      }} />

      {/* Big number — outlined red */}
      <div style={{
        position: 'absolute',
        left: 140 + numX, top: 280,
        opacity: numOpacity,
        fontSize: 240,
        fontWeight: 900,
        lineHeight: 0.85,
        letterSpacing: '-0.05em',
        color: 'transparent',
        WebkitTextStroke: `2px ${RED}`,
        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
      }}>
        {feature.num}
      </div>

      {/* English label — small, above title */}
      <div style={{
        position: 'absolute',
        left: 150, top: 540,
        opacity: titleOpacity * 0.9,
        transform: `translateY(${titleY * 0.5}px)`,
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: 14,
        letterSpacing: '0.32em',
        color: RED,
        fontWeight: 500,
      }}>
        {feature.titleEn}
      </div>

      {/* Korean title — bold and big */}
      <div style={{
        position: 'absolute',
        left: 150, top: 575,
        opacity: titleOpacity,
        transform: `translateY(${titleY}px)`,
        fontSize: 96,
        fontWeight: 900,
        letterSpacing: '-0.03em',
        color: FG,
        lineHeight: 1.0,
        whiteSpace: 'nowrap',
      }}>
        {feature.title}
      </div>

      {/* Underline accent */}
      <div style={{
        position: 'absolute',
        left: 150, top: 695,
        height: 4,
        width: 120 * descProg,
        background: RED,
        opacity: descProg,
      }} />

      {/* Description */}
      <div style={{
        position: 'absolute',
        left: 150, top: 720,
        opacity: descOpacity,
        transform: `translateY(${descY}px)`,
        fontSize: 28,
        fontWeight: 400,
        color: '#cfcbc4',
        lineHeight: 1.5,
        whiteSpace: 'pre-line',
        letterSpacing: '-0.005em',
        maxWidth: 760,
      }}>
        {feature.desc}
      </div>

      {/* Connector pip pointing to the active column */}
      <div style={{
        position: 'absolute',
        left: colCenter - 7, top: 60,
        width: 14, height: 14,
        background: RED,
        opacity: connectorProg,
        transform: `scale(${connectorProg})`,
      }} />
      <div style={{
        position: 'absolute',
        left: colCenter - 0.5, top: 74,
        width: 1, height: 80 * connectorProg,
        background: `linear-gradient(180deg, ${RED}, transparent)`,
        opacity: connectorProg,
      }} />

      {/* Step counter — bottom right */}
      <StepCounter active={colIndex} />
    </div>
  );
}

function StepCounter({ active }) {
  return (
    <div style={{
      position: 'absolute',
      right: 80, bottom: 80,
      display: 'flex',
      gap: 14,
      alignItems: 'center',
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      fontSize: 14,
      letterSpacing: '0.18em',
      color: '#807a72',
    }}>
      <span>{String(active + 1).padStart(2, '0')}</span>
      <div style={{ display: 'flex', gap: 6 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} style={{
            width: i === active ? 28 : 12,
            height: 3,
            background: i === active ? RED : '#3a3530',
            transition: 'all 240ms ease',
          }} />
        ))}
      </div>
      <span>07</span>
    </div>
  );
}

window.FEATURES = FEATURES;
window.FeatureCard = FeatureCard;
