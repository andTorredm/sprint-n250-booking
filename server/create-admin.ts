import bcrypt from 'bcryptjs';
import { dbRun, dbGet, initializeDatabase } from './db.js';

const args = process.argv.slice(2);

if (args.length < 4) {
    console.log('Usage: npm run create-admin <email> <password> <firstName> <lastName>');
    console.log('Example: npm run create-admin admin@example.com password123 Mario Rossi');
    process.exit(1);
}

const [email, password, firstName, lastName] = args;

async function createAdmin() {
    try {
        await initializeDatabase();

        const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);

        if (existingUser) {
            console.error(`❌ User with email ${email} already exists`);
            process.exit(1);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await dbRun(
            'INSERT INTO users (email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, firstName, lastName, 'ADMIN']
        );

        console.log('✅ Admin user created successfully!');
        console.log(`   Email: ${email}`);
        console.log(`   Name: ${firstName} ${lastName}`);
        console.log(`   Role: ADMIN`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
}

createAdmin();
