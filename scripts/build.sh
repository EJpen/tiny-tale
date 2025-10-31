#!/bin/bash
set -e

echo "🔧 Starting custom Prisma build for Vercel..."

# Generate Prisma client with all engines
echo "📦 Generating Prisma client..."
npx prisma generate

# List generated engines for debugging
echo "🔍 Checking generated engines..."
ls -la node_modules/.prisma/client/ | grep -E "(query-engine|libquery)" || echo "No engines found in .prisma/client"
ls -la node_modules/@prisma/client/ | grep -E "(query-engine|libquery)" || echo "No engines found in @prisma/client"

# Copy engines to ensure they're included in deployment
echo "📋 Copying engines to ensure deployment inclusion..."
mkdir -p .prisma-engines
cp -r node_modules/.prisma/client/query-engine-* .prisma-engines/ 2>/dev/null || echo "No query engines to copy"
cp -r node_modules/.prisma/client/libquery_engine-* .prisma-engines/ 2>/dev/null || echo "No lib engines to copy"

echo "✅ Prisma build complete!"
echo "🚀 Starting Next.js build..."

# Build Next.js
next build --turbopack

echo "🎉 Build complete!"