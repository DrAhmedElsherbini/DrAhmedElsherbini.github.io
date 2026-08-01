/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

const menuButton = document.querySelector(".menu-button");
const siteNav = document.querySelector(".site-nav");

if (menuButton && siteNav) {
  const closeNavigation = () => {
    siteNav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.textContent = "☰";
  };

  menuButton.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");

    menuButton.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    menuButton.textContent = isOpen ? "×" : "☰";
  });

  document.addEventListener("click", event => {
    const clickedInsideNavigation =
      siteNav.contains(event.target);

    const clickedMenuButton =
      menuButton.contains(event.target);

    if (
      !clickedInsideNavigation &&
      !clickedMenuButton
    ) {
      closeNavigation();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeNavigation();
    }
  });

  siteNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", closeNavigation);
  });
}


/* =========================================================
   AUTOMATIC COPYRIGHT YEAR
   ========================================================= */

document
  .querySelectorAll("[data-year]")
  .forEach(element => {
    element.textContent =
      new Date().getFullYear();
  });


/* =========================================================
   GLOBAL SECTION REVEAL
   ========================================================= */

(() => {
  const main = document.querySelector("main");

  if (!main) {
    return;
  }

  const prefersReducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

  /*
    These are introductory hero sections.

    They remain visible immediately and are not hidden
    while the page is loading.
  */

  const heroSelector = [
    ".hero",
    ".page-hero",
    ".research-hero",
    ".publications-hero",
    ".gallery-hero"
  ].join(", ");


  /*
    Collect normal top-level page sections.
  */

  const mainSections = [
    ...main.querySelectorAll(":scope > section")
  ].filter(section => {
    if (section.matches(heroSelector)) {
      return false;
    }

    if (section.hasAttribute("data-no-reveal")) {
      return false;
    }

    /*
      The Publications page contains several smaller
      .publication-section elements inside one outer section.

      The outer section is skipped so its internal publication
      sections can reveal independently.
    */

    if (section.querySelector(".publication-section")) {
      return false;
    }

    return true;
  });


  /*
    Preserve the individual reveal behavior used on the
    Publications page.

    Elements with data-reveal can also be manually included.
  */

  const individualSections = [
    ...main.querySelectorAll(
      ".publication-section, [data-reveal]"
    )
  ].filter(section => {
    return !section.hasAttribute("data-no-reveal");
  });


  /*
    Remove duplicate elements in case an element matches
    more than one selector.
  */

  const revealSections = [
    ...new Set([
      ...mainSections,
      ...individualSections
    ])
  ];


  if (revealSections.length === 0) {
    return;
  }


  /*
    Add the initial hidden animation state.
  */

  revealSections.forEach(section => {
    section.classList.add("reveal-section");
  });


  /*
    Immediately show everything when reduced motion is
    requested or IntersectionObserver is unavailable.
  */

  if (
    prefersReducedMotion ||
    !("IntersectionObserver" in window)
  ) {
    revealSections.forEach(section => {
      section.classList.add("is-visible");
    });

    return;
  }


  /*
    Reveal each section once it enters the viewport.
  */

  const sectionObserver =
    new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");

          /*
            Stop watching after the first reveal.
            The section will not disappear again.
          */

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -8% 0px"
      }
    );


  revealSections.forEach(section => {
    sectionObserver.observe(section);
  });
})();
