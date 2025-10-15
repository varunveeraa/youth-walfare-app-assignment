/**
 * MindBridge Cloud Functions (1st Generation)
 * Serverless functions for user role assignment and email notifications
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

// SendGrid for email notifications
const sgMail = require("@sendgrid/mail");

// Initialize Firebase Admin
admin.initializeApp();

// Set SendGrid API key
const apiKey = "SG.cCaOKMCMRLKcRFAGv0FaUA." +
  "KgEJjE7Dhl_70sRkO5lXx0GqZ4tmiPEdQm3xufLltig";
sgMail.setApiKey(apiKey);

/**
 * Cloud Function: Automatic Role Assignment on User Registration
 * Triggers when a new user document is created in Firestore
 */
exports.assignUserRole = functions.firestore
    .document("users/{userId}")
    .onCreate(async (snap, context) => {
      const userData = snap.data();
      const userId = context.params.userId;

      console.log(`Processing role assignment for user: ${userId}`);

      try {
        // Default role assignment logic
        let assignedRole = userData.role || "youth";

        // Business logic for role assignment
        if (userData.email && userData.email.includes("@mindbridge.admin")) {
          assignedRole = "admin";
        } else if (userData.isProfessional || userData.qualifications) {
          assignedRole = "counsellor";
        }

        // Update user document with assigned role
        await admin.firestore()
            .collection("users")
            .doc(userId)
            .update({
              role: assignedRole,
              isActive: true,
              roleAssignedAt: new Date(),
              roleAssignedBy: "system",
            });

        // Set custom claims for role-based access
        await admin.auth().setCustomUserClaims(userId, {
          role: assignedRole,
          isActive: true,
        });

        console.log(`Role '${assignedRole}' assigned to user ${userId}`);

        // If counsellor, create initial profile
        if (assignedRole === "counsellor") {
          await createCounsellorProfile(userId, userData);
        }

        // Send welcome email
        await sendWelcomeEmail(
            userData.email,
            userData.displayName,
            assignedRole,
        );
        console.log(`Welcome email sent to user ${userId}`);

        return {success: true, role: assignedRole};
      } catch (error) {
        console.error(`Error assigning role to user ${userId}:`, error);

        // Update user document with error status
        await admin.firestore()
            .collection("users")
            .doc(userId)
            .update({
              roleAssignmentError: error.message,
              roleAssignmentErrorAt: new Date(),
            });

        throw error;
      }
    });

/**
 * Helper function to create initial counsellor profile
 * @param {string} userId - The user ID
 * @param {object} userData - The user data
 * @return {Promise} Promise that resolves when profile is created
 */
async function createCounsellorProfile(userId, userData) {
  try {
    const counsellorProfile = {
      userId: userId,
      name: userData.displayName || userData.name || "New Counsellor",
      email: userData.email,
      bio: "Professional counsellor ready to help you.",
      specialties: ["General Counseling"],
      qualifications: userData.qualifications || "Licensed Professional",
      experience: userData.experience || "1",
      languages: ["English"],
      isActive: true,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await admin.firestore()
        .collection("counsellorProfiles")
        .doc(userId)
        .set(counsellorProfile);

    console.log(`Created counsellor profile for user ${userId}`);
  } catch (error) {
    const msg = `Error creating counsellor profile for user ${userId}:`;
    console.error(msg, error);
    throw error;
  }
}

/**
 * Helper function to send welcome email to new users
 * @param {string} userEmail - The user's email address
 * @param {string} userName - The user's display name
 * @param {string} userRole - The user's assigned role
 * @return {Promise} Promise that resolves when email is sent
 */
async function sendWelcomeEmail(userEmail, userName, userRole) {
  try {
    const roleSpecificContent = {
      youth: "As a youth user, you can access mental health resources, " +
        "book counselling sessions, and connect with professional support.",
      counsellor: "As a counsellor, you can manage your profile, " +
        "set availability, and help young people on their journey.",
      admin: "As an admin, you have access to platform management tools " +
        "and user oversight capabilities.",
    };

    const msg = {
      to: userEmail,
      from: {
        email: "test@example.com",
        name: "MindBridge Support",
      },
      subject: "Welcome to MindBridge - Your Mental Health Journey Starts Here",
      text: `Welcome to MindBridge, ${userName || "there"}!

Thank you for joining our mental health support platform.

${roleSpecificContent[userRole] || "Welcome to our platform!"}

Getting Started:
- Complete your profile
- Explore our mental health resources
- Connect with our supportive community

Best regards,
The MindBridge Team`,
      html: `<h1>Welcome to MindBridge!</h1>
<p>Hello ${userName || "there"},</p>
<p>Thank you for joining our mental health support platform.</p>
<p>${roleSpecificContent[userRole] || "Welcome to our platform!"}</p>
<h3>Getting Started:</h3>
<ul>
  <li>Complete your profile</li>
  <li>Explore our mental health resources</li>
  <li>Connect with our supportive community</li>
</ul>
<p>Best regards,<br>The MindBridge Team</p>`,
    };

    await sgMail.send(msg);
    console.log(`Welcome email sent successfully to: ${userEmail}`);
    return {success: true, message: "Welcome email sent"};
  } catch (error) {
    console.error(`Error sending welcome email to ${userEmail}:`, error);
    return {success: false, message: error.message};
  }
}

/**
 * Cloud Function: Email Notification on Appointment Booking
 * Triggers when a new appointment is created
 */
exports.sendAppointmentNotification = functions.firestore
    .document("appointments/{appointmentId}")
    .onCreate(async (snap, context) => {
      const appointmentData = snap.data();
      const appointmentId = context.params.appointmentId;

      console.log(`Processing appointment notification: ${appointmentId}`);

      try {
        // Get user and counsellor information
        const [userDoc, counsellorDoc] = await Promise.all([
          admin.firestore().collection("users")
              .doc(appointmentData.userId).get(),
          admin.firestore().collection("users")
              .doc(appointmentData.counsellorId).get(),
        ]);

        const userData = userDoc.data();
        const counsellorData = counsellorDoc.data();

        // Get counsellor profile for additional info
        const counsellorProfileDoc = await admin.firestore()
            .collection("counsellorProfiles")
            .doc(appointmentData.counsellorId)
            .get();

        const counsellorProfile = counsellorProfileDoc.data();

        // Send emails
        await sendAppointmentConfirmationEmail(
            appointmentData, userData, counsellorProfile);
        await sendNewAppointmentNotificationEmail(
            appointmentData, counsellorData, userData);

        console.log(`Sent appointment notifications for ${appointmentId}`);

        return {success: true};
      } catch (error) {
        const msg = `Error sending notifications for ${appointmentId}:`;
        console.error(msg, error);
        throw error;
      }
    });

/**
 * Helper function to send appointment confirmation email to user
 * @param {object} appointment - The appointment data
 * @param {object} user - The user data
 * @param {object} counsellor - The counsellor data
 * @return {Promise} Promise that resolves when email is sent
 */
async function sendAppointmentConfirmationEmail(appointment, user, counsellor) {
  const appointmentDate = new Date(appointment.date.seconds * 1000);
  const counsellorName = counsellor && counsellor.name ||
    "Professional Counsellor";

  const msg = {
    to: user.email,
    from: "mindbridge@example.com",
    subject: "Appointment Confirmation - MindBridge",
    text: `
      Appointment Confirmed!

      Dear ${user.displayName || "User"},

      Your appointment has been successfully booked:

      Counsellor: ${counsellorName}
      Date: ${appointmentDate.toLocaleDateString()}
      Time: ${appointment.time}
      Type: ${appointment.type || "Counselling Session"}
      Duration: ${appointment.duration || "50"} minutes

      Please arrive early. Contact us 24 hours in advance for changes.

      Best regards,
      The MindBridge Team
    `,
  };

  await sgMail.send(msg);
  console.log(`Appointment confirmation email sent to ${user.email}`);
}

/**
 * Helper function to send new appointment notification to counsellor
 * @param {object} appointment - The appointment data
 * @param {object} counsellor - The counsellor data
 * @param {object} user - The user data
 * @return {Promise} Promise that resolves when email is sent
 */
async function sendNewAppointmentNotificationEmail(
    appointment, counsellor, user) {
  const appointmentDate = new Date(appointment.date.seconds * 1000);

  const msg = {
    to: counsellor.email,
    from: "mindbridge@example.com",
    subject: "New Appointment Booked - MindBridge",
    text: `
      New Appointment Booked

      Dear ${counsellor.displayName || "Counsellor"},

      A new appointment has been booked with you:

      Client: ${user.displayName || "Client"}
      Date: ${appointmentDate.toLocaleDateString()}
      Time: ${appointment.time}
      Type: ${appointment.type || "Counselling Session"}
      Duration: ${appointment.duration || "50"} minutes
      Notes: ${appointment.notes || "No additional notes"}

      Please prepare for the session.

      Best regards,
      The MindBridge Team
    `,
  };

  await sgMail.send(msg);
  console.log(`New appointment notification sent to ${counsellor.email}`);
}

/**
 * Simple test function
 */
exports.helloWorld = functions.https.onRequest((_, response) => {
  response.send("Hello from MindBridge Cloud Functions!");
});
