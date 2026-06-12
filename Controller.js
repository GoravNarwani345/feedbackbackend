const Feedback = require("./model");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Read and normalize API key
const _rawKey = process.env.GEMINI_API_KEY || '';
const GEMINI_API_KEY = typeof _rawKey === 'string' ? _rawKey.trim() : '';

let genAI = null;
if (GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const masked = GEMINI_API_KEY.slice(-4).padStart(GEMINI_API_KEY.length, '*');
    console.log('Gemini API key present, last4=' + masked.slice(-4));
  } catch (err) {
    console.error('Failed initializing GoogleGenerativeAI:', err);
    genAI = null;
  }
} else {
  console.warn('GEMINI_API_KEY is not set — AI analysis will be skipped (neutral defaults).');
}

const analyzeFeedback = async (feedbackText) => {
  // If the SDK wasn't initialized, skip calling the API and return a neutral analysis
  if (!genAI) {
    return { sentiment: 'Neutral', priorityScore: 3 }
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Analyze the customer feedback below.

Return ONLY valid JSON in this format:

{
  "sentiment": "Positive",
  "priorityScore": 1
}

Rules:
- sentiment must be Positive, Neutral, or Negative
- priorityScore must be from 1 to 5
- Positive feedback => priorityScore 1-2
- Neutral feedback => priorityScore 3
- Negative feedback => priorityScore 4-5

Feedback:
"${feedbackText}"
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const cleanedResponse = response
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("Gemini Error:", error);

    return {
      sentiment: "Neutral",
      priorityScore: 3,
    };
  }
};

const createFeedback = async (req, res) => {
  try {
    // Accept either frontend keys (name, email, feedback) or backend keys
    const {
      customerName: bodyCustomerName,
      feedbackText: bodyFeedbackText,
      Email: bodyEmail,
      name,
      email,
      feedback,
    } = req.body;

    const customerName = bodyCustomerName || name;
    const feedbackText = bodyFeedbackText || feedback;
    const Email = bodyEmail || email;

    if (!customerName || !feedbackText || !Email) {
      return res.status(400).json({
        success: false,
        message: "Customer name, email, and feedback text are required",
      });
    }

    const aiAnalysis = await analyzeFeedback(feedbackText);

    const feedbackDoc = await Feedback.create({
      customerName,
      feedbackText,
      Email,
      sentimentTag: aiAnalysis.sentiment,
      priorityScore: aiAnalysis.priorityScore,
    });

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback: feedbackDoc,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      feedbacks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  createFeedback,
  getAllFeedback,
};