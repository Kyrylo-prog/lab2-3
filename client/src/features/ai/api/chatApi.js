const N8N_CHAT_URL = import.meta.env.VITE_N8N_CHAT_URL || "";

const createOrGetSessionId = () => {
  const storageKey = "greencart_ai_session_id";
  const existing = localStorage.getItem(storageKey);
  if (existing) {
    return existing;
  }

  const value = `gc-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(storageKey, value);
  return value;
};

const mapN8nResponse = (payload) => {
  const output =
    (typeof payload?.reply === "string" && payload.reply) ||
    (typeof payload?.output === "string" && payload.output) ||
    "";
  const products =
    (Array.isArray(payload?.data?.products) && payload.data.products) ||
    (Array.isArray(payload?.products) && payload.products) ||
    [];

  return {
    success: payload?.success ?? true,
    action: payload?.action || "chat",
    reply: output || "No response from assistant.",
    data: {
      products,
    },
  };
};

const queryN8nChatApi = async (payload) => {
  const body = {
    chatInput: payload.message,
    sessionId: createOrGetSessionId(),
    locale: payload.locale || "uk",
    action: payload.action || "",
    dinnersCount: payload.dinnersCount || 3,
    budget: payload.budget || 500,
    dish: payload.dish || "",
  };

  const response = await fetch(N8N_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`n8n chat request failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  return mapN8nResponse(data);
};

export const queryAssistantApi = async (axios, payload) => {
  if (N8N_CHAT_URL) {
    return queryN8nChatApi(payload);
  }

  const { data } = await axios.post("/api/ai/query", payload);
  return data;
};
