const { GoogleGenAI } = require("@google/genai");

// INITIALIZE AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const chatController = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).send({ success: false, message: "Message is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Fallback if no key is set
      return res.status(200).send({
        success: true,
        reply: "AI is in demo mode. Please configure GEMINI_API_KEY to enable smart responses. But generally, you can donate blood every 90 days and use the nearby locator to find hospitals!",
      });
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an intelligent Blood Bank AI Assistant. Answer this user's question concisely and professionally: ${message}`,
    });

    return res.status(200).send({
      success: true,
      reply: response.text,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error processing AI request",
      error: error.message,
    });
  }
};

module.exports = { chatController };
