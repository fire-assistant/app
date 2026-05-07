// ── 소방시설 배치 배우기 ─────────────────────────────────────────────────
(function () {
  'use strict';

  var PURPOSES = ['(없음)', '주차장', '기계실', '전기실', '창고', '카페', '음식점', '편의점',
    '슈퍼마켓', '사무실', '노래방', '헬스클럽', 'PC방', '숙박', '고시원', '의원', '약국', '기타'];

  var state = {
    above: 3,
    below: 1,
    stairPos: 'right',
    totalArea: '',
  };

  // floors[key] = [{purpose, area}, ...]
  // key: positive int = above-ground floor, negative int = basement (-1 = B1)
  var floors = {};

  var initialized = false;

  // ── 층 데이터 초기화 ───────────────────────────────────────────────────

  function getAreaPerFloor() {
    var total = parseFloat(state.totalArea);
    if (!total || total <= 0) return '';
    var count = state.above + state.below;
    if (count <= 0) return '';
    return String(Math.round(total / count));
  }

  function initFloors() {
    var newFloors = {};
    var perFloor = getAreaPerFloor();
    for (var f = 1; f <= state.above; f++) {
      newFloors[f] = floors[f] || [{ purpose: '', area: perFloor }];
    }
    for (var b = 1; b <= state.below; b++) {
      newFloors[-b] = floors[-b] || [{ purpose: '', area: perFloor }];
    }
    floors = newFloors;
  }

  function distributeArea() {
    var perFloor = getAreaPerFloor();
    for (var f = 1; f <= state.above; f++) {
      if (floors[f]) floors[f].forEach(function (r) { r.area = perFloor; });
    }
    for (var b = 1; b <= state.below; b++) {
      if (floors[-b]) floors[-b].forEach(function (r) { r.area = perFloor; });
    }
  }

  // ── 층별 테이블 렌더링 ─────────────────────────────────────────────────

  function renderFloorTable() {
    var container = document.getElementById('ll-floor-table');
    if (!container) return;
    container.innerHTML = '';

    for (var f = state.above; f >= 1; f--) {
      appendFloorRows(container, f, f + '층');
      if (f > 1) {
        var sep = document.createElement('hr');
        sep.className = 'll-floor-sep';
        container.appendChild(sep);
      }
    }

    if (state.below > 0) {
      var sep2 = document.createElement('hr');
      sep2.className = 'll-floor-sep';
      container.appendChild(sep2);

      for (var b = 1; b <= state.below; b++) {
        appendFloorRows(container, -b, 'B' + b);
        if (b < state.below) {
          var sep3 = document.createElement('hr');
          sep3.className = 'll-floor-sep';
          container.appendChild(sep3);
        }
      }
    }
  }

  function appendFloorRows(container, key, labelText) {
    var rows = floors[key];
    for (var i = 0; i < rows.length; i++) {
      (function (idx) {
        var row = document.createElement('div');
        row.className = 'll-floor-row';

        var labelCell = document.createElement('span');
        labelCell.className = 'll-fl-label';
        labelCell.textContent = idx === 0 ? labelText : '';
        row.appendChild(labelCell);

        var sel = document.createElement('select');
        sel.className = 'll-purpose-sel';
        PURPOSES.forEach(function (p) {
          var opt = document.createElement('option');
          opt.value = p === '(없음)' ? '' : p;
          opt.textContent = p;
          if (rows[idx].purpose === (p === '(없음)' ? '' : p)) opt.selected = true;
          sel.appendChild(opt);
        });
        sel.addEventListener('change', function () {
          floors[key][idx].purpose = sel.value;
          renderBuilding();
        });
        row.appendChild(sel);

        var inp = document.createElement('input');
        inp.type = 'number';
        inp.className = 'll-area-inp';
        inp.placeholder = '㎡';
        inp.min = '0';
        inp.value = rows[idx].area;
        inp.addEventListener('input', function () {
          floors[key][idx].area = inp.value;
          renderBuilding();
        });
        row.appendChild(inp);

        var btn = document.createElement('button');
        btn.type = 'button';
        if (idx === rows.length - 1) {
          btn.className = 'll-add-btn';
          btn.textContent = '+';
          btn.addEventListener('click', function () {
            floors[key].push({ purpose: '', area: '' });
            renderFloorTable();
            renderBuilding();
          });
        } else {
          btn.className = 'll-del-btn';
          btn.textContent = '×';
          btn.addEventListener('click', function () {
            floors[key].splice(idx, 1);
            renderFloorTable();
            renderBuilding();
          });
        }
        row.appendChild(btn);

        container.appendChild(row);
      })(i);
    }
  }

  // ── 섹션 분할 계산 ────────────────────────────────────────────────────

  function getSections(key, bw) {
    var data = (floors[key] || []).filter(function (d) { return d.purpose; });
    if (!data.length) return null;
    if (data.length === 1) return [{ label: data[0].purpose, w: bw }];
    var areas = data.map(function (d) { return Math.max(parseFloat(d.area) || 1, 1); });
    var total = areas.reduce(function (a, b) { return a + b; }, 0);
    var secs = [], used = 0;
    for (var i = 0; i < data.length; i++) {
      var w = i === data.length - 1 ? bw - used : Math.round((areas[i] / total) * bw);
      secs.push({ label: data[i].purpose, w: w });
      used += w;
    }
    return secs;
  }

  // ── SVG 빌딩 렌더러 ───────────────────────────────────────────────────

  function renderBuilding() {
    var svg = document.getElementById('ll-building-svg');
    if (!svg) return;

    var above  = state.above;
    var below  = state.below;
    var stair  = state.stairPos;

    var VW  = 260;
    var FH  = 52;
    var ML  = 18;
    var MT  = 14;
    var MB  = 14;
    var SW  = 38;   // 계단 폭
    var LW  = 14;   // 부속실 폭
    var BW  = 224;  // 전체 건물 폭 (계단 + 부속실 + 본체 포함)
    var GH  = 10;
    var STW = 2.5;

    // 특별피난계단 적용 여부
    var special    = (above >= 11 || below >= 3);
    var bothMode   = (stair === 'both');
    var centerMode = (stair === 'center');

    // ── 배치 좌표 계산 ──────────────────────────────────────────────
    var stairLX, stairRX, lobbyLX, lobbyRX, bodyX, bodyW;
    var bodyLeftW, bodyRightW, bodyRightX, lobbyRightX;

    if (stair === 'left') {
      stairLX = ML;
      lobbyLX = ML + SW;
      bodyX   = ML + SW + (special ? LW : 0);
      bodyW   = BW - SW - (special ? LW : 0);
    } else if (stair === 'right') {
      bodyX   = ML;
      bodyW   = BW - SW - (special ? LW : 0);
      lobbyLX = ML + bodyW;
      stairLX = ML + bodyW + (special ? LW : 0);
    } else if (bothMode) {
      stairLX = ML;
      lobbyLX = ML + SW;
      bodyX   = ML + SW + (special ? LW : 0);
      bodyW   = BW - SW * 2 - (special ? LW * 2 : 0);
      lobbyRX = ML + SW + (special ? LW : 0) + bodyW;
      stairRX = lobbyRX + (special ? LW : 0);
    } else {
      // center
      var innerW = BW - SW - (special ? LW * 2 : 0);
      bodyLeftW  = Math.floor(innerW / 2);
      bodyRightW = innerW - bodyLeftW;
      lobbyLX    = ML + bodyLeftW;
      stairLX    = ML + bodyLeftW + (special ? LW : 0);
      lobbyRightX = stairLX + SW;
      bodyRightX  = lobbyRightX + (special ? LW : 0);
      bodyX       = ML;
      bodyW       = innerW;
    }

    var aboveH  = above * FH;
    var belowH  = below * FH;
    var totalH  = MT + aboveH + GH + belowH + MB;
    var groundY = MT + aboveH + GH / 2;

    svg.setAttribute('viewBox', '0 0 ' + VW + ' ' + totalH);
    svg.style.height = '';
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
      if (opacity != null) attrs.opacity = opacity;
      return el('line', attrs);
    }

    function rect(x, y, w, h, sw) {
      return el('rect', { x: x, y: y, width: w, height: h,
        fill: 'none', stroke: 'currentColor', 'stroke-width': sw || STW });
    }

    function rectFill(x, y, w, h, fill) {
      return el('rect', { x: x, y: y, width: w, height: h, fill: fill, stroke: 'none' });
    }

    function txt(x, y, content, size, weight, opacity) {
      var t = el('text', {
        x: x, y: y,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        'font-size': size || 13,
        'font-weight': weight || '600',
        'font-family': 'inherit',
        fill: 'currentColor',
      });
      if (opacity != null) t.setAttribute('opacity', opacity);
      t.textContent = content;
      return t;
    }

    // 계단 렌더링 (지상 전체 높이)
    function renderStair(sx, topY, h) {
      svg.appendChild(rect(sx, topY, SW, h));
      var stepLines = Math.min(above * 4, 20);
      for (var i = 1; i < stepLines; i++) {
        var sy = topY + (h * i) / stepLines;
        svg.appendChild(line(sx + 4, sy, sx + SW - 4, sy, 0.6, 0.2));
      }
      svg.appendChild(txt(sx + SW / 2, topY + h / 2, '계단', 9, 'normal', 0.55));
    }

    // 부속실 렌더링 (층별 분할 + 해칭 배경)
    function renderLobby(lx, topY, count, fh) {
      for (var f = 0; f < count; f++) {
        var fy = topY + f * fh;
        // 연한 배경
        svg.appendChild(rectFill(lx, fy, LW, fh, 'rgba(239,68,68,0.07)'));
      }
      svg.appendChild(rect(lx, topY, LW, fh * count));
      for (var f = 1; f < count; f++) {
        svg.appendChild(line(lx, topY + f * fh, lx + LW, topY + f * fh, STW));
      }
      // "부속" 세로 텍스트
      for (var f = 0; f < count; f++) {
        var t = el('text', {
          x: lx + LW / 2,
          y: topY + f * fh + fh / 2,
          'text-anchor': 'middle',
          'dominant-baseline': 'middle',
          'font-size': 7,
          'font-weight': '600',
          'font-family': 'inherit',
          fill: 'currentColor',
          opacity: 0.65,
          'writing-mode': 'tb',
          'letter-spacing': 1,
        });
        t.textContent = '부속실';
        svg.appendChild(t);
      }
    }

    // 본체 층 렌더링 (지상)
    function renderBodyFloors(bx, bw, topY) {
      svg.appendChild(rect(bx, topY, bw, aboveH));
      for (var f = 1; f < above; f++) {
        svg.appendChild(line(bx, topY + f * FH, bx + bw, topY + f * FH, STW));
      }
      for (var f = 0; f < above; f++) {
        var floorNum = above - f;
        var fy = topY + f * FH;
        var secs = getSections(floorNum, bw);
        if (secs) {
          var cx = bx;
          for (var s = 0; s < secs.length; s++) {
            if (s < secs.length - 1) {
              svg.appendChild(line(cx + secs[s].w, fy, cx + secs[s].w, fy + FH, 1, 0.45));
            }
            svg.appendChild(txt(cx + secs[s].w / 2, fy + FH / 2, secs[s].label, 9, '500'));
            cx += secs[s].w;
          }
        } else {
          svg.appendChild(txt(bx + bw / 2, fy + FH / 2, floorNum + '층', 12));
        }
      }
    }

    // ── 지상층 ────────────────────────────────────────────────────────
    if (above > 0) {
      var topY = MT;

      renderStair(stairLX, topY, aboveH);
      if (special) renderLobby(lobbyLX, topY, above, FH);

      if (bothMode) {
        renderStair(stairRX, topY, aboveH);
        if (special) renderLobby(lobbyRX, topY, above, FH);
      }

      if (!centerMode) {
        renderBodyFloors(bodyX, bodyW, topY);
      } else {
        // center: 좌·우 본체, 계단 중간
        svg.appendChild(rect(ML, topY, bodyLeftW, aboveH));
        svg.appendChild(rect(bodyRightX, topY, bodyRightW, aboveH));
        for (var f = 1; f < above; f++) {
          var dy = topY + f * FH;
          svg.appendChild(line(ML, dy, ML + bodyLeftW, dy, STW));
          svg.appendChild(line(bodyRightX, dy, bodyRightX + bodyRightW, dy, STW));
        }
        if (special) {
          renderLobby(lobbyLX, topY, above, FH);
          renderLobby(lobbyRightX, topY, above, FH);
        }
        for (var f = 0; f < above; f++) {
          var floorNum = above - f;
          var fy = topY + f * FH;
          svg.appendChild(txt(ML + bodyLeftW / 2, fy + FH / 2, floorNum + '층', 10));
          svg.appendChild(txt(bodyRightX + bodyRightW / 2, fy + FH / 2, floorNum + '층', 10));
        }
      }
    }

    // ── 지면선 (건물 폭에 맞춰 좌우 대칭) ──────────────────────────────
    svg.appendChild(el('line', {
      x1: ML - 6, y1: groundY, x2: ML + BW + 6, y2: groundY,
      stroke: 'currentColor', 'stroke-width': 3,
    }));

    // ── 지하층 ────────────────────────────────────────────────────────
    if (below > 0) {
      var basTopY = MT + aboveH + GH;

      // 계단 (지상과 같은 X 위치로 이어짐)
      function renderBasStair(sx) {
        svg.appendChild(rect(sx, basTopY, SW, belowH));
        var stepLines = Math.min(below * 4, 16);
        for (var i = 1; i < stepLines; i++) {
          var sy = basTopY + (belowH * i) / stepLines;
          svg.appendChild(line(sx + 4, sy, sx + SW - 4, sy, 0.6, 0.2));
        }
        svg.appendChild(txt(sx + SW / 2, basTopY + belowH / 2, '계단', 9, 'normal', 0.55));
      }

      renderBasStair(stairLX);
      if (bothMode) renderBasStair(stairRX);

      // 부속실 (지하)
      if (special) {
        renderLobby(lobbyLX, basTopY, below, FH);
        if (bothMode) renderLobby(lobbyRX, basTopY, below, FH);
        if (centerMode) renderLobby(lobbyRightX, basTopY, below, FH);
      }

      // 본체 (지하)
      function renderBasBody(bx, bw) {
        svg.appendChild(rect(bx, basTopY, bw, belowH));
        for (var b = 1; b < below; b++) {
          svg.appendChild(line(bx, basTopY + b * FH, bx + bw, basTopY + b * FH, STW));
        }
        for (var b = 0; b < below; b++) {
          var key = -(b + 1);
          var fy = basTopY + b * FH;
          var secs = getSections(key, bw);
          if (secs) {
            var cx = bx;
            for (var s = 0; s < secs.length; s++) {
              if (s < secs.length - 1) {
                svg.appendChild(line(cx + secs[s].w, fy, cx + secs[s].w, fy + FH, 1, 0.45));
              }
              svg.appendChild(txt(cx + secs[s].w / 2, fy + FH / 2, secs[s].label, 9, '500'));
              cx += secs[s].w;
            }
          } else {
            svg.appendChild(txt(bx + bw / 2, fy + FH / 2, '지하' + (b + 1) + '층', 12));
          }
        }
      }

      if (!centerMode) {
        renderBasBody(bodyX, bodyW);
      } else {
        renderBasBody(ML, bodyLeftW);
        renderBasBody(bodyRightX, bodyRightW);
      }
    }
  }

  // ── UI 업데이트 ───────────────────────────────────────────────────────

  function updateDisplay() {
    var aboveEl = document.getElementById('ll-above-val');
    var belowEl = document.getElementById('ll-below-val');
    if (aboveEl) aboveEl.textContent = state.above;
    if (belowEl) belowEl.textContent = state.below;
    initFloors();
    if (state.totalArea) distributeArea();
    renderFloorTable();
    renderBuilding();
  }

  // ── 초기화 ────────────────────────────────────────────────────────────

  function initLayoutLearn() {
    if (initialized) return;
    initialized = true;

    document.getElementById('ll-above-dec').addEventListener('click', function () {
      if (state.above > 1) { state.above--; updateDisplay(); }
    });
    document.getElementById('ll-above-inc').addEventListener('click', function () {
      if (state.above < 20) { state.above++; updateDisplay(); }
    });

    document.getElementById('ll-below-dec').addEventListener('click', function () {
      if (state.below > 0) { state.below--; updateDisplay(); }
    });
    document.getElementById('ll-below-inc').addEventListener('click', function () {
      if (state.below < 5) { state.below++; updateDisplay(); }
    });

    document.getElementById('ll-total-area').addEventListener('input', function () {
      state.totalArea = this.value;
      distributeArea();
      renderFloorTable();
      renderBuilding();
    });

    document.querySelectorAll('.ll-radio-btn[data-pos]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.ll-radio-btn[data-pos]').forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        state.stairPos = btn.dataset.pos;
        renderBuilding();
      });
    });

    updateDisplay();
  }

  window.initLayoutLearn = initLayoutLearn;
})();
