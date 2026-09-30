const twilio = require("twilio");

const createSmsClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken || accountSid.includes("placeholder")) {
    return null; // Demo mode
  }
  return twilio(accountSid, authToken);
};

const sendSmsNotification = async ({ to, body }) => {
  try {
    const client = createSmsClient();
    if (!client) {
      console.log(`\n📱 [SMS SERVICE - DEMO MODE] To: ${to} | Message: ${body}\n`);
      return { success: true, simulated: true };
    }

    const message = await client.messages.create({
      body: body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });
    console.log(`✅ [SMS SENT] ID: ${message.sid}`);
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error(`❌ [SMS ERROR] Failed to send SMS to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendSmsNotification };
