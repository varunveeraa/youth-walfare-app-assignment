/**
 * MindBridge Cloud Functions
 * Serverless functions for user role assignment and email notifications
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");

// The Firebase Admin SDK to access Firestore.
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const {getAuth} = require("firebase-admin/auth");

// SendGrid for email notifications
const sgMail = require("@sendgrid/mail");

initializeApp();

// Set SendGrid API key
const apiKey = "SG.cCaOKMCMRLKcRFAGv0FaUA." +
  "KgEJjE7Dhl_70sRkO5lXx0GqZ4tmiPEdQm3xufLltig";
sgMail.setApiKey(apiKey);

// For cost control, set maximum instances
setGlobalOptions({maxInstances: 10});

/**
 * Cloud Function: Automatic Role Assignment on User Registration
 * Triggers when a new user document is created in Firestore
 */
exports.assignUserRole = onDocumentCreated("/users/{userId}",
    async (event) => {
      const userData = event.data.data();
      const userId = event.params.userId;

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
        await getFirestore()
            .collection("users")
            .doc(userId)
            .update({
              role: assignedRole,
              isActive: true,
              roleAssignedAt: new Date(),
              roleAssignedBy: "system",
            });

        // Set custom claims for role-based access
        await getAuth().setCustomUserClaims(userId, {
          role: assignedRole,
          isActive: true,
        });

        console.log(`Role '${assignedRole}' assigned to user ${userId}`);

        // If counsellor, create initial profile
        if (assignedRole === "counsellor") {
          await createCounsellorProfile(userId, userData);
        }

        return {success: true, role: assignedRole};
      } catch (error) {
        console.error(`Error assigning role to user ${userId}:`, error);

        // Update user document with error status
        await getFirestore()
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

    await getFirestore()
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
 * Cloud Function: Email Notification on Appointment Booking
 * Triggers when a new appointment is created
 */
exports.sendAppointmentNotification = onDocumentCreated(
    "/appointments/{appointmentId}", async (event) => {
      const appointmentData = event.data.data();
      const appointmentId = event.params.appointmentId;

      console.log(`Processing appointment notification: ${appointmentId}`);

      try {
        // Get user and counsellor information
        const [userDoc, counsellorDoc] = await Promise.all([
          getFirestore().collection("users")
              .doc(appointmentData.userId).get(),
          getFirestore().collection("users")
              .doc(appointmentData.counsellorId).get(),
        ]);

        const userData = userDoc.data();
        const counsellorData = counsellorDoc.data();

        // Get counsellor profile for additional info
        const counsellorProfileDoc = await getFirestore()
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
exports.helloWorld = onRequest((request, response) => {
  response.send("Hello from MindBridge Cloud Functions!");
});
