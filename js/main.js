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

function navIsCollapsed() {
  const query = document.documentElement.classList.contains("is-motion")
    ? "(max-width: 1439px)"
    : "(max-width: 1360px)";
  return window.matchMedia(query).matches;
}

menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    if (navIsCollapsed()) setMenu(false);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
    setMenu(false);
    toggle.focus();
  }
});

window.addEventListener("resize", () => {
  if (!navIsCollapsed() && document.body.classList.contains("nav-open")) {
    setMenu(false);
  }
});

if (navIsCollapsed()) menu.setAttribute("aria-hidden", "true");

const expandMs = 380;
const expandEase = "cubic-bezier(0.2, 0.8, 0.2, 1)";

function setSound(frame, audible) {
  const video = frame.querySelector("video");
  const volume = frame.querySelector(".volume");
  if (video) {
    video.muted = !audible;
    if (audible) video.play().catch(() => {});
  }
  if (volume) {
    volume.setAttribute("aria-pressed", String(!audible));
    volume.setAttribute("aria-label", audible ? "Со звуком" : "Без звука");
  }
}

function setExpandButton(frame, open) {
  const button = frame.querySelector("[data-expand]");
  if (!button) return;
  button.setAttribute("aria-pressed", String(open));
  button.setAttribute("aria-label", open ? "Свернуть" : "На весь экран");
}

function setFrameBox(frame, box) {
  frame.style.top = `${box.top}px`;
  frame.style.left = `${box.left}px`;
  frame.style.width = `${box.width}px`;
  frame.style.height = `${box.height}px`;
}

function frameHome(frame) {
  const scene = frame.closest(".scene");
  const sceneStyle = getComputedStyle(scene);
  const sceneRect = scene.getBoundingClientRect();
  const padTop = parseFloat(sceneStyle.paddingTop) || 0;
  const padLeft = parseFloat(sceneStyle.paddingLeft) || 0;
  const padRight = parseFloat(sceneStyle.paddingRight) || 0;
  return {
    top: sceneRect.top + padTop,
    left: sceneRect.left + padLeft,
    width: sceneRect.width - padLeft - padRight,
    height: Number(frame.dataset.homeHeight) || frame.offsetHeight,
  };
}

function clearFrameBox(frame) {
  frame.style.position = "";
  frame.style.zIndex = "";
  frame.style.margin = "";
  frame.style.transition = "";
  frame.style.top = "";
  frame.style.left = "";
  frame.style.width = "";
  frame.style.height = "";
}

function expandFrame(frame) {
  if (frame.classList.contains("is-expanded") || frame.dataset.animating === "1") return;
  const scene = frame.closest(".scene");
  const rect = frame.getBoundingClientRect();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  frame.dataset.homeHeight = String(Math.round(rect.height));
  frame.dataset.animating = "1";
  scene.style.minHeight = `${scene.offsetHeight}px`;
  frame.style.position = "fixed";
  frame.style.zIndex = "120";
  frame.style.margin = "0";
  frame.style.transition = "none";
  setFrameBox(frame, rect);
  document.body.classList.add("media-expanded");
  frame.offsetHeight;

  const finish = () => {
    frame.classList.add("is-expanded");
    frame.dataset.animating = "0";
    setSound(frame, true);
    setExpandButton(frame, true);
  };

  if (reduce) {
    setFrameBox(frame, { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight });
    finish();
    return;
  }

  requestAnimationFrame(() => {
    frame.style.transition = `top ${expandMs}ms ${expandEase}, left ${expandMs}ms ${expandEase}, width ${expandMs}ms ${expandEase}, height ${expandMs}ms ${expandEase}`;
    setFrameBox(frame, { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight });
    window.setTimeout(finish, expandMs);
  });
}

function collapseFrame(frame) {
  if (frame.dataset.animating === "1") return;
  if (!frame.classList.contains("is-expanded") && frame.style.position !== "fixed") return;
  const scene = frame.closest(".scene");
  const home = frameHome(frame);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  frame.dataset.animating = "1";
  frame.classList.remove("is-expanded");
  setSound(frame, false);
  setExpandButton(frame, false);

  const finish = () => {
    clearFrameBox(frame);
    scene.style.minHeight = "";
    frame.dataset.animating = "0";
    document.body.classList.remove("media-expanded");
  };

  if (reduce) {
    finish();
    return;
  }

  frame.style.transition = `top ${expandMs}ms ${expandEase}, left ${expandMs}ms ${expandEase}, width ${expandMs}ms ${expandEase}, height ${expandMs}ms ${expandEase}`;
  setFrameBox(frame, home);
  window.setTimeout(finish, expandMs);
}

document.querySelectorAll(".media-frame video").forEach((video) => {
  video.muted = true;
  video.play().catch(() => {});
});

document.querySelectorAll(".volume").forEach((volume) => {
  volume.addEventListener("click", () => {
    const frame = volume.closest(".media-frame");
    const video = frame ? frame.querySelector("video") : null;
    const audible = video ? video.muted : volume.getAttribute("aria-pressed") === "true";
    if (frame) setSound(frame, audible);
  });
});

document.querySelectorAll("[data-expand]").forEach((button) => {
  const frame = button.closest(".media-frame");
  if (!frame) return;

  button.addEventListener("click", () => {
    if (frame.classList.contains("is-expanded")) collapseFrame(frame);
    else expandFrame(frame);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const frame = document.querySelector(".media-frame.is-expanded");
  if (!frame) return;
  collapseFrame(frame);
});

window.addEventListener("resize", () => {
  document.querySelectorAll(".media-frame.is-expanded").forEach((frame) => {
    if (frame.dataset.animating === "1") return;
    setFrameBox(frame, { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight });
  });
});

const gallery = document.querySelector("[data-gallery]");
if (gallery) {
  const dots = [...gallery.querySelectorAll("[data-dot]")];
  const photos = [...gallery.querySelectorAll(".gallery__photo")];
  const prev = gallery.querySelector("[data-prev]");
  const next = gallery.querySelector("[data-next]");
  let index = dots.findIndex((dot) => dot.classList.contains("is-active"));
  if (index < 0) index = 0;

  function setNavEdge(button, hidden) {
    button.classList.toggle("is-hidden", hidden);
    button.disabled = hidden;
    button.toggleAttribute("aria-hidden", hidden);
  }

  function showSlide(nextIndex) {
    const previous = index;
    const last = photos.length - 1;
    index = Math.max(0, Math.min(nextIndex, last));
    photos.forEach((photo, photoPosition) => {
      const active = photoPosition === index;
      photo.classList.toggle("is-active", active);
      photo.classList.toggle("is-base", photoPosition === previous && !active);
    });
    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === index;
      dot.classList.toggle("is-active", active);
      if (active) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
    setNavEdge(prev, index === 0);
    setNavEdge(next, index === last);
  }

  showSlide(index);
  prev.addEventListener("click", () => showSlide(index - 1));
  next.addEventListener("click", () => showSlide(index + 1));
  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => showSlide(dotIndex));
  });
}

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
