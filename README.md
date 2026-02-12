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

1.  **Build and Deploy**:
    ```bash
    npm run deploy
    ```
    This command builds the project and pushes the `dist` folder to the `gh-pages` branch.

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
