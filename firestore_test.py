import firebase_admin
from firebase_admin import credentials, firestore

# Initialize the app with your credentials
cred = credentials.ApplicationDefault()  # Will use GOOGLE_APPLICATION_CREDENTIALS env variable
firebase_admin.initialize_app(cred)
db = firestore.client()

# Add a test campaign under user "testuser123"
campaign_ref = db.collection("users").document("testuser123").collection("campaigns").document()
campaign_ref.set({
    "title": "My First Campaign",
    "content": "Hello from Python!",
    "createdAt": firestore.SERVER_TIMESTAMP
})

# Read and print all campaigns for "testuser123"
docs = db.collection("users").document("testuser123").collection("campaigns").stream()
for doc in docs:
    print(doc.id, doc.to_dict())