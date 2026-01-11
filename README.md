# ExpenseTracker

A responsive React web application optimized for receipt and expense tracking. Designed for use on both mobile (via camera capture) and desktop browsers.

## Key Features
- **Receipt Capture**: Capture receipts using your device camera or upload image files.
- **Categorization**: Organize by Expense Type, Customer, and Project.
- **Mileage Logging**: Track distance for travel expenses.
- **PDF Reporting**: Generate summary reports on demand.
- **PWA Support**: Install it on your phone for a native-like experience and offline access.
- **Privacy**: All data is stored locally in your browser.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

#### Development Mode
To start the development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

#### Production Build
To create an optimized production build:
```bash
npm run build
```
The output will be in the `dist/` directory.

#### Preview Production Build
To preview the production build locally:
```bash
npm run preview
```

## Technologies Used
- **Frontend**: React (Vite + SWC)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **PDF Generation**: jsPDF + jsPDF-autotable
- **PWA**: vite-plugin-pwa
- **Date Handling**: date-fns
