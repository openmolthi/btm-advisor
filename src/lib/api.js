// Proxy configuration — API key lives server-side on Cloudflare Worker
const PROXY_URL = 'https://btm-advisor-proxy.openmolthi.workers.dev';
const GEMINI_TEXT_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const GEMINI_IMAGE_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict';

// Token management — stored in localStorage, never the actual API key
export const getApiKey = () => localStorage.getItem('btm_proxy_token') || '';
export const setApiKey = (key) => localStorage.setItem('btm_proxy_token', key);
export const hasApiKey = () => !!getApiKey();

const proxyFetch = async (geminiEndpoint, payload) => {
  const token = getApiKey();
  if (!token) throw new Error('No access token set. Go to Settings (⚙️) to enter your access token.');

  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ endpoint: geminiEndpoint, payload }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API failed: ${response.statusText}`);
  }

  return response.json();
};

export const generateGeminiResponse = async (prompt, systemInstruction, attachments = []) => {
  const token = getApiKey();
  if (!token) return "⚠️ No access token set. Go to Settings (⚙️) to enter your access token.";
  
  const parts = [{ text: prompt }];
  
  if (attachments && attachments.length > 0) {
    attachments.forEach(file => {
      const base64Data = file.data.split(',')[1]; 
      parts.push({ inlineData: { mimeType: file.type, data: base64Data } });
    });
  }
  
  try {
    const result = await proxyFetch(GEMINI_TEXT_ENDPOINT, {
      contents: [{ parts }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      tools: [{ google_search: {} }],
    });
    return result.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
  } catch (error) {
    console.error("Text Gen Error:", error);
    return `LLM error: ${error.message}`;
  }
};

export const generateImagenImage = async (prompt) => {
  const token = getApiKey();
  if (!token) return null;
  
  try {
    const result = await proxyFetch(GEMINI_IMAGE_ENDPOINT, {
      instances: [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio: "16:9" },
    });
    const base64 = result.predictions?.[0]?.bytesBase64Encoded;
    return base64 ? `data:image/png;base64,${base64}` : null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};
