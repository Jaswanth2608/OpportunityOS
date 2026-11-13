/* ==========================================================================
   OpportunityOS — shared application shell
   --------------------------------------------------------------------------
   This file runs on all five pages and only handles the navigation drawer.

   What it does:
     1. Opens the drawer when the header menu button is clicked
     2. Closes it with the close button, the dimmed overlay, the Escape key,
        or by resizing the window up to desktop width
     3. Keeps keyboard focus inside the open drawer (a simple focus trap)
     4. Moves focus back to the menu button when the drawer closes

   It is a classic script (not a module) so the pages also work when opened
   directly from the file system, and it is wrapped in a function so nothing
   leaks into the global scope.
   ========================================================================== */

(function () {
  "use strict";

  /* At this width and above, the sidebar is always visible (see section 9 of
     the stylesheet), so the drawer behaviour must be switched off. */
  var DESKTOP_BREAKPOINT = 1024;

  /* --- Find the shell elements ----------------------------------------- */
  var body = document.body;
  var sidebar = document.getElementById("app-sidebar");
  var menuButton = document.querySelector("[data-menu-toggle]");
  var closeButton = document.querySelector("[data-menu-close]");
  var overlay = document.querySelector("[data-overlay]");

  /* If a page is ever missing the shell, stop quietly instead of throwing
     errors in the console. */
  if (!sidebar || !menuButton || !overlay) {
    return;
  }

  /* Remembers which element had focus before the drawer opened, so focus can
     be returned to it on close. */
  var lastFocusedElement = null;

  /* --- Helpers ----------------------------------------------------------- */

  function isDesktopWidth() {
    return window.innerWidth >= DESKTOP_BREAKPOINT;
  }

  function isDrawerOpen() {
    return body.classList.contains("drawer-open");
  }

  /* Every element inside the drawer that can receive keyboard focus. */
  function getFocusableItems() {
    return sidebar.querySelectorAll("a[href], button:not([disabled])");
  }

  /* --- Open and close ---------------------------------------------------- */

  function openDrawer() {
    if (isDrawerOpen()) {
      return;
    }

    lastFocusedElement = document.activeElement;

    body.classList.add("drawer-open");
    menuButton.setAttribute("aria-expanded", "true");
    document.addEventListener("keydown", handleKeydown);

    /* Move focus into the drawer, so keyboard users are where the visual
       focus is. */
    var items = getFocusableItems();
    if (items.length > 0) {
      items[0].focus();
    }
  }

  function closeDrawer() {
    if (!isDrawerOpen()) {
      return;
    }

    body.classList.remove("drawer-open");
    menuButton.setAttribute("aria-expanded", "false");
    document.removeEventListener("keydown", handleKeydown);

    /* Return focus to where it was. The fallback handles the rare case where
       that element no longer exists on the page. */
    if (lastFocusedElement && document.contains(lastFocusedElement)) {
      lastFocusedElement.focus();
    } else {
      menuButton.focus();
    }

    lastFocusedElement = null;
  }

  function toggleDrawer() {
    if (isDrawerOpen()) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }

  /* --- Keyboard behaviour ------------------------------------------------ */

  function handleKeydown(event) {
    /* Escape always closes the drawer. */
    if (event.key === "Escape") {
      event.preventDefault();
      closeDrawer();
      return;
    }

    /* Tab is kept inside the drawer while it is open: tabbing forward from
       the last item wraps to the first, and shift+tab backwards from the
       first wraps to the last. */
    if (event.key !== "Tab") {
      return;
    }

    var items = getFocusableItems();
    if (items.length === 0) {
      return;
    }

    var firstItem = items[0];
    var lastItem = items[items.length - 1];

    if (event.shiftKey && document.activeElement === firstItem) {
      event.preventDefault();
      lastItem.focus();
    } else if (!event.shiftKey && document.activeElement === lastItem) {
      event.preventDefault();
      firstItem.focus();
    }
  }

  /* --- Window resizing --------------------------------------------------- */

  /* Growing the window past the breakpoint shows the fixed sidebar, so the
     drawer state and its Escape listener must be cleared. */
  function handleResize() {
    if (isDesktopWidth() && isDrawerOpen()) {
      body.classList.remove("drawer-open");
      menuButton.setAttribute("aria-expanded", "false");
      document.removeEventListener("keydown", handleKeydown);
      lastFocusedElement = null;
    }
  }

  /* --- Wire everything up ------------------------------------------------ */

  menuButton.addEventListener("click", toggleDrawer);

  if (closeButton) {
    closeButton.addEventListener("click", closeDrawer);
  }

  /* Clicking the dimmed area outside the drawer closes it (mouse and touch
     users; keyboard users have Escape). */
  overlay.addEventListener("click", closeDrawer);

  window.addEventListener("resize", handleResize);
})();
