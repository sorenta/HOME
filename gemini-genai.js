

require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY
});


// Izdrukā visus pieejamos eksportus no @google/genai
console.log('Pieejamie @google/genai eksporti:', Object.keys(require('@google/genai')));