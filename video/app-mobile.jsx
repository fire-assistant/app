// app-mobile.jsx — portrait composition for mobile (1080×1920).
// Same timeline structure as PC but layout is vertical-centered with bigger
// type. No per-column highlight (single-column layout).

const TOTAL_M = 41;

const SCHEDULE_M = [
  { start: 9.0,  end: 14.0 },
  { start: 14.0, end: 18.0 },
  { start: 18.0, end: 22.0 },
  { start: 22.0, end: 26.0 },
  { start: 26.0, end: 30.0 },
  { start: 30.0, end: 34.0 },
];

function ActiveTrackerM({ children }) {
  const t = useTime();
  let active = -1;
  for (let i = 0; i < SCHEDULE_M.length; i++) {
    const s = SCHEDULE_M[i];
    if (t >= s.start && t < s.end) { active = i; break; }
  }
  return children(active);
}

function IntroTextM() {
  const t = useTime();

  // Phase A — chaos kicker
  const kickA = clamp((t - 0.4) / 0.7, 0, 1);
  const kickAOut = clamp((t - 4.0) / 0.5, 0, 1);
  const kickAOpacity = kickA * (1 - kickAOut);

  // Phase B — grid lock-in label
  const labelIn = clamp((t - 5.4) / 0.7, 0, 1);
  const labelOut = clamp((t - 8.5) / 0.5, 0, 1);
  const labelOpacity = labelIn * (1 - labelOut);

  return (
    <>
      <div style={{
        position: 'absolute',
        left: '50%', top: 720,
        transform: 'translateX(-50%)',
        opacity: kickAOpacity,
        textAlign: 'center',
        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
        pointerEvents: 'none',
        width: '100%',
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          fontSize: 22, letterSpacing: '0.4em', color: RED_M,
          fontWeight: 500, marginBottom: 36,
        }}>
          FIRE SAFETY ASSISTANT
        </div>
        <div style={{
          fontSize: 168, fontWeight: 900, color: FG_M,
          letterSpacing: '0.02em', lineHeight: 1.15,
        }}>
          예방업무는<br />복잡합니다.
        </div>
        <div style={{
          marginTop: 56,
          fontSize: 38, color: '#a8a39c',
          letterSpacing: '-0.02em', fontWeight: 400,
          lineHeight: 1.5,
        }}>
          면적 · 층수 · 용도 · 기한<br />법령 · 시설 · 점검 · 판정
        </div>
      </div>

      <div style={{
        position: 'absolute',
        left: '50%', top: 780,
        transform: 'translateX(-50%)',
        opacity: labelOpacity,
        textAlign: 'center',
        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
        pointerEvents: 'none',
        width: '100%',
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          fontSize: 22, letterSpacing: '0.4em', color: RED_M,
          fontWeight: 500, marginBottom: 36,
        }}>
          6 TOOLS · ONE WORKBENCH
        </div>
        <div style={{
          fontSize: 144, fontWeight: 900, color: FG_M,
          letterSpacing: '0.02em', lineHeight: 1.15,
        }}>
          이제, 쉽게<br />정리됩니다.
        </div>
      </div>
    </>
  );
}

function OutroM() {
  const t = useTime();
  const localStart = 34.3;
  if (t < localStart - 0.4) return null;

  const local = t - localStart;
  const inProg = clamp(local / 0.9, 0, 1);
  const eased = Easing.easeOutCubic(inProg);
  const opacity = eased;
  const ty = (1 - eased) * 30;

  const descProg = clamp((local - 0.6) / 0.8, 0, 1);
  const dotsProg = clamp((local - 2.4) / 0.6, 0, 1);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      pointerEvents: 'none',
      fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.78) 45%, rgba(5,5,5,0.5) 80%)',
        opacity,
      }} />

      <div style={{
        position: 'absolute',
        left: '50%', top: 660,
        transform: `translate(-50%, ${ty}px)`,
        opacity,
        textAlign: 'center',
        width: '100%',
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          fontSize: 26, letterSpacing: '0.42em', color: RED_M,
          fontWeight: 500, marginBottom: 28,
        }}>
          FIRE SAFETY ASSISTANT
        </div>
        <div style={{
          fontSize: 180, fontWeight: 900, color: FG_M,
          letterSpacing: '-0.045em', lineHeight: 0.95,
        }}>
          예방업무<br /><span style={{ color: RED_M }}>어시스턴트</span>
        </div>
      </div>

      <div style={{
        position: 'absolute',
        left: '50%', top: 1100,
        transform: 'translateX(-50%)',
        opacity: descProg,
        textAlign: 'center',
        fontSize: 40, color: '#cfcbc4',
        fontWeight: 400, letterSpacing: '-0.005em',
        lineHeight: 1.45,
        whiteSpace: 'pre-line',
      }}>
        법적기준과 서류제출 기한을{'\n'}한 화면에서 끝냅니다.
      </div>

      {/* Arcade-style CONTINUE? prompt */}
      {(() => {
        const blinkT = Math.max(0, local - 2.8);
        const sel = Math.floor(blinkT * 1.4) % 2;
        const cursorBlink = Math.sin(blinkT * 12) > -0.3 ? 1 : 0;
        return (
          <div style={{
            position: 'absolute', left: '50%', top: 1240,
            transform: 'translateX(-50%)',
            opacity: dotsProg,
            textAlign: 'center',
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          }}>
            <div style={{
              fontSize: 60, fontWeight: 700, color: RED_M,
              letterSpacing: '0.22em', marginBottom: 36,
            }}>CONTINUE?</div>
            <div style={{
              fontSize: 48, fontWeight: 700,
              letterSpacing: '0.16em',
              display: 'flex', gap: 90, justifyContent: 'center',
            }}>
              <span style={{
                color: sel === 0 ? RED_M : '#5a5550',
                position: 'relative',
              }}>
                <span style={{
                  position: 'absolute', left: -42, top: 0,
                  opacity: sel === 0 ? cursorBlink : 0,
                }}>▸</span>
                YES
              </span>
              <span style={{
                color: sel === 1 ? RED_M : '#5a5550',
                position: 'relative',
              }}>
                <span style={{
                  position: 'absolute', left: -42, top: 0,
                  opacity: sel === 1 ? cursorBlink : 0,
                }}>▸</span>
                YES
              </span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function DataFieldDimWrapperM() {
  const t = useTime();
  const dim = clamp((t - 34.3) / 0.8, 0, 1) * 0.55;
  return <DataFieldMobile dimGlobal={dim} />;
}

function AppM() {
  return (
    <Stage
      width={MOBILE_W}
      height={MOBILE_H}
      duration={TOTAL_M}
      background="#050505"
      persistKey="fire-intro-mobile"
    >
      <ActiveTrackerM>
        {(active) => (
          <>
            <DataFieldDimWrapperM />
            <IntroTextM />

            {SCHEDULE_M.map((s, i) => (
              <Sprite key={i} start={s.start} end={s.end}>
                <FeatureCardMobile feature={FEATURES_MOBILE[i]} />
                <StepCounterMobile active={i} />
              </Sprite>
            ))}

            <OutroM />
          </>
        )}
      </ActiveTrackerM>
    </Stage>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AppM />);
