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


/* ==========================================================================
   OpportunityOS — dashboard
   --------------------------------------------------------------------------
   This block only runs on the Dashboard page: it looks for #dashboard and
   stops immediately on the other four pages, so it never interferes with the
   navigation code above.

   It reads the sample data from js/data.js and writes three things into the
   page: the four overview numbers, the recent applications table, and the
   upcoming deadline list. Everything is built from the data, so the page can
   never show a number that disagrees with the rows underneath it.
   ========================================================================== */

(function () {
  "use strict";

  /* --- Only run on the dashboard ---------------------------------------- */
  var dashboard = document.getElementById("dashboard");
  if (!dashboard) {
    return;
  }

  var sampleData = window.OpportunityOS_DATA;
  if (!sampleData) {
    return;
  }

  var opportunities = sampleData.opportunities || [];
  var applications = sampleData.applications || [];

  /* --- Settings --------------------------------------------------------- */
  var DEADLINE_WINDOW_DAYS = 30; /* "upcoming" means within 30 days   */
  var URGENT_WINDOW_DAYS = 7; /* deadlines this close get highlighted */
  var RECENT_APPLICATION_LIMIT = 5;
  var MS_PER_DAY = 24 * 60 * 60 * 1000;

  /* One central place that maps an application status to a badge style.
     Change it here and the table, and any later page, follows. */
  var STATUS_BADGES = {
    Applied: "badge--neutral",
    "Under review": "badge--neutral",
    Interview: "badge--info",
    Offer: "badge--accent",
    Rejected: "badge--strong"
  };
  var DEFAULT_STATUS_BADGE = "badge--neutral";

  /* --- Dates ------------------------------------------------------------ */

  /* A date without a time, so comparisons ignore the clock. */
  function today() {
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  /* Turns "2026-11-20" into a Date in local time. */
  function parseIsoDate(isoDate) {
    var parts = isoDate.split("-");
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }

  /* Whole days between today and the given date.
     0 = today, 3 = in three days, -2 = two days ago. */
  function daysUntil(isoDate) {
    return Math.round((parseIsoDate(isoDate) - today()) / MS_PER_DAY);
  }

  /* Readable date, for example "20 Nov 2026". */
  var dateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  function formatDate(isoDate) {
    return dateFormatter.format(parseIsoDate(isoDate));
  }

  /* Friendly countdown, for example "In 3 days" or "Today". */
  function formatCountdown(days) {
    if (days === 0) {
      return "Today";
    }
    if (days === 1) {
      return "Tomorrow";
    }
    return "In " + days + " days";
  }

  /* --- Calculations ------------------------------------------------------ */

  function countInterviews() {
    return applications.filter(function (application) {
      return application.status === "Interview";
    }).length;
  }

  function countSaved() {
    return opportunities.filter(function (opportunity) {
      return opportunity.saved === true;
    }).length;
  }

  /* Upcoming means: not expired (0 days or more) and within the window.
     The list is sorted so the nearest deadline is always first. */
  function getUpcomingDeadlines() {
    return opportunities
      .filter(function (opportunity) {
        var days = daysUntil(opportunity.deadline);
        return days >= 0 && days <= DEADLINE_WINDOW_DAYS;
      })
      .sort(function (a, b) {
        return parseIsoDate(a.deadline) - parseIsoDate(b.deadline);
      });
  }

  /* --- Small DOM helpers -------------------------------------------------- */

  function createElement(tagName, className, text) {
    var element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    if (text !== undefined) {
      element.textContent = text;
    }
    return element;
  }

  function setText(id, value) {
    var element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  /* --- 1. Overview numbers ------------------------------------------------ */

  function renderStats(deadlineCount) {
    setText("stat-applications", applications.length);
    setText("stat-interviews", countInterviews());
    setText("stat-saved", countSaved());
    setText("stat-deadlines", deadlineCount);
  }

  /* --- 2. Recent applications --------------------------------------------- */

  function renderApplications() {
    var tableWrapper = document.getElementById("recent-applications-wrap");
    var tableBody = document.getElementById("recent-applications-body");
    var emptyState = document.getElementById("recent-applications-empty");

    if (!tableWrapper || !tableBody || !emptyState) {
      return;
    }

    /* Newest first, then trimmed to the five most recent. */
    var recent = applications
      .slice()
      .sort(function (a, b) {
        return parseIsoDate(b.appliedOn) - parseIsoDate(a.appliedOn);
      })
      .slice(0, RECENT_APPLICATION_LIMIT);

    tableBody.textContent = "";

    if (recent.length === 0) {
      tableWrapper.hidden = true;
      emptyState.hidden = false;
      return;
    }

    tableWrapper.hidden = false;
    emptyState.hidden = true;

    recent.forEach(function (application) {
      var row = document.createElement("tr");

      row.appendChild(createElement("td", "", application.title));
      row.appendChild(createElement("td", "", application.company));
      row.appendChild(
        createElement("td", "table__num", formatDate(application.appliedOn))
      );

      /* Status is shown as a badge, always with its text so the meaning is
         never carried by colour alone. */
      var statusCell = document.createElement("td");
      var badgeClass =
        STATUS_BADGES[application.status] || DEFAULT_STATUS_BADGE;
      statusCell.appendChild(
        createElement("span", "badge " + badgeClass, application.status)
      );
      row.appendChild(statusCell);

      tableBody.appendChild(row);
    });
  }

  /* --- 3. Upcoming deadlines ---------------------------------------------- */

  function renderDeadlines(deadlines) {
    var list = document.getElementById("deadline-list");
    var emptyState = document.getElementById("deadlines-empty");

    if (!list || !emptyState) {
      return;
    }

    list.textContent = "";

    if (deadlines.length === 0) {
      list.hidden = true;
      emptyState.hidden = false;
      return;
    }

    list.hidden = false;
    emptyState.hidden = true;

    deadlines.forEach(function (opportunity) {
      var days = daysUntil(opportunity.deadline);
      var isUrgent = days <= URGENT_WINDOW_DAYS;

      var item = createElement(
        "li",
        "deadline" + (isUrgent ? " deadline--urgent" : "")
      );

      var main = createElement("div", "deadline__main");
      main.appendChild(createElement("p", "deadline__title", opportunity.title));
      main.appendChild(
        createElement(
          "p",
          "deadline__meta",
          opportunity.organisation + " \u00b7 " + opportunity.type
        )
      );

      var dateBlock = createElement("div", "deadline__date");

      /* A real <time> element with a machine-readable date. */
      var time = createElement("time", "", formatDate(opportunity.deadline));
      time.setAttribute("datetime", opportunity.deadline);
      dateBlock.appendChild(time);
      dateBlock.appendChild(
        createElement(
          "span",
          "deadline__countdown",
          isUrgent ? "Closing soon \u00b7 " + formatCountdown(days) : formatCountdown(days)
        )
      );

      item.appendChild(main);
      item.appendChild(dateBlock);
      list.appendChild(item);
    });
  }

  /* --- 4. Draw everything -------------------------------------------------- */

  function renderDashboard() {
    var deadlines = getUpcomingDeadlines();
    renderStats(deadlines.length);
    renderApplications();
    renderDeadlines(deadlines);
  }

  /* A small hook so the renderer can be re-run later (for example once
     bookmarks and applications are editable) and so the empty state can be
     checked from the browser console while developing. */
  window.OpportunityOS = window.OpportunityOS || {};
  window.OpportunityOS.renderDashboard = renderDashboard;

  renderDashboard();
})();
