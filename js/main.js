/* =========================================================
   Cumple Pao 35 · Confirmación por WhatsApp
   Cambia aquí el teléfono o los textos de los mensajes.
   ========================================================= */

const CONFIG = {
  // Número con prefijo de país, sin "+" ni espacios (34 = España)
  phone: "34675057062",

  messages: {
    yes: (name) =>
      `¡Hola Pao! ✨\n` +
      `Soy ${name} y confirmo que voy a tu cumple 35 🪩\n` +
      `📅 Sábado 28 de noviembre · 19:00 h\n` +
      `📍 Pez Gato Music Bar`,

    no: (name) =>
      `¡Hola Pao!\n` +
      `Soy ${name}. Me da mucha pena, pero no podré ir a tu cumple el sábado 28 de noviembre 💜\n` +
      `¡Que lo disfrutes muchísimo!`,

    note: (text) => `\n\n💬 ${text}`,
  },
};

(function () {
  "use strict";

  const form = document.getElementById("rsvpForm");
  const nameInput = document.getElementById("name");
  const noteInput = document.getElementById("note");
  const errorBox = document.getElementById("formError");
  const btnLabel = document.getElementById("btnLabel");
  const stickyCta = document.getElementById("stickyCta");
  const rsvp = document.getElementById("confirmar");

  const LABELS = {
    yes: "Confirmar por WhatsApp",
    no: "Avisar por WhatsApp",
    opening: "Abriendo WhatsApp…",
  };

  const getGoing = () => form.querySelector('input[name="going"]:checked').value;

  function updateLabel() {
    btnLabel.textContent = getGoing() === "yes" ? LABELS.yes : LABELS.no;
  }

  function showError(text) {
    errorBox.textContent = text;
    errorBox.hidden = false;
  }

  function buildMessage() {
    const name = nameInput.value.replace(/\s+/g, " ").trim();
    const note = noteInput.value.trim();
    const going = getGoing() === "yes";
    let text = going ? CONFIG.messages.yes(name) : CONFIG.messages.no(name);
    if (note) text += CONFIG.messages.note(note);
    return text;
  }

  function openWhatsApp(text) {
    const url = `https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(text)}`;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = url; // abre la app directamente
      return;
    }
    const win = window.open(url, "_blank", "noopener");
    if (!win) window.location.href = url;
  }

  form.addEventListener("change", (e) => {
    if (e.target.name === "going") updateLabel();
  });

  nameInput.addEventListener("input", () => {
    errorBox.hidden = true;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorBox.hidden = true;

    if (!nameInput.value.trim()) {
      showError("Escribe tu nombre para que Pao sepa quién eres.");
      nameInput.focus();
      return;
    }

    btnLabel.textContent = LABELS.opening;
    openWhatsApp(buildMessage());
    setTimeout(updateLabel, 2500);
  });

  // Oculta el botón fijo cuando el formulario ya está a la vista
  if (stickyCta && rsvp && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      ([entry]) => stickyCta.classList.toggle("is-hidden", entry.isIntersecting),
      { threshold: 0.15 }
    );
    io.observe(rsvp);
  }

  updateLabel();
})();
