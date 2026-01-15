#!/bin/bash

# Cloud Run Deployment Script
# This script builds and deploys the Express API to Google Cloud Run

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Cloud Run Deployment${NC}"
echo ""

# Check if gcloud CLI is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Error: gcloud CLI is not installed${NC}"
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${YELLOW}⚠️  Not logged in to gcloud. Logging in...${NC}"
    gcloud auth login
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Error: No project set. Run: gcloud config set project YOUR_PROJECT_ID${NC}"
    exit 1
fi

echo -e "${GREEN}📦 Project: ${PROJECT_ID}${NC}"

# Enable required APIs
echo -e "${YELLOW}📋 Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build the application
echo -e "${YELLOW}🔨 Building TypeScript...${NC}"
npm ci
npm run build

# Set image name
IMAGE_NAME="gcr.io/${PROJECT_ID}/dms-api"
echo -e "${YELLOW}🐳 Building Docker image: ${IMAGE_NAME}${NC}"

# Build Docker image
docker build -t "${IMAGE_NAME}:latest" .

# Push to Container Registry
echo -e "${YELLOW}📤 Pushing image to Container Registry...${NC}"
docker push "${IMAGE_NAME}:latest"

# Deploy to Cloud Run
echo -e "${YELLOW}🚀 Deploying to Cloud Run...${NC}"
gcloud run deploy dms-api \
  --image "${IMAGE_NAME}:latest" \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --set-env-vars "NODE_ENV=production" \
  --project "${PROJECT_ID}"

# Get the service URL
SERVICE_URL=$(gcloud run services describe dms-api --platform managed --region asia-south1 --format 'value(status.url)')

echo ""
echo -e "${GREEN}✅ Deployment successful!${NC}"
echo -e "${GREEN}🌐 Service URL: ${SERVICE_URL}${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Update your frontend .env file with: VITE_API_BASE_URL=${SERVICE_URL}"
echo "2. Test the API: curl ${SERVICE_URL}/health"
echo "3. View logs: gcloud run services logs read dms-api --region asia-south1"
