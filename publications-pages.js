(() => {
  "use strict";

  const layer = document.querySelector("[data-page-atmosphere]");
  const particleLayer = document.querySelector("[data-magic-particles]");
  const pageHint = document.querySelector("[data-page-hint]");

  if (!layer) {
    return;
  }

  const pageElements = Array.from(
    layer.querySelectorAll(".enchanted-page")
  );

  if (!pageElements.length) {
    return;
  }

  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  document.body.classList.add("has-enchanted-pages");
  document.body.classList.add("pages-js-ready");

  const funnyMessages = [
    "Reviewer 2 has escaped the restricted section.",
    "The DOI is hiding beneath an invisibility cloak.",
    "Ten points to the control group for doing absolutely nothing.",
    "A minor revision hex has been detected. Chocolate may help.",
    "The manuscript departed from Platform 0.05 exactly on time.",
    "The citation owl is delayed because PubMed changed the address.",
    "Supplementary Figure 8 vanished during transfiguration.",
    "The methods section escaped before proofreading.",
    "The p value refuses to reveal its true form without three more replicates.",
    "Bone remodeling is in progress. Please keep all wands outside the incubator.",
    "Your discussion section has been sorted into House Overinterpretation.",
    "The impact factor crystal ball remains suspiciously cloudy."
  ];

  const pages = pageElements.map((element, index) => {
    const speed = Number(element.dataset.speed) || 38;
    const angle = Number(element.dataset.angle) || 0;

    return {
      element,
      x: 0,
      y: 0,
      startX: Number(element.dataset.startX) || 0,
      startY: Number(element.dataset.startY) || 0,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      escapeX: 0,
      escapeY: 0,
      phase: index * 0.92,
      lastSparkle: 0
    };
  });

  const pointer = {
    x: 0,
    y: 0,
    active: false
  };

  let initialized = false;
  let previousTime = performance.now();
  let messageTimer = 0;

  const getLayerBounds = () => {
    const rect = layer.getBoundingClientRect();

    return {
      width: Math.max(rect.width, 1),
      height: Math.max(rect.height, 1),
      top: rect.top
    };
  };

  const initializePagePositions = () => {
    const bounds = getLayerBounds();

    pages.forEach((page) => {
      const width = page.element.offsetWidth;
      const height = page.element.offsetHeight;

      page.x = page.startX * Math.max(bounds.width - width, 1);
      page.y = page.startY * Math.max(bounds.height - height, 1);
    });

    initialized = true;
  };

  const releaseSparkles = (
    x,
    y,
    count = 12,
    radius = 72
  ) => {
    if (!particleLayer) {
      return;
    }

    for (let index = 0; index < count; index += 1) {
      const sparkle = document.createElement("span");
      const angle = Math.random() * Math.PI * 2;
      const distance = 16 + Math.random() * radius;
      const duration = 520 + Math.random() * 520;
      const size = 5 + Math.random() * 7;

      sparkle.className = "magic-sparkle";
      sparkle.style.setProperty("--sparkle-x", `${x}px`);
      sparkle.style.setProperty("--sparkle-y", `${y}px`);
      sparkle.style.setProperty("--sparkle-size", `${size}px`);
      sparkle.style.setProperty(
        "--sparkle-dx",
        `${Math.cos(angle) * distance}px`
      );
      sparkle.style.setProperty(
        "--sparkle-dy",
        `${Math.sin(angle) * distance - 18}px`
      );
      sparkle.style.setProperty(
        "--sparkle-duration",
        `${duration}ms`
      );

      particleLayer.appendChild(sparkle);

      window.setTimeout(() => {
        sparkle.remove();
      }, duration + 100);
    }
  };

  const typeMessage = (element, message) => {
    if (!element) {
      return;
    }

    element.textContent = "";
    let characterIndex = 0;

    const writeNextCharacter = () => {
      element.textContent = message.slice(0, characterIndex + 1);
      characterIndex += 1;

      if (characterIndex < message.length) {
        window.setTimeout(writeNextCharacter, 18);
      }
    };

    writeNextCharacter();
  };

  const closeAllMessages = () => {
    pages.forEach((page) => {
      page.element.classList.remove("is-open");
    });
  };

  const openPageMessage = (page) => {
    const rect = page.element.getBoundingClientRect();
    const text = page.element.querySelector(
      ".enchanted-message-text"
    );

    const message =
      funnyMessages[
        Math.floor(Math.random() * funnyMessages.length)
      ];

    typeMessage(text, message);
    closeAllMessages();
    page.element.classList.add("is-open");

    if (pageHint) {
      pageHint.classList.add("is-hidden");
    }

    releaseSparkles(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      24,
      110
    );

    window.clearTimeout(messageTimer);

    messageTimer = window.setTimeout(() => {
      page.element.classList.remove("is-open");
    }, 3400);
  };

  pages.forEach((page) => {
    page.element.addEventListener("click", (event) => {
      event.stopPropagation();
      openPageMessage(page);
    });

    page.element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPageMessage(page);
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".enchanted-page")) {
      closeAllMessages();
    }
  });

  if (hasFinePointer) {
    window.addEventListener(
      "pointermove",
      (event) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
      },
      { passive: true }
    );

    document.documentElement.addEventListener(
      "mouseleave",
      () => {
        pointer.active = false;
      },
      { passive: true }
    );
  }

  const animate = (currentTime) => {
    if (!initialized) {
      initializePagePositions();
    }

    const bounds = getLayerBounds();

    const deltaTime = Math.min(
      (currentTime - previousTime) / 1000,
      0.035
    );

    const time = currentTime / 1000;
    previousTime = currentTime;

    pages.forEach((page) => {
      const element = page.element;
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      const isOpen = element.classList.contains("is-open");
      const motionScale = prefersReducedMotion ? 0.42 : 1;

      if (!isOpen) {
        page.x += page.vx * deltaTime * motionScale;
        page.y += page.vy * deltaTime * motionScale;
      }

      const minX = 10;
      const minY = 10;
      const maxX = Math.max(
        bounds.width - width - 10,
        minX
      );
      const maxY = Math.max(
        bounds.height - height - 10,
        minY
      );

      if (page.x <= minX) {
        page.x = minX;
        page.vx = Math.abs(page.vx);
      }

      if (page.x >= maxX) {
        page.x = maxX;
        page.vx = -Math.abs(page.vx);
      }

      if (page.y <= minY) {
        page.y = minY;
        page.vy = Math.abs(page.vy);
      }

      if (page.y >= maxY) {
        page.y = maxY;
        page.vy = -Math.abs(page.vy);
      }

      const viewportCenterX = page.x + width / 2;

      const viewportCenterY =
        bounds.top + page.y + height / 2;

      let targetEscapeX = 0;
      let targetEscapeY = 0;
      let isAlert = false;

      if (
        pointer.active &&
        hasFinePointer &&
        !isOpen
      ) {
        const deltaX = viewportCenterX - pointer.x;
        const deltaY = viewportCenterY - pointer.y;
        const distance = Math.hypot(deltaX, deltaY) || 1;
        const reactionRadius = 220;

        if (distance < reactionRadius) {
          const force = 1 - distance / reactionRadius;

          targetEscapeX =
            (deltaX / distance) * force * 170;

          targetEscapeY =
            (deltaY / distance) * force * 125;

          isAlert = true;

          if (
            currentTime - page.lastSparkle > 105 &&
            force > 0.22
          ) {
            releaseSparkles(
              viewportCenterX,
              viewportCenterY,
              2,
              34
            );

            page.lastSparkle = currentTime;
          }
        }
      }

      page.escapeX +=
        (targetEscapeX - page.escapeX) * 0.18;

      page.escapeY +=
        (targetEscapeY - page.escapeY) * 0.18;

      const bob =
        Math.sin(time * 3.45 + page.phase) * 5;

      const tilt =
        Math.sin(time * 2.2 + page.phase) * 5;

      const flightAngle =
        Math.atan2(page.vy, page.vx) *
        (180 / Math.PI);

      const visualAngle = Math.max(
        -16,
        Math.min(16, flightAngle * 0.18)
      );

      element.classList.toggle("is-alert", isAlert);

      element.style.setProperty(
        "--flight-x",
        `${page.x}px`
      );

      element.style.setProperty(
        "--flight-y",
        `${page.y}px`
      );

      element.style.setProperty(
        "--escape-x",
        `${page.escapeX}px`
      );

      element.style.setProperty(
        "--escape-y",
        `${page.escapeY}px`
      );

      element.style.setProperty(
        "--body-bob",
        `${bob}px`
      );

      element.style.setProperty(
        "--body-tilt",
        `${tilt}deg`
      );

      element.style.setProperty(
        "--flight-rotation",
        `${visualAngle}deg`
      );

      element.style.setProperty(
        "--page-direction",
        page.vx >= 0 ? "1" : "-1"
      );

      if (
        !isOpen &&
        !prefersReducedMotion &&
        currentTime - page.lastSparkle >
          1300 + page.phase * 90
      ) {
        releaseSparkles(
          viewportCenterX - Math.sign(page.vx || 1) * width * 0.28,
          viewportCenterY,
          1,
          16
        );

        page.lastSparkle = currentTime;
      }
    });

    window.requestAnimationFrame(animate);
  };

  window.addEventListener(
    "resize",
    () => {
      initialized = false;
    },
    { passive: true }
  );

  const sections = document.querySelectorAll(
    ".publication-section"
  );

  if (!("IntersectionObserver" in window)) {
    sections.forEach((section) => {
      section.classList.add("is-visible");
    });
  } else {
    const sectionObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }

  window.requestAnimationFrame(animate);
})();
