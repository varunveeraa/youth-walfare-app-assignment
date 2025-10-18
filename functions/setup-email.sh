#!/bin/bash

echo "🚀 Youth Welfare Email Setup for University Assignment"
echo "=================================================="
echo ""

echo "Choose your setup option:"
echo "1. Use personal email (Gmail, Yahoo, etc.) - RECOMMENDED"
echo "2. Use sandbox mode (testing only - emails won't actually send)"
echo ""

read -p "Enter your choice (1 or 2): " choice

case $choice in
  1)
    echo ""
    echo "📧 Setting up with personal email..."
    echo ""
    echo "IMPORTANT: You need to:"
    echo "1. Sign up for SendGrid (free): https://sendgrid.com"
    echo "2. Go to Settings → Sender Authentication → Single Sender Verification"
    echo "3. Add and verify your email address"
    echo "4. Get your API key from Settings → API Keys"
    echo ""
    
    read -p "Enter your SendGrid API key: " api_key
    read -p "Enter your verified email address: " sender_email
    read -p "Enter sender name (or press Enter for default): " sender_name
    
    if [ -z "$sender_name" ]; then
      sender_name="Youth Welfare Assignment"
    fi
    
    echo ""
    echo "🔧 Configuring Firebase Functions..."
    
    firebase functions:config:set sendgrid.api_key="$api_key"
    firebase functions:config:set sendgrid.sender_email="$sender_email"
    firebase functions:config:set sendgrid.sender_name="$sender_name"
    
    echo ""
    echo "📦 Deploying functions..."
    npm run deploy
    
    echo ""
    echo "✅ Setup complete! Your functions will now send emails from: $sender_email"
    ;;
    
  2)
    echo ""
    echo "🧪 Setting up sandbox mode..."
    echo ""
    echo "In sandbox mode:"
    echo "- Emails are processed but not actually sent"
    echo "- You can see them in SendGrid activity log"
    echo "- Perfect for testing and assignments"
    echo ""
    
    read -p "Enter your SendGrid API key: " api_key
    
    echo ""
    echo "🔧 Configuring Firebase Functions..."
    
    firebase functions:config:set sendgrid.api_key="$api_key"
    firebase functions:config:set sendgrid.sender_email="test@example.com"
    firebase functions:config:set sendgrid.sender_name="Youth Welfare Assignment"
    firebase functions:config:set sendgrid.sandbox_mode="true"
    
    echo ""
    echo "📦 Deploying functions..."
    npm run deploy
    
    echo ""
    echo "✅ Setup complete! Functions are in sandbox mode - emails won't actually send."
    echo "Check SendGrid activity log to see processed emails."
    ;;
    
  *)
    echo "❌ Invalid choice. Please run the script again and choose 1 or 2."
    exit 1
    ;;
esac

echo ""
echo "🎓 Your assignment email functionality is now ready!"
echo "When users register, they will receive welcome emails."
echo ""
echo "To test:"
echo "1. Register a new user in your app"
echo "2. Check the Firebase Functions logs"
echo "3. Check your SendGrid activity dashboard"
