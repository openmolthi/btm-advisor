#!/bin/bash
set -e
# Build both apps
cd advisor && npm ci && npm run build && cd ..
cd sukedachi && npm ci && npm run build && cd ..
# Assemble dist
rm -rf dist
mkdir -p dist/advisor dist/sukedachi
cp landing/index.html dist/
cp -r advisor/dist/* dist/advisor/
cp -r sukedachi/dist/* dist/sukedachi/
# Copy PWA files from sukedachi
cp sukedachi/public/manifest.json dist/sukedachi/ 2>/dev/null || true
cp sukedachi/public/sw.js dist/sukedachi/ 2>/dev/null || true
echo "Build complete! dist/ ready for deployment."
