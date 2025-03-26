# 🍛 Thaifood Recipes

## 📝 ภาพรวม
`Thaifood Recipes` เป็นแอปพลิเคชันที่พัฒนาด้วย Next.js สำหรับ frontend และใช้ Flask สำหรับ backend 🖥️ โดยรองรับ Material-UI, Tailwind CSS และไลบรารีสมัยใหม่อื่น ๆ เพื่อมอบประสบการณ์การใช้งานที่ดี รองรับระบบยืนยันตัวตน 🔐 การเรียก API 🌐 และการค้นหาข้อมูลที่มีประสิทธิภาพผ่าน Fuse.js 🔍

## ⚙️ ข้อกำหนดเบื้องต้น
ตรวจสอบให้แน่ใจว่าคุณได้ติดตั้งโปรแกรมต่อไปนี้:
- [Node.js](https://nodejs.org/) (แนะนำ: v18 ขึ้นไป)
- [npm](https://www.npmjs.com/) หรือ [yarn](https://yarnpkg.com/)

## 🚀 การติดตั้ง
โคลนโปรเจกต์และติดตั้ง dependencies:

```sh
# โคลนโปรเจกต์
git clone <repository_url>
cd TF-new-not-MS ตามด้วย cd tf_frontend


# ติดตั้ง dependencies ผ่านคำสั่ง
npm install หรือ npm -i
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
npm run dev  
```

## ⚙️ การตั้งค่า
- แอปพลิเคชันรันที่ `http://localhost:3000` ตามค่าเริ่มต้น


## 📁 โครงสร้าง Front-end
```
tf_frontend/
├── Dockerfile
├── README.md
├── bun.lockb
├── ecosystem.config.js
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   └── window.svg
├── src
│   ├── app
│   │   ├── ClientLayout.tsx
│   │   ├── GuestDashboard
│   │   │   ├── GuestDashboard.jsx
│   │   │   └── layout.js
│   │   ├── _error.js
│   │   ├── callbackGoogleAuth
│   │   │   └── page.tsx
│   │   ├── dashboard
│   │   │   └── page.jsx
│   │   ├── favicon.ico
│   │   ├── food_generated
│   │   │   └── page.jsx
│   │   ├── foodedit
│   │   │   └── page.jsx
│   │   ├── foodview
│   │   │   ├── available
│   │   │   │   └── page.jsx
│   │   │   ├── guests
│   │   │   │   └── [id]
│   │   │   │       └── page.jsx
│   │   │   ├── tags
│   │   │   │   └── [tag]
│   │   │   │       └── page.jsx
│   │   │   └── users
│   │   │       └── [id]
│   │   │           └── page.jsx
│   │   ├── generateai
│   │   │   └── page.jsx
│   │   ├── globals.css
│   │   ├── layout.js
│   │   ├── layout.tsx
│   │   ├── login
│   │   │   ├── gg.png
│   │   │   └── page.jsx
│   │   ├── not-found.js
│   │   ├── page.tsx
│   │   ├── testApiGateway
│   │   │   └── page.tsx
│   │   └── users
│   │       └── [id]
│   │           └── profile
│   │               └── page.jsx
│   ├── components
│   │   ├── Layout.jsx
│   │   └── Navbar.jsx
│   └── context
│       └── UserContext.jsx
├── tailwind.config.ts
├── tsconfig.json
└── types
    └── next-auth.d.ts

```

## 📌 แนวทางการพัฒนา
- 🎨 ใช้ Material-UI และ Tailwind CSS เพื่อความสม่ำเสมอของดีไซน์


## 🚀 การรับบน Production แนะนำให้รันสำหรับใช้งานจริง เพื่อการ load หน้าที่เร็วกว่า
สำหรับใช้งานจริง:
```sh
npm run build
npm run start
```


## 📜 License
โปรเจกต์นี้อยู่ภายใต้ [MIT License](LICENSE).

