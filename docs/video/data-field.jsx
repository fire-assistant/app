// data-field.jsx
// Background "safety data points" — chaotic motion that converges into a 7-column grid
// representing the 7 features. Each column lights up red when its feature is active.

const RED = '#E63946';
const FG  = '#f5f3ee';
const DIM = '#5a5550';
const FAINT = '#2a2724';

// Per-feature data tokens (column = feature index 0..6)
const COLUMN_TOKENS = [
  // 0 — 소방시설 탐색기
  ['1,200㎡', 'F12', 'B2', '연면적', '스프링클러', '감지기', '옥내소화전', '유도등', '제연', '지상11층', '의무설치', 'SP', '500㎡↑', 'IND', '11F'],
  // 1 — 다중이용업소 탐색기
  ['노래연습장', 'PC방', '고시원', '음식점', '150㎡', '2층↑', '복층', '영업장', 'KARA', 'NET', 'F&B', 'MUL', '판정', '안전시설', 'M.U.'],
  // 2 — 법정기한 계산기
  ['D-7', '2026.05.16', '30일', '선임 60일', '점검일', '제출 7일', 'D-14', '01.31', '06.30', '부적합', '조치기한', 'CAL', 'YYYY/MM', 'D-2', 'DUE'],
  // 3 — 자체점검 가이드
  ['P.1', 'P.4', 'P.8', '별표 4', '제5조', '표지', '점검표', '대상물', '✓', '✕', '작동', '종합', '대상', '항목', '제출'],
  // 4 — 소방시설 도감
  ['옥내소화전', '자탐', '비상방송설비', '구성', '기준', '소화기', '경보기', '비상조명', 'kW', 'L/min', 'Ø50', 'SPEC', '유도등', '스프링클러', '소방서장'],
  // 5 — 유틸리티 도구함
  ['1.9㎡/人', '300人', '강의실', '숙박', '판매', '식당', '바닥면적', '수용인원', 'OCC', 'CAP', '보조자', '선임', '÷1.9', 'CALC', '名'],
];

const COLUMNS = 6;
const PER_COL = 12; // particles per column

// Stage geometry
const W = 1920;
const H = 1080;
const COL_W = W / COLUMNS;
const TOP_PAD = 110;
const BOT_PAD = 110;

// Pseudo-random with seed for stable layout
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildParticles() {
  const rng = mulberry32(20260509);
  const list = [];
  // Distribute chaotic origins around the stage with a hole in the middle so
  // they don't pile up over the central title text. Polar ring with elliptical
  // squish — outer reaches go off-canvas which looks correct.
  const total = COLUMNS * PER_COL;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  let placeIdx = 0;
  for (let c = 0; c < COLUMNS; c++) {
    const tokens = COLUMN_TOKENS[c];
    for (let i = 0; i < PER_COL; i++) {
      // Even angular distribution via golden-angle increment, then jitter
      const baseAngle = placeIdx * goldenAngle;
      const angle = baseAngle + (rng() - 0.5) * 0.9;
      placeIdx++;
      // Donut radius: minR keeps center clear, maxR pushes some off-canvas
      const minR = 460;
      const maxR = 1080;
      const rNorm = Math.sqrt(rng()); // bias outward
      const r = minR + rNorm * (maxR - minR);
      const cx = W / 2 + Math.cos(angle) * r * 1.1;
      const cy = H / 2 + Math.sin(angle) * r * 0.78;
      // Ordered grid position — column c, row i
      const colX = COL_W * c + COL_W / 2;
      const usableH = H - TOP_PAD - BOT_PAD;
      const rowY = TOP_PAD + (usableH * (i + 0.5)) / PER_COL;
      // Slight horizontal jitter so it doesn't look like a perfect grid
      const jitterX = (rng() - 0.5) * (COL_W * 0.55);
      const jitterY = (rng() - 0.5) * 14;

      const driftRadius = 32 + rng() * 130;
      const driftSpeed = 0.22 + rng() * 0.6;
      const driftPhase = rng() * Math.PI * 2;
      const driftPhase2 = rng() * Math.PI * 2;

      const orderDelay = rng() * 1.2;       // staggered convergence
      const transitionDur = 1.4 + rng() * 0.6;

      const text = tokens[i % tokens.length];
      const sizeRoll = rng();
      const size =
        sizeRoll < 0.15 ? 28 :
        sizeRoll < 0.45 ? 18 :
        sizeRoll < 0.8  ? 14 : 11;

      const isMono = rng() < 0.55;
      const weight = sizeRoll < 0.15 ? 700 : (rng() < 0.4 ? 500 : 400);
      const opacityCalm = 0.42 + rng() * 0.4;
      const rotChaos = (rng() - 0.5) * 24;

      list.push({
        id: c * 100 + i,
        col: c,
        cx, cy,
        ox: colX + jitterX,
        oy: rowY + jitterY,
        driftRadius, driftSpeed, driftPhase, driftPhase2,
        orderDelay, transitionDur,
        text, size, weight, isMono, opacityCalm, rotChaos,
      });
    }
  }
  return list;
}

const PARTICLES = buildParticles();

// Order phase — convergence centered around t=4.5s, finishes by 6.5s
const CHAOS_END = 4.5; // particles start moving toward grid
const ORDER_FULL = 6.8; // grid fully formed

function DataField({ activeFeature = -1, dimGlobal = 0 }) {
  const t = useTime();

  return (
    <div style={{
      position: 'absolute', inset: 0,
      pointerEvents: 'none',
      fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
    }}>
      {/* Subtle column dividers — appear with the grid */}
      <ColumnDividers t={t} activeFeature={activeFeature} />

      {PARTICLES.map((p) => {
        // Per-particle phase
        const myStart = CHAOS_END + p.orderDelay;
        const myEnd = myStart + p.transitionDur;

        // chaotic drift
        const dx = Math.cos(t * p.driftSpeed + p.driftPhase) * p.driftRadius;
        const dy = Math.sin(t * p.driftSpeed * 0.8 + p.driftPhase2) * p.driftRadius * 0.6;
        const chaosX = p.cx + dx;
        const chaosY = p.cy + dy;

        // ordered drift (much smaller; gives life to the grid)
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

        // rotation eases to 0 as it locks in
        const rot = p.rotChaos * (1 - progress);

        // Highlight particles whose column is the active feature
        const isActiveCol = p.col === activeFeature;
        const baseColor = progress < 0.5 ? DIM : FG;
        const color = isActiveCol ? RED : baseColor;

        // Opacity: fade in slightly during chaos, settle after
        let opacity;
        if (t < 0.4) {
          opacity = (t / 0.4) * 0.7;
        } else if (progress < 1) {
          opacity = 0.55 + progress * (p.opacityCalm - 0.55);
        } else {
          opacity = p.opacityCalm;
        }
        if (isActiveCol) opacity = Math.min(1, opacity + 0.45);

        // Global dim during outro etc
        opacity *= (1 - dimGlobal);

        const fontFamily = p.isMono
          ? 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace'
          : 'Helvetica Neue, Helvetica, Arial, sans-serif';

        return (
          <div key={p.id} style={{
            position: 'absolute',
            left: x, top: y,
            transform: `translate(-50%, -50%) rotate(${rot}deg)`,
            color,
            opacity,
            fontFamily,
            fontSize: p.size,
            fontWeight: p.weight,
            letterSpacing: p.isMono ? '0.04em' : '-0.005em',
            whiteSpace: 'nowrap',
            transition: isActiveCol ? 'color 200ms ease' : 'none',
            willChange: 'transform, opacity, color',
          }}>
            {p.text}
          </div>
        );
      })}
    </div>
  );
}

function ColumnDividers({ t, activeFeature }) {
  // Fade lines in as the grid forms
  const lineOpacity = clamp((t - (CHAOS_END + 0.3)) / 1.6, 0, 1) * 0.18;
  if (lineOpacity < 0.005) return null;

  const lines = [];
  for (let c = 1; c < COLUMNS; c++) {
    lines.push(
      <div key={c} style={{
        position: 'absolute',
        left: COL_W * c, top: 60, bottom: 60,
        width: 1,
        background: FAINT,
        opacity: lineOpacity,
      }} />
    );
  }
  // Active column highlight band
  if (activeFeature >= 0) {
    lines.push(
      <div key={'hl'} style={{
        position: 'absolute',
        left: COL_W * activeFeature, top: 60, bottom: 60,
        width: COL_W,
        background: `linear-gradient(180deg, transparent, ${RED}14 30%, ${RED}14 70%, transparent)`,
        borderLeft: `1px solid ${RED}55`,
        borderRight: `1px solid ${RED}55`,
        transition: 'left 600ms cubic-bezier(0.7, 0, 0.2, 1)',
      }} />
    );
  }
  return <>{lines}</>;
}

window.DataField = DataField;
window.RED = RED;
window.FG = FG;
window.DIM = DIM;
window.FAINT = FAINT;
window.STAGE_W = W;
window.STAGE_H = H;
window.COLUMNS = COLUMNS;
window.COL_W = COL_W;
