#!/bin/bash

# Electron Angular Rspack Starter - Run Script
# Handles dependency installation and runs commands

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Log functions
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

# Check if a command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Check if directory is empty or doesn't exist
is_empty_dir() {
    local dir="$1"
    if [ ! -d "$dir" ]; then
        return 0
    fi
    if [ -z "$(ls -A "$dir" 2>/dev/null)" ]; then
        return 0
    fi
    return 1
}

# Check if node_modules exists and has packages
has_node_modules() {
    local dir="$1"
    local node_modules="$dir/node_modules"
    
    if [ ! -d "$node_modules" ]; then
        return 1
    fi
    
    # Check if node_modules has actual packages (not just .bin)
    local package_count=$(find "$node_modules" -maxdepth 1 -type d ! -name '.' ! -name 'node_modules' ! -name '.bin' | wc -l)
    if [ "$package_count" -lt 1 ]; then
        return 1
    fi
    
    return 0
}

# Install dependencies using bun or npm
install_deps() {
    local dir="$1"
    local name="$2"
    
    log_info "Installing dependencies for $name..."
    
    cd "$dir"
    
    if command_exists bun; then
        log_info "Using bun to install..."
        bun install
    elif command_exists npm; then
        log_info "Using npm to install..."
        npm install
    elif command_exists yarn; then
        log_info "Using yarn to install..."
        yarn install
    else
        log_error "No package manager found (bun, npm, or yarn)"
        exit 1
    fi
    
    cd "$PROJECT_ROOT"
    log_success "$name dependencies installed"
}

# Check and install backend dependencies
check_backend_deps() {
    if ! has_node_modules "$PROJECT_ROOT"; then
        log_warning "Backend dependencies missing or empty"
        install_deps "$PROJECT_ROOT" "Backend"
    else
        log_success "Backend dependencies OK"
    fi
}

# Check and install frontend dependencies
check_frontend_deps() {
    local frontend_dir="$PROJECT_ROOT/frontend"
    
    if ! has_node_modules "$frontend_dir"; then
        log_warning "Frontend dependencies missing or empty"
        install_deps "$frontend_dir" "Frontend"
    else
        log_success "Frontend dependencies OK"
    fi
}

# Check all dependencies
check_all_deps() {
    log_info "Checking dependencies..."
    check_backend_deps
    check_frontend_deps
    log_success "All dependencies OK"
}

# Run development server
run_dev() {
    check_all_deps
    
    log_info "Starting development server..."
    
    if command_exists bun; then
        bun run dev
    else
        npm run dev
    fi
}

# Run build
run_build() {
    check_all_deps
    
    log_info "Building application..."
    
    if command_exists bun; then
        bun run build
    else
        npm run build
    fi
}

# Run tests
run_test() {
    check_all_deps
    
    log_info "Running tests..."
    
    if command_exists bun; then
        bun run test
    else
        npm run test
    fi
}

# Clean build artifacts
run_clean() {
    log_info "Cleaning build artifacts..."
    
    # Clean backend
    rm -rf "$PROJECT_ROOT/dist"
    rm -rf "$PROJECT_ROOT/main.cjs"
    rm -rf "$PROJECT_ROOT/main.cjs.map"
    rm -rf "$PROJECT_ROOT/release"
    
    # Clean frontend
    rm -rf "$PROJECT_ROOT/frontend/dist"
    rm -rf "$PROJECT_ROOT/frontend/.angular/cache"
    
    # Clean coverage
    rm -rf "$PROJECT_ROOT/coverage"
    
    log_success "Cleaned build artifacts"
}

# Full clean and reinstall
run_reinstall() {
    log_info "Removing all node_modules..."
    
    rm -rf "$PROJECT_ROOT/node_modules"
    rm -rf "$PROJECT_ROOT/bun.lock"
    rm -rf "$PROJECT_ROOT/frontend/node_modules"
    rm -rf "$PROJECT_ROOT/frontend/bun.lock"
    
    log_success "Removed all dependencies"
    
    log_info "Reinstalling dependencies..."
    check_all_deps
    
    log_success "Reinstallation complete"
}

# Show help
show_help() {
    echo "Electron Angular Rspack Starter - Run Script"
    echo ""
    echo "Usage: ./run.sh [command]"
    echo ""
    echo "Commands:"
    echo "  dev          Start development server"
    echo "  build        Build application"
    echo "  test         Run tests"
    echo "  clean        Clean build artifacts"
    echo "  reinstall    Remove all dependencies and reinstall"
    echo "  check        Check dependencies only"
    echo "  help         Show this help message (default)"
    echo ""
    echo "Examples:"
    echo "  ./run.sh              # Show this help"
    echo "  ./run.sh dev          # Start dev server"
    echo "  ./run.sh build        # Build application"
    echo "  ./run.sh clean        # Clean build artifacts"
    echo "  ./run.sh reinstall    # Full reinstall"
    echo ""
}

# Main script
main() {
    local command="${1:-help}"
    
    case "$command" in
        dev)
            run_dev
            ;;
        build)
            run_build
            ;;
        test)
            run_test
            ;;
        clean)
            run_clean
            ;;
        reinstall)
            run_reinstall
            ;;
        check)
            check_all_deps
            ;;
        help|--help|-h|"")
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
