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
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          setError("User not logged in.");
          setLoading(false);
          return;
        }

        const token = await user.getIdToken();

        const res = await axios.get(`${API_BASE}/api/my_campaigns`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCampaigns(res.data.campaigns || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Could not load campaigns.");
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <h2>My Campaigns</h2>
      {campaigns.length === 0 && <p>No campaigns found.</p>}
      {campaigns.map((cmp) => (
        <div key={cmp.id}>
          <strong>{cmp.title}</strong>
          <p>{cmp.content}</p>
        </div>
      ))}
    </div>
  );
}
