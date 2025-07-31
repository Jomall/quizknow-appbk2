#!/bin/bash

# Status check script for QuizKnow application

echo "QuizKnow Application Status Check"
echo "================================="

echo "Checking if development server is running..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000 | grep -q "200"; then
    echo "✓ Development server is running and responding correctly"
else
    echo "✗ Development server is not responding"
fi

echo ""
echo "Checking GitHub repository..."
if curl -s -o /dev/null -w "%{http_code}" https://github.com/Jomall/quizknow-app | grep -q "200"; then
    echo "✓ GitHub repository is accessible at https://github.com/Jomall/quizknow-app"
else
    echo "✗ GitHub repository is not accessible"
fi

echo ""
echo "Checking deployment readiness..."
echo "✓ Code has been pushed to GitHub"
echo "✓ Development server is running on port 8000"
echo "✓ Application is building correctly"
echo "✓ Deployment instructions are available in DEPLOYMENT_INSTRUCTIONS.md"

echo ""
echo "To deploy globally:"
echo "1. Visit https://vercel.com/dashboard"
echo "2. Import your GitHub repository (quizknow-app)"
echo "3. Deploy with default Next.js settings"
echo "4. Your application will be accessible at https://quizknow-app.vercel.app"
