export async function translateToIndonesian(text: string): Promise<string> {
  if (!text || text.trim() === "") return "";

  // Primary: Free Google Translate API (No API key required, supports up to 5000 chars)
  try {
    const encoded = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=${encoded}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data && data[0]) {
        const translatedSegments = data[0].map((segment: any) => segment[0]).join("");
        if (translatedSegments) {
          return translatedSegments;
        }
      }
    }
  } catch (error) {
    console.error("Google Translate free failed, falling back to MyMemory:", error);
  }

  // Fallback: MyMemory API (Supports up to 500 chars)
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

  // Translate all items in parallel using the primary function
  try {
    const results = await Promise.all(
      items.map(item => translateToIndonesian(item))
    );
    return results;
  } catch (error) {
    console.error("Batch translation failed:", error);
    return items;
  }
}