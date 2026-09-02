(function () {
  const stage = document.getElementById("theme-wheel-stage");
  if (!stage) return;

  const THEMES = [
    {
      id: "confidence",
      titleKey: "s1_t",
      bodyKey: "s1",
      image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "anxiety",
      titleKey: "s2_t",
      bodyKey: "s2",
      image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "depression",
      titleKey: "s3_t",
      bodyKey: "s3",
      image: "https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "burnout",
      titleKey: "s4_t",
      bodyKey: "s4",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "grief",
      titleKey: "s5_t",
      bodyKey: "s5",
      image: "https://images.unsplash.com/photo-1508768787810-6adc1f613514?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "palliative",
      titleKey: "s6_t",
      bodyKey: "s6",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "pain",
      titleKey: "s7_t",
      bodyKey: "s7",
      image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "phobia",
      titleKey: "s8_t",
      bodyKey: "s8",
      image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "trauma",
      titleKey: "s9_t",
      bodyKey: "s9",
      image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "addiction",
      titleKey: "s10_t",
      bodyKey: "s10",
      image: "https://images.unsplash.com/photo-1476611338391-6f395a0ebc7b?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "habits",
      titleKey: "s11_t",
      bodyKey: "s11",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "perinatal",
      titleKey: "s12_t",
      bodyKey: "s12",
      image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=900&q=80",
    },
  ];

  const count = THEMES.length;
  let selected = -1;

  const wheel = document.createElement("div");
  wheel.className = "theme-wheel";
  wheel.style.setProperty("--n", String(count));
  stage.appendChild(wheel);

  const buttons = THEMES.map((theme, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-card";
    btn.style.setProperty("--i", String(i));
    btn.dataset.id = theme.id;
    btn.innerHTML = `
      <img src="${theme.image}" alt="">
      <span class="theme-card-overlay">
        <span class="theme-card-label" data-i18n="${theme.titleKey}"></span>
        <span class="theme-card-dive" data-i18n="theme_dive"></span>
      </span>`;
    btn.dataset.index = String(i);
    btn.addEventListener("pointerenter", pause);
    btn.addEventListener("pointerleave", resume);
    btn.addEventListener("focus", pause);
    btn.addEventListener("blur", resume);
    wheel.appendChild(btn);
    return btn;
  });

  // Listening on the stage rather than each card: once a theme is open, a click
  // anywhere left or right of centre walks one step that way, so 3D hit areas of
  // the tilted neighbours can never swallow the click.
  stage.addEventListener("click", (e) => {
    const btn = e.target.closest && e.target.closest(".theme-card");
    const index = btn ? Number(btn.dataset.index) : -1;

    if (selected < 0) {
      if (index >= 0) openTheme(index);
      return;
    }
    // Front card closes. Its own box is the reliable test: which element the
    // browser hit-tests varies between the tilted cards.
    const front = buttons[selected].getBoundingClientRect();
    const onFront =
      index === selected ||
      (e.clientX >= front.left &&
        e.clientX <= front.right &&
        e.clientY >= front.top &&
        e.clientY <= front.bottom);
    if (onFront) {
      closeTheme();
      return;
    }
    const r = wheel.getBoundingClientRect();
    step(e.clientX < r.left + r.width / 2 ? -1 : 1);
  });

  function step(dir) {
    openTheme((selected + dir + count) % count);
  }

  // Same reason as the click handler: with the wheel stopped, work out the
  // hovered card from the pointer position so every neighbour reveals its title.
  let hovered = -1;
  let hoverTick = 0;

  function setHover(index) {
    if (index === hovered) return;
    if (hovered >= 0) buttons[hovered].classList.remove("is-hovered");
    hovered = index;
    if (index >= 0) buttons[index].classList.add("is-hovered");
  }

  function facing(index) {
    const deg = (((index - selected) % count) + count) % count * (360 / count);
    return Math.abs(deg > 180 ? deg - 360 : deg) < 85;
  }

  stage.addEventListener("pointermove", (e) => {
    if (selected < 0 || hoverTick) return;
    const x = e.clientX;
    const y = e.clientY;
    hoverTick = requestAnimationFrame(() => {
      hoverTick = 0;
      let best = -1;
      let bestTurn = 999;
      buttons.forEach((btn, i) => {
        if (!facing(i)) return;
        const r = btn.getBoundingClientRect();
        if (x < r.left || x > r.right || y < r.top || y > r.bottom) return;
        const d = (((i - selected) % count) + count) % count;
        const turn = Math.min(d, count - d);
        if (turn < bestTurn) {
          bestTurn = turn;
          best = i;
        }
      });
      setHover(best);
    });
  });

  stage.addEventListener("pointerleave", () => setHover(-1));

  const SPIN_MS = 32000;
  const spin = wheel.animate
    ? wheel.animate(
        [
          { transform: "rotateX(-4deg) rotateY(0deg)" },
          { transform: "rotateX(-4deg) rotateY(-360deg)" },
        ],
        { duration: SPIN_MS, iterations: Infinity, easing: "linear" }
      )
    : null;

  let snapFrame = 0;

  function pause() {
    if (spin && selected < 0) spin.pause();
  }

  function resume() {
    if (spin && selected < 0) spin.play();
  }

  // Nudge the spin clock so the chosen card ends up facing front, without
  // rewinding it: closing later just plays on from wherever it stopped.
  function snapToFront(index) {
    if (!spin) return;
    spin.pause();
    cancelAnimationFrame(snapFrame);

    const from = Number(spin.currentTime) || 0;
    const cycle = Math.floor(from / SPIN_MS) * SPIN_MS;
    const at = (index / count) * SPIN_MS;
    const to = [cycle + at - SPIN_MS, cycle + at, cycle + at + SPIN_MS].reduce((best, t) =>
      Math.abs(t - from) < Math.abs(best - from) ? t : best
    );

    const start = performance.now();
    const glide = (now) => {
      const p = Math.min((now - start) / 700, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      spin.currentTime = from + (to - from) * eased;
      if (p < 1) snapFrame = requestAnimationFrame(glide);
    };
    snapFrame = requestAnimationFrame(glide);
  }

  document.addEventListener("pointerleave", resume);
  window.addEventListener("blur", resume);

  const detail = document.getElementById("theme-detail");
  const titleEl = document.getElementById("theme-detail-title");
  const bodyEl = document.getElementById("theme-detail-body");
  const bookEl = document.getElementById("theme-detail-book");
  const resumeEl = document.getElementById("theme-detail-resume");
  const below = document.getElementById("theme-below");

  function dict() {
    const lang = localStorage.getItem("ll-lang") || "fr";
    return (window.I18N && window.I18N[lang]) || {};
  }

  function applyLabels() {
    const d = dict();
    buttons.forEach((btn, i) => {
      const label = btn.querySelector(".theme-card-label");
      const dive = btn.querySelector(".theme-card-dive");
      const key = THEMES[i].titleKey;
      if (label && d[key]) label.textContent = d[key];
      if (dive && d.theme_dive) dive.textContent = d.theme_dive;
      btn.setAttribute("aria-label", d[key] || THEMES[i].id);
      btn.querySelector("img").alt = d[key] || "";
    });
    if (selected >= 0) fillDetail(selected);
  }

  function fillDetail(index) {
    const theme = THEMES[index];
    const d = dict();
    titleEl.textContent = d[theme.titleKey] || "";
    bodyEl.textContent = d[theme.bodyKey] || "";
    bookEl.href = "book.html?topic=" + encodeURIComponent(theme.id);
    if (d.theme_book) bookEl.textContent = d.theme_book;
    detail.hidden = false;
    if (below) below.classList.add("is-open");
  }

  function openTheme(index) {
    if (selected === index) {
      closeTheme();
      return;
    }
    selected = index;
    snapToFront(index);
    buttons.forEach((btn, i) => btn.setAttribute("aria-pressed", i === index ? "true" : "false"));
    fillDetail(index);
    history.replaceState(null, "", "#" + THEMES[index].id);
  }

  function closeTheme() {
    selected = -1;
    cancelAnimationFrame(snapFrame);
    if (spin) spin.play();
    buttons.forEach((btn) => btn.setAttribute("aria-pressed", "false"));
    detail.hidden = true;
    setHover(-1);
    if (below) below.classList.remove("is-open");
    history.replaceState(null, "", location.pathname);
  }

  if (resumeEl) resumeEl.addEventListener("click", closeTheme);

  document.addEventListener("keydown", (e) => {
    if (selected < 0) return;
    if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "Escape") closeTheme();
  });

  const fromHash = THEMES.findIndex((t) => t.id === (location.hash || "").replace("#", ""));
  if (fromHash >= 0) openTheme(fromHash);

  applyLabels();
  const prev = window.applyI18n;
  window.applyI18n = function (lang) {
    prev(lang);
    applyLabels();
  };
})();
