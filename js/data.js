/* ==========================================================================
   OpportunityOS — sample dataset
   --------------------------------------------------------------------------
   This file holds the demo data the interface runs on. It is SAMPLE DATA,
   written for this project. There is no server, no database and no account
   system behind it, and nothing here is fetched from a real service.

   Two rules to keep in mind:
     1. Everything is read-only here. Later milestones will store a student's
        own bookmarks and applications in localStorage, on top of this data.
     2. Deadlines are generated relative to today, so the dashboard always has
        upcoming and closing-soon examples to show, whenever it is opened.
   ========================================================================== */

(function () {
  "use strict";

  /* Returns a date string like "2026-11-20" that is `days` days from today.
     Midday is used so that daylight-saving changes cannot shift the date. */
  function isoDateInDays(days) {
    var date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + days);

    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");

    return date.getFullYear() + "-" + month + "-" + day;
  }

  /* --- Opportunities ----------------------------------------------------
     deadline : ISO date string (YYYY-MM-DD) — easier to compare and sort
     saved    : sample starting value for the bookmarks count
     ---------------------------------------------------------------------- */
  var opportunities = [
    {
      id: "opp-1",
      title: "Product Design Intern",
      organisation: "Northwind Studio",
      type: "Internship",
      mode: "Remote",
      location: "Remote (UK)",
      deadline: isoDateInDays(3),
      saved: true,
      summary:
        "Twelve-week paid internship working on design systems with a small product team."
    },
    {
      id: "opp-2",
      title: "Data Analyst Placement",
      organisation: "Meridian Health",
      type: "Graduate scheme",
      mode: "Hybrid",
      location: "Manchester",
      deadline: isoDateInDays(9),
      saved: false,
      summary:
        "Year-long placement analysing patient-flow data alongside the analytics team."
    },
    {
      id: "opp-3",
      title: "Frontend Engineering Internship",
      organisation: "Kestrel Labs",
      type: "Internship",
      mode: "Remote",
      location: "Remote (UK)",
      deadline: isoDateInDays(12),
      saved: true,
      summary:
        "Build accessible interface components in HTML, CSS and JavaScript."
    },
    {
      id: "opp-4",
      title: "Women in Tech Scholarship",
      organisation: "Iota Foundation",
      type: "Scholarship",
      mode: "Remote",
      location: "Remote",
      deadline: isoDateInDays(18),
      saved: false,
      summary:
        "Tuition support and mentoring for students entering technology careers."
    },
    {
      id: "opp-5",
      title: "UX Research Assistant",
      organisation: "University of Leeds",
      type: "Part-time role",
      mode: "On-site",
      location: "Leeds",
      deadline: isoDateInDays(24),
      saved: true,
      summary:
        "Support usability studies and help summarise findings for the research group."
    },
    {
      id: "opp-6",
      title: "Product Management Workshop",
      organisation: "Launchpad",
      type: "Workshop",
      mode: "Online",
      location: "Online",
      deadline: isoDateInDays(29),
      saved: false,
      summary:
        "Two-day introduction to discovery, roadmaps and writing a clear product brief."
    },
    {
      id: "opp-7",
      title: "Marketing Internship",
      organisation: "Bright & Co",
      type: "Internship",
      mode: "Hybrid",
      location: "London",
      deadline: isoDateInDays(-5),
      saved: false,
      summary:
        "Closed example: this deadline has already passed and must not appear as upcoming."
    },
    {
      id: "opp-8",
      title: "Analytics Graduate Programme",
      organisation: "Halcyon Group",
      type: "Graduate scheme",
      mode: "On-site",
      location: "Bristol",
      deadline: isoDateInDays(75),
      saved: false,
      summary:
        "Later example: opens well beyond the 30-day window used by the dashboard."
    }
  ];

  /* --- Applications -----------------------------------------------------
     status must be one of the keys in the dashboard's status-to-badge map:
     "Applied", "Under review", "Interview", "Offer", "Rejected".
     ---------------------------------------------------------------------- */
  var applications = [
    {
      id: "app-1",
      opportunityId: "opp-1",
      title: "Product Design Intern",
      company: "Northwind Studio",
      appliedOn: isoDateInDays(-3),
      status: "Under review"
    },
    {
      id: "app-2",
      opportunityId: "opp-3",
      title: "Frontend Engineering Internship",
      company: "Kestrel Labs",
      appliedOn: isoDateInDays(-6),
      status: "Interview"
    },
    {
      id: "app-3",
      opportunityId: "opp-2",
      title: "Data Analyst Placement",
      company: "Meridian Health",
      appliedOn: isoDateInDays(-9),
      status: "Applied"
    },
    {
      id: "app-4",
      opportunityId: "opp-5",
      title: "UX Research Assistant",
      company: "University of Leeds",
      appliedOn: isoDateInDays(-14),
      status: "Offer"
    },
    {
      id: "app-5",
      opportunityId: "opp-7",
      title: "Marketing Internship",
      company: "Bright & Co",
      appliedOn: isoDateInDays(-21),
      status: "Rejected"
    }
  ];

  /* Published on a single global so every page can read the same dataset.
     This is the only global the project creates. */
  window.OpportunityOS_DATA = {
    opportunities: opportunities,
    applications: applications
  };
})();
