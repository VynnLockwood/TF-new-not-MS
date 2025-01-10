import json
from pymongo import MongoClient

# อ่านไฟล์ JSON
with open('./thaifood_recipes.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# เชื่อมต่อกับ MongoDB
client = MongoClient("mongodb://localhost:27017/")  # แก้ไข URL ให้ตรงกับเซิร์ฟเวอร์ของคุณ
db = client['recipe_database']  # ชื่อฐานข้อมูล
collection = db['recipes']  # ชื่อคอลเลกชัน

# เพิ่มข้อมูลลงใน MongoDB
collection.insert_many(data['recipes'])

print("ข้อมูลถูกอัปโหลดเรียบร้อยแล้ว!")
