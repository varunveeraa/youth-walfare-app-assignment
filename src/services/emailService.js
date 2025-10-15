import sgMail from '@sendgrid/mail'
import ical from 'ical-generator'

// Initialize SendGrid with API key
const SENDGRID_API_KEY = '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'
sgMail.setApiKey(SENDGRID_API_KEY)

// Verified sender email (must be verified in SendGrid)
const FROM_EMAIL = 'mindbridge@example.com'
const FROM_NAME = 'MindBridge Support'

class EmailService {
  constructor() {
    this.isConfigured = !!SENDGRID_API_KEY
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(userEmail, userName, userRole) {
    if (!this.isConfigured) {
      console.warn('SendGrid not configured, skipping welcome email')
      return { success: false, message: 'Email service not configured' }
    }

    try {
      const msg = {
        to: userEmail,
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME
        },
        subject: 'Welcome to MindBridge - Your Mental Health Journey Starts Here',
        text: this.getWelcomeEmailText(userName, userRole),
        html: this.getWelcomeEmailHTML(userName, userRole)
      }

      await sgMail.send(msg)
      console.log('Welcome email sent successfully to:', userEmail)
      return { success: true, message: 'Welcome email sent' }

    } catch (error) {
      console.error('Error sending welcome email:', error)
      return { success: false, message: error.message }
    }
  }

  /**
   * Send appointment confirmation email with .ics attachment
   */
  async sendAppointmentConfirmation(appointment, counsellorInfo, userInfo) {
    if (!this.isConfigured) {
      console.warn('SendGrid not configured, skipping appointment email')
      return { success: false, message: 'Email service not configured' }
    }

    try {
      // Generate .ics calendar file
      const icsContent = this.generateICSFile(appointment, counsellorInfo, userInfo)
      
      const msg = {
        to: userInfo.email,
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME
        },
        subject: `Appointment Confirmed - ${counsellorInfo.name} on ${this.formatDate(appointment.appointmentDate)}`,
        text: this.getAppointmentEmailText(appointment, counsellorInfo, userInfo),
        html: this.getAppointmentEmailHTML(appointment, counsellorInfo, userInfo),
        attachments: [
          {
            content: Buffer.from(icsContent).toString('base64'),
            filename: 'appointment.ics',
            type: 'text/calendar',
            disposition: 'attachment'
          }
        ]
      }

      await sgMail.send(msg)
      console.log('Appointment confirmation sent successfully to:', userInfo.email)
      return { success: true, message: 'Appointment confirmation sent' }

    } catch (error) {
      console.error('Error sending appointment confirmation:', error)
      return { success: false, message: error.message }
    }
  }

  /**
   * Send appointment reminder email
   */
  async sendAppointmentReminder(appointment, counsellorInfo, userInfo) {
    if (!this.isConfigured) {
      console.warn('SendGrid not configured, skipping reminder email')
      return { success: false, message: 'Email service not configured' }
    }

    try {
      const msg = {
        to: userInfo.email,
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME
        },
        subject: `Reminder: Appointment Tomorrow with ${counsellorInfo.name}`,
        text: this.getReminderEmailText(appointment, counsellorInfo, userInfo),
        html: this.getReminderEmailHTML(appointment, counsellorInfo, userInfo)
      }

      await sgMail.send(msg)
      console.log('Appointment reminder sent successfully to:', userInfo.email)
      return { success: true, message: 'Appointment reminder sent' }

    } catch (error) {
      console.error('Error sending appointment reminder:', error)
      return { success: false, message: error.message }
    }
  }

  /**
   * Generate ICS calendar file for appointment
   */
  generateICSFile(appointment, counsellorInfo, userInfo) {
    const calendar = ical({
      domain: 'mindbridge.com',
      name: 'MindBridge Appointments',
      timezone: 'America/New_York'
    })

    const startDate = new Date(appointment.appointmentDate)
    const endDate = new Date(startDate.getTime() + (appointment.duration || 60) * 60000) // Default 60 minutes

    calendar.createEvent({
      start: startDate,
      end: endDate,
      summary: `Counselling Session with ${counsellorInfo.name}`,
      description: `Mental health counselling session with ${counsellorInfo.name}\n\nSession Type: ${appointment.sessionType || 'Video Call'}\n\nMindBridge Platform`,
      location: appointment.sessionType === 'in-person' ? counsellorInfo.address : 'Online Video Call',
      organizer: {
        name: counsellorInfo.name,
        email: counsellorInfo.email || FROM_EMAIL
      },
      attendees: [
        {
          name: userInfo.displayName || userInfo.email,
          email: userInfo.email,
          rsvp: true
        }
      ]
    })

    return calendar.toString()
  }

  /**
   * Welcome email templates
   */
  getWelcomeEmailText(userName, userRole) {
    const roleSpecificContent = {
      youth: 'As a youth user, you can access mental health resources, book counselling sessions, and connect with professional support.',
      counsellor: 'As a counsellor, you can manage your profile, set availability, and help young people on their mental health journey.',
      admin: 'As an admin, you have access to platform management tools and user oversight capabilities.'
    }

    return `
Welcome to MindBridge, ${userName}!

Thank you for joining our mental health support platform. We're excited to have you as part of our community.

${roleSpecificContent[userRole] || 'Welcome to our platform!'}

Getting Started:
- Complete your profile to get the most out of MindBridge
- Explore our mental health resources
- Connect with our supportive community

If you have any questions, our support team is here to help.

Best regards,
The MindBridge Team

---
This email was sent to you because you registered for a MindBridge account.
If you didn't create this account, please contact our support team.
    `.trim()
  }

  getWelcomeEmailHTML(userName, userRole) {
    const roleSpecificContent = {
      youth: 'As a youth user, you can access mental health resources, book counselling sessions, and connect with professional support.',
      counsellor: 'As a counsellor, you can manage your profile, set availability, and help young people on their mental health journey.',
      admin: 'As an admin, you have access to platform management tools and user oversight capabilities.'
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #26a69a; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .btn { background: #26a69a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to MindBridge!</h1>
    </div>
    <div class="content">
      <h2>Hello ${userName},</h2>
      <p>Thank you for joining our mental health support platform. We're excited to have you as part of our community.</p>
      
      <p>${roleSpecificContent[userRole] || 'Welcome to our platform!'}</p>
      
      <h3>Getting Started:</h3>
      <ul>
        <li>Complete your profile to get the most out of MindBridge</li>
        <li>Explore our mental health resources</li>
        <li>Connect with our supportive community</li>
      </ul>
      
      <p>If you have any questions, our support team is here to help.</p>
      
      <p>Best regards,<br>The MindBridge Team</p>
    </div>
    <div class="footer">
      <p>This email was sent to you because you registered for a MindBridge account.</p>
      <p>If you didn't create this account, please contact our support team.</p>
    </div>
  </div>
</body>
</html>
    `.trim()
  }

  /**
   * Appointment email templates
   */
  getAppointmentEmailText(appointment, counsellorInfo, userInfo) {
    return `
Appointment Confirmed!

Hello ${userInfo.displayName || userInfo.email},

Your counselling appointment has been confirmed with the following details:

Counsellor: ${counsellorInfo.name}
Date: ${this.formatDate(appointment.appointmentDate)}
Time: ${this.formatTime(appointment.appointmentDate)}
Duration: ${appointment.duration || 60} minutes
Session Type: ${appointment.sessionType || 'Video Call'}

${appointment.sessionType === 'in-person' ? 
  `Location: ${counsellorInfo.address || 'Address will be provided separately'}` :
  'Join Link: A video call link will be sent closer to your appointment time.'
}

Please save the attached calendar file (.ics) to add this appointment to your calendar.

If you need to reschedule or cancel, please contact us at least 24 hours in advance.

Best regards,
The MindBridge Team
    `.trim()
  }

  getAppointmentEmailHTML(appointment, counsellorInfo, userInfo) {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #26a69a; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .appointment-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Appointment Confirmed!</h1>
    </div>
    <div class="content">
      <h2>Hello ${userInfo.displayName || userInfo.email},</h2>
      <p>Your counselling appointment has been confirmed with the following details:</p>
      
      <div class="appointment-details">
        <h3>Appointment Details</h3>
        <p><strong>Counsellor:</strong> ${counsellorInfo.name}</p>
        <p><strong>Date:</strong> ${this.formatDate(appointment.appointmentDate)}</p>
        <p><strong>Time:</strong> ${this.formatTime(appointment.appointmentDate)}</p>
        <p><strong>Duration:</strong> ${appointment.duration || 60} minutes</p>
        <p><strong>Session Type:</strong> ${appointment.sessionType || 'Video Call'}</p>
        ${appointment.sessionType === 'in-person' ? 
          `<p><strong>Location:</strong> ${counsellorInfo.address || 'Address will be provided separately'}</p>` :
          '<p><strong>Join Link:</strong> A video call link will be sent closer to your appointment time.</p>'
        }
      </div>
      
      <p>Please save the attached calendar file (.ics) to add this appointment to your calendar.</p>
      <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
      
      <p>Best regards,<br>The MindBridge Team</p>
    </div>
    <div class="footer">
      <p>MindBridge - Your Mental Health Support Platform</p>
    </div>
  </div>
</body>
</html>
    `.trim()
  }

  /**
   * Reminder email templates
   */
  getReminderEmailText(appointment, counsellorInfo, userInfo) {
    return `
Appointment Reminder

Hello ${userInfo.displayName || userInfo.email},

This is a friendly reminder about your upcoming counselling appointment:

Counsellor: ${counsellorInfo.name}
Date: ${this.formatDate(appointment.appointmentDate)}
Time: ${this.formatTime(appointment.appointmentDate)}

Please make sure you're prepared for your session. If you need to reschedule, please contact us as soon as possible.

Best regards,
The MindBridge Team
    `.trim()
  }

  getReminderEmailHTML(appointment, counsellorInfo, userInfo) {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ff9800; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .reminder-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ff9800; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Appointment Reminder</h1>
    </div>
    <div class="content">
      <h2>Hello ${userInfo.displayName || userInfo.email},</h2>
      <p>This is a friendly reminder about your upcoming counselling appointment:</p>
      
      <div class="reminder-details">
        <p><strong>Counsellor:</strong> ${counsellorInfo.name}</p>
        <p><strong>Date:</strong> ${this.formatDate(appointment.appointmentDate)}</p>
        <p><strong>Time:</strong> ${this.formatTime(appointment.appointmentDate)}</p>
      </div>
      
      <p>Please make sure you're prepared for your session. If you need to reschedule, please contact us as soon as possible.</p>
      
      <p>Best regards,<br>The MindBridge Team</p>
    </div>
  </div>
</body>
</html>
    `.trim()
  }

  /**
   * Utility methods
   */
  formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  formatTime(date) {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }
}

export default new EmailService()
