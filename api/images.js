import { imageGeneration } from "../lib/image.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { model, prompt } = req.body || {};
    if (model !== "noderouter/flux-schnell" || !prompt) {
        return res.status(400).json({ error: "model must be noderouter/flux-schnell and prompt required" });
    }

    try {
        const imageUrl = await imageGeneration(prompt);
        return res.json({ image_url: imageUrl });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}