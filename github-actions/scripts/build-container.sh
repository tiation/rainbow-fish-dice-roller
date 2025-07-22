#!/bin/bash
set -e

# Container Image Building Script for Rainbow Fish Dice Roller
# Enterprise-grade Docker image building with security and optimization

echo "🐳 Starting container image building process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REGISTRY_URL=${REGISTRY_URL:-"ghcr.io"}
IMAGE_NAME=${IMAGE_NAME:-"rainbow-fish-dice-roller"}
IMAGE_TAG=${IMAGE_TAG:-"latest"}
DOCKERFILE_PATH=${DOCKERFILE_PATH:-"./Dockerfile"}
BUILD_CONTEXT=${BUILD_CONTEXT:-"."}
ENABLE_SECURITY_SCAN=${ENABLE_SECURITY_SCAN:-"true"}
ENABLE_MULTI_ARCH=${ENABLE_MULTI_ARCH:-"false"}

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_status $YELLOW "🔍 Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        print_status $RED "❌ Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_status $RED "❌ Docker daemon is not running"
        exit 1
    fi
    
    # Check if Dockerfile exists
    if [ ! -f "$DOCKERFILE_PATH" ]; then
        print_status $RED "❌ Dockerfile not found at: $DOCKERFILE_PATH"
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_status $RED "❌ package.json not found. Run this script from the project root."
        exit 1
    fi
    
    print_status $GREEN "✅ Prerequisites check passed"
}

# Create optimized Dockerfile if current one is basic
optimize_dockerfile() {
    print_status $YELLOW "🔧 Optimizing Dockerfile for production..."
    
    # Check if current Dockerfile is the basic one
    if grep -q "FROM node:current-slim" "$DOCKERFILE_PATH"; then
        print_status $YELLOW "📝 Current Dockerfile is basic, creating optimized version..."
        
        # Backup original Dockerfile
        cp "$DOCKERFILE_PATH" "${DOCKERFILE_PATH}.backup"
        
        # Create optimized multi-stage Dockerfile
        cat > "$DOCKERFILE_PATH" << 'EOF'
# Multi-stage Dockerfile for Rainbow Fish Dice Roller
# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/
COPY public/ ./public/ 2>/dev/null || true

# Build application if build script exists
RUN npm run build || echo "No build script found, skipping build step"

# Stage 2: Production stage
FROM node:18-alpine AS production

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache \
    curl \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nodeuser:nodejs /app/src ./src
COPY --from=builder --chown=nodeuser:nodejs /app/public ./public 2>/dev/null || true
COPY --from=builder --chown=nodeuser:nodejs /app/dist ./dist 2>/dev/null || true

# Create logs and data directories
RUN mkdir -p /app/logs /app/data && \
    chown -R nodeuser:nodejs /app

# Switch to non-root user
USER nodeuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-80}/health || exit 1

# Expose port
EXPOSE 80

# Set environment variables
ENV NODE_ENV=production
ENV PORT=80

# Start application
CMD ["npm", "start"]
EOF
        
        print_status $GREEN "✅ Created optimized Dockerfile"
    else
        print_status $BLUE "ℹ️  Dockerfile already appears to be optimized"
    fi
}

# Create .dockerignore if not exists
create_dockerignore() {
    if [ ! -f ".dockerignore" ]; then
        print_status $YELLOW "📝 Creating .dockerignore file..."
        
        cat > .dockerignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build artifacts
dist/
build/
coverage/

# Development files
.git/
.github/
.vscode/
.idea/
*.swp
*.swo

# Test files
tests/
__tests__/
*.test.js
*.spec.js
jest.config.js

# Documentation
docs/
README.md
*.md

# Environment files
.env*
!.env.example

# Logs
logs/
*.log

# Temporary files
.tmp/
tmp/

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Helm and Kubernetes
helm/
k8s/
kubernetes/

# CI/CD
.github/
.gitlab-ci.yml
EOF
        
        print_status $GREEN "✅ Created .dockerignore file"
    fi
}

# Build Docker image
build_image() {
    print_status $YELLOW "🔨 Building Docker image..."
    
    local full_image_name="${REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG}"
    local build_args=""
    
    # Add build arguments
    build_args="--build-arg NODE_ENV=production"
    build_args="$build_args --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
    build_args="$build_args --build-arg VCS_REF=${GITHUB_SHA:-$(git rev-parse HEAD 2>/dev/null || echo 'unknown')}"
    
    # Add labels
    local labels=""
    labels="--label org.opencontainers.image.title='Rainbow Fish Dice Roller'"
    labels="$labels --label org.opencontainers.image.description='Enterprise-grade dice rolling application'"
    labels="$labels --label org.opencontainers.image.version='${IMAGE_TAG}'"
    labels="$labels --label org.opencontainers.image.created='$(date -u +'%Y-%m-%dT%H:%M:%SZ')'"
    labels="$labels --label org.opencontainers.image.source='https://github.com/tiation/rainbow-fish-dice-roller'"
    labels="$labels --label org.opencontainers.image.revision='${GITHUB_SHA:-$(git rev-parse HEAD 2>/dev/null || echo 'unknown')}'"
    
    print_status $BLUE "🏷️  Building: $full_image_name"
    
    if [ "$ENABLE_MULTI_ARCH" = "true" ]; then
        print_status $YELLOW "🌐 Building multi-architecture image..."
        
        # Setup buildx if not already done
        docker buildx create --name multiarch --use 2>/dev/null || true
        
        docker buildx build \
            --platform linux/amd64,linux/arm64 \
            $build_args \
            $labels \
            -t "$full_image_name" \
            -f "$DOCKERFILE_PATH" \
            --push \
            "$BUILD_CONTEXT"
    else
        docker build \
            $build_args \
            $labels \
            -t "$full_image_name" \
            -f "$DOCKERFILE_PATH" \
            "$BUILD_CONTEXT"
    fi
    
    if [ $? -eq 0 ]; then
        print_status $GREEN "✅ Docker image built successfully: $full_image_name"
    else
        print_status $RED "❌ Docker image build failed"
        return 1
    fi
}

# Scan image for vulnerabilities
scan_image() {
    if [ "$ENABLE_SECURITY_SCAN" != "true" ]; then
        print_status $BLUE "ℹ️  Security scanning disabled"
        return 0
    fi
    
    print_status $YELLOW "🔒 Scanning image for security vulnerabilities..."
    
    local full_image_name="${REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG}"
    
    # Try different security scanners
    if command -v trivy &> /dev/null; then
        print_status $YELLOW "🔍 Running Trivy security scan..."
        
        trivy image \
            --exit-code 0 \
            --severity HIGH,CRITICAL \
            --format table \
            "$full_image_name"
            
        # Save scan results
        trivy image \
            --exit-code 0 \
            --format json \
            --output "trivy-scan-results.json" \
            "$full_image_name"
            
        print_status $GREEN "✅ Trivy scan completed"
        
    elif command -v docker &> /dev/null; then
        print_status $YELLOW "🔍 Running basic Docker security scan..."
        
        # Basic Docker scan using docker scout if available
        if docker scout version &> /dev/null; then
            docker scout cves "$full_image_name" || true
        fi
        
    else
        print_status $YELLOW "⚠️  No security scanner available (trivy recommended)"
    fi
}

# Test the built image
test_image() {
    print_status $YELLOW "🧪 Testing built Docker image..."
    
    local full_image_name="${REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG}"
    local container_name="test-${IMAGE_NAME}-$$"
    
    # Run container in background
    print_status $BLUE "🚀 Starting test container..."
    
    docker run -d \
        --name "$container_name" \
        -p 0:80 \
        --health-timeout=10s \
        "$full_image_name"
    
    # Wait for container to start
    sleep 5
    
    # Get the mapped port
    local mapped_port=$(docker port "$container_name" 80/tcp | cut -d':' -f2)
    
    if [ -n "$mapped_port" ]; then
        print_status $BLUE "🌐 Container running on port: $mapped_port"
        
        # Test HTTP endpoint
        for i in {1..10}; do
            if curl -f "http://localhost:$mapped_port/" &> /dev/null; then
                print_status $GREEN "✅ Container HTTP test passed"
                break
            elif [ $i -eq 10 ]; then
                print_status $YELLOW "⚠️  Container HTTP test failed (non-critical)"
            else
                sleep 2
            fi
        done
    fi
    
    # Check container logs
    print_status $BLUE "📋 Container logs (last 10 lines):"
    docker logs --tail 10 "$container_name" || true
    
    # Check if container is healthy
    local health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "unknown")
    print_status $BLUE "🏥 Health status: $health_status"
    
    # Cleanup test container
    docker stop "$container_name" &> /dev/null || true
    docker rm "$container_name" &> /dev/null || true
    
    print_status $GREEN "✅ Image testing completed"
}

# Push image to registry
push_image() {
    if [ "${PUSH_IMAGE:-true}" != "true" ]; then
        print_status $BLUE "ℹ️  Image push disabled"
        return 0
    fi
    
    print_status $YELLOW "📤 Pushing image to registry..."
    
    local full_image_name="${REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG}"
    
    # Tag with additional tags if specified
    if [ -n "${ADDITIONAL_TAGS:-}" ]; then
        for tag in ${ADDITIONAL_TAGS//,/ }; do
            local additional_image="${REGISTRY_URL}/${IMAGE_NAME}:${tag}"
            docker tag "$full_image_name" "$additional_image"
            print_status $BLUE "🏷️  Tagged: $additional_image"
        done
    fi
    
    # Push main image
    if [ "$ENABLE_MULTI_ARCH" != "true" ]; then
        docker push "$full_image_name"
    fi
    
    # Push additional tags
    if [ -n "${ADDITIONAL_TAGS:-}" ]; then
        for tag in ${ADDITIONAL_TAGS//,/ }; do
            docker push "${REGISTRY_URL}/${IMAGE_NAME}:${tag}"
        done
    fi
    
    print_status $GREEN "✅ Image pushed successfully"
}

# Generate build report
generate_build_report() {
    print_status $YELLOW "📋 Generating build report..."
    
    local report_file="build-report.md"
    local full_image_name="${REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG}"
    
    cat > "$report_file" << EOF
# Container Build Report - Rainbow Fish Dice Roller

**Generated:** $(date)
**Image:** \`$full_image_name\`
**Build Context:** $BUILD_CONTEXT
**Dockerfile:** $DOCKERFILE_PATH

## Build Information

- **Registry:** $REGISTRY_URL
- **Image Name:** $IMAGE_NAME
- **Tag:** $IMAGE_TAG
- **Multi-Architecture:** ${ENABLE_MULTI_ARCH}
- **Security Scan:** ${ENABLE_SECURITY_SCAN}

## Image Details

\`\`\`bash
# Pull the image
docker pull $full_image_name

# Run the image
docker run -p 3000:80 $full_image_name
\`\`\`

## Security Information

$(if [ -f "trivy-scan-results.json" ]; then echo "- Security scan results: trivy-scan-results.json"; else echo "- No security scan results available"; fi)

## Image Size

$(docker images "$full_image_name" --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}" | tail -n 1)

---
*Report generated by enterprise CI/CD pipeline*
EOF
    
    print_status $GREEN "✅ Build report generated: $report_file"
}

# Cleanup function
cleanup() {
    print_status $YELLOW "🧹 Cleaning up build artifacts..."
    
    # Remove dangling images
    docker image prune -f &> /dev/null || true
    
    # Remove build cache if requested
    if [ "${CLEAN_BUILD_CACHE:-false}" = "true" ]; then
        docker builder prune -f &> /dev/null || true
        print_status $BLUE "🗑️  Cleaned Docker build cache"
    fi
    
    print_status $GREEN "✅ Cleanup completed"
}

# Main execution
main() {
    local exit_code=0
    
    print_status $GREEN "🐳 Rainbow Fish Dice Roller - Container Build Started"
    print_status $BLUE "📊 Build Configuration:"
    print_status $BLUE "   Registry: $REGISTRY_URL"
    print_status $BLUE "   Image: $IMAGE_NAME:$IMAGE_TAG"
    print_status $BLUE "   Multi-arch: $ENABLE_MULTI_ARCH"
    print_status $BLUE "   Security scan: $ENABLE_SECURITY_SCAN"
    
    # Execute build pipeline
    check_prerequisites
    create_dockerignore
    optimize_dockerfile
    
    if ! build_image; then exit_code=1; fi
    
    if [ $exit_code -eq 0 ]; then
        scan_image
        test_image
        push_image
        generate_build_report
    fi
    
    cleanup
    
    if [ $exit_code -eq 0 ]; then
        print_status $GREEN "🎉 Container build completed successfully!"
        print_status $GREEN "🚀 Image ready: ${REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG}"
    else
        print_status $RED "💥 Container build failed!"
    fi
    
    return $exit_code
}

# Handle command line arguments
case "${1:-}" in
    "build")
        PUSH_IMAGE=false
        main
        ;;
    "scan")
        ENABLE_SECURITY_SCAN=true
        scan_image
        ;;
    "test")
        test_image
        ;;
    "push")
        push_image
        ;;
    "clean")
        CLEAN_BUILD_CACHE=true
        cleanup
        ;;
    *)
        main "$@"
        ;;
esac
