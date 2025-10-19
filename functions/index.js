/**
 * Youth Welfare Cloud Functions - Essential Email Functionality
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

// Initialize Firebase Admin
admin.initializeApp();

// SendGrid Configuration
const config = functions.config();
const sendGridApiKey = config.sendgrid && config.sendgrid.api_key;
const senderEmail = config.sendgrid && config.sendgrid.sender_email ||
  "noreply@example.com";
const senderName = config.sendgrid && config.sendgrid.sender_name ||
  "Youth Welfare Support";

if (sendGridApiKey) {
  sgMail.setApiKey(sendGridApiKey);
}

/**
 * Essential: User Registration with Role Assignment and Welcome Email
 */
exports.assignUserRole = functions.firestore
    .document("users/{userId}")
    .onCreate(async (snap, context) => {
      const userData = snap.data();
      const userId = context.params.userId;

      try {
        // Simple role assignment
        let assignedRole = userData.role || "youth";
        if (userData.email && userData.email.includes("@admin")) {
          assignedRole = "admin";
        } else if (userData.isProfessional) {
          assignedRole = "counsellor";
        }

        // Update user with role
        await admin.firestore()
            .collection("users")
            .doc(userId)
            .update({
              role: assignedRole,
              isActive: true,
              roleAssignedAt: new Date(),
            });

        // Set auth claims
        await admin.auth().setCustomUserClaims(userId, {
          role: assignedRole,
        });

        // Send welcome email
        if (sendGridApiKey && userData.email) {
          await sendWelcomeEmail(userData.email, userData.displayName,
              assignedRole);
        }

        return {success: true, role: assignedRole};
      } catch (error) {
        throw error;
      }
    });

/**
 * Essential: Send welcome email to new users
 * @param {string} userEmail - User email address
 * @param {string} userName - User display name
 * @param {string} userRole - User role
 */
async function sendWelcomeEmail(userEmail, userName, userRole) {
  if (!sendGridApiKey) return;

  try {
    const msg = {
      to: userEmail,
      from: {email: senderEmail, name: senderName},
      subject: "Welcome to Youth Welfare Platform",
      text: `Welcome ${userName || "there"}! Your ${userRole} account ` +
        `is ready.`,
      html: `<h2>Welcome to Youth Welfare Platform!</h2>
        <p>Hello ${userName || "there"},</p>
        <p>Your account has been created with <strong>${userRole}</strong>
        access.</p>
        <p>You can now log in and start using the platform.</p>
        <p>Best regards,<br>Youth Welfare Team</p>`,
    };

    await sgMail.send(msg);
  } catch (error) {
    // Email sending failed silently
  }
}

/**
 * Essential: Send appointment confirmation emails
 */
exports.sendAppointmentNotification = functions.firestore
    .document("appointments/{appointmentId}")
    .onCreate(async (snap, context) => {
      if (!sendGridApiKey) return;

      const appointmentData = snap.data();
      const appointmentId = context.params.appointmentId;

      try {
        // Get user and counsellor info
        const [userDoc, counsellorDoc] = await Promise.all([
          admin.firestore().collection("users")
              .doc(appointmentData.userId).get(),
          admin.firestore().collection("users")
              .doc(appointmentData.counsellorId).get(),
        ]);

        const userData = userDoc.data();
        const counsellorData = counsellorDoc.data();

        // Send confirmation to user
        await sendAppointmentEmail(appointmentData, userData, "confirmation");
        // Send notification to counsellor
        await sendAppointmentEmail(appointmentData, counsellorData,
            "notification");

      } catch (error) {
        // Email sending failed silently
      }
    });

/**
 * Essential: Send appointment emails
 * @param {object} appointment - Appointment data
 * @param {object} user - User data
 * @param {string} type - Email type
 */
async function sendAppointmentEmail(appointment, user, type) {
  if (!sendGridApiKey) return;

  try {
    const isConfirmation = type === "confirmation";
    const subject = isConfirmation ?
      "Appointment Confirmation" : "New Appointment Booked";

    // Format date and time from appointmentDate timestamp
    let formattedDate = "Not specified";
    let formattedTime = "Not specified";

    if (appointment.appointmentDate) {
      let appointmentDateTime;

      // Handle both Firestore Timestamp and regular Date objects
      if (appointment.appointmentDate.toDate) {
        // Firestore Timestamp
        appointmentDateTime = appointment.appointmentDate.toDate();
      } else if (appointment.appointmentDate instanceof Date) {
        // Regular Date object
        appointmentDateTime = appointment.appointmentDate;
      } else {
        // String or number timestamp
        appointmentDateTime = new Date(appointment.appointmentDate);
      }

      // Format date and time
      formattedDate = appointmentDateTime.toLocaleDateString("en-AU", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      formattedTime = appointmentDateTime.toLocaleTimeString("en-AU", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    const sessionType = appointment.sessionType || "Counselling";
    const duration = appointment.duration ?
      `${appointment.duration} minutes` : "60 minutes";

    const msg = {
      to: user.email,
      from: {email: senderEmail, name: senderName},
      subject: subject,
      text: `${subject}! Your appointment on ${formattedDate} at ` +
        `${formattedTime} (${sessionType}, ${duration}).`,
      html: `<h2>${subject}</h2>
        <p>Hello ${user.displayName || "there"},</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${formattedTime}</p>
        <p><strong>Type:</strong> ${sessionType}</p>
        <p><strong>Duration:</strong> ${duration}</p>
        ${appointment.counsellorName ?
          `<p><strong>Counsellor:</strong> ${appointment.counsellorName}</p>` :
          ""}
        <p>We look forward to your session. Please join a few minutes early.</p>
        <p>Best regards,<br>Youth Welfare Team</p>`,
    };

    await sgMail.send(msg);
  } catch (error) {
    // Email sending failed silently
  }
}
