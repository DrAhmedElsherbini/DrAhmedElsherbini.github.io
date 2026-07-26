/*
  TIMELINE CONTENT
  Edit only the data below to replace the demo milestones with your real story.
  Categories supported by the filter bar:
  origin, education, research, achievement, future
*/
const timelineEvents = [
  {
    id: "origin",
    year: "Birth",
    order: 1,
    title: "The Beginning",
    location: "Nagasaki, Japan",
    category: "origin",
    chapter: "Origins",
    description: "The first point in a journey shaped by movement between cultures, curiosity about living systems, and a growing desire to create meaningful scientific impact.",
    quote: "Every ambitious journey begins as a single, quiet point.",
    institution: "Personal history",
    status: "Foundation",
    accent: "#d9b86c"
  },
  {
    id: "school",
    year: "Early Years",
    order: 2,
    title: "Curiosity Takes Form",
    location: "Egypt",
    category: "education",
    chapter: "Foundations",
    description: "School years built the habits that later became central to research: persistence, close observation, disciplined learning, and an interest in understanding how complex systems work.",
    quote: "Curiosity became a method rather than a passing interest.",
    institution: "Early education",
    status: "Growth",
    accent: "#70d8ff"
  },
  {
    id: "dentistry",
    year: "Dental School",
    order: 3,
    title: "Becoming a Clinician",
    location: "Egypt",
    category: "education",
    chapter: "Clinical Formation",
    description: "Dental training connected anatomy, biology, craftsmanship, and responsibility toward patients. Graduating with Excellence and Honor established a strong clinical and academic foundation.",
    quote: "Precision in the clinic became precision in the laboratory.",
    institution: "Faculty of Dentistry",
    status: "Excellence & Honor",
    accent: "#9ee3c2"
  },
  {
    id: "tokyo",
    year: "PhD Journey",
    order: 4,
    title: "University of Tokyo",
    location: "Tokyo, Japan",
    category: "research",
    chapter: "Entering Tissue Engineering",
    description: "A new chapter began in Oral and Maxillofacial Surgery and tissue engineering, focused on three-dimensional bone biology, advanced imaging, and experimentally controllable regeneration models.",
    quote: "The question changed from how bone looks to how living bone behaves over time.",
    institution: "The University of Tokyo",
    status: "Doctoral research",
    accent: "#70d8ff"
  },
  {
    id: "fbm",
    year: "Research Core",
    order: 5,
    title: "Functional Bone Model",
    location: "Tokyo, Japan",
    category: "research",
    chapter: "Building Living Bone",
    description: "Development of a longitudinal three-dimensional platform integrating osteoblast lineage cells, osteoclast precursors, self-generated matrix, second harmonic generation imaging, and quantitative analysis.",
    quote: "A model becomes powerful when it lets us watch biology unfold instead of only seeing the endpoint.",
    institution: "Tissue Engineering Laboratory",
    status: "Platform development",
    accent: "#d9b86c"
  },
  {
    id: "imaging",
    year: "Methods",
    order: 6,
    title: "Seeing Remodeling in 4D",
    location: "Tokyo, Japan",
    category: "research",
    chapter: "Advanced Imaging",
    description: "Two-photon microscopy, SHG collagen visualization, fluorescent cell tracking, Imaris segmentation, and MATLAB analysis were combined to quantify resorption, reformation, and cellular morphology longitudinally.",
    quote: "Measurement transformed observation into evidence.",
    institution: "University of Tokyo",
    status: "Quantitative imaging",
    accent: "#b4a5ff"
  },
  {
    id: "defense",
    year: "January 2026",
    order: 7,
    title: "Doctoral Defense",
    location: "Tokyo, Japan",
    category: "achievement",
    chapter: "A Major Milestone",
    description: "The doctoral research was formally defended, bringing years of experimental work, analysis, scientific writing, and critical discussion into one defining academic milestone.",
    quote: "The defense was not an ending. It was proof that the next level had become possible.",
    institution: "The University of Tokyo",
    status: "Defense completed",
    accent: "#d9b86c"
  },
  {
    id: "publication",
    year: "2026",
    order: 8,
    title: "Scientific Contribution",
    location: "International",
    category: "achievement",
    chapter: "From Data to Knowledge",
    description: "The PTH and functional bone model work advanced toward publication, supported by reproducible code, careful revision, and a clearer account of how exposure patterns regulate remodeling behavior.",
    quote: "Research creates value only when others can examine, challenge, and build upon it.",
    institution: "Scientific Reports submission",
    status: "Revision stage",
    accent: "#9ee3c2"
  },
  {
    id: "postdoc",
    year: "Next Chapter",
    order: 9,
    title: "Postdoctoral Expansion",
    location: "International",
    category: "future",
    chapter: "Future",
    description: "The next objective is advanced postdoctoral training at the intersection of bone biology, regenerative medicine, osteocyte signaling, biomaterials, and high-resolution longitudinal imaging.",
    quote: "The next laboratory should not only extend the work. It should transform its scale and ambition.",
    institution: "Future host laboratory",
    status: "In progress",
    accent: "#70d8ff",
    future: true
  },
  {
    id: "pi",
    year: "Long-Term Vision",
    order: 10,
    title: "Independent Laboratory",
    location: "Global",
    category: "future",
    chapter: "Impact",
    description: "An independent research program developing controllable tissue-engineering platforms for regenerative bone medicine, combining multicellular models, molecular signaling, quantitative imaging, and therapeutic translation.",
    quote: "The final goal is not simply to join the field, but to define a new direction within it.",
    institution: "Future laboratory",
    status: "Vision",
    accent: "#d9b86c",
    future: true
  }
];

const stage = document.querySelector("#timelineStage");
const viewport = document.querySelector("#timelineViewport");
const overlay = document.querySelector("#detailOverlay");
const closeButton = document.querySelector("#closeDetail");
const filterButtons = [...document.querySelectorAll(".filter-button")];
const previousButton = document.querySelector("#previousEvent");
const nextButton = document.querySelector("#nextEvent");

let visibleEvents = [...timelineEvents];
let activeIndex = 0;
let lastFocusedNode = null;

function renderTimeline(category = "all") {
  visibleEvents = category === "all"
    ? [...timelineEvents]
    : timelineEvents.filter(event => event.category === category);

  stage.querySelectorAll(".timeline-node").forEach(node => node.remove());

  const startX = 110;
  const endX = 1770;
  const spacing = visibleEvents.length > 1 ? (endX - startX) / (visibleEvents.length - 1) : 0;

  visibleEvents.forEach((event, index) => {
    const node = document.createElement("button");
    node.type = "button";
    node.className = `timeline-node${event.future ? " future" : ""}`;
    node.style.left = `${startX + spacing * index}px`;
    node.style.setProperty("--node-accent", event.accent);
    node.setAttribute("aria-label", `Open ${event.title}, ${event.year}`);
    node.dataset.eventId = event.id;

    node.innerHTML = `
      <span class="node-dot" aria-hidden="true"></span>
      <span class="node-card">
        <span class="node-year">${event.year}</span>
        <span class="node-title">${event.title}</span>
        <span class="node-location">${event.location}</span>
      </span>
    `;

    node.addEventListener("click", () => openDetail(event, node));
    stage.appendChild(node);
  });

  activeIndex = 0;
  updateProgress();
}

function openDetail(event, node) {
  document.querySelectorAll(".timeline-node.active").forEach(item => item.classList.remove("active"));
  node.classList.add("active");
  lastFocusedNode = node;
  activeIndex = visibleEvents.findIndex(item => item.id === event.id);
  updateProgress();

  overlay.style.setProperty("--detail-accent", event.accent);
  overlay.querySelector("#detailYear").textContent = event.year;
  overlay.querySelector("#detailChapter").textContent = event.chapter;
  overlay.querySelector("#detailTitle").textContent = event.title;
  overlay.querySelector("#detailDescription").textContent = event.description;
  overlay.querySelector("#detailQuote").textContent = event.quote;
  overlay.querySelector("#detailLocation").textContent = event.location;
  overlay.querySelector("#detailInstitution").textContent = event.institution;
  overlay.querySelector("#detailStatus").textContent = event.status;

  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  closeButton.focus();
}

function closeDetail() {
  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (lastFocusedNode) lastFocusedNode.focus();
}

function updateProgress() {
  const progress = visibleEvents.length <= 1 ? 100 : (activeIndex / (visibleEvents.length - 1)) * 100;
  stage.style.setProperty("--progress", `${progress}%`);
}

function focusEvent(direction) {
  if (!visibleEvents.length) return;
  activeIndex = (activeIndex + direction + visibleEvents.length) % visibleEvents.length;
  const event = visibleEvents[activeIndex];
  const node = stage.querySelector(`[data-event-id="${event.id}"]`);
  node.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  node.focus({ preventScroll: true });
  document.querySelectorAll(".timeline-node.active").forEach(item => item.classList.remove("active"));
  node.classList.add("active");
  updateProgress();
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    renderTimeline(button.dataset.filter);
    viewport.scrollTo({ left: 0, behavior: "smooth" });
  });
});

previousButton.addEventListener("click", () => focusEvent(-1));
nextButton.addEventListener("click", () => focusEvent(1));
closeButton.addEventListener("click", closeDetail);

overlay.addEventListener("click", event => {
  if (event.target === overlay) closeDetail();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && overlay.classList.contains("open")) closeDetail();
  if (!overlay.classList.contains("open") && event.key === "ArrowRight") focusEvent(1);
  if (!overlay.classList.contains("open") && event.key === "ArrowLeft") focusEvent(-1);
});

let isDragging = false;
let dragStartX = 0;
let scrollStart = 0;

viewport.addEventListener("pointerdown", event => {
  if (event.target.closest(".timeline-node")) return;
  isDragging = true;
  dragStartX = event.clientX;
  scrollStart = viewport.scrollLeft;
  viewport.classList.add("dragging");
  viewport.setPointerCapture(event.pointerId);
});

viewport.addEventListener("pointermove", event => {
  if (!isDragging) return;
  viewport.scrollLeft = scrollStart - (event.clientX - dragStartX);
});

function endDrag(event) {
  if (!isDragging) return;
  isDragging = false;
  viewport.classList.remove("dragging");
  if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
}

viewport.addEventListener("pointerup", endDrag);
viewport.addEventListener("pointercancel", endDrag);

renderTimeline();
