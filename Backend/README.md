# Backend
backend สำหรับ Thaifood recipes สร้างขึ้นโดยใช้ Flask และ Python ให้บริการ API สำหรับการยืนยันตัวตน การจัดการสูตรอาหาร การอัปโหลดรูปภาพ และการเชื่อมต่อกับบริการภายนอก เช่น YouTube และ Imgur โครงการนี้ใช้ PostgreSQL เป็นฐานข้อมูล Redis สำหรับการจัดการเซสชันและแคช และ Alembic สำหรับการย้ายฐานข้อมูล

## เทคโนโลยีที่ใช้
Backend นี้ใช้ไลบรารีและเครื่องมือต่อไปนี้:
- **alembic==1.13.2**: เครื่องมือสำหรับการย้ายฐานข้อมูล
- **Authlib==1.4.0**: ไลบรารีสำหรับการยืนยันตัวตน
- **Flask==3.1.0**: เฟรมเวิร์กเว็บ
- **Flask_Cors==4.0.0**: รองรับ CORS
- **Flask_Migrate==4.0.4**: การเชื่อมต่อ Flask กับ Alembic
- **flask_session==0.8.0**: การจัดการเซสชันฝั่งเซิร์ฟเวอร์
- **flask_sqlalchemy==3.1.1**: ORM สำหรับ Flask
- **imgurpython==1.1.7**: ไคลเอนต์ API ของ Imgur
- **python-dotenv==1.0.1**: การจัดการตัวแปรสภาพแวดล้อม
- **redis==5.2.1**: ไคลเอนต์ Redis สำหรับแคชและเซสชัน
- **Requests==2.32.3**: ไลบรารีสำหรับคำขอ HTTP
- **SQLAlchemy==2.0.35**: ชุดเครื่องมือ SQL และ ORM
- **psycopg2-binary**: อแดปเตอร์ PostgreSQL สำหรับ Python

## โครงสร้างโปรเจกต์
```
.
├── Makefile                # ไฟล์สำหรับการสร้างและทำงานอัตโนมัติ
├── README.md               # เอกสารของโปรเจกต์
├── app/                    # โฟลเดอร์หลักของแอปพลิเคชัน
│   ├── Dockerfile          # การกำหนดค่า Docker สำหรับแอป
│   ├── init.py         # การเริ่มต้นแอป
│   ├── extensions.py       # ส่วนขยายของ Flask (เช่น SQLAlchemy, Redis)
│   ├── models/             # โมเดลฐานข้อมูล
│   │   ├── models.py       # นิยามโมเดลพื้นฐาน
│   │   └── user.py         # โมเดลผู้ใช้
│   ├── routes/             # เส้นทาง API
│   │   ├── auth.py         # API การยืนยันตัวตน
│   │   ├── based_recipes.py# API สูตรอาหารพื้นฐาน
│   │   ├── gemini.py       # API ที่เกี่ยวข้องกับ Gemini
│   │   ├── imgur.py        # API การเชื่อมต่อ Imgur
│   │   ├── recipe.py       # API การจัดการสูตรอาหาร
│   │   ├── thaifood_recipes.json # ข้อมูลสูตรอาหารไทย
│   │   ├── users.py        # API การจัดการผู้ใช้
│   │   └── youtube.py      # API การเชื่อมต่อ YouTube
│   └── utils/              # ฟังก์ชันยูทิลิตี้
│       ├── decorators.py   # เดคคอเรเตอร์ที่กำหนดเอง (เช่น การยืนยันตัวตน)
│       └── redis_utils.py  # ฟังก์ชันยูทิลิตี้ Redis
├── app.py                  # จุดเริ่มต้นของแอปพลิเคชัน
├── config.py               # การตั้งค่าคอนฟิก
├── database.py             # การตั้งค่าการเชื่อมต่อฐานข้อมูล
├── docker-compose.yml      # การกำหนดค่า Docker Compose
├── entrypoint.sh           # สคริปต์เริ่มต้น Docker
├── migrations/             # การย้ายฐานข้อมูล (Alembic)
│   ├── alembic.ini         # การกำหนดค่า Alembic
│   ├── env.py              # สภาพแวดล้อมการย้ายข้อมูล
│   ├── script.py.mako      # เทมเพลตสคริปต์การย้ายข้อมูล
│   └── versions/           # ไฟล์เวอร์ชันการย้ายข้อมูล
└── requirements.txt        # ไฟล์รายการ dependency
```

## ⚙️ ข้อกำหนดเบื้องต้น
ตรวจสอบให้แน่ใจว่าคุณได้ติดตั้งโปรแกรมต่อไปนี้:
- [Python] (แนะนำ: v3.9 ขึ้นไป)


## 🚀 การติดตั้ง
โคลนโปรเจกต์และติดตั้ง Library ที่จำเป็น:

```sh
# โคลนโปรเจกต์
git clone <repository_url>
cd TF-new-not-MS ตามด้วย cd Backend

# ติดตั้ง library ทั้งหมดจาก requiredments.txt ผ่านคำสั่ง
pip install -r requirements.txt หรือ pip3 install -r requirements.txt ขึ้นอยู่กับ version ของ python และ pip ของผู้พัฒนา

```
<img width="448" alt="image" src="https://github.com/user-attachments/assets/c1a8742e-ff2b-4bee-a602-74fa280a59e0" />

## 🛠️ คำสั่งใช้งาน
สามารถใช้คำสั่งต่อไปนี้ในการรันโปรเจค Backend:

| คำสั่ง            | คำอธิบาย                                       |
|------------------|-----------------------------------------------|
| `python -m flask run –reload หรือ python3 -m flask run –reload`   | 🚧 เริ่มเซิร์ฟเวอร์สำหรับพัฒนา (พอร์ต 5000)      |


<img width="443" alt="image" src="https://github.com/user-attachments/assets/a3ca4f85-56ac-476a-baf9-d6137a374dae" />

## ⚙️ การตั้งค่า
- แอปพลิเคชันรันที่ `http://localhost:5000` ตามค่าเริ่มต้น
