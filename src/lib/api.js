export const generateGeminiResponse = async (prompt, systemInstruction, attachments = []) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; 
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
    
    if (!response.ok) throw new Error(`Text API failed: ${response.statusText}`);
    
    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
  } catch (error) {
    console.error("Text Gen Error:", error);
    return "Error generating content. Please try again. Ensure API Key is set.";
  }
};

export const generateImagenImage = async (prompt) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
  
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
