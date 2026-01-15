# Deployment Guide

Complete guide for deploying the DMS Firebase Firestore application to production.

## Prerequisites

- Firebase project configured
- All environment variables set
- Service account key with proper permissions
- Firebase CLI installed and logged in

---

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Firestore security rules tested
- [ ] Firestore indexes deployed
- [ ] Service account permissions verified
- [ ] Error handling tested
- [ ] Logging configured
- [ ] Backup strategy in place

---

## Environment Setup

### Production Environment Variables

Create a `.env.production` file or set environment variables in your hosting platform:

```env
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

FIREBASE_PROJECT_ID=your-production-project-id
FIREBASE_SERVICE_ACCOUNT_KEY=./serviceAccountKey.json
# ... other Firebase config
```

---

## Deployment Options

### Option 1: Firebase Functions (Recommended)

Deploy as Firebase Cloud Functions for automatic scaling.

#### Steps:

1. **Update firebase.json:**
   ```json
   {
     "functions": {
       "source": ".",
       "predeploy": ["npm run build"]
     }
   }
   ```

2. **Create functions entry point:**
   Create `functions/src/index.ts` that exports your Express app.

3. **Deploy:**
   ```bash
   firebase deploy --only functions
   ```

#### Advantages:
- Automatic scaling
- Built-in HTTPS
- Integrated with Firebase ecosystem
- Pay-as-you-go pricing

---

### Option 2: Firebase Hosting + Cloud Run

Deploy as a containerized application on Cloud Run.

#### Steps:

1. **Create Dockerfile:**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and deploy:**
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/dms-api
   gcloud run deploy dms-api --image gcr.io/PROJECT_ID/dms-api
   ```

---

### Option 3: Traditional VPS/Server

Deploy to a traditional server (AWS EC2, DigitalOcean, etc.).

#### Steps:

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Set up PM2 (Process Manager):**
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name dms-api
   pm2 save
   pm2 startup
   ```

3. **Set up Nginx reverse proxy:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Set up SSL with Let's Encrypt:**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

---

## Firestore Deployment

### Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

### Deploy Indexes

```bash
firebase deploy --only firestore:indexes
```

**Note:** Index creation can take 5-10 minutes.

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Test health endpoint
curl https://your-api-url.com/health

# Test authenticated endpoint
curl -H "Authorization: Bearer <token>" https://your-api-url.com/api/v1/users/me
```

### 2. Monitor Logs

- **Firebase Functions:** `firebase functions:log`
- **Cloud Run:** Google Cloud Console → Cloud Run → Logs
- **PM2:** `pm2 logs dms-api`

### 3. Set Up Monitoring

- Set up Firebase Performance Monitoring
- Configure error tracking (Sentry, etc.)
- Set up uptime monitoring
- Configure alerts

---

## Security Best Practices

1. **Environment Variables:**
   - Never commit `.env` files
   - Use secure secret management
   - Rotate secrets regularly

2. **Firestore Rules:**
   - Test rules before deploying
   - Use least privilege principle
   - Review rules regularly

3. **API Security:**
   - Use HTTPS only
   - Implement rate limiting
   - Validate all inputs
   - Sanitize outputs

4. **Authentication:**
   - Enforce strong passwords
   - Implement token refresh
   - Monitor failed login attempts

---

## Scaling Considerations

### Database

- Use Firestore composite indexes
- Implement pagination
- Cache frequently accessed data
- Use batch operations for bulk writes

### API

- Implement request caching
- Use CDN for static assets
- Consider read replicas
- Monitor performance metrics

---

## Backup and Recovery

### Firestore Backup

```bash
# Export Firestore data
gcloud firestore export gs://your-bucket/backup-$(date +%Y%m%d)
```

### Regular Backups

Set up automated daily backups:
- Firestore data
- User authentication data
- Configuration files

---

## Rollback Procedure

If deployment fails:

1. **Firebase Functions:**
   ```bash
   firebase functions:rollback
   ```

2. **Cloud Run:**
   - Deploy previous version from Cloud Run console

3. **Traditional Server:**
   ```bash
   pm2 restart dms-api --update-env
   ```

---

## CI/CD Setup

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run deploy:rules
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id
```

---

## Troubleshooting

### Common Issues

1. **Permission Denied:**
   - Check service account permissions
   - Verify Firestore rules are deployed

2. **Index Not Found:**
   - Deploy indexes: `firebase deploy --only firestore:indexes`
   - Wait for index creation

3. **Connection Errors:**
   - Verify environment variables
   - Check service account key path
   - Verify network connectivity

---

## Performance Optimization

1. **Enable Firestore Caching**
2. **Implement API response caching**
3. **Use connection pooling**
4. **Optimize database queries**
5. **Minimize payload sizes**

---

## Cost Optimization

1. **Monitor Firestore read/write operations**
2. **Use appropriate Firebase plan**
3. **Implement caching to reduce reads**
4. **Optimize query patterns**
5. **Set up billing alerts**

---

## Support

For deployment issues:
- Check Firebase Console logs
- Review error messages
- Consult Firebase documentation
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for architecture details
