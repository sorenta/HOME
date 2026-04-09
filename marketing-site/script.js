const locale = document.documentElement.lang.startsWith("en") ? "en" : "lv";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const topbar = document.getElementById("topbar");
const menuToggle = document.getElementById("menu-toggle");
const topnav = document.getElementById("topnav");
const topnavLinks = Array.from(document.querySelectorAll(".topnav a[href^='#']"));

if (topbar) {
  const syncTopbarShadow = () => {
    topbar.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  syncTopbarShadow();
  window.addEventListener("scroll", syncTopbarShadow, { passive: true });
}

if (topbar && menuToggle && topnav) {
  const menuLabels =
    locale === "en"
      ? { open: "Open menu", close: "Close menu" }
      : { open: "Atvērt izvēlni", close: "Aizvērt izvēlni" };

  const setMenuState = (isOpen) => {
    topbar.classList.toggle("is-menu-open", isOpen);
    document.body.classList.toggle("is-menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? menuLabels.close : menuLabels.open);
  };

  setMenuState(false);

  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") !== "true";
    setMenuState(open);
  });

  topnav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Node)) return;
    if (!topbar.contains(event.target)) {
      setMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuState(false);
    }
  });

  const mobileQuery = window.matchMedia("(max-width: 720px)");
  const closeOnDesktop = (event) => {
    if (!event.matches) {
      setMenuState(false);
    }
  };

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", closeOnDesktop);
  } else {
    mobileQuery.addListener(closeOnDesktop);
  }
}

if (topnavLinks.length > 0) {
  const linkBySection = new Map(
    topnavLinks
      .map((link) => {
        const id = link.getAttribute("href")?.replace(/^#/, "");
        return id ? [id, link] : null;
      })
      .filter(Boolean),
  );

  const observedSections = Array.from(linkBySection.keys())
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const setActiveNavLink = (activeId) => {
    linkBySection.forEach((link, id) => {
      link.classList.toggle("is-active", id === activeId);
    });
  };

  if (window.location.hash) {
    setActiveNavLink(window.location.hash.replace(/^#/, ""));
  } else if (observedSections[0]?.id) {
    setActiveNavLink(observedSections[0].id);
  }

  if ("IntersectionObserver" in window && observedSections.length > 0) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries[0]?.target.id) {
          setActiveNavLink(visibleEntries[0].target.id);
        }
      },
      {
        threshold: [0.2, 0.35, 0.55],
        rootMargin: "-20% 0px -55% 0px",
      },
    );

    observedSections.forEach((section) => navObserver.observe(section));
  }
}

const themeCopy = {
  lv: {
    lucent: {
      title: "Lucent",
      blurb: "Kokvilna, zīds un viegla rīta elpa pār ikdienas prioritātēm.",
      status: "Lucent active",
    },
    hive: {
      title: "Hive",
      blurb: "Dzintara sadarbība un stropa darba sajūta mājas ritmam.",
      status: "Hive active",
    },
    pulse: {
      title: "Pulse",
      blurb: "Komiksa eksplozija ar playful enerģiju un drosmīgu ritmu.",
      status: "Pulse active",
    },
    forge: {
      title: "Forge",
      blurb: "Neona panelis ar vīrišķīgu fokusu, skaidrību un kontroli.",
      status: "Forge active",
    },
    botanical: {
      title: "Botanical",
      blurb: "Meža pastaigas miers, organiskas formas un dabisks dziļums.",
      status: "Botanical active",
    },
  },
  en: {
    lucent: {
      title: "Lucent",
      blurb: "Cotton-soft calm, silk flow, and a light morning feel over your priorities.",
      status: "Lucent active",
    },
    hive: {
      title: "Hive",
      blurb: "Amber collaboration and a warm hive rhythm for shared living.",
      status: "Hive active",
    },
    pulse: {
      title: "Pulse",
      blurb: "Comic-book energy with playful motion and bold personality.",
      status: "Pulse active",
    },
    forge: {
      title: "Forge",
      blurb: "A neon control panel with sharper focus, structure, and confidence.",
      status: "Forge active",
    },
    botanical: {
      title: "Botanical",
      blurb: "Forest-walk calm, organic forms, and natural depth throughout the experience.",
      status: "Botanical active",
    },
  },
};

const preview = document.getElementById("theme-preview");
const previewTitle = document.getElementById("preview-title");
const previewBlurb = document.getElementById("preview-blurb");
const previewStatus = document.querySelector(".device-status");
const pills = Array.from(document.querySelectorAll(".theme-pill"));

if (preview && previewTitle && previewBlurb && previewStatus && pills.length > 0) {
  const activateTheme = (pill) => {
    const target = pill.getAttribute("data-theme-target");
    if (!target || !themeCopy[locale][target]) return;

    pills.forEach((item) => item.classList.toggle("is-active", item === pill));
    preview.setAttribute("data-theme", target);
    previewTitle.textContent = themeCopy[locale][target].title;
    previewBlurb.textContent = themeCopy[locale][target].blurb;
    previewStatus.textContent = themeCopy[locale][target].status;
  };

  pills.forEach((pill) => {
    pill.addEventListener("click", () => activateTheme(pill));
  });

  if (!prefersReducedMotion) {
    let themeIndex = 0;
    window.setInterval(() => {
      themeIndex = (themeIndex + 1) % pills.length;
      activateTheme(pills[themeIndex]);
    }, 5200);
  }
}

const revealNodes = Array.from(document.querySelectorAll(".reveal"));

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 },
  );

  revealNodes.forEach((node) => revealObserver.observe(node));
}

const teaserCopy = {
  lv: {
    "home-rhythm": {
      kicker: "Vakars saiet šķērsām",
      title: "Tas vakars, kurā viss balstās tikai uz atmiņu, nogurumu un cerību, ka nekas netiks aizmirsts.",
      text: "Mantas, bērni, tukšs ledusskapis un viens zvans, kurā pazūd puse no vajadzīgā.",
      duration: "Ap 30 sekundēm",
      credit: "Īsa, pazīstama mājas vakara plūsma, kurā cilvēks ļoti ātri saprot: jā, tieši tā arī mēdz būt.",
      src: "https://assets.mixkit.co/videos/23996/23996-720.mp4",
      scenes: [
        {
          title: "Mājās viss jau mutuļo, bet vakariņas pat nav sākušās",
          subtitle: "Ledusskapī gandrīz nekā nav, un vakarā vēl jāizdara pilnīgi viss.",
          overlayKicker: "Vakara doma",
          overlayTitle: "Ledusskapī ir piens, ābols un nekādas rezerves.",
          overlayNote: "Tieši šādos vakaros viss turas tikai uz atmiņu.",
          src: "https://assets.mixkit.co/videos/40518/40518-720.mp4",
        },
        {
          title: "Pa telefonu viss izklausās skaidri, bet mājās atbrauc tikai puse no vajadzīgā",
          subtitle: "Nogurums, steigā diktēts saraksts un vēl viens vakars, kur visu jāsaliek kopā no jauna.",
          overlayKicker: "Telefona saruna",
          overlayTitle: "Es taču visu nosaucu skaidri.",
          overlayNote: "Un tieši te vakarā pazūd laiks, spēks un miers.",
          src: "https://videos.pexels.com/video-files/5137847/5137847-uhd_3840_2160_30fps.mp4",
        },
      ],
    },
    "shared-flow": {
      kicker: "Abi vienā ritmā",
      title: "Abi ir noguruši, bet šoreiz nevienam nav jāmin, kas vēl palicis uz vakaru.",
      text: "Pirkumi, notikumi un dienas atlikums beidzot ir redzami abiem vienlaikus.",
      duration: "Ap 30 sekundēm",
      credit: "Tas mazais, bet svarīgais brīdis, kad kopīgais beidzot tiešām izskatās kopīgs.",
      src: "https://assets.mixkit.co/videos/8865/8865-720.mp4",
    },
    "ai-dinner": {
      kicker: "Virtuves pārsteigums",
      title: "Pusaudzis grib pārsteigt vecākus, bet īstais atbalsts šoreiz nāk no H:O.",
      text: "BYOK atslēdz gudro mājas AI, kas paskatās inventory un iedod reālu, pagatavojamu ideju.",
      duration: "Ap 30 sekundēm",
      credit: "Nedrošs mēģinājums pārvēršas siltā, īstā vakara pārsteigumā.",
      src: "https://assets.mixkit.co/videos/24109/24109-720.mp4",
      scenes: [
        {
          title: "Viņš nemāk daudz, bet grib pamēģināt pa īstam",
          subtitle: "H:O atveras, BYOK ir iekšā, un AI uzreiz skatās, kas jau ir mājās.",
          overlayKicker: "Pirmais solis",
          overlayTitle: "Labi, mēģinu. Ielieku savu BYOK.",
          overlayNote: "Ja pašam pietrūkst pārliecības, lai palīdz sistēma.",
          src: "https://assets.mixkit.co/videos/24109/24109-720.mp4",
        },
        {
          title: "No inventory līdz vakariņām, ar kurām tiešām var pārsteigt",
          subtitle: "AI iedod recepti no tā, kas ir mājās, un virtuvē vairs nav tikai minēšana.",
          overlayKicker: "AI palīdzība",
          overlayTitle: "Šito es tiešām varu izdarīt.",
          overlayNote: "Nevis eksperiments, bet vakariņas, ar kurām var pārsteigt vecākus.",
          src: "https://assets.mixkit.co/videos/16212/16212-720.mp4",
        },
      ],
    },
    "theme-worlds": {
      kicker: "Mājas sajūta",
      title: "Katrai mājai ir savs raksturs, un H:O tam nevis traucē, bet pielāgojas.",
      text: "Dažiem vajag mieru, citiem enerģiju. Sistēma paliek tā pati, sajūta kļūst sava.",
      duration: "Ap 30 sekundēm",
      credit: "Īss elpas brīdis, kas atgādina: mājas sistēmai nav jāizskatās utilitārai.",
      src: "https://videos.pexels.com/video-files/34236993/14509276_2160_3840_24fps.mp4",
    },
    "reset-story": {
      kicker: "Klusais slānis",
      title: "Kad diena ir bijusi par daudz, nevajag vēl vienu vietu, kur viss ir skaļš.",
      text: "RESET paliek kluss, saudzīgs un privāts arī tad, kad pārējā diena bija pilna trokšņa.",
      duration: "Ap 30 sekundēm",
      credit: "Mierīgs brīdis pēc skaļas dienas, kad vakarā vajag vienkārši mazāk.",
      src: "https://videos.pexels.com/video-files/9242199/9242199-hd_1920_1080_30fps.mp4",
    },
  },
  en: {
    "home-rhythm": {
      kicker: "An evening goes sideways",
      title: "The kind of evening that runs almost entirely on memory, tiredness, and hope that nothing gets missed.",
      text: "Clutter, kids, an empty fridge, and one call where half the list disappears.",
      duration: "About 30 seconds",
      credit: "A short, believable evening flow where people very quickly think: yes, this is exactly us.",
      src: "https://assets.mixkit.co/videos/23996/23996-720.mp4",
      scenes: [
        {
          title: "The house is already in motion, and dinner has not even started",
          subtitle: "There is barely anything in the fridge, and the whole evening still has to happen.",
          overlayKicker: "Evening thought",
          overlayTitle: "There is milk, an apple, and no real backup plan.",
          overlayNote: "These are the evenings that run almost entirely on memory.",
          src: "https://assets.mixkit.co/videos/40518/40518-720.mp4",
        },
        {
          title: "The phone call sounds clear enough, but only half the groceries come home",
          subtitle: "A tired call, a half-heard list, and the evening still falls back on the same person.",
          overlayKicker: "Phone call",
          overlayTitle: "I said everything out loud. How is half of it still missing?",
          overlayNote: "This is exactly where time, energy, and patience disappear.",
          src: "https://videos.pexels.com/video-files/5137847/5137847-uhd_3840_2160_30fps.mp4",
        },
      ],
    },
    "shared-flow": {
      kicker: "Two people, one view",
      title: "Both people are tired, but now neither has to guess what is still left for the evening.",
      text: "Groceries, events, and the rest of the day finally stay visible to both people at once.",
      duration: "About 30 seconds",
      credit: "That small but important beat where shared life finally looks shared.",
      src: "https://assets.mixkit.co/videos/8865/8865-720.mp4",
    },
    "ai-dinner": {
      kicker: "Kitchen surprise",
      title: "A teen wants to surprise their parents, and this time H:O becomes the support that makes it possible.",
      text: "BYOK unlocks the smart home AI, which checks the inventory and suggests something real and cookable.",
      duration: "About 30 seconds",
      credit: "An uncertain attempt turns into a warm, believable family win.",
      src: "https://assets.mixkit.co/videos/24109/24109-720.mp4",
      scenes: [
        {
          title: "He does not know much yet, but he really wants to try",
          subtitle: "H:O opens, the BYOK key goes in, and the AI checks what is already at home.",
          overlayKicker: "First step",
          overlayTitle: "Okay, I am doing this. Let me add my BYOK.",
          overlayNote: "If confidence is missing, let the system carry some of it.",
          src: "https://assets.mixkit.co/videos/24109/24109-720.mp4",
        },
        {
          title: "From inventory to a dinner that actually feels worth serving",
          subtitle: "The AI turns what is already at home into a recipe he can really pull off.",
          overlayKicker: "AI help",
          overlayTitle: "Okay... I can actually do this.",
          overlayNote: "Not another kitchen experiment, but something worth putting on the table.",
          src: "https://assets.mixkit.co/videos/16212/16212-720.mp4",
        },
      ],
    },
    "theme-worlds": {
      kicker: "Home feeling",
      title: "Every home has its own emotional tone, and H:O adapts instead of fighting it.",
      text: "Some homes need calm, others need energy. The system stays the same, but the feeling becomes personal.",
      duration: "About 30 seconds",
      credit: "A small breathing space that reminds people household tools do not have to feel sterile.",
      src: "https://videos.pexels.com/video-files/34236993/14509276_2160_3840_24fps.mp4",
    },
    "reset-story": {
      kicker: "Quiet layer",
      title: "When the day has already been too much, the last thing you need is another loud space.",
      text: "RESET stays quiet, gentle, and private even after a day that felt noisy from start to finish.",
      duration: "About 30 seconds",
      credit: "A softer moment at the end of the day, when what you really need is less.",
      src: "https://videos.pexels.com/video-files/9242199/9242199-hd_1920_1080_30fps.mp4",
    },
  },
};

const teaserStage = document.getElementById("teaser-stage");
const teaserKicker = document.getElementById("teaser-kicker");
const teaserTitle = document.getElementById("teaser-title");
const teaserText = document.getElementById("teaser-text");
const teaserDuration = document.getElementById("teaser-duration");
const teaserFrameTitle = document.getElementById("teaser-frame-title");
const teaserFrameSubtitle = document.getElementById("teaser-frame-subtitle");
const teaserOverlay = document.getElementById("teaser-overlay");
const teaserOverlayKicker = document.getElementById("teaser-overlay-kicker");
const teaserOverlayQuote = document.getElementById("teaser-overlay-quote");
const teaserOverlayNote = document.getElementById("teaser-overlay-note");
const teaserCredit = document.getElementById("teaser-credit");
const teaserVideo = document.getElementById("teaser-video");
const teaserPlay = document.getElementById("teaser-play");
const teaserProgress = document.getElementById("teaser-progress");
const teaserStory = document.getElementById("teaser-story");
const teaserCards = Array.from(document.querySelectorAll(".teaser-card"));

if (
  teaserStage &&
  teaserKicker &&
  teaserTitle &&
  teaserText &&
  teaserDuration &&
  teaserFrameTitle &&
  teaserFrameSubtitle &&
  teaserOverlay &&
  teaserOverlayKicker &&
  teaserOverlayQuote &&
  teaserOverlayNote &&
  teaserCredit &&
  teaserVideo &&
  teaserPlay &&
  teaserProgress &&
  teaserStory &&
  teaserCards.length > 0
) {
  const SCENE_DURATION_MS = 4200;
  const TEASER_DURATION_MS = 4200;
  let playbackTimeout = null;
  let currentSceneIndex = 0;
  let currentTeaserTarget = teaserCards[0]?.getAttribute("data-teaser-target") || "home-rhythm";

  const updateTeaserPlayState = () => {
    teaserPlay.classList.toggle("is-paused", teaserVideo.paused);
    teaserPlay.setAttribute(
      "aria-label",
      locale === "en"
        ? teaserVideo.paused
          ? "Play teaser video"
          : "Pause teaser video"
        : teaserVideo.paused
          ? "Atskaņot teaser video"
          : "Pauzēt teaser video",
    );
  };

  const resetProgress = () => {
    teaserProgress.style.transition = "none";
    teaserProgress.style.width = "0%";
  };

  const freezeProgress = () => {
    const currentWidth = window.getComputedStyle(teaserProgress).width;
    teaserProgress.style.transition = "none";
    teaserProgress.style.width = currentWidth;
  };

  const startProgress = (duration) => {
    resetProgress();
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        teaserProgress.style.transition = `width ${duration}ms linear`;
        teaserProgress.style.width = "100%";
      });
    });
  };

  const clearPlaybackTimeout = (preserveProgress = false) => {
    if (playbackTimeout) {
      window.clearTimeout(playbackTimeout);
      playbackTimeout = null;
    }

    if (!preserveProgress) {
      resetProgress();
    }
  };

  const getCardByTarget = (target) =>
    teaserCards.find((card) => card.getAttribute("data-teaser-target") === target) || teaserCards[0];

  const getNextCard = (card) => {
    const index = teaserCards.indexOf(card);
    return teaserCards[(index + 1) % teaserCards.length];
  };

  const setupCardPreviews = () => {
    teaserCards.forEach((card) => {
      const target = card.getAttribute("data-teaser-target");
      const preview = card.querySelector(".teaser-card__video");
      if (!target || !(preview instanceof HTMLVideoElement) || !teaserCopy[locale][target]) return;

      const data = teaserCopy[locale][target];
      const previewSrc = data.scenes?.[0]?.src || data.src;
      preview.muted = true;
      preview.loop = true;
      preview.playsInline = true;
      preview.preload = "metadata";
      preview.setAttribute("src", previewSrc);

      if (!prefersReducedMotion) {
        preview.play().catch(() => {});
      }
    });
  };

  const loadTeaserVideo = (src, restart = false) => {
    teaserVideo.classList.add("is-switching");

    if (teaserVideo.getAttribute("src") !== src) {
      teaserVideo.pause();
      teaserVideo.setAttribute("src", src);
      teaserVideo.load();
    } else if (restart) {
      teaserVideo.currentTime = 0;
    }

    if (!prefersReducedMotion) {
      teaserVideo.play().catch(() => {});
    }

    window.setTimeout(() => {
      teaserVideo.classList.remove("is-switching");
    }, 220);
  };

  const setOverlay = (scene) => {
    if (!scene?.overlayTitle) {
      teaserOverlay.classList.add("is-hidden");
      return;
    }

    teaserOverlayKicker.textContent = scene.overlayKicker || "";
    teaserOverlayQuote.textContent = scene.overlayTitle;
    teaserOverlayNote.textContent = scene.overlayNote || "";
    teaserOverlay.classList.remove("is-hidden");
    teaserOverlay.classList.remove("is-refresh");
    void teaserOverlay.offsetWidth;
    teaserOverlay.classList.add("is-refresh");
  };

  const setScene = (target, sceneIndex) => {
    const data = teaserCopy[locale][target];
    const scenes = data.scenes || [];
    const scene = scenes[sceneIndex];
    if (!scene) return;

    loadTeaserVideo(scene.src, true);
    teaserFrameTitle.textContent = scene.title;
    teaserFrameSubtitle.textContent = scene.subtitle;
    setOverlay(scene);
    currentSceneIndex = sceneIndex;
    currentTeaserTarget = target;

    Array.from(teaserStory.querySelectorAll(".teaser-story__item")).forEach((item, index) => {
      item.classList.toggle("is-active", index === sceneIndex);
    });
  };

  const renderStory = (target) => {
    const data = teaserCopy[locale][target];
    const scenes = data.scenes || [];
    teaserStory.innerHTML = "";

    if (scenes.length === 0) {
      return;
    }

    scenes.forEach((scene, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "teaser-story__item";
      button.innerHTML = `
        <span class="teaser-story__step">${index + 1}</span>
        <span class="teaser-story__text">${scene.title}</span>
      `;
      button.addEventListener("click", () => {
        activateTeaser(getCardByTarget(target), index);
      });
      teaserStory.append(button);
    });
  };

  const queueAdvance = (card, sceneIndex = 0) => {
    const target = card.getAttribute("data-teaser-target");
    if (!target) return;

    const scenes = teaserCopy[locale][target].scenes || [];
    const hasScenes = scenes.length > 0;
    const delay = hasScenes ? SCENE_DURATION_MS : TEASER_DURATION_MS;

    clearPlaybackTimeout();
    startProgress(delay);

    playbackTimeout = window.setTimeout(() => {
      if (hasScenes && sceneIndex < scenes.length - 1) {
        setScene(target, sceneIndex + 1);
        queueAdvance(card, sceneIndex + 1);
        return;
      }

      activateTeaser(getNextCard(card));
    }, delay);
  };

  const activateTeaser = (card, startingSceneIndex = 0) => {
    const target = card.getAttribute("data-teaser-target");
    if (!target || !teaserCopy[locale][target]) return;
    const data = teaserCopy[locale][target];
    const scenes = data.scenes || [];
    const boundedSceneIndex = Math.max(0, Math.min(startingSceneIndex, Math.max(scenes.length - 1, 0)));

    clearPlaybackTimeout();

    teaserCards.forEach((item) => item.classList.toggle("is-active", item === card));
    teaserStage.setAttribute("data-teaser", target);
    teaserKicker.textContent = data.kicker;
    teaserTitle.textContent = data.title;
    teaserText.textContent = data.text;
    teaserDuration.textContent = data.duration;
    teaserCredit.textContent = data.credit;
    currentTeaserTarget = target;

    renderStory(target);
    teaserVideo.loop = true;

    if (scenes.length > 0) {
      setScene(target, boundedSceneIndex);

      if (!prefersReducedMotion) {
        queueAdvance(card, boundedSceneIndex);
      }
    } else {
      teaserFrameTitle.textContent = data.title;
      teaserFrameSubtitle.textContent = `${data.kicker} • ${data.duration.replace(locale === "en" ? "Play " : "Skatīt ", "")}`;
      teaserOverlay.classList.add("is-hidden");
      loadTeaserVideo(data.src, true);

      if (!prefersReducedMotion) {
        queueAdvance(card);
      }
    }
  };

  teaserCards.forEach((card) => {
    card.addEventListener("click", () => {
      activateTeaser(card);
    });
  });

  const initialTeaserCard = teaserCards.find((card) => card.classList.contains("is-active")) || teaserCards[0];

  teaserVideo.addEventListener("play", updateTeaserPlayState);
  teaserVideo.addEventListener("pause", updateTeaserPlayState);

  teaserPlay.addEventListener("click", () => {
    if (teaserVideo.paused) {
      activateTeaser(getCardByTarget(currentTeaserTarget), currentSceneIndex);
    } else {
      teaserVideo.pause();
      clearPlaybackTimeout(true);
      freezeProgress();
    }
  });

  if (!prefersReducedMotion) {
    activateTeaser(initialTeaserCard);
  } else {
    teaserVideo.removeAttribute("autoplay");
    activateTeaser(initialTeaserCard);
  }

  setupCardPreviews();
  updateTeaserPlayState();
}

const interestForm = document.getElementById("interest-form");
const interestFormNote = document.getElementById("interest-form-note");

if (interestForm instanceof HTMLFormElement && interestFormNote) {
  interestForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(interestForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const household = String(formData.get("household") || "").trim();
    const challenge = String(formData.get("challenge") || "").trim();

    const subject = `H:O interese${name ? ` - ${name}` : ""}`;
    const body = [
      "Sveiki,",
      "",
      locale === "en"
        ? "I would love to learn more about H:O and the 2-month free trial."
        : "vēlos uzzināt vairāk par H:O un 2 mēnešu bezmaksas izmēģinājumu.",
      "",
      locale === "en" ? `Name: ${name || "-"}` : `Vārds: ${name || "-"}`,
      locale === "en" ? `Email: ${email || "-"}` : `E-pasts: ${email || "-"}`,
      locale === "en" ? `Household type: ${household || "-"}` : `Mājsaimniecības tips: ${household || "-"}`,
      locale === "en" ? `Main challenge: ${challenge || "-"}` : `Lielākais izaicinājums: ${challenge || "-"}`,
      "",
      locale === "en" ? "Thank you!" : "Paldies!",
    ].join("\n");

    const mailtoUrl = `mailto:hello@homeos.app?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    interestFormNote.textContent =
      locale === "en"
        ? "Opening your email with a pre-filled message."
        : "Atveru tavu e-pastu ar sagatavotu pieteikumu.";
    interestFormNote.classList.add("is-success");
    window.location.href = mailtoUrl;
  });
}
