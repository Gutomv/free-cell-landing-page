const COMPANY = {
  name: "Free Cell",
  siteUrl: "https://freecellmaringa.com.br/",
  phoneDisplay: "(44) 9 9869-9747",
  phoneInternational: "554498699747",
  address: "Av. João Paulino Vieira Filho, 472 – Zona 07 – Maringá/PR",
  hoursHtml: "Segunda a sexta: 09h às 18h<br>Sábado: 09h às 13h",
  hoursText: "Segunda a sexta: 09h às 18h. Sábado: 09h às 13h.",
  whatsappMessage: "Olá! Encontrei a Free Cell pelo site e gostaria de solicitar um orçamento para o meu aparelho.",
  instagramUrl: "https://www.instagram.com/freecellmaringa",
  googleProfileUrl: "",
  heroImage: "assets/images/fachada-free-cell.webp.jpg",
  technicianImage: "assets/images/tecnico-free-cell.webp.webp"
};

const encode = encodeURIComponent;

function whatsappUrl(message = COMPANY.whatsappMessage) {
  return `https://wa.me/${COMPANY.phoneInternational}?text=${encode(message)}`;
}

function setText(selector, value) {
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = value;
  });
}

function setHtml(selector, value) {
  document.querySelectorAll(selector).forEach((element) => {
    element.innerHTML = value;
  });
}

function activateOptionalLink(id, url) {
  const element = document.getElementById(id);

  if (!element || !url) return;

  element.href = url;
  element.hidden = false;
}

function trackEvent(eventName, parameters = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...parameters
  });

  if (typeof window.fbq === "function") {
    window.fbq("trackCustom", eventName, parameters);
  }
}

function setupCompanyData() {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encode(COMPANY.address)}`;
  const mapUrl = `https://www.google.com/maps?q=${encode(COMPANY.address)}&output=embed`;

  setText('[data-company="phone"]', COMPANY.phoneDisplay);
  setText('[data-company="address"]', COMPANY.address);
  setHtml('[data-company="hours"]', COMPANY.hoursHtml);

  document.querySelectorAll(".whatsapp-link").forEach((link) => {
    link.href = whatsappUrl();
  });

  document.querySelectorAll(".whatsapp-service").forEach((link) => {
    const service = link.dataset.service || "o meu aparelho";
    const message = `Olá! Encontrei a Free Cell pelo site e gostaria de solicitar uma avaliação para ${service}.`;
    link.href = whatsappUrl(message);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.dataset.track = "whatsapp_service";
    link.dataset.serviceName = service;
  });

  document.getElementById("directions-button")?.setAttribute("href", directionsUrl);
  document.getElementById("mobile-directions-button")?.setAttribute("href", directionsUrl);
  document.getElementById("company-map")?.setAttribute("src", mapUrl);

  const year = document.getElementById("current-year");
  if (year) year.textContent = new Date().getFullYear();

  activateOptionalLink("instagram-link", COMPANY.instagramUrl);
  activateOptionalLink("instagram-link-main", COMPANY.instagramUrl);
  activateOptionalLink("google-profile-link", COMPANY.googleProfileUrl);
}

function setupTracking() {
  document.querySelectorAll("[data-track]").forEach((element) => {
    element.addEventListener("click", () => {
      trackEvent(element.dataset.track, {
        service: element.dataset.serviceName || undefined,
        page_location: window.location.href
      });
    });
  });

  const contactSection = document.getElementById("contato");
  if (!contactSection || !("IntersectionObserver" in window)) return;

  let contactTracked = false;
  const observer = new IntersectionObserver(
    (entries) => {
      if (contactTracked || !entries.some((entry) => entry.isIntersecting)) return;

      contactTracked = true;
      trackEvent("contact_section_view");
      observer.disconnect();
    },
    { threshold: 0.35 }
  );

  observer.observe(contactSection);
}

function setupMenu() {
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.getElementById("main-nav");

  if (!menuButton || !navigation) return;

  function closeMenu() {
    navigation.classList.remove("open");
    document.body.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menu");
  }

  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("open");
    document.body.classList.toggle("menu-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMenu();
  });
}

function setupGallery() {
  const button = document.getElementById("gallery-more");
  const extraItems = [...document.querySelectorAll(".gallery-extra")];

  if (!button || extraItems.length === 0) return;

  button.addEventListener("click", () => {
    const shouldShow = button.getAttribute("aria-expanded") !== "true";

    extraItems.forEach((item) => {
      item.hidden = !shouldShow;
    });

    button.setAttribute("aria-expanded", String(shouldShow));
    button.textContent = shouldShow ? "Ver menos fotos" : "Ver mais fotos";
  });
}

function setupPrivacyDialog() {
  const privacyDialog = document.getElementById("privacy-dialog");
  const privacyButton = document.getElementById("privacy-button");
  const privacyClose = privacyDialog?.querySelector(".dialog-close");

  if (!privacyDialog || !privacyButton || !privacyClose) return;

  privacyButton.addEventListener("click", () => {
    if (typeof privacyDialog.showModal === "function") {
      privacyDialog.showModal();
    } else {
      privacyDialog.setAttribute("open", "");
    }
  });

  privacyClose.addEventListener("click", () => privacyDialog.close());

  privacyDialog.addEventListener("click", (event) => {
    const bounds = privacyDialog.getBoundingClientRect();
    const isOutside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (isOutside) privacyDialog.close();
  });
}

function setupStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: COMPANY.name,
    url: COMPANY.siteUrl,
    description: "Assistência técnica especializada em celulares, tablets, iPads e smartwatches em Maringá.",
    telephone: `+${COMPANY.phoneInternational}`,
    image: [
      `${COMPANY.siteUrl}${COMPANY.heroImage}`,
      `${COMPANY.siteUrl}${COMPANY.technicianImage}`
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Av. João Paulino Vieira Filho, 472",
      addressLocality: "Maringá",
      addressRegion: "PR",
      addressCountry: "BR"
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "13:00"
      }
    ],
    areaServed: {
      "@type": "City",
      name: "Maringá"
    },
    sameAs: COMPANY.instagramUrl ? [COMPANY.instagramUrl] : undefined,
    knowsAbout: [
      "Assistência técnica de celulares",
      "Troca de tela",
      "Troca de bateria",
      "Reparo de conector de carga",
      "Microssoldagem",
      "Manutenção de tablets",
      "Manutenção de smartwatches"
    ]
  };

  const schemaElement = document.createElement("script");
  schemaElement.type = "application/ld+json";
  schemaElement.textContent = JSON.stringify(structuredData);
  document.head.appendChild(schemaElement);
}

document.addEventListener("DOMContentLoaded", () => {
  setupCompanyData();
  setupTracking();
  setupMenu();
  setupGallery();
  setupPrivacyDialog();
  setupStructuredData();
});
