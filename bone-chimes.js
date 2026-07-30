(() => {
  "use strict";

  const shell = document.getElementById("bone-chimes-experience");
  const canvas = document.getElementById("bone-chimes-canvas");

  if (!shell || !canvas) {
    return;
  }

  const context = canvas.getContext("2d", {
    alpha: true
  });

  if (!context) {
    return;
  }

  const modeButtons = Array.from(
    shell.querySelectorAll("[data-bone-mode]")
  );

  const resetButton = shell.querySelector("[data-bone-reset]");
  const statusTitle = shell.querySelector("[data-bone-status-title]");
  const statusText = shell.querySelector("[data-bone-status-text]");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const palette = {
    ink: {
      red: 45,
      green: 41,
      blue: 36
    },
    primary: {
      red: 138,
      green: 31,
      blue: 45
    },
    gold: {
      red: 201,
      green: 145,
      blue: 39
    },
    paper: {
      red: 238,
      green: 232,
      blue: 218
    }
  };

  const labels = [
    "OB",
    "OC",
    "SHG",
    "COL1",
    "PTH",
    "RANKL",
    "OPG",
    "SOST",
    "RUNX2",
    "DMP1"
  ];

  const modeCopy = {
    plain: {
      title: "Interactive strings",
      text:
        "Move through the suspended strings, then select a remodeling mode."
    },
    formation: {
      title: "Formation",
      text:
        "Osteoblast-associated elements gather and stabilize the matrix."
    },
    resorption: {
      title: "Resorption",
      text:
        "Selected regions loosen and open as the tissue structure is remodeled."
    }
  };

  const state = {
    width: 0,
    height: 0,
    pixelRatio: 1,
    points: [],
    columns: [],

    mode: "plain",

    tissueBlend: 0,
    erosionBlend: 0,

    transition: {
      active: false,
      elapsed: 0,
      duration: 1200,
      fromTissue: 0,
      toTissue: 0,
      fromErosion: 0,
      toErosion: 0,
      sequenceResorption: false
    },

    animationFrame: null,
    lastTime: 0,
    isVisible: true,

    pointer: {
      x: 0,
      y: 0,
      previousX: 0,
      previousY: 0,
      active: false,
      pressed: false
    }
  };

  const rgba = (color, alpha) => (
    `rgba(${color.red}, ${color.green}, ${color.blue}, ${alpha})`
  );

  const clamp = (value, minimum, maximum) => (
    Math.max(minimum, Math.min(maximum, value))
  );

  const mix = (start, end, amount) => (
    start + (end - start) * amount
  );

  const mixColor = (start, end, amount) => ({
    red: Math.round(mix(start.red, end.red, amount)),
    green: Math.round(mix(start.green, end.green, amount)),
    blue: Math.round(mix(start.blue, end.blue, amount))
  });

  const smoothStep = value => {
    const normalized = clamp(value, 0, 1);

    return (
      normalized *
      normalized *
      (3 - 2 * normalized)
    );
  };

  const randomBetween = (minimum, maximum) => (
    minimum + Math.random() * (maximum - minimum)
  );

  const seededWave = seed => (
    Math.sin(seed * 12.9898) * 43758.5453 % 1
  );

  const getBoneHalfWidth = normalizedY => {
    const upperHead = Math.exp(
      -Math.pow((normalizedY - 0.18) / 0.17, 2)
    ) * 0.39;

    const lowerHead = Math.exp(
      -Math.pow((normalizedY - 0.8) / 0.19, 2)
    ) * 0.36;

    const shaft =
      0.105 +
      Math.sin(normalizedY * Math.PI) * 0.025;

    return shaft + upperHead + lowerHead;
  };

  const getCanvasPosition = event => {
    const bounds = canvas.getBoundingClientRect();

    return {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top
    };
  };

  const createPoint = ({
    x,
    y,
    targetX,
    targetY,
    inside,
    columnIndex,
    rowIndex,
    seed
  }) => ({
    x,
    y,
    previousX: x,
    previousY: y,
    targetX,
    targetY,
    inside,
    columnIndex,
    rowIndex,
    seed,

    label:
      labels[
        (columnIndex * 3 + rowIndex * 5) %
        labels.length
      ],

    labelPoint:
      inside &&
      (columnIndex + rowIndex) % 4 === 0,

    radius:
      inside
        ? randomBetween(1.15, 2.25)
        : 0.65,

    opacity:
      inside
        ? randomBetween(0.58, 0.94)
        : 0.035,

    erosion:
      inside
        ? Math.abs(seededWave(seed + 3.14))
        : 1,

    phase: randomBetween(0, Math.PI * 2)
  });

  const buildStructure = () => {
    state.points.length = 0;
    state.columns.length = 0;

    const mobile = state.width < 720;
    const compact = state.width < 980;

    const centerX =
      state.width *
      (mobile ? 0.5 : 0.53);

    const topY =
      mobile ? 138 : 112;

    const bottomY =
      state.height -
      (mobile ? 176 : 118);

    const structureHeight = Math.max(
      290,
      bottomY - topY
    );

    const maximumHalfWidth = Math.min(
      mobile
        ? state.width * 0.34
        : state.width * 0.22,
      mobile ? 155 : 245
    );

    const columnSpacing =
      mobile
        ? 10
        : compact
          ? 11
          : 12;

    const rowSpacing =
      mobile ? 12 : 13;

    const columnCount = Math.max(
      18,
      Math.floor(
        (maximumHalfWidth * 2) /
        columnSpacing
      )
    );

    const rowCount = Math.max(
      24,
      Math.floor(
        structureHeight /
        rowSpacing
      )
    );

    for (
      let columnIndex = 0;
      columnIndex <= columnCount;
      columnIndex += 1
    ) {
      const normalizedX =
        columnIndex / columnCount;

      const targetX =
        centerX +
        (normalizedX - 0.5) *
        maximumHalfWidth *
        2;

      const column = [];

      for (
        let rowIndex = 0;
        rowIndex <= rowCount;
        rowIndex += 1
      ) {
        const normalizedY =
          rowIndex / rowCount;

        const targetY =
          topY +
          normalizedY *
          structureHeight;

        const horizontalRatio =
          Math.abs(targetX - centerX) /
          maximumHalfWidth;

        const inside =
          horizontalRatio <=
          getBoneHalfWidth(normalizedY);

        const seed =
          columnIndex * 101 +
          rowIndex * 17;

        const point = createPoint({
          x: targetX,
          y: targetY,
          targetX,
          targetY,
          inside,
          columnIndex,
          rowIndex,
          seed
        });

        const pointIndex =
          state.points.push(point) - 1;

        column.push(pointIndex);
      }

      state.columns.push({
        anchorX: targetX,
        anchorY: mobile ? 112 : 84,
        points: column,
        phase: randomBetween(
          0,
          Math.PI * 2
        )
      });
    }
  };

  const resizeCanvas = () => {
    const bounds =
      shell.getBoundingClientRect();

    state.width = Math.max(
      1,
      bounds.width
    );

    state.height = Math.max(
      1,
      bounds.height
    );

    state.pixelRatio = Math.min(
      window.devicePixelRatio || 1,
      1.75
    );

    canvas.width = Math.round(
      state.width *
      state.pixelRatio
    );

    canvas.height = Math.round(
      state.height *
      state.pixelRatio
    );

    canvas.style.width =
      `${state.width}px`;

    canvas.style.height =
      `${state.height}px`;

    context.setTransform(
      state.pixelRatio,
      0,
      0,
      state.pixelRatio,
      0,
      0
    );

    state.pointer.x =
      state.width * 0.5;

    state.pointer.y =
      state.height * 0.45;

    state.pointer.previousX =
      state.pointer.x;

    state.pointer.previousY =
      state.pointer.y;

    buildStructure();

    if (prefersReducedMotion) {
      drawScene();
    }
  };

  const startTransition = mode => {
    const targetTissue =
      mode === "plain"
        ? 0
        : 1;

    const targetErosion =
      mode === "resorption"
        ? 1
        : 0;

    const sequenceResorption = (
      mode === "resorption" &&
      state.tissueBlend < 0.35
    );

    state.mode = mode;

    state.transition = {
      active: true,
      elapsed: 0,

      duration:
        sequenceResorption
          ? 1800
          : 1250,

      fromTissue:
        state.tissueBlend,

      toTissue:
        targetTissue,

      fromErosion:
        state.erosionBlend,

      toErosion:
        targetErosion,

      sequenceResorption
    };
  };

  const updateTransition = deltaTime => {
    const transition =
      state.transition;

    if (!transition.active) {
      return;
    }

    transition.elapsed += deltaTime;

    const progress = clamp(
      transition.elapsed /
      transition.duration,
      0,
      1
    );

    if (transition.sequenceResorption) {
      const tissueProgress =
        smoothStep(
          progress / 0.58
        );

      const erosionProgress =
        smoothStep(
          (progress - 0.32) /
          0.68
        );

      state.tissueBlend = mix(
        transition.fromTissue,
        transition.toTissue,
        tissueProgress
      );

      state.erosionBlend = mix(
        transition.fromErosion,
        transition.toErosion,
        erosionProgress
      );
    } else {
      const easedProgress =
        smoothStep(progress);

      state.tissueBlend = mix(
        transition.fromTissue,
        transition.toTissue,
        easedProgress
      );

      state.erosionBlend = mix(
        transition.fromErosion,
        transition.toErosion,
        easedProgress
      );
    }

    if (progress >= 1) {
      state.tissueBlend =
        transition.toTissue;

      state.erosionBlend =
        transition.toErosion;

      transition.active = false;
    }
  };

  const updatePoint = point => {
    const velocityX =
      (point.x - point.previousX) *
      0.925;

    const velocityY =
      (point.y - point.previousY) *
      0.925;

    point.previousX = point.x;
    point.previousY = point.y;

    point.x += velocityX;
    point.y += velocityY + 0.022;
    point.phase += 0.018;

    const restorationStrength =
      mix(
        0.018,
        0.028,
        state.tissueBlend
      ) -
      state.erosionBlend *
      0.018;

    const organicMotion =
      point.inside
        ? Math.sin(
            point.phase +
            point.seed * 0.02
          ) *
          state.tissueBlend *
          0.55
        : 0;

    const targetX =
      point.targetX +
      organicMotion;

    const targetY =
      point.targetY;

    point.x += (
      targetX - point.x
    ) * Math.max(
      0.008,
      restorationStrength
    );

    point.y += (
      targetY - point.y
    ) * Math.max(
      0.008,
      restorationStrength
    );

    if (
      point.inside &&
      state.erosionBlend > 0.001
    ) {
      const erosionThreshold = clamp(
        state.erosionBlend * 1.1,
        0,
        1
      );

      if (
        point.erosion <
        erosionThreshold
      ) {
        const direction =
          point.targetX <
          state.width * 0.53
            ? -1
            : 1;

        const erosionForce = (
          erosionThreshold -
          point.erosion
        ) *
        0.12 *
        state.erosionBlend;

        point.x +=
          direction *
          erosionForce;

        point.y +=
          Math.sin(
            point.phase +
            point.seed
          ) *
          erosionForce *
          0.55;
      }
    }

    if (state.pointer.active) {
      const horizontalDistance =
        point.x -
        state.pointer.x;

      const verticalDistance =
        point.y -
        state.pointer.y;

      const distance =
        Math.hypot(
          horizontalDistance,
          verticalDistance
        );

      const interactionRadius =
        state.pointer.pressed
          ? 145
          : 112;

      if (
        distance > 0 &&
        distance < interactionRadius
      ) {
        const normalizedForce =
          1 -
          distance /
          interactionRadius;

        const pointerSpeed =
          Math.hypot(
            state.pointer.x -
            state.pointer.previousX,

            state.pointer.y -
            state.pointer.previousY
          );

        const force =
          normalizedForce *
          (
            state.pointer.pressed
              ? 3.4
              : 0.62 +
                Math.min(
                  pointerSpeed,
                  20
                ) *
                0.055
          );

        point.x +=
          (
            horizontalDistance /
            distance
          ) *
          force;

        point.y +=
          (
            verticalDistance /
            distance
          ) *
          force;
      }
    }
  };

  const constrainColumn = column => {
    const points = column.points;

    if (!points.length) {
      return;
    }

    const firstPoint =
      state.points[points[0]];

    const anchorDistance =
      Math.hypot(
        firstPoint.x -
        column.anchorX,

        firstPoint.y -
        column.anchorY
      );

    const anchorRestLength =
      Math.max(
        18,
        firstPoint.targetY -
        column.anchorY
      );

    if (anchorDistance > 0) {
      const anchorDifference = (
        anchorDistance -
        anchorRestLength
      ) /
      anchorDistance;

      firstPoint.x -= (
        firstPoint.x -
        column.anchorX
      ) *
      anchorDifference *
      0.62;

      firstPoint.y -= (
        firstPoint.y -
        column.anchorY
      ) *
      anchorDifference *
      0.62;
    }

    for (
      let index = 1;
      index < points.length;
      index += 1
    ) {
      const previousPoint =
        state.points[
          points[index - 1]
        ];

      const currentPoint =
        state.points[
          points[index]
        ];

      const horizontalDistance =
        currentPoint.x -
        previousPoint.x;

      const verticalDistance =
        currentPoint.y -
        previousPoint.y;

      const distance =
        Math.hypot(
          horizontalDistance,
          verticalDistance
        );

      const restLength =
        Math.max(
          8,
          currentPoint.targetY -
          previousPoint.targetY
        );

      if (distance === 0) {
        continue;
      }

      const difference = (
        distance -
        restLength
      ) /
      distance;

      const correctionX =
        horizontalDistance *
        difference *
        0.42;

      const correctionY =
        verticalDistance *
        difference *
        0.42;

      previousPoint.x +=
        correctionX;

      previousPoint.y +=
        correctionY;

      currentPoint.x -=
        correctionX;

      currentPoint.y -=
        correctionY;
    }
  };

  const updateStructure = (
    deltaTime = 1000 / 60
  ) => {
    updateTransition(deltaTime);

    for (const point of state.points) {
      updatePoint(point);
    }

    for (
      let iteration = 0;
      iteration < 2;
      iteration += 1
    ) {
      for (
        const column of
        state.columns
      ) {
        constrainColumn(column);
      }
    }

    state.pointer.previousX += (
      state.pointer.x -
      state.pointer.previousX
    ) *
    0.65;

    state.pointer.previousY += (
      state.pointer.y -
      state.pointer.previousY
    ) *
    0.65;
  };

  const getPointVisibility = point => {
    if (!point.inside) {
      return (
        point.opacity *
        state.tissueBlend *
        0.35
      );
    }

    const tissueVisibility =
      point.opacity *
      state.tissueBlend;

    if (
      state.erosionBlend <= 0.001
    ) {
      return tissueVisibility;
    }

    const erosionThreshold = clamp(
      state.erosionBlend * 1.1,
      0,
      1
    );

    if (
      point.erosion <
      erosionThreshold
    ) {
      const erosionDepth = clamp(
        (
          erosionThreshold -
          point.erosion
        ) *
        3.6,
        0,
        1
      );

      return (
        tissueVisibility *
        (
          1 -
          erosionDepth *
          0.88
        )
      );
    }

    return tissueVisibility;
  };

  const drawPaperDust = () => {
    context.save();

    for (
      let index = 0;
      index < 42;
      index += 1
    ) {
      const x =
        (index * 97.13) %
        state.width;

      const y =
        (index * 53.71) %
        state.height;

      context.beginPath();

      context.arc(
        x,
        y,
        0.55,
        0,
        Math.PI * 2
      );

      context.fillStyle =
        rgba(
          palette.ink,
          0.035
        );

      context.fill();
    }

    context.restore();
  };

  const drawTopScaffold = () => {
    const mobile =
      state.width < 720;

    const left =
      state.width *
      (mobile ? 0.22 : 0.33);

    const right =
      state.width *
      (mobile ? 0.78 : 0.73);

    const y =
      mobile ? 112 : 84;

    context.save();
    context.lineCap = "round";

    context.beginPath();

    context.moveTo(
      left - 16,
      y + 3
    );

    context.quadraticCurveTo(
      state.width * 0.5,
      y - 10,
      right + 16,
      y + 3
    );

    context.strokeStyle =
      rgba(
        palette.primary,
        0.82
      );

    context.lineWidth = 5;
    context.stroke();

    context.beginPath();

    context.moveTo(
      left,
      y - 3
    );

    context.lineTo(
      right,
      y - 3
    );

    context.strokeStyle =
      rgba(
        palette.ink,
        0.72
      );

    context.lineWidth = 2;
    context.stroke();

    context.beginPath();

    context.arc(
      left,
      y - 3,
      4,
      0,
      Math.PI * 2
    );

    context.arc(
      right,
      y - 3,
      4,
      0,
      Math.PI * 2
    );

    context.fillStyle =
      rgba(
        palette.gold,
        0.9
      );

    context.fill();
    context.restore();
  };

  const drawStrings = () => {
    context.save();
    context.lineWidth = 0.45;

    const stringColor = mixColor(
      palette.ink,
      palette.primary,
      state.erosionBlend
    );

    const baseOpacity = mix(
      0.2,
      0.12,
      state.tissueBlend
    );

    const stringOpacity = mix(
      baseOpacity,
      0.16,
      state.erosionBlend
    );

    for (
      const column of
      state.columns
    ) {
      if (!column.points.length) {
        continue;
      }

      const firstPoint =
        state.points[
          column.points[0]
        ];

      context.beginPath();

      context.moveTo(
        column.anchorX,
        column.anchorY
      );

      context.lineTo(
        firstPoint.x,
        firstPoint.y
      );

      for (
        let index = 1;
        index <
        column.points.length;
        index += 1
      ) {
        const point =
          state.points[
            column.points[index]
          ];

        context.lineTo(
          point.x,
          point.y
        );
      }

      context.strokeStyle =
        rgba(
          stringColor,
          stringOpacity
        );

      context.stroke();
    }

    context.restore();
  };

  const drawPoints = () => {
    const modeColor = mixColor(
      palette.ink,
      palette.primary,
      state.erosionBlend
    );

    for (const point of state.points) {
      const visibility =
        getPointVisibility(point);

      if (visibility < 0.018) {
        continue;
      }

      if (
        point.labelPoint &&
        point.inside &&
        visibility > 0.18
      ) {
        const angle =
          Math.atan2(
            point.y -
            point.previousY,

            point.x -
            point.previousX
          ) *
          0.28;

        context.save();

        context.translate(
          point.x,
          point.y
        );

        context.rotate(angle);

        context.font =
          `${
            state.width < 720
              ? 6.5
              : 7.5
          }px Georgia, serif`;

        context.textAlign = "center";
        context.textBaseline = "middle";

        context.fillStyle =
          rgba(
            modeColor,
            visibility * 0.74
          );

        context.fillText(
          point.label,
          0,
          0
        );

        context.restore();
      } else {
        context.beginPath();

        context.arc(
          point.x,
          point.y,
          point.radius,
          0,
          Math.PI * 2
        );

        context.fillStyle =
          rgba(
            point.inside
              ? modeColor
              : palette.ink,

            point.inside
              ? visibility * 0.76
              : visibility
          );

        context.fill();

        if (
          point.inside &&
          point.radius > 1.6
        ) {
          context.beginPath();

          context.arc(
            point.x -
            point.radius * 0.28,

            point.y -
            point.radius * 0.28,

            point.radius * 0.34,
            0,
            Math.PI * 2
          );

          context.fillStyle =
            rgba(
              palette.gold,
              visibility * 0.68
            );

          context.fill();
        }
      }
    }
  };

  const drawPointerField = () => {
    if (!state.pointer.active) {
      return;
    }

    const radius =
      state.pointer.pressed
        ? 145
        : 112;

    const pointerColor =
      mixColor(
        palette.gold,
        palette.primary,
        state.erosionBlend
      );

    const gradient =
      context.createRadialGradient(
        state.pointer.x,
        state.pointer.y,
        0,
        state.pointer.x,
        state.pointer.y,
        radius
      );

    gradient.addColorStop(
      0,
      rgba(
        pointerColor,
        state.pointer.pressed
          ? 0.1
          : 0.055
      )
    );

    gradient.addColorStop(
      1,
      rgba(
        palette.paper,
        0
      )
    );

    context.fillStyle = gradient;

    context.fillRect(
      state.pointer.x - radius,
      state.pointer.y - radius,
      radius * 2,
      radius * 2
    );
  };

  const drawScene = () => {
    context.clearRect(
      0,
      0,
      state.width,
      state.height
    );

    drawPaperDust();
    drawPointerField();
    drawTopScaffold();
    drawStrings();
    drawPoints();
  };

  const settleStructure = iterations => {
    for (
      let index = 0;
      index < iterations;
      index += 1
    ) {
      updateStructure(
        1000 / 60
      );
    }
  };

  const animate = currentTime => {
    if (!state.isVisible) {
      state.animationFrame = null;
      return;
    }

    const elapsed =
      state.lastTime
        ? Math.min(
            currentTime -
            state.lastTime,
            34
          )
        : 1000 / 60;

    state.lastTime =
      currentTime;

    updateStructure(elapsed);
    drawScene();

    state.animationFrame =
      requestAnimationFrame(
        animate
      );
  };

  const startAnimation = () => {
    if (
      prefersReducedMotion ||
      state.animationFrame !== null ||
      !state.isVisible
    ) {
      return;
    }

    state.lastTime = 0;

    state.animationFrame =
      requestAnimationFrame(
        animate
      );
  };

  const stopAnimation = () => {
    if (
      state.animationFrame !== null
    ) {
      cancelAnimationFrame(
        state.animationFrame
      );

      state.animationFrame = null;
    }
  };

  const setMode = mode => {
    if (!modeCopy[mode]) {
      return;
    }

    startTransition(mode);

    for (
      const button of
      modeButtons
    ) {
      const active =
        button.dataset.boneMode ===
        mode;

      button.classList.toggle(
        "is-active",
        active
      );

      button.setAttribute(
        "aria-pressed",
        String(active)
      );
    }

    if (statusTitle) {
      statusTitle.textContent =
        modeCopy[mode].title;
    }

    if (statusText) {
      statusText.textContent =
        modeCopy[mode].text;
    }

    if (prefersReducedMotion) {
      state.tissueBlend =
        mode === "plain"
          ? 0
          : 1;

      state.erosionBlend =
        mode === "resorption"
          ? 1
          : 0;

      state.transition.active =
        false;

      settleStructure(20);
      drawScene();
    }
  };

  const resetStructure = () => {
    state.pointer.pressed = false;

    setMode("plain");
  };

  const createImpulse = (
    x,
    y,
    strength = 12
  ) => {
    for (
      const point of
      state.points
    ) {
      const horizontalDistance =
        point.x - x;

      const verticalDistance =
        point.y - y;

      const distance =
        Math.hypot(
          horizontalDistance,
          verticalDistance
        );

      const radius = 185;

      if (
        distance === 0 ||
        distance >= radius
      ) {
        continue;
      }

      const force =
        (
          1 -
          distance / radius
        ) *
        strength;

      point.x +=
        (
          horizontalDistance /
          distance
        ) *
        force;

      point.y +=
        (
          verticalDistance /
          distance
        ) *
        force;
    }

    if (prefersReducedMotion) {
      drawScene();
    }
  };

  for (
    const button of
    modeButtons
  ) {
    button.addEventListener(
      "click",
      () => {
        setMode(
          button.dataset.boneMode
        );
      }
    );
  }

  resetButton?.addEventListener(
    "click",
    resetStructure
  );

  canvas.addEventListener(
    "pointerenter",
    event => {
      const position =
        getCanvasPosition(event);

      state.pointer.x =
        position.x;

      state.pointer.y =
        position.y;

      state.pointer.previousX =
        position.x;

      state.pointer.previousY =
        position.y;

      state.pointer.active =
        true;
    }
  );

  canvas.addEventListener(
    "pointermove",
    event => {
      const position =
        getCanvasPosition(event);

      state.pointer.x =
        position.x;

      state.pointer.y =
        position.y;

      state.pointer.active =
        true;

      if (
        prefersReducedMotion
      ) {
        drawScene();
      }
    }
  );

  canvas.addEventListener(
    "pointerleave",
    () => {
      state.pointer.active =
        false;

      state.pointer.pressed =
        false;

      if (
        prefersReducedMotion
      ) {
        drawScene();
      }
    }
  );

  canvas.addEventListener(
    "pointerdown",
    event => {
      const position =
        getCanvasPosition(event);

      state.pointer.pressed =
        true;

      state.pointer.x =
        position.x;

      state.pointer.y =
        position.y;

      canvas.setPointerCapture?.(
        event.pointerId
      );

      createImpulse(
        position.x,
        position.y,
        15
      );
    }
  );

  canvas.addEventListener(
    "pointerup",
    event => {
      state.pointer.pressed =
        false;

      canvas.releasePointerCapture?.(
        event.pointerId
      );
    }
  );

  canvas.addEventListener(
    "pointercancel",
    () => {
      state.pointer.pressed =
        false;
    }
  );

  const resizeObserver =
    new ResizeObserver(() => {
      resizeCanvas();
    });

  resizeObserver.observe(shell);

  const visibilityObserver =
    new IntersectionObserver(
      entries => {
        state.isVisible =
          entries[0]?.isIntersecting ??
          true;

        if (state.isVisible) {
          startAnimation();
        } else {
          stopAnimation();
        }
      },
      {
        threshold: 0.02
      }
    );

  visibilityObserver.observe(shell);

  resizeCanvas();
  setMode("plain");

  if (prefersReducedMotion) {
    drawScene();
  } else {
    startAnimation();
  }
})();
