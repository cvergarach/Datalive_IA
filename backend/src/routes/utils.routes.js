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

// ENDPOINT TEMPORAL: Resetear contraseña del admin
router.post('/reset-admin', async (req, res) => {
    try {
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ error: 'newPassword requerido' });
        }

        const { createClient } = await import('@supabase/supabase-js');
        const bcryptModule = await import('bcrypt');

        const hash = await bcryptModule.default.hash(newPassword, 10);

        // Actualizar directamente en Supabase
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

        const { data, error } = await supabase
            .from('users')
            .update({ password_hash: hash })
            .eq('email', 'admin@datalive.com')
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json({
            message: 'Contraseña actualizada exitosamente',
            newPassword,
            hash,
            user: {
                id: data.id,
                email: data.email
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
