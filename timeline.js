(() => {
  "use strict";

  const root = document.querySelector("[data-journey-timeline]");
  if (!root) return;

  /*
    TIMELINE CONTENT
    Edit the objects below whenever you want to add, remove, or revise milestones.
    Supported categories: origin, education, research, achievement, future.
  */
  const timelineEvents = [
    {
      id: "origin",
      year: "Birth",
      title: "The Beginning",
      location: "Nagasaki, Japan",
      category: "origin",
      chapter: "Origins",
      description:
        "The first point in a journey shaped by movement between cultures, curiosity about living systems, and a growing desire to create meaningful scientific impact.",
      quote:
        "Every ambitious journey begins as a single, quiet point.",
      accent: "#c99127"
    },
    {
      id: "dental-school",
      year: "2014",
      title: "Dental Education Begins",
      location: "Mansoura, Egypt",
      category: "education",
      chapter: "Clinical Foundations",
      description:
        "Dental education connected anatomy, biology, craftsmanship, and responsibility toward patients, creating the clinical foundation that would later shape a research career.",
      quote:
        "Precision in the clinic became precision in the laboratory.",
      institution: "School of Dentistry, Mansoura University",
      status: "Undergraduate training",
      accent: "#8a1f2d"
    },
    {
      id: "dds",
      year: "2020",
      title: "Doctor of Dental Surgery",
      location: "Mansoura, Egypt",
      category: "achievement",
      chapter: "Undergradute Completion",
      description:
        "Graduation from dental school and completed a demanding clinical education and established a strong academic platform for advanced biomedical research.",
      quote:
        "Clinical training supplied the questions that research could answer.",
      institution: "Mansoura University",
      status: "Bachelor of Dental Surgery, DDS",
      accent: "#c99127"
    },
    {
      id: "japanese",
      year: "2020 to 2022",
      title: "Language and Cultural Preparation",
      location: "Saitama, Japan",
      category: "education",
      chapter: "A New Environment",
      description:
        "Intensive Japanese-language study supported academic integration in Japan and strengthened the ability to work across clinical, scientific, and cultural settings.",
      quote:
        "Entering a new scientific culture begins with learning how people communicate.",
      institution: "Toua International Japanese Language School",
      status: "Japanese language study",
      accent: "#64151f"
    },
    {
      id: "utokyo",
      year: "April 2022",
      title: "University of Tokyo PhD Journey",
      location: "Tokyo, Japan",
      category: "research",
      chapter: "Entering Tissue Engineering",
      description:
        "Doctoral training began in Oral and Maxillofacial Surgery and tissue engineering, focused on three-dimensional bone biology, advanced microscopy, and experimentally controllable regeneration models.",
      quote:
        "The question changed from how bone looks to how living bone behaves over time.",
      institution: "The University of Tokyo",
      status: "PhD research",
      accent: "#8a1f2d"
    },
    {
      id: "fbo",
      year: "Doctoral Research",
      title: "Functional Bone Model",
      location: "Tokyo, Japan",
      category: "research",
      chapter: "Building Living Bone",
      description:
        "Development of a 4D platform integrating osteoblast-lineage cells, osteoclast precursors, a self-generated matrix, second harmonic generation imaging, and quantitative analysis.",
      quote:
        "A model becomes powerful when it lets us watch biology unfold instead of only seeing the endpoint.",
      institution: "Tissue Engineering Laboratory",
      status: "Platform development",
      accent: "#64151f"
    },
    {
      id: "imaging",
      year: "Methods Platform",
      title: "Seeing Remodeling in 4D",
      location: "Tokyo, Japan",
      category: "research",
      chapter: "Advanced Imaging",
      description:
        "Two-photon microscopy, SHG collagen visualization, fluorescent cell tracking, tissue clearing, Imaris segmentation, and MATLAB analysis were combined to quantify tissue remodeling longitudinally.",
      quote:
        "Measurement transformed observation into evidence.",
      institution: "The University of Tokyo",
      status: "Quantitative imaging",
      accent: "#8a1f2d"
    },
    {
      id: "defense",
      year: "January 16, 2026",
      title: "Doctoral Defense",
      location: "Tokyo, Japan",
      category: "achievement",
      chapter: "A Major Milestone",
      description:
        "The doctoral research was formally defended, bringing years of experimental work, quantitative analysis, scientific writing, and critical discussion into one defining academic milestone.",
      quote:
        "The defense was not an ending. It proved that the next level had become possible.",
      institution: "The University of Tokyo",
      status: "Defense completed",
      accent: "#c99127"
    },
    {
      id: "jsbm",
      year: "June 19, 2026",
      title: "JSBM Scientific Presentation",
      location: "Tokyo, Japan",
      category: "achievement",
      chapter: "Scientific Communication",
      description:
        "Presentation of the PTH-regulated bone-remodeling work at the 46th Annual Meeting of the Japanese Society for Bone Morphometry connected the project with the wider bone-research community.",
      quote:
        "A scientific result gains strength when it can withstand public discussion.",
      institution: "Japanese Society for Bone Morphometry",
      status: "Oral presentation",
      accent: "#c99127"
    },
    {
      id: "publication",
      year: "2026",
      title: "From Data to Publication",
      location: "International",
      category: "achievement",
      chapter: "Scientific Contribution",
      description:
        "The functional bone model and PTH work advanced through peer review, code archiving, revision, and a clearer account of how exposure patterns regulate remodeling behavior.",
      quote:
        "Research creates value when others can examine, challenge, and build upon it.",
      institution: "Scientific Reports manuscript",
      status: "Revision stage",
      accent: "#8a1f2d"
    },
    {
      id: "graduation",
      year: "March 2027",
      title: "Expected PhD Completion",
      location: "Tokyo, Japan",
      category: "future",
      chapter: "Completing the Doctoral Chapter",
      description:
        "Expected completion of the doctoral degree will consolidate advanced training in tissue engineering, bone biology, longitudinal microscopy, and quantitative analysis.",
      quote:
        "A degree records the training. The next work determines its impact.",
      institution: "The University of Tokyo",
      status: "Expected",
      accent: "#c99127",
      future: true
    },
    {
      id: "postdoc",
      year: "Next Chapter",
      title: "Postdoctoral Expansion",
      location: "International",
      category: "future",
      chapter: "Future",
      description:
        "The next objective is advanced postdoctoral training at the intersection of bone biology, regenerative medicine, osteocyte signaling, biomaterials, and high-resolution longitudinal imaging.",
      quote:
        "The next laboratory should not only extend the work. It should transform its scale and ambition.",
      institution: "Future host laboratory",
      status: "In progress",
      accent: "#8a1f2d",
      future: true
    },
    {
      id: "pi",
      year: "Long-Term Vision",
      title: "Independent Laboratory",
      location: "Global",
      category: "future",
      chapter: "Impact",
      description:
        "An independent research program developing controllable tissue-engineering platforms for regenerative bone medicine by combining multicellular models, molecular signaling, quantitative imaging, and therapeutic translation.",
      quote:
        "The final goal is not simply to join the field, but to define a new direction within it.",
      institution: "Future laboratory",
      status: "Vision",
      accent: "#64151f",
      future: true
    }
  ];

  const stage = document.querySelector("#journeyStage");
  const viewport = document.querySelector("#journeyViewport");
  const overlay = document.querySelector("#journeyDetailOverlay");
  const closeButton = document.querySelector("#journeyCloseDetail");
  const previousButton = document.querySelector("#journeyPrevious");
  const nextButton = document.querySelector("#journeyNext");

  const filterButtons = [
    ...root.querySelectorAll(".journey-filter")
  ];

  if (
    !stage ||
    !viewport ||
    !overlay ||
    !closeButton ||
    !previousButton ||
    !nextButton
  ) {
    return;
  }

  let visibleEvents = [...timelineEvents];
  let activeIndex = 0;
  let currentFilter = "all";
  let lastFocusedNode = null;
  let resizeTimer = null;

  function calculateStageWidth(eventCount) {
    const viewportWidth = Math.max(viewport.clientWidth, 320);
    const cardSpacing = window.innerWidth <= 720 ? 205 : 225;

    return Math.max(
      viewportWidth - 32,
      260 + eventCount * cardSpacing
    );
  }

  function updateProgress() {
    const progress =
      visibleEvents.length <= 1
        ? 100
        : (activeIndex / (visibleEvents.length - 1)) * 100;

    stage.style.setProperty(
      "--journey-progress",
      `${progress}%`
    );
  }

  function setActiveNode(node) {
    stage
      .querySelectorAll(".journey-node.active")
      .forEach((item) => {
        item.classList.remove("active");
      });

    if (node) {
      node.classList.add("active");
    }
  }

  function renderTimeline(category = "all") {
    currentFilter = category;

    visibleEvents =
      category === "all"
        ? [...timelineEvents]
        : timelineEvents.filter(
            (event) => event.category === category
          );

    stage
      .querySelectorAll(".journey-node")
      .forEach((node) => {
        node.remove();
      });

    const stageWidth = calculateStageWidth(
      visibleEvents.length
    );

    const startX = 120;
    const endX = stageWidth - 120;

    const spacing =
      visibleEvents.length > 1
        ? (endX - startX) /
          (visibleEvents.length - 1)
        : 0;

    stage.style.width = `${stageWidth}px`;

    visibleEvents.forEach((event, index) => {
      const node = document.createElement("button");

      node.type = "button";
      node.className =
        `journey-node${event.future ? " future" : ""}`;

      node.style.left =
        `${startX + spacing * index}px`;

      node.style.setProperty(
        "--journey-node-accent",
        event.accent
      );

      node.dataset.eventId = event.id;

      node.setAttribute(
        "aria-label",
        `Open ${event.title}, ${event.year}`
      );

      node.innerHTML = `
        <span
          class="journey-node-dot"
          aria-hidden="true"
        ></span>

        <span class="journey-node-card">
          <span class="journey-node-year">
            ${event.year}
          </span>

          <span class="journey-node-title">
            ${event.title}
          </span>

          <span class="journey-node-location">
            ${event.location}
          </span>
        </span>
      `;

      node.addEventListener("click", () => {
        openDetail(event, node);
      });

      stage.appendChild(node);
    });

    activeIndex = 0;

    setActiveNode(
      stage.querySelector(".journey-node")
    );

    updateProgress();
  }

  function openDetail(event, node) {
    setActiveNode(node);

    lastFocusedNode = node;

    activeIndex = visibleEvents.findIndex(
      (item) => item.id === event.id
    );

    updateProgress();

    const visual = overlay.querySelector(
      ".journey-detail-visual"
    );

    visual.style.setProperty(
      "--journey-detail-accent",
      event.accent
    );

    overlay.querySelector(
      "#journeyDetailYear"
    ).textContent = event.year;

    overlay.querySelector(
      "#journeyDetailChapter"
    ).textContent = event.chapter;

    overlay.querySelector(
      "#journeyDetailTitle"
    ).textContent = event.title;

    overlay.querySelector(
      "#journeyDetailDescription"
    ).textContent = event.description;

    overlay.querySelector(
      "#journeyDetailQuote"
    ).textContent = event.quote;

    overlay.querySelector(
      "#journeyDetailLocation"
    ).textContent = event.location;

    overlay.querySelector(
      "#journeyDetailInstitution"
    ).textContent = event.institution;

    overlay.querySelector(
      "#journeyDetailStatus"
    ).textContent = event.status;

    overlay.classList.add("open");

    overlay.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.style.overflow = "hidden";

    closeButton.focus();
  }

  function closeDetail() {
    overlay.classList.remove("open");

    overlay.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.style.overflow = "";

    if (lastFocusedNode) {
      lastFocusedNode.focus();
    }
  }

  function focusEvent(direction) {
    if (!visibleEvents.length) return;

    activeIndex =
      (
        activeIndex +
        direction +
        visibleEvents.length
      ) % visibleEvents.length;

    const event = visibleEvents[activeIndex];

    const node = stage.querySelector(
      `[data-event-id="${event.id}"]`
    );

    if (!node) return;

    setActiveNode(node);

    node.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest"
    });

    node.focus({
      preventScroll: true
    });

    updateProgress();
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((item) => {
        item.classList.remove("active");
      });

      button.classList.add("active");

      renderTimeline(
        button.dataset.filter || "all"
      );

      viewport.scrollTo({
        left: 0,
        behavior: "smooth"
      });
    });
  });

  previousButton.addEventListener(
    "click",
    () => focusEvent(-1)
  );

  nextButton.addEventListener(
    "click",
    () => focusEvent(1)
  );

  closeButton.addEventListener(
    "click",
    closeDetail
  );

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeDetail();
    }
  });

  document.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Escape" &&
        overlay.classList.contains("open")
      ) {
        closeDetail();
        return;
      }

      if (
        overlay.classList.contains("open")
      ) {
        return;
      }

      if (
        !root.matches(":hover") &&
        !root.contains(document.activeElement)
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        focusEvent(-1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        focusEvent(1);
      }
    }
  );

  let isDragging = false;
  let dragStartX = 0;
  let dragStartScroll = 0;
  let dragDistance = 0;

  viewport.addEventListener(
    "pointerdown",
    (event) => {
      if (
        event.target.closest(".journey-node")
      ) {
        return;
      }

      if (
        event.pointerType === "mouse" &&
        event.button !== 0
      ) {
        return;
      }

      isDragging = true;
      dragStartX = event.clientX;
      dragStartScroll = viewport.scrollLeft;
      dragDistance = 0;

      viewport.classList.add("dragging");

      viewport.setPointerCapture(
        event.pointerId
      );
    }
  );

  viewport.addEventListener(
    "pointermove",
    (event) => {
      if (!isDragging) return;

      const delta =
        event.clientX - dragStartX;

      dragDistance = Math.max(
        dragDistance,
        Math.abs(delta)
      );

      viewport.scrollLeft =
        dragStartScroll - delta;
    }
  );

  function stopDragging(event) {
    if (!isDragging) return;

    isDragging = false;

    viewport.classList.remove("dragging");

    if (
      event &&
      viewport.hasPointerCapture(
        event.pointerId
      )
    ) {
      viewport.releasePointerCapture(
        event.pointerId
      );
    }
  }

  viewport.addEventListener(
    "pointerup",
    stopDragging
  );

  viewport.addEventListener(
    "pointercancel",
    stopDragging
  );

  viewport.addEventListener(
    "lostpointercapture",
    () => {
      isDragging = false;
      viewport.classList.remove("dragging");
    }
  );

  viewport.addEventListener(
    "click",
    (event) => {
      if (dragDistance > 8) {
        event.preventDefault();
        event.stopPropagation();
        dragDistance = 0;
      }
    },
    true
  );

  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);

    resizeTimer = window.setTimeout(
      () => {
        const previousScrollRatio =
          viewport.scrollWidth >
          viewport.clientWidth
            ? viewport.scrollLeft /
              (
                viewport.scrollWidth -
                viewport.clientWidth
              )
            : 0;

        renderTimeline(currentFilter);

        const newScrollableWidth =
          viewport.scrollWidth -
          viewport.clientWidth;

        viewport.scrollLeft = Math.max(
          0,
          newScrollableWidth *
            previousScrollRatio
        );
      },
      160
    );
  });

  renderTimeline();
})();
