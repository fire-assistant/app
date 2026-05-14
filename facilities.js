(function () {
  'use strict';

  const openBtn = document.getElementById('open-facilities');
  const backBtn = document.getElementById('back-from-facilities');
  const contentEl = document.getElementById('facilities-content');

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  function trackMenuClick(menuName) {
    if (typeof gtag === "function") {
      gtag("event", "menu_click", { menu_name: menuName });
    }
  }

  openBtn.addEventListener('click', () => {
    trackMenuClick("소방시설도감");
    showScreen('screen-facilities');
    init();
  });

  backBtn.addEventListener('click', () => showScreen('screen-home'));

  let initialized = false;

  function init() {
    if (initialized) return;
    initialized = true;

    const tabBar = document.createElement('div');
    tabBar.className = 'rg-tab-bar';

    const contentArea = document.createElement('div');
    contentArea.className = 'rg-content';

    FACILITIES_DATA.forEach((tab, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rg-tab-btn' + (i === 0 ? ' active' : '');
      btn.dataset.idx = i;
      btn.innerHTML = `<span class="rg-tab-main">${tab.tabLabel}</span>`;
      tabBar.appendChild(btn);

      const panel = document.createElement('div');
      panel.className = 'fac-panel' + (i !== 0 ? ' hidden' : '');
      panel.dataset.idx = i;
      if (tab.intro && tab.showIntro !== false) panel.appendChild(buildIntroCard(tab.intro));
      tab.items.forEach(item => panel.appendChild(buildAccordion(item)));
      contentArea.appendChild(panel);
    });

    tabBar.addEventListener('click', e => {
      const btn = e.target.closest('.rg-tab-btn');
      if (!btn) return;
      const idx = btn.dataset.idx;
      tabBar.querySelectorAll('.rg-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.idx === idx));
      contentArea.querySelectorAll('.fac-panel').forEach(p => p.classList.toggle('hidden', p.dataset.idx !== idx));
      contentArea.scrollTop = 0;
    });

    contentEl.appendChild(tabBar);
    contentEl.appendChild(contentArea);
  }

  window.initFacilities = init;

  function encodePath(path) {
    return path.split('/').map((seg, i) => (i === 0 && (seg === '.' || seg === '..')) ? seg : encodeURIComponent(seg)).join('/');
  }

  function makePhotoGallery(photos) {
    const wrap = document.createElement('div');
    wrap.className = 'fac-photo-gallery' + (photos.length > 1 ? ' fac-photo-gallery-multi' : '');

    photos.forEach(p => {
      const fig = document.createElement('figure');
      fig.className = 'fac-photo-fig';

      const imgWrap = document.createElement('div');
      imgWrap.className = 'fac-photo-img-wrap';

      const img = document.createElement('img');
      img.src = encodePath(p.src);
      img.className = 'fac-photo-img';
      img.alt = p.caption || '';
      img.loading = 'lazy';
      imgWrap.appendChild(img);

      if (p.source) {
        const badge = document.createElement('span');
        badge.className = 'fac-photo-source-badge';
        badge.textContent = '출처: ' + p.source;
        imgWrap.appendChild(badge);
      }

      fig.appendChild(imgWrap);

      if (p.caption) {
        const cap = document.createElement('figcaption');
        cap.className = 'fac-photo-cap';
        cap.textContent = p.caption;
        fig.appendChild(cap);
      }

      wrap.appendChild(fig);
    });

    return wrap;
  }

  function buildAccordion(item) {
    const wrap = document.createElement('div');
    wrap.className = 'rg-accordion';

    const header = document.createElement('button');
    header.type = 'button';
    header.className = 'rg-accordion-header';
    header.innerHTML = `
      <div>
        <div class="fac-item-category">${item.category}</div>
        <div class="rg-acc-label">${item.name}</div>
      </div>
      <span class="rg-acc-chevron">▼</span>`;

    const body = document.createElement('div');
    body.className = 'rg-accordion-body hidden';

    if (item.definition) {
      const el = document.createElement('div');
      el.className = 'fac-definition';
      el.textContent = item.definition;
      body.appendChild(el);
    }

    // 사진 + 설명: compact가 아니면 갤러리(위) + 설명(아래) 또는 2열 나란히, compact는 설명만
    if (item.level !== 'compact') {
      if (item.photos?.length) {
        body.appendChild(makePhotoGallery(item.photos));
        if (item.description) {
          const el = document.createElement('p');
          el.className = 'fac-description';
          el.textContent = item.description;
          body.appendChild(el);
        }
      } else if (item.photoWithComponents && item.components?.length) {
        const row = document.createElement('div');
        row.className = 'fac-photo-comp-row';

        const photoCol = document.createElement('div');
        photoCol.className = 'fac-photo-col';
        photoCol.appendChild(makeMainPhoto(item));
        row.appendChild(photoCol);

        const rightCol = document.createElement('div');
        rightCol.className = 'fac-desc-col';

        if (item.description) {
          const p = document.createElement('p');
          p.className = 'fac-description fac-description-top';
          p.textContent = item.description;
          rightCol.appendChild(p);
        }

        const compLabel = document.createElement('div');
        compLabel.className = 'fac-sidebar-comp-label';
        compLabel.textContent = '주요 구성요소';
        rightCol.appendChild(compLabel);

        const compList = document.createElement('div');
        compList.className = 'fac-sidebar-comp-list';
        item.components.forEach(c => {
          const compRow = document.createElement('div');
          compRow.className = 'fac-sidebar-comp-row';
          compRow.innerHTML = `<div class="fac-sidebar-comp-name">${c.name}</div><div class="fac-sidebar-comp-desc">${c.desc}</div>`;
          compList.appendChild(compRow);
        });
        rightCol.appendChild(compList);

        row.appendChild(rightCol);
        body.appendChild(row);
      } else {
        const row = document.createElement('div');
        row.className = 'fac-photo-desc-row';

        const photoCol = document.createElement('div');
        photoCol.className = 'fac-photo-col';
        photoCol.appendChild(makeMainPhoto(item));
        row.appendChild(photoCol);

        if (item.description) {
          const descCol = document.createElement('div');
          descCol.className = 'fac-desc-col';
          const el = document.createElement('p');
          el.className = 'fac-description';
          el.textContent = item.description;
          descCol.appendChild(el);
          row.appendChild(descCol);
        }

        body.appendChild(row);
      }
    } else if (item.description) {
      const el = document.createElement('p');
      el.className = 'fac-description';
      el.textContent = item.description;
      body.appendChild(el);
    }

    if (item.types?.length) {
      body.appendChild(makeSectionLabel('종류'));
      const grid = document.createElement('div');
      grid.className = 'fac-type-grid';
      item.types.forEach(t => {
        const card = document.createElement('div');
        card.className = 'fac-type-card';

        if (t.photo) {
          const photoWrap = document.createElement('div');
          photoWrap.className = 'fac-mini-photo';
          if (typeof t.photo === 'string') {
            const img = document.createElement('img');
            img.src = encodePath(t.photo);
            img.alt = t.name;
            img.loading = 'lazy';
            img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
            photoWrap.appendChild(img);
          } else {
            photoWrap.textContent = '📷';
          }
          card.appendChild(photoWrap);
        }

        const name = document.createElement('div');
        name.className = 'fac-type-name';
        name.textContent = t.name;
        const desc = document.createElement('div');
        desc.className = 'fac-type-desc';
        desc.textContent = t.desc;
        card.appendChild(name);
        card.appendChild(desc);
        grid.appendChild(card);
      });
      body.appendChild(grid);
    }

    if (item.components?.length && !item.photoWithComponents) {
      body.appendChild(makeSectionLabel('주요 구성요소'));
      const list = document.createElement('div');
      list.className = 'fac-comp-list';
      item.components.forEach(c => {
        const row = document.createElement('div');
        row.className = 'fac-comp-row';
        if (c.photo) row.appendChild(makeMiniPhoto('sm'));
        const text = document.createElement('div');
        text.className = 'fac-comp-text';
        text.innerHTML = `<div class="fac-comp-name">${c.name}</div><div class="fac-comp-desc">${c.desc}</div>`;
        row.appendChild(text);
        list.appendChild(row);
      });
      body.appendChild(list);
    }

    if (item.showWaterSystemComponents) {
      const introData = FACILITIES_DATA[0]?.intro;
      if (introData) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'fac-water-comp-btn';
        btn.innerHTML = `<span>🔧 수계소화설비 공통 구성요소</span><span class="fac-water-comp-chevron">▼</span>`;

        const panel = document.createElement('div');
        panel.className = 'fac-water-comp-panel hidden';
        const introCard = buildIntroCard(introData);
        introCard.querySelector('.fac-intro-header')?.remove();
        panel.appendChild(introCard);

        btn.addEventListener('click', () => {
          const isHidden = panel.classList.toggle('hidden');
          btn.querySelector('.fac-water-comp-chevron').textContent = isHidden ? '▼' : '▲';
          btn.classList.toggle('open', !isHidden);
        });

        body.appendChild(btn);
        body.appendChild(panel);
      }
    }

    if (item.criteria?.length) {
      body.appendChild(makeSectionLabel('핵심 설치기준'));
      const ul = document.createElement('ul');
      ul.className = 'rg-acc-desc';
      item.criteria.forEach(c => {
        const li = document.createElement('li');
        li.textContent = c;
        ul.appendChild(li);
      });
      body.appendChild(ul);
    }

    if (item.usage?.length) {
      body.appendChild(makeSectionLabel('사용법'));
      const ol = document.createElement('ol');
      ol.className = 'fac-usage-list';
      item.usage.forEach(u => {
        const li = document.createElement('li');
        li.textContent = u;
        ol.appendChild(li);
      });
      body.appendChild(ol);
    }

    if (item.storage?.length) {
      body.appendChild(makeSectionLabel('보관법'));
      const ul = document.createElement('ul');
      ul.className = 'rg-acc-desc';
      item.storage.forEach(s => {
        const li = document.createElement('li');
        li.textContent = s;
        ul.appendChild(li);
      });
      body.appendChild(ul);
    }

    if (item.inspection?.length) {
      body.appendChild(makeSectionLabel('점검방법'));
      const ul = document.createElement('ul');
      ul.className = 'rg-acc-desc';
      item.inspection.forEach(ins => {
        const li = document.createElement('li');
        li.textContent = ins;
        ul.appendChild(li);
      });
      body.appendChild(ul);
    }

    if (item.tips?.length) {
      body.appendChild(makeSectionLabel('주의사항'));
      const box = document.createElement('div');
      box.className = 'info-box amber';
      item.tips.forEach((tip, i) => {
        const p = document.createElement('p');
        p.style.margin = i === 0 ? '0' : '6px 0 0';
        p.textContent = tip;
        box.appendChild(p);
      });
      body.appendChild(box);
    }

    header.addEventListener('click', () => {
      const open = header.classList.toggle('open');
      body.classList.toggle('hidden', !open);
    });

    wrap.appendChild(header);
    wrap.appendChild(body);
    return wrap;
  }

  function makeMainPhoto(item) {
    const fig = document.createElement('figure');
    fig.className = 'fac-photo-fig';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'fac-photo-img-wrap';

    const candidates = [
      `./image/facilities/${item.name}/${item.name}_main.jpg`,
      `./image/facilities/${item.name}/${item.name}_main.webp`,
    ];
    let idx = 0;

    const img = document.createElement('img');
    img.className = 'fac-photo-img';
    img.alt = item.name;
    img.loading = 'lazy';
    img.src = encodePath(candidates[idx]);
    img.onerror = () => {
      idx++;
      if (idx < candidates.length) {
        img.src = encodePath(candidates[idx]);
      } else {
        fig.replaceWith(makePlaceholder(`${item.name} 대표 사진`));
      }
    };

    if (item.mainLabel) {
      const badge = document.createElement('span');
      badge.className = 'fac-photo-source-badge';
      badge.textContent = item.mainLabel;
      imgWrap.appendChild(badge);
    } else if (item.mainSource) {
      const badge = document.createElement('span');
      badge.className = 'fac-photo-source-badge';
      badge.textContent = '출처: ' + item.mainSource;
      imgWrap.appendChild(badge);
    }

    imgWrap.appendChild(img);
    fig.appendChild(imgWrap);
    return fig;
  }

  function makePlaceholder(label) {
    const el = document.createElement('div');
    el.className = 'fac-photo-placeholder';
    el.innerHTML = `<span>📷</span><span>${label} 준비중</span>`;
    return el;
  }

  function makeMiniPhoto(size) {
    const el = document.createElement('div');
    el.className = 'fac-mini-photo' + (size === 'sm' ? ' fac-mini-photo-sm' : '');
    el.textContent = '📷';
    return el;
  }

  function makeSectionLabel(text) {
    const el = document.createElement('div');
    el.className = 'rg-section-label';
    el.textContent = text;
    return el;
  }

  function levelLabel(level) {
    return { full: 'FULL', standard: 'STD', compact: 'COMPACT' }[level] || '';
  }

  function buildIntroCard(intro) {
    const card = document.createElement('div');
    card.className = 'fac-intro-card';

    // 헤더 (클릭으로 접기/펼치기)
    const header = document.createElement('div');
    header.className = 'fac-intro-header';

    const left = document.createElement('div');
    left.className = 'fac-intro-header-left';
    left.innerHTML = `<span class="fac-intro-icon">${intro.type === 'comparison' ? '📊' : '🔧'}</span>
                      <span class="fac-intro-title">${intro.title}</span>
                      <span class="fac-intro-badge">${intro.type === 'comparison' ? '비교' : '공통'}</span>`;

    const toggle = document.createElement('span');
    toggle.className = 'fac-intro-toggle open';
    toggle.textContent = '▲';

    header.appendChild(left);
    header.appendChild(toggle);
    card.appendChild(header);

    // 바디
    const body = document.createElement('div');
    body.className = 'fac-intro-body';

    if (intro.description) {
      const desc = document.createElement('p');
      desc.className = 'fac-intro-desc';
      desc.textContent = intro.description;
      body.appendChild(desc);
    }

    if (intro.type === 'components' && intro.components) {
      const grid = document.createElement('div');
      grid.className = 'fac-intro-comp-grid';
      intro.components.forEach(comp => {
        const compCard = document.createElement('div');
        compCard.className = 'fac-intro-comp-card' + (comp.note ? ' has-note' : '');

        if (comp.photo) {
          const photoWrap = document.createElement('div');
          photoWrap.className = 'fac-intro-comp-photo';
          const img = document.createElement('img');
          img.src = encodePath(comp.photo);
          img.alt = comp.name;
          img.loading = 'lazy';
          photoWrap.appendChild(img);
          compCard.appendChild(photoWrap);
        }

        const info = document.createElement('div');
        info.className = 'fac-intro-comp-info';

        const nameRow = document.createElement('div');
        nameRow.className = 'fac-intro-comp-name-row';
        const name = document.createElement('div');
        name.className = 'fac-intro-comp-name';
        name.textContent = comp.name;
        nameRow.appendChild(name);
        if (comp.analogy) {
          const badge = document.createElement('span');
          badge.className = 'fac-intro-comp-analogy';
          badge.textContent = comp.analogy;
          nameRow.appendChild(badge);
        }
        info.appendChild(nameRow);

        const descEl = document.createElement('div');
        descEl.className = 'fac-intro-comp-desc';
        descEl.textContent = comp.desc;
        info.appendChild(descEl);

        if (comp.note) {
          const note = document.createElement('div');
          note.className = 'fac-intro-comp-note';
          note.textContent = '⚠️ ' + comp.note;
          info.appendChild(note);
        }

        compCard.appendChild(info);
        grid.appendChild(compCard);
      });
      body.appendChild(grid);

    } else if (intro.type === 'comparison' && intro.headers && intro.rows) {
      // 데스크탑: 테이블
      const tableWrap = document.createElement('div');
      tableWrap.className = 'fac-intro-table-wrap fac-comp-table-view';
      const table = document.createElement('table');
      table.className = 'fac-intro-table';

      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      intro.headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      intro.rows.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach((cell) => {
          const td = document.createElement('td');
          td.textContent = cell;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      tableWrap.appendChild(table);
      body.appendChild(tableWrap);

      // 모바일: 컬럼별 카드
      const cardView = document.createElement('div');
      cardView.className = 'fac-comp-card-view';
      for (let col = 1; col < intro.headers.length; col++) {
        const colCard = document.createElement('div');
        colCard.className = 'fac-comp-col-card';
        const colTitle = document.createElement('div');
        colTitle.className = 'fac-comp-col-title';
        colTitle.textContent = intro.headers[col];
        colCard.appendChild(colTitle);
        intro.rows.forEach(row => {
          const rowEl = document.createElement('div');
          rowEl.className = 'fac-comp-col-row';
          const label = document.createElement('span');
          label.className = 'fac-comp-col-label';
          label.textContent = row[0];
          const val = document.createElement('span');
          val.className = 'fac-comp-col-val';
          val.textContent = row[col];
          rowEl.appendChild(label);
          rowEl.appendChild(val);
          colCard.appendChild(rowEl);
        });
        cardView.appendChild(colCard);
      }
      body.appendChild(cardView);
    }

    card.appendChild(body);

    // 접기/펼치기
    header.addEventListener('click', () => {
      const isOpen = !body.classList.contains('hidden');
      body.classList.toggle('hidden', isOpen);
      toggle.textContent = isOpen ? '▼' : '▲';
      toggle.classList.toggle('open', !isOpen);
    });

    return card;
  }
})();
