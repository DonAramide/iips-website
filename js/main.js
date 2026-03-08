// Main site script for IIPS website
(function () {
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  const navLinks = document.querySelectorAll(".nav-link");
  const scrollButtons = document.querySelectorAll("[data-scroll-target]");
  const themeToggle = document.querySelector(".theme-toggle");

  function closeNav() {
    if (!navToggle || !nav) return;
    navToggle.classList.remove("is-open");
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  function openNav() {
    if (!navToggle || !nav) return;
    navToggle.classList.add("is-open");
    nav.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.contains("is-open");
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
          closeNav();
        }
      });
    });
  }

  function handleScrollHeader() {
    if (!header) return;
    const scrolled = window.scrollY > 10;
    header.classList.toggle("is-scrolled", scrolled);
  }

  window.addEventListener("scroll", handleScrollHeader);
  handleScrollHeader();

  function smoothScrollTo(targetSelector) {
    const target = document.querySelector(targetSelector);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (href.startsWith("#")) {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        smoothScrollTo(href);
      });
    }
  });

  scrollButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      const targetSelector = btn.getAttribute("data-scroll-target");
      if (targetSelector) {
        smoothScrollTo(targetSelector);
      }
    });
  });

  const THEME_STORAGE_KEY = "iips-theme";

  function applyTheme(theme) {
    document.body.setAttribute("data-theme", theme);
  }

  function getPreferredTheme() {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  }

  function toggleTheme() {
    const current = document.body.getAttribute("data-theme") || getPreferredTheme();
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  }

  if (themeToggle) {
    applyTheme(getPreferredTheme());
    themeToggle.addEventListener("click", toggleTheme);
  } else {
    applyTheme(getPreferredTheme());
  }

  window.addEventListener("load", () => {
    const loader = document.getElementById("page-loader");
    if (!loader) return;
    loader.classList.add("is-hidden");
    setTimeout(() => {
      if (loader && loader.parentElement) {
        loader.parentElement.removeChild(loader);
      }
    }, 600);
  });

  function initScrollReveal() {
    const revealEls = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || revealEls.length === 0) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
      }
    );

    revealEls.forEach((el) => observer.observe(el));
  }

  function initCounters() {
    const counters = document.querySelectorAll(".counter[data-counter]");
    if (counters.length === 0) return;

    function animateCounter(el) {
      const target = parseInt(el.getAttribute("data-counter") || "0", 10);
      if (!Number.isFinite(target)) return;

      let start = 0;
      const duration = 1200;
      const startTime = performance.now();

      function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const value = Math.floor(start + (target - start) * progress);
        el.textContent = value.toString();
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = target.toString();
        }
      }

      window.requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCounter);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            animateCounter(el);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach((el) => observer.observe(el));
  }

  function initTestimonialSlider() {
    const track = document.querySelector(".testimonial-track");
    const dots = document.querySelectorAll(".testimonial-dots .dot");
    if (!track || dots.length === 0) return;

    const slides = Array.from(track.children);
    if (slides.length === 0) return;

    let index = 0;
    const total = slides.length;

    function goToSlide(i) {
      index = (i + total) % total;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot, idx) => {
        dot.classList.toggle("is-active", idx === index);
      });
    }

    let timer = window.setInterval(() => goToSlide(index + 1), 7000);

    dots.forEach((dot, idx) => {
      dot.addEventListener("click", () => {
        goToSlide(idx);
        window.clearInterval(timer);
        timer = window.setInterval(() => goToSlide(index + 1), 7000);
      });
    });
  }

  function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    const nameInput = form.querySelector("#name");
    const emailInput = form.querySelector("#email");
    const phoneInput = form.querySelector("#phone");
    const messageInput = form.querySelector("#message");

    function setError(input, message) {
      if (!input) return;
      const wrapper = input.closest(".form-field");
      const errorEl = wrapper ? wrapper.querySelector(".error-message") : null;
      if (errorEl) {
        errorEl.textContent = message || "";
      }
      input.classList.toggle("is-invalid", Boolean(message));
    }

    function clearErrors() {
      [nameInput, emailInput, phoneInput, messageInput].forEach((field) => {
        if (!field) return;
        setError(field, "");
      });
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearErrors();

      let hasError = false;
      const name = nameInput ? nameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim() : "";
      const phone = phoneInput ? phoneInput.value.trim() : "";
      const message = messageInput ? messageInput.value.trim() : "";

      if (!name || name.length < 2) {
        setError(nameInput, "Please enter your full name.");
        hasError = true;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        setError(emailInput, "Please enter a valid email address.");
        hasError = true;
      }

      if (phone) {
        const digitsOnly = phone.replace(/[\s()+-]/g, "");
        if (!/^\d{7,15}$/.test(digitsOnly)) {
          setError(phoneInput, "Please enter a valid phone number (digits only).");
          hasError = true;
        }
      }

      if (!message || message.length < 10) {
        setError(messageInput, "Please provide a short summary of your enquiry.");
        hasError = true;
      }

      if (hasError) {
        return;
      }

      form.reset();
      alert("Thank you for contacting IIPS. Your message has been captured for review.");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initScrollReveal();
    initCounters();
    initTestimonialSlider();
    initContactForm();
  });
})();

