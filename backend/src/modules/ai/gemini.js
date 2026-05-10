import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
};

export const generateContent = async (prompt) => {
  const model = getModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const generateJSON = async (prompt) => {
  const model = getModel();
  const result = await model.generateContent(prompt);
  let text = result.response.text();

  text = text.replace(/```json/g, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(text);
  } catch {
    const err = new Error('Gemini returned invalid JSON');
    err.status = 500;
    err.code = 'AI_PARSE_ERROR';
    throw err;
  }
};