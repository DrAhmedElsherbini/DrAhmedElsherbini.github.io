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
    formation: {
      title: "Formation",
      text: "Osteoblast-associated elements gather and stabilize the matrix."
    },
    resorption: {
      title: "Resorption",
      text: "Selected regions loosen and open as the tissue structure is remodeled."
    }
  };

  const state = {
    width: 0,
    height: 0,
    pixelRatio: 1,
    points: [],
    columns: [],
    mode: "formation",
    modeProgress: 1,
    animationFrame: null,
    lastTime: 0,
    isVisible: true,
    pointer: {
      x: 0,
      y: 0,
      previousX: 0,
      previousY: 0,
      active: false,
      pressed: false,
      strength: 0
    }
  };

  const rgba = (color, alpha) => (
    `rgba(${color.red}, ${color.green}, ${color.blue}, ${alpha})`
  );

  const clamp = (value, minimum, maximum) => (
    Math.max(minimum, Math.min(maximum, value))
  );

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

    const shaft = 0.105 + Math.sin(normalizedY * Math.PI) * 0.025;

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
    label: labels[(columnIndex * 3 + rowIndex * 5) % labels.length],
    labelPoint: inside && (columnIndex + rowIndex) % 4 === 0,
    radius: inside ? randomBetween(1.15, 2.25) : 0.65,
    opacity: inside ? randomBetween(0.58, 0.94) : 0.035,
    erosion: inside ? Math.abs(seededWave(seed + 3.14)) : 1,
    phase: randomBetween(0, Math.PI * 2)
  });

  const buildStructure = () => {
    state.points.length = 0;
    state.columns.length = 0;

    const mobile = state.width < 720;
    const compact = state.width < 980;

    const centerX = state.width * (mobile ? 0.5 : 0.53);
    const topY = mobile ? 138 : 112;
    const bottomY = state.height - (mobile ? 176 : 118);
    const structureHeight = Math.max(290, bottomY - topY);
    const maximumHalfWidth = Math.min(
      mobile ? state.width * 0.34 : state.width * 0.22,
      mobile ? 155 : 245
    );

    const columnSpacing = mobile ? 10 : compact ? 11 : 12;
    const rowSpacing = mobile ? 12 : 13;
    const columnCount = Math.max(
      18,
      Math.floor((maximumHalfWidth * 2) / columnSpacing)
    );
    const rowCount = Math.max(
      24,
      Math.floor(structureHeight / rowSpacing)
    );

    for (let columnIndex = 0; columnIndex <= columnCount; columnIndex += 1) {
      const normalizedX = columnIndex / columnCount;
      const targetX = centerX + (normalizedX - 0.5) * maximumHalfWidth * 2;
      const column = [];

      for (let rowIndex = 0; rowIndex <= rowCount; rowIndex += 1) {
        const normalizedY = rowIndex / rowCount;
        const targetY = topY + normalizedY * structureHeight;
        const horizontalRatio = Math.abs(targetX - centerX) / maximumHalfWidth;
        const inside = horizontalRatio <= getBoneHalfWidth(normalizedY);
        const seed = columnIndex * 101 + rowIndex * 17;
        const scatteredDistance = inside ? randomBetween(18, 70) : randomBetween(2, 15);
        const scatteredAngle = randomBetween(0, Math.PI * 2);

        const point = createPoint({
          x: targetX + Math.cos(scatteredAngle) * scatteredDistance,
          y: targetY + Math.sin(scatteredAngle) * scatteredDistance,
          targetX,
          targetY,
          inside,
          columnIndex,
          rowIndex,
          seed
        });

        const pointIndex = state.points.push(point) - 1;
        column.push(pointIndex);
      }

      state.columns.push({
        anchorX: targetX,
        anchorY: mobile ? 112 : 84,
        points: column,
        phase: randomBetween(0, Math.PI * 2)
      });
    }

    state.modeProgress = 0;
  };

  const resizeCanvas = () => {
    const bounds = shell.getBoundingClientRect();

    state.width = Math.max(1, bounds.width);
    state.height = Math.max(1, bounds.height);
    state.pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);

    canvas.width = Math.round(state.width * state.pixelRatio);
    canvas.height = Math.round(state.height * state.pixelRatio);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;

    context.setTransform(
      state.pixelRatio,
      0,
      0,
      state.pixelRatio,
      0,
      0
    );

    state.pointer.x = state.width * 0.5;
    state.pointer.y = state.height * 0.45;
    state.pointer.previousX = state.pointer.x;
    state.pointer.previousY = state.pointer.y;

    buildStructure();

    if (prefersReducedMotion) {
      settleStructure(90);
      drawScene();
    }
  };

  const updatePoint = point => {
    const velocityX = (point.x - point.previousX) * 0.925;
    const velocityY = (point.y - point.previousY) * 0.925;

    point.previousX = point.x;
    point.previousY = point.y;

    point.x += velocityX;
    point.y += velocityY + 0.022;
    point.phase += 0.018;

    const formationStrength = state.mode === "formation" ? 0.027 : 0.0085;
    const restorationBoost = 0.55 + state.modeProgress * 0.45;
    const targetStrength = formationStrength * restorationBoost;

    if (point.inside) {
      point.x += (point.targetX - point.x) * targetStrength;
      point.y += (point.targetY - point.y) * targetStrength;
    } else {
      point.x += (point.targetX - point.x) * 0.012;
      point.y += (point.targetY - point.y) * 0.012;
    }

    if (state.mode === "resorption" && point.inside) {
      const erosionThreshold = clamp(
        state.modeProgress * 1.1,
        0,
        1
      );

      if (point.erosion < erosionThreshold) {
        const direction = point.targetX < state.width * 0.53 ? -1 : 1;
        const erosionForce = (erosionThreshold - point.erosion) * 0.12;

        point.x += direction * erosionForce;
        point.y += Math.sin(point.phase + point.seed) * erosionForce * 0.55;
      }
    }

    if (state.pointer.active) {
      const horizontalDistance = point.x - state.pointer.x;
      const verticalDistance = point.y - state.pointer.y;
      const distance = Math.hypot(horizontalDistance, verticalDistance);
      const interactionRadius = state.pointer.pressed ? 145 : 112;

      if (distance > 0 && distance < interactionRadius) {
        const normalizedForce = 1 - distance / interactionRadius;
        const pointerSpeed = Math.hypot(
          state.pointer.x - state.pointer.previousX,
          state.pointer.y - state.pointer.previousY
        );

        const force = normalizedForce * (
          state.pointer.pressed
            ? 3.4
            : 0.62 + Math.min(pointerSpeed, 20) * 0.055
        );

        point.x += (horizontalDistance / distance) * force;
        point.y += (verticalDistance / distance) * force;
      }
    }
  };

  const constrainColumn = column => {
    const points = column.points;

    if (!points.length) {
      return;
    }

    const firstPoint = state.points[points[0]];
    const anchorDistance = Math.hypot(
      firstPoint.x - column.anchorX,
      firstPoint.y - column.anchorY
    );

    const anchorRestLength = Math.max(18, firstPoint.targetY - column.anchorY);

    if (anchorDistance > 0) {
      const anchorDifference = (anchorDistance - anchorRestLength) / anchorDistance;
      firstPoint.x -= (firstPoint.x - column.anchorX) * anchorDifference * 0.62;
      firstPoint.y -= (firstPoint.y - column.anchorY) * anchorDifference * 0.62;
    }

    for (let index = 1; index < points.length; index += 1) {
      const previousPoint = state.points[points[index - 1]];
      const currentPoint = state.points[points[index]];
      const horizontalDistance = currentPoint.x - previousPoint.x;
      const verticalDistance = currentPoint.y - previousPoint.y;
      const distance = Math.hypot(horizontalDistance, verticalDistance);
      const restLength = Math.max(8, currentPoint.targetY - previousPoint.targetY);

      if (distance === 0) {
        continue;
      }

      const difference = (distance - restLength) / distance;
      const correctionX = horizontalDistance * difference * 0.42;
      const correctionY = verticalDistance * difference * 0.42;

      previousPoint.x += correctionX;
      previousPoint.y += correctionY;
      currentPoint.x -= correctionX;
      currentPoint.y -= correctionY;
    }
  };

  const updateStructure = () => {
    state.modeProgress = clamp(state.modeProgress + 0.006, 0, 1);

    for (const point of state.points) {
      updatePoint(point);
    }

    for (let iteration = 0; iteration < 2; iteration += 1) {
      for (const column of state.columns) {
        constrainColumn(column);
      }
    }

    state.pointer.previousX += (
      state.pointer.x - state.pointer.previousX
    ) * 0.65;

    state.pointer.previousY += (
      state.pointer.y - state.pointer.previousY
    ) * 0.65;
  };

  const getPointVisibility = point => {
    if (!point.inside) {
      return point.opacity;
    }

    if (state.mode === "formation") {
      return point.opacity * (0.45 + state.modeProgress * 0.55);
    }

    const erosionThreshold = clamp(state.modeProgress * 1.1, 0, 1);

    if (point.erosion < erosionThreshold) {
      const erosionDepth = clamp(
        (erosionThreshold - point.erosion) * 3.6,
        0,
        1
      );

      return point.opacity * (1 - erosionDepth * 0.88);
    }

    return point.opacity;
  };

  const drawPaperDust = () => {
    context.save();

    for (let index = 0; index < 42; index += 1) {
      const x = (index * 97.13) % state.width;
      const y = (index * 53.71) % state.height;

      context.beginPath();
      context.arc(x, y, 0.55, 0, Math.PI * 2);
      context.fillStyle = rgba(palette.ink, 0.035);
      context.fill();
    }

    context.restore();
  };

  const drawTopScaffold = () => {
    const mobile = state.width < 720;
    const left = state.width * (mobile ? 0.22 : 0.33);
    const right = state.width * (mobile ? 0.78 : 0.73);
    const y = mobile ? 112 : 84;

    context.save();
    context.lineCap = "round";

    context.beginPath();
    context.moveTo(left - 16, y + 3);
    context.quadraticCurveTo(
      state.width * 0.5,
      y - 10,
      right + 16,
      y + 3
    );
    context.strokeStyle = rgba(palette.primary, 0.82);
    context.lineWidth = 5;
    context.stroke();

    context.beginPath();
    context.moveTo(left, y - 3);
    context.lineTo(right, y - 3);
    context.strokeStyle = rgba(palette.ink, 0.72);
    context.lineWidth = 2;
    context.stroke();

    context.beginPath();
    context.arc(left, y - 3, 4, 0, Math.PI * 2);
    context.arc(right, y - 3, 4, 0, Math.PI * 2);
    context.fillStyle = rgba(palette.gold, 0.9);
    context.fill();

    context.restore();
  };

  const drawStrings = () => {
    context.save();
    context.lineWidth = 0.45;

    for (const column of state.columns) {
      if (!column.points.length) {
        continue;
      }

      const firstPoint = state.points[column.points[0]];

      context.beginPath();
      context.moveTo(column.anchorX, column.anchorY);
      context.lineTo(firstPoint.x, firstPoint.y);

      for (let index = 1; index < column.points.length; index += 1) {
        const point = state.points[column.points[index]];
        context.lineTo(point.x, point.y);
      }

      context.strokeStyle = rgba(
        state.mode === "formation" ? palette.ink : palette.primary,
        state.mode === "formation" ? 0.12 : 0.16
      );
      context.stroke();
    }

    context.restore();
  };

  const drawPoints = () => {
    const modeColor = state.mode === "formation"
      ? palette.ink
      : palette.primary;

    for (const point of state.points) {
      const visibility = getPointVisibility(point);

      if (visibility < 0.018) {
        continue;
      }

      if (point.labelPoint && point.inside && visibility > 0.18) {
        const angle = Math.atan2(
          point.y - point.previousY,
          point.x - point.previousX
        ) * 0.28;

        context.save();
        context.translate(point.x, point.y);
        context.rotate(angle);
        context.font = `${state.width < 720 ? 6.5 : 7.5}px Georgia, serif`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = rgba(modeColor, visibility * 0.74);
        context.fillText(point.label, 0, 0);
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

        context.fillStyle = rgba(
          point.inside
            ? (state.mode === "formation" ? palette.ink : palette.primary)
            : palette.ink,
          point.inside ? visibility * 0.76 : visibility
        );
        context.fill();

        if (point.inside && point.radius > 1.6) {
          context.beginPath();
          context.arc(
            point.x - point.radius * 0.28,
            point.y - point.radius * 0.28,
            point.radius * 0.34,
            0,
            Math.PI * 2
          );
          context.fillStyle = rgba(palette.gold, visibility * 0.68);
          context.fill();
        }
      }
    }
  };

  const drawPointerField = () => {
    if (!state.pointer.active) {
      return;
    }

    const radius = state.pointer.pressed ? 145 : 112;
    const gradient = context.createRadialGradient(
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
        state.mode === "formation" ? palette.gold : palette.primary,
        state.pointer.pressed ? 0.1 : 0.055
      )
    );
    gradient.addColorStop(1, rgba(palette.paper, 0));

    context.fillStyle = gradient;
    context.fillRect(
      state.pointer.x - radius,
      state.pointer.y - radius,
      radius * 2,
      radius * 2
    );
  };

  const drawScene = () => {
    context.clearRect(0, 0, state.width, state.height);
    drawPaperDust();
    drawPointerField();
    drawTopScaffold();
    drawStrings();
    drawPoints();
  };

  const settleStructure = iterations => {
    for (let index = 0; index < iterations; index += 1) {
      updateStructure();
    }
  };

  const animate = currentTime => {
    if (!state.isVisible) {
      state.animationFrame = null;
      return;
    }

    const elapsed = currentTime - state.lastTime;

    if (elapsed >= 1000 / 60) {
      state.lastTime = currentTime;
      updateStructure();
      drawScene();
    }

    state.animationFrame = requestAnimationFrame(animate);
  };

  const startAnimation = () => {
    if (
      prefersReducedMotion ||
      state.animationFrame !== null ||
      !state.isVisible
    ) {
      return;
    }

    state.animationFrame = requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    if (state.animationFrame !== null) {
      cancelAnimationFrame(state.animationFrame);
      state.animationFrame = null;
    }
  };

  const setMode = mode => {
    if (!modeCopy[mode]) {
      return;
    }

    state.mode = mode;
    state.modeProgress = 0;

    for (const button of modeButtons) {
      const active = button.dataset.boneMode === mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    }

    if (statusTitle) {
      statusTitle.textContent = modeCopy[mode].title;
    }

    if (statusText) {
      statusText.textContent = modeCopy[mode].text;
    }

    if (prefersReducedMotion) {
      settleStructure(75);
      drawScene();
    }
  };

  const resetStructure = () => {
    buildStructure();
    setMode("formation");

    if (prefersReducedMotion) {
      settleStructure(90);
      drawScene();
    }
  };

  const createImpulse = (x, y, strength = 12) => {
    for (const point of state.points) {
      const horizontalDistance = point.x - x;
      const verticalDistance = point.y - y;
      const distance = Math.hypot(horizontalDistance, verticalDistance);
      const radius = 185;

      if (distance === 0 || distance >= radius) {
        continue;
      }

      const force = (1 - distance / radius) * strength;

      point.x += (horizontalDistance / distance) * force;
      point.y += (verticalDistance / distance) * force;
    }

    if (prefersReducedMotion) {
      drawScene();
    }
  };

  for (const button of modeButtons) {
    button.addEventListener("click", () => {
      setMode(button.dataset.boneMode);
    });
  }

  resetButton?.addEventListener("click", resetStructure);

  canvas.addEventListener("pointerenter", event => {
    const position = getCanvasPosition(event);

    state.pointer.x = position.x;
    state.pointer.y = position.y;
    state.pointer.previousX = position.x;
    state.pointer.previousY = position.y;
    state.pointer.active = true;
  });

  canvas.addEventListener("pointermove", event => {
    const position = getCanvasPosition(event);

    state.pointer.x = position.x;
    state.pointer.y = position.y;
    state.pointer.active = true;

    if (prefersReducedMotion) {
      drawScene();
    }
  });

  canvas.addEventListener("pointerleave", () => {
    state.pointer.active = false;
    state.pointer.pressed = false;

    if (prefersReducedMotion) {
      drawScene();
    }
  });

  canvas.addEventListener("pointerdown", event => {
    const position = getCanvasPosition(event);

    state.pointer.pressed = true;
    state.pointer.x = position.x;
    state.pointer.y = position.y;

    canvas.setPointerCapture?.(event.pointerId);
    createImpulse(position.x, position.y, 15);
  });

  canvas.addEventListener("pointerup", event => {
    state.pointer.pressed = false;
    canvas.releasePointerCapture?.(event.pointerId);
  });

  canvas.addEventListener("pointercancel", () => {
    state.pointer.pressed = false;
  });

  const resizeObserver = new ResizeObserver(() => {
    resizeCanvas();
  });

  resizeObserver.observe(shell);

  const visibilityObserver = new IntersectionObserver(
    entries => {
      state.isVisible = entries[0]?.isIntersecting ?? true;

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
  setMode("formation");

  if (prefersReducedMotion) {
    settleStructure(90);
    drawScene();
  } else {
    startAnimation();
  }
})();
