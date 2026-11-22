# OpportunityOS — Student Career & Opportunity Management Platform

OpportunityOS is a responsive, frontend-based platform designed to help students discover opportunities and manage their career application journey in one place.

Students can explore internships, jobs and hackathons, save interesting opportunities, track application progress, monitor deadlines and view application analytics through a clean dashboard.

## Features

### 1. Dashboard
- Overview of application statistics.
- Recent application activity.
- Upcoming opportunity deadlines.
- Quick navigation to other sections.

### 2. Explore Opportunities
- Browse sample internships, jobs and hackathons.
- Search opportunities.
- Filter by opportunity type, work mode and location.
- View detailed opportunity information.
- Bookmark opportunities for later.

### 3. My Applications
- Add and track job, internship and hackathon applications.
- Update application statuses:
  - Applied
  - Under Review
  - Interview
  - Offer
  - Rejected
- Filter applications.
- Prevent duplicate applications.
- Archive applications without permanently removing them.
- Restore archived applications.
- Permanently delete applications after confirmation.

### 4. Bookmarks
- View saved opportunities.
- Search and filter bookmarks.
- Remove saved opportunities.
- View opportunity details.
- Add bookmarked opportunities directly to the application tracker.

### 5. Analytics
- View application statistics.
- Track application status distribution.
- Monitor interview and offer conversion.
- Identify application progress and upcoming deadlines.

## Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Page structure and semantic markup |
| CSS3 | Responsive layouts and styling |
| JavaScript | Application logic and interactions |
| CSS Grid & Flexbox | Responsive UI layouts |
| LocalStorage | Browser-based data persistence |
| SVG | Interface icons |

**No frontend frameworks or external chart libraries are used.**

## Application Architecture

OpportunityOS uses a shared JavaScript data and storage layer to keep information consistent across its pages.

- A shared sample dataset provides opportunity and initial application records.
- A shared bookmark store manages saved opportunity IDs.
- A shared application store manages application records and status changes.
- Dashboard and Analytics read from the same application store.
- Archived records are excluded from active application views and statistics.
- Data is persisted using browser LocalStorage.

### LocalStorage Keys

| Key | Purpose |
|---|---|
| `opportunityos.bookmarks.v1` | Stores bookmarked opportunity IDs |
| `opportunityos.applications.v1` | Stores application records and their statuses |

## Getting Started

### Prerequisites
- A modern web browser.
- Visual Studio Code (recommended).
- Live Server extension (recommended).

### Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/Jaswanth2608/OpportunityOS.git
   ```

2. Navigate to the project directory:

   ```bash
   cd OpportunityOS
   ```

3. Open the folder in Visual Studio Code.

4. Open `index.html` using the Live Server extension.

5. Explore the application in your browser.

No backend server, package installation or build process is required.

## Project Structure

```text
OpportunityOS/
│
├── index.html
├── explore.html
├── applications.html
├── bookmarks.html
├── analytics.html
│
├── CSS/
│   └── style.css
│
├── js/
│   ├── data.js
│   └── app.js
│
├── screenshots/
│
└── README.md
```

## Responsive Design

OpportunityOS follows a mobile-first responsive design approach.

- Mobile: Off-canvas navigation and single-column layouts.
- Tablet: Responsive navigation and adaptive content grids.
- Desktop: Persistent sidebar and multi-column layouts.

The interface uses CSS Grid, Flexbox, custom properties and responsive media queries.

## Data and Limitations

This project is currently a frontend-only application prototype.

- Opportunity listings use sample data.
- Application and bookmark information is stored in the current browser.
- Data is not synchronized across devices or users.
- There is no backend, authentication system or live opportunity feed.
- Data may be reset by clearing the application's LocalStorage.

## Future Improvements

- Backend integration and database storage.
- User authentication and individual student profiles.
- Live internship and job opportunity feeds.
- Cross-device data synchronization.
- Application reminders and notifications.

## Author

**Jaswanth Chennamsetti**

Computer Science and Engineering Student

GitHub: [Jaswanth2608](https://github.com/Jaswanth2608)

Project Repository: [OpportunityOS](https://github.com/Jaswanth2608/OpportunityOS)

---

*OpportunityOS — Organize your opportunities. Track your progress. Build your career.*

* Optional interview notes, contact details and document attachments per
  application.
