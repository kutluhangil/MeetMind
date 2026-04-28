#!/bin/bash
# Regenerate Supabase TypeScript types from the linked project

set -euo pipefail

OUTPUT="apps/web/types/database.ts"

echo "🔄 Generating types from Supabase..."
npx supabase gen types typescript --linked > "$OUTPUT"

echo "✅ Types written to $OUTPUT"
echo "📋 Run 'npm run type-check' to verify"
