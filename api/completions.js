import { chatCompletion as ai1 } from "../lib/ai1.js";
import { chatCompletion as ai2 } from "../lib/ai2.js";

const MODEL_MAP = {
    "noderouter/deepseek-reasoner": ai1,
    "noderouter/claude-sonnet-4.5": ai1,
    "noderouter/gpt-5.5": ai1,
    "noderouter/qwen-3.6-plus": ai2,
    "noderouter/gemini-3-pro-preview": ai1
};

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { model, messages } = req.body || {};
    if (!model || !messages) {
        return res.status(400).json({ error: "model and messages required" });
    }

    const handler = MODEL_MAP[model];
    if (!handler) {
        return res.status(404).json({ error: `Unknown model: ${model}` });
    }

    try {
        const content = await handler(messages);
        return res.json({ content });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}