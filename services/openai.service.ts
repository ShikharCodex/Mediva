import OpenAI from "openai";
import { DISCLAIMER } from "@/config/constants";
import { getEnv } from "@/lib/env";

export async function generateMedicalExplanation(
  imageUrl: string,
  reportType: string,
  language: string = "English"
) {
  const env = getEnv();
  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  
  const systemPrompt = `You are Mediva AI, a healthcare explanation assistant.
Your role is to explain uploaded medical text in simple, safe language.
Generate your response ENTIRELY IN ${language.toUpperCase()}.

Hard safety constraints:
- Never provide medical diagnosis.
- Never prescribe medicine or treatment plans.
- Never claim certainty.
- Never encourage self-medication.
- Always use cautious phrasing like "may indicate", "commonly used for".
- Always encourage consultation with a qualified doctor.
- Always include this exact sentence at the end (translated to ${language}):
"${DISCLAIMER}"

Output format:
You MUST return a valid JSON object exactly matching this structure, with all values in ${language}. Use markdown inside the values for formatting.
{
  "explanation": "Simple explanation of the document",
  "findings": "Key findings",
  "cautions": "Possible cautions",
  "consult": "When to consult a doctor",
  "disclaimer": "The disclaimer"
}`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    max_tokens: 1500,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Report type: ${reportType}\nPlease read and analyze this medical document/image. Output the JSON response with values in ${language}.`,
          },
          {
            type: "image_url",
            image_url: { url: imageUrl },
          },
        ],
      },
    ],
  });
  
  let rawResponse = completion.choices[0]?.message?.content?.trim();
  if (!rawResponse) {
    rawResponse = JSON.stringify({
      explanation: "Could not generate explanation.",
      findings: "", cautions: "", consult: "", disclaimer: DISCLAIMER
    });
  }
  
  let parsed;
  try {
    parsed = JSON.parse(rawResponse);
  } catch (e) {
    parsed = { explanation: rawResponse, findings: "", cautions: "", consult: "", disclaimer: DISCLAIMER };
  }

  // Save the structured JSON string so the frontend can parse it perfectly
  const aiResponse = JSON.stringify(parsed);
  const aiSummary = (parsed.explanation || "").slice(0, 280) + "...";
  
  return { aiResponse, aiSummary, extractedText: "Extracted via Vision AI" };
}
