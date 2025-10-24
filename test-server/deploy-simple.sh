#!/bin/bash

# Simple deployment script for Competition Test Script
# This version uses Cloud Build directly without local Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if PROJECT_ID is set
if [ -z "$PROJECT_ID" ]; then
    print_error "PROJECT_ID environment variable is not set"
    echo "Please set it with: export PROJECT_ID=\"your-google-cloud-project-id\""
    exit 1
fi

print_status "Starting simple deployment to Google Cloud Run..."
print_status "Project ID: $PROJECT_ID"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI is not installed"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set the project
print_status "Setting Google Cloud project..."
gcloud config set project $PROJECT_ID

# Enable required APIs
print_status "Enabling required Google Cloud APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

print_success "APIs enabled successfully"

# Create a temporary build configuration without commit SHA
print_status "Creating temporary build configuration..."
cat > cloudbuild-temp.yaml << EOF
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/\$PROJECT_ID/competition-test-script:latest', '.']

  # Push the container image to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/\$PROJECT_ID/competition-test-script:latest']

  # Deploy container image to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'competition-test-script'
      - '--image'
      - 'gcr.io/\$PROJECT_ID/competition-test-script:latest'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
      - '--port'
      - '8080'
      - '--memory'
      - '512Mi'
      - '--cpu'
      - '1'
      - '--min-instances'
      - '0'
      - '--max-instances'
      - '10'

options:
  logging: CLOUD_LOGGING_ONLY
EOF

# Deploy using the temporary build config
print_status "Starting deployment..."
print_warning "This may take a few minutes..."

gcloud builds submit --config cloudbuild-temp.yaml .

if [ $? -eq 0 ]; then
    # Clean up temporary file
    rm -f cloudbuild-temp.yaml

    print_success "Deployment completed successfully!"

    # Get the service URL
    print_status "Retrieving service URL..."
    SERVICE_URL=$(gcloud run services describe competition-test-script \
        --region=us-central1 \
        --format="value(status.url)")

    if [ ! -z "$SERVICE_URL" ]; then
        # Ensure public access is enabled
        print_status "Configuring public access..."
        gcloud run services add-iam-policy-binding competition-test-script \
            --region=us-central1 \
            --member="allUsers" \
            --role="roles/run.invoker" > /dev/null 2>&1

        print_success "🌐 Your Competition Test Script is now live at:"
        echo ""
        echo "    $SERVICE_URL"
        echo ""
        print_status "📋 You can now access your interactive test script from any device!"
        print_status "💾 Your progress will be saved in your browser's localStorage"

        echo ""
        print_status "🎉 Deployment successful!"
        echo "Service URL: $SERVICE_URL"

        # Test the deployment
        print_status "Testing deployment..."
        if command -v curl &> /dev/null; then
            if curl -s "$SERVICE_URL/health" > /dev/null; then
                print_success "Health check passed!"
            else
                print_warning "Health check failed, but service may still be starting up"
            fi
        fi

    else
        print_error "Could not retrieve service URL"
        exit 1
    fi
else
    print_error "Deployment failed"
    rm -f cloudbuild-temp.yaml
    exit 1
fi

echo ""
print_status "Management commands:"
echo "  View logs: gcloud run services logs read competition-test-script --region=us-central1"
echo "  Update: ./deploy-simple.sh"
echo "  Delete: gcloud run services delete competition-test-script --region=us-central1"