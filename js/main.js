const toggle = document.querySelector(".nav-toggle");
const menu = document.querySelector("#site-menu");

function setMenu(open) {
  document.body.classList.toggle("nav-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  menu.setAttribute("aria-hidden", String(!open));
}

toggle.addEventListener("click", () => {
  setMenu(toggle.getAttribute("aria-expanded") !== "true");
});

menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 1360px)").matches) {
      setMenu(false);
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
    setMenu(false);
    toggle.focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 1360 && document.body.classList.contains("nav-open")) {
    setMenu(false);
  }
});

if (window.matchMedia("(max-width: 1360px)").matches) {
  menu.setAttribute("aria-hidden", "true");
}

document.querySelectorAll(".volume").forEach((volume) => {
  volume.addEventListener("click", () => {
    const muted = volume.getAttribute("aria-pressed") !== "true";
    volume.setAttribute("aria-pressed", String(muted));
    volume.setAttribute("aria-label", muted ? "Без звука" : "Со звуком");
  });
});

document.querySelectorAll("[data-expand]").forEach((button) => {
  const frame = button.closest(".media-frame");
  if (!frame) return;

  button.addEventListener("click", () => {
    if (document.fullscreenElement === frame) {
      document.exitFullscreen();
    } else {
      frame.requestFullscreen();
    }
  });
});

document.addEventListener("fullscreenchange", () => {
  document.querySelectorAll("[data-expand]").forEach((button) => {
    const frame = button.closest(".media-frame");
    const open = document.fullscreenElement === frame;
    button.setAttribute("aria-pressed", String(open));
    button.setAttribute("aria-label", open ? "Свернуть" : "На весь экран");
  });
});

const gallery = document.querySelector("[data-gallery]");
if (gallery) {
  const dots = [...gallery.querySelectorAll("[data-dot]")];
  const next = gallery.querySelector("[data-next]");
  let index = dots.findIndex((dot) => dot.classList.contains("is-active"));
  if (index < 0) index = 0;

  function showSlide(nextIndex) {
    index = (nextIndex + dots.length) % dots.length;
    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === index;
      dot.classList.toggle("is-active", active);
      if (active) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  }

  next.addEventListener("click", () => showSlide(index + 1));
  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => showSlide(dotIndex));
  });
}
