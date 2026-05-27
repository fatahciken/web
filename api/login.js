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

        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username dan password harus diisi' 
            });
        }

        // Cookie-based auth - return token
        const token = btoa(`${username}:${Date.now()}`);
        
        return res.status(200).json({
            success: true,
            message: 'Login berhasil',
            user: { username },
            token: token
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error: ' + error.message
        });
    }
}
