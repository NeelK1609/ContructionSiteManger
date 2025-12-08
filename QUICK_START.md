# Quick Start Guide

Get your Construction Site Manager up and running in minutes!

## 🚀 Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Base44 API credentials:

```env
VITE_BASE44_API_KEY=your_api_key_here
VITE_BASE44_PROJECT_ID=your_project_id_here
VITE_BASE44_BASE_URL=https://api.base44.com
```

### 3. Update API Client

Edit `ContructionSiteManger/api/base44Client.ts` and replace the mock implementation with your actual Base44 SDK:

```typescript
import { Base44Client } from '@base44/sdk';

export const base44 = new Base44Client({
  apiKey: import.meta.env.VITE_BASE44_API_KEY,
  projectId: import.meta.env.VITE_BASE44_PROJECT_ID,
  baseUrl: import.meta.env.VITE_BASE44_BASE_URL || 'https://api.base44.com',
});
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## 🌐 Deploy to Azure App Service

See [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Steps:

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Create Azure App Service** (via Portal or CLI)

3. **Set environment variables** in Azure Portal:
   - `VITE_BASE44_API_KEY`
   - `VITE_BASE44_PROJECT_ID`
   - `VITE_BASE44_BASE_URL`

4. **Deploy** using one of these methods:
   - GitHub Actions (CI/CD)
   - Azure CLI
   - Zip Deploy
   - Local Git

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm start` - Start production server (after build)

## 📁 Project Structure

```
ContructionSiteManger/
├── Components/          # Reusable UI components
│   ├── dashboard/      # Dashboard components
│   ├── flats/          # Flat-related components
│   ├── materials/      # Material-related components
│   └── ui/             # shadcn/ui components
├── Entities/            # Data model definitions (JSON schemas)
├── Pages/               # Page components
│   ├── Dashboard.ts    # Main dashboard
│   ├── Flats.ts        # Flats listing
│   ├── FlatDetails.ts  # Flat details page
│   └── Materials.ts    # Materials management
├── api/                 # API client configuration
├── lib/                 # Utility libraries
├── utils.ts            # Utility functions
├── Layout.tsx          # Main layout component
├── App.tsx             # Main app component with routing
└── main.tsx            # Entry point
```

## 🔧 Troubleshooting

### Issue: Module not found errors

**Solution**: Make sure all dependencies are installed:
```bash
npm install
```

### Issue: TypeScript errors

**Solution**: Check that all files have proper TypeScript types. The project uses strict TypeScript.

### Issue: Tailwind CSS not working

**Solution**: Ensure `tailwind.config.js` includes all your component paths.

### Issue: API calls failing

**Solution**: 
- Check your `.env` file has correct values
- Verify Base44 API client is properly configured
- Check browser console for CORS errors

## 📚 Next Steps

1. **Configure Base44 API**: Update `base44Client.ts` with your actual SDK
2. **Customize UI**: Modify components in `Components/` directory
3. **Add Features**: See suggestions in main README
4. **Deploy**: Follow Azure deployment guide

## 💡 Tips

- Use `npm run dev` for hot-reload during development
- Check browser console for helpful error messages
- Use React DevTools for debugging
- Enable Application Insights in Azure for production monitoring

## 🆘 Need Help?

- Check [README.md](./README.md) for detailed documentation
- Review [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md) for deployment help
- Check Azure App Service logs for deployment issues

