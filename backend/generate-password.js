const bcrypt = require('bcrypt');

const password = 'admin123';

bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('Error:', err);
        process.exit(1);
    }

    console.log('\n===========================================');
    console.log('CREDENCIALES DE ADMINISTRADOR');
    console.log('===========================================');
    console.log('Email:    admin@datalive.com');
    console.log('Password: ' + password);
    console.log('Hash:     ' + hash);
    console.log('===========================================\n');
    console.log('SQL para actualizar en Supabase:');
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'admin@datalive.com';`);
    console.log('===========================================\n');
});
