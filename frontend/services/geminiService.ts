import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Recommendation } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTION_COACH = `
You are the "Energy Coach" for the EnergyMatch platform. 
You assist both Small/Medium Enterprises (PyMEs) and Homeowners in Colombia. 
Your goal is to educate the user about renewable energy, explain technical terms (ROI, kWh, Inverters) in simple Spanish, 
and suggest efficiency improvements. Be friendly, professional, and concise. 
Always consider the local climate conditions.
`;

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      const base64Content = base64Data.split(',')[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeEnergyBill = async (file: File): Promise<{ consumption: number, cost: number, rate: number, hasPeaks: boolean }> => {
  try {
    const imagePart = await fileToGenerativePart(file);

    const prompt = `
      Analyze this energy bill image (likely from Colombia). Extract the following data:
      1. Monthly Consumption in kWh (Consumo).
      2. Total Monthly Cost in COP (Total a Pagar / Costo).
      3. Energy Rate per kWh (Costo Unitario / Tarifa).
      4. Does it show significant peak consumption variations or reactive energy charges? (True/False).

      Return ONLY a JSON object with keys: consumption (number), cost (number), rate (number), hasPeaks (boolean).
      If a value is not found, use 0.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [imagePart, { text: prompt }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            consumption: { type: Type.NUMBER },
            cost: { type: Type.NUMBER },
            rate: { type: Type.NUMBER },
            hasPeaks: { type: Type.BOOLEAN },
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No data returned");
  } catch (error) {
    console.error("Bill Analysis Error:", error);
    return { consumption: 0, cost: 0, rate: 0, hasPeaks: false };
  }
};

export const chatWithEnergyCoach = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string
): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_COACH,
        temperature: 0.7,
      },
      history: history,
    });

    const result = await chat.sendMessage({ message });
    return result.text || "Lo siento, no pude procesar tu consulta en este momento.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Error de conexión con el Asistente Energético.";
  }
};

export const generateRecommendations = async (profile: UserProfile): Promise<Recommendation[]> => {
  try {
    // Simulated Provider Database for Ranking Logic
    const PROVIDER_CONTEXT = `
      Available Verified Providers in Cartagena Database:
      1. "SolarCaribe Pro" - Price: 4,200,000 COP/kWp. Specs: Tier 1 Panels.
      2. "EcoEnergy Cartagena" - Price: 4,500,000 COP/kWp. Specs: Includes Microinverters.
      3. "Ingeniería Sostenible SAS" - Price: 3,900,000 COP/kWp. Specs: Standard String Inverter.
    `;

    const prompt = `
      Act as an Energy Engineering Engine. 
      Calculate the required Solar PV system size (Capacity in KW) for a client in Cartagena based on:
      - Monthly Consumption: ${profile.monthlyConsumptionKWh} kWh
      - Assumed Solar Yield Cartagena: 130 kWh/month per 1 kWp installed.
      
      Then, map this system size to the 3 Available Providers below to create specific quotes.
      ${PROVIDER_CONTEXT}
      
      Rank the results by "Best Value" (mix of price and quality/confidence).
      
      Return a JSON array of 3 objects.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              providerName: { type: Type.STRING },
              technology: { type: Type.STRING },
              capacityKW: { type: Type.NUMBER },
              pricePerKW: { type: Type.NUMBER },
              estimatedGenerationMonthly: { type: Type.NUMBER },
              roiYears: { type: Type.NUMBER },
              upfrontCost: { type: Type.NUMBER },
              savingsMonthly: { type: Type.NUMBER },
              co2Offset: { type: Type.NUMBER },
              confidenceScore: { type: Type.NUMBER },
              hash: { type: Type.STRING },
            },
            required: ["id", "providerName", "technology", "capacityKW", "pricePerKW", "estimatedGenerationMonthly", "roiYears", "upfrontCost", "hash"],
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as Recommendation[];
    }
    return [];
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return [
      {
        id: "rec_1",
        providerName: "SolarCaribe Pro",
        technology: "Solar PV",
        capacityKW: 5,
        pricePerKW: 4200000,
        estimatedGenerationMonthly: 650,
        roiYears: 3.5,
        upfrontCost: 21000000,
        savingsMonthly: 600000,
        co2Offset: 2.1,
        confidenceScore: 95,
        hash: "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
      }
    ];
  }
};

export const sendToN8N = async (profile: UserProfile, recommendations: Recommendation[]) => {
  const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://primary.production.n8n.cloud/webhook/energy-quote';

  try {
    // We use fetch with 'no-cors' or handle CORS on N8N side. 
    // For this demo code, we assume standard fetch.
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: {
          name: profile.name,
          email: profile.email,
          type: profile.clientType,
          phone: "N/A"
        },
        project: {
          consumption: profile.monthlyConsumptionKWh,
          location: profile.neighborhood
        },
        offers: recommendations.map(r => ({
          provider: r.providerName,
          cost: r.upfrontCost,
          capacity: r.capacityKW
        }))
      })
    });
    console.log("Sent to N8N");
  } catch (e) {
    console.log("N8N Simulation: Data would be sent here.", e);
  }
}