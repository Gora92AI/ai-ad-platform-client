import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const API_BASE = process.env.REACT_APP_API_URL;

function MyCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  // Listen for auth state (login/logout)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return unsubscribe;
  }, []);

  // Fetch campaigns when user is loaded
  useEffect(() => {
    if (!user?.uid) return;

    const fetchCampaigns = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/my_campaigns?user_id=${user.uid}`);
        const data = await res.json();

        if (data.error) throw new Error(data.error);
        setCampaigns(data.campaigns);
      } catch (err) {
        console.error("Error loading campaigns:", err);
        setError("Failed to load campaigns.");
      }
    };

    fetchCampaigns();
  }, [user?.uid, API_BASE]); // ✅ Fix: include API_BASE in deps

  // Toggle favorite (UI only for now)
  const toggleFavorite = (id) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c))
    );
  };

  // Delete campaign from backend
  const deleteCampaign = async (id) => {
    try {
      await fetch(`${API_BASE}/api/delete_campaign/${user.uid}/${id}`, {
        method: "DELETE",
      });
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete campaign.");
    }
  };

  // Display
  if (!user) {
    return <p className="text-center mt-8 text-red-500">You must be logged in.</p>;
  }

  if (error) {
    return <p className="text-center mt-8 text-red-500">{error}</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">📊 My Campaigns</h1>
      {campaigns.length === 0 ? (
        <p className="text-center text-gray-500">No campaigns yet.</p>
      ) : (
        <div className="space-y-6">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="p-4 border rounded shadow-sm bg-white flex justify-between items-start"
            >
              <div>
                <h2 className="text-xl font-semibold mb-1">{c.title}</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{c.content}</p>
              </div>
              <div className="space-x-2">
                <button
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    c.favorite ? "bg-yellow-400 text-white" : "bg-gray-300 text-black"
                  }`}
                  onClick={() => toggleFavorite(c.id)}
                >
                  ⭐ {c.favorite ? "Unfavorite" : "Favorite"}
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm font-medium"
                  onClick={() => deleteCampaign(c.id)}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyCampaigns;
