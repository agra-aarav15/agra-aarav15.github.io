/* ============================================================
   AARAV AGRAWAL — PORTFOLIO
   Motion: GSAP + ScrollTrigger + Lenis
   Everything degrades gracefully: no JS / no CDN / reduced motion
   all leave a fully readable page.
   ============================================================ */

(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Live clocks (always run — content, not decoration) ---------- */
  var clockFmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function tickClocks() {
    var now = new Date();
    var full = clockFmt.format(now);
    setText("navClock", full);
    setText("footClock", full);
    setText("factClock", full + " IST");
  }
  tickClocks();
  setInterval(tickClocks, 1000);

  /* ---------- Bail out gracefully if GSAP failed to load ---------- */
  var preloader = document.getElementById("preloader");
  if (!window.gsap || !window.ScrollTrigger) {
    if (preloader) preloader.style.display = "none";
    document.querySelectorAll(".sec-head").forEach(function (h) {
      h.classList.add("is-active");
    });
    var dev = document.getElementById("device");
    if (dev) dev.classList.add("is-on");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Reduced motion: skip choreography, show everything ---------- */
  if (prefersReduced) {
    if (preloader) preloader.style.display = "none";
    document.querySelectorAll(".sec-head").forEach(function (h) {
      h.classList.add("is-active");
    });
    var device = document.getElementById("device");
    if (device) device.classList.add("is-on");
    return;
  }

  /* ---------- Smooth scroll (Lenis) ---------- */
  var lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  function scrollToTarget(target) {
    if (lenis) {
      lenis.scrollTo(target, { offset: -64, duration: 1.4 });
    } else if (typeof target === "string") {
      var el = document.querySelector(target);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  document.querySelectorAll("[data-scroll]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      var href = link.getAttribute("href");
      if (href && href.charAt(0) === "#") {
        e.preventDefault();
        scrollToTarget(href === "#top" ? 0 : href);
      }
    });
  });

  var backTop = document.getElementById("backTop");
  if (backTop) {
    backTop.addEventListener("click", function () {
      scrollToTarget(0);
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".magnetic").forEach(function (el) {
      var strength = 0.28;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var relX = e.clientX - r.left - r.width / 2;
        var relY = e.clientY - r.top - r.height / 2;
        gsap.to(el, {
          x: relX * strength,
          y: relY * strength,
          duration: 0.4,
          ease: "power3.out",
        });
      });
      el.addEventListener("mouseleave", function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  /* ---------- Hero title: split lines into letters for a finer reveal ---------- */
  document.querySelectorAll(".ht-inner").forEach(function (line) {
    var frag = document.createDocumentFragment();
    Array.prototype.slice.call(line.childNodes).forEach(function (node) {
      var isAccent = node.nodeType === 1 && node.classList.contains("accent");
      node.textContent.split("").forEach(function (ch) {
        var s = document.createElement("span");
        s.className = "char" + (isAccent ? " accent" : "");
        s.textContent = ch === " " ? " " : ch;
        frag.appendChild(s);
      });
    });
    line.innerHTML = "";
    line.appendChild(frag);
  });

  /* ---------- Preloader + hero intro ---------- */
  if (lenis) lenis.stop();

  var counter = { v: 0 };
  var preCount = document.getElementById("preCount");

  var intro = gsap.timeline({
    defaults: { ease: "power4.out" },
    onComplete: function () {
      if (lenis) lenis.start();
      ScrollTrigger.refresh();
    },
  });

  intro
    .to(".pre-name", { y: 0, duration: 0.9, ease: "power4.out" }, 0.1)
    .to(
      counter,
      {
        v: 100,
        duration: 1.3,
        ease: "power2.inOut",
        onUpdate: function () {
          if (preCount) {
            preCount.textContent = String(Math.round(counter.v)).padStart(2, "0");
          }
        },
      },
      0.1
    )
    .to("#preBarFill", { scaleX: 1, duration: 1.3, ease: "power2.inOut" }, 0.1)
    .to(
      ".pre-inner",
      { yPercent: -30, opacity: 0, duration: 0.5, ease: "power2.in" },
      "+=0.15"
    )
    .to(
      "#preloader",
      {
        yPercent: -100,
        duration: 0.9,
        ease: "power4.inOut",
        onComplete: function () {
          preloader.style.display = "none";
        },
      },
      "-=0.25"
    )
    // hero choreography
    .from(
      ".ht-line .char",
      { yPercent: 120, duration: 0.9, stagger: 0.028, ease: "power4.out" },
      "-=0.55"
    )
    .from(".hero-eyebrow", { y: 18, opacity: 0, duration: 0.7 }, "-=0.8")
    .from(".hero-coords", { y: 18, opacity: 0, duration: 0.7 }, "-=0.65")
    .from(".hero-sub", { y: 24, opacity: 0, duration: 0.8 }, "-=0.6")
    .from(".hero-cta .btn", { y: 24, opacity: 0, duration: 0.7, stagger: 0.08 }, "-=0.6")
    .from(".nav", { opacity: 0, duration: 0.7 }, "-=0.7")
    .from(
      ".nav-links a",
      { y: -14, opacity: 0, duration: 0.5, stagger: 0.06, clearProps: "all" },
      "-=0.6"
    )
    .from(".scroll-cue", { opacity: 0, duration: 0.9 }, "-=0.4")
    .from(".rail", { opacity: 0, duration: 0.9 }, "-=0.9");

  /* ---------- Hero parallax out ---------- */
  gsap.to(".hero-title", {
    yPercent: -12,
    opacity: 0.25,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  /* ---------- Nav hide / show ---------- */
  var nav = document.getElementById("nav");
  ScrollTrigger.create({
    start: "top -80",
    onUpdate: function (self) {
      nav.classList.toggle("is-hidden", self.direction === 1 && self.scroll() > 300);
      nav.classList.toggle("is-scrolled", self.scroll() > 40);
    },
  });

  /* ---------- Progress rail ---------- */
  gsap.to("#railFill", {
    scaleY: 1,
    ease: "none",
    scrollTrigger: {
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.4,
    },
  });

  /* ---------- Section nodes light up ---------- */
  document.querySelectorAll(".sec-head").forEach(function (head) {
    ScrollTrigger.create({
      trigger: head,
      start: "top 78%",
      onEnter: function () {
        head.classList.add("is-active");
      },
    });
  });

  /* ---------- Statement: word-by-word fill on scroll ---------- */
  var statement = document.getElementById("statement");
  if (statement) {
    var frag = document.createDocumentFragment();
    Array.prototype.slice.call(statement.childNodes).forEach(function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        // split keeping whitespace so punctuation stays glued to its word
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(" "));
          } else {
            var span = document.createElement("span");
            span.className = "word";
            span.textContent = part;
            frag.appendChild(span);
          }
        });
      } else {
        node.classList.add("word");
        frag.appendChild(node);
      }
    });
    statement.innerHTML = "";
    statement.appendChild(frag);

    gsap.fromTo(
      statement.querySelectorAll(".word"),
      { opacity: 0.12 },
      {
        opacity: 1,
        stagger: 0.04,
        ease: "none",
        scrollTrigger: {
          trigger: statement,
          start: "top 80%",
          end: "bottom 45%",
          scrub: 0.5,
        },
      }
    );
  }

  /* ---------- Generic paragraph reveals ---------- */
  gsap.utils.toArray(".reveal-p, .device figcaption").forEach(function (el) {
    gsap.from(el, {
      y: 32,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });

  /* ---------- Facts: rows land one by one ---------- */
  gsap.from(".fact", {
    y: 18,
    opacity: 0,
    duration: 0.6,
    stagger: 0.09,
    ease: "power3.out",
    scrollTrigger: { trigger: ".facts", start: "top 88%" },
  });

  /* ---------- Orbs drift against the scroll ---------- */
  gsap.utils.toArray(".orb").forEach(function (orb) {
    gsap.to(orb, {
      yPercent: -36,
      ease: "none",
      scrollTrigger: {
        trigger: orb.parentElement,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });

  /* ---------- Marquee leans with scroll velocity ---------- */
  /* skew the chunks, not the track — the track's transform belongs to the
     CSS marquee keyframe animation */
  var marqueeChunks = gsap.utils.toArray(".marquee-chunk");
  if (marqueeChunks.length) {
    var skewTo = gsap.quickTo(marqueeChunks, "skewX", { duration: 0.5, ease: "power3" });
    ScrollTrigger.create({
      onUpdate: function (self) {
        skewTo(gsap.utils.clamp(-6, 6, self.getVelocity() / -350));
      },
    });
  }

  /* ---------- Device: draw the board, then power it on ---------- */
  var deviceEl = document.getElementById("device");
  if (deviceEl) {
    var paths = deviceEl.querySelectorAll(".draw");
    paths.forEach(function (p) {
      var len = 0;
      try {
        len = p.getTotalLength();
      } catch (err) {
        len = 600;
      }
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
    });

    gsap.to(paths, {
      strokeDashoffset: 0,
      duration: 1.6,
      stagger: 0.05,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: deviceEl,
        start: "top 75%",
        onEnter: function () {
          setTimeout(function () {
            deviceEl.classList.add("is-on");
          }, 1400);
        },
      },
    });

    gsap.to(deviceEl, {
      y: -28,
      ease: "none",
      scrollTrigger: {
        trigger: "#profile",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  /* ---------- Section titles (masked lines) ---------- */
  gsap.utils.toArray(".sec-title, .contact-title").forEach(function (title) {
    gsap.from(title.querySelectorAll(".st-inner"), {
      yPercent: 115,
      duration: 1,
      stagger: 0.1,
      ease: "power4.out",
      scrollTrigger: { trigger: title, start: "top 82%" },
    });
  });

  /* ---------- Work rows cascade in ---------- */
  gsap.utils.toArray(".work-row").forEach(function (row, i) {
    gsap.from(row, {
      y: 48,
      opacity: 0,
      duration: 0.9,
      delay: (i % 3) * 0.06,
      ease: "power3.out",
      scrollTrigger: { trigger: row, start: "top 88%" },
    });
  });

  gsap.from(".work-range", {
    opacity: 0,
    x: -16,
    duration: 0.8,
    ease: "power3.out",
    scrollTrigger: { trigger: ".work-intro", start: "top 80%" },
  });

  /* ---------- Skills list reveal ---------- */
  gsap.utils.toArray(".skill").forEach(function (skill, i) {
    gsap.from(skill, {
      y: 36,
      opacity: 0,
      duration: 0.8,
      delay: (i % 4) * 0.07,
      ease: "power3.out",
      scrollTrigger: { trigger: skill, start: "top 88%" },
    });
  });

  gsap.from(".stack-note", {
    y: 24,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
    scrollTrigger: { trigger: ".stack-note", start: "top 88%" },
  });

  /* ---------- Chips stagger in ---------- */
  gsap.from(".chip", {
    y: 20,
    opacity: 0,
    duration: 0.55,
    stagger: 0.05,
    ease: "power3.out",
    clearProps: "all",
    scrollTrigger: { trigger: ".chips", start: "top 88%" },
  });

  gsap.from(".toolset-label", {
    opacity: 0,
    duration: 0.7,
    scrollTrigger: { trigger: ".toolset", start: "top 88%" },
  });

  /* ---------- Contact reveals ---------- */
  gsap.from(".contact-row > *", {
    y: 36,
    opacity: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: "power3.out",
    scrollTrigger: { trigger: ".contact-row", start: "top 88%" },
  });

  gsap.from(".footer-bottom > *", {
    y: 16,
    opacity: 0,
    duration: 0.7,
    stagger: 0.07,
    ease: "power3.out",
    scrollTrigger: { trigger: ".footer-bottom", start: "top 96%" },
  });
})();
