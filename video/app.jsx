// app.jsx — main composition
// Timeline:
//   0.0 – 6.8s   intro: chaos -> grid forms
//   6.8 – 13.0s  feature 01 소방시설탐색기
//  13.0 – 19.0s  feature 02 날짜 계산기
//  19.0 – 25.0s  feature 03 자체점검 보고서 읽는법
//  25.0 – 31.0s  feature 04 소방시설 설명
//  31.0 – 37.0s  feature 05 작동·종합 대상 판독기
//  37.0 – 43.0s  feature 06 다중이용업소 판독기
//  43.0 – 49.0s  feature 07 수용인원 계산기
//  49.0 – 56.0s  outro: lockup

const TOTAL = 46;

const SCHEDULE = [
  { start: 9.0,  end: 14.0, col: 0 },
  { start: 14.0, end: 18.0, col: 1 },
  { start: 18.0, end: 22.0, col: 2 },
  { start: 22.0, end: 26.0, col: 3 },
  { start: 26.0, end: 30.0, col: 4 },
  { start: 30.0, end: 34.0, col: 5 },
  { start: 34.0, end: 39.0, col: 6 },
];

function ActiveColumnTracker({ children }) {
  const t = useTime();
  let active = -1;
  for (const s of SCHEDULE) {
    if (t >= s.start && t < s.end) { active = s.col; break; }
  }
  return children(active);
}

// ── Intro: kicker text during chaos phase, then label "07 TOOLS" as grid forms
function IntroText() {
  const t = useTime();

  // Phase A — kicker during chaos (0.4 → 4.5)
  const kickA = clamp((t - 0.4) / 0.7, 0, 1);
  const kickAOut = clamp((t - 4.0) / 0.5, 0, 1);
  const kickAOpacity = kickA * (1 - kickAOut);

  // Phase B — grid label as it locks in, holds long enough to read
  const labelIn = clamp((t - 5.4) / 0.7, 0, 1);
  const labelOut = clamp((t - 8.5) / 0.5, 0, 1);
  const labelOpacity = labelIn * (1 - labelOut);

  return (
    <>
      {/* Phase A: chaos kicker */}
      <div style={{
        position: 'absolute',
        left: '50%', top: 480,
        transform: `translateX(-50%)`,
        opacity: kickAOpacity,
        textAlign: 'center',
        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
        pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          fontSize: 14, letterSpacing: '0.4em', color: RED, fontWeight: 500,
          marginBottom: 22,
        }}>
          FIRE SAFETY ASSISTANT
        </div>
        <div style={{
          fontSize: 132, fontWeight: 900, color: FG,
          letterSpacing: '-0.04em', lineHeight: 0.92,
        }}>
          예방업무는<br />복잡합니다.
        </div>
        <div style={{
          marginTop: 28,
          fontSize: 40, color: '#a8a39c', letterSpacing: '-0.05em',
          fontWeight: 400,
        }}>
          면적 · 층수 · 용도 · 기한 · 법령 · 별표 · 점검 · 판정
        </div>
      </div>

      {/* Phase B: grid lock-in label */}
      <div style={{
        position: 'absolute',
        left: '50%', top: 470,
        transform: `translateX(-50%)`,
        opacity: labelOpacity,
        textAlign: 'center',
        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
        pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          fontSize: 14, letterSpacing: '0.4em', color: RED, fontWeight: 500,
          marginBottom: 22,
        }}>
          7 TOOLS · ONE WORKBENCH
        </div>
        <div style={{
          fontSize: 116, fontWeight: 900, color: FG,
          letterSpacing: '-0.04em', lineHeight: 0.92,
          whiteSpace: 'nowrap',
        }}>
          이제, 쉽게 정리됩니다.
        </div>
      </div>
    </>
  );
}

// ── Outro lockup
function Outro() {
  const t = useTime();
  const localStart = 39.0;
  if (t < localStart - 0.4) return null;

  const local = t - localStart;
  const inProg = clamp(local / 0.9, 0, 1);
  const eased = Easing.easeOutCubic(inProg);
  const opacity = eased;
  const ty = (1 - eased) * 24;

  // Description fades in slightly later
  const descProg = clamp((local - 0.6) / 0.8, 0, 1);
  const dotsProg = clamp((local - 1.2) / 0.8, 0, 1);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      pointerEvents: 'none',
      fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
    }}>
      {/* Wash to dim background data field */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 55%, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.78) 45%, rgba(5,5,5,0.5) 80%)`,
        opacity,
      }} />

      <div style={{
        position: 'absolute',
        left: '50%', top: 360,
        transform: `translate(-50%, ${ty}px)`,
        opacity,
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          fontSize: 16, letterSpacing: '0.42em', color: RED, fontWeight: 500,
          marginBottom: 36,
        }}>
          FIRE SAFETY ASSISTANT
        </div>
        <div style={{
          fontSize: 168, fontWeight: 900, color: FG,
          letterSpacing: '-0.045em', lineHeight: 0.92,
          whiteSpace: 'nowrap',
        }}>
          예방업무 <span style={{ color: RED }}>어시스턴트</span>
        </div>
      </div>

      <div style={{
        position: 'absolute',
        left: '50%', top: 700,
        transform: 'translateX(-50%)',
        opacity: descProg,
        textAlign: 'center',
        fontSize: 30, color: '#cfcbc4',
        fontWeight: 400, letterSpacing: '-0.005em',
        lineHeight: 1.45,
      }}>
        법적기준과 서류제출 기한 계산을<br />
        한 화면에서 끝냅니다.
      </div>

      {/* 7-dot reminder */}
      <div style={{
        position: 'absolute',
        left: '50%', top: 870,
        transform: 'translateX(-50%)',
        opacity: dotsProg,
        display: 'flex', gap: 10,
      }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} style={{
            width: 36, height: 4,
            background: RED,
            opacity: clamp(dotsProg * 7 - i, 0, 1),
          }} />
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <Stage
      width={STAGE_W}
      height={STAGE_H}
      duration={TOTAL}
      background="#050505"
      persistKey="fire-intro"
    >
      <ActiveColumnTracker>
        {(active) => (
          <>
            {/* Background grid is dimmed only during the outro */}
            <DataFieldDimWrapper active={active} />
            <IntroText />

            {SCHEDULE.map((s, i) => (
              <Sprite key={i} start={s.start} end={s.end}>
                <FeatureCard feature={FEATURES[i]} colIndex={s.col} />
              </Sprite>
            ))}

            <Outro />
          </>
        )}
      </ActiveColumnTracker>
    </Stage>
  );
}

function DataFieldDimWrapper({ active }) {
  const t = useTime();
  // Dim the data field during the outro
  const dim = clamp((t - 39.0) / 0.8, 0, 1) * 0.55;
  return <DataField activeFeature={active} dimGlobal={dim} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
