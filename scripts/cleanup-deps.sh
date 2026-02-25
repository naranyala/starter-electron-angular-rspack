#!/bin/bash

# Dependency Cleanup Script
# Removes duplicate dependencies from backend

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log_info "Starting dependency cleanup..."

# Packages to remove from backend (duplicates of frontend)
ANGULAR_PACKAGES=(
    "@angular/common"
    "@angular/compiler"
    "@angular/compiler-cli"
    "@angular/core"
    "@angular/forms"
    "@angular/platform-browser"
    "@angular/platform-browser-dynamic"
    "@angular/router"
    "@angular/build"
    "@angular/animations"
    "@angular/ssr"
)

BUILD_TOOLS=(
    "css-loader"
    "esbuild-loader"
    "html-rspack-plugin"
    "raw-loader"
    "sass"
    "sass-loader"
    "style-loader"
)

OTHER=(
    "winbox"
    "zone.js"
    "rxjs"
    "tslib"
)

# Combine all packages to remove
PACKAGES_TO_REMOVE=(
    "${ANGULAR_PACKAGES[@]}"
    "${BUILD_TOOLS[@]}"
    "${OTHER[@]}"
)

log_info "Packages to remove from backend:"
for pkg in "${PACKAGES_TO_REMOVE[@]}"; do
    echo "  - $pkg"
done

# Check if using bun or npm
if command -v bun &> /dev/null; then
    PKG_MANAGER="bun"
elif command -v npm &> /dev/null; then
    PKG_MANAGER="npm"
else
    log_error "No package manager found"
    exit 1
fi

log_info "Using package manager: $PKG_MANAGER"

# Remove packages
log_info "Removing duplicate packages from backend..."
cd "$PROJECT_ROOT"

if [ "$PKG_MANAGER" = "bun" ]; then
    bun remove "${PACKAGES_TO_REMOVE[@]}" 2>&1 || log_warning "Some packages may not have been installed"
else
    npm uninstall "${PACKAGES_TO_REMOVE[@]}" 2>&1 || log_warning "Some packages may not have been installed"
fi

log_success "Removed duplicate packages"

# Align versions
log_info "Aligning versions..."

# Update typescript version
if [ "$PKG_MANAGER" = "bun" ]; then
    bun add -d typescript@~5.9.0
    bun add -d @rspack/cli@^1.7.6
    bun add -d @rspack/core@^1.7.6
    bun add -d @types/node@^22.0.0
else
    npm install -D typescript@~5.9.0
    npm install -D @rspack/cli@^1.7.6
    npm install -D @rspack/core@^1.7.6
    npm install -D @types/node@^22.0.0
fi

log_success "Versions aligned"

# Summary
log_info "Dependency cleanup complete!"
log_info ""
log_info "Summary:"
log_info "  - Removed ${#PACKAGES_TO_REMOVE[@]} duplicate packages"
log_info "  - Aligned TypeScript, Rspack, and Node types versions"
log_info ""
log_info "Next steps:"
log_info "  1. Run './run.sh check' to verify dependencies"
log_info "  2. Run './run.sh build' to verify build"
log_info "  3. Run './run.sh dev' to test development"
