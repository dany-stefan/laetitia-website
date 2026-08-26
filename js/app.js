(function () {
  const page = document.body.dataset.page;
  const header = document.querySelector("[data-header]");
  if (header) {
    header.innerHTML = `
      <a class="brand" href="index.html">Laetitia Legrand</a>
      <nav class="nav-links">
        <a href="index.html" data-i18n="nav_home" ${page === "home" ? 'aria-current="page"' : ""}></a>
        <a href="about.html" data-i18n="nav_about" ${page === "about" ? 'aria-current="page"' : ""}></a>
        <a href="subjects.html" data-i18n="nav_subjects" ${page === "subjects" ? 'aria-current="page"' : ""}></a>
        <a href="reviews.html" data-i18n="nav_reviews" ${page === "reviews" ? 'aria-current="page"' : ""}></a>
        <a href="book.html" data-i18n="nav_book" ${page === "book" ? 'aria-current="page"' : ""}></a>
      </nav>
      <div class="header-tools">
        <div class="lang-toggle" role="group">
          <button type="button" data-lang="fr">FR</button>
          <button type="button" data-lang="en">EN</button>
        </div>
      </div>`;
  }

  const lang = localStorage.getItem("ll-lang") || "fr";
  window.applyI18n(lang);
  document.querySelectorAll(".lang-toggle button").forEach((btn) => {
    btn.addEventListener("click", () => window.applyI18n(btn.dataset.lang));
  });
})();
