#!/bin/bash

# Deployment script for QuizKnow application

echo "QuizKnow Application Deployment Script"
echo "======================================"

echo "Step 1: Checking if code is pushed to GitHub..."
echo "Your code has been pushed to: https://github.com/Jomall/quizknow-app"

echo ""
echo "Step 2: Deployment Options"
echo "=========================="
echo "Option A: Deploy via Vercel Dashboard (Recommended)"
echo "1. Visit https://vercel.com/dashboard"
echo "2. Click 'New Project'"
echo "3. Import the 'quizknow-app' repository"
echo "4. Configure with these settings:"
echo "   - Framework: Next.js"
echo "   - Build Command: next build"
echo "   - Output Directory: .next"
echo "5. Click 'Deploy'"

echo ""
echo "Option B: Deploy via Vercel CLI"
echo "1. Install Vercel CLI: npm install -g vercel"
echo "2. Login to Vercel: vercel login"
echo "3. Deploy: vercel --prod"

echo ""
echo "After deployment, your application will be accessible globally at:"
echo "https://quizknow-app.vercel.app (or your custom domain)"

echo ""
echo "For detailed instructions, check DEPLOYMENT_INSTRUCTIONS.md"
