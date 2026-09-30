const nodemailer = require("nodemailer");

/**
 * Configure Nodemailer Transporter
 */
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  // Check if real credentials are provided
  if (!user || !pass || user === "your_email@gmail.com" || pass.includes("placeholder")) {
    return null;
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: user.trim(),
      pass: pass.trim(),
    },
  });
};

/**
 * Send an official, beautifully styled HTML blood booking & verification receipt
 * 
 * @param {Object} details
 * @param {string} details.recipientEmail - The recipient's Gmail address
 * @param {string} details.recipientName - Name of the donor or hospital
 * @param {string} details.bookingId - Unique transaction ObjectId
 * @param {string} details.inventoryType - 'in' (Donation) or 'out' (Hospital Request)
 * @param {string} details.bloodGroup - Blood group (e.g., 'O+', 'AB-')
 * @param {number} details.quantity - Quantity in ML
 * @param {Object} details.organisation - Organisation details (name, email, phone, address)
 * @param {Date|string} details.createdAt - Timestamp of record creation
 */
const sendBloodBookingEmail = async ({
  recipientEmail,
  recipientName = "Valued Member",
  bookingId,
  inventoryType,
  bloodGroup,
  quantity,
  organisation = {},
  createdAt = new Date(),
}) => {
  try {
    const isDonation = inventoryType === "in";
    const typeLabel = isDonation ? "Blood Donation (IN)" : "Blood Booking / Request (OUT)";
    const actionColor = isDonation ? "#c82333" : "#0d6efd";
    const formattedDate = new Date(createdAt).toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "short",
    });

    const orgName = organisation?.organisationName || organisation?.name || "Official Blood Bank Center";
    const orgPhone = organisation?.phone || "N/A";
    const orgEmail = organisation?.email || "N/A";
    const orgAddress = organisation?.address || "Registered Blood Bank Facility";

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blood Bank Booking & Verification Receipt</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f6f9;
      color: #333333;
    }
    .wrapper {
      width: 100%;
      background-color: #f4f6f9;
      padding: 30px 10px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      border: 1px solid #e1e8ed;
    }
    .header {
      background: linear-gradient(135deg, #b01826 0%, #d92534 100%);
      padding: 32px 24px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .header p {
      margin: 6px 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 30px 24px;
    }
    .status-badge {
      display: inline-block;
      background-color: #d1e7dd;
      color: #0f5132;
      font-size: 12px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 20px;
    }
    .ref-box {
      background-color: #f8f9fa;
      border: 1px dashed #ced4da;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 24px;
      text-align: center;
    }
    .ref-label {
      font-size: 11px;
      text-transform: uppercase;
      color: #6c757d;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    .ref-value {
      font-family: 'Courier New', Courier, monospace;
      font-size: 18px;
      font-weight: bold;
      color: #212529;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .details-table tr {
      border-bottom: 1px solid #edf2f7;
    }
    .details-table td {
      padding: 12px 8px;
      font-size: 14px;
    }
    .details-table td.label {
      color: #6c757d;
      font-weight: 500;
      width: 40%;
    }
    .details-table td.value {
      color: #212529;
      font-weight: 600;
    }
    .blood-highlight {
      display: inline-block;
      background-color: #fde8e9;
      color: #b01826;
      font-weight: bold;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 16px;
    }
    .org-card {
      background-color: #fdfefe;
      border: 1px solid #e9ecef;
      border-left: 4px solid #b01826;
      border-radius: 6px;
      padding: 16px;
      margin-top: 20px;
    }
    .org-card h3 {
      margin: 0 0 8px;
      font-size: 15px;
      color: #212529;
    }
    .org-card p {
      margin: 4px 0;
      font-size: 13px;
      color: #555555;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px 24px;
      text-align: center;
      font-size: 12px;
      color: #6c757d;
      border-top: 1px solid #edf2f7;
    }
    .footer a {
      color: #b01826;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>🩸 Blood Bank Management System</h1>
        <p>Official Verification & Booking Confirmation</p>
      </div>

      <div class="content">
        <div style="text-align: center;">
          <span class="status-badge">✔ CONFIRMED & VERIFIED</span>
        </div>

        <p style="font-size: 16px; margin-top: 0;">Dear <strong>${recipientName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6; color: #495057;">
          This email confirms your recent <strong>${typeLabel}</strong> transaction with the Blood Bank system. The details of this record have been securely verified and saved in our live database.
        </p>

        <!-- Booking Reference Box -->
        <div class="ref-box">
          <div class="ref-label">Booking Reference ID</div>
          <div class="ref-value">${bookingId}</div>
        </div>

        <!-- Blood Details Table -->
        <table class="details-table">
          <tr>
            <td class="label">Transaction Type</td>
            <td class="value" style="color: ${actionColor};">${typeLabel}</td>
          </tr>
          <tr>
            <td class="label">Blood Group</td>
            <td class="value">
              <span class="blood-highlight">${bloodGroup}</span>
            </td>
          </tr>
          <tr>
            <td class="label">Quantity</td>
            <td class="value">${quantity} ML</td>
          </tr>
          <tr>
            <td class="label">Recipient/Owner Email</td>
            <td class="value">${recipientEmail}</td>
          </tr>
          <tr>
            <td class="label">Date & Time</td>
            <td class="value">${formattedDate}</td>
          </tr>
          <tr>
            <td class="label">Verification Status</td>
            <td class="value" style="color: #0f5132;">✔ Verified in Central Registry</td>
          </tr>
        </table>

        <!-- Handling Organisation Details -->
        <div class="org-card">
          <h3>🏥 Handling Organisation Details</h3>
          <p><strong>Organisation Name:</strong> ${orgName}</p>
          <p><strong>Contact Phone:</strong> ${orgPhone}</p>
          <p><strong>Email:</strong> ${orgEmail}</p>
          <p><strong>Facility Address:</strong> ${orgAddress}</p>
        </div>

        <p style="font-size: 13px; color: #6c757d; margin-top: 24px; line-height: 1.5;">
          ℹ️ <em>Please keep this receipt and Reference ID for any future correspondence, blood tracking, or hospital inquiries.</em>
        </p>
      </div>

      <div class="footer">
        <p style="margin: 0 0 6px 0;"><strong>Blood Bank Network</strong> &bull; Every Drop Counts</p>
        <p style="margin: 0;">This is an automated system notification sent to <strong>${recipientEmail}</strong>.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const transporter = createTransporter();

    if (!transporter) {
      console.log(
        `\n📧 [EMAIL SERVICE - DEMO MODE]` +
        `\nTo: ${recipientEmail}` +
        `\nSubject: 🩸 Blood Bank ${typeLabel} Confirmation [${bloodGroup} - ${quantity}ML]` +
        `\nReference ID: ${bookingId}` +
        `\nNotice: To send real emails via your Gmail account, set EMAIL_USER and EMAIL_PASS in your backend .env file.\n`
      );
      return { success: true, simulated: true, bookingId };
    }

    const mailOptions = {
      from: `"Blood Bank App" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `🩸 Blood Bank Booking & Verification Receipt [${bloodGroup} - ${quantity} ML]`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL SENT] Confirmation email sent successfully to ${recipientEmail}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId, bookingId };
  } catch (error) {
    // Non-blocking: logs clearly so DB transaction remains 100% intact
    console.error(`❌ [EMAIL ERROR] Failed to send email to ${recipientEmail}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send an official Welcome & Account Verification email on registration
 * 
 * @param {Object} details
 * @param {string} details.recipientEmail - The registered email address
 * @param {string} details.name - Name of donor, hospital, or organisation
 * @param {string} details.role - Account role (donar, hospital, organisation, admin)
 * @param {string} details.phone - Registered phone number
 * @param {string} details.address - Registered address
 * @param {string} details.userId - Unique User Account ID
 * @param {Date|string} details.createdAt - Timestamp of registration
 */
const sendRegistrationWelcomeEmail = async ({
  recipientEmail,
  name = "New Member",
  role = "donar",
  phone = "N/A",
  address = "N/A",
  userId,
  createdAt = new Date(),
}) => {
  try {
    const roleLabels = {
      donar: "Blood Donor Hero",
      hospital: "Healthcare & Hospital Partner",
      organisation: "Blood Bank Organisation",
      admin: "System Administrator",
    };
    const roleTitle = roleLabels[role] || role.toUpperCase();
    const formattedDate = new Date(createdAt).toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "short",
    });

    const roleGuidance = {
      donar: "As a registered donor, your voluntary blood donations directly save patient lives in critical situations, trauma surgeries, and cancer therapies. You can view your lifetime donation history directly from your dashboard.",
      hospital: "As a registered hospital partner, your facility can book, track, and consume verified blood units in real-time with automated tracking and batch verification.",
      organisation: "As an authorized blood bank organisation, you can manage stock levels, calculate live available ML, record donations, and fulfill hospital requisitions.",
      admin: "You have full administrative privileges to oversee blood stock, verify partner hospitals, manage donors, and supervise system analytics.",
    };

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Blood Bank Network</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f6f9;
      color: #333333;
    }
    .wrapper {
      width: 100%;
      background-color: #f4f6f9;
      padding: 30px 10px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      border: 1px solid #e1e8ed;
    }
    .header {
      background: linear-gradient(135deg, #198754 0%, #157347 100%);
      padding: 32px 24px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }
    .header p {
      margin: 6px 0 0;
      font-size: 14px;
      opacity: 0.95;
    }
    .content {
      padding: 30px 24px;
    }
    .status-badge {
      display: inline-block;
      background-color: #d1e7dd;
      color: #0f5132;
      font-size: 12px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 20px;
    }
    .info-box {
      background-color: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .details-table tr {
      border-bottom: 1px solid #edf2f7;
    }
    .details-table td {
      padding: 10px 8px;
      font-size: 14px;
    }
    .details-table td.label {
      color: #6c757d;
      font-weight: 500;
      width: 38%;
    }
    .details-table td.value {
      color: #212529;
      font-weight: 600;
    }
    .highlight-phone {
      color: #0d6efd;
      font-weight: bold;
      background-color: #e7f1ff;
      padding: 3px 8px;
      border-radius: 4px;
    }
    .callout {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 12px 16px;
      border-radius: 4px;
      margin-top: 20px;
      font-size: 13px;
      color: #664d03;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px 24px;
      text-align: center;
      font-size: 12px;
      color: #6c757d;
      border-top: 1px solid #edf2f7;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>🩸 Blood Bank Central Registry</h1>
        <p>Official Account Verification & Registration Notice</p>
      </div>

      <div class="content">
        <div style="text-align: center;">
          <span class="status-badge">✔ ACCOUNT REGISTERED & VERIFIED</span>
        </div>

        <p style="font-size: 16px;">Dear <strong>${name}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6; color: #495057;">
          Welcome to the <strong>Blood Bank Management System</strong>. Your account has been officially registered in the central healthcare database as a <strong>${roleTitle}</strong>.
        </p>

        <div class="info-box">
          <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 15px; color: #212529;">📋 Official Registration Summary</h3>
          <table class="details-table">
            <tr>
              <td class="label">Member / Facility Name</td>
              <td class="value">${name}</td>
            </tr>
            <tr>
              <td class="label">Account Role</td>
              <td class="value"><span style="color: #198754; font-weight: bold;">${roleTitle}</span></td>
            </tr>
            <tr>
              <td class="label">Registered Email</td>
              <td class="value">${recipientEmail}</td>
            </tr>
            <tr>
              <td class="label">Contact Phone</td>
              <td class="value"><span class="highlight-phone">${phone}</span></td>
            </tr>
            <tr>
              <td class="label">Address / Location</td>
              <td class="value">${address}</td>
            </tr>
            <tr>
              <td class="label">Account ID</td>
              <td class="value" style="font-family: monospace;">${userId || "N/A"}</td>
            </tr>
            <tr>
              <td class="label">Registration Date</td>
              <td class="value">${formattedDate}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 14px 18px; margin-top: 18px;">
          <h4 style="margin: 0 0 6px 0; font-size: 14px; color: #212529;">ℹ️ What you can do next:</h4>
          <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #555555;">
            ${roleGuidance[role] || "You can now log in to access your portal, view real-time blood metrics, and manage your transactions."}
          </p>
        </div>

        <div class="callout">
          📱 <strong>Mobile & Contact Alert:</strong> Your registered phone number <strong>${phone}</strong> is set as your verified contact channel for emergency blood requests and donation confirmations.
        </div>
      </div>

      <div class="footer">
        <p style="margin: 0 0 6px 0;"><strong>Blood Bank Network</strong> &bull; Saving Lives Every Day</p>
        <p style="margin: 0;">This email was sent to <strong>${recipientEmail}</strong> upon successful account registration.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const transporter = createTransporter();

    if (!transporter) {
      console.log(
        `\n📧 [REGISTRATION EMAIL - DEMO MODE]` +
        `\nTo: ${recipientEmail}` +
        `\nSubject: 🩸 Welcome to Blood Bank Network - Account Verified [${role.toUpperCase()}]` +
        `\nName: ${name}` +
        `\nPhone: ${phone}` +
        `\nNotice: Set EMAIL_USER and EMAIL_PASS in .env to deliver real Gmail messages.\n`
      );
      return { success: true, simulated: true, userId };
    }

    const mailOptions = {
      from: `"Blood Bank App" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `🩸 Welcome to Blood Bank Network - Account Verification & Details`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [REGISTRATION EMAIL SENT] Sent to ${recipientEmail} (Phone: ${phone}). MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId, userId };
  } catch (error) {
    console.error(`❌ [REGISTRATION EMAIL ERROR] Failed to send to ${recipientEmail}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendBloodBookingEmail, sendRegistrationWelcomeEmail };
