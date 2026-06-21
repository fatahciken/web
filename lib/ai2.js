const API_URL = "https://api.appzoneai.com/v1/chat/completions";

export async function chatCompletion(messages) {
    const formattedMessages = messages.map(m => ({
        role: m.role,
        content: Array.isArray(m.content) ? m.content : [{ type: "text", text: m.content }]
    }));

    const payload = {
        model: "qwen-3.6-plus",
        stream: true,
        messages: formattedMessages,
        isSubscribed: false,
        web_search: false,
        reason: false,
        study_mode: false
    };

    const headers = {
        "User-Agent": "okhttp/4.12.0",
        "Accept": "text/event-stream",
        "Accept-Encoding": "gzip",
        "Content-Type": "application/json",
        "cache-control": "no-cache",
        "x-requested-with": "XMLHttpRequest",
        "authorization": "Bearer az-chatai-key",
        "x-app-version": "1.0.18",
        "x-user-id": "$RCAnonymousID:310d7c6f45774abd9f1220b80d58b462",
        "x-package-name": "com.appzone.chatbotai",
        "x-platform-type": "android",
        "x-language": "id"
    };

    const response = await fetch(API_URL, { method: "POST", headers, body: JSON.stringify(payload) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const text = await response.text();
    const lines = text.split("\n");
    let fullContent = "";

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(":")) continue;
        if (trimmed.startsWith("data: ")) {
            const jsonStr = trimmed.slice(6);
            if (jsonStr === "[DONE]") break;
            try {
                const data = JSON.parse(jsonStr);
                const choices = data.choices || [];
                if (choices.length > 0) {
                    fullContent += choices[0].delta?.content || "";
                }
            } catch (e) {}
        }
    }

    return fullContent;
}