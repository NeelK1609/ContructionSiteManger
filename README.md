# Construction Site Manager

A modern web application for managing construction sites, tracking materials inventory, monitoring flat progress, and managing work notes.

## Features

- 📊 **Dashboard**: Overview of materials, flats, and pending issues
- 🏢 **Flats Management**: Track construction status for each unit
- 📝 **Work Notes**: Create and manage work notes with categories and priorities
- 📦 **Materials Inventory**: Track stock levels, locations, and transactions
- 📈 **Material History**: View complete transaction history for materials

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **React Router** for navigation
- **TanStack Query** for data fetching
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Base44** API for backend

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and configure your Base44 API credentials:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Azure App Service Deployment

This application is configured for deployment to Azure App Service.

### Deployment Steps

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy to Azure App Service:**
   - Use Azure Portal, Azure CLI, or GitHub Actions
   - The `web.config` file is included for proper SPA routing
   - Set environment variables in Azure App Service Configuration

3. **Configure Environment Variables in Azure:**
   - Go to Azure Portal → Your App Service → Configuration → Application Settings
   - Add the following variables:
     - `VITE_BASE44_API_KEY`
     - `VITE_BASE44_PROJECT_ID`
     - `VITE_BASE44_BASE_URL` (optional)

### Important Notes for Azure Deployment

- The `web.config` file handles SPA routing (all routes redirect to index.html)
- Make sure to set the Node.js version in Azure App Service settings
- For static site hosting, you can also use Azure Static Web Apps

## Project Structure

```
ContructionSiteManger/
├── Components/          # Reusable UI components
│   ├── dashboard/      # Dashboard components
│   ├── flats/          # Flat-related components
│   └── materials/      # Material-related components
├── Entities/            # Data model definitions (JSON schemas)
├── Pages/               # Page components
├── api/                 # API client configuration
├── utils.ts            # Utility functions
├── Layout.js           # Main layout component
├── App.tsx             # Main app component with routing
└── main.tsx            # Entry point
```

## API Configuration

The application uses Base44 as the backend API. Configure your API credentials in the `.env` file or Azure App Service environment variables.

Update `ContructionSiteManger/api/base44Client.ts` with your actual Base44 SDK initialization.

## Development

- Run `npm run dev` for development server
- Run `npm run build` for production build
- Run `npm run preview` to preview production build
- Run `npm run lint` to check code quality

## License

MIT

