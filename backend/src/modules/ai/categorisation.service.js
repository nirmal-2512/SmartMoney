import { generateJSON } from './gemini.js';
import { Category, MerchantCategoryMapping } from '../../database/models/index.js';

export const categoriseTransaction = async (userId, description, amount, type) => {
  // Check merchant mapping first before calling AI
  const mapping = await MerchantCategoryMapping.findOne({
    where: { userId, merchantNamePattern: description.toLowerCase() },
  });

  if (mapping) {
    return {
      categoryId: mapping.categoryId,
      confidence: 1.0,
      needsReview: false,
      source: 'merchant_mapping',
    };
  }

  // Get user categories
  const categories = await Category.findAll({
    where: { userId },
    attributes: ['id', 'name', 'type'],
  });

  if (categories.length === 0) {
    return { categoryId: null, confidence: 0, needsReview: true, source: 'ai' };
  }

  const categoryList = categories
    .map((c) => `- ${c.name} (id: ${c.id}, type: ${c.type})`)
    .join('\n');

  const prompt = `
You are a personal finance assistant. Categorise the following transaction into one of the user's categories.

Transaction:
- Description: ${description}
- Amount: ${amount}
- Type: ${type}

User's categories:
${categoryList}

Rules:
- Only use categories from the list above
- Match based on merchant name, description context, and transaction type
- If unsure, set confidence below 0.85 and needsReview to true
- If no category fits at all, return categoryId as null

Return ONLY a JSON object with no explanation:
{
  "categoryId": "uuid or null",
  "confidence": 0.0 to 1.0,
  "needsReview": true or false,
  "reasoning": "brief explanation"
}
`;

  const result = await generateJSON(prompt);

  // Save merchant mapping if confidence is high
  if (result.categoryId && result.confidence >= 0.85) {
    await MerchantCategoryMapping.upsert({
      userId,
      merchantNamePattern: description.toLowerCase(),
      categoryId: result.categoryId,
      source: 'ai',
    });
  }

  return {
    categoryId: result.categoryId || null,
    confidence: result.confidence || 0,
    needsReview: result.needsReview || true,
    reasoning: result.reasoning || '',
    source: 'ai',
  };
};

export const categoriseMultiple = async (userId, transactions) => {
  const results = [];
  for (const transaction of transactions) {
    const result = await categoriseTransaction(
      userId,
      transaction.description,
      transaction.amount,
      transaction.type
    );
    results.push({ ...transaction, ...result });
  }
  return results;
};