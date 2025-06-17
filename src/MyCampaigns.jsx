import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";

export default function MyCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const user = getAuth().currentUser;
        if (!user) return;

        const res = await axios.get(`${API_BASE}/api/my_campaigns?user_id=${user.uid}`);
        setCampaigns(res.data.campaigns);
      } catch (err) {
        setError("Failed to load campaigns.");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const deleteCampaign = async (id) => {
    const user = getAuth().currentUser;
    try {
      await axios.delete(`${API_BASE}/api/delete_campaign`, {
        data: { user_id: user.uid, campaign_id: id },
      });
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("Failed to delete campaign.");
    }
  };

  const toggleFavorite = (id) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c))
    );
  };

  if (loading) return <div className="text-center py-10 text-gray-600">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">📋 My Campaigns</h1>
      <div className="space-y-4">
        {campaigns.map((cmp) => (
          <div key={cmp.id} className="p-4 bg-white shadow-md rounded relative">
            {cmp.favorite && (
              <span className="absolute top-2 right-2 text-yellow-400 text-xl">★</span>
            )}
            <h3 className="text-xl font-semibold mb-1">{cmp.title}</h3>
            <p className="text-gray-700">{cmp.content}</p>
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => deleteCampaign(cmp.id)}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => toggleFavorite(cmp.id)}
                className={`px-3 py-1 text-sm rounded ${
                  cmp.favorite ? "bg-yellow-400 text-white" : "bg-gray-300 text-gray-700"
                }`}
              >
                {cmp.favorite ? "★ Favorited" : "☆ Favorite"}
              </button>
            </div>
            {cmp.createdAt?.seconds && (
              <p className="text-sm text-gray-400 mt-2">
                {new Date(cmp.createdAt.seconds * 1000).toLocaleString()}
              </p>
            )}
          </div>
        ))}
        {campaigns.length === 0 && (
          <p className="text-center text-gray-500">No campaigns found.</p>
        )}
      </div>
    </div>
  );
}
