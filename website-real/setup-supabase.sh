#!/bin/bash

# Supabase Setup Script for NY
# This script provides the commands to run in your Supabase dashboard

echo "🚀 NY Supabase Setup Guide"
echo "======================================"
echo ""

echo "📝 Step 1: Create Storage Buckets"
echo "Go to Storage > Create bucket in your Supabase dashboard"
echo "Create these buckets (all public: false initially):"
echo "  - products"
echo "  - tickets" 
echo "  - orders"
echo "  - users"
echo "  - admin"
echo ""

echo "🗃️ Step 2: Run Database Migrations"
echo "Go to SQL Editor in your Supabase dashboard and run the SQL from:"
echo "supabase-setup.md (sections 2, 3, and 4)"
echo ""

echo "🔒 Step 3: Set up Storage Policies"
echo "After creating buckets, run the storage policies from:"
echo "supabase-setup.md (section 1)"
echo ""

echo "🧪 Step 4: Test the Setup"
echo "Run this development server to test:"
echo "npm run dev"
echo ""

echo "📋 Verification Checklist:"
echo "□ 5 storage buckets created"
echo "□ All database tables created with RLS enabled"
echo "□ Storage policies applied"
echo "□ Functions and triggers created"
echo "□ Test ticket submission works"
echo "□ Test file uploads work"
echo "□ Admin panel can access data"
echo ""

echo "🔍 Quick Test Commands:"
echo "# Test if tables exist"
echo "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
echo ""
echo "# Test if RLS is enabled"
echo "SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';"
echo ""
echo "# Test ticket creation"
echo "SELECT generate_ticket_id();"
echo ""

echo "💡 Need help? Check the full guide in supabase-setup.md"