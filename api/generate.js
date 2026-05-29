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

        // ============ STEP 1: NSFW FILTER (ENHANCED) ============
        const filterResult = await filterPromptEnhanced(prompt);
        
        if (filterResult.blocked) {
            return res.status(400).json({
                success: false,
                message: 'Prompt mengandung konten tidak diizinkan. Mohon gunakan prompt yang aman dan sesuai.',
                reason: filterResult.reason
            });
        }
        
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

// ============ ENHANCED NSFW FILTER ============
async function filterPromptEnhanced(userPrompt) {
    try {
        const systemPrompt = `Kamu adalah filter konten STRICT untuk image generator AI. Tugasmu mendeteksi dan MEMBLOKIR SEMUA konten dewasa/pornografi/seksual.

ATURAN KETAT:
1. BLOKIR jika prompt mengandung: ketelanjangan, aktivitas seksual, pornografi, fetish, konten vulgar, deskripsi area sensitif tubuh, posisi seksual, atau bahasa tidak senonoh
2. BLOKIR jika prompt meminta gambar anak di bawah umur (dibawah 18 tahun) dalam konteks apapun
3. BLOKIR jika prompt mengandung bahasa selain Indonesia dan Inggris
4. BLOKIR jika prompt mengandung kata-kata yang mengarah ke konten dewasa meskipun disamarkan
5. BLOKIR jika prompt mendeskripsikan pose atau posisi yang mengarah ke aktivitas seksual
6. BLOKIR jika prompt menyebutkan ukuran atau detail tubuh yang mengarah ke seksualisasi
7. HANYA IZINKAN prompt yang benar-benar aman, sopan, dan tidak mengandung unsur seksual sama sekali

Format jawaban:
- Jika AMAN: "SAFE||[prompt asli tanpa perubahan]"
- Jika DIBLOKIR: "BLOCKED||konten tidak diizinkan"

Prompt: "${userPrompt}"

Jawab HANYA dengan format di atas.`;

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
            return keywordFilter(userPrompt);
        }

        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content || '';

        if (aiResponse.startsWith('BLOCKED||')) {
            return {
                blocked: true,
                safePrompt: null,
                reason: 'Prompt mengandung konten tidak diizinkan'
            };
        } else if (aiResponse.startsWith('SAFE||')) {
            return {
                blocked: false,
                safePrompt: aiResponse.replace('SAFE||', '').trim()
            };
        } else {
            return keywordFilter(userPrompt);
        }

    } catch (error) {
        return keywordFilter(userPrompt);
    }
}

// ============ KEYWORD FILTER (FALLBACK) ============
function keywordFilter(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    // Blocked keywords - diperluas
    const blockedPatterns = [
        // Bahasa Indonesia - seksual
        'telanjang', 'bugil', 'porno', 'seks', 'sex', 'ngentot', 'memek', 'kontol', 'jembut',
        'tete', 'toket', 'buah dada', 'puting', 'pantat', 'bokong', 'dubur', 'anus',
        'penis', 'vagina', 'kelamin', 'alat vital', 'kemaluan', 'persetubuhan', 'bersetubuh',
        'ranjang', 'kasur bercinta', 'birahi', 'nafsu', 'erotis', 'vulgar', 'mesum',
        'pelecehan', 'cabul', 'asusila', 'sange', 'colmek', 'coli',
        
        // Bahasa Inggris - seksual
        'naked', 'nude', 'nudity', 'porn', 'nsfw', 'explicit', 'erotic', 'vulgar',
        'breast', 'boobs', 'nipple', 'pussy', 'dick', 'cock', 'ass', 'butt',
        'penis', 'vagina', 'genital', 'intercourse', 'masturbat', 'orgasm', 'fetish',
        'bondage', 'bdsm', 'hentai', 'ecchi', 'lewd', 'stripping',
        
        // Bahasa lain - seksual
        '裸体', '色情', '性交', '淫', '裸', '脫', '露', '陰', '陽',
        '乳首', '胸', '尻', 'セックス', 'エロ', 'ヘンタイ',
        
        // Usia + konteks mencurigakan
        'anak', 'child', 'underage', 'minor', '15 tahun', '16 tahun', '17 tahun',
        '14 tahun', '13 tahun', '12 tahun', '11 tahun', '10 tahun',
        
        // Pose/posisi seksual
        'berbaring', 'telentang', 'menungging', 'merangkak',
        
        // Kata mencurigakan lainnya
        'area', 'selangkangan', 'paha dalam', 'dada', 'tubuh ideal',
        'body goal', 'seksi', 'hot', 'menggoda', 'provokatif'
    ];
    
    const isBlocked = blockedPatterns.some(kw => lowerPrompt.includes(kw));
    
    if (isBlocked) {
        return {
            blocked: true,
            safePrompt: null,
            reason: 'Prompt terdeteksi mengandung konten tidak diizinkan'
        };
    }
    
    // Language check
    const hasNonLatin = /[^\x00-\x7F\u00C0-\u024F\u1E00-\u1EFF\u2000-\u206F\u20A0-\u20CF]/.test(prompt);
    const hasOnlyID_EN = /^[a-zA-Z0-9\s\.,!?@#$%^&*()_+\-=\[\]{}|;:'"<>/~`\u00C0-\u024F\u1E00-\u1EFF]+$/.test(prompt);
    
    if (hasNonLatin && !hasOnlyID_EN) {
        return {
            blocked: true,
            safePrompt: null,
            reason: 'Hanya bahasa Indonesia dan Inggris yang diizinkan'
        };
    }
    
    return {
        blocked: false,
        safePrompt: prompt
    };
}
