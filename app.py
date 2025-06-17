import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
import openai

# Load environment variables
load_dotenv()

# Flask setup
app = Flask(__name__)
CORS(app)

# Firebase init
if not firebase_admin._apps:
    cred = credentials.Certificate(os.environ["GOOGLE_APPLICATION_CREDENTIALS"])
    firebase_admin.initialize_app(cred)
db = firestore.client()

# OpenAI init
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route("/")
def home():
    return "Flask server running with Firebase and OpenAI!"

# Generate Ad Copy
@app.route("/generate_ad_copy", methods=["POST"])
def generate_ad_copy():
    try:
        data = request.json
        business = data.get("business")
        audience = data.get("audience")
        goal = data.get("goal")

        if not (business and audience and goal):
            return jsonify({"error": "Missing fields"}), 400

        prompt = (
            f"Write 3 headlines and 2 descriptions for an advertisement.\n"
            f"Business/Product: {business}\n"
            f"Target Audience: {audience}\n"
            f"Ad Goal: {goal}\n\n"
            f"Format:\nHeadlines:\n1. ...\n2. ...\n3. ...\n\nDescriptions:\n1. ...\n2. ..."
        )

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=300,
        )

        content = response.choices[0].message.content
        headlines, descriptions = [], []
        section = None

        for line in content.splitlines():
            line = line.strip()
            if "headlines" in line.lower():
                section = "headlines"
            elif "descriptions" in line.lower():
                section = "descriptions"
            elif line[:2].isdigit() or line.startswith("-") or line.startswith("*"):
                cleaned = line.split(".", 1)[-1].strip()
                if section == "headlines":
                    headlines.append(cleaned)
                elif section == "descriptions":
                    descriptions.append(cleaned)

        return jsonify({"headlines": headlines, "descriptions": descriptions})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Save a Campaign
@app.route("/api/generate_campaign", methods=["POST"])
def generate_campaign():
    data = request.json
    user_id = data.get("user_id")
    title = data.get("title")
    content = data.get("content")

    if not all([user_id, title, content]):
        return jsonify({"error": "user_id, title, and content required"}), 400

    campaign = {
        "title": title,
        "content": content,
        "createdAt": firestore.SERVER_TIMESTAMP,
        "favorite": False
    }

    db.collection("users").document(user_id).collection("campaigns").add(campaign)
    return jsonify({"success": True})

# Get Campaigns
@app.route("/api/my_campaigns", methods=["GET"])
def my_campaigns():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id required"}), 400

    docs = db.collection("users").document(user_id).collection("campaigns") \
        .order_by("createdAt", direction=firestore.Query.DESCENDING).stream()

    campaigns = [{"id": doc.id, **doc.to_dict()} for doc in docs]
    return jsonify({"campaigns": campaigns})

# Delete Campaign
@app.route("/api/delete_campaign/<user_id>/<campaign_id>", methods=["DELETE"])
def delete_campaign(user_id, campaign_id):
    try:
        doc_ref = db.collection("users").document(user_id).collection("campaigns").document(campaign_id)
        doc_ref.delete()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the server
if __name__ == "__main__":
    app.run(debug=True)
