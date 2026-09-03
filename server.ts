import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Lazy getter for GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Analyze Note Endpoint (Bangla / English auto-detection, List vs General Note)
app.post("/api/gemini/analyze-note", async (req, res) => {
  try {
    const { rawText, fallbackLanguage } = req.body;
    if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
      return res.status(400).json({ error: "rawText is required" });
    }

    const ai = getAI();
    const prompt = `Analyze this spoken or written note:
"${rawText.trim()}"

Identify:
1. Language: Is it 'bn' (Bangla), 'en' (English), or 'bilingual' / mixed?
2. Structure: Is it a checklist / shopping list / to-do list, or a general note / thoughts / reminder / idea?
3. Generate a concise, natural title (in the note's primary language).
4. If it is a list, split the items cleanly into an array of string tasks/items (remove numbers, dashes, bullet points).
5. Extract 2-4 relevant tags.
6. Provide a clean formatted text representation and a short 1-sentence summary.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: `You are a high-speed, accurate bilingual note parser specializing in Bengali (বাংলা) and English.
You must respond ONLY with a valid JSON object strictly matching this schema:
{
  "title": string,
  "category": "list" | "note" | "reminder" | "idea",
  "language": "bn" | "en" | "bilingual",
  "isList": boolean,
  "items": string[],
  "formattedContent": string,
  "summary": string,
  "tags": string[]
}`,
      },
    });

    const text = response.text || "{}";
    try {
      const parsed = JSON.parse(text);
      return res.json(parsed);
    } catch {
      return res.json({
        title: rawText.slice(0, 30),
        category: "note",
        language: fallbackLanguage || "en",
        isList: false,
        items: [],
        formattedContent: rawText,
        summary: rawText.slice(0, 80),
        tags: ["quick-note"],
      });
    }
  } catch (error: any) {
    console.error("Error analyzing note:", error);
    return res.status(500).json({
      error: error.message || "Failed to analyze note",
      fallback: true,
    });
  }
});

// Text to Speech Endpoint (Model: gemini-3.1-flash-tts-preview)
app.post("/api/gemini/tts", async (req, res) => {
  try {
    const { text, voiceName = "Kore" } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required for TTS" });
    }

    const ai = getAI();
    // Use gemini-3.1-flash-tts-preview as mandated
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Read clearly: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName || "Kore", // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
            },
          },
        },
      },
    });

    const audioPart = response.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData && part.inlineData.data
    );

    if (audioPart && audioPart.inlineData) {
      return res.json({
        audioBase64: audioPart.inlineData.data,
        mimeType: audioPart.inlineData.mimeType || "audio/pcm;rate=24000",
        format: "pcm",
        sampleRate: 24000,
      });
    }

    return res.status(502).json({ error: "No audio data received from TTS model" });
  } catch (error: any) {
    console.error("TTS error:", error);
    return res.status(500).json({ error: error.message || "TTS generation failed" });
  }
});

// High-Quality Image Generation Endpoint (Model: gemini-3-pro-image-preview / gemini-3-pro-image with 1K, 2K, 4K)
app.post("/api/gemini/generate-image", async (req, res) => {
  try {
    const {
      prompt,
      imageSize = "1K", // "1K", "2K", "4K"
      aspectRatio = "1:1", // "1:1", "4:3", "16:9", "3:4", "9:16"
    } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getAI();
    let response;

    // First try gemini-3-pro-image-preview / gemini-3-pro-image
    try {
      response = await ai.models.generateContent({
        model: "gemini-3-pro-image-preview",
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || "1:1",
            imageSize: imageSize || "1K",
          },
        },
      });
    } catch (err: any) {
      console.warn("gemini-3-pro-image-preview attempt failed, trying gemini-3-pro-image or flash-image:", err?.message);
      try {
        response = await ai.models.generateContent({
          model: "gemini-3-pro-image",
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio || "1:1",
              imageSize: imageSize || "1K",
            },
          },
        });
      } catch (err2: any) {
        // Fallback to high quality gemini-3.1-flash-image which supports 1K, 2K, 4K
        response = await ai.models.generateContent({
          model: "gemini-3.1-flash-image",
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio || "1:1",
              imageSize: imageSize || "1K",
            },
          },
        });
      }
    }

    let imageUrl = "";
    let caption = "";

    if (response?.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          imageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
        } else if (part.text) {
          caption += part.text;
        }
      }
    }

    if (!imageUrl) {
      return res.status(502).json({ error: "No image generated" });
    }

    return res.json({ imageUrl, caption, imageSize, aspectRatio });
  } catch (error: any) {
    console.error("Image generation error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate image" });
  }
});

// Multi-turn Gemini Chatbot Endpoint (Supports gemini-3.1-pro-preview, gemini-3.5-flash, gemini-3.1-flash-lite)
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const {
      messages = [],
      model = "gemini-3.5-flash",
      role = "note_organizer",
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const ai = getAI();

    // Map allowed models as specified in requirements
    // - gemini-3.1-pro-preview for particularly complex tasks
    // - gemini-3.5-flash for general tasks
    // - gemini-3.1-flash-lite for tasks that should happen fast
    let selectedModel = "gemini-3.5-flash";
    if (model === "gemini-3.1-pro-preview") selectedModel = "gemini-3.1-pro-preview";
    else if (model === "gemini-3.1-flash-lite") selectedModel = "gemini-3.1-flash-lite";

    let roleInstruction = "You are HeyNote AI, a bilingual voice notes companion fluent in Bengali (বাংলা) and English.";
    if (role === "note_organizer") {
      roleInstruction += " Your role is to help organize, summarize, structure lists, extract actionable tasks, and cross-reference thoughts.";
    } else if (role === "creative_brainstormer") {
      roleInstruction += " Your role is to expand ideas, suggest relevant outlines, connect disparate concepts, and generate creative frameworks.";
    } else if (role === "bilingual_translator") {
      roleInstruction += " Your role is to translate seamlessly between Bangla and English while preserving nuance, colloquial idioms, and structure.";
    }

    // Prepare history for chat API
    // The history contains past turns, and the final message is sent to chat.sendMessage
    const lastUserMessage = messages[messages.length - 1];
    const pastMessages = messages.slice(0, messages.length - 1);

    const history = pastMessages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content || "" }],
    }));

    const chat = ai.chats.create({
      model: selectedModel,
      config: {
        systemInstruction: roleInstruction,
      },
      history: history.length > 0 ? history : undefined,
    });

    const response = await chat.sendMessage({
      message: lastUserMessage.content || "",
    });

    return res.json({
      reply: response.text || "",
      model: selectedModel,
      role,
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    return res.status(500).json({ error: error.message || "Failed to process chat" });
  }
});

// Audio transcribe fallback (for voice notes recorded directly)
app.post("/api/gemini/transcribe", async (req, res) => {
  try {
    const { base64Audio, mimeType = "audio/webm", language = "auto" } = req.body;
    if (!base64Audio) {
      return res.status(400).json({ error: "base64Audio is required" });
    }

    const ai = getAI();
    const prompt = `Transcribe this voice audio accurately.
Language preference: ${language === "bn" ? "Bengali (বাংলা)" : language === "en" ? "English" : "Detect automatically between Bangla and English"}.
Provide clean, punctuated transcription without extraneous commentary.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-transcribe",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || "audio/webm",
              data: base64Audio,
            },
          },
          { text: prompt },
        ],
      },
    });

    return res.json({
      text: response.text || "",
    });
  } catch (error: any) {
    console.error("Transcribe error:", error);
    return res.status(500).json({ error: error.message || "Transcription failed" });
  }
});

// Vite / Static setup
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HeyNote server running on http://0.0.0.0:${PORT}`);
  });
}

start();
