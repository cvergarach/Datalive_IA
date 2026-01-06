import express from 'express';
import bcrypt from 'bcrypt';

const router = express.Router();

// ENDPOINT TEMPORAL SOLO PARA DESARROLLO
// Eliminar después de configurar el usuario admin
router.post('/generate-hash', async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Password requerido' });
        }

        const hash = await bcrypt.hash(password, 10);

        res.json({
            password,
            hash,
            sql: `UPDATE users SET password_hash = '${hash}' WHERE email = 'admin@datalive.com';`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para verificar un hash
router.post('/verify-hash', async (req, res) => {
    try {
        const { password, hash } = req.body;

        if (!password || !hash) {
            return res.status(400).json({ error: 'Password y hash requeridos' });
        }

        const isValid = await bcrypt.compare(password, hash);

        res.json({
            password,
            hash,
            isValid
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
