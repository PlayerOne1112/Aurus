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

document
  .querySelectorAll(
    ".site-nav a, .site-footer__menu a, .site-footer__legal, .site-footer__contacts a"
  )
  .forEach((link) => {
    const text = link.textContent;
    if (!text || link.children.length > 0) return;

    const chars = [...text];
    link.replaceChildren();
    link.classList.add("letter-link");
    link.setAttribute("aria-label", text.trim());

    chars.forEach((char, index) => {
      const span = document.createElement("span");
      span.className = "char";
      span.style.setProperty("--i", String(index));
      span.style.setProperty("--n", String(chars.length));
      span.textContent = char === " " ? "\u00A0" : char;
      link.append(span);
    });
  });

const accessForm = document.querySelector("#access-form");
const accessPassword = document.querySelector("#access-password");
const accessError = document.querySelector(".access-gate__error");
const passwordHash = "03b0e87b8ce1ee26a26b861c84e048276d687eb61e599b8180ea4b4bc8a6ef98";

function setSiteLocked(locked) {
  document.documentElement.classList.toggle("is-unlocked", !locked);
  document.querySelectorAll("header, main, footer").forEach((element) => {
    if (locked) element.setAttribute("inert", "");
    else element.removeAttribute("inert");
  });
}

async function passwordDigest(value) {
  const data = new TextEncoder().encode(value);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

if (accessForm) {
  const unlocked = document.documentElement.classList.contains("is-unlocked");
  setSiteLocked(!unlocked);
  if (!unlocked) accessPassword.focus();

  accessForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const digest = await passwordDigest(accessPassword.value);
    if (digest !== passwordHash) {
      accessError.hidden = false;
      accessPassword.focus();
      return;
    }

    try {
      localStorage.setItem("aurus-access", "1");
    } catch (error) {}
    accessError.hidden = true;
    accessPassword.value = "";
    setSiteLocked(false);
  });
}
