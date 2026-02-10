import { GoogleGenAI, Type } from "@google/genai";
import { ParsedTaskData } from "../types";

const apiKey = process.env.API_KEY;

// Initialize the client only if the key exists to prevent immediate crashes, 
// though the app expects it.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const parseTaskWithAI = async (input: string): Promise<ParsedTaskData | null> => {
  if (!ai) {
    console.warn("Gemini API Key is missing.");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract task details from the following user input: "${input}". 
      Return the title, a due date string (ISO 8601 format if possible, or a clear relative string like '2023-10-27T10:00:00'), whether it implies a reminder/urgent, and a category.
      If no date is mentioned, do not populate the date string.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "The main task description" },
            dueDateString: { type: Type.STRING, description: "ISO date string if a time/date is mentioned, otherwise null", nullable: true },
            hasReminder: { type: Type.BOOLEAN, description: "True if the user says 'remind me', 'urgent', or sets a specific time" },
            category: { type: Type.STRING, enum: ["work", "personal", "others"], description: "Infer category from context" }
          },
          required: ["title", "hasReminder", "category"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text) as ParsedTaskData;
  } catch (error) {
    console.error("Error parsing task with AI:", error);
    return null;
  }
};
