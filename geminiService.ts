
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Role } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODEL_NAME = 'gemini-3-flash-preview';

export const sendMessageStream = async (
  history: Message[],
  onChunk: (text: string) => void
) => {
  try {
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: "You are an expert Education & Career Guidance Assistant. Your goal is to provide high-quality, actionable advice regarding academic choices, college applications, career transitions, resume optimization, and skill development. Be supportive, professional, and clear. Use Markdown for formatting.",
      },
    });

    const lastMessage = history[history.length - 1];
    
    const result = await chat.sendMessageStream({ 
      message: lastMessage.text 
    });

    let fullText = "";
    for await (const chunk of result) {
      const chunkText = chunk.text;
      if (chunkText) {
        fullText += chunkText;
        onChunk(fullText);
      }
    }
    
    return fullText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
