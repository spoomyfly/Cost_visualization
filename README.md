# Cost Visualization

A modern, React-based CRUD application for managing and visualizing money transactions. Designed with a premium dark mode UI, it allows users to track expenses in PLN and view real-time currency conversions.

[**Live Demo**](https://Spoom.github.io/Cost_visualization)

## Features

- **Transaction Management**: Add, edit, and delete transactions.
- **Data Normalization**:
    - **Dates**: Automatically formatted to `DD.MM.YY`.
    - **Types**: Normalized to uppercase with special characters removed (e.g., "Food & Drink" → "FOODDRINK") for easy grouping.
- **Currency Support**:
    - Base currency: **PLN (zł)**.
    - **Live Conversion**: View transaction amounts and total sum converted to **EUR**, **USD**, **BYN**, or **RUB** using real-time exchange rates.
- **JSON Export**: Generate a clean JSON dataset of your transactions for external processing.
- **Modern UI**: Glassmorphism design, responsive layout, and smooth animations.

## Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Vanilla CSS (Variables, Flexbox/Grid, Glassmorphism)
- **API**: [Open Exchange Rates API](https://open.er-api.com) for currency data.
- **Deployment**: GitHub Pages

## Getting Started

Follow these instructions to set up the project locally from scratch.

### Prerequisites

- **Node.js**: Ensure you have Node.js installed (v18+ recommended).
- **Git**: To clone the repository.

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Spoom/Cost_visualization.git
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
│   │   └── TransactionList.jsx  # List view with conversion logic
│   ├── App.jsx          # Main application logic & state
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles & variables
├── package.json         # Dependencies & scripts
├── vite.config.js       # Vite configuration
└── README.md            # Project documentation
```

## License

MIT
