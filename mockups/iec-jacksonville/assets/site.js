/* IEC Jacksonville — pitch mockup.
   Two behaviours only: the mobile nav drawer and the FAQ accordion. */
(function () {
  "use strict";

  /* ---- Mobile nav ------------------------------------------------------ */
  function initMobileNav() {
    // Two triggers open/close the same drawer: the header hamburger and the
    // Close button inside the drawer itself. Both must stay in sync.
    var toggles = document.querySelectorAll("[data-nav-toggle]");
    var panel = document.getElementById("mobile-nav");
    if (!toggles.length || !panel) return;

    function setOpen(open) {
      panel.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-locked", open);
      Array.prototype.forEach.call(toggles, function (t) {
        t.setAttribute("aria-expanded", open ? "true" : "false");
        var iconOpen = t.querySelector("[data-icon-open]");
        var iconClose = t.querySelector("[data-icon-close]");
        if (iconOpen) iconOpen.hidden = open;
        if (iconClose) iconClose.hidden = !open;
      });
    }

    Array.prototype.forEach.call(toggles, function (t) {
      t.addEventListener("click", function () {
        setOpen(!panel.classList.contains("is-open"));
      });
    });

    // Any nav link closes the drawer — in-page anchors would otherwise leave
    // it covering the section the reader just jumped to.
    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("is-open")) {
        setOpen(false);
        toggles[0].focus();
      }
    });

    // Coming back to desktop width with the drawer open would otherwise leave
    // the body scroll-locked behind a hidden panel.
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1024 && panel.classList.contains("is-open")) setOpen(false);
    });

    setOpen(false); // normalise both triggers' initial ARIA state
  }

  /* ---- Accordion ------------------------------------------------------- */
  function initAccordions() {
    var triggers = document.querySelectorAll(".acc-trigger");
    Array.prototype.forEach.call(triggers, function (trigger) {
      var panel = document.getElementById(trigger.getAttribute("aria-controls"));
      if (!panel) return;

      trigger.addEventListener("click", function () {
        var open = trigger.getAttribute("aria-expanded") === "true";
        trigger.setAttribute("aria-expanded", open ? "false" : "true");
        panel.classList.toggle("is-open", !open);
      });
    });
  }

  function init() {
    initMobileNav();
    initAccordions();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
