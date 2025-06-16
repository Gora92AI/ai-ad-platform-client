import React, { useEffect, useState } from "react";
import axios from "axios";

export default function MyCampaigns() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    // For now, hardcode a test user. Later, use real user id from auth.
    const userId = "testuser123";
    // Use http://localhost:5000 when testing locally;
    // Change to your Render URL when you deploy!
    const API_BASE = "http://localhost:5000";

    useEffect(() => {
        axios
          .get(`${API_BASE}/api/my_campaigns?user_id=${userId}`)
          .then(res => {
              setCampaigns(res.data.campaigns);
              setLoading(false);
          })
          .catch(err => {
              setError("Could not load campaigns.");
              setLoading(false);
          });
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{color: 'red'}}>{error}</div>;

    return (
        <div>
            <h2>My Campaigns</h2>
            {campaigns.length === 0 && <p>No campaigns found.</p>}
            {campaigns.map(cmp => (
                <div key={cmp.id} style={{border:'1px solid #ddd', margin:'1em 0', padding:'1em'}}>
                    <strong>{cmp.title}</strong>
                    <p>{cmp.content}</p>
                    <small>
                        {cmp.createdAt?.seconds 
                            ? new Date(cmp.createdAt.seconds * 1000).toLocaleString() 
                            : "No date"}
                    </small>
                </div>
            ))}
        </div>
    );
}