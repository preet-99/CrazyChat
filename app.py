# from flask import Flask, request, jsonify, Response, stream_with_context
# from flask_cors import CORS
# from google import genai
# from google.genai import types
# import time, os
# from datetime import datetime
# from dotenv import load_dotenv
# from PIL import Image
# import io

# load_dotenv(".env.local")
# API_KEY = os.getenv("GEMINI_API_KEY")

# client = genai.Client(api_key=API_KEY)

# app = Flask(__name__)
# CORS(app)


# def get_bot_reply(message, img=None):
#     now = datetime.now().strftime("%d/%B/%Y, %I:%M,%A")
#     linkedin = "www.linkedin.com/in/preet-vishwakarma-b775a7317"
#     github = "https://github.com/preet-99"

#     contents = []

# # Text Add
#     contents.append({
#         "role":"user",
#         "parts":[{"text": message}]
#     })

# # Image add 
#     if img is not None:
#         contents.append({
#             "role":"user",
#             "parts":[{
#                 "inline_data":{
#                     "mime_type":"image/jpeg",
#                     "data":img
#                 }
#             }]
#         })

#     response = client.models.generate_content(
#         model="models/gemini-2.5-flash",
#         contents=message,
#         config={
#             "system_instruction": f"""
#             You are a Chatbot.
#             RULES:
#           1. Current system date and time is: {now}
#             2. NEVER guess date or time.
#             3. If user asks current date/time, reply using ONLY this value.
#             4. Creator is Preet Vishwakarma (B.C.A, Aspiring Data Scientist)
#                GitHub: {github}
#                LinkedIn: {linkedin}
#             5. Always reply in Hinglish.
#             6. Always ask user if they want to ask anything else.
#             7. Brief reply, 4-5 bullet points only.
#             """
#         },
#     )

#     full_text = response.text or ""
#     print(f"Bot Reply: {full_text}")

#     for char in full_text:
#         yield char
#         time.sleep(0.01)


# @app.route(
#     "/",
# )
# def home():
#     return "Hello am preet"


# @app.route("/chat", methods=["POST"])
# def chats():
#     file = request.files.get("image")
#     text = request.form.get("message", "")
#     user_msg = text

#     if not user_msg.strip():
#         return jsonify({"error": "Empty message"}), 400
#     if not user_msg and not file:
#         return jsonify({"error": "Empty"})

#     print(user_msg)

#     image = None
#     if image:
#         img_bytes = file.read()
#         image = Image.open(io.BytesIO(img_bytes))
#     if user_msg and image:
#         return Response(
#             stream_with_context(get_bot_reply(user_msg, image)),
#             mimetype="text/plain;charset=utf-8",
#         )
#     if user_msg:
#         return Response(
#             stream_with_context(get_bot_reply(user_msg)),
#             mimetype="text/plain;charset=utf-8",
#         )
#     if image:
#         response = client.models.generate_content(
#             model="models/gemini-2.5-flash", contents=["Describe this image.", image]
#         )
#         return jsonify({"response": response.text})


# app.run(debug=True)
