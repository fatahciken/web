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
        const { username, password } = req.body;

        if (!username || !password || username.length < 3 || password.length < 4) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username min 3 karakter, password min 4 karakter' 
            });
        }

        // Simulasi database pakai cookie (bisa diganti Supabase nanti)
        // Untuk sekarang return sukses, data disimpan di localStorage client
        return res.status(200).json({
            success: true,
            message: 'Registrasi berhasil',
            user: { username }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error: ' + error.message
        });
    }
}
