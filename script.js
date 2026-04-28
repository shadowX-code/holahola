const header = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const navLinks = [...document.querySelectorAll(".nav-menu > a[href^='#']:not(.order-btn)")];
const sections = [...document.querySelectorAll("main section[id], footer[id]")];

function updateHeader() {
  header.classList.toggle("scrolled", window.scrollY > 10);
}

function closeMenu() {
  menuToggle.classList.remove("open");
  navMenu.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}

menuToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("open");
  menuToggle.classList.toggle("open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navMenu.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    closeMenu();
  }
});

document.querySelectorAll("a[data-file-href]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (window.location.protocol !== "file:") return;
    event.preventDefault();
    window.location.href = link.dataset.fileHref;
  });
});

document.querySelectorAll(".nav-social[href='#']").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
  });
});

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-42% 0px -54% 0px", threshold: 0 }
);

sections.forEach((section) => sectionObserver.observe(section));

const categoryItems = [...document.querySelectorAll(".category-item")];
const categoryNumberButtons = [...document.querySelectorAll(".category-numbers button[data-category]")];
const posterPanels = [...document.querySelectorAll(".menu-poster-panel")];

function closePosterPanels() {
  posterPanels.forEach((panel) => {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
  });

  categoryItems.forEach((item) => {
    item.classList.remove("active");
    item.setAttribute("aria-expanded", "false");
  });

  categoryNumberButtons.forEach((button) => {
    button.classList.remove("active");
    button.setAttribute("aria-selected", "false");
  });
}

function getHeaderOffset() {
  const headerHeight = header ? header.getBoundingClientRect().height : 0;
  return headerHeight + (window.innerWidth <= 640 ? 10 : 14);
}

function scrollPosterPanelToTop(panel, behavior = "smooth") {
  const top = panel.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
  window.scrollTo({
    top: Math.max(0, top),
    behavior,
  });
}

function openCategoryPoster(categoryKey) {
  const item = categoryItems.find((candidate) => candidate.dataset.category === categoryKey);
  const panel = posterPanels.find((candidate) => candidate.dataset.panelFor === categoryKey);
  if (!item || !panel) return;

  const wasOpen = panel.classList.contains("open");
  closePosterPanels();

  if (wasOpen) return;

  const posterImage = panel.querySelector(".menu-poster-image-wrap img");
  const posterPath = item.dataset.poster;
  const fallbackPath = item.dataset.fallback;

  if (posterImage && posterPath) {
    posterImage.dataset.fallback = fallbackPath || posterImage.src;
    posterImage.dataset.usedFallback = "false";
    posterImage.src = posterPath;
    posterImage.alt = `${item.dataset.title || "Menu"} poster`;
    posterImage.onerror = () => {
      if (posterImage.dataset.usedFallback === "true" || !posterImage.dataset.fallback) return;
      posterImage.dataset.usedFallback = "true";
      posterImage.src = posterImage.dataset.fallback;
    };
  }

  item.classList.add("active");
  item.setAttribute("aria-expanded", "true");

  const numberButton = categoryNumberButtons.find((button) => button.dataset.category === categoryKey);
  if (numberButton) {
    numberButton.classList.add("active");
    numberButton.setAttribute("aria-selected", "true");
  }

  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");

  window.setTimeout(() => {
    scrollPosterPanelToTop(panel);
  }, 50);

  window.setTimeout(() => {
    if (panel.classList.contains("open")) {
      scrollPosterPanelToTop(panel);
    }
  }, 430);
}

categoryItems.forEach((item) => {
  item.addEventListener("click", () => openCategoryPoster(item.dataset.category));
  item.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openCategoryPoster(item.dataset.category);
    }
  });
});

categoryNumberButtons.forEach((button) => {
  button.addEventListener("click", () => openCategoryPoster(button.dataset.category));
});

const promoModal = document.getElementById("promoModal");
const promoModalImage = document.getElementById("promoModalImage");
const promoModalTriggers = [...document.querySelectorAll(".promo-modal-trigger")];

function closePromoModal() {
  if (!promoModal) return;
  promoModal.classList.remove("open");
  promoModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function openPromoModal(trigger) {
  if (!promoModal || !promoModalImage) return;
  const fallbackPoster = trigger.dataset.promoFallback || trigger.dataset.promoPoster || promoModalImage.src;
  promoModalImage.dataset.fallback = fallbackPoster;
  promoModalImage.dataset.usedFallback = "false";
  promoModalImage.onerror = () => {
    if (promoModalImage.dataset.usedFallback === "true" || !promoModalImage.dataset.fallback) return;
    promoModalImage.dataset.usedFallback = "true";
    promoModalImage.src = promoModalImage.dataset.fallback;
  };
  promoModalImage.src = trigger.dataset.promoPoster || fallbackPoster;
  promoModalImage.alt = trigger.dataset.promoAlt || "Promotion poster";
  promoModal.classList.add("open");
  promoModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

promoModalTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => openPromoModal(trigger));
});

document.querySelectorAll("[data-modal-close]").forEach((button) => {
  button.addEventListener("click", closePromoModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closePromoModal();
});

document.querySelectorAll(".back-to-top").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
