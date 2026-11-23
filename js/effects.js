/* =========================================================
   Efectos de scroll
   - [data-reveal]: aparece al entrar en pantalla.
   - [data-speed]: parallax. Positivo baja más despacio que el
     scroll, negativo sube más rápido. Se mide desde el centro
     de su sección, así cada capa se recoloca al entrar.
   Con "reducir movimiento" activado no se aplica nada.
   ========================================================= */

(function () {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));

  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-in"));
    return;
  }

  /* ---- Aparición escalonada ---- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = Array.from(el.parentElement.querySelectorAll(":scope > [data-reveal]"));
        const i = Math.max(0, siblings.indexOf(el));
        el.style.transitionDelay = `${Math.min(i, 5) * 90}ms`;
        el.classList.add("is-in");
        io.unobserve(el);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  revealEls.forEach((el) => io.observe(el));

  /* ---- Parallax ---- */
  const layers = Array.from(document.querySelectorAll("[data-speed]")).map((el) => ({
    el,
    speed: parseFloat(el.dataset.speed) || 0,
    section: el.closest("section, header") || document.body,
  }));
  if (!layers.length) return;

  let ticking = false;

  function update() {
    ticking = false;
    const vh = window.innerHeight;
    const k = window.innerWidth < 900 ? 0.35 : 1; // más suave en móvil
    for (const layer of layers) {
      const r = layer.section.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue; // fuera de pantalla
      const offset = (r.top + r.height / 2 - vh / 2) * layer.speed * k;
      layer.el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();
