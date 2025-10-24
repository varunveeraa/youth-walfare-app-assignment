# Deployment Guide for MindBridge Youth Wellness Platform

## 🚀 Multi-Platform Deployment Support

This project supports deployment to multiple platforms with optimized configurations:
- **GitHub Pages** (with CI/CD)
- **Cloudflare Pages**
- **Netlify**
- **Firebase Hosting**

## 🚀 GitHub Pages Deployment with CI/CD

### Prerequisites for GitHub Pages
- GitHub account
- Repository with GitHub Actions enabled

### Automatic Deployment Setup

1. **Push to Repository**: The GitHub Actions workflow is already configured
2. **Automatic Build**: Every push to `main` branch triggers:
   - Dependency installation
   - Production build with optimizations
   - Deployment to `gh-pages` branch
3. **Access**: Your app will be available at `https://username.github.io/repository-name/`

### Manual GitHub Pages Setup

If you need to set up GitHub Pages manually:

1. Go to repository Settings > Pages
2. Select source: "Deploy from a branch"
3. Choose branch: `gh-pages`
4. Click Save

## 🚀 Cloudflare Pages Deployment

### Prerequisites for Cloudflare
- Cloudflare account
- GitHub repository connected to Cloudflare Pages

### Build Configuration for Cloudflare Pages

1. **Build Command**: `npm run build`
2. **Build Output Directory**: `dist`
3. **Root Directory**: `/` (project root)
4. **Node.js Version**: `20.x` or `22.x`

### Environment Variables
Set these in your Cloudflare Pages dashboard:

```env
VITE_MAPBOX_TOKEN=your_mapbox_token_here
VITE_SENDGRID_API_KEY=your_sendgrid_api_key_here
```

### Deployment Steps

1. **Connect Repository**:
   - Go to Cloudflare Pages dashboard
   - Click "Create a project"
   - Connect your GitHub repository

2. **Configure Build Settings**:
   ```
   Framework preset: None
   Build command: npm run build
   Build output directory: dist
   Root directory: /
   ```

3. **Set Environment Variables**:
   - Go to Settings > Environment variables
   - Add your environment variables

4. **Deploy**:
   - Click "Save and Deploy"
   - Wait for the build to complete

### Build Process

The build process includes:
1. Vite builds the application
2. Post-build script (`fix-paths.js`) converts absolute paths to relative paths
3. Optimizes assets for static hosting

### Troubleshooting

#### White Screen Issue
- **Cause**: Absolute paths in built files
- **Solution**: Use `npm run build` which includes the path-fixing script

#### Module Resolution Errors
- **Cause**: Incorrect base path configuration
- **Solution**: The `vite.config.js` is configured with `base: './'` for relative paths

#### Large Bundle Size
- The build includes warnings about large chunks
- Consider implementing code splitting for production optimization

### Firebase Hosting (Alternative)

If using Firebase Hosting instead:

1. **Install Firebase CLI**: `npm install -g firebase-tools`
2. **Login**: `firebase login`
3. **Initialize**: `firebase init hosting`
4. **Configure**: Set public directory to `dist`
5. **Deploy**: `firebase deploy --only hosting`

### Performance Optimization

The current build generates large chunks. For production optimization:

1. **Code Splitting**: Implement dynamic imports for routes
2. **Bundle Analysis**: Use `npm run build -- --analyze`
3. **Asset Optimization**: Consider image compression and lazy loading

### Security Considerations

- Environment variables are properly prefixed with `VITE_`
- Firebase configuration should use environment variables in production
- API keys should be restricted by domain in their respective services

### Monitoring

After deployment:
- Check browser console for any remaining errors
- Verify all routes work correctly
- Test form submissions and API integrations
- Monitor performance with Cloudflare Analytics
