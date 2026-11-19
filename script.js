/* =====================================================
   THENUKI PERERA | PORTFOLIO SCRIPT (plain JavaScript)

   WHAT THIS FILE DOES (in order)
   1.  Header, progress bar and back-to-top button
   2.  Mobile menu
   3.  Highlight the current section in the menu
   4.  Reveal sections as you scroll
   5.  Typing effect in the hero      <-- edit your words here
   6.  Project filter buttons
   7.  Tilt effect on project cards
   8.  Optional images (your photo and project screenshots)
   9.  Certificates and the pop-up viewer
   10. Soft cursor glow
   11. Footer year

   The whole file is wrapped in (function () { ... })();
   That just keeps our variables private. You can ignore it.
   ===================================================== */

(function () {
  'use strict';

  /* ---------- Small helper tools ---------- */

  // true if the visitor asked their device to reduce animations
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // true on devices with a real mouse (not phones)
  var hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // $  finds ONE element, $$ finds ALL matching elements
  function $(selector, parent) { return (parent || document).querySelector(selector); }
  function $$(selector, parent) { return Array.prototype.slice.call((parent || document).querySelectorAll(selector)); }


  /* ---------- 1. HEADER, PROGRESS BAR, BACK TO TOP ---------- */
  var header = $('#header');
  var progress = $('#progress');
  var toTopButton = $('#toTop');

  function updateOnScroll() {
    var scrolled = window.scrollY;
    var totalHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Add a shadow to the header after scrolling a little
    header.classList.toggle('scrolled', scrolled > 10);

    // Show the back-to-top button after scrolling 600px
    toTopButton.classList.toggle('show', scrolled > 600);

    // Fill the progress bar (a number from 0 to 1)
    var fraction = totalHeight > 0 ? scrolled / totalHeight : 0;
    progress.style.transform = 'scaleX(' + fraction + ')';
  }

  window.addEventListener('scroll', updateOnScroll, { passive: true });
  updateOnScroll();

  toTopButton.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });


  /* ---------- 2. MOBILE MENU ---------- */
  var menuButton = $('#navToggle');
  var menu = $('#navMenu');

  function setMenu(isOpen) {
    menu.classList.toggle('open', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  }

  menuButton.addEventListener('click', function () {
    setMenu(!menu.classList.contains('open'));
  });

  // Close the menu when a link is clicked
  $$('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () { setMenu(false); });
  });

  // Close with the Escape key (this also closes the certificate pop-up)
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      setMenu(false);
      closeViewer();
    }
  });

  // Close when clicking outside the menu
  document.addEventListener('click', function (event) {
    var clickedInside = menu.contains(event.target) || menuButton.contains(event.target);
    if (!clickedInside) setMenu(false);
  });

  // If the window becomes wide again, reset the menu
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900) setMenu(false);
  });


  /* ---------- 3. HIGHLIGHT CURRENT SECTION IN THE MENU ---------- */
  var menuLinks = $$('.nav-link');
  var sections = $$('section[data-nav]');

  function highlightLink(sectionName) {
    menuLinks.forEach(function (link) {
      var isCurrent = link.getAttribute('data-section') === sectionName;
      link.classList.toggle('active', isCurrent);
    });
  }

  if ('IntersectionObserver' in window) {
    // IntersectionObserver tells us when an element enters the screen.
    // The rootMargin makes a section count as "current" when it reaches the middle of the screen.
    var sectionWatcher = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) highlightLink(entry.target.getAttribute('data-nav'));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (section) { sectionWatcher.observe(section); });
  }
  highlightLink('home');


  /* ---------- 4. REVEAL ON SCROLL ---------- */
  // Every element with class="reveal" fades in when it scrolls into view.
  var revealItems = $$('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(function (item) { item.classList.add('visible'); });
  } else {
    var revealWatcher = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);   // only animate once
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach(function (item) { revealWatcher.observe(item); });
  }


  /* ---------- 5. TYPING EFFECT ---------- */
  // EDIT THIS LIST to change the words that appear in the hero.
  var typingWords = [
    'UI/UX design',
    'web development',
    'programming',
    'networking',
    'cloud computing',
    'artificial intelligence'
  ];

  var typedElement = $('#typed');

  function startTyping() {
    if (!typedElement) return;

    // If animations are reduced, just show the first word
    if (reduceMotion) { typedElement.textContent = typingWords[0]; return; }

    var wordIndex = 0;     // which word we are on
    var letterIndex = 0;   // how many letters are showing
    var deleting = false;

    function tick() {
      var word = typingWords[wordIndex];

      if (!deleting) {
        letterIndex++;     // type one more letter
      } else {
        letterIndex--;     // delete one letter
      }
      typedElement.textContent = word.substring(0, letterIndex);

      var delay = deleting ? 45 : 90;

      if (!deleting && letterIndex === word.length) {        // finished typing: pause
        deleting = true;
        delay = 1600;
      } else if (deleting && letterIndex === 0) {            // finished deleting: next word
        deleting = false;
        wordIndex = (wordIndex + 1) % typingWords.length;
        delay = 400;
      }
      setTimeout(tick, delay);
    }
    tick();
  }
  startTyping();


  /* ---------- 6. PROJECT FILTER ---------- */
  var filterButtons = $$('.filter');
  var projectCards = $$('.project-card');
  var noResultsMessage = $('#noResults');
  var fadeTime = reduceMotion ? 0 : 280;   // matches the CSS fade

  function filterProjects(category) {
    var visibleCount = 0;

    projectCards.forEach(function (card) {
      var matches = (category === 'all') || (card.getAttribute('data-category') === category);

      if (matches) {
        visibleCount++;
        if (card.hidden) {
          card.hidden = false;                  // un-hide...
          card.classList.add('is-hiding');
          void card.offsetWidth;                // ...make the browser notice...
        }
        card.classList.remove('is-hiding');     // ...then fade in
        card.classList.add('visible');
      } else if (!card.hidden) {
        card.classList.add('is-hiding');        // fade out...
        setTimeout(function () {
          if (card.classList.contains('is-hiding')) card.hidden = true;   // ...then hide
        }, fadeTime);
      }
    });

    noResultsMessage.hidden = visibleCount !== 0;
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      filterButtons.forEach(function (other) {
        other.classList.remove('active');
        other.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');
      filterProjects(button.getAttribute('data-filter'));
    });
  });


  /* ---------- 7. TILT EFFECT ON PROJECT CARDS ---------- */
  // Cards lean slightly toward your mouse. Only on devices with a real mouse.
  if (hasMouse && !reduceMotion) {
    $$('.tilt').forEach(function (card) {
      card.addEventListener('mousemove', function (event) {
        var box = card.getBoundingClientRect();
        var x = (event.clientX - box.left) / box.width - 0.5;    // -0.5 to 0.5
        var y = (event.clientY - box.top) / box.height - 0.5;
        // Change 5 to a bigger number for a stronger tilt
        card.style.transform = 'perspective(900px) rotateX(' + (-y * 5) + 'deg) rotateY(' + (x * 5) + 'deg) translateY(-5px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }


  /* ---------- 8. OPTIONAL IMAGES ---------- */
  // Any <img data-optional hidden> is a "bonus" image (your photo or a project screenshot).
  // We try to load it. If the file exists, we show it. If not, nothing breaks.
  $$('img[data-optional]').forEach(function (image) {
    var test = new Image();
    test.onload = function () {
      image.hidden = false;
      // For the hero photo, also hide the "TP" letters
      var photoWrap = image.closest('.photo-wrap');
      if (photoWrap) photoWrap.classList.add('has-photo');
    };
    test.onerror = function () { /* file not found: keep the placeholder */ };
    test.src = image.getAttribute('src');
  });


  /* ---------- 9. CERTIFICATES & POP-UP VIEWER ---------- */
  var viewer = $('#lightbox');
  var viewerImage = $('#lbImg');
  var viewerCaption = $('#lbCap');
  var viewerClose = $('#lbClose');
  var lastFocused = null;

  $$('.cert-card').forEach(function (card) {
    var image = $('img', card);

    // If the certificate image is missing, show the placeholder instead
    image.addEventListener('error', function () { card.classList.add('is-missing'); });
    if (image.complete && image.naturalWidth === 0) card.classList.add('is-missing');

    // Click a certificate to open the pop-up
    card.addEventListener('click', function () {
      if (card.classList.contains('is-missing')) return;
      openViewer(card.getAttribute('data-full'), card.getAttribute('data-caption'));
    });
  });

  function openViewer(source, caption) {
    lastFocused = document.activeElement;
    viewerImage.src = source;
    viewerImage.alt = caption || 'Certificate';
    viewerCaption.textContent = caption || '';
    viewer.hidden = false;
    document.body.style.overflow = 'hidden';   // stop the page scrolling behind
    viewerClose.focus();
  }

  function closeViewer() {
    if (viewer.hidden) return;
    viewer.hidden = true;
    viewerImage.src = '';
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  viewerClose.addEventListener('click', closeViewer);
  viewer.addEventListener('click', function (event) {
    if (event.target === viewer) closeViewer();   // click on the dark background
  });


  /* ---------- 10. SOFT CURSOR GLOW ---------- */
  if (hasMouse && !reduceMotion) {
    var glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    document.addEventListener('mousemove', function (event) {
      glow.style.opacity = '1';
      glow.style.transform = 'translate(' + event.clientX + 'px, ' + event.clientY + 'px)';
    });
    document.addEventListener('mouseleave', function () { glow.style.opacity = '0'; });
  }


  /* ---------- 11. FOOTER YEAR ---------- */
  var yearElement = $('#year');
  if (yearElement) yearElement.textContent = new Date().getFullYear();

})();