(() => {
  "use strict";

  const layer = document.querySelector("[data-page-atmosphere]");
  const particles = document.querySelector("[data-magic-particles]");
  const hint = document.querySelector("[data-page-hint]");

  if (!layer) return;

  const originalPages = Array.from(
    layer.querySelectorAll(".enchanted-page")
  );

  if (!originalPages.length) return;

  /*
   * Add three extra manuscript butterflies.
   * This produces ten in total when the HTML contains seven.
   */
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
    const source = originalPages[
      settings.template % originalPages.length
    ];

    const clone = source.cloneNode(true);

    clone.setAttribute(
      "aria-label",
      `Open manuscript butterfly ${originalPages.length + index + 1}`
    );

    clone.dataset.startX = String(settings.x);
    clone.dataset.startY = String(settings.y);
    clone.dataset.speed = String(settings.speed);
    clone.dataset.angle = String(settings.angle);

    clone.style.setProperty(
      "--page-size",
      `${settings.size}px`
    );

    clone.style.setProperty(
      "--flap-duration",
      `${settings.flap}s`
    );

    clone.style.setProperty(
      "--page-opacity",
      settings.opacity
    );

    clone.style.setProperty(
      "--fallback-left",
      `${settings.x * 100}%`
    );

    clone.style.setProperty(
      "--fallback-top",
      `${settings.y * 100}%`
    );

    clone.style.setProperty(
      "--fallback-duration",
      `${26 + index * 2}s`
    );

    clone.style.setProperty(
      "--fallback-delay",
      `${-11 - index * 3}s`
    );

    layer.appendChild(clone);
  });

  const pageElements = Array.from(
    layer.querySelectorAll(".enchanted-page")
  );

  const finePointer = window.matchMedia(
    "(pointer: fine)"
  ).matches;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  document.body.classList.add(
    "has-enchanted-pages"
  );

  document.body.classList.add(
    "pages-js-ready"
  );

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

    "The corresponding author has entered the Chamber of Corrections.",

    "The osteoclasts have unionized and demand better culture conditions.",

    "The osteoblasts are building something. Nobody approved the protocol.",

    "Your references have multiplied overnight. Do not feed them after midnight.",

    "The manuscript is under review. Time now moves differently.",

    "A reviewer has requested an experiment already shown in Figure 3.",

    "The journal portal has forgotten your password again.",

    "Your confidence interval is wider than the forbidden forest.",

    "The negative control has become suspiciously positive.",

    "The discussion section is now longer than the actual experiment.",

    "The editor says the decision is coming soon. Define soon.",

    "A wild reviewer comment appeared: Please cite our seventeen papers.",

    "The raw data knows what happened, but it refuses to testify.",

    "The protocol worked perfectly yesterday. Yesterday is gone.",

    "The cells sensed the deadline and stopped growing.",

    "The manuscript survived peer review but lost part of its soul.",

    "The editor has classified your revision as minor. This is dark magic.",

    "The abstract contains exactly one word too many.",

    "The corresponding author is currently trapped inside tracked changes.",

    "The research question was simple before the reviewers arrived.",

    "The cells have formed a functional model and now demand authorship.",

    "PTH exposure detected. Remodeling mischief is now active.",

    "The SHG signal has revealed collagen and several new problems.",

    "The osteoclasts resorbed the matrix and possibly the discussion section.",

    "Longitudinal imaging confirms that the deadline is approaching.",

    "Your paper is somewhere between acceptance and character development."
  ];

  const pages = pageElements.map(
    (element, index) => {
      const speed =
        Number(element.dataset.speed) || 32;

      const angle =
        Number(element.dataset.angle) || 0;

      return {
        element,

        x: 0,
        y: 0,

        startX:
          Number(element.dataset.startX) || 0,

        startY:
          Number(element.dataset.startY) || 0,

        vx:
          Math.cos(angle) * speed,

        vy:
          Math.sin(angle) * speed,

        escapeX: 0,
        escapeY: 0,

        obstacleX: 0,
        obstacleY: 0,

        phase:
          index * 0.92,

        lastSparkle: 0
      };
    }
  );

  const pointer = {
    x: 0,
    y: 0,
    active: false
  };

  /*
   * Elements treated as no-fly zones.
   * Butterflies will gently turn away before covering them.
   */
  const obstacleSelector = [
    ".site-header",
    ".publications-hero-content",
    ".profile-links",
    ".publication-section-header",
    ".status-entry",
    ".publication-list",
    ".publication-note",
    ".presentation-card",
    ".site-footer"
  ].join(", ");

  const obstacleElements = Array.from(
    document.querySelectorAll(
      obstacleSelector
    )
  );

  let initialized = false;

  let previousTime =
    performance.now();

  let messageTimer = 0;

  const clamp = (
    value,
    minimum,
    maximum
  ) => {
    return Math.max(
      minimum,
      Math.min(maximum, value)
    );
  };

  const getLayerBounds = () => {
    const rect =
      layer.getBoundingClientRect();

    return {
      width:
        Math.max(rect.width, 1),

      height:
        Math.max(rect.height, 1),

      top:
        rect.top
    };
  };

  const initializePages = () => {
    const area =
      getLayerBounds();

    pages.forEach((page) => {
      const width =
        page.element.offsetWidth;

      const height =
        page.element.offsetHeight;

      page.x =
        page.startX *
        Math.max(
          area.width - width,
          1
        );

      page.y =
        page.startY *
        Math.max(
          area.height - height,
          1
        );
    });

    initialized = true;
  };

  /*
   * Read the visible content positions.
   */
  const getObstacleRects = () => {
    return obstacleElements
      .filter((element) => {
        const style =
          window.getComputedStyle(element);

        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          Number(style.opacity) !== 0
        );
      })
      .map((element) => {
        return element.getBoundingClientRect();
      })
      .filter((rect) => {
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          rect.bottom > 0 &&
          rect.top < window.innerHeight &&
          rect.right > 0 &&
          rect.left < window.innerWidth
        );
      });
  };

  /*
   * Find the nearest route out of a no-fly zone.
   */
  const getContentAvoidance = (
    centerX,
    centerY,
    pageWidth,
    pageHeight,
    obstacleRects
  ) => {
    let pushX = 0;
    let pushY = 0;

    const horizontalPadding =
      pageWidth * 0.48 + 18;

    const verticalPadding =
      pageHeight * 0.48 + 16;

    obstacleRects.forEach((rect) => {
      const left =
        rect.left - horizontalPadding;

      const right =
        rect.right + horizontalPadding;

      const top =
        rect.top - verticalPadding;

      const bottom =
        rect.bottom + verticalPadding;

      const inside =
        centerX > left &&
        centerX < right &&
        centerY > top &&
        centerY < bottom;

      if (!inside) {
        return;
      }

      const exits = [
        {
          x: left - centerX,
          y: 0,
          distance:
            Math.abs(left - centerX)
        },
        {
          x: right - centerX,
          y: 0,
          distance:
            Math.abs(right - centerX)
        },
        {
          x: 0,
          y: top - centerY,
          distance:
            Math.abs(top - centerY)
        },
        {
          x: 0,
          y: bottom - centerY,
          distance:
            Math.abs(bottom - centerY)
        }
      ];

      const nearestExit =
        exits.reduce(
          (nearest, current) => {
            return (
              current.distance <
              nearest.distance
            )
              ? current
              : nearest;
          }
        );

      pushX += nearestExit.x;
      pushY += nearestExit.y;
    });

    return {
      x: clamp(
        pushX,
        -42,
        42
      ),

      y: clamp(
        pushY,
        -34,
        34
      )
    };
  };

  const createSparkles = (
    x,
    y,
    count = 10,
    radius = 65
  ) => {
    if (!particles) {
      return;
    }

    for (
      let index = 0;
      index < count;
      index += 1
    ) {
      const sparkle =
        document.createElement("span");

      const angle =
        Math.random() *
        Math.PI *
        2;

      const distance =
        14 +
        Math.random() *
        radius;

      const duration =
        520 +
        Math.random() *
        500;

      const size =
        5 +
        Math.random() *
        7;

      sparkle.className =
        "magic-sparkle";

      sparkle.style.setProperty(
        "--sparkle-x",
        `${x}px`
      );

      sparkle.style.setProperty(
        "--sparkle-y",
        `${y}px`
      );

      sparkle.style.setProperty(
        "--sparkle-size",
        `${size}px`
      );

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

      particles.appendChild(
        sparkle
      );

      window.setTimeout(
        () => {
          sparkle.remove();
        },
        duration + 100
      );
    }
  };

  const typeMessage = (
    element,
    message
  ) => {
    if (!element) {
      return;
    }

    element.textContent = "";

    let index = 0;

    const write = () => {
      element.textContent =
        message.slice(
          0,
          index + 1
        );

      index += 1;

      if (
        index <
        message.length
      ) {
        window.setTimeout(
          write,
          18
        );
      }
    };

    write();
  };

  const closeMessages = () => {
    pages.forEach((page) => {
      page.element.classList.remove(
        "is-open"
      );
    });
  };

  const openMessage = (page) => {
    const rect =
      page.element.getBoundingClientRect();

    const text =
      page.element.querySelector(
        ".enchanted-message-text"
      );

    const message =
      messages[
        Math.floor(
          Math.random() *
          messages.length
        )
      ];

    closeMessages();

    typeMessage(
      text,
      message
    );

    page.element.classList.add(
      "is-open"
    );

    if (hint) {
      hint.classList.add(
        "is-hidden"
      );
    }

    createSparkles(
      rect.left +
        rect.width / 2,

      rect.top +
        rect.height / 2,

      22,
      105
    );

    window.clearTimeout(
      messageTimer
    );

    messageTimer =
      window.setTimeout(
        () => {
          page.element.classList.remove(
            "is-open"
          );
        },
        3400
      );
  };

  pages.forEach((page) => {
    page.element.addEventListener(
      "click",
      (event) => {
        event.stopPropagation();

        openMessage(page);
      }
    );

    page.element.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();

          openMessage(page);
        }
      }
    );
  });

  document.addEventListener(
    "click",
    (event) => {
      if (
        !event.target.closest(
          ".enchanted-page"
        )
      ) {
        closeMessages();
      }
    }
  );

  if (finePointer) {
    window.addEventListener(
      "pointermove",
      (event) => {
        pointer.x =
          event.clientX;

        pointer.y =
          event.clientY;

        pointer.active =
          true;
      },
      {
        passive: true
      }
    );

    document.documentElement.addEventListener(
      "mouseleave",
      () => {
        pointer.active =
          false;
      },
      {
        passive: true
      }
    );
  }

  const animate = (timeNow) => {
    if (!initialized) {
      initializePages();
    }

    const area =
      getLayerBounds();

    const obstacleRects =
      getObstacleRects();

    const deltaTime =
      Math.min(
        (
          timeNow -
          previousTime
        ) / 1000,
        0.035
      );

    const time =
      timeNow / 1000;

    previousTime =
      timeNow;

    pages.forEach((page) => {
      const element =
        page.element;

      const width =
        element.offsetWidth;

      const height =
        element.offsetHeight;

      const isOpen =
        element.classList.contains(
          "is-open"
        );

      const movement =
        reducedMotion
          ? 0.34
          : 0.78;

      if (!isOpen) {
        page.x +=
          page.vx *
          deltaTime *
          movement;

        page.y +=
          page.vy *
          deltaTime *
          movement;
      }

      const maxX =
        Math.max(
          area.width -
            width -
            10,
          10
        );

      const maxY =
        Math.max(
          area.height -
            height -
            10,
          10
        );

      if (page.x <= 10) {
        page.x = 10;

        page.vx =
          Math.abs(page.vx);
      } else if (
        page.x >= maxX
      ) {
        page.x = maxX;

        page.vx =
          -Math.abs(page.vx);
      }

      if (page.y <= 10) {
        page.y = 10;

        page.vy =
          Math.abs(page.vy);
      } else if (
        page.y >= maxY
      ) {
        page.y = maxY;

        page.vy =
          -Math.abs(page.vy);
      }

      const centerX =
        page.x +
        width / 2;

      const centerY =
        area.top +
        page.y +
        height / 2;

      /*
       * Content avoidance.
       */
      const avoidance =
        getContentAvoidance(
          centerX,
          centerY,
          width,
          height,
          obstacleRects
        );

      const targetObstacleX =
        isOpen
          ? 0
          : avoidance.x;

      const targetObstacleY =
        isOpen
          ? 0
          : avoidance.y;

      page.obstacleX +=
        (
          targetObstacleX -
          page.obstacleX
        ) * 0.08;

      page.obstacleY +=
        (
          targetObstacleY -
          page.obstacleY
        ) * 0.08;

      if (!isOpen) {
        page.x +=
          page.obstacleX *
          0.055;

        page.y +=
          page.obstacleY *
          0.055;

        if (
          Math.abs(
            avoidance.x
          ) > 1.5
        ) {
          page.vx =
            Math.abs(page.vx) *
            Math.sign(
              avoidance.x
            );
        }

        if (
          Math.abs(
            avoidance.y
          ) > 1.5
        ) {
          page.vy =
            Math.abs(page.vy) *
            Math.sign(
              avoidance.y
            );
        }
      }

      /*
       * Gentle cursor avoidance.
       */
      let targetEscapeX = 0;
      let targetEscapeY = 0;
      let isAlert = false;

      if (
        pointer.active &&
        finePointer &&
        !isOpen
      ) {
        const deltaX =
          centerX -
          pointer.x;

        const deltaY =
          centerY -
          pointer.y;

        const distance =
          Math.hypot(
            deltaX,
            deltaY
          ) || 1;

        const radius = 135;

        if (
          distance <
          radius
        ) {
          const rawForce =
            1 -
            distance /
            radius;

          const force =
            rawForce *
            rawForce *
            rawForce;

          targetEscapeX =
            (
              deltaX /
              distance
            ) *
            force *
            28;

          targetEscapeY =
            (
              deltaY /
              distance
            ) *
            force *
            20;

          isAlert = true;

          if (
            timeNow -
              page.lastSparkle >
              260 &&
            force > 0.42
          ) {
            createSparkles(
              centerX,
              centerY,
              1,
              22
            );

            page.lastSparkle =
              timeNow;
          }
        }
      }

      page.escapeX +=
        (
          targetEscapeX -
          page.escapeX
        ) *
        0.035;

      page.escapeY +=
        (
          targetEscapeY -
          page.escapeY
        ) *
        0.035;

      const bob =
        Math.sin(
          time * 3.1 +
          page.phase
        ) * 4;

      const tilt =
        Math.sin(
          time * 2 +
          page.phase
        ) * 4;

      const angle =
        Math.atan2(
          page.vy,
          page.vx
        ) *
        (
          180 /
          Math.PI
        );

      const rotation =
        Math.max(
          -13,
          Math.min(
            13,
            angle * 0.15
          )
        );

      element.classList.toggle(
        "is-alert",
        isAlert
      );

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
        page.vx >= 0
          ? "1"
          : "-1"
      );

      /*
       * Occasional passive sparkle.
       */
      if (
        !isOpen &&
        !reducedMotion &&
        timeNow -
          page.lastSparkle >
          1550 +
          page.phase *
          100
      ) {
        createSparkles(
          centerX -
            Math.sign(
              page.vx || 1
            ) *
            width *
            0.25,

          centerY,

          1,
          14
        );

        page.lastSparkle =
          timeNow;
      }
    });

    window.requestAnimationFrame(
      animate
    );
  };

  window.addEventListener(
    "resize",
    () => {
      initialized = false;
    },
    {
      passive: true
    }
  );

  const sections =
    document.querySelectorAll(
      ".publication-section"
    );

  if (
    !(
      "IntersectionObserver"
      in window
    )
  ) {
    sections.forEach(
      (section) => {
        section.classList.add(
          "is-visible"
        );
      }
    );
  } else {
    const observer =
      new IntersectionObserver(
        (
          entries,
          sectionObserver
        ) => {
          entries.forEach(
            (entry) => {
              if (
                entry.isIntersecting
              ) {
                entry.target.classList.add(
                  "is-visible"
                );

                sectionObserver.unobserve(
                  entry.target
                );
              }
            }
          );
        },
        {
          threshold: 0.08,
          rootMargin:
            "0px 0px -8% 0px"
        }
      );

    sections.forEach(
      (section) => {
        observer.observe(
          section
        );
      }
    );
  }

  window.requestAnimationFrame(
    animate
  );
})();
