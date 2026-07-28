// publications-pages.js

(() => {
  "use strict";

  const layer = document.querySelector("[data-page-atmosphere]");
  const particles = document.querySelector("[data-magic-particles]");
  const hint = document.querySelector("[data-page-hint]");

  if (!layer) return;

  const originals = Array.from(
    layer.querySelectorAll(".enchanted-page")
  );

  if (!originals.length) return;

  const extraPages = [
    {
      template: 0,
      x: 0.29,
      y: 0.26,
      speed: 29,
      angle: 1.86,
      size: 98,
      flap: 0.96,
      opacity: 0.72
    },
    {
      template: 1,
      x: 0.57,
      y: 0.36,
      speed: 31,
      angle: -1.12,
      size: 108,
      flap: 0.88,
      opacity: 0.74
    },
    {
      template: 2,
      x: 0.39,
      y: 0.68,
      speed: 27,
      angle: 0.62,
      size: 94,
      flap: 1.04,
      opacity: 0.7
    }
  ];

  extraPages.forEach((settings, index) => {
    const template = originals[settings.template % originals.length];
    const clone = template.cloneNode(true);

    clone.setAttribute(
      "aria-label",
      `Open manuscript butterfly ${originals.length + index + 1}`
    );

    clone.dataset.startX = settings.x;
    clone.dataset.startY = settings.y;
    clone.dataset.speed = settings.speed;
    clone.dataset.angle = settings.angle;

    clone.style.setProperty("--page-size", `${settings.size}px`);
    clone.style.setProperty("--flap-duration", `${settings.flap}s`);
    clone.style.setProperty("--page-opacity", settings.opacity);
    clone.style.setProperty("--fallback-left", `${settings.x * 100}%`);
    clone.style.setProperty("--fallback-top", `${settings.y * 100}%`);
    clone.style.setProperty("--fallback-duration", `${26 + index * 2}s`);
    clone.style.setProperty("--fallback-delay", `${-11 - index * 3}s`);

    layer.appendChild(clone);
  });

  const elements = Array.from(
    layer.querySelectorAll(".enchanted-page")
  );

  const finePointer = matchMedia("(pointer: fine)").matches;

  const reducedMotion = matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  document.body.classList.add("has-enchanted-pages");
  document.body.classList.add("pages-js-ready");

  const messages = [
  "Reviewer 2 has escaped the restricted section.",

  "The DOI is hiding beneath an invisibility cloak.",

  "Ten points to the control group for doing absolutely nothing.",

  "A minor revision hex has been detected. Chocolate may help.",

  "The manuscript departed from Platform 0.05 exactly on time.",

  "The citation owl is delayed because PubMed changed the address.",

  "Supplementary Figure 8 vanished during transfiguration.",

  "The methods section escaped before proofreading.",

  "The p value refuses to reveal its true form without three more replicates.",

  "Bone remodeling is in progress. Keep all wands outside the incubator.",

  "Your discussion section has been sorted into House Overinterpretation.",

  "The impact factor crystal ball remains suspiciously cloudy.",

  "Reviewer 1 requests clarification. Reviewer 2 requests a new PhD.",

  "The editor has summoned one final minor revision. It is not minor.",

  "Your manuscript has been accepted... in an alternative universe.",

  "The corresponding author has entered the Chamber of Corrections.",

  "The statistical significance spell failed. Increase the sample size.",

  "The osteoclasts have unionized and demand better culture conditions.",

  "The osteoblasts are building something. Nobody approved the protocol.",

  "The control group insists it was never informed about the experiment.",

  "Your references have multiplied overnight. Do not feed them after midnight.",

  "The manuscript is under review. Time now moves differently.",

  "A reviewer has requested an experiment already shown in Figure 3.",

  "The journal portal has forgotten your password again.",

  "The supplementary file exceeds the magical upload limit.",

  "Your confidence interval is wider than the forbidden forest.",

  "The western blot has chosen not to cooperate today.",

  "The microscope has detected movement. It may only be dust.",

  "Your cells are communicating. Unfortunately, they excluded the researcher.",

  "The incubator alarm knows when you are trying to leave early.",

  "The negative control has become suspiciously positive.",

  "The positive control has decided to explore alternative outcomes.",

  "The manuscript title has grown by another twelve words.",

  "The discussion section is now longer than the actual experiment.",

  "The editor says the decision is coming soon. Define soon.",

  "A wild reviewer comment appeared: Please cite our seventeen papers.",

  "The figure legend has become self-aware.",

  "Your error bars are attempting to leave the graph.",

  "The raw data knows what happened, but it refuses to testify.",

  "The replication spell requires three independent experiments.",

  "The sample size calculator has delivered unfortunate news.",

  "The protocol worked perfectly yesterday. Yesterday is gone.",

  "The cells sensed the deadline and stopped growing.",

  "The fluorescent signal appears only when nobody is watching.",

  "The manuscript survived peer review but lost part of its soul.",

  "The reviewer requests more clinical relevance from an in vitro experiment.",

  "The editor has classified your revision as minor. This is dark magic.",

  "The literature search has discovered another 247 relevant papers.",

  "The abstract contains exactly one word too many.",

  "The reference manager has duplicated every citation for ceremonial purposes.",

  "The journal system saved everything except the final submission.",

  "The corresponding author is currently trapped inside tracked changes.",

  "The research question was simple before the reviewers arrived.",

  "The results are significant, but the reviewer remains emotionally unconvinced.",

  "Your manuscript has entered the final review stage. Again.",

  "The cells have formed a functional model and now demand authorship.",

  "PTH exposure detected. Remodeling mischief is now active.",

  "The SHG signal has revealed collagen and several new problems.",

  "The osteoclasts resorbed the matrix and possibly the discussion section.",

  "The osteoblasts restored the matrix but refused to fix the references.",

  "The functional bone model has achieved more balance than the research team.",

  "Longitudinal imaging confirms that the deadline is approaching.",

  "The manuscript has been revised so many times it qualifies as tissue remodeling.",

  "Reviewer 2 has requested an additional control group for the control group.",

  "The editor appreciates your revision and has attached fourteen new comments.",

  "Your paper is currently somewhere between acceptance and character development."
];

  const pages = elements.map((element, index) => {
    const speed = Number(element.dataset.speed) || 32;
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

  const bounds = () => {
    const rect = layer.getBoundingClientRect();

    return {
      width: Math.max(rect.width, 1),
      height: Math.max(rect.height, 1),
      top: rect.top
    };
  };

  const initialize = () => {
    const area = bounds();

    pages.forEach((page) => {
      const width = page.element.offsetWidth;
      const height = page.element.offsetHeight;

      page.x = page.startX * Math.max(area.width - width, 1);
      page.y = page.startY * Math.max(area.height - height, 1);
    });

    initialized = true;
  };

  const sparkle = (x, y, count = 10, radius = 65) => {
    if (!particles) return;

    for (let i = 0; i < count; i += 1) {
      const item = document.createElement("span");
      const angle = Math.random() * Math.PI * 2;
      const distance = 14 + Math.random() * radius;
      const duration = 520 + Math.random() * 500;
      const size = 5 + Math.random() * 7;

      item.className = "magic-sparkle";
      item.style.setProperty("--sparkle-x", `${x}px`);
      item.style.setProperty("--sparkle-y", `${y}px`);
      item.style.setProperty("--sparkle-size", `${size}px`);

      item.style.setProperty(
        "--sparkle-dx",
        `${Math.cos(angle) * distance}px`
      );

      item.style.setProperty(
        "--sparkle-dy",
        `${Math.sin(angle) * distance - 18}px`
      );

      item.style.setProperty(
        "--sparkle-duration",
        `${duration}ms`
      );

      particles.appendChild(item);

      setTimeout(() => {
        item.remove();
      }, duration + 100);
    }
  };

  const typeMessage = (element, message) => {
    if (!element) return;

    element.textContent = "";
    let index = 0;

    const write = () => {
      element.textContent = message.slice(0, index + 1);
      index += 1;

      if (index < message.length) {
        setTimeout(write, 18);
      }
    };

    write();
  };

  const closeMessages = () => {
    pages.forEach((page) => {
      page.element.classList.remove("is-open");
    });
  };

  const openMessage = (page) => {
    const rect = page.element.getBoundingClientRect();

    const text = page.element.querySelector(
      ".enchanted-message-text"
    );

    const message =
      messages[Math.floor(Math.random() * messages.length)];

    closeMessages();
    typeMessage(text, message);
    page.element.classList.add("is-open");

    if (hint) {
      hint.classList.add("is-hidden");
    }

    sparkle(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      22,
      105
    );

    clearTimeout(messageTimer);

    messageTimer = setTimeout(() => {
      page.element.classList.remove("is-open");
    }, 3400);
  };

  pages.forEach((page) => {
    page.element.addEventListener("click", (event) => {
      event.stopPropagation();
      openMessage(page);
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".enchanted-page")) {
      closeMessages();
    }
  });

  if (finePointer) {
    addEventListener(
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

  const animate = (timeNow) => {
    if (!initialized) {
      initialize();
    }

    const area = bounds();

    const dt = Math.min(
      (timeNow - previousTime) / 1000,
      0.035
    );

    const time = timeNow / 1000;

    previousTime = timeNow;

    pages.forEach((page) => {
      const element = page.element;
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      const open = element.classList.contains("is-open");

      const movement = reducedMotion ? 0.34 : 0.78;

      if (!open) {
        page.x += page.vx * dt * movement;
        page.y += page.vy * dt * movement;
      }

      const maxX = Math.max(
        area.width - width - 10,
        10
      );

      const maxY = Math.max(
        area.height - height - 10,
        10
      );

      if (page.x <= 10) {
        page.x = 10;
        page.vx = Math.abs(page.vx);
      }

      if (page.x >= maxX) {
        page.x = maxX;
        page.vx = -Math.abs(page.vx);
      }

      if (page.y <= 10) {
        page.y = 10;
        page.vy = Math.abs(page.vy);
      }

      if (page.y >= maxY) {
        page.y = maxY;
        page.vy = -Math.abs(page.vy);
      }

      const centerX = page.x + width / 2;

      const centerY =
        area.top + page.y + height / 2;

      let targetX = 0;
      let targetY = 0;
      let alert = false;

      if (pointer.active && finePointer && !open) {
        const dx = centerX - pointer.x;
        const dy = centerY - pointer.y;
        const distance = Math.hypot(dx, dy) || 1;

        const radius = 135;

        if (distance < radius) {
          const raw = 1 - distance / radius;

          const force =
            raw * raw * raw;

          targetX =
            (dx / distance) * force * 28;

          targetY =
            (dy / distance) * force * 20;

          alert = true;

          if (
            timeNow - page.lastSparkle > 260 &&
            force > 0.42
          ) {
            sparkle(centerX, centerY, 1, 22);
            page.lastSparkle = timeNow;
          }
        }
      }

      page.escapeX +=
        (targetX - page.escapeX) * 0.035;

      page.escapeY +=
        (targetY - page.escapeY) * 0.035;

      const bob =
        Math.sin(time * 3.1 + page.phase) * 4;

      const tilt =
        Math.sin(time * 2 + page.phase) * 4;

      const angle =
        Math.atan2(page.vy, page.vx) *
        (180 / Math.PI);

      const rotation =
        Math.max(-13, Math.min(13, angle * 0.15));

      element.classList.toggle("is-alert", alert);

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
        `${rotation}deg`
      );

      element.style.setProperty(
        "--page-direction",
        page.vx >= 0 ? "1" : "-1"
      );

      if (
        !open &&
        !reducedMotion &&
        timeNow - page.lastSparkle >
          1550 + page.phase * 100
      ) {
        sparkle(
          centerX -
            Math.sign(page.vx || 1) *
            width *
            0.25,
          centerY,
          1,
          14
        );

        page.lastSparkle = timeNow;
      }
    });

    requestAnimationFrame(animate);
  };

  addEventListener(
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
    const observer = new IntersectionObserver(
      (entries, sectionObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            sectionObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    sections.forEach((section) => {
      observer.observe(section);
    });
  }

  requestAnimationFrame(animate);
})();
