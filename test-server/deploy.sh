#!/bin/bash

# Competition Test Script - Google Cloud Run Deployment Script
# This script automates the deployment process to Google Cloud Run

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
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

print_status "Starting deployment to Google Cloud Run..."
print_status "Project ID: $PROJECT_ID"

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI is not installed"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n 1 > /dev/null; then
    print_error "Not authenticated with gcloud"
    echo "Please run: gcloud auth login"
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

# Check if Cloud Build config exists
if [ ! -f "cloudbuild.yaml" ]; then
    print_error "cloudbuild.yaml not found in current directory"
    exit 1
fi

# Deploy using Cloud Build
print_status "Starting Cloud Build deployment..."
print_warning "This may take a few minutes..."

gcloud builds submit --config cloudbuild.yaml

if [ $? -eq 0 ]; then
    print_success "Deployment completed successfully!"

    # Get the service URL
    print_status "Retrieving service URL..."
    SERVICE_URL=$(gcloud run services describe competition-test-script \
        --region=us-central1 \
        --format="value(status.url)")

    if [ ! -z "$SERVICE_URL" ]; then
        print_success "🌐 Your Competition Test Script is now live at:"
        echo ""
        echo "    $SERVICE_URL"
        echo ""
        print_status "📋 You can now access your interactive test script from any device!"
        print_status "💾 Your progress will be saved in your browser's localStorage"
        print_status "🔄 The service will auto-scale based on usage"

        # Show additional info
        echo ""
        print_status "Additional Information:"
        echo "  • Service Name: competition-test-script"
        echo "  • Region: us-central1"
        echo "  • Memory: 512Mi"
        echo "  • CPU: 1 vCPU"
        echo "  • Auto-scaling: 0-10 instances"
        echo "  • Authentication: Public (no login required)"

        # Offer to open in browser
        echo ""
        read -p "Would you like to open the URL in your default browser? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if command -v open &> /dev/null; then
                open "$SERVICE_URL"
            elif command -v xdg-open &> /dev/null; then
                xdg-open "$SERVICE_URL"
            else
                print_warning "Could not open browser automatically. Please copy the URL above."
            fi
        fi

    else
        print_error "Could not retrieve service URL"
        exit 1
    fi
else
    print_error "Deployment failed"
    exit 1
fi

print_success "🎉 Deployment complete!"
echo ""
print_status "To view logs: gcloud run services logs read competition-test-script --region=us-central1"
print_status "To delete service: gcloud run services delete competition-test-script --region=us-central1"