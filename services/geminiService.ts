import { GoogleGenAI } from "@google/genai";

// Safely access process.env to prevent "ReferenceError: process is not defined" in browser
const getApiKey = () => {
  try {
    // Check if process exists (Node/Polyfilled env)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    // Check for Vite specific env if used later
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    console.warn("Could not read API Key from environment");
  }
  return "";
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey: apiKey });

export const generateSmartCaption = async (imageFile: File, productName?: string): Promise<string> => {
  if (!apiKey) {
    console.warn("Gemini API Key is missing. Please set REACT_APP_API_KEY or VITE_API_KEY.");
    return "Amazing product! Check it out. #deal";
  }

  try {
    // Convert file to base64
    const base64Data = await fileToGenerativePart(imageFile);

    const model = 'gemini-3-flash-preview'; 
    const prompt = `Write a short, viral, engaging social media caption for this image. 
    ${productName ? `The product name is: ${productName}.` : ''}
    Include 2-3 relevant hashtags. Focus on selling the product as an affiliate. 
    Keep it under 2 sentences + hashtags.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { mimeType: imageFile.type, data: base64Data } },
          { text: prompt }
        ]
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Error generating caption:", error);
    return "Check out this awesome deal! #affiliate";
  }
};

async function fileToGenerativePart(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}