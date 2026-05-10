// feature-cards-mobile.jsx
// Vertical-stacked feature cards for portrait 1080×1920.
// Layout: big outlined number (top) → English label → Korean title (center)
//         → red underline → description → step counter (bottom).

const FEATURES_MOBILE = [
  {
    num: '01',
    title: '소방시설탐색기',
    titleEn: 'FACILITY EXPLORER',
    desc: '건물 정보를 입력하면\n의무 설치 소방시설을 도출합니다.',
  },
  {
    num: '02',
    title: '날짜 계산기',
    titleEn: 'DATE CALCULATOR',
    desc: '자체점검·선임·부적합 조치\n법정 기한을 자동 산정합니다.',
  },
  {
    num: '03',
    title: '보고서 읽는법',
    titleEn: 'REPORT GUIDE',
    desc: '실시결과 보고서 페이지마다\n작성·읽기 요령을 안내합니다.',
  },
  {
    num: '04',
    title: '소방시설 설명',
    titleEn: 'FACILITY DETAIL',
    desc: '시설별 개요·종류·구성·기준을\n한눈에 정리해 보여줍니다.',
  },
  {
    num: '05',
    title: '점검대상 판독기',
    titleEn: 'INSPECTION DECODER',
    desc: '작동기능점검·종합정밀점검\n대상 여부를 즉시 판정합니다.',
  },
  {
    num: '06',
    title: '다중이용업소 판독기',
    titleEn: 'MULTI-USE DECODER',
    desc: '업종·면적·층수 조건으로\n다중이용업소를 판별합니다.',
  },
  {
    num: '07',
    title: '수용인원 계산기',
    titleEn: 'OCCUPANCY CALCULATOR',
    desc: '용도별 법정 수용인원을\n바닥면적 입력만으로 산정합니다.',
  },
];

function FeatureCardMobile({ feature }) {
  const { localTime, duration } = useSprite();

  const numProg = clamp(localTime / 0.6, 0, 1);
  const numEase = Easing.easeOutCubic(numProg);
  const numY = (1 - numEase) * 30;

  const labelStart = 0.32;
  const labelProg = clamp((localTime - labelStart) / 0.5, 0, 1);

  const titleStart = 0.45;
  const titleProg = clamp((localTime - titleStart) / 0.55, 0, 1);
  const titleEase = Easing.easeOutCubic(titleProg);
  const titleY = (1 - titleEase) * 32;

  const descStart = 0.85;
  const descProg = clamp((localTime - descStart) / 0.6, 0, 1);
  const descY = (1 - descProg) * 18;

  const exitStart = duration - 0.55;
  let exitOpacity = 1;
  let exitY = 0;
  if (localTime > exitStart) {
    const e = clamp((localTime - exitStart) / 0.55, 0, 1);
    const eased = Easing.easeInCubic(e);
    exitOpacity = 1 - eased;
    exitY = -eased * 40;
  }

  return (
    <div style={{
      position: 'absolute', inset: 0,
      opacity: exitOpacity,
      transform: `translateY(${exitY}px)`,
      fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
    }}>
      {/* Vignette behind central title block to keep it readable above particles */}
      <div style={{
        position: 'absolute',
        left: '50%', top: 880,
        width: 1100, height: 700,
        transform: 'translateX(-50%)',
        background: 'radial-gradient(ellipse at 50% 50%, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.6) 50%, rgba(5,5,5,0) 80%)',
        opacity: titleEase * 0.95,
        pointerEvents: 'none',
      }} />

      {/* Big outlined number */}
      <div style={{
        position: 'absolute',
        left: '50%', top: 360 + numY,
        transform: 'translateX(-50%)',
        opacity: numEase,
        fontSize: 360,
        fontWeight: 900,
        lineHeight: 0.85,
        letterSpacing: '-0.05em',
        color: 'transparent',
        WebkitTextStroke: `3px ${RED_M}`,
      }}>
        {feature.num}
      </div>

      {/* English label */}
      <div style={{
        position: 'absolute',
        left: '50%', top: 880,
        transform: 'translateX(-50%)',
        opacity: labelProg * 0.92,
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: 24,
        letterSpacing: '0.36em',
        color: RED_M,
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}>
        {feature.titleEn}
      </div>

      {/* Korean title */}
      <div style={{
        position: 'absolute',
        left: '50%', top: 950 + titleY,
        transform: 'translateX(-50%)',
        opacity: titleEase,
        fontSize: 120,
        fontWeight: 900,
        letterSpacing: '-0.03em',
        color: FG_M,
        lineHeight: 1.0,
        whiteSpace: 'nowrap',
        textAlign: 'center',
      }}>
        {feature.title}
      </div>

      {/* Underline accent */}
      <div style={{
        position: 'absolute',
        left: '50%', top: 1130,
        transform: 'translateX(-50%)',
        height: 6,
        width: 200 * descProg,
        background: RED_M,
        opacity: descProg,
      }} />

      {/* Description */}
      <div style={{
        position: 'absolute',
        left: '50%', top: 1200 + descY,
        transform: 'translateX(-50%)',
        opacity: descProg,
        fontSize: 40,
        fontWeight: 400,
        color: '#cfcbc4',
        lineHeight: 1.5,
        whiteSpace: 'pre-line',
        letterSpacing: '-0.005em',
        textAlign: 'center',
        maxWidth: 980,
      }}>
        {feature.desc}
      </div>
    </div>
  );
}

function StepCounterMobile({ active }) {
  return (
    <div style={{
      position: 'absolute',
      left: '50%', bottom: 140,
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 16,
      alignItems: 'center',
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      fontSize: 22,
      letterSpacing: '0.18em',
      color: '#807a72',
    }}>
      <span>{String(active + 1).padStart(2, '0')}</span>
      <div style={{ display: 'flex', gap: 8 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} style={{
            width: i === active ? 40 : 18,
            height: 4,
            background: i === active ? RED_M : '#3a3530',
            transition: 'all 240ms ease',
          }} />
        ))}
      </div>
      <span>07</span>
    </div>
  );
}

window.FEATURES_MOBILE = FEATURES_MOBILE;
window.FeatureCardMobile = FeatureCardMobile;
window.StepCounterMobile = StepCounterMobile;
