// API key management — stored in localStorage, never in source
export const getApiKey = () => localStorage.getItem('btm_gemini_api_key') || '';
export const setApiKey = (key) => localStorage.setItem('btm_gemini_api_key', key);
export const hasApiKey = () => !!getApiKey();

export const generateGeminiResponse = async (prompt, systemInstruction, attachments = []) => {
  const apiKey = getApiKey();
  if (!apiKey) return "⚠️ No API key set. Go to Settings (⚙️) to enter your Gemini API key.";
  
  const parts = [{ text: prompt }];
  
  if (attachments && attachments.length > 0) {
    attachments.forEach(file => {
      const base64Data = file.data.split(',')[1]; 
      parts.push({ inlineData: { mimeType: file.type, data: base64Data } });
    });
  }
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: parts }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          tools: [{ google_search: {} }]
        }),
      }
    );
    
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `API failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
  } catch (error) {
    console.error("Text Gen Error:", error);
    return `LLM error: ${error.message}`;
  }
};

export const generateImagenImage = async (prompt) => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt: prompt }],
          parameters: { sampleCount: 1, aspectRatio: "16:9" } 
        }),
      }
    );
    
    if (!response.ok) throw new Error(`Image API failed: ${response.statusText}`);
    
    const result = await response.json();
    const base64 = result.predictions?.[0]?.bytesBase64Encoded;
    return base64 ? `data:image/png;base64,${base64}` : null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};
