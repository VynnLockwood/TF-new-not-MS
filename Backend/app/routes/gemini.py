from flask import Blueprint, request, jsonify
from app.utils.decorators import validate_session
import requests
import os
import json

gemini_bp = Blueprint('gemini', __name__)

@gemini_bp.route('/generate', methods=['POST', 'OPTIONS'])
@validate_session
def generate_content():
    if request.method == 'OPTIONS':
        response = jsonify({"message": "CORS preflight passed"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 200

    try:
        data = request.get_json()
        prompt = data.get("contents", [{}])[0].get("parts", [{}])[0].get("text", "")
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400

        full_prompt = f"""
{prompt}

กรุณาตอบในรูปแบบโครงสร้างข้อมูลต่อไปนี้:

**ชื่อเมนู:** <ใส่ชื่อเมนูอาหาร>

**หมวดหมู่:** <ประเภทหมวดหมู่ เช่น ผัด, ต้ม, ทอด, นึ่ง>

**แท็ก:** <ใส่แท็กที่เกี่ยวข้อง เช่น อาหารภาคใต้, เมนูเส้น, เมนูไก่, ฯลฯ>

**ส่วนผสม:**
<รายการส่วนผสมทีละบรรทัด เช่น>
- กุ้งสด 150 กรัม
- ใบกะเพรา 1 ถ้วย
- น้ำมันพืช 2 ช้อนโต๊ะ

**วิธีทำ:**
<ขั้นตอนการทำทีละบรรทัด เช่น>
1. ตั้งกระทะ ใส่น้ำมันพืชและตั้งไฟจนร้อน
2. ใส่กระเทียมและพริกขี้หนูลงไปผัดจนหอม
3. ใส่กุ้งลงไปผัดจนสุก

**ลักษณะภายนอก:** <บรรยายลักษณะภายนอกของอาหาร เช่น สี ขนาด และลักษณะเด่นอื่น ๆ>

**รสชาติ:** <บรรยายรสชาติของอาหาร เช่น เผ็ด, เค็ม, มัน, หวาน, เปรี้ยว>

**คำอธิบายเมนู:** <บรรยายข้อมูลทั่วไปเกี่ยวกับเมนู เช่น เหมาะกับใคร เป็นเมนูจากภาคไหน และข้อมูลอื่น ๆ>

โปรดตอบเป็นภาษาไทยทั้งหมดในรูปแบบโครงสร้างข้างต้น
"""

        payload = {
            "model": os.getenv('FINE_TUNED_MODEL_ID'),
            "contents": [{"parts": [{"text": full_prompt}]}]
        }

        headers = {"Content-Type": "application/json"}
        response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={os.getenv('API_KEY')}",
            headers=headers,
            json=payload
        )

        if response.status_code != 200:
            return jsonify({"error": "Gemini API error"}), 500

        content = response.json().get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        return jsonify({"response": content})
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


import re
import json

@gemini_bp.route('/parse', methods=['POST', 'OPTIONS'])
def parse_content():
    """
    Parse and extract structured data from the raw response, ensuring the default tag 'AI generate' is included.
    """
    if request.method == 'OPTIONS':
        response = jsonify({"message": "CORS preflight passed"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 200

    try:
        data = request.get_json()
        print("Received payload for /gemini/parse:", data)

        raw_response = data.get("response", "")
        if not raw_response:
            return jsonify({"error": "Response text is required"}), 400

        # Reprocess the raw response
        reprocess_prompt = f"""
        กรุณาวิเคราะห์ข้อมูลต่อไปนี้และตอบกลับในรูปแบบ JSON:
        {{
            "menuName": "<ชื่อเมนู>",
            "ingredients": ["<ส่วนผสม>", ...],
            "instructions": ["<วิธีทำ>", ...],
            "category": "<หมวดหมู่>",
            "tags": ["<แท็ก>", ...],
            "characteristics": "<ลักษณะภายนอก>",
            "flavors": "<รสชาติ>"
        }}

        ข้อมูล:
        {raw_response}
        """
        payload = {
            "model": os.getenv('FINE_TUNED_MODEL_ID'),
            "contents": [{"parts": [{"text": reprocess_prompt}]}]
        }

        headers = {"Content-Type": "application/json"}
        response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={os.getenv('API_KEY')}",
            headers=headers,
            json=payload
        )

        if response.status_code != 200:
            print("Gemini API error:", response.text)
            return jsonify({"error": "Gemini API error"}), 500

        structured_response = response.json().get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        print("Reprocessed structured response:", structured_response)

        # Extract the JSON from the response
        try:
            match = re.search(r'\{.*\}', structured_response, re.DOTALL)
            if match:
                json_string = match.group(0)
                parsed_data = json.loads(json_string)

                # Ensure 'AI generate' is included in the tags
                if "tags" in parsed_data:
                    if "AI generate" not in parsed_data["tags"]:
                        parsed_data["tags"].append("AI generate")
                else:
                    parsed_data["tags"] = ["AI generate"]

                return jsonify(parsed_data)
            else:
                print("No valid JSON found in response")
                return jsonify({"error": "No valid JSON found in response"}), 500
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON response: {e}")
            print(f"Received response: {structured_response}")
            return jsonify({"error": "Failed to parse JSON response"}), 500
    except Exception as e:
        print(f"Error in /gemini/parse: {e}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
