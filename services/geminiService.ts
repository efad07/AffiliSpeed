import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available
const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateSmartCaption = async (imageFile: File, productName?: string): Promise<string> => {
  if (!ai) {
    console.warn("Gemini API Key is missing.");
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
