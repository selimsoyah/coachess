#!/bin/bash
# Apply migration 004 - Fix connections RLS policies

# Read environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

# Apply the migration using psql or Supabase SQL editor
echo "Please run this SQL in your Supabase SQL Editor:"
echo "=========================================="
cat supabase/migrations/004_fix_connections_rls.sql
echo "=========================================="
echo ""
echo "Or use the Supabase CLI:"
echo "supabase db push"
