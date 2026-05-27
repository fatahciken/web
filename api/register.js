export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const { prompt, negativePrompt, size, jumlah, username } = req.body;

        if (!prompt || prompt.trim() === '') {
            return res.status(400).json({ success: false, message: 'Prompt tidak boleh kosong' });
        }

        const deviceId = 'a19b0923-75c9-48f7-a4b2-c599f54bd30c';
        const jobId = '5840583d-8c1d-40b7-ba7b-9dd67c3ac26b';
        const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrcG16dnJ2ZXlvY2FvZGFpeHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MjIyMjAsImV4cCI6MjA3MzE5ODIyMH0.3JYpifirgKd_UjMz5oAgVDa8Q1YiPxr2ONmbheFTnZQ';

        const response = await fetch('https://lkpmzvrveyocaodaixss.supabase.co/functions/v1/images-runware', {
            method: 'POST',
            headers: {
                'User-Agent': 'okhttp/4.12.0',
                'Accept-Encoding': 'gzip',
                'Content-Type': 'application/json',
                'x-device-id': deviceId,
                'x-client-id': deviceId,
                'authorization': `Bearer ${authToken}`,
                'apikey': authToken,
                'Cookie': '__cf_bm=0s0_krnRS3ncATWZJpCWFpiSi7fvzDE7WN_GQCFPwiw-1779870381.2619488-1.0.1.1-WJkwdeKbfPO54SqO.as18X3zte2gsEqVcRmJ9em6tE0NwuNTw2mTXLKAAQDeDqwncAL_nwIYQA3Gw_z7La5Jk_qbmeyvtRpFVlbwc1kmOOi973VSJU96x0Kc6MkepKl5'
            },
            body: JSON.stringify({
                prompt: prompt.trim(),
                model: 'runware-flux-schnell',
                size: size || '1440x720',
                negativePrompt: negativePrompt || '',
                n: Math.min(Math.max(parseInt(jumlah) || 1, 1), 4),
                mode: 'text2img',
                strength: 1,
                outputType: 'URL',
                outputFormat: 'JPG',
                outputQuality: 95,
                includeCost: false,
                deviceId: deviceId,
                jobId: jobId
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'done' && data.images && data.images.length > 0) {
            return res.status(200).json({
                success: true,
                images: data.images.map(img => ({
                    id: img.id || '',
                    url: img.url || '',
                    index: img.index || 0
                })),
                pricing: data.pricing || null
            });
        } else {
            return res.status(400).json({
                success: false,
                message: data.message || 'Gagal generate gambar'
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error: ' + error.message
        });
    }
}
