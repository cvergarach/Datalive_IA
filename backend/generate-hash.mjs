import bcrypt from 'bcrypt';

const password = 'admin';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('Error:', err);
        process.exit(1);
    }

    console.log('\n' + '='.repeat(80));
    console.log('HASH GENERADO CORRECTAMENTE');
    console.log('='.repeat(80));
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('='.repeat(80));
    console.log('\nSQL para Supabase:');
    console.log('='.repeat(80));
    console.log(`DELETE FROM users WHERE email = 'admin@datalive.com';`);
    console.log(`INSERT INTO users (email, password_hash, full_name, role, is_active)`);
    console.log(`VALUES ('admin@datalive.com', '${hash}', 'Administrador', 'admin', true);`);
    console.log('='.repeat(80) + '\n');

    process.exit(0);
});
