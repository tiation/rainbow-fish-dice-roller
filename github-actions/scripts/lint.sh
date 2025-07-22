#!/bin/bash
set -e

# Linting Script for Rainbow Fish Dice Roller
# Enterprise-grade code quality checks

echo "🔍 Starting linting process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_status $RED "❌ Error: package.json not found. Run this script from the project root."
    exit 1
fi

# Create basic linting configuration if not exists
setup_linting_config() {
    print_status $YELLOW "⚙️  Setting up linting configuration..."
    
    # Create .eslintrc.js if not exists
    if [ ! -f ".eslintrc.js" ]; then
        cat > .eslintrc.js << 'EOF'
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:security/recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['security'],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'no-undef': 'error',
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-unsafe-regex': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '*.min.js'
  ]
};
EOF
        print_status $GREEN "✅ Created .eslintrc.js"
    fi

    # Create .prettierrc if not exists
    if [ ! -f ".prettierrc" ]; then
        cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
EOF
        print_status $GREEN "✅ Created .prettierrc"
    fi

    # Create .prettierignore if not exists
    if [ ! -f ".prettierignore" ]; then
        cat > .prettierignore << 'EOF'
node_modules/
dist/
build/
*.min.js
*.min.css
coverage/
*.log
.git/
.github/
helm/
k8s/
*.md
EOF
        print_status $GREEN "✅ Created .prettierignore"
    fi
}

# Install dependencies if node_modules doesn't exist
install_dependencies() {
    if [ ! -d "node_modules" ]; then
        print_status $YELLOW "📦 Installing dependencies..."
        npm install
    fi

    # Install linting dependencies if not present
    local deps_to_install=""
    
    if ! npm list eslint --depth=0 2>/dev/null; then
        deps_to_install="$deps_to_install eslint"
    fi
    
    if ! npm list prettier --depth=0 2>/dev/null; then
        deps_to_install="$deps_to_install prettier"
    fi
    
    if ! npm list eslint-plugin-security --depth=0 2>/dev/null; then
        deps_to_install="$deps_to_install eslint-plugin-security"
    fi
    
    if ! npm list eslint-config-prettier --depth=0 2>/dev/null; then
        deps_to_install="$deps_to_install eslint-config-prettier"
    fi

    if [ -n "$deps_to_install" ]; then
        print_status $YELLOW "📦 Installing missing linting dependencies: $deps_to_install"
        npm install --save-dev $deps_to_install
    fi
}

# Run ESLint
run_eslint() {
    print_status $YELLOW "🔍 Running ESLint..."
    
    local eslint_files="src/ *.js"
    
    # Check if src directory exists, otherwise lint all JS files
    if [ ! -d "src" ]; then
        eslint_files="*.js"
    fi
    
    if npx eslint $eslint_files --ext .js,.jsx,.ts,.tsx; then
        print_status $GREEN "✅ ESLint passed!"
    else
        print_status $RED "❌ ESLint found issues. Run 'npm run lint:fix' to auto-fix some issues."
        return 1
    fi
}

# Run Prettier
run_prettier() {
    print_status $YELLOW "💅 Running Prettier..."
    
    if npx prettier --check .; then
        print_status $GREEN "✅ Prettier formatting is correct!"
    else
        print_status $RED "❌ Prettier found formatting issues. Run 'npm run format' to fix them."
        return 1
    fi
}

# Run security audit
run_security_audit() {
    print_status $YELLOW "🔒 Running security audit..."
    
    if npm audit --audit-level=moderate; then
        print_status $GREEN "✅ No critical security vulnerabilities found!"
    else
        print_status $YELLOW "⚠️  Security vulnerabilities found. Run 'npm audit fix' to resolve them."
        return 1
    fi
}

# Check for TODO/FIXME comments
check_todos() {
    print_status $YELLOW "📝 Checking for TODO/FIXME comments..."
    
    local todos=$(find . -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | \
                  grep -v node_modules | \
                  xargs grep -n -i "TODO\|FIXME" || true)
    
    if [ -n "$todos" ]; then
        print_status $YELLOW "⚠️  Found TODO/FIXME comments:"
        echo "$todos"
        print_status $YELLOW "Consider addressing these before production deployment."
    else
        print_status $GREEN "✅ No TODO/FIXME comments found!"
    fi
}

# Check package.json scripts
check_package_scripts() {
    print_status $YELLOW "📋 Checking package.json scripts..."
    
    local required_scripts=("lint" "test" "build")
    local missing_scripts=""
    
    for script in "${required_scripts[@]}"; do
        if ! jq -e ".scripts.${script}" package.json > /dev/null 2>&1; then
            missing_scripts="$missing_scripts $script"
        fi
    done
    
    if [ -n "$missing_scripts" ]; then
        print_status $YELLOW "⚠️  Missing recommended scripts in package.json:$missing_scripts"
        
        # Add basic scripts if missing
        if [[ $missing_scripts == *"lint"* ]]; then
            jq '.scripts.lint = "eslint . --ext .js,.jsx,.ts,.tsx"' package.json > tmp.$$.json && mv tmp.$$.json package.json
            print_status $GREEN "✅ Added lint script to package.json"
        fi
        
        if [[ $missing_scripts == *"test"* ]]; then
            jq '.scripts.test = "echo \"No tests specified yet\""' package.json > tmp.$$.json && mv tmp.$$.json package.json
            print_status $GREEN "✅ Added test script to package.json"
        fi
        
        if [[ $missing_scripts == *"build"* ]]; then
            jq '.scripts.build = "npm run lint && npm run test"' package.json > tmp.$$.json && mv tmp.$$.json package.json
            print_status $GREEN "✅ Added build script to package.json"
        fi
    else
        print_status $GREEN "✅ All recommended scripts are present!"
    fi
}

# Main execution
main() {
    print_status $GREEN "🚀 Rainbow Fish Dice Roller - Linting Process Started"
    
    setup_linting_config
    install_dependencies
    check_package_scripts
    
    local exit_code=0
    
    # Run all linting checks
    if ! run_eslint; then exit_code=1; fi
    if ! run_prettier; then exit_code=1; fi
    if ! run_security_audit; then exit_code=1; fi
    
    check_todos
    
    if [ $exit_code -eq 0 ]; then
        print_status $GREEN "🎉 All linting checks passed! Code is ready for deployment."
    else
        print_status $RED "💥 Some linting checks failed. Please fix the issues and try again."
    fi
    
    return $exit_code
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
