# 🕌 نظام إدارة الحلقات التربوية – جامع الكوثر

## التقنيات
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Frontend**: HTML + CSS + Vanilla JS (بدون frameworks)

---

## 🚀 النشر على Render

### 1. قاعدة البيانات (PostgreSQL)
- اذهب إلى [render.com](https://render.com) → New → **PostgreSQL**
- اسمها مثلاً: `kawthar-db`
- انسخ **Internal Database URL**

### 2. Web Service
- New → **Web Service** → اربطه بـ GitHub repo
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

### 3. متغيرات البيئة (Environment Variables)
```
DATABASE_URL   = (الـ URL اللي نسخته من قاعدة البيانات)
JWT_SECRET     = (كلمة سر عشوائية طويلة)
NODE_ENV       = production
PORT           = 3000
```

---

## 👤 إنشاء أول حساب أدمن

بعد أول تشغيل، شغّل هذا الكود مرة واحدة لإنشاء الأدمن:

```bash
# في Render Shell أو محلياً:
node create-admin.js
```

أو عبر psql مباشرة:
```sql
INSERT INTO users (name, email, password, role)
VALUES (
  'المشرف العام',
  'admin@kawthar.com',
  '$2a$10$rQnR...', -- شغّل: node -e "const b=require('bcryptjs');console.log(b.hashSync('PASSWORD',10))"
  'admin'
);
```

---

## 📁 هيكل الملفات

```
summer-course/
├── server.js           # الخادم الرئيسي
├── db.js               # قاعدة البيانات والجداول
├── package.json
├── .env.example        # نسخه إلى .env
├── routes/
│   ├── auth.js         # تسجيل الدخول والمستخدمين
│   ├── groups.js       # الحلقات
│   ├── students.js     # الطلاب
│   ├── attendance.js   # الحضور
│   └── grades.js       # النقاط والملاحظات
└── public/
    ├── index.html      # صفحة الدخول
    ├── admin.html      # لوحة المشرف العام
    ├── teacher.html    # لوحة الأستاذ
    ├── parent.html     # لوحة ولي الأمر
    ├── style.css       # التصميم (لون جامع الكوثر)
    └── app.js          # دوال مشتركة
```

---

## 🔐 الصلاحيات

| الدور | الصلاحيات |
|-------|-----------|
| **أدمن** | إضافة/حذف كل شيء، إحصائيات كاملة، إدارة الحسابات |
| **أستاذ** | يرى طلابه فقط، يسجل حضور ونقاط وواجبات وملاحظات |
| **ولي أمر** | يرى أبناءه فقط (حضور، نقاط، ملاحظات) |

---

## 🎨 الهوية البصرية
- **الأخضر الداكن** `#0d2b1a` – من لافتة الجامع
- **الذهبي** `#c9a84c` – من النقوش والكتابة
- خط **Amiri** للعناوين، **Cairo** للنصوص
