# Youth Welfare Cloud Functions

This directory contains Firebase Cloud Functions for the Youth Welfare application.

## Functions Overview

### 1. `assignUserRole`
- **Trigger**: Firestore document creation in `users/{userId}`
- **Purpose**: Automatically assigns roles to new users based on their profile data
- **Features**:
  - Assigns "admin" role for emails containing "@youthwelfare.admin"
  - Assigns "counsellor" role for users with professional qualifications
  - Defaults to "youth" role for regular users
  - Creates counsellor profiles for counsellor users
  - Sends welcome emails (if configured)
  - Sets custom claims for role-based access control

### 2. `sendAppointmentNotification`
- **Trigger**: Firestore document creation in `appointments/{appointmentId}`
- **Purpose**: Sends email notifications when appointments are booked
- **Features**:
  - Sends confirmation email to the user
  - Sends notification email to the counsellor
  - Includes appointment details and instructions

## Setup Instructions

### 1. Install Dependencies
```bash
cd functions
npm install
```

### 2. Configure SendGrid (Optional)
To enable email functionality, you need to configure SendGrid:

1. **Get a SendGrid account** at [SendGrid](https://sendgrid.com/)
2. **Create and verify a sender identity**:
   - Go to Settings → Sender Authentication
   - Add and verify an email address you control (e.g., your Gmail)
3. **Get an API key** from Settings → API Keys
4. **Configure the functions**:
```bash
# Required: Set your SendGrid API key
firebase functions:config:set sendgrid.api_key="YOUR_SENDGRID_API_KEY"

# Required: Set the verified sender email
firebase functions:config:set sendgrid.sender_email="your-verified-email@gmail.com"

# Optional: Set custom sender name (defaults to "Youth Welfare Support")
firebase functions:config:set sendgrid.sender_name="Your App Name"
```

**Important**: You must verify the sender email in SendGrid before emails will work.

**Note**: Email functionality will be disabled if no API key is configured. The functions will still work for role assignment and other features.

### 3. Deploy Functions
```bash
# Deploy all functions
npm run deploy

# Or deploy specific function
firebase deploy --only functions:assignUserRole
firebase deploy --only functions:sendAppointmentNotification
```

### 4. Local Development
```bash
# Start local emulator
npm run serve

# View function logs
npm run logs
```

## Email Configuration

The functions use configurable email settings:
- **From Address**: Set via `sendgrid.sender_email` (defaults to `noreply@example.com`)
- **From Name**: Set via `sendgrid.sender_name` (defaults to `Youth Welfare Support`)

**Important**: You must verify the sender email address in your SendGrid account before emails will work.

### Quick Setup Example:
```bash
# Example using Gmail (you must verify this email in SendGrid)
firebase functions:config:set sendgrid.sender_email="yourname@gmail.com"
firebase functions:config:set sendgrid.sender_name="Youth Welfare App"

# Optional: Enable sandbox mode for testing (emails won't actually send)
firebase functions:config:set sendgrid.sandbox_mode="true"
```

## For University Assignments

If you don't own a domain, you have these options:

### Option 1: Use Personal Email (Recommended)
1. Sign up for SendGrid (free)
2. In SendGrid: Settings → Sender Authentication → Single Sender Verification
3. Add your personal email (Gmail, Yahoo, etc.)
4. Verify it via the email SendGrid sends you
5. Configure functions with your verified email

### Option 2: Sandbox Mode (Testing Only)
Enable sandbox mode to test email functionality without actually sending emails:
```bash
firebase functions:config:set sendgrid.sandbox_mode="true"
```
In sandbox mode, SendGrid will accept the emails but not deliver them. You can see them in your SendGrid activity log.

## Security Notes

- The SendGrid API key is stored securely using Firebase Functions configuration
- Never commit API keys to version control
- Email functionality gracefully degrades if not configured

## Testing

You can test the functions locally using the Firebase emulator:

```bash
npm run serve
```

This will start the functions emulator and allow you to test triggers locally.

## Monitoring

Monitor function execution in the Firebase Console:
- Go to Firebase Console > Functions
- View logs, metrics, and error reports
- Set up alerts for function failures

## Troubleshooting

### Common Issues

1. **Email not sending**: Check if SendGrid API key is configured correctly
2. **Function timeout**: Increase timeout in function configuration if needed
3. **Permission errors**: Ensure Firebase Admin SDK has proper permissions

### Debugging

View function logs:
```bash
npm run logs
```

Or in Firebase Console > Functions > Logs
