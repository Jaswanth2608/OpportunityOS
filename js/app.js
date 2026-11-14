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
   OpportunityOS — bookmark store (shared by Explore and the Dashboard)
   --------------------------------------------------------------------------
   Bookmarks are just opportunity IDs, kept in localStorage under one versioned
   key. This block runs before the page modules so both Explore and the
   Dashboard read the same list and therefore always agree.

   Why only IDs? Storing IDs keeps a single source of truth for the opportunity
   details (js/data.js) and stops old copies of records piling up in storage.
   ========================================================================== */

(function () {
  "use strict";

  var STORAGE_KEY = "opportunityos.bookmarks.v1";

  /* The starting bookmarks: the records flagged saved: true in the sample
     data. They are only used the first time, when the key does not exist yet. */
  var sampleData = window.OpportunityOS_DATA || { opportunities: [] };
  var seedIds = sampleData.opportunities
    .filter(function (opportunity) {
      return opportunity.saved === true;
    })
    .map(function (opportunity) {
      return opportunity.id;
    });

  var ids = [];
  var storageAvailable = checkStorage();

  /* localStorage can be blocked (private mode, file:// restrictions). The
     store still works for the session, it just cannot remember anything. */
  function checkStorage() {
    try {
      var testKey = "opportunityos.storage-test";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /* Reads the saved IDs. Returns null when the key has never been written, so
     the caller can tell "empty" apart from "not set up yet". */
  function readIds() {
    if (!storageAvailable) {
      return null;
    }

    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === null) {
        return null;
      }

      var parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter(function (id) {
            return typeof id === "string";
          })
        : [];
    } catch (error) {
      return [];
    }
  }

  /* Saves the current IDs. A failure here only costs persistence, never the
     in-memory list, so the page keeps working. */
  function writeIds() {
    if (!storageAvailable) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (error) {
      /* Ignore: the session copy in `ids` still works. */
    }
  }

  /* Removes any repeated ID, so the store can never hold duplicates even if
     something else once wrote to the same key. */
  function withoutDuplicates(list) {
    var unique = [];
    list.forEach(function (id) {
      if (unique.indexOf(id) === -1) {
        unique.push(id);
      }
    });
    return unique;
  }

  /* --- Start-up: seed once, never overwrite ----------------------------- */
  var stored = readIds();

  if (stored === null) {
    /* First run in this browser: start from the sample saved flags. */
    ids = withoutDuplicates(seedIds);
    writeIds();
  } else {
    /* Existing bookmarks always win; they are never replaced by the seed. */
    ids = withoutDuplicates(stored);
  }

  /* --- Public methods ---------------------------------------------------- */
  function has(id) {
    return ids.indexOf(id) !== -1;
  }

  function count() {
    return ids.length;
  }

  /* Returns a copy, so callers cannot change the store by accident. */
  function list() {
    return ids.slice();
  }

  /* Adds or removes one ID and reports the new state:
     true  = the opportunity is now bookmarked
     false = the bookmark was removed */
  function toggle(id) {
    if (!id) {
      return false;
    }

    var index = ids.indexOf(id);

    if (index === -1) {
      ids.push(id);
      writeIds();
      return true;
    }

    ids.splice(index, 1);
    writeIds();
    return false;
  }

  window.OpportunityOS = window.OpportunityOS || {};
  window.OpportunityOS.bookmarks = {
    storageKey: STORAGE_KEY,
    has: has,
    count: count,
    list: list,
    toggle: toggle
  };
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

  /* Saved opportunities are read from the shared bookmark store, so the
     dashboard and Explore always show the same number. If the store is
     missing for any reason, fall back to the sample saved flags. */
  function countSaved() {
    if (window.OpportunityOS && window.OpportunityOS.bookmarks) {
      return window.OpportunityOS.bookmarks.count();
    }

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


/* ==========================================================================
   OpportunityOS — explore opportunities
   --------------------------------------------------------------------------
   This block only runs on explore.html (#explore). It filters the shared
   sample dataset, draws the cards, opens the details modal and saves
   bookmarks through the shared bookmark store above.

   Filtering is kept in one small `state` object so the four controls can
   never reset each other: every control changes one property and then calls
   render() again.
   ========================================================================== */

(function () {
  "use strict";

  /* --- Only run on the Explore page -------------------------------------- */
  var explore = document.getElementById("explore");
  if (!explore) {
    return;
  }

  var sampleData = window.OpportunityOS_DATA;
  var bookmarks = window.OpportunityOS && window.OpportunityOS.bookmarks;

  if (!sampleData || !bookmarks) {
    return;
  }

  var opportunities = sampleData.opportunities || [];

  /* --- Elements ---------------------------------------------------------- */
  var filters = document.getElementById("filters");
  var searchInput = document.getElementById("search-input");
  var locationSelect = document.getElementById("location-select");
  var typeGroup = document.querySelector('[data-filter-group="type"]');
  var modeGroup = document.querySelector('[data-filter-group="mode"]');
  var list = document.getElementById("opportunity-list");
  var emptyState = document.getElementById("opportunities-empty");
  var resultCount = document.getElementById("result-count");
  var bookmarkStatus = document.getElementById("bookmark-status");
  var clearButtons = document.querySelectorAll("[data-clear-filters]");

  var modal = document.getElementById("opportunity-modal");
  var modalTitle = document.getElementById("opportunity-modal-title");
  var modalSummary = document.getElementById("opportunity-modal-summary");
  var modalDetails = document.getElementById("opportunity-modal-details");

  /* One badge style per opportunity type, in one place. */
  var TYPE_BADGES = {
    Internship: "badge--accent",
    Job: "badge--info",
    Hackathon: "badge--strong"
  };

  /* --- State ------------------------------------------------------------- */
  var state = {
    search: "",
    type: "all",
    mode: "all",
    location: "all"
  };

  var lastFocusedElement = null;
  var toastTimer = null;

  /* --- Dates -------------------------------------------------------------
     Small local helpers. The dashboard keeps its own copy so each page module
     stays easy to read on its own. */
  var MS_PER_DAY = 24 * 60 * 60 * 1000;
  var dateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  function parseIsoDate(isoDate) {
    var parts = isoDate.split("-");
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }

  function today() {
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function formatDate(isoDate) {
    return dateFormatter.format(parseIsoDate(isoDate));
  }

  function daysUntil(isoDate) {
    return Math.round((parseIsoDate(isoDate) - today()) / MS_PER_DAY);
  }

  function countdownLabel(days) {
    if (days < 0) {
      return "Closed";
    }
    if (days === 0) {
      return "today";
    }
    if (days === 1) {
      return "tomorrow";
    }
    return "in " + days + " days";
  }

  /* --- Filtering --------------------------------------------------------- */

  function matchesFilters(opportunity) {
    var term = state.search.trim().toLowerCase();

    /* Search covers both the title and the organisation. */
    if (term) {
      var searchable = (
        opportunity.title +
        " " +
        opportunity.organisation
      ).toLowerCase();

      if (searchable.indexOf(term) === -1) {
        return false;
      }
    }

    if (state.type !== "all" && opportunity.type !== state.type) {
      return false;
    }

    if (state.mode !== "all" && opportunity.mode !== state.mode) {
      return false;
    }

    if (state.location !== "all" && opportunity.location !== state.location) {
      return false;
    }

    return true;
  }

  /* --- Card building ----------------------------------------------------- */

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

  function buildCard(opportunity) {
    var card = createElement("li", "card opportunity-card");

    /* Header: title and type badge. */
    var header = createElement("div", "card__header");
    header.appendChild(createElement("h3", "card__title", opportunity.title));

    var badgeClass = TYPE_BADGES[opportunity.type] || "badge--neutral";
    header.appendChild(
      createElement("span", "badge " + badgeClass, opportunity.type)
    );
    card.appendChild(header);

    /* Organisation, mode and location. */
    card.appendChild(
      createElement("p", "opportunity-card__org", opportunity.organisation)
    );
    card.appendChild(
      createElement(
        "p",
        "opportunity-card__meta",
        opportunity.mode + " \u00b7 " + opportunity.location
      )
    );

    /* Deadline with a machine-readable <time> element. */
    var days = daysUntil(opportunity.deadline);
    var deadline = createElement("p", "opportunity-card__deadline");
    var time = createElement("time", "", formatDate(opportunity.deadline));
    time.setAttribute("datetime", opportunity.deadline);
    deadline.appendChild(document.createTextNode("Closes "));
    deadline.appendChild(time);
    deadline.appendChild(
      document.createTextNode(" \u00b7 " + countdownLabel(days))
    );
    card.appendChild(deadline);

    card.appendChild(
      createElement("p", "opportunity-card__summary", opportunity.summary)
    );

    /* Footer: Save / Saved toggle and View details. */
    var footer = createElement("div", "card__footer");
    var isSaved = bookmarks.has(opportunity.id);

    var saveButton = createElement(
      "button",
      "btn btn--secondary",
      isSaved ? "Saved" : "Save"
    );
    saveButton.type = "button";
    saveButton.setAttribute("aria-pressed", isSaved ? "true" : "false");
    saveButton.setAttribute("data-action", "bookmark");
    saveButton.setAttribute("data-id", opportunity.id);
    footer.appendChild(saveButton);

    var detailsButton = createElement(
      "button",
      "btn btn--tertiary",
      "View details"
    );
    detailsButton.type = "button";
    detailsButton.setAttribute("data-action", "details");
    detailsButton.setAttribute("data-id", opportunity.id);
    detailsButton.setAttribute(
      "aria-label",
      "View details for " + opportunity.title
    );
    footer.appendChild(detailsButton);

    card.appendChild(footer);
    return card;
  }

  /* --- Rendering --------------------------------------------------------- */

  function render() {
    var matches = opportunities.filter(matchesFilters);

    list.textContent = "";
    resultCount.textContent =
      "Showing " +
      matches.length +
      " of " +
      opportunities.length +
      " sample opportunities";

    if (matches.length === 0) {
      list.hidden = true;
      emptyState.hidden = false;
      return;
    }

    list.hidden = false;
    emptyState.hidden = true;

    matches.forEach(function (opportunity) {
      list.appendChild(buildCard(opportunity));
    });
  }

  /* --- Bookmarking -------------------------------------------------------- */

  function announce(message) {
    if (!bookmarkStatus) {
      return;
    }

    bookmarkStatus.textContent = message;
    bookmarkStatus.classList.add("is-visible");

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      bookmarkStatus.classList.remove("is-visible");
      bookmarkStatus.textContent = "";
    }, 3000);
  }

  function toggleBookmark(opportunity, button) {
    /* The store prevents duplicates and reports the new state. */
    var isSaved = bookmarks.toggle(opportunity.id);

    button.setAttribute("aria-pressed", isSaved ? "true" : "false");
    button.textContent = isSaved ? "Saved" : "Save";

    announce((isSaved ? "Saved " : "Removed ") + opportunity.title);
  }

  /* --- Details modal ------------------------------------------------------ */

  function addDetail(label, value) {
    modalDetails.appendChild(createElement("dt", "", label));
    modalDetails.appendChild(createElement("dd", "", value));
  }

  function openModal(opportunity, trigger) {
    lastFocusedElement = trigger || document.activeElement;

    modalTitle.textContent = opportunity.title;
    modalSummary.textContent = opportunity.summary;
    modalDetails.textContent = "";

    addDetail("Organisation", opportunity.organisation);
    addDetail("Type", opportunity.type);
    addDetail("Work mode", opportunity.mode);
    addDetail("Location", opportunity.location);
    addDetail("Deadline", formatDate(opportunity.deadline));
    addDetail("Time left", countdownLabel(daysUntil(opportunity.deadline)));

    modal.hidden = false;
    document.addEventListener("keydown", handleModalKeydown);

    /* Focus the close button so keyboard users start inside the dialog. */
    var closeButton = modal.querySelector("[data-modal-close]");
    if (closeButton) {
      closeButton.focus();
    }
  }

  function closeModal() {
    if (modal.hidden) {
      return;
    }

    modal.hidden = true;
    document.removeEventListener("keydown", handleModalKeydown);

    /* Return focus to the button that opened the dialog. */
    if (lastFocusedElement && document.contains(lastFocusedElement)) {
      lastFocusedElement.focus();
    } else {
      searchInput.focus();
    }

    lastFocusedElement = null;
  }

  function handleModalKeydown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }

    /* Keep Tab inside the dialog while it is open. */
    if (event.key !== "Tab") {
      return;
    }

    var focusable = modal.querySelectorAll(
      "button:not([disabled]), a[href], input, select, textarea"
    );

    if (focusable.length === 0) {
      return;
    }

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* --- Clearing ----------------------------------------------------------- */

  function clearFilters() {
    var focusWasInEmptyState = emptyState.contains(document.activeElement);

    state.search = "";
    state.type = "all";
    state.mode = "all";
    state.location = "all";

    searchInput.value = "";
    locationSelect.value = "all";

    [typeGroup, modeGroup].forEach(function (group) {
      if (!group) {
        return;
      }

      Array.prototype.forEach.call(
        group.querySelectorAll("button[data-value]"),
        function (chip) {
          var isAll = chip.getAttribute("data-value") === "all";
          chip.setAttribute("aria-pressed", isAll ? "true" : "false");
        }
      );
    });

    render();

    /* If the empty state's button is what was clicked, it is about to be
       hidden, so move focus somewhere sensible instead of losing it. */
    if (focusWasInEmptyState) {
      searchInput.focus();
    }
  }

  /* --- Wiring ------------------------------------------------------------- */

  /* Location options come from the dataset, so they can never drift out of
     date when the sample data changes. */
  function fillLocations() {
    var locations = [];

    opportunities.forEach(function (opportunity) {
      if (locations.indexOf(opportunity.location) === -1) {
        locations.push(opportunity.location);
      }
    });

    locations.sort();

    locations.forEach(function (location) {
      var option = document.createElement("option");
      option.value = location;
      option.textContent = location;
      locationSelect.appendChild(option);
    });
  }

  /* The form has no submit button, but pressing Enter in the search field can
     still submit it; keep the page where it is. */
  if (filters) {
    filters.addEventListener("submit", function (event) {
      event.preventDefault();
    });
  }

  searchInput.addEventListener("input", function () {
    state.search = searchInput.value;
    render();
  });

  locationSelect.addEventListener("change", function () {
    state.location = locationSelect.value;
    render();
  });

  /* Each chip group updates only its own part of the state. */
  [typeGroup, modeGroup].forEach(function (group) {
    if (!group) {
      return;
    }

    group.addEventListener("click", function (event) {
      var chip = event.target.closest("button[data-value]");
      if (!chip) {
        return;
      }

      var key = group.getAttribute("data-filter-group");
      if (!key) {
        return;
      }

      state[key] = chip.getAttribute("data-value");

      Array.prototype.forEach.call(
        group.querySelectorAll("button[data-value]"),
        function (item) {
          item.setAttribute(
            "aria-pressed",
            item === chip ? "true" : "false"
          );
        }
      );

      render();
    });
  });

  Array.prototype.forEach.call(clearButtons, function (button) {
    button.addEventListener("click", clearFilters);
  });

  /* One listener on the list handles both card actions. */
  list.addEventListener("click", function (event) {
    var button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }

    var id = button.getAttribute("data-id");
    var opportunity = opportunities.filter(function (item) {
      return item.id === id;
    })[0];

    if (!opportunity) {
      return;
    }

    if (button.getAttribute("data-action") === "bookmark") {
      toggleBookmark(opportunity, button);
    } else {
      openModal(opportunity, button);
    }
  });

  /* Close the modal with its buttons or the backdrop. */
  modal.addEventListener("click", function (event) {
    if (event.target.closest("[data-modal-close]") || event.target.closest("[data-modal-backdrop]")) {
      closeModal();
    }
  });

  fillLocations();
  render();
})();
