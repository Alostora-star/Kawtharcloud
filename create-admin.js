// سكريبت إنشاء أول حساب أدمن
// شغّله مرة واحدة: node create-admin.js

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool, initDB } = require('./db');

async function createAdmin() {
  await initDB();
  
  const name     = 'المشرف العام';
  const email    = 'admin@kawthar.com';
  const password = 'admin123'; // ← غيّر هذا قبل النشر!
  const role     = 'admin';

  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET password = $3
       RETURNING id, name, email, role`,
      [name, email, hashed, role]
    );
    console.log('✅ تم إنشاء حساب الأدمن:');
    console.log('   البريد:', email);
    console.log('   كلمة المرور:', password);
    console.log('   ⚠️  غيّر كلمة المرور بعد أول دخول!');
  } catch(err) {
    console.error('❌ خطأ:', err.message);
  } finally {
    process.exit(0);
  }
}

createAdmin();
