const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function translateToIndonesian(text: string): Promise<string> {
  if (!text || text.trim() === "") return "";

  if (GEMINI_API_KEY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const prompt = `You are a professional translator. Translate the following English string into natural Indonesian. 
Ensure that any HTML tags, styles, classes, and special identifiers (like hashtags) are preserved EXACTLY. Only translate the human readable text content.
Do not add any explanations, markdown code blocks, or extra text. Return ONLY the translated string.

String to translate:
${text}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (result) {
          return result.trim();
        }
      }
    } catch (error) {
      console.error("Gemini translation failed, falling back:", error);
    }
  }

  // Fallback to MyMemory
  try {
    const encoded = encodeURIComponent(text);
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encoded}&langpair=en|id`,
    );
    const data = await response.json();
    if (data.responseStatus === 200) {
      return data.responseData.translatedText || text;
    }
    return text;
  } catch (error) {
    console.error("MyMemory translation failed:", error);
    return text;
  }
}

export async function translateArrayToIndonesian(
  items: string[],
): Promise<string[]> {
  if (!items || items.length === 0) return [];

  if (GEMINI_API_KEY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const prompt = `You are a professional translator. Translate the following list of English strings into natural Indonesian. 
Ensure that any HTML tags, styles, classes, and special identifiers are preserved EXACTLY. Only translate the human readable text content.
Do not add any explanations, markdown code blocks, or extra text. Return ONLY a valid JSON array of translated strings in the same order.

Strings to translate:
${JSON.stringify(items, null, 2)}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const textRes = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textRes) {
          const parsed = JSON.parse(textRes);
          if (Array.isArray(parsed) && parsed.length === items.length) {
            return parsed;
          }
        }
      }
    } catch (error) {
      console.error("Gemini batch translation failed, falling back:", error);
    }
  }

  // Fallback to MyMemory
  try {
    const joined = items.join(" || ");
    if (joined.length <= 500) {
      const translated = await translateToIndonesian(joined);
      return translated.split(" || ").map((s) => s.trim());
    }
    
    // Translate individually to avoid 403 length limits
    const results = await Promise.all(
      items.map(item => translateToIndonesian(item))
    );
    return results;
  } catch (error) {
    console.error("MyMemory batch translation failed:", error);
    return items;
  }
}