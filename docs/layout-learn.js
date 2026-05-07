// ── 소방시설 배치 배우기 ─────────────────────────────────────────────────
(function () {
  'use strict';

  var state = {
    above: 3,        // 지상층수 (1~20)
    below: 1,        // 지하층수 (0~5)
    stairPos: 'right', // 'left' | 'center' | 'right'
  };

  var initialized = false;

  // ── SVG 빌딩 렌더러 ───────────────────────────────────────────────────

  function renderBuilding() {
    var svg = document.getElementById('ll-building-svg');
    if (!svg) return;

    var above    = state.above;
    var below    = state.below;
    var stair    = state.stairPos;

    // 좌표계 상수
    var VW    = 260;   // SVG viewport 너비
    var FH    = 52;    // 층 높이 (px)
    var ML    = 18;    // 왼쪽 여백
    var MT    = 14;    // 위 여백
    var MB    = 14;    // 아래 여백
    var SW    = 44;    // 계단 폭
    var BW    = 170;   // 본체 폭
    var GH    = 10;    // 지면선 여백
    var STW   = 2.5;   // 벽 선 두께

    // 계단/본체 X 위치 계산
    var stairX, bodyX, bodyW;
    var centerMode = (stair === 'center');
    var bodyLeftW, bodyRightW, bodyRightX;

    if (stair === 'left') {
      stairX = ML;
      bodyX  = ML + SW;
      bodyW  = BW;
    } else if (stair === 'right') {
      bodyX  = ML;
      bodyW  = BW;
      stairX = ML + BW;
    } else {
      bodyLeftW  = Math.floor(BW / 2);
      bodyRightW = BW - bodyLeftW;
      stairX     = ML + bodyLeftW;
      bodyRightX = stairX + SW;
      bodyX      = ML;
      bodyW      = BW;
    }

    var aboveH = above * FH;
    var belowH = below * FH;
    var totalH = MT + aboveH + GH + belowH + MB;
    var groundY = MT + aboveH + GH / 2;

    svg.setAttribute('viewBox', '0 0 ' + VW + ' ' + totalH);
    svg.style.height = totalH + 'px';
    svg.innerHTML = '';

    var ns = 'http://www.w3.org/2000/svg';

    function el(tag, attrs) {
      var e = document.createElementNS(ns, tag);
      for (var k in attrs) e.setAttribute(k, attrs[k]);
      return e;
    }

    function line(x1, y1, x2, y2, sw, opacity) {
      var attrs = { x1: x1, y1: y1, x2: x2, y2: y2,
        stroke: 'currentColor', 'stroke-width': sw || STW };
      if (opacity) attrs.opacity = opacity;
      return el('line', attrs);
    }

    function rect(x, y, w, h, sw) {
      return el('rect', { x: x, y: y, width: w, height: h,
        fill: 'none', stroke: 'currentColor', 'stroke-width': sw || STW });
    }

    function text(x, y, content, size, weight, opacity) {
      var t = el('text', {
        x: x, y: y,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        'font-size': size || 13,
        'font-weight': weight || '600',
        'font-family': 'inherit',
        fill: 'currentColor',
      });
      if (opacity) t.setAttribute('opacity', opacity);
      t.textContent = content;
      return t;
    }

    // ── 지상층 렌더링 ──────────────────────────────────────────────────
    if (above > 0) {
      var topY = MT;

      // 계단 외곽 박스
      svg.appendChild(rect(stairX, topY, SW, aboveH));

      // 계단 내부 장식선 (계단 느낌)
      var stepLines = Math.min(above * 4, 20);
      for (var i = 1; i < stepLines; i++) {
        var sy = topY + (aboveH * i) / stepLines;
        svg.appendChild(line(stairX + 4, sy, stairX + SW - 4, sy, 0.6, 0.2));
      }

      // 계단 레이블
      svg.appendChild(text(stairX + SW / 2, topY + aboveH / 2, '계단', 9, 'normal', 0.55));

      if (!centerMode) {
        // 본체 외곽 박스
        svg.appendChild(rect(bodyX, topY, bodyW, aboveH));

        // 층 구분선
        for (var f = 1; f < above; f++) {
          var dy = topY + f * FH;
          svg.appendChild(line(bodyX, dy, bodyX + bodyW, dy, STW));
        }

        // 층 레이블
        for (var f = 0; f < above; f++) {
          var floorNum = above - f;
          var fy = topY + f * FH + FH / 2;
          svg.appendChild(text(bodyX + bodyW / 2, fy, floorNum + '층', 13));
        }

      } else {
        // 중간 계단: 좌·우 두 섹션
        svg.appendChild(rect(ML, topY, bodyLeftW, aboveH));
        svg.appendChild(rect(bodyRightX, topY, bodyRightW, aboveH));

        for (var f = 1; f < above; f++) {
          var dy = topY + f * FH;
          svg.appendChild(line(ML, dy, ML + bodyLeftW, dy, STW));
          svg.appendChild(line(bodyRightX, dy, bodyRightX + bodyRightW, dy, STW));
        }

        for (var f = 0; f < above; f++) {
          var floorNum = above - f;
          var fy = topY + f * FH + FH / 2;
          svg.appendChild(text(ML + bodyLeftW / 2, fy, floorNum + '층', 11));
          svg.appendChild(text(bodyRightX + bodyRightW / 2, fy, floorNum + '층', 11));
        }
      }
    }

    // ── 지면선 ────────────────────────────────────────────────────────
    var gLine = el('line', {
      x1: 0, y1: groundY, x2: VW, y2: groundY,
      stroke: 'currentColor', 'stroke-width': 3,
    });
    svg.appendChild(gLine);

    // ── 지하층 렌더링 ──────────────────────────────────────────────────
    if (below > 0) {
      var basX    = ML;
      var basW    = SW + BW;
      var basTopY = MT + aboveH + GH;

      svg.appendChild(rect(basX, basTopY, basW, belowH));

      for (var b = 1; b < below; b++) {
        var dy = basTopY + b * FH;
        svg.appendChild(line(basX, dy, basX + basW, dy, STW));
      }

      for (var b = 0; b < below; b++) {
        var fy = basTopY + b * FH + FH / 2;
        svg.appendChild(text(basX + basW / 2, fy, '지하' + (b + 1) + '층', 13));
      }
    }
  }

  // ── UI 업데이트 ───────────────────────────────────────────────────────

  function updateDisplay() {
    var aboveEl = document.getElementById('ll-above-val');
    var belowEl = document.getElementById('ll-below-val');
    if (aboveEl) aboveEl.textContent = state.above;
    if (belowEl) belowEl.textContent = state.below;
    renderBuilding();
  }

  // ── 초기화 (화면 열릴 때 1회만) ──────────────────────────────────────

  function initLayoutLearn() {
    if (initialized) return;
    initialized = true;

    // 지상 스테퍼
    document.getElementById('ll-above-dec').addEventListener('click', function () {
      if (state.above > 1) { state.above--; updateDisplay(); }
    });
    document.getElementById('ll-above-inc').addEventListener('click', function () {
      if (state.above < 20) { state.above++; updateDisplay(); }
    });

    // 지하 스테퍼
    document.getElementById('ll-below-dec').addEventListener('click', function () {
      if (state.below > 0) { state.below--; updateDisplay(); }
    });
    document.getElementById('ll-below-inc').addEventListener('click', function () {
      if (state.below < 5) { state.below++; updateDisplay(); }
    });

    // 계단 위치 라디오
    document.querySelectorAll('.ll-radio-btn[data-pos]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.ll-radio-btn[data-pos]').forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        state.stairPos = btn.dataset.pos;
        updateDisplay();
      });
    });

    // 최초 렌더
    updateDisplay();
  }

  window.initLayoutLearn = initLayoutLearn;
})();
