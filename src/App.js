import React, { useState } from "react";

function App() {
  const [business, setBusiness] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [adCopy, setAdCopy] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/generate_ad_copy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ business, audience, goal }),
    });
    const data = await res.json();
    setAdCopy(data.copy);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>AI Ad Copy Generator MVP</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={business}
          onChange={e => setBusiness(e.target.value)}
          placeholder="Business / Product"
          required
        /><br />
        <input
          value={audience}
          onChange={e => setAudience(e.target.value)}
          placeholder="Target Audience"
          required
        /><br />
        <input
          value={goal}
          onChange={e => setGoal(e.target.value)}
          placeholder="Ad Goal (e.g., leads, sales)"
          required
        /><br />
        <button type="submit" style={{marginTop: 10}}>Generate Ad Copy</button>
      </form>
      <pre style={{whiteSpace: "pre-wrap", marginTop: 20}}>{adCopy}</pre>
    </div>
  );
}

export default App;
