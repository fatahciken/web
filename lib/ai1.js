const API = "https://lkpmzvrveyocaodaixss.supabase.co/functions/v1/chat-proxy";
const JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrcG16dnJ2ZXlvY2FvZGFpeHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MjIyMjAsImV4cCI6MjA3MzE5ODIyMH0.3JYpifirgKd_UjMz5oAgVDa8Q1YiPxr2ONmbheFTnZQ";

const UPSTREAM_MAP = {
    "deepseek-reasoner": "deepseek-reasoner",
    "claude-sonnet-4.5": "claude-sonnet-4-20250514",
    "gpt-5.5": "gpt-5.5",
    "gemini-3-pro-preview": "gemini-3-pro-preview"
};

export async function chatCompletion(messages, model) {
    const cleanModel = model.replace("noderouter/", "");
    const upstreamModel = UPSTREAM_MAP[cleanModel] || cleanModel;

    const payload = {
        messages,
        tools: [],
        capabilities: { supportsImages: true, supportsAudio: false, supportsVideo: false },
        webSearchConfig: { recencyDays: 30 },
        model: upstreamModel
    };

    const headers = {
        "User-Agent": "okhttp/4.12.0",
        "Accept-Encoding": "gzip",
        "Content-Type": "application/json",
        "x-client-id": "d74b4747-c3d0-49cb-a9c9-9809445a916a",
        "x-app-version": "1.0.0",
        "authorization": `Bearer ${JWT}`
    };

    const response = await fetch(API, { method: "POST", headers, body: JSON.stringify(payload) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const text = await response.text();
    const lines = text.split("\n");
    let fullText = "";

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const data = trimmed.slice(6);
        if (data === "[DONE]") break;
        try {
            const parsed = JSON.parse(data);
            if (parsed.type === "token" && parsed.delta) {
                let token = parsed.delta;
                try { token = JSON.parse(token); } catch (e) {}
                if (typeof token === "string") fullText += token;
            }
        } catch (e) {}
    }

    return fullText;
}