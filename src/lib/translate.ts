export async function translateToIndonesian(text: string): Promise<string> {
  if (!text || text.trim() === "") return "";

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
    console.error("Translation failed:", error);
    return text;
  }
}
export async function translateArrayToIndonesian(
  items: string[],
): Promise<string[]> {
  if (!items || items.length === 0) return [];

  // Gabung semua tag dengan separator unik, translate sekaligus, lalu pisah lagi
  const joined = items.join(" || ");
  const translated = await translateToIndonesian(joined);

  return translated.split(" || ").map((s) => s.trim());
}