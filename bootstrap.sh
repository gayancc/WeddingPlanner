#!/bin/bash
# Wedding Admin — Bootstrap Script
# Run this once to create the Angular project and wire everything up
# Usage: chmod +x bootstrap.sh && ./bootstrap.sh

set -e

PROJECT="wedding-admin"

echo "▸ Creating Angular 18 project..."
npx @angular/cli@18 new $PROJECT \
  --standalone \
  --routing \
  --style=css \
  --skip-git \
  --skip-tests

cd $PROJECT

echo "▸ Installing dependencies..."
npm install \
  @angular/fire@18 \
  firebase@10 \
  @emailjs/browser \
  nanoid \
  qrcode \
  @types/qrcode \
  xlsx

echo "▸ Copying scaffolded source files..."
# These files come from the Claude Code project root
# Assumes you run this from inside the wedding-admin Claude Code project

cp -r ../src/app/core             src/app/
cp -r ../src/app/admin            src/app/
cp -r ../src/app/guest            src/app/ 2>/dev/null || mkdir -p src/app/guest/rsvp
cp    ../src/app/app.config.ts    src/app/app.config.ts
cp    ../src/app/app.routes.ts    src/app/app.routes.ts
cp    ../src/environments/environment.ts src/environments/environment.ts

echo "▸ Creating CLAUDE.md and .claude/ config..."
cp ../CLAUDE.md CLAUDE.md
mkdir -p .claude
cp ../.claude/settings.json .claude/settings.json

echo "▸ Adding environment.ts to .gitignore..."
echo "src/environments/environment.ts" >> .gitignore
echo "src/environments/environment.prod.ts" >> .gitignore

echo "▸ Updating index.html with Google Fonts..."
sed -i 's|</head>|  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400\&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500\&display=swap" rel="stylesheet">\n  </head>|' src/index.html

echo ""
echo "✅ Done! Next steps:"
echo ""
echo "  1. cd $PROJECT"
echo "  2. Fill in src/environments/environment.ts with your Firebase + EmailJS keys"
echo "  3. npm start"
echo "  4. claude   ← start Claude Code session"
echo ""
echo "  Firebase setup:"
echo "  - Enable Auth → Google sign-in"
echo "  - Enable Firestore → paste firestore.rules from src/app/firestore.rules"
echo "  - Register web app → copy config to environment.ts"
