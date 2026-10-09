const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function easeOut(progress) {
  const x1 = 0.16;
  const y1 = 1;
  const x2 = 0.3;
  const y2 = 1;
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t) => (3 * ax * t + 2 * bx) * t + cx;
  let t = progress;
  for (let step = 0; step < 6; step += 1) {
    const slope = sampleDX(t);
    if (Math.abs(slope) < 1e-6) break;
    t -= (sampleX(t) - progress) / slope;
  }
  return sampleY(Math.min(1, Math.max(0, t)));
}

function markCards() {
  document.querySelectorAll(".product-grid").forEach((grid) => {
    grid.querySelectorAll(".product-card").forEach((card, index) => {
      card.style.transitionDelay = `${index * 0.07}s`;
    });
  });
}

function visibleAmount(node) {
  const rect = node.getBoundingClientRect();
  const view = window.innerHeight || 1;
  return Math.min(rect.bottom, view) - Math.max(rect.top, 0);
}

function watchReveals() {
  const nodes = [...document.querySelectorAll(
    ".product-hero__content, .section-head, .feature__copy, .product-card, .site-footer"
  )];
  const reveal = (node) => node.classList.add("is-in");
  const cardInView = (node) => {
    const rect = node.getBoundingClientRect();
    const view = window.innerHeight || 1;
    return rect.bottom > 80 && rect.top < view - 48;
  };
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.target.classList.contains("product-card")) return;
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
  );

  const sync = () => {
    nodes.forEach((node) => {
      if (node.classList.contains("product-card")) {
        node.classList.toggle("is-in", cardInView(node));
        return;
      }
      if (node.classList.contains("is-in")) return;
      const rect = node.getBoundingClientRect();
      if (rect.bottom < 64 || visibleAmount(node) > 32) {
        reveal(node);
        observer.unobserve(node);
      }
    });
  };

  sync();
  nodes.forEach((node) => {
    if (!node.classList.contains("product-card") && !node.classList.contains("is-in")) observer.observe(node);
  });
  return sync;
}

function collectMedia() {
  const groups = [];

  const add = (clip, images) => {
    if (!clip || !images.length) return;
    groups.push({ clip, images });
  };

  const hero = document.querySelector(".product-hero");
  const heroPhoto = hero ? hero.querySelector(".product-hero__photo") : null;
  if (hero && heroPhoto) add(hero, [heroPhoto]);

  document.querySelectorAll(".bleed__photo, .hall__photo, .feature__photo").forEach((image) => {
    let clip = image.parentElement;
    if (!clip.classList.contains("media-zoom")) {
      clip = document.createElement("div");
      clip.className = "media-zoom";
      image.parentElement.insertBefore(clip, image);
      clip.appendChild(image);
    }
    add(clip, [image]);
  });

  return groups;
}

function updateMedia(groups) {
  const view = window.innerHeight || 1;
  groups.forEach(({ clip, images }) => {
    const rect = clip.getBoundingClientRect();
    const docTop = rect.top + window.scrollY;
    const origin = Math.min(docTop, view);
    const raw = (origin - rect.top) / (view * 0.9);
    const progress = Math.min(1, Math.max(0, raw));
    const scale = 1.05 - 0.05 * easeOut(progress);
    const value = `scale(${scale.toFixed(4)})`;
    images.forEach((image) => {
      image.style.transform = value;
    });
  });
}

function updateVideo() {
  const frame = document.querySelector(".scene .media-frame");
  if (!frame) return;
  const locked = frame.classList.contains("is-expanded") || frame.dataset.animating === "1";
  if (locked) {
    frame.style.opacity = "1";
    frame.style.transform = "none";
    return;
  }

  const rect = frame.getBoundingClientRect();
  const view = window.innerHeight || 1;
  const start = view * 0.9;
  const end = view * 0.18;
  const raw = (start - rect.top) / (start - end);
  const t = Math.min(1, Math.max(0, raw));
  const progress = t * t * (3 - 2 * t);
  const scale = 0.84 + 0.16 * progress;
  const shift = (1 - progress) * 56;
  const opacity = Math.min(1, Math.max(0, (t - 0.06) / 0.5));
  frame.style.opacity = opacity.toFixed(3);
  frame.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
}

function startMotion() {
  markCards();
  if (reduceMotion) return;

  const syncReveals = watchReveals();
  const groups = collectMedia();
  const render = () => {
    updateMedia(groups);
    updateVideo();
    syncReveals();
    const clip = document.querySelector(".scene video");
    const source = clip && clip.dataset.src;
    if (clip && source && !clip.getAttribute("src") && clip.getBoundingClientRect().top < (window.innerHeight || 1) * 1.35) {
      clip.src = source;
      clip.play().catch(() => {});
    }
  };
  render();

  const lenis = new Lenis({
    lerp: 0.08,
    autoRaf: true,
    anchors: true,
    smoothWheel: true,
  });

  lenis.on("scroll", render);
  window.addEventListener("scroll", render, { passive: true });
  window.addEventListener("resize", render);

  const lock = new MutationObserver(() => {
    if (document.body.classList.contains("media-expanded")) lenis.stop();
    else lenis.start();
    render();
  });
  lock.observe(document.body, { attributes: true, attributeFilter: ["class"] });
}

const categories = document.querySelector(".site-nav__item--categories");
const categoriesLink = categories ? categories.querySelector(":scope > a") : null;
const categoriesMenu = categories ? categories.querySelector(".cat-menu") : null;
if (categories && categoriesLink && categoriesMenu) {
  const setCategoriesOpen = (open) => categoriesLink.setAttribute("aria-expanded", String(open));
  const staysOpen = (node) => node && (categoriesLink.contains(node) || categoriesMenu.contains(node));
  const openCategories = () => setCategoriesOpen(true);
  const closeCategories = (event) => {
    if (staysOpen(event.relatedTarget)) return;
    setCategoriesOpen(false);
  };
  categoriesLink.addEventListener("mouseenter", openCategories);
  categoriesLink.addEventListener("mouseleave", closeCategories);
  categoriesMenu.addEventListener("mouseenter", openCategories);
  categoriesMenu.addEventListener("mouseleave", closeCategories);
  categories.addEventListener("focusin", () => setCategoriesOpen(true));
  categories.addEventListener("focusout", (event) => {
    if (!categories.contains(event.relatedTarget)) setCategoriesOpen(false);
  });
}

if (document.documentElement.classList.contains("is-unlocked")) {
  startMotion();
} else {
  const gate = new MutationObserver(() => {
    if (!document.documentElement.classList.contains("is-unlocked")) return;
    gate.disconnect();
    startMotion();
  });
  gate.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
}
