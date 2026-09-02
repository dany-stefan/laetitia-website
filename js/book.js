(function () {
  const form = document.getElementById("book-form");
  if (!form) return;

  const dateInput = document.getElementById("date");
  const slotsEl = document.getElementById("slots");
  const slotField = document.getElementById("slot");
  const durationEls = form.elements.duration;

  const today = new Date();
  const max = new Date();
  max.setDate(today.getDate() + 30);
  const iso = (d) => d.toISOString().slice(0, 10);
  dateInput.min = iso(today);
  dateInput.max = iso(max);
  if (!dateInput.value) dateInput.value = iso(today);

  function timesFor(minutes) {
    const out = [];
    const start = 11 * 60;
    const end = 16 * 60;
    let t = start;
    while (t + minutes <= end) {
      const h = String(Math.floor(t / 60)).padStart(2, "0");
      const m = String(t % 60).padStart(2, "0");
      out.push(`${h}:${m}`);
      t += minutes + 15;
    }
    return out;
  }

  let taken = new Set();
  fetch("data/slots-public.json")
    .then((r) => (r.ok ? r.json() : []))
    .then((rows) => {
      taken = new Set((rows || []).map((x) => x.start || x));
      renderSlots();
    })
    .catch(() => renderSlots());

  function duration() {
    return Number((form.querySelector("[name=duration]:checked") || {}).value || 90);
  }

  function renderSlots() {
    const date = dateInput.value;
    slotsEl.innerHTML = "";
    timesFor(duration()).forEach((time) => {
      const key = `${date}T${time}`;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = time;
      btn.disabled = taken.has(key);
      btn.setAttribute("aria-pressed", slotField.value === time ? "true" : "false");
      btn.addEventListener("click", () => {
        slotField.value = time;
        renderSlots();
      });
      slotsEl.appendChild(btn);
    });
  }

  const params = new URLSearchParams(location.search);
  const topicFromUrl = params.get("topic");
  const topicSel = document.getElementById("topic");
  if (topicFromUrl && topicSel && [...topicSel.options].some((o) => o.value === topicFromUrl)) {
    topicSel.value = topicFromUrl;
  }

  const notesEl = document.getElementById("notes");
  if (params.get("request") === "special" && notesEl && !notesEl.value) {
    const lang = localStorage.getItem("ll-lang") || "fr";
    const dict = (window.I18N && window.I18N[lang]) || {};
    if (dict.theme_notes_special) notesEl.value = dict.theme_notes_special;
  }

  dateInput.addEventListener("change", renderSlots);
  [...form.querySelectorAll("[name=duration]")].forEach((el) => el.addEventListener("change", renderSlots));
  renderSlots();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!slotField.value) {
      alert("Choose a time.");
      return;
    }
    const when = `${dateInput.value} ${slotField.value} (${duration()} min, America/Toronto)`;
    const clientEmail = (form.email.value || "").trim();
    const lang = localStorage.getItem("ll-lang") || "fr";
    const dict = (window.I18N && window.I18N[lang]) || {};
    form.querySelector("[name=_subject]").value = "Séance — " + when;
    form.querySelector("[name=when]").value = when;
    form.querySelector("[name=_replyto]").value = clientEmail;
    form.querySelector("[name=_cc]").value = clientEmail;
    if (form.querySelector("[name=_autoresponse]") && dict.book_mail) {
      form.querySelector("[name=_autoresponse]").value = dict.book_mail;
    }

    const data = new FormData(form);
    const payload = {};
    data.forEach((v, k) => {
      payload[k] = v;
    });

    const subject = (dict.book_client_subject || "Session") + " — " + when;
    const body = (dict.book_client_body || "").replace("{{when}}", when);
    const mailto = `mailto:${encodeURIComponent(clientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    fetch("https://formsubmit.co/ajax/3acb6ad24925a83b768e11e1d329aa41", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: data,
    })
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(() => {
        window.location.href = mailto;
      })
      .catch(() => {
        window.location.href = mailto;
      });
  });
})();
