# Cost Visualization

A modern, React-based CRUD application for managing and visualizing money transactions. Designed with a premium dark mode UI, it allows users to track expenses in PLN and view real-time currency conversions.

[**Live Demo**](https://spoomyfly.github.io/Cost_visualization)

## Features

- **Transaction Management**: Add, edit, and delete transactions with a premium custom confirmation modal.
- **Live Dashboard**:
    - **Pie Chart**: Visual distribution of expenses by category.
    - **Cumulative Growth**: Line chart showing spending trends over time.
    - **Daily Heatmap**: Calendar-style view of spending intensity.
    - **Top Expenses**: Ranked list of the most expensive purchases.
- **Data Normalization**:
    - **Dates**: Automatically formatted to `DD.MM.YY`.
    - **Types**: Normalized to uppercase with special characters removed (e.g., "Food & Drink" → "FOODDRINK") for easy grouping.
- **Currency Support**:
    - Base currency: **PLN (zł)**.
    - **Live Conversion**: View transaction amounts and total sum converted to **EUR**, **USD**, **BYN**, or **RUB** using real-time exchange rates.
- **Cloud Sync**: Securely save and fetch data using **Firebase Realtime Database** with **Google Authentication** (and Anonymous Auth support).
- **JSON Export/Import**: Generate or import JSON datasets for flexibility.
- **Project Scope**: Organize transactions by Project. Toggle between Global view (All Projects) or specific Project views.
- **Advanced Filtering**: Search by name/type and filter by Date Range in both List and Dashboard views.
- **Pagination**: Browse the transaction list a page at a time with a configurable page size (10/25/50/100), first/previous/next/last navigation, and jump-to-page by clicking the current page number.
- **Bulk Actions**: Select multiple transactions to transfer them between projects in one click.
- **Settings Panel** (⚙️ in the header): App-wide preferences, persisted in `localStorage`.
    - **Remember Last Entry**: When enabled, adding a transaction pre-fills the project and date of the *next* new transaction from the one you just entered. This memory is kept for 2 minutes.
- **Modern UI**: Glassmorphism design, responsive layout, and smooth animations.

## Architecture

- **Frontend**: React 19 + Vite
- **Styling**: Vanilla CSS (Variables, Flexbox/Grid, Glassmorphism)
- **Database**: Firebase Realtime Database
- **Authentication**: Firebase Anonymous Auth
- **Services**:
  - `dbService.js`: Handles Firebase Realtime Database operations (Save, Fetch).
  - `authService.js`: Manages Firebase Authentication (Google Sign-In, Anonymous Auth).
  - `requestBuilder.js`: Prepares data payloads for API/DB.
  - `dataRetrievalService.js`: Validates and maps imported JSON data.
- **Config**: `config.js` manages environment variables via `.env`.

## Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Vanilla CSS
- **API**: [Open Exchange Rates API](https://open.er-api.com) for currency data.
- **Testing**: Vitest + React Testing Library
- **Deployment**: GitHub Pages

## Getting Started

Follow these instructions to set up the project locally from scratch.

### Prerequisites

- **Node.js**: Ensure you have Node.js installed (v18+ recommended).
- **Git**: To clone the repository.

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/spoomyfly/Cost_visualization.git
    cd Cost_visualization
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

### Running Locally

Start the development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173` (or the URL shown in your terminal).

### Building for Production

To create a production-ready build:
```bash
npm run build
```
The output will be in the `dist` folder.

### Deployment

This project is configured for deployment to GitHub Pages.

**Automatic (recommended)**: `.github/workflows/deploy.yml` builds and deploys on every push to `main` (and via manual `workflow_dispatch`). It runs the test suite, then builds with the Firebase config pulled from **repository secrets**, then publishes `dist/` to the `gh-pages` branch. The following secrets must be set under *Settings → Secrets and variables → Actions*:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
VITE_FIREBASE_DATABASE_URL
VITE_GOOGLE_SHEETS_API_KEY
```

**Manual**: you can still deploy locally with:
```bash
npm run deploy
```
This builds the project and pushes `dist/` to the `gh-pages` branch — but only do this from a machine with a real `.env` (see `.env.example`) populated with the values above. Running it without `.env` produces a build with no Firebase config, which silently breaks Google Sign-In and Cloud Sync (Firebase auth stays uninitialized rather than erroring loudly). Prefer letting the GitHub Action handle deploys.

## Project Structure

```
Cost_visualization/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── TransactionForm.jsx  # Form for adding/editing
│   │   ├── TransactionList.jsx  # List view with conversion logic
│   │   ├── Dashboard.jsx        # Data visualizations
│   │   ├── Auth.jsx             # Authentication UI
│   │   ├── ConfirmModal.jsx     # Custom confirmation dialog
│   │   ├── ProjectSelectionModal.jsx # Selection dialog for bulk transfers
│   │   ├── SettingsPanel.jsx    # App settings (e.g. Remember Last Entry)
│   │   └── Notification.jsx     # Toast notifications
│   ├── services/        # Business logic & API calls
│   │   ├── authService.js       # Firebase Auth logic
│   │   ├── dbService.js         # Firebase DB logic
│   │   └── firebase.js          # Firebase initialization
│   ├── hooks/           # Custom React hooks
│   ├── i18n/            # Internationalization (PL, EN, UK, RU)
│   ├── test/            # Unit & integration tests
│   ├── App.jsx          # Main application logic & state
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles & variables
├── package.json         # Dependencies & scripts
├── vite.config.js       # Vite configuration
└── README.md            # Project documentation
```

## License

MIT
