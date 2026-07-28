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
   * Seven in the HTML become ten in total.
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
    const source =
      originalPages[settings.template % originalPages.length];

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

    "Your manuscript has been accepted... in an alternative universe.",

    "The corresponding author has entered the Chamber of Corrections.",

    "The statistical significance spell failed. Increase the sample size.",

    "The osteoclasts have unionized and demand better culture conditions.",

    "The osteoblasts are building something. Nobody approved the protocol.",

    "The control group insists it was never informed about the experiment.",

    "Your references multiplied overnight. Do not feed them after midnight.",

    "The manuscript is under review. Time now moves differently.",

    "A reviewer requested an experiment already shown in Figure 3.",

    "The journal portal has forgotten your password again.",

    "The supplementary file exceeds the magical upload limit.",

    "Your confidence interval is wider than the forbidden forest.",

    "The western blot has chosen not to cooperate today.",

    "The microscope detected movement. It may only be dust.",

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

    "The editor classified your revision as minor. This is dark magic.",

    "The literature search discovered another 247 relevant papers.",

    "The abstract contains exactly one word too many.",

    "The reference manager duplicated every citation for ceremonial purposes.",

    "The journal system saved everything except the final submission.",

    "The corresponding author is currently trapped inside tracked changes.",

    "The research question was simple before the reviewers arrived.",

    "The results are significant, but the reviewer remains emotionally unconvinced.",

    "The manuscript has entered the final review stage. Again.",

    "The cells formed a functional model and now demand authorship.",

    "PTH exposure detected. Remodeling mischief is now active.",

    "The SHG signal revealed collagen and several new problems.",

    "The osteoclasts resorbed the matrix and possibly the discussion section.",

    "The osteoblasts restored the matrix but refused to fix the references.",

    "The functional bone model has achieved more balance than the research team.",

    "Longitudinal imaging confirms that the deadline is approaching.",

    "The manuscript has been revised so many times it qualifies as tissue remodeling.",

    "Reviewer 2 requested an additional control group for the control group.",

    "The editor appreciates your revision and attached fourteen new comments.",

    "Your paper is somewhere between acceptance and character development."
  ];

  /*
   * Large content zones only.
   * Individual lines and buttons are not separate obstacles.
   */
  const protectedZoneSelector = [
    ".site-header",
    ".publications-hero > .container",
    ".publication-section",
    ".site-footer > .container"
  ].join(", ");

  const protectedZoneElements = Array.from(
    document.querySelectorAll(
      protectedZoneSelector
    )
  );

  /*
   * Most butterflies prefer a side corridor.
   * Two remain free-roaming.
   */
  const corridorPattern = [
    "left",
    "right",
    "left",
    "right",
    "roam",
    "left",
    "right",
    "roam",
    "left",
    "right"
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

        baseSpeed:
          speed,

        escapeX: 0,
        escapeY: 0,

        phase:
          index * 0.92,

        lastSparkle: 0,

        blockedTime: 0,

        emergencyUntil: 0,

        heading:
          angle *
            (180 / Math.PI) +
          90,

        corridor:
          corridorPattern[
            index %
            corridorPattern.length
          ]
      };
    }
  );

  const pointer = {
    x: 0,
    y: 0,
    active: false
  };

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

  /*
   * Keep angles between -180 and 180.
   * This prevents long spinning when changing direction.
   */
  const normalizeAngle = (
    angle
  ) => {
    return (
      (
        (
          angle + 180
        ) %
        360 +
        360
      ) %
      360
    ) - 180;
  };

  const approachAngle = (
    current,
    target,
    factor
  ) => {
    return (
      current +
      normalizeAngle(
        target - current
      ) *
        factor
    );
  };

  const normalizeVector = (
    x,
    y
  ) => {
    const length =
      Math.hypot(x, y) || 1;

    return {
      x:
        x / length,

      y:
        y / length
    };
  };

  const getLayerBounds = () => {
    const rect =
      layer.getBoundingClientRect();

    return {
      width:
        Math.max(
          rect.width,
          1
        ),

      height:
        Math.max(
          rect.height,
          1
        ),

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
   * Read only the major visible content rectangles.
   */
  const getProtectedRects = () => {
    return protectedZoneElements
      .filter((element) => {
        const style =
          window.getComputedStyle(
            element
          );

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
          rect.top <
            window.innerHeight &&
          rect.right > 0 &&
          rect.left <
            window.innerWidth
        );
      });
  };

  /*
   * Predict where the butterfly is heading.
   * It begins turning before reaching the protected content.
   */
  const getPredictiveAvoidance = (
    page,
    centerX,
    centerY,
    pageWidth,
    pageHeight,
    protectedRects
  ) => {
    const lookAheadSeconds =
      0.85;

    const projectedX =
      centerX +
      page.vx *
        lookAheadSeconds;

    const projectedY =
      centerY +
      page.vy *
        lookAheadSeconds;

    let pushX = 0;
    let pushY = 0;
    let strongestUrgency = 0;
    let active = false;

    const horizontalPadding =
      pageWidth * 0.52 + 18;

    const verticalPadding =
      pageHeight * 0.52 + 16;

    protectedRects.forEach(
      (rect) => {
        const left =
          rect.left -
          horizontalPadding;

        const right =
          rect.right +
          horizontalPadding;

        const top =
          rect.top -
          verticalPadding;

        const bottom =
          rect.bottom +
          verticalPadding;

        const projectedInside =
          projectedX > left &&
          projectedX < right &&
          projectedY > top &&
          projectedY < bottom;

        const currentInside =
          centerX > left &&
          centerX < right &&
          centerY > top &&
          centerY < bottom;

        if (
          !projectedInside &&
          !currentInside
        ) {
          return;
        }

        active = true;

        const sampleX =
          currentInside
            ? centerX
            : projectedX;

        const sampleY =
          currentInside
            ? centerY
            : projectedY;

        const exits = [
          {
            x: -1,
            y: 0,
            distance:
              Math.abs(
                sampleX - left
              )
          },
          {
            x: 1,
            y: 0,
            distance:
              Math.abs(
                right - sampleX
              )
          },
          {
            x: 0,
            y: -1,
            distance:
              Math.abs(
                sampleY - top
              )
          },
          {
            x: 0,
            y: 1,
            distance:
              Math.abs(
                bottom - sampleY
              )
          }
        ];

        const nearestExit =
          exits.reduce(
            (
              nearest,
              current
            ) => {
              return (
                current.distance <
                nearest.distance
              )
                ? current
                : nearest;
            }
          );

        const urgency =
          currentInside
            ? 1
            : clamp(
                1 -
                  nearestExit.distance /
                    Math.max(
                      horizontalPadding,
                      verticalPadding,
                      1
                    ),
                0.28,
                0.8
              );

        pushX +=
          nearestExit.x *
          urgency;

        pushY +=
          nearestExit.y *
          urgency;

        strongestUrgency =
          Math.max(
            strongestUrgency,
            urgency
          );
      }
    );

    return {
      x: pushX,
      y: pushY,
      urgency:
        strongestUrgency,
      active
    };
  };

  /*
   * When content is ahead, guide the butterfly toward
   * its preferred left or right flight corridor.
   */
  const getCorridorDirection = (
    page,
    centerX,
    areaWidth,
    pageWidth
  ) => {
    const leftTarget =
      Math.max(
        pageWidth * 0.65,
        areaWidth * 0.055
      );

    const rightTarget =
      Math.min(
        areaWidth -
          pageWidth * 0.65,

        areaWidth * 0.945
      );

    let targetX = centerX;

    if (
      page.corridor === "left"
    ) {
      targetX = leftTarget;
    } else if (
      page.corridor === "right"
    ) {
      targetX = rightTarget;
    } else {
      targetX =
        centerX <
        areaWidth / 2
          ? leftTarget
          : rightTarget;
    }

    return normalizeVector(
      targetX - centerX,
      Math.sin(page.phase) *
        0.22
    );
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
        document.createElement(
          "span"
        );

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

      36,
      130
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

    const protectedRects =
      getProtectedRects();

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

      const previousX =
        page.x;

      const previousY =
        page.y;

      const movementMultiplier =
        reducedMotion
          ? 0.34
          : 0.72;

      const centerX =
        page.x +
        width / 2;

      const centerY =
        area.top +
        page.y +
        height / 2;

      const avoidance =
        getPredictiveAvoidance(
          page,
          centerX,
          centerY,
          width,
          height,
          protectedRects
        );

      const inEmergency =
        timeNow <
        page.emergencyUntil;

      if (
        !isOpen &&
        !inEmergency
      ) {
        /*
         * Small organic turns stop the flight from
         * looking like a straight screensaver path.
         */
        const wander =
          Math.sin(
            time * 0.47 +
            page.phase
          ) * 0.012;

        const cosWander =
          Math.cos(wander);

        const sinWander =
          Math.sin(wander);

        const wanderedVX =
          page.vx *
            cosWander -
          page.vy *
            sinWander;

        const wanderedVY =
          page.vx *
            sinWander +
          page.vy *
            cosWander;

        page.vx =
          wanderedVX;

        page.vy =
          wanderedVY;

        if (
          avoidance.active
        ) {
          const corridorDirection =
            getCorridorDirection(
              page,
              centerX,
              area.width,
              width
            );

          const combinedDirection =
            normalizeVector(
              avoidance.x +
                corridorDirection.x *
                  0.42,

              avoidance.y +
                corridorDirection.y *
                  0.22
            );

          const desiredVX =
            combinedDirection.x *
            page.baseSpeed;

          const desiredVY =
            combinedDirection.y *
            page.baseSpeed;

          const steeringStrength =
            0.025 +
            avoidance.urgency *
              0.085;

          page.vx +=
            (
              desiredVX -
              page.vx
            ) *
            steeringStrength;

          page.vy +=
            (
              desiredVY -
              page.vy
            ) *
            steeringStrength;

          page.blockedTime +=
            deltaTime;
        } else {
          page.blockedTime =
            Math.max(
              0,
              page.blockedTime -
                deltaTime *
                  2.4
            );
        }

        /*
         * Emergency escape.
         * A butterfly that remains near the same protected
         * edge for too long is sent toward a side margin.
         */
        if (
          page.blockedTime >
          1.05
        ) {
          let escapeDirectionX;

          if (
            page.corridor ===
            "left"
          ) {
            escapeDirectionX = -1;
          } else if (
            page.corridor ===
            "right"
          ) {
            escapeDirectionX = 1;
          } else {
            escapeDirectionX =
              centerX <
              area.width / 2
                ? -1
                : 1;
          }

          const escapeVector =
            normalizeVector(
              escapeDirectionX,
              Math.sin(
                time +
                page.phase
              ) * 0.34
            );

          page.vx =
            escapeVector.x *
            page.baseSpeed *
            1.28;

          page.vy =
            escapeVector.y *
            page.baseSpeed *
            1.28;

          page.x +=
            escapeVector.x *
            10;

          page.y +=
            escapeVector.y *
            8;

          page.emergencyUntil =
            timeNow + 900;

          page.blockedTime = 0;
        }
      }

      if (!isOpen) {
        page.x +=
          page.vx *
          deltaTime *
          movementMultiplier;

        page.y +=
          page.vy *
          deltaTime *
          movementMultiplier;
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

      const updatedCenterX =
        page.x +
        width / 2;

      const updatedCenterY =
        area.top +
        page.y +
        height / 2;

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
          updatedCenterX -
          pointer.x;

        const deltaY =
          updatedCenterY -
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
              170 &&
            force > 0.34
          ) {
            createSparkles(
              updatedCenterX,
              updatedCenterY,
              3,
              30
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

      /*
       * Natural orientation.
       *
       * The butterfly design points upward at 0 degrees.
       * Therefore:
       * 0 degrees = head up
       * 90 degrees = head right
       * 180 degrees = head down
       * -90 degrees = head left
       */
      const motionX =
        page.x -
        previousX;

      const motionY =
        page.y -
        previousY;

      let targetHeading =
        page.heading;

      if (
        Math.hypot(
          motionX,
          motionY
        ) > 0.04
      ) {
        targetHeading =
          Math.atan2(
            motionY,
            motionX
          ) *
            (
              180 /
              Math.PI
            ) +
          90;
      }

      /*
       * When clicked, gradually rotate upright
       * so the parchment message remains readable.
       */
      if (isOpen) {
        targetHeading = 0;
      }

      page.heading =
        approachAngle(
          page.heading,
          targetHeading,
          isOpen
            ? 0.18
            : 0.085
        );

      const naturalBank =
        Math.sin(
          time * 1.8 +
          page.phase
        ) * 3.5;

      const visualHeading =
        page.heading +
        naturalBank;

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
        `${visualHeading}deg`
      );

      /*
       * The complete butterfly rotates toward its direction.
       * Horizontal mirroring is no longer necessary.
       */
      element.style.setProperty(
        "--page-direction",
        "1"
      );

      /*
       * Passive magical sparkle trail.
       * Its origin follows the direction of the butterfly.
       */
      if (
        !isOpen &&
        !reducedMotion &&
        timeNow -
          page.lastSparkle >
          760 +
          page.phase *
            70
      ) {
        const headingRadians =
          (
            visualHeading -
            90
          ) *
          (
            Math.PI /
            180
          );

        createSparkles(
          updatedCenterX -
            Math.cos(
              headingRadians
            ) *
              width *
              0.25,

          updatedCenterY -
            Math.sin(
              headingRadians
            ) *
              width *
              0.25,

          2,
          24
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
