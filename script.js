const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".site-nav");

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("open");

    menuButton.setAttribute(
      "aria-expanded",
      isOpen ? "true" : "false"
    );

    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navigation.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation");
    });
  });
}

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const hero = document.querySelector("#hero");
const canvas = document.querySelector("#dna-canvas");

if (hero && canvas) {
  const context = canvas.getContext("2d");
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let animationFrame = null;
  let time = 0;

  const mouse = {
    x: 0,
    y: 0,
    active: false
  };

  const colorVariables = getComputedStyle(document.documentElement);

  const primaryHex = colorVariables
    .getPropertyValue("--primary")
    .trim() || "#8a1f2d";

  const accentHex = colorVariables
    .getPropertyValue("--accent")
    .trim() || "#c99127";

  function hexToRgb(hex) {
    const cleaned = hex.replace("#", "");

    if (cleaned.length !== 6) {
      return {
        r: 138,
        g: 31,
        b: 45
      };
    }

    return {
      r: parseInt(cleaned.substring(0, 2), 16),
      g: parseInt(cleaned.substring(2, 4), 16),
      b: parseInt(cleaned.substring(4, 6), 16)
    };
  }

  const primary = hexToRgb(primaryHex);
  const accent = hexToRgb(accentHex);

  function rgba(color, alpha) {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
  }

  function resizeCanvas() {
    const rectangle = hero.getBoundingClientRect();

    width = Math.max(1, rectangle.width);
    height = Math.max(1, rectangle.height);
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    context.setTransform(
      pixelRatio,
      0,
      0,
      pixelRatio,
      0,
      0
    );
  }

  function getMouseDisplacement(x, y) {
    if (!mouse.active) {
      return {
        x: 0,
        y: 0,
        strength: 0
      };
    }

    const differenceX = x - mouse.x;
    const differenceY = y - mouse.y;
    const distance = Math.sqrt(
      differenceX * differenceX +
      differenceY * differenceY
    );

    const interactionRadius = Math.min(width, 300);

    if (distance >= interactionRadius || distance === 0) {
      return {
        x: 0,
        y: 0,
        strength: 0
      };
    }

    const strength =
      (1 - distance / interactionRadius) * 38;

    return {
      x: differenceX / distance * strength,
      y: differenceY / distance * strength,
      strength
    };
  }

  function drawParticle(x, y, radius, color, glow) {
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);

    context.fillStyle = color;
    context.shadowColor = glow;
    context.shadowBlur = 12;
    context.fill();

    context.shadowBlur = 0;
  }

  function drawDNA() {
    context.clearRect(0, 0, width, height);

    const mobile = width < 720;
    const pairCount = mobile ? 22 : 38;
    const strandWidth = width * 0.94;
    const startX = width * 0.03;
    const centerY = height * 0.49;
    const amplitude = Math.min(
      mobile ? 78 : 125,
      height * 0.22
    );

    const turns = mobile ? 2.2 : 3.2;
    const animationSpeed = reducedMotion ? 0 : time * 0.012;

    const firstStrand = [];
    const secondStrand = [];

    for (let index = 0; index < pairCount; index += 1) {
      const progress = index / (pairCount - 1);
      const x = startX + progress * strandWidth;

      const phase =
        progress * Math.PI * 2 * turns +
        animationSpeed;

      const depth = Math.cos(phase);
      const wave = Math.sin(phase);

      const verticalDrift =
        Math.sin(progress * Math.PI * 2 + animationSpeed * 0.4) *
        18;

      const firstBaseY =
        centerY +
        wave * amplitude +
        verticalDrift;

      const secondBaseY =
        centerY -
        wave * amplitude +
        verticalDrift;

      const firstMouse = getMouseDisplacement(
        x,
        firstBaseY
      );

      const secondMouse = getMouseDisplacement(
        x,
        secondBaseY
      );

      firstStrand.push({
        x: x + firstMouse.x,
        y: firstBaseY + firstMouse.y,
        depth,
        interaction: firstMouse.strength
      });

      secondStrand.push({
        x: x + secondMouse.x,
        y: secondBaseY + secondMouse.y,
        depth: -depth,
        interaction: secondMouse.strength
      });
    }

    context.lineCap = "round";
    context.lineJoin = "round";

    for (let index = 0; index < pairCount; index += 1) {
      const firstPoint = firstStrand[index];
      const secondPoint = secondStrand[index];

      const depthOpacity =
        0.08 +
        Math.abs(firstPoint.depth) * 0.11;

      context.beginPath();
      context.moveTo(firstPoint.x, firstPoint.y);
      context.lineTo(secondPoint.x, secondPoint.y);

      context.strokeStyle = rgba(accent, depthOpacity);
      context.lineWidth =
        1 +
        Math.abs(firstPoint.depth) * 1.2;

      context.stroke();

      if (index < pairCount - 1) {
        const nextFirst = firstStrand[index + 1];
        const nextSecond = secondStrand[index + 1];

        context.beginPath();
        context.moveTo(firstPoint.x, firstPoint.y);
        context.lineTo(nextFirst.x, nextFirst.y);

        context.strokeStyle = rgba(primary, 0.25);
        context.lineWidth = 1.5;
        context.stroke();

        context.beginPath();
        context.moveTo(secondPoint.x, secondPoint.y);
        context.lineTo(nextSecond.x, nextSecond.y);

        context.strokeStyle = rgba(accent, 0.24);
        context.lineWidth = 1.5;
        context.stroke();
      }
    }

    firstStrand.forEach((point, index) => {
      const depthScale = 0.75 + (point.depth + 1) * 0.22;
      const interactionScale = point.interaction * 0.035;

      const firstRadius =
        (mobile ? 3.2 : 4.4) *
        depthScale +
        interactionScale;

      drawParticle(
        point.x,
        point.y,
        firstRadius,
        rgba(primary, 0.65),
        rgba(primary, 0.35)
      );

      const secondPoint = secondStrand[index];
      const secondDepthScale =
        0.75 +
        (secondPoint.depth + 1) * 0.22;

      const secondRadius =
        (mobile ? 3.2 : 4.4) *
        secondDepthScale +
        secondPoint.interaction * 0.035;

      drawParticle(
        secondPoint.x,
        secondPoint.y,
        secondRadius,
        rgba(accent, 0.62),
        rgba(accent, 0.32)
      );
    });
  }

  function animate() {
    time += 1;
    drawDNA();

    if (!reducedMotion) {
      animationFrame = requestAnimationFrame(animate);
    }
  }

  function handlePointerMove(event) {
    const rectangle = hero.getBoundingClientRect();

    mouse.x = event.clientX - rectangle.left;
    mouse.y = event.clientY - rectangle.top;
    mouse.active = true;

    if (reducedMotion) {
      drawDNA();
    }
  }

  function handlePointerLeave() {
    mouse.active = false;

    if (reducedMotion) {
      drawDNA();
    }
  }

  hero.addEventListener(
    "pointermove",
    handlePointerMove
  );

  hero.addEventListener(
    "pointerleave",
    handlePointerLeave
  );

  const resizeObserver = new ResizeObserver(() => {
    resizeCanvas();
    drawDNA();
  });

  resizeObserver.observe(hero);

  resizeCanvas();

  if (reducedMotion) {
    drawDNA();
  } else {
    animate();
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      animationFrame = null;
    } else if (!reducedMotion && !animationFrame) {
      animate();
    }
  });
}
