(() => {
  "use strict";

  const layer = document.querySelector("[data-book-atmosphere]");
  const particles = document.querySelector("[data-magic-particles]");
  const hint = document.querySelector("[data-book-hint]");

  if (!layer) return;

  const bookElements = [...layer.querySelectorAll(".flying-book")];
  if (!bookElements.length) return;

  const finePointer = window.matchMedia("(pointer: fine)").matches;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  document.body.classList.add("has-flying-books");

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

  const clamp = (value, min, max) => {
    return Math.max(min, Math.min(max, value));
  };

  const normalizeAngle = (angle) => {
    return ((((angle + 180) % 360) + 360) % 360) - 180;
  };

  const approachAngle = (
    current,
    target,
    factor
  ) => {
    return (
      current +
      normalizeAngle(target - current) *
        factor
    );
  };

  const pointer = {
    x: 0,
    y: 0,
    active: false
  };

  let initialized = false;
  let previousTime = performance.now();
  let messageTimer = 0;
  let activeDraggedBook = null;

  const books = bookElements.map(
    (element, index) => {
      const speed =
        Number(element.dataset.speed) || 18;

      const angle =
        Number(element.dataset.angle) || 0;

      const image =
        element.querySelector(".book-image");

      const syncImageRatio = () => {
        if (
          !image?.naturalWidth ||
          !image?.naturalHeight
        ) {
          return;
        }

        element.style.setProperty(
          "--book-ratio",
          `${image.naturalWidth} / ${image.naturalHeight}`
        );

        initialized = false;
      };

      if (image) {
        if (image.complete) {
          syncImageRatio();
        } else {
          image.addEventListener(
            "load",
            syncImageRatio,
            {
              once: true
            }
          );
        }
      }

      element.style.cursor = "grab";
      element.style.touchAction = "none";
      element.style.userSelect = "none";
      element.style.webkitUserSelect = "none";
      element.draggable = false;

      return {
        element,
        image,

        x: 0,
        y: 0,

        startX:
          Number(element.dataset.startX) || 0,

        startY:
          Number(element.dataset.startY) || 0,

        vx:
          Math.cos(angle) *
          speed,

        vy:
          Math.sin(angle) *
          speed,

        baseSpeed:
          speed,

        speedFactor:
          1,

        heading:
          angle *
            (180 / Math.PI) +
          90,

        escapeX:
          0,

        escapeY:
          0,

        phase:
          index * 0.83,

        lastSparkle:
          0,

        isDragging:
          false,

        dragPointerId:
          null,

        dragOffsetX:
          0,

        dragOffsetY:
          0,

        dragStartPointerX:
          0,

        dragStartPointerY:
          0,

        lastPointerX:
          0,

        lastPointerY:
          0,

        lastPointerTime:
          0,

        dragVelocityX:
          0,

        dragVelocityY:
          0,

        didDrag:
          false,

        suppressClickUntil:
          0,

        typingRunId:
          0
      };
    }
  );

  const getLayerBounds = () => {
    const rect =
      layer.getBoundingClientRect();

    return {
      left:
        rect.left,

      top:
        rect.top,

      width:
        Math.max(
          rect.width,
          1
        ),

      height:
        Math.max(
          rect.height,
          1
        )
    };
  };

  const initializeBooks = () => {
    const area =
      getLayerBounds();

    books.forEach((book) => {
      const width =
        book.element.offsetWidth;

      const height =
        book.element.offsetHeight;

      book.x =
        10 +
        book.startX *
          Math.max(
            area.width -
              width -
              20,
            1
          );

      book.y =
        10 +
        book.startY *
          Math.max(
            area.height -
              height -
              20,
            1
          );
    });

    initialized = true;
  };

  const keepBookInsideLayer = (
    book,
    area
  ) => {
    const width =
      book.element.offsetWidth;

    const height =
      book.element.offsetHeight;

    const minX = 10;
    const minY = 10;

    const maxX =
      Math.max(
        area.width -
          width -
          10,
        minX
      );

    const maxY =
      Math.max(
        area.height -
          height -
          10,
        minY
      );

    book.x =
      clamp(
        book.x,
        minX,
        maxX
      );

    book.y =
      clamp(
        book.y,
        minY,
        maxY
      );
  };

  const createSparkles = (
    x,
    y,
    count = 8,
    radius = 45
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
          520;

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
        `${
          Math.cos(angle) *
          distance
        }px`
      );

      sparkle.style.setProperty(
        "--sparkle-dy",
        `${
          Math.sin(angle) *
            distance -
          18
        }px`
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
    book,
    element,
    message
  ) => {
    if (!element) {
      return;
    }

    book.typingRunId += 1;

    const runId =
      book.typingRunId;

    element.textContent = "";

    let index = 0;

    const write = () => {
      if (
        runId !==
        book.typingRunId
      ) {
        return;
      }

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
    books.forEach((book) => {
      book.typingRunId += 1;

      book.element.classList.remove(
        "is-open"
      );
    });
  };

  const openMessage = (book) => {
    const rect =
      book.element.getBoundingClientRect();

    const text =
      book.element.querySelector(
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
      book,
      text,
      message
    );

    book.element.classList.add(
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

      32,
      115
    );

    window.clearTimeout(
      messageTimer
    );

    const typingDuration =
      message.length *
      18;

    const readingTime =
      7000;

    messageTimer =
      window.setTimeout(
        () => {
          book.typingRunId += 1;

          book.element.classList.remove(
            "is-open"
          );
        },
        typingDuration +
          readingTime
      );
  };

  const beginDrag = (
    book,
    event
  ) => {
    if (
      event.pointerType === "mouse" &&
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    closeMessages();

    const area =
      getLayerBounds();

    const localPointerX =
      event.clientX -
      area.left;

    const localPointerY =
      event.clientY -
      area.top;

    book.isDragging =
      true;

    book.dragPointerId =
      event.pointerId;

    book.dragOffsetX =
      localPointerX -
      book.x;

    book.dragOffsetY =
      localPointerY -
      book.y;

    book.dragStartPointerX =
      event.clientX;

    book.dragStartPointerY =
      event.clientY;

    book.lastPointerX =
      event.clientX;

    book.lastPointerY =
      event.clientY;

    book.lastPointerTime =
      performance.now();

    book.dragVelocityX =
      0;

    book.dragVelocityY =
      0;

    book.didDrag =
      false;

    book.escapeX =
      0;

    book.escapeY =
      0;

    activeDraggedBook =
      book;

    book.element.classList.add(
      "is-dragging"
    );

    try {
      book.element.setPointerCapture(
        event.pointerId
      );
    } catch {
      // Pointer capture is optional.
    }
  };

  const moveDraggedBook = (
    book,
    event
  ) => {
    if (
      !book.isDragging ||
      book.dragPointerId !==
        event.pointerId
    ) {
      return;
    }

    event.preventDefault();

    const area =
      getLayerBounds();

    const localPointerX =
      event.clientX -
      area.left;

    const localPointerY =
      event.clientY -
      area.top;

    book.x =
      localPointerX -
      book.dragOffsetX;

    book.y =
      localPointerY -
      book.dragOffsetY;

    keepBookInsideLayer(
      book,
      area
    );

    const totalMovement =
      Math.hypot(
        event.clientX -
          book.dragStartPointerX,

        event.clientY -
          book.dragStartPointerY
      );

    if (
      totalMovement >
      7
    ) {
      book.didDrag =
        true;
    }

    const currentTime =
      performance.now();

    const elapsedSeconds =
      Math.max(
        (
          currentTime -
          book.lastPointerTime
        ) /
          1000,
        0.001
      );

    const currentVelocityX =
      (
        event.clientX -
        book.lastPointerX
      ) /
      elapsedSeconds;

    const currentVelocityY =
      (
        event.clientY -
        book.lastPointerY
      ) /
      elapsedSeconds;

    book.dragVelocityX +=
      (
        currentVelocityX -
        book.dragVelocityX
      ) *
      0.24;

    book.dragVelocityY +=
      (
        currentVelocityY -
        book.dragVelocityY
      ) *
      0.24;

    book.lastPointerX =
      event.clientX;

    book.lastPointerY =
      event.clientY;

    book.lastPointerTime =
      currentTime;

    if (
      Math.hypot(
        book.dragVelocityX,
        book.dragVelocityY
      ) >
      12
    ) {
      const dragHeading =
        Math.atan2(
          book.dragVelocityY,
          book.dragVelocityX
        ) *
          (
            180 /
            Math.PI
          ) +
        90;

      book.heading =
        approachAngle(
          book.heading,
          dragHeading,
          0.2
        );
    }

    if (
      currentTime -
        book.lastSparkle >
      85
    ) {
      const rect =
        book.element.getBoundingClientRect();

      createSparkles(
        rect.left +
          rect.width / 2,

        rect.top +
          rect.height / 2,

        2,
        24
      );

      book.lastSparkle =
        currentTime;
    }
  };

  const finishDrag = (
    book,
    event
  ) => {
    if (!book.isDragging) {
      return;
    }

    if (
      event &&
      book.dragPointerId !==
        event.pointerId
    ) {
      return;
    }

    const pointerId =
      book.dragPointerId;

    book.isDragging =
      false;

    book.dragPointerId =
      null;

    book.element.classList.remove(
      "is-dragging"
    );

    if (book.didDrag) {
      const rawThrowSpeed =
        Math.hypot(
          book.dragVelocityX,
          book.dragVelocityY
        );

      if (
        rawThrowSpeed >
        20
      ) {
        const directionX =
          book.dragVelocityX /
          rawThrowSpeed;

        const directionY =
          book.dragVelocityY /
          rawThrowSpeed;

        const throwSpeed =
          clamp(
            rawThrowSpeed *
              0.028,

            book.baseSpeed *
              0.9,

            book.baseSpeed *
              2.2
          );

        book.vx =
          directionX *
          throwSpeed;

        book.vy =
          directionY *
          throwSpeed;

        book.speedFactor =
          throwSpeed /
          book.baseSpeed;
      }

      book.suppressClickUntil =
        performance.now() +
        450;

      const rect =
        book.element.getBoundingClientRect();

      createSparkles(
        rect.left +
          rect.width / 2,

        rect.top +
          rect.height / 2,

        12,
        55
      );
    }

    activeDraggedBook =
      null;

    if (
      pointerId !==
      null
    ) {
      try {
        book.element.releasePointerCapture(
          pointerId
        );
      } catch {
        // Capture may already be released.
      }
    }
  };

  books.forEach((book) => {
    book.element.addEventListener(
      "pointerdown",
      (event) => {
        beginDrag(
          book,
          event
        );
      }
    );

    book.element.addEventListener(
      "pointermove",
      (event) => {
        moveDraggedBook(
          book,
          event
        );
      }
    );

    book.element.addEventListener(
      "pointerup",
      (event) => {
        finishDrag(
          book,
          event
        );
      }
    );

    book.element.addEventListener(
      "pointercancel",
      (event) => {
        finishDrag(
          book,
          event
        );
      }
    );

    book.element.addEventListener(
      "lostpointercapture",
      (event) => {
        if (book.isDragging) {
          finishDrag(
            book,
            event
          );
        }
      }
    );

    book.element.addEventListener(
      "click",
      (event) => {
        event.stopPropagation();

        if (
          performance.now() <
          book.suppressClickUntil
        ) {
          event.preventDefault();
          return;
        }

        if (book.didDrag) {
          book.didDrag =
            false;

          event.preventDefault();
          return;
        }

        openMessage(
          book
        );
      }
    );

    book.element.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();

          openMessage(
            book
          );
        }
      }
    );
  });

  document.addEventListener(
    "click",
    (event) => {
      if (
        !event.target.closest(
          ".flying-book"
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
        if (
          activeDraggedBook
        ) {
          return;
        }

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

  const animate = (
    timeNow
  ) => {
    if (!initialized) {
      initializeBooks();
    }

    const area =
      getLayerBounds();

    const deltaTime =
      Math.min(
        (
          timeNow -
          previousTime
        ) /
          1000,
        0.035
      );

    const time =
      timeNow /
      1000;

    previousTime =
      timeNow;

    books.forEach((book) => {
      const element =
        book.element;

      const width =
        element.offsetWidth;

      const height =
        element.offsetHeight;

      const isOpen =
        element.classList.contains(
          "is-open"
        );

      const movementMultiplier =
        reducedMotion
          ? 0.34
          : 0.72;

      if (
        !isOpen &&
        !book.isDragging
      ) {
        const wanderAmount =
          Math.sin(
            time * 0.46 +
            book.phase
          ) *
            0.006 +
          Math.cos(
            time * 0.24 +
            book.phase
          ) *
            0.003;

        const cosWander =
          Math.cos(
            wanderAmount
          );

        const sinWander =
          Math.sin(
            wanderAmount
          );

        const newVelocityX =
          book.vx *
            cosWander -
          book.vy *
            sinWander;

        const newVelocityY =
          book.vx *
            sinWander +
          book.vy *
            cosWander;

        book.vx =
          newVelocityX;

        book.vy =
          newVelocityY;

        book.speedFactor +=
          (
            1 -
            book.speedFactor
          ) *
          0.018;

        const currentSpeed =
          Math.hypot(
            book.vx,
            book.vy
          ) ||
          1;

        const targetSpeed =
          book.baseSpeed *
          book.speedFactor;

        book.vx =
          (
            book.vx /
            currentSpeed
          ) *
          targetSpeed;

        book.vy =
          (
            book.vy /
            currentSpeed
          ) *
          targetSpeed;

        book.x +=
          book.vx *
          deltaTime *
          movementMultiplier;

        book.y +=
          book.vy *
          deltaTime *
          movementMultiplier;
      }

      const minX =
        10;

      const minY =
        10;

      const maxX =
        Math.max(
          area.width -
            width -
            10,

          minX
        );

      const maxY =
        Math.max(
          area.height -
            height -
            10,

          minY
        );

      if (!book.isDragging) {
        if (
          book.x <=
          minX
        ) {
          book.x =
            minX;

          book.vx =
            Math.abs(
              book.vx
            );
        } else if (
          book.x >=
          maxX
        ) {
          book.x =
            maxX;

          book.vx =
            -Math.abs(
              book.vx
            );
        }

        if (
          book.y <=
          minY
        ) {
          book.y =
            minY;

          book.vy =
            Math.abs(
              book.vy
            );
        } else if (
          book.y >=
          maxY
        ) {
          book.y =
            maxY;

          book.vy =
            -Math.abs(
              book.vy
            );
        }
      }

      const centerX =
        book.x +
        width / 2;

      const centerY =
        area.top +
        book.y +
        height / 2;

      let targetEscapeX =
        0;

      let targetEscapeY =
        0;

      let isAlert =
        false;

      if (
        pointer.active &&
        finePointer &&
        !isOpen &&
        !book.isDragging
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
          ) ||
          1;

        const radius =
          120;

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
            18;

          targetEscapeY =
            (
              deltaY /
              distance
            ) *
            force *
            14;

          isAlert =
            true;

          if (
            timeNow -
              book.lastSparkle >
              180 &&
            force >
              0.34
          ) {
            createSparkles(
              centerX,
              centerY,
              3,
              28
            );

            book.lastSparkle =
              timeNow;
          }
        }
      }

      if (!book.isDragging) {
        book.escapeX +=
          (
            targetEscapeX -
            book.escapeX
          ) *
          0.03;

        book.escapeY +=
          (
            targetEscapeY -
            book.escapeY
          ) *
          0.03;
      } else {
        book.escapeX =
          0;

        book.escapeY =
          0;
      }

      const bob =
        book.isDragging
          ? 0
          : Math.sin(
              time * 3.1 +
              book.phase
            ) *
            4;

      const tilt =
        book.isDragging
          ? 0
          : Math.sin(
              time * 2 +
              book.phase
            ) *
            4;

      if (!book.isDragging) {
        let targetHeading =
          Math.atan2(
            book.vy,
            book.vx
          ) *
            (
              180 /
              Math.PI
            ) +
          90;

        if (isOpen) {
          targetHeading =
            0;
        }

        book.heading =
          approachAngle(
            book.heading,
            targetHeading,
            isOpen
              ? 0.18
              : 0.075
          );
      }

      const naturalBank =
        book.isDragging
          ? 0
          : Math.sin(
              time * 1.8 +
              book.phase
            ) *
            3;

      const visualHeading =
        book.heading +
        naturalBank;

      element.classList.toggle(
        "is-alert",
        isAlert
      );

      element.style.setProperty(
        "--flight-x",
        `${book.x}px`
      );

      element.style.setProperty(
        "--flight-y",
        `${book.y}px`
      );

      element.style.setProperty(
        "--escape-x",
        `${book.escapeX}px`
      );

      element.style.setProperty(
        "--escape-y",
        `${book.escapeY}px`
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

      element.style.setProperty(
        "--book-scale",
        book.isDragging
          ? "1.06"
          : isAlert
            ? "1.025"
            : "1"
      );

      if (
        !isOpen &&
        !book.isDragging &&
        !reducedMotion &&
        timeNow -
          book.lastSparkle >
          720 +
          book.phase *
            65
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
          centerX -
            Math.cos(
              headingRadians
            ) *
              width *
              0.22,

          centerY -
            Math.sin(
              headingRadians
            ) *
              width *
              0.22,

          2,
          24
        );

        book.lastSparkle =
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
      initialized =
        false;
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
      "IntersectionObserver" in
      window
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
          threshold:
            0.08,

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
