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
        response.headers.add("Access-Control-Allow-Origin", "https://b2b3-2001-44c8-6614-6788-34b2-e6c4-29ad-8a81.ngrok-free.app")
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

**ลักษณะภายนอก:** <บรรยายลักษณะภายนอกของอาหาร เช่น สี ขนาด และลักษณะเด่นอื่น ๆ เหมาะสำหรับคนกลุ่มไหน รวมถึง พยายามวิเคราะห์ความต้องการของผู้ใช้ หากมีการระบุรายละเอียด ให้จดจำรายละเอียดทั้งหมดและนำมาเขียนตรงนี้ เช่น เหมาะสำหรับคนรักสุขภาพ อาหารนี้เป็นเมนูย่อยง่าย รวมถึงเก็บข้อมูลโภชนาการทุกอย่างเช่น ปริมาณคร่าวๆ ของ คาร์โบไฮเดรต โปรตีน วิตามิน แครอรี่ รวมถึงวิเคราะห์โภชนาการเองว่าเหมาะกับคนกลุ่มไหน เช่น เหมาะสำหรับผู้ป่าวโรคต่างๆ หรือมีอาการ ระบบย่อยอาหารที่ สูตรอาหารนี้อาจจะส่งผลดีหรือผลเสียได้>

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
        response.headers.add("Access-Control-Allow-Origin", "https://b2b3-2001-44c8-6614-6788-34b2-e6c4-29ad-8a81.ngrok-free.app")
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
            "danger_check":
                "status": "safe" or "not safe",
                "reason": "string" (ถ้าไม่ปลอดภัย ให้ระบุเหตุผล เช่น 'มีการใช้ไข่ดิบโดยไม่ปรุงสุก' หรือ 'แนะนำให้ทอดจนสีดำ'),
                "fix": "string" (ถ้าไม่ปลอดภัย ให้แนะนำวิธีแก้ไข เช่น 'ปรุงไข่ให้สุกก่อนบริโภค' หรือ 'ทอดจนสุกสีเหลืองทองแทน')

        }}

        ให้พิจารณาส่วนประกอบ ที่อาจจะผิดกฎหมาย หรือมีสารเสพติด เช่น กัญชา ใบกะท่อม และวัตถุดิบอื่นๆ ให้ครอบคลุมมากที่สุดเท่าที่เป็นไปได้ และให้เป็น status **ไม่ปลอดภัย เนื่องจากมีความละเอียดอ่อนด้านการคุมปริมาณ
        
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


@gemini_bp.route('/check', methods=['POST', 'OPTIONS'])
def check_recipe():
    if request.method == 'OPTIONS':
        response = jsonify({"message": "CORS preflight passed"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 200

    try:
        # Get the recipe data from the request
        recipe_data = request.get_json()
        
        # Extract individual fields from recipe_data
        menu_name = recipe_data.get("name", "")
        ingredients = recipe_data.get("ingredients", [])
        instructions = recipe_data.get("instructions", [])
        category = recipe_data.get("category", "")
        tags = recipe_data.get("tags", [])
        cover_image = recipe_data.get("cover_image", "")
        characteristics = recipe_data.get("characteristics", [])
        flavors = recipe_data.get("flavors", [])
        videos = recipe_data.get("videos", [])

        if not menu_name or not ingredients or not instructions:
            return jsonify({"error": "All fields (name, ingredients, instructions) are required"}), 400

        # Construct the prompt for Gemini or another AI service
        prompt = f"""
            ตรวจสอบสูตรอาหารนี้ให้ดี โดยต้องแน่ใจว่าการทำอาหารในสูตรนี้ปลอดภัย และไม่มีคำแนะนำที่ผิดหรืออันตราย เช่น "ทอดจนสีดำ" หรือ "กินดิบ" หรือคำแนะนำที่ไม่เหมาะสม เช่น "ใส่ระเบิด" หรือคำที่ไม่เกี่ยวข้องกับการทำอาหาร
            ชื่อเมนู: {menu_name}
            ส่วนผสม:
            {"\n".join([f"- {ingredient}" for ingredient in ingredients])}
            วิธีทำ:
            {"\n".join([f"{idx+1}. {instruction}" for idx, instruction in enumerate(instructions)])}
            หมวดหมู่: {category}
            แท็ก: {', '.join(tags)}
            ลักษณะ: {', '.join(characteristics)}
            รสชาติ: {', '.join(flavors)}
            วิดีโอ: {', '.join([video['url'] for video in videos])}

            กรุณาตอบกลับโดยแจ้งเตือนหากพบการทำอาหารที่ผิดพลาดหรือมีอันตราย พร้อมคำแนะนำในการปรับปรุงสูตรนี้

            ตอบกลับโดยใช้ format นี้

            สูตรอาหาร: ปลอดภัย หรือ อันตราย
            Not safe: (ถ้าไม่มีให้ตอบกลับ "-")
            reason: (ให้ตอบกลับถ้าอาหารไม่ปลอดถัย โดยให้เหตุผลว่าทำไมสูตรนี้ถึงไม่ปลอดภัย เช่น การใช้คำแนะนำที่ไม่เหมาะสมหรือมีความเสี่ยง)
            """


        payload = {
            "model": os.getenv('FINE_TUNED_MODEL_ID'),
            "contents": [{"parts": [{"text": prompt}]}]
        }

        headers = {"Content-Type": "application/json"}
        response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={os.getenv('API_KEY')}",
            headers=headers,
            json=payload
        )

        if response.status_code != 200:
            return jsonify({"error": "Gemini API error"}), 500

        # Extract AI's response
        ai_response = response.json().get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")

        # Check if the AI response contains any unsafe keywords
        unsafe_keywords = ["อันตราย", "ยาพิษ", "ไม่ควร", "ห้าม", "อันตรายถึงชีวิต"]
        is_safe = not any(keyword in ai_response for keyword in unsafe_keywords)

        # Extract reason if unsafe
        reason = ""
        if not is_safe:
            # If the AI response contains a reason, we return it
            reason = ai_response.strip() if ai_response else "No specific reason provided."

        # Return a simplified response with status, suggestions, and reason if unsafe
        return jsonify({
            "status": "Safe" if is_safe else "Not safe",
            "suggestions": "Please revise the recipe as it contains unsafe instructions." if not is_safe else "Recipe seems safe!",
            "reason": reason,  # Include reason if unsafe
            "ai_response": ai_response
        })

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


@gemini_bp.route('/check/recipe/edit', methods=['POST', 'OPTIONS'])
def check_and_edit_recipe():
    if request.method == 'OPTIONS':
        response = jsonify({"message": "CORS preflight passed"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 200

    try:
        # Get the recipe data from the request
        recipe_data = request.get_json()

        # Extract fields from recipe_data
        recipe_id = recipe_data.get("id", "")
        ingredients = recipe_data.get("ingredients", [])
        instructions = recipe_data.get("instructions", [])
        tags = recipe_data.get("tags", [])

        if not recipe_id or not ingredients or not instructions:
            return jsonify({"error": "ID, ingredients, and instructions are required"}), 400

        # Construct the prompt for Gemini or another AI service for validation
        prompt = f"""
        ตรวจสอบสูตรอาหารนี้ให้ดี โดยต้องแน่ใจว่าการทำอาหารในสูตรนี้ปลอดภัย และไม่มีคำแนะนำที่ผิดหรืออันตราย เช่น "ทอดจนสีดำ" หรือ "กินดิบ" หรือคำแนะนำที่ไม่เหมาะสม เช่น "ใส่ระเบิด" หรือคำที่ไม่เกี่ยวข้องกับการทำอาหาร
        ID: {recipe_id}
        ส่วนผสม:
        {"\n".join([f"- {ingredient}" for ingredient in ingredients])}
        วิธีทำ:
        {"\n".join([f"{idx+1}. {instruction}" for idx, instruction in enumerate(instructions)])}

        กรุณาตอบกลับโดยแจ้งเตือนหากพบการทำอาหารที่ผิดพลาดหรือมีอันตราย พร้อมคำแนะนำในการปรับปรุงสูตรนี้

        ตอบกลับโดยใช้ format นี้

            สูตรอาหาร: ปลอดภัย หรือ อันตราย
            Not safe: (ถ้าไม่มีให้ตอบกลับ "-")
            reason: (ให้ตอบกลับถ้าอาหารไม่ปลอดถัย โดยให้เหตุผลว่าทำไมสูตรนี้ถึงไม่ปลอดภัย เช่น การใช้คำแนะนำที่ไม่เหมาะสมหรือมีความเสี่ยง)
        """

        payload = {
            "model": os.getenv('FINE_TUNED_MODEL_ID'),
            "contents": [{"parts": [{"text": prompt}]}]
        }

        headers = {"Content-Type": "application/json"}
        response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={os.getenv('API_KEY')}",
            headers=headers,
            json=payload
        )

        if response.status_code != 200:
            return jsonify({"error": "Gemini API error"}), 500

        # Extract AI's response
        ai_response = response.json().get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")

        # Check if the AI response contains any unsafe keywords
        unsafe_keywords = ["อันตราย", "ยาพิษ", "ไม่ควร", "ห้าม", "อันตรายถึงชีวิต"]
        is_safe = not any(keyword in ai_response for keyword in unsafe_keywords)

        reason = ""
        if not is_safe:
            # If the AI response contains a reason, we return it
            reason = ai_response.strip() if ai_response else "No specific reason provided."

        # Return a simplified response with status and suggestion
        return jsonify({
            "status": "Safe" if is_safe else "Not safe",
            "suggestions": "Please revise the recipe as it contains unsafe instructions." if not is_safe else "Recipe seems safe!",
            "ai_response": ai_response,
            "recipe_id": recipe_id,
            "reason": reason,  # Include reason if unsafe
        })

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
