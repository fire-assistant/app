(function () {
  'use strict';

  var STEPS = [
    {
      active: [],
      flows: [],
      badge: '🔥',
      title: '화재 발생',
      desc: '실내에서 화재가 발생하여 온도가 급격히 상승합니다. 스프링클러 헤드 아래의 온도가 올라가기 시작합니다.',
    },
    {
      active: ['head-hot'],
      flows: [],
      badge: '💥',
      title: '헤드 감열체 파괴',
      desc: '온도가 72~93°C에 도달하면 헤드의 유리구슬(글라스 벌브)이 파열됩니다. 헤드 프레임을 잡고 있던 구슬이 사라지며 헤드가 열립니다.',
    },
    {
      active: ['head-hot', 'water-spray'],
      flows: [],
      badge: '💧',
      title: '즉시 방수',
      desc: '습식 설비는 배관에 물이 항상 가득 차 있습니다. 헤드가 열리는 순간 펌프 없이도 배관 내 물이 즉시 방출됩니다.',
    },
    {
      active: ['head-hot', 'water-spray', 'pipe-pressure-drop'],
      flows: [],
      badge: '📉',
      title: '배관 압력 저하',
      desc: '헤드에서 물이 계속 나가면서 배관 내 압력이 낮아집니다. 이 압력 변화가 시스템 전체에 신호를 보내는 트리거가 됩니다.',
    },
    {
      active: ['head-hot', 'water-spray', 'pipe-pressure-drop', 'flow-det-on'],
      flows: ['signal'],
      badge: '🔁',
      title: '유수검지장치 작동',
      desc: '배관의 물 흐름(압력 차)을 유수검지장치가 감지하여 압력스위치를 통해 수신기에 화재 신호를 보냅니다.',
    },
    {
      active: ['head-hot', 'water-spray', 'pipe-pressure-drop', 'flow-det-on', 'panel-on'],
      flows: ['signal'],
      badge: '🖥️',
      title: '수신기 신호 수신',
      desc: '수신기(감시제어반)가 신호를 받아 화재 구역을 화면에 표시합니다.',
    },
    {
      active: ['head-hot', 'water-spray', 'pipe-pressure-drop', 'flow-det-on', 'panel-on', 'alarm-on'],
      flows: ['signal'],
      badge: '🔔',
      title: '경보 발령',
      desc: '사이렌·벨이 울리고 소방서에 자동으로 통보됩니다. 건물 내 모든 재실자가 대피를 시작합니다.',
    },
    {
      active: ['head-hot', 'water-spray', 'pipe-pressure-drop', 'flow-det-on', 'panel-on', 'alarm-on', 'chamber-on', 'pump-on'],
      flows: ['signal', 'pump-start'],
      badge: '⚙️',
      title: '펌프 자동 기동',
      desc: '기동용수압개폐장치(압력챔버)가 배관 압력 저하를 감지하여 주펌프를 자동으로 기동합니다.',
    },
    {
      active: ['head-hot', 'water-spray', 'pipe-pressure-drop', 'flow-det-on', 'panel-on', 'alarm-on', 'chamber-on', 'pump-on'],
      flows: ['signal', 'pump-start', 'supply'],
      badge: '💦',
      title: '소화수 가압 공급',
      desc: '펌프가 수조의 물을 끌어올려 배관에 지속적으로 가압 공급합니다. 헤드에 소화수가 계속 공급되어 화재를 진압합니다.',
    },
  ];

  var currentStep = 0;
  var built = false;
  var svgEl = null;
  var titleEl = null;
  var descEl = null;
  var badgeEl = null;
  var numEl = null;
  var dotsEl = null;
  var prevBtn = null;
  var nextBtn = null;

  function buildSVG() {
    return '<svg id="ss-svg" viewBox="0 0 360 285" width="100%" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
        '<filter id="ss-glow-r" x="-50%" y="-50%" width="200%" height="200%">' +
          '<feGaussianBlur stdDeviation="4" result="b"/>' +
          '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
        '</filter>' +
        '<filter id="ss-glow-b" x="-50%" y="-50%" width="200%" height="200%">' +
          '<feGaussianBlur stdDeviation="3" result="b"/>' +
          '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
        '</filter>' +
        '<filter id="ss-glow-g" x="-50%" y="-50%" width="200%" height="200%">' +
          '<feGaussianBlur stdDeviation="3" result="b"/>' +
          '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
        '</filter>' +
        '<filter id="ss-glow-y" x="-50%" y="-50%" width="200%" height="200%">' +
          '<feGaussianBlur stdDeviation="3" result="b"/>' +
          '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
        '</filter>' +
      '</defs>' +

      /* background */
      '<rect width="360" height="285" fill="#0f0f0f" rx="14"/>' +

      /* ── 방 ── */
      '<rect id="ss-room" x="14" y="78" width="122" height="98" fill="rgba(217,48,37,0.04)" stroke="#2a2a2a" stroke-width="1.5" rx="4"/>' +
      '<text x="75" y="170" text-anchor="middle" fill="#3a3a3a" font-size="9" font-family="monospace" letter-spacing="0.5">방 · 화재구역</text>' +

      /* ── 화재 ── */
      '<g id="ss-fire-group">' +
        /* glow base */
        '<ellipse cx="75" cy="150" rx="24" ry="9" fill="rgba(217,48,37,0.2)" class="ss-fire-glow"/>' +
        /* flames */
        '<ellipse cx="75" cy="136" rx="11" ry="17" fill="#d93025" opacity="0.9" class="ss-flame"/>' +
        '<ellipse cx="67" cy="139" rx="7" ry="12" fill="#f9ab00" opacity="0.85" class="ss-flame"/>' +
        '<ellipse cx="83" cy="140" rx="6.5" ry="11" fill="#f9ab00" opacity="0.8" class="ss-flame"/>' +
        '<ellipse cx="75" cy="131" rx="6" ry="9" fill="#ffdd55" opacity="0.75" class="ss-flame"/>' +
      '</g>' +

      /* ── 천장 배관 (ceiling pipe) ── */
      '<line id="ss-ceiling-pipe" x1="14" y1="78" x2="248" y2="78" stroke="#303030" stroke-width="5" stroke-linecap="round"/>' +

      /* ── 헤드 (ChatGPT SVG) ── */
      '<svg id="ss-head-group" x="50" y="75" width="50" height="50" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">' +
        '<g id="ss-head-inner" fill="none" stroke="#666" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
          '<rect x="32" y="6" width="16" height="10" rx="2" fill="#555" stroke="#777"/>' +
          '<path d="M36 16v8h8v-8"/>' +
          '<path d="M30 24h20"/>' +
          '<path d="M30 24v25"/>' +
          '<path d="M50 24v25"/>' +
          '<path d="M30 49c0 5 20 5 20 0"/>' +
          '<circle id="ss-bulb" cx="40" cy="38" r="5" fill="#66bb44" stroke="#888" stroke-width="2"/>' +
          '<path d="M40 43v10"/>' +
          '<ellipse id="ss-defl1" cx="40" cy="60" rx="25" ry="7" fill="#555" stroke="#777"/>' +
          '<line id="ss-defl2" x1="20" y1="60" x2="60" y2="60" stroke="#888"/>' +
        '</g>' +
      '</svg>' +
      '<text x="75" y="74" text-anchor="middle" fill="#444" font-size="8" font-family="monospace">헤드</text>' +

      /* ── 물방울 ── */
      '<g id="ss-drops" opacity="0">' +
        '<circle cx="67" cy="112" r="2.5" fill="#4285f4"/>' +
        '<circle cx="75" cy="119" r="2" fill="#4285f4" opacity="0.8"/>' +
        '<circle cx="83" cy="112" r="2.5" fill="#4285f4"/>' +
        '<circle cx="64" cy="126" r="2" fill="#4285f4" opacity="0.7"/>' +
        '<circle cx="78" cy="130" r="2.5" fill="#4285f4" opacity="0.85"/>' +
        '<circle cx="86" cy="122" r="2" fill="#4285f4" opacity="0.75"/>' +
        '<circle cx="70" cy="138" r="2" fill="#4285f4" opacity="0.6"/>' +
        '<circle cx="80" cy="143" r="2" fill="#4285f4" opacity="0.55"/>' +
      '</g>' +

      /* ── 유수검지장치 (ChatGPT SVG) ── */
      '<svg id="ss-flow-det" x="160" y="50" width="56" height="60" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">' +
        '<g stroke-linecap="round" stroke-linejoin="round">' +
          '<rect x="4" y="34" width="16" height="12" rx="2" fill="#444" stroke="#666" stroke-width="2"/>' +
          '<rect x="60" y="34" width="16" height="12" rx="2" fill="#444" stroke="#666" stroke-width="2"/>' +
          '<line x1="20" y1="40" x2="28" y2="40" stroke="#555" stroke-width="3"/>' +
          '<line x1="52" y1="40" x2="60" y2="40" stroke="#555" stroke-width="3"/>' +
          '<path id="ss-fd-shape" d="M40 18L58 40L40 62L22 40Z" fill="#2a2a2a" stroke="#555" stroke-width="2.5"/>' +
          '<path d="M31 43L45 33" stroke="#666" stroke-width="3"/>' +
          '<circle cx="31" cy="43" r="2.2" fill="#555" stroke="#666" stroke-width="1"/>' +
          '<path d="M45 33Q48 37 46 41" fill="none" stroke="#444" stroke-width="2"/>' +
          '<line x1="27" y1="40" x2="53" y2="40" stroke="#3a3a3a" stroke-width="1.5"/>' +
          '<line x1="40" y1="62" x2="40" y2="68" stroke="#555" stroke-width="2.5"/>' +
          '<rect x="34" y="68" width="12" height="6" rx="1.5" fill="#444" stroke="#666" stroke-width="1.8"/>' +
          '<circle cx="40" cy="77" r="2.5" fill="#555" stroke="#666" stroke-width="1.2"/>' +
        '</g>' +
      '</svg>' +
      '<text x="188" y="46" text-anchor="middle" fill="#383838" font-size="8" font-family="monospace">유수검지장치</text>' +

      /* ── 신호선 ── */
      '<path id="ss-signal-wire" d="M213,78 H270" fill="none" stroke="#282828" stroke-width="1.5" stroke-dasharray="5 4"/>' +

      /* ── 수신기 (ChatGPT SVG) ── */
      '<svg id="ss-panel" x="270" y="14" width="74" height="76" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">' +
        '<g stroke-linecap="round" stroke-linejoin="round">' +
          '<rect id="ss-panel-rect" x="10" y="14" width="60" height="52" rx="4" fill="#2a2a2a" stroke="#555" stroke-width="2.5"/>' +
          '<rect x="6" y="20" width="4" height="40" rx="1.5" fill="#444"/>' +
          '<rect x="70" y="20" width="4" height="40" rx="1.5" fill="#444"/>' +
          '<circle id="ss-led-r" cx="24" cy="26" r="3.5" fill="#3a0000" stroke="#555" stroke-width="1.5"/>' +
          '<circle cx="34" cy="26" r="3.5" fill="#2a2a2a" stroke="#555" stroke-width="1.5"/>' +
          '<circle cx="44" cy="26" r="3.5" fill="#333" stroke="#555" stroke-width="1.5"/>' +
          '<circle cx="54" cy="26" r="3.5" fill="#2e2e2e" stroke="#555" stroke-width="1.5"/>' +
          '<rect x="24" y="36" width="32" height="12" rx="1.5" fill="#111" stroke="#555" stroke-width="1.8"/>' +
          '<text id="ss-panel-text" x="40" y="46" text-anchor="middle" fill="#1a3a1a" font-size="7" font-family="monospace">정  상</text>' +
          '<circle cx="22" cy="58" r="1.8" fill="#555"/>' +
          '<circle cx="30" cy="58" r="1.8" fill="#555"/>' +
          '<circle cx="38" cy="58" r="1.8" fill="#555"/>' +
          '<circle cx="46" cy="58" r="1.8" fill="#555"/>' +
          '<circle cx="54" cy="58" r="1.8" fill="#555"/>' +
          '<circle cx="54" cy="64" r="1.8" fill="#444"/>' +
          '<circle cx="46" cy="64" r="1.8" fill="#444"/>' +
          '<circle cx="38" cy="64" r="1.8" fill="#444"/>' +
          '<circle cx="30" cy="64" r="1.8" fill="#444"/>' +
          '<circle cx="22" cy="64" r="1.8" fill="#444"/>' +
        '</g>' +
      '</svg>' +
      '<text x="307" y="94" text-anchor="middle" fill="#383838" font-size="8" font-family="monospace">수신기</text>' +

      /* ── 경보 ── */
      '<g id="ss-alarm">' +
        '<circle id="ss-alarm-bg" cx="307" cy="114" r="18" fill="#141414" stroke="#303030" stroke-width="1.5"/>' +
        '<text x="307" y="110" text-anchor="middle" font-size="15">🔔</text>' +
        '<text x="307" y="124" text-anchor="middle" fill="#383838" font-size="7.5" font-family="monospace">경  보</text>' +
      '</g>' +

      /* ── 수직 배관 (riser) ── */
      '<line id="ss-riser" x1="248" y1="78" x2="248" y2="258" stroke="#303030" stroke-width="5" stroke-linecap="round"/>' +

      /* ── 압력챔버 (ChatGPT SVG) ── */
      '<svg id="ss-chamber" x="228" y="152" width="40" height="52" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">' +
        '<g stroke-linecap="round" stroke-linejoin="round">' +
          '<rect id="ss-chamber-rect" x="25" y="14" width="30" height="52" rx="15" fill="#2a2a2a" stroke="#555" stroke-width="2.5"/>' +
          '<line x1="40" y1="10" x2="40" y2="14" stroke="#555" stroke-width="2"/>' +
          '<circle cx="40" cy="7" r="5" fill="#222" stroke="#555" stroke-width="2"/>' +
          '<line x1="40" y1="7" x2="43" y2="5" stroke="#666" stroke-width="1.5"/>' +
          '<circle cx="40" cy="7" r="0.9" fill="#666"/>' +
          '<path d="M55 18h5v44h-5" fill="none" stroke="#444" stroke-width="2"/>' +
          '<line x1="27" y1="42" x2="53" y2="42" stroke="#555" stroke-width="2"/>' +
          '<line x1="55" y1="42" x2="60" y2="42" stroke="#555" stroke-width="2"/>' +
          '<path d="M27 42h26v22H27z" fill="#444" stroke="none" opacity="0.9"/>' +
          '<path d="M29 46c3 2 6 2 9 0s6-2 9 0 6 2 9 0" fill="none" stroke="#333" stroke-width="1.4"/>' +
          '<line x1="40" y1="66" x2="40" y2="72" stroke="#555" stroke-width="2.5"/>' +
          '<rect x="33" y="72" width="14" height="5" rx="1.5" fill="#333" stroke="#555" stroke-width="1.8"/>' +
        '</g>' +
      '</svg>' +
      '<text x="248" y="212" text-anchor="middle" fill="#383838" font-size="7" font-family="monospace">압력챔버</text>' +

      /* ── 수조 (ChatGPT SVG) ── */
      '<svg id="ss-tank" x="6" y="200" width="62" height="74" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">' +
        '<g stroke-linecap="round" stroke-linejoin="round">' +
          '<rect x="14" y="10" width="52" height="60" rx="2" fill="none" stroke="#555" stroke-width="2.5"/>' +
          '<rect x="16.5" y="28" width="47" height="39.5" fill="#0d2035" stroke="none"/>' +
          '<path d="M18 28c3 2 6 2 9 0s6-2 9 0 6 2 9 0 6-2 9 0 6 2 9 0" fill="none" stroke="#2a5a7a" stroke-width="2"/>' +
          '<path d="M20 33c2.5 1.5 5 1.5 7.5 0s5-1.5 7.5 0 5 1.5 7.5 0 5-1.5 7.5 0 5 1.5 7.5 0" fill="none" stroke="#1a4a6a" stroke-width="1.5"/>' +
          '<rect x="9" y="14" width="3" height="52" rx="1" fill="#333" stroke="#555" stroke-width="1"/>' +
          '<rect x="68" y="14" width="3" height="52" rx="1" fill="#333" stroke="#555" stroke-width="1"/>' +
          '<line x1="10.5" y1="18" x2="10.5" y2="62" stroke="#555" stroke-width="1.2"/>' +
          '<line x1="69.5" y1="18" x2="69.5" y2="62" stroke="#555" stroke-width="1.2"/>' +
          '<line x1="8" y1="28" x2="14" y2="28" stroke="#444" stroke-width="1.5"/>' +
          '<line x1="66" y1="28" x2="72" y2="28" stroke="#444" stroke-width="1.5"/>' +
        '</g>' +
      '</svg>' +
      '<text x="37" y="278" text-anchor="middle" fill="#383838" font-size="8" font-family="monospace">수 조</text>' +

      /* ── 수조→펌프 배관 ── */
      '<line id="ss-pipe-btm" x1="68" y1="248" x2="174" y2="248" stroke="#303030" stroke-width="5" stroke-linecap="round"/>' +

      /* ── 펌프 (ChatGPT SVG) ── */
      '<svg id="ss-pump" x="174" y="220" width="56" height="58" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">' +
        '<g fill="none" stroke-linecap="round" stroke-linejoin="round">' +
          '<rect x="4" y="34" width="14" height="12" rx="2" fill="#333" stroke="#555" stroke-width="2.5"/>' +
          '<path d="M18 40H25" stroke="#555" stroke-width="2.5"/>' +
          '<path d="M52 16H68V28" stroke="#555" stroke-width="2.5"/>' +
          '<rect x="50" y="14" width="18" height="10" rx="2" fill="#333" stroke="#555" stroke-width="2.5"/>' +
          '<rect x="62" y="16" width="10" height="16" rx="2" fill="#333" stroke="#555" stroke-width="2.5"/>' +
          '<circle id="ss-pump-bg" cx="40" cy="40" r="21" fill="#2a2a2a" stroke="#555" stroke-width="2.5"/>' +
          '<circle cx="40" cy="40" r="16" fill="#333" stroke="#555" stroke-width="2"/>' +
          '<circle cx="40" cy="40" r="4.5" fill="#444" stroke="#555" stroke-width="2"/>' +
          '<path d="M24 44c1.5 10 10 18 21 17 11-.8 19-8.5 20-19 .8-7.5-2-14-7-18" stroke="#3a3a3a" stroke-width="2"/>' +
          '<path d="M42 35c5 1 8 4 9 9-3-1-6-1.5-9-1z" fill="#444" stroke="#555" stroke-width="1.5"/>' +
          '<path d="M45 42c2 4 1.5 8-1.5 12-1.5-3-2.5-6-2.5-9z" fill="#444" stroke="#555" stroke-width="1.5"/>' +
          '<path d="M38 45c-4 2-8 1.5-12-1.5 3-1.5 6-2.5 9-2.5z" fill="#444" stroke="#555" stroke-width="1.5"/>' +
          '<path d="M35 38c-2-4-1.5-8 1.5-12 1.5 3 2.5 6 2.5 9z" fill="#444" stroke="#555" stroke-width="1.5"/>' +
          '<path d="M42 35c4-2 8-1.5 12 1.5-3 1.5-6 2.5-9 2.5z" fill="#444" stroke="#555" stroke-width="1.5"/>' +
          '<circle cx="40" cy="40" r="2" fill="#333" stroke="#444" stroke-width="1.5"/>' +
          '<path d="M19 40h8" stroke="#3a3a3a" stroke-width="4"/>' +
          '<path d="M51 23c3 1 6 3 8 6" stroke="#3a3a3a" stroke-width="4"/>' +
        '</g>' +
      '</svg>' +
      '<text x="202" y="282" text-anchor="middle" fill="#383838" font-size="8" font-family="monospace">펌 프</text>' +

      /* ── 펌프→라이저 배관 ── */
      '<line id="ss-pipe-pr" x1="220" y1="232" x2="248" y2="232" stroke="#303030" stroke-width="5" stroke-linecap="round"/>' +

      /* ── 유수 애니메이션 경로들 ── */
      '<path id="ss-anim-signal" d="M213,78 H270" fill="none" stroke="#f9ab00" stroke-width="2.5" stroke-dasharray="9 6" stroke-linecap="round" opacity="0"/>' +
      '<path id="ss-anim-pump" d="M248,178 V232 H220" fill="none" stroke="#34a853" stroke-width="2" stroke-dasharray="7 5" stroke-linecap="round" opacity="0"/>' +
      '<path id="ss-anim-supply" d="M37,248 H174 M220,232 H248 V78 H75" fill="none" stroke="#4285f4" stroke-width="3" stroke-dasharray="12 7" stroke-linecap="round" opacity="0"/>' +

    '</svg>';
  }

  function resetSVG() {
    if (!svgEl) return;
    /* pipes */
    q('#ss-ceiling-pipe').setAttribute('stroke', '#303030');
    q('#ss-riser').setAttribute('stroke', '#303030');
    q('#ss-pipe-btm').setAttribute('stroke', '#303030');
    q('#ss-pipe-pr').setAttribute('stroke', '#303030');
    /* head reset */
    q('#ss-bulb').setAttribute('fill', '#66bb44');
    q('#ss-bulb').setAttribute('stroke', '#888');
    q('#ss-defl1').setAttribute('stroke', '#777');
    q('#ss-defl1').setAttribute('fill', '#555');
    q('#ss-defl2').setAttribute('stroke', '#888');
    svgEl.querySelectorAll('#ss-head-inner path, #ss-head-inner rect').forEach(function(el) {
      el.setAttribute('stroke', '#666');
      if (el.tagName === 'rect') el.setAttribute('fill', '#555');
    });
    /* drops */
    q('#ss-drops').setAttribute('opacity', '0');
    /* flow det */
    q('#ss-fd-shape').setAttribute('fill', '#2a2a2a');
    q('#ss-fd-shape').setAttribute('stroke', '#555');
    /* panel */
    q('#ss-panel-rect').setAttribute('stroke', '#555');
    q('#ss-led-r').setAttribute('fill', '#3a0000');
    var pt = q('#ss-panel-text');
    pt.setAttribute('fill', '#1a3a1a');
    pt.textContent = '정  상';
    /* alarm */
    q('#ss-alarm-bg').setAttribute('stroke', '#303030');
    q('#ss-alarm-bg').setAttribute('fill', '#141414');
    /* chamber */
    q('#ss-chamber-rect').setAttribute('stroke', '#555');
    q('#ss-chamber-rect').setAttribute('fill', '#2a2a2a');
    /* pump */
    q('#ss-pump-bg').setAttribute('stroke', '#555');
    q('#ss-pump-bg').setAttribute('fill', '#2a2a2a');
    /* anims off */
    q('#ss-anim-signal').setAttribute('opacity', '0');
    q('#ss-anim-pump').setAttribute('opacity', '0');
    q('#ss-anim-supply').setAttribute('opacity', '0');
    /* room */
    q('#ss-room').setAttribute('fill', 'rgba(217,48,37,0.04)');
  }

  function q(sel) { return svgEl.querySelector(sel); }

  var ACTIVATORS = {
    'head-hot': function() {
      q('#ss-bulb').setAttribute('fill', '#d93025');
      q('#ss-bulb').setAttribute('stroke', '#ff6a5f');
      q('#ss-defl1').setAttribute('stroke', '#ff6a5f');
      q('#ss-defl1').setAttribute('fill', 'rgba(217,48,37,0.25)');
      q('#ss-defl2').setAttribute('stroke', '#ff6a5f');
      svgEl.querySelectorAll('#ss-head-inner path, #ss-head-inner rect').forEach(function(el) {
        el.setAttribute('stroke', '#ff6a5f');
      });
    },
    'water-spray': function() {
      q('#ss-drops').setAttribute('opacity', '1');
    },
    'pipe-pressure-drop': function() {
      q('#ss-ceiling-pipe').setAttribute('stroke', '#f9ab00');
      q('#ss-riser').setAttribute('stroke', '#f9ab00');
    },
    'flow-det-on': function() {
      q('#ss-fd-shape').setAttribute('fill', 'rgba(249,171,0,0.22)');
      q('#ss-fd-shape').setAttribute('stroke', '#f9ab00');
    },
    'panel-on': function() {
      q('#ss-panel-rect').setAttribute('stroke', '#d93025');
      q('#ss-led-r').setAttribute('fill', '#d93025');
      var pt = q('#ss-panel-text');
      pt.setAttribute('fill', '#ff6a5f');
      pt.textContent = '화  재';
    },
    'alarm-on': function() {
      q('#ss-alarm-bg').setAttribute('stroke', '#f9ab00');
      q('#ss-alarm-bg').setAttribute('fill', 'rgba(249,171,0,0.18)');
    },
    'chamber-on': function() {
      q('#ss-chamber-rect').setAttribute('stroke', '#34a853');
    },
    'pump-on': function() {
      q('#ss-pump-bg').setAttribute('stroke', '#34a853');
      q('#ss-pump-bg').setAttribute('fill', 'rgba(52,168,83,0.12)');
    },
  };

  var FLOW_MAP = {
    'signal':     '#ss-anim-signal',
    'pump-start': '#ss-anim-pump',
    'supply':     '#ss-anim-supply',
  };

  function applyStep() {
    if (!svgEl) return;
    var step = STEPS[currentStep];
    resetSVG();

    step.active.forEach(function(k) {
      if (ACTIVATORS[k]) ACTIVATORS[k]();
    });
    step.flows.forEach(function(k) {
      var el = svgEl.querySelector(FLOW_MAP[k]);
      if (el) el.setAttribute('opacity', '1');
    });

    titleEl.textContent = step.title;
    descEl.textContent = step.desc;
    badgeEl.textContent = step.badge;
    numEl.textContent = 'STEP ' + (currentStep + 1) + ' / ' + STEPS.length;

    dotsEl.querySelectorAll('.ss-dot').forEach(function(d, i) {
      d.classList.toggle('active', i === currentStep);
      d.classList.toggle('done', i < currentStep);
    });

    prevBtn.disabled = (currentStep === 0);
    nextBtn.textContent = (currentStep === STEPS.length - 1) ? '처음으로 ↺' : '다음 →';
  }

  function build(container) {
    if (built) return;
    built = true;
    container.innerHTML = '';

    /* info card */
    var card = document.createElement('div');
    card.className = 'wq-card ss-info-card';
    card.innerHTML =
      '<div class="ss-step-top">' +
        '<span class="ss-badge" id="ss-badge">🔥</span>' +
        '<div class="ss-step-meta">' +
          '<div class="ss-step-num wq-label" id="ss-step-num">STEP 1 / ' + STEPS.length + '</div>' +
          '<h3 class="ss-step-title" id="ss-step-title"></h3>' +
        '</div>' +
      '</div>' +
      '<p class="ss-step-desc" id="ss-step-desc"></p>';
    container.appendChild(card);

    /* SVG */
    var svgWrap = document.createElement('div');
    svgWrap.className = 'ss-svg-wrap';
    svgWrap.innerHTML = buildSVG();
    container.appendChild(svgWrap);

    /* dots */
    var dots = document.createElement('div');
    dots.className = 'ss-dots';
    STEPS.forEach(function(_, i) {
      var d = document.createElement('span');
      d.className = 'ss-dot';
      dots.appendChild(d);
    });
    container.appendChild(dots);
    dotsEl = dots;

    /* nav */
    var nav = document.createElement('div');
    nav.className = 'w-nav ss-nav';
    nav.innerHTML =
      '<button class="btn btn-ghost" id="ss-prev" type="button">이전</button>' +
      '<button class="btn btn-primary" id="ss-next" type="button">다음 →</button>';
    container.appendChild(nav);

    svgEl    = container.querySelector('#ss-svg');
    titleEl  = container.querySelector('#ss-step-title');
    descEl   = container.querySelector('#ss-step-desc');
    badgeEl  = container.querySelector('#ss-badge');
    numEl    = container.querySelector('#ss-step-num');
    prevBtn  = container.querySelector('#ss-prev');
    nextBtn  = container.querySelector('#ss-next');

    prevBtn.addEventListener('click', function() {
      if (currentStep > 0) { currentStep--; applyStep(); }
    });
    nextBtn.addEventListener('click', function() {
      currentStep = (currentStep < STEPS.length - 1) ? currentStep + 1 : 0;
      applyStep();
    });

    applyStep();
  }

  window.initSprinklerSeq = function() {
    var content = document.getElementById('sprinkler-seq-content');
    if (!content) return;
    currentStep = 0;
    built = false;
    svgEl = null;
    build(content);
  };
})();
