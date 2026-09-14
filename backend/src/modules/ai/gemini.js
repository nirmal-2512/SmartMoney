import { GoogleGenAI } from '@google/genai';

const MODEL = 'gemini-3.6-flash';
//changed model

const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    const err = new Error('Gemini configuration is missing. Set GEMINI_API_KEY.');
    err.status = 500;
    err.code = 'AI_CONFIG_ERROR';
    throw err;
  }

  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

export const generateContent = async (prompt) => {
  const result = await getClient().models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  if (!result.text) {
    const err = new Error('Gemini returned an empty response');
    err.status = 502;
    err.code = 'AI_EMPTY_RESPONSE';
    throw err;
  }

  return result.text;
};

export const generateJSON = async (prompt) => {
  const result = await getClient().models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });
  let text = result.text;

  if (!text) {
    const err = new Error('Gemini returned an empty response');
    err.status = 502;
    err.code = 'AI_EMPTY_RESPONSE';
    throw err;
  }

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
