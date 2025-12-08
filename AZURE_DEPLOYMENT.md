# Azure App Service Deployment Guide

This guide will help you deploy the Construction Site Manager application to Azure App Service.

## Prerequisites

1. **Azure Account**: An active Azure subscription
2. **Azure CLI** (optional but recommended): [Install Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
3. **Git**: For version control
4. **Node.js 18+**: For building the application locally

## Deployment Options

### Option 1: Deploy via Azure Portal (Recommended for beginners)

#### Step 1: Build the Application Locally

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

#### Step 2: Create Azure App Service

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Web App" and select it
4. Click "Create"
5. Fill in the details:
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Create new or use existing
   - **Name**: Your app name (e.g., `construction-site-manager`)
   - **Publish**: Code
   - **Runtime stack**: Node.js 18 LTS or 20 LTS
   - **Operating System**: Linux (recommended) or Windows
   - **Region**: Choose closest to your users
   - **App Service Plan**: Create new or use existing
6. Click "Review + create", then "Create"

#### Step 3: Configure Deployment

1. Go to your App Service in Azure Portal
2. Navigate to **Deployment Center**
3. Choose your deployment source:
   - **GitHub**: Connect your GitHub repository
   - **Local Git**: Use local Git repository
   - **Zip Deploy**: Upload a zip file
   - **FTP**: Use FTP client

#### Step 4: Configure Build Settings

1. Go to **Configuration** → **General settings**
2. Set **Startup Command** to:
   ```
   npm run build && npx serve -s dist -l 8080
   ```
   OR if using a Node.js runtime:
   ```
   npm start
   ```

3. For static site hosting (recommended), you can also:
   - Use **Static Web Apps** instead of App Service
   - Or configure a simple Node.js server

#### Step 5: Set Environment Variables

1. Go to **Configuration** → **Application settings**
2. Add the following environment variables:
   - `VITE_BASE44_API_KEY`: Your Base44 API key
   - `VITE_BASE44_PROJECT_ID`: Your Base44 project ID
   - `VITE_BASE44_BASE_URL`: Your Base44 API URL (optional)

3. Click **Save**

#### Step 6: Deploy

- If using GitHub: Push to your repository, Azure will auto-deploy
- If using Zip Deploy: Upload the `dist` folder as a zip file
- If using Local Git: Follow the instructions in Deployment Center

### Option 2: Deploy via Azure CLI

```bash
# Login to Azure
az login

# Create a resource group (if needed)
az group create --name construction-site-rg --location eastus

# Create App Service Plan
az appservice plan create \
  --name construction-site-plan \
  --resource-group construction-site-rg \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --resource-group construction-site-rg \
  --plan construction-site-plan \
  --name construction-site-manager \
  --runtime "NODE:18-lts"

# Configure environment variables
az webapp config appsettings set \
  --resource-group construction-site-rg \
  --name construction-site-manager \
  --settings \
    VITE_BASE44_API_KEY="your-api-key" \
    VITE_BASE44_PROJECT_ID="your-project-id" \
    VITE_BASE44_BASE_URL="https://api.base44.com"

# Deploy from local build
npm run build
cd dist
zip -r ../deploy.zip .
cd ..
az webapp deployment source config-zip \
  --resource-group construction-site-rg \
  --name construction-site-manager \
  --src deploy.zip
```

### Option 3: Deploy via GitHub Actions (CI/CD)

Create `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure App Service

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        VITE_BASE44_API_KEY: ${{ secrets.VITE_BASE44_API_KEY }}
        VITE_BASE44_PROJECT_ID: ${{ secrets.VITE_BASE44_PROJECT_ID }}
        VITE_BASE44_BASE_URL: ${{ secrets.VITE_BASE44_BASE_URL }}
    
    - name: Deploy to Azure
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'construction-site-manager'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: ./dist
```

## Important Configuration Notes

### 1. SPA Routing Configuration

The `web.config` file is included for Windows App Service. For Linux App Service, you may need to:

1. Create a `staticwebapp.config.json` in the `dist` folder, OR
2. Use Azure Static Web Apps instead

### 2. Static Web Apps (Alternative)

For a pure static site, consider Azure Static Web Apps:

```bash
# Install Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Deploy
swa deploy ./dist --deployment-token YOUR_TOKEN
```

### 3. Custom Domain

1. Go to **Custom domains** in your App Service
2. Add your domain
3. Configure DNS records as instructed

### 4. HTTPS/SSL

- Azure App Service provides free SSL certificates via Let's Encrypt
- Go to **TLS/SSL settings** → **Private Key Certificates (.pfx)**
- Enable HTTPS Only in **TLS/SSL settings**

## Troubleshooting

### Issue: Routes not working (404 errors)

**Solution**: Ensure `web.config` is in the root of your deployment, or configure URL rewrite rules.

### Issue: Environment variables not working

**Solution**: 
- Restart the app after setting environment variables
- For Vite, variables must start with `VITE_`
- Rebuild the app after changing environment variables

### Issue: Build fails

**Solution**:
- Check Node.js version (should be 18+)
- Ensure all dependencies are in `package.json`
- Check build logs in Azure Portal → Deployment Center → Logs

### Issue: API calls failing

**Solution**:
- Verify environment variables are set correctly
- Check CORS settings on your API
- Verify API endpoints in browser console

## Monitoring

1. **Application Insights**: Enable in Azure Portal for monitoring
2. **Logs**: View in **Log stream** or **Logs** section
3. **Metrics**: Monitor in **Metrics** section

## Cost Optimization

- Use **Free** or **Basic** tier for development
- Use **Standard** tier for production
- Consider **Azure Static Web Apps** for lower costs (free tier available)

## Next Steps

1. Set up custom domain
2. Configure Application Insights
3. Set up staging environment
4. Configure auto-scaling
5. Set up backup and disaster recovery

## Support

For issues:
- Check Azure App Service logs
- Review [Azure App Service documentation](https://docs.microsoft.com/azure/app-service/)
- Check [Vite deployment guide](https://vitejs.dev/guide/static-deploy.html)

