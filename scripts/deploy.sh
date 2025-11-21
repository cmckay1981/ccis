#!/bin/bash

# OGLMS Dashboard Deployment Script
# This script helps deploy the complete system to Firebase

set -e  # Exit on error

echo ""
echo "🚀 OGLMS Dashboard Deployment"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI not found${NC}"
    echo "   Install it with: npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Firebase${NC}"
    echo "   Running: firebase login --reauth"
    firebase login --reauth
fi

# Verify project
echo -e "${BLUE}📋 Current Firebase project:${NC}"
firebase use

echo ""
read -p "Is this the correct project? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Exiting. Run 'firebase use PROJECT_ID' to switch projects."
    exit 1
fi

# Menu
echo ""
echo "What would you like to deploy?"
echo ""
echo "  1) Everything (hosting + functions + firestore)"
echo "  2) Hosting only (dashboard UI)"
echo "  3) Cloud Functions only"
echo "  4) Firestore rules & indexes"
echo "  5) Functions + Firestore (skip hosting)"
echo "  6) Test with emulators (local)"
echo "  7) Cancel"
echo ""
read -p "Enter choice [1-7]: " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}📦 Deploying everything...${NC}"
        echo ""
        firebase deploy
        ;;
    2)
        echo ""
        echo -e "${BLUE}🌐 Deploying hosting only...${NC}"
        echo ""
        firebase deploy --only hosting
        ;;
    3)
        echo ""
        echo -e "${BLUE}⚡ Deploying Cloud Functions...${NC}"
        echo ""
        echo "Which functions?"
        echo "  1) All functions"
        echo "  2) Dashboard functions only (saveCompleteWell, getOrganisationWells, etc.)"
        echo "  3) Calculator functions only"
        read -p "Enter choice [1-3]: " fn_choice

        case $fn_choice in
            1)
                firebase deploy --only functions
                ;;
            2)
                firebase deploy --only functions:saveCompleteWell,functions:getOrganisationWells,functions:getWellDetails,functions:updateWellStatus,functions:deleteWell
                ;;
            3)
                firebase deploy --only functions:calculateStringVolume,functions:calculateAnnularVolumes,functions:calculateKillSheet
                ;;
            *)
                echo "Invalid choice"
                exit 1
                ;;
        esac
        ;;
    4)
        echo ""
        echo -e "${BLUE}🔒 Deploying Firestore rules & indexes...${NC}"
        echo ""
        firebase deploy --only firestore
        ;;
    5)
        echo ""
        echo -e "${BLUE}⚡ Deploying Functions + Firestore...${NC}"
        echo ""
        firebase deploy --only functions,firestore
        ;;
    6)
        echo ""
        echo -e "${BLUE}🧪 Starting Firebase Emulators...${NC}"
        echo ""
        echo "Emulators will start on:"
        echo "  - Hosting: http://localhost:5000"
        echo "  - Functions: http://localhost:5001"
        echo "  - Firestore: http://localhost:8080"
        echo "  - Auth: http://localhost:9099"
        echo ""
        firebase emulators:start
        ;;
    7)
        echo "Cancelled"
        exit 0
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

# Post-deployment info
if [[ $choice != 6 && $choice != 7 ]]; then
    echo ""
    echo -e "${GREEN}✅ Deployment complete!${NC}"
    echo ""
    echo "📊 View your project:"
    echo "   Console: https://console.firebase.google.com/project/$(firebase use | grep 'Now using project' | awk '{print $4}' | tr -d "'")/overview"
    echo ""

    if [[ $choice == 1 || $choice == 2 ]]; then
        HOSTING_URL=$(firebase hosting:channel:list 2>/dev/null | grep live | awk '{print $3}' || echo "redcell-gabriella.web.app")
        echo "🌐 Dashboard URL:"
        echo "   https://${HOSTING_URL}/dashboard/"
        echo ""
    fi

    echo "📝 Next steps:"

    if [[ $choice == 3 || $choice == 5 ]]; then
        echo "   1. View function logs: firebase functions:log"
        echo "   2. Test functions in dashboard"
    fi

    if [[ $choice == 4 || $choice == 5 ]]; then
        echo "   1. Set user custom claims: node scripts/setUserClaims.js"
        echo "   2. Migrate existing data: node scripts/migrateWells.js audit"
    fi

    if [[ $choice == 1 || $choice == 2 ]]; then
        echo "   1. Update firebase-config.js with your API keys"
        echo "   2. Test the dashboard at the URL above"
        echo "   3. Create a test well via the wizard"
    fi

    echo ""
fi
