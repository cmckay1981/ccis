#!/bin/bash

# CCIS Platform - Firebase Deployment Script
# Run this locally to deploy Firestore rules, indexes, and Cloud Functions

set -e  # Exit on error

echo ""
echo "🚀 CCIS Platform - Firebase Deployment"
echo "======================================="
echo ""

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase"
    echo "   Running: firebase login --reauth"
    firebase login --reauth
fi

# Verify project
echo "📋 Current Firebase project:"
firebase use

echo ""
read -p "Deploy to redcell-gabriella? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 0
fi

echo ""
echo "What do you want to deploy?"
echo ""
echo "  1) Everything (Firestore + Functions + Hosting)"
echo "  2) Firestore rules & indexes only"
echo "  3) Cloud Functions only"
echo "  4) Hosting only"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        echo ""
        echo "📦 Deploying everything..."
        firebase deploy --project redcell-gabriella
        ;;
    2)
        echo ""
        echo "🗄️  Deploying Firestore rules & indexes..."
        firebase deploy --only firestore --project redcell-gabriella
        ;;
    3)
        echo ""
        echo "⚡ Deploying Cloud Functions..."
        echo "   Installing dependencies..."
        cd functions && npm install && cd ..
        firebase deploy --only functions --project redcell-gabriella
        ;;
    4)
        echo ""
        echo "🌐 Deploying Hosting..."
        firebase deploy --only hosting --project redcell-gabriella
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your site:"
echo "   Dashboard: https://redcell-gabriella.web.app/ccis/well-intelligence/"
echo "   CCIS Hub: https://redcell-gabriella.web.app/ccis/"
echo ""
echo "🔥 Firebase Console:"
echo "   https://console.firebase.google.com/project/redcell-gabriella"
echo ""
