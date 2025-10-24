# Competition Test Script - Cloud Deployment

This is a simple Node.js application that serves the interactive competition scoring test script on Google Cloud Run.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open http://localhost:8080 in your browser

## Google Cloud Run Deployment

### Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Google Cloud CLI** installed and authenticated
3. **Docker** installed (for local testing)

### Quick Deployment Steps

1. **Set up Google Cloud Project:**
   ```bash
   # Set your project ID
   export PROJECT_ID="your-project-id"

   # Set the project
   gcloud config set project $PROJECT_ID

   # Enable required APIs
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

2. **Deploy using Cloud Build:**
   ```bash
   # From the test-server directory
   gcloud builds submit --config cloudbuild.yaml
   ```

3. **Get the service URL:**
   ```bash
   gcloud run services describe competition-test-script \
     --region=us-central1 \
     --format="value(status.url)"
   ```

### Manual Deployment (Alternative)

If you prefer manual deployment:

1. **Build and push the container:**
   ```bash
   # Build the image
   docker build -t gcr.io/$PROJECT_ID/competition-test-script .

   # Push to Container Registry
   docker push gcr.io/$PROJECT_ID/competition-test-script
   ```

2. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy competition-test-script \
     --image gcr.io/$PROJECT_ID/competition-test-script \
     --region us-central1 \
     --platform managed \
     --allow-unauthenticated \
     --port 8080 \
     --memory 512Mi \
     --cpu 1
   ```

### Configuration

- **Memory:** 512Mi (sufficient for static content)
- **CPU:** 1 CPU unit
- **Port:** 8080
- **Region:** us-central1 (change as needed)
- **Authentication:** Public (no authentication required)
- **Auto-scaling:** 0 to 10 instances

### Cost Estimation

Google Cloud Run pricing (as of 2024):
- **Free tier:** 2 million requests per month
- **CPU:** $0.00002400 per vCPU-second
- **Memory:** $0.00000250 per GiB-second
- **Requests:** $0.40 per million requests

For this lightweight application, costs should be minimal or free under normal usage.

### Security Notes

- The application serves static content only
- No authentication is required (public access)
- Progress is stored in browser localStorage (client-side only)
- No sensitive data is transmitted or stored on the server

### Monitoring

Access Cloud Run logs:
```bash
gcloud run services logs read competition-test-script \
  --region=us-central1 \
  --limit=50
```

## Local Testing

Test the Docker image locally:
```bash
# Build the image
docker build -t competition-test-script .

# Run locally
docker run -p 8080:8080 competition-test-script

# Visit http://localhost:8080
```

## Features

- ✅ Interactive checkbox-based testing
- 📊 Real-time progress tracking
- 💾 Browser localStorage persistence
- 📱 Mobile-responsive design
- 🔄 Expandable/collapsible sections
- 📋 Comprehensive test coverage
- 🎯 8 major testing sections
- ⚡ Fast loading and performance