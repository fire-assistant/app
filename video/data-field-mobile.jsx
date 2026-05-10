// data-field-mobile.jsx
// Portrait-friendly background data field. ~32 tokens that scatter chaotically
// then settle into a calm constellation around the central title area.
// No per-column highlight on mobile (single-column layout).

const RED_M = '#E63946';
const FG_M  = '#f5f3ee';
const DIM_M = '#5a5550';

const MOBILE_W = 1080;
const MOBILE_H = 1920;

// Mixed token pool — representative items pulled from each PC feature column.
const MOBILE_TOKENS = [
  '1,200㎡', 'F12', 'B2', '연면적', '스프링클러',
  'D-7', '2026.05.16', '제출 7일', '별표 4', '제5조',
  '점검표', '자탐', '소화기', 'kW', 'Ø50',
  '작동', '종합', '5,000㎡', '11F↑', 'INSP',
  '노래연습장', '고시원', '150㎡', '영업장',
  '300人', '바닥면적', '수용', 'OCC',
  '판정', 'CAL', '안전', 'SP',
];

const PARTICLE_COUNT_M = 32;
const M_CHAOS_END = 4.5;

function mulberry32_m(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildMobileParticles() {
  const rng = mulberry32_m(20260510);
  const list = [];

  // Settled positions: scatter across stage with a central exclusion band so
  // the title text reads cleanly. Particles bias toward top and bottom thirds.
  const exTop = MOBILE_H * 0.36;
  const exBot = MOBILE_H * 0.66;

  for (let i = 0; i < PARTICLE_COUNT_M; i++) {
    let ox, oy;
    let tries = 0;
    while (true) {
      ox = 60 + rng() * (MOBILE_W - 120);
      oy = 120 + rng() * (MOBILE_H - 240);
      tries++;
      if (oy < exTop || oy > exBot || tries > 25) break;
    }

    // Chaos origin: polar around stage center, biased outward.
    const angle = rng() * Math.PI * 2;
    const rNorm = Math.sqrt(rng());
    const r = 280 + rNorm * 760;
    const cx = MOBILE_W / 2 + Math.cos(angle) * r * 0.55;
    const cy = MOBILE_H / 2 + Math.sin(angle) * r;

    const driftRadius = 28 + rng() * 100;
    const driftSpeed = 0.22 + rng() * 0.6;
    const driftPhase = rng() * Math.PI * 2;
    const driftPhase2 = rng() * Math.PI * 2;

    const orderDelay = rng() * 1.2;
    const transitionDur = 1.4 + rng() * 0.6;

    const text = MOBILE_TOKENS[i % MOBILE_TOKENS.length];
    const sizeRoll = rng();
    const size =
      sizeRoll < 0.18 ? 38 :
      sizeRoll < 0.55 ? 26 :
      sizeRoll < 0.85 ? 20 : 16;

    const isMono = rng() < 0.55;
    const weight = sizeRoll < 0.18 ? 700 : (rng() < 0.4 ? 500 : 400);
    const opacityCalm = 0.42 + rng() * 0.4;
    const rotChaos = (rng() - 0.5) * 24;

    list.push({
      id: i, cx, cy, ox, oy,
      driftRadius, driftSpeed, driftPhase, driftPhase2,
      orderDelay, transitionDur,
      text, size, weight, isMono, opacityCalm, rotChaos,
    });
  }
  return list;
}

const MOBILE_PARTICLES = buildMobileParticles();

function DataFieldMobile({ dimGlobal = 0 }) {
  const t = useTime();

  return (
    <div style={{
      position: 'absolute', inset: 0,
      pointerEvents: 'none',
      fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
    }}>
      {MOBILE_PARTICLES.map((p) => {
        const myStart = M_CHAOS_END + p.orderDelay;
        const myEnd = myStart + p.transitionDur;

        const dx = Math.cos(t * p.driftSpeed + p.driftPhase) * p.driftRadius;
        const dy = Math.sin(t * p.driftSpeed * 0.8 + p.driftPhase2) * p.driftRadius * 0.6;
        const chaosX = p.cx + dx;
        const chaosY = p.cy + dy;

        const breathe = Math.sin(t * 0.4 + p.driftPhase) * 1.2;
        const breathe2 = Math.sin(t * 0.55 + p.driftPhase2) * 1.0;
        const orderX = p.ox + breathe;
        const orderY = p.oy + breathe2;

        let progress = 0;
        if (t >= myEnd) progress = 1;
        else if (t > myStart) {
          const local = (t - myStart) / p.transitionDur;
          progress = Easing.easeInOutCubic(clamp(local, 0, 1));
        }

        const x = chaosX + (orderX - chaosX) * progress;
        const y = chaosY + (orderY - chaosY) * progress;

        const rot = p.rotChaos * (1 - progress);
        const color = progress < 0.5 ? DIM_M : FG_M;

        let opacity;
        if (t < 0.4) {
          opacity = (t / 0.4) * 0.7;
        } else if (progress < 1) {
          opacity = 0.55 + progress * (p.opacityCalm - 0.55);
        } else {
          opacity = p.opacityCalm;
        }
        opacity *= (1 - dimGlobal);

        const fontFamily = p.isMono
          ? 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace'
          : 'Helvetica Neue, Helvetica, Arial, sans-serif';

        return (
          <div key={p.id} style={{
            position: 'absolute',
            left: x, top: y,
            transform: `translate(-50%, -50%) rotate(${rot}deg)`,
            color, opacity, fontFamily,
            fontSize: p.size, fontWeight: p.weight,
            letterSpacing: p.isMono ? '0.04em' : '-0.005em',
            whiteSpace: 'nowrap',
            willChange: 'transform, opacity, color',
          }}>
            {p.text}
          </div>
        );
      })}
    </div>
  );
}

window.DataFieldMobile = DataFieldMobile;
window.MOBILE_W = MOBILE_W;
window.MOBILE_H = MOBILE_H;
window.RED_M = RED_M;
window.FG_M = FG_M;
