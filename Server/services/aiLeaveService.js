import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../utils/logger.js';

export const getLeaveRecommendation = async ({
  employeeName,
  leaveType,
  startDate,
  endDate,
  reason,
  allowedDays,
  usedDays,
  teammatesOffCount,
}) => {
  try {
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
      logger.warn('AI_API_KEY not found. Skipping AI recommendation.');
      return null;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `
      You are an HR Assistant AI. Decide if this leave should be approved or flagged.
      Employee: ${employeeName}
      Type: ${leaveType}
      Dates: ${startDate} to ${endDate}
      Reason: ${reason}
      Leave Balance: ${allowedDays} allowed, ${usedDays} used.
      Team Context: ${teammatesOffCount} other teammate(s) already approved off during this time.

      Respond ONLY in JSON format exactly like this:
      {
        "recommendation": "Approve" (or "Flag"),
        "reasoning": "A one-sentence reason under 20 words."
      }
    `;

    const aiCall = async () => {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      // Clean up markdown code blocks if the AI includes them
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanText);
      
      if (!['Approve', 'Flag'].includes(parsed.recommendation)) {
        throw new Error('Invalid recommendation value');
      }
      return parsed;
    };

    // 15-second timeout to allow Gemini AI response on all network conditions
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI Request Timeout')), 15000)
    );

    const recommendation = await Promise.race([aiCall(), timeout]);
    return recommendation;
  } catch (error) {
    logger.error(`AI Recommendation failed: ${error.message}`);
    return null;
  }
};
