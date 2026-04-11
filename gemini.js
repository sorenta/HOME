require('dotenv').config();
const { VertexAI } = require('@google-cloud/vertexai');

const project = process.env.GOOGLE_CLOUD_PROJECT;
const location = process.env.GOOGLE_CLOUD_LOCATION;

const vertexAI = new VertexAI({ project, location });

async function runGemini() {
  const model = vertexAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: 'Sveiks, Gemini!' }] }],
  });
  console.log(result);
}

runGemini().catch(console.error);