import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Firebase Initialization
if not firebase_admin._apps:
    cred = credentials.Certificate(os.environ["GOOGLE_APPLICATION_CREDENTIALS"])
    firebase_admin.initialize_app(cred)
db = firestore.client()

# OpenAI Initialization
openai.api_key = os.getenv("OPENAI_API_KEY")

# Health check
@app.route("/")
def home():
    return "Flask server running with SQLite and OpenAI v1!"

# Generate Ad Copy (OpenAI)
@app.route("/generate_ad_copy", methods=["POST"])
def generate_ad_copy():
    try:
        data = request.get_json()
        business = data.get("business", "")
        audience = data.get("audience", "")
        goal = data.get("goal", "")

        if not (business and audience and goal):
            return jsonify({"error": "Missing business, audience, or goal"}), 400

        prompt = (
            f"Write 3 headlines and 2 descriptions for an advertisement.\n"
            f"Business/Product: {business}\n"
            f"Target Audience: {audience}\n"
            f"Ad Goal: {goal}\n\n"
            f"Format:\n"
            f"Headlines:\n1. ...\n2. ...\n3. ...\n\nDescriptions:\n1. ...\n2. ..."
        )

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=300,
        )

        output = response.choices[0].message.content.strip()
        headlines, descriptions = [], []
        section = None

        for line in output.splitlines():
            line = line.strip()
            if line.lower().startswith("headlines"):
                section = "headlines"
            elif line.lower().startswith("descriptions"):
                section = "descriptions"
            elif line[:2].isdigit() or line.startswith(("-", "*")):
                content = line.split(".", 1)[-1].strip()
                if section == "headlines":
                    headlines.append(content)
                elif section == "descriptions":
                    descriptions.append(content)

        return jsonify({"headlines": headlines, "descriptions": descriptions})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Save a generated campaign
@app.route("/api/generate_campaign", methods=["POST"])
def generate_campaign():
    data = request.json
    user_id = data.get("user_id")
    title = data.get("title")
    content = data.get("content")

    if not (user_id and title and content):
        return jsonify({"error": "user_id, title, and content required"}), 400

    cmp = {
        "title": title,
        "content": content,
        "createdAt": firestore.SERVER_TIMESTAMP,
    }

    db.collection("users").document(user_id).collection("campaigns").add(cmp)
    return jsonify({"success": True})

# Get all campaigns for a user
@app.route("/api/my_campaigns", methods=["GET"])
def my_campaigns():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id required"}), 400

    try:
        docs = db.collection("users").document(user_id).collection("campaigns") \
            .order_by("createdAt", direction=firestore.Query.DESCENDING).stream()
        campaigns = [{"id": doc.id, **doc.to_dict()} for doc in docs]
        return jsonify({"campaigns": campaigns})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Delete a campaign
@app.route("/api/delete_campaign/<user_id>/<campaign_id>", methods=["DELETE"])
def delete_campaign(user_id, campaign_id):
    try:
        doc_ref = db.collection("users").document(user_id).collection("campaigns").document(campaign_id)
        doc_ref.delete()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
