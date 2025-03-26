# 🍛 Thaifood Recipes

## 📝 ภาพรวม
`Thaifood Recipes` เป็นแอปพลิเคชันที่พัฒนาด้วย Next.js สำหรับ frontend และใช้ Node.js กับ Express.js สำหรับ backend 🖥️ โดยรองรับ Material-UI, Tailwind CSS และไลบรารีสมัยใหม่อื่น ๆ เพื่อมอบประสบการณ์การใช้งานที่ดี รองรับระบบยืนยันตัวตน 🔐 การเรียก API 🌐 และการค้นหาข้อมูลที่มีประสิทธิภาพผ่าน Fuse.js 🔍

## ⚙️ ข้อกำหนดเบื้องต้น
ตรวจสอบให้แน่ใจว่าคุณได้ติดตั้งโปรแกรมต่อไปนี้:
- [Node.js](https://nodejs.org/) (แนะนำ: v18 ขึ้นไป)
- [npm](https://www.npmjs.com/) หรือ [yarn](https://yarnpkg.com/)

## 🚀 การติดตั้ง
โคลนโปรเจกต์และติดตั้ง dependencies:

```sh
# โคลนโปรเจกต์
git clone <repository_url>
cd thaifood-recipes

# ติดตั้ง dependencies
npm install  # หรือ yarn install
```

## 🛠️ คำสั่งใช้งาน
สามารถใช้คำสั่งต่อไปนี้จาก `package.json`:

| คำสั่ง            | คำอธิบาย                                       |
|------------------|-----------------------------------------------|
| `npm run dev`   | 🚧 เริ่มเซิร์ฟเวอร์สำหรับพัฒนา (พอร์ต 3000)      |
| `npm run build` | 🏗️ สร้างแอปพลิเคชันสำหรับใช้งานจริง              |
| `npm run start` | 🚀 เริ่มเซิร์ฟเวอร์สำหรับใช้งานจริง               |
| `npm run lint`  | 🔍 ตรวจสอบคุณภาพโค้ดด้วย ESLint                  |

การเริ่มต้นเซิร์ฟเวอร์สำหรับพัฒนา:

```sh
npm run dev  # หรือ yarn dev
```

## ⚙️ การตั้งค่า
- แอปพลิเคชันรันที่ `http://localhost:3000` ตามค่าเริ่มต้น
- Backend รันที่ `http://localhost:5000` 📡
- ระบบยืนยันตัวตนใช้ `next-auth` 🔐
- การเรียก API ใช้ `axios` 📡
- ระบบค้นหาข้อมูลใช้ `fuse.js` 🔍
- ระบบแคชข้อมูลใช้ Redis ผ่าน `ioredis` 🗄️

## 🏗️ Backend
Backend ของ `Thaifood Recipes` ใช้ **Node.js** และ **Express.js**

### 📦 Dependencies
- **Express.js** (`express`) - 🚀 เฟรมเวิร์กสำหรับสร้าง API
- **MongoDB** (`mongoose`) - 🍃 ฐานข้อมูล NoSQL สำหรับจัดเก็บข้อมูลสูตรอาหาร
- **JWT** (`jsonwebtoken`) - 🔑 ใช้สำหรับระบบยืนยันตัวตน
- **bcryptjs** (`bcryptjs`) - 🔐 ใช้เข้ารหัสรหัสผ่าน
- **CORS** (`cors`) - 🌍 รองรับการเรียก API จาก frontend
- **Dotenv** (`dotenv`) - ⚙️ จัดการตัวแปรสภาพแวดล้อม

### 🚀 การเริ่มต้น Backend
```sh
cd backend
npm install  # ติดตั้ง dependencies
npm run dev  # เริ่มเซิร์ฟเวอร์ที่พอร์ต 5000
```

## 📁 โครงสร้างโฟลเดอร์
```
thaifood-recipes/
├── backend/         # 🖥️ โค้ด backend (Node.js + Express)
│   ├── models/      # 📄 โมเดลฐานข้อมูล
│   ├── routes/      # 🚏 เส้นทาง API
│   ├── controllers/ # 🛠️ ฟังก์ชันประมวลผล API
│   ├── config/      # ⚙️ การตั้งค่าต่าง ๆ
│   ├── server.js    # 🚀 จุดเริ่มต้นของ backend
│   ├── .env        # 🔑 ตัวแปรสภาพแวดล้อม
│
├── frontend/        # 🎨 โค้ด frontend (Next.js)
│   ├── pages/       # 📄 ไฟล์เพจของ Next.js
│   ├── components/  # 🧩 คอมโพเนนต์ที่ใช้ซ้ำได้
│   ├── styles/      # 🎨 ไฟล์สไตล์
│   ├── utils/       # 🔧 ฟังก์ชันช่วยเหลือต่าง ๆ
│
├── public/          # 🌍 ไฟล์และรูปภาพสาธารณะ
├── .eslintrc.js     # ✅ การตั้งค่า ESLint
├── tailwind.config.js # 🎨 การตั้งค่า Tailwind CSS
└── next.config.js   # ⚙️ การตั้งค่า Next.js
```

## 📌 แนวทางการพัฒนา
- ✅ ปฏิบัติตามกฎของ ESLint (`npm run lint`) เพื่อรักษาคุณภาพของโค้ด
- 🏗️ ใช้ TypeScript เพื่อเพิ่มความปลอดภัยของโค้ด
- 🎨 ใช้ Material-UI และ Tailwind CSS เพื่อความสม่ำเสมอของดีไซน์
- 🔍 การเรียก API ควรใช้ Axios พร้อมการจัดการข้อผิดพลาดที่เหมาะสม

## 🚀 การ Deploy
สำหรับใช้งานจริง:
```sh
npm run build
npm run start
```

การ Deploy บน Vercel:
1. ติดตั้ง Vercel CLI: `npm install -g vercel`
2. รันคำสั่ง `vercel` และทำตามคำแนะนำ

## 📜 License
โปรเจกต์นี้อยู่ภายใต้ [MIT License](LICENSE).

