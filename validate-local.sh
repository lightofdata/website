#!/bin/bash

echo "🔍 Local Validation Script (Lightweight Alternative to GitHub Actions)"
echo "=================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall success
OVERALL_SUCCESS=true

# HTML Validation
echo ""
echo "📄 Validating HTML..."
if [ -f "index.html" ]; then
    echo -e "${GREEN}✓${NC} index.html exists"
    
    # Check for basic HTML structure
    if grep -q "<html" index.html && grep -q "</html>" index.html; then
        echo -e "${GREEN}✓${NC} Basic HTML structure found"
    else
        echo -e "${RED}✗${NC} Invalid HTML structure"
        OVERALL_SUCCESS=false
    fi
    
    # Check for required HTML elements
    if grep -q "<head>" index.html && grep -q "<body>" index.html; then
        echo -e "${GREEN}✓${NC} Basic HTML elements found"
    else
        echo -e "${YELLOW}⚠${NC} Warning: Missing basic HTML elements (head/body)"
    fi
else
    echo -e "${RED}✗${NC} index.html not found"
    OVERALL_SUCCESS=false
fi

# CSS Validation (Basic)
echo ""
echo "🎨 Validating CSS..."
if [ -f "style.css" ]; then
    echo -e "${GREEN}✓${NC} style.css exists"
    
    # Check for basic CSS structure
    if grep -q "{" style.css && grep -q "}" style.css; then
        echo -e "${GREEN}✓${NC} Basic CSS structure found (contains braces)"
    else
        echo -e "${YELLOW}⚠${NC} Warning: No CSS rules found in style.css"
    fi
    
    # Check for common CSS properties
    if grep -qE "(color|background|font|margin|padding|width|height)" style.css; then
        echo -e "${GREEN}✓${NC} Common CSS properties detected"
    else
        echo -e "${YELLOW}⚠${NC} Warning: No common CSS properties found"
    fi
    
    # Basic syntax checks (without stylelint)
    echo "Performing basic CSS syntax checks..."
    
    # Check for missing semicolons (basic check)
    missing_semicolons=$(grep -n ":" style.css | grep -v ";" | grep -v "{" | grep -v "}" | wc -l)
    if [ "$missing_semicolons" -eq 0 ]; then
        echo -e "${GREEN}✓${NC} No obvious missing semicolons"
    else
        echo -e "${YELLOW}⚠${NC} Warning: Possible missing semicolons detected"
    fi
    
    # Check for balanced braces
    open_braces=$(grep -o "{" style.css | wc -l)
    close_braces=$(grep -o "}" style.css | wc -l)
    if [ "$open_braces" -eq "$close_braces" ]; then
        echo -e "${GREEN}✓${NC} Balanced CSS braces"
    else
        echo -e "${RED}✗${NC} Unbalanced CSS braces (${open_braces} open, ${close_braces} close)"
        OVERALL_SUCCESS=false
    fi
    
else
    echo -e "${RED}✗${NC} style.css not found"
    OVERALL_SUCCESS=false
fi

# Check for additional CSS files
css_files=$(find . -name "*.css" -not -path "./node_modules/*" 2>/dev/null)
if [ -n "$css_files" ]; then
    echo "Found additional CSS files:"
    echo "$css_files" | while read -r css_file; do
        if [ "$css_file" != "./style.css" ]; then
            echo -e "${GREEN}✓${NC} Found: $css_file"
        fi
    done
fi

# README Check
echo ""
echo "📖 Checking README..."
if [ -f "README.md" ]; then
    echo -e "${GREEN}✓${NC} README.md exists"
else
    echo -e "${RED}✗${NC} README.md not found"
    OVERALL_SUCCESS=false
fi

# Overall result
echo ""
echo "=================================================================="
if [ "$OVERALL_SUCCESS" = true ]; then
    echo -e "${GREEN}🎉 All validations passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some validations failed${NC}"
    exit 1
fi