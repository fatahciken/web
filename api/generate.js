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
        let { prompt, negativePrompt, size, jumlah, username } = req.body;

        if (!prompt || prompt.trim() === '') {
            return res.status(400).json({ success: false, message: 'Prompt tidak boleh kosong' });
        }

        // ============ STEP 1: NSFW FILTER VIA API TEXT ============
        const filterResult = await filterPrompt(prompt);
        
        if (filterResult.blocked) {
            return res.status(400).json({
                success: false,
                message: 'Prompt tidak diizinkan. ' + filterResult.reason,
                originalPrompt: prompt,
                filteredPrompt: filterResult.safePrompt
            });
        }
        
        // Gunakan prompt yang sudah aman
        prompt = filterResult.safePrompt || prompt;

        // ============ STEP 2: GENERATE IMAGE ============
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
                pricing: data.pricing || null,
                filtered: filterResult.modified || false
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

// ============ NSFW FILTER FUNCTION ============
async function filterPrompt(userPrompt) {
    try {
        const systemPrompt = `Kamu adalah filter konten NSFW untuk image generator. Tugasmu:
1. Deteksi apakah prompt mengandung unsur pornografi, ketelanjangan, atau konten dewasa.
2. HANYA izinkan bahasa Indonesia dan Inggris. Jika bahasa lain, tolak.
3. Jika prompt AMAN (tidak porno, tidak telanjang, tidak vulgar), KEMBALIKAN prompt asli TANPA MENGUBAH SATU KATA PUN. Format: "SAFE||[prompt asli]"
4. Jika prompt MENGANDUNG unsur porno/telanjang/vulgar, GANTI dengan prompt lucu yang aman. Format: "BLOCKED||[prompt pengganti yang lucu]"
5. Jika BUKAN bahasa Indonesia atau Inggris, tolak. Format: "BLOCKED||only Indonesian and English language allowed"

Contoh:
- Input: "buatkan gambar cewek telanjang" → Output: "BLOCKED||buatkan gambar kucing lucu pakai topi cowboy"
- Input: "buatin gambar anime girl cantik" → Output: "SAFE||buatin gambar anime girl cantik"
- Input: "生成裸体图像" → Output: "BLOCKED||only Indonesian and English language allowed"
- Input: "create beautiful landscape" → Output: "SAFE||create beautiful landscape"
- Input: "naked woman full body" → Output: "BLOCKED||cute puppy playing in garden"

Prompt user: "${userPrompt}"

Jawab HANYA dengan format yang diminta, tidak perlu penjelasan lain.`;

        const response = await fetch('https://api.appzoneai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'User-Agent': 'okhttp/4.12.0',
                'Accept': 'text/event-stream',
                'Accept-Encoding': 'gzip',
                'Content-Type': 'application/json',
                'cache-control': 'no-cache',
                'x-requested-with': 'XMLHttpRequest',
                'authorization': 'Bearer az-chatai-key',
                'x-app-version': '1.0.18',
                'x-user-id': '$RCAnonymousID:310d7c6f45774abd9f1220b80d58b462',
                'x-package-name': 'com.appzone.chatbotai',
                'x-platform-type': 'android',
                'x-language': 'id'
            },
            body: JSON.stringify({
                model: 'kimi-k2.6',
                stream: false,
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: systemPrompt
                            }
                        ]
                    }
                ],
                isSubscribed: true,
                web_search: false,
                reason: false,
                study_mode: false
            })
        });

        if (!response.ok) {
            // Jika API text gagal, izinkan prompt (fail open)
            return { blocked: false, safePrompt: userPrompt, modified: false };
        }

        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content || '';

        // Parse response
        if (aiResponse.startsWith('BLOCKED||')) {
            const safePrompt = aiResponse.replace('BLOCKED||', '').trim();
            return {
                blocked: true,
                safePrompt: safePrompt,
                reason: 'Prompt mengandung konten tidak diizinkan atau bahasa tidak didukung',
                modified: true
            };
        } else if (aiResponse.startsWith('SAFE||')) {
            const safePrompt = aiResponse.replace('SAFE||', '').trim();
            return {
                blocked: false,
                safePrompt: safePrompt,
                modified: safePrompt !== userPrompt
            };
        } else {
            // Fallback: cek keyword sederhana
            const blockedKeywords = ['naked', 'nude', 'telanjang', 'bugil', 'porn', 'sex', 'nsfw', 'vulgar', 'erotic'];
            const lowerPrompt = userPrompt.toLowerCase();
            const isBlocked = blockedKeywords.some(kw => lowerPrompt.includes(kw));
            
            if (isBlocked) {
                return {
                    blocked: true,
                    safePrompt: 'cute cat wearing sunglasses, funny, meme style',
                    reason: 'Prompt terdeteksi mengandung konten tidak diizinkan',
                    modified: true
                };
            }
            
            return { blocked: false, safePrompt: userPrompt, modified: false };
        }

    } catch (error) {
        // Jika API error, fallback ke filter sederhana
        const blockedKeywords = ['naked', 'nude', 'telanjang', 'bugil', 'porn', 'sex', 'nsfw', 'vulgar', 'erotic', 'porno', 'dewasa'];
        const lowerPrompt = userPrompt.toLowerCase();
        const isBlocked = blockedKeywords.some(kw => lowerPrompt.includes(kw));
        
        if (isBlocked) {
            return {
                blocked: true,
                safePrompt: 'funny meme image, cute animals, wholesome',
                reason: 'Konten tidak diizinkan',
                modified: true
            };
        }
        
        return { blocked: false, safePrompt: userPrompt, modified: false };
    }
}
