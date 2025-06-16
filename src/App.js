import { useState } from "react";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MyCampaigns from "./MyCampaigns";

function App() {
  const [business, setBusiness] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [adCopy, setAdCopy] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const signup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const login = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/generate_ad_copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business, audience, goal }),
      });

      const data = await res.json();
      setAdCopy(data);

      const authUser = auth.currentUser;
      if (authUser && data.headlines && data.descriptions) {
        const userId = authUser.uid;
        const title = data.headlines[0];
        const content = data.descriptions.join("\n");

        await fetch(`${process.env.REACT_APP_API_URL}/api/generate_campaign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, title, content }),
        });
      }
    } catch (err) {
      console.error("Error generating or saving ad copy:", err);
      setAdCopy(null);
    }
  };

  const Dashboard = () => (
    <div className="max-w-3xl mx-auto px-6 py-10 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">AI Ad Copy Generator</h1>

      {/* 🔐 Auth */}
      <div className="bg-white shadow p-6 rounded mb-8 border">
        <h2 className="text-lg font-semibold mb-4">User Authentication</h2>
        <form onSubmit={() => {}} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 border rounded"
          />
          <div className="flex gap-2">
            <button onClick={signup} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Sign Up
            </button>
            <button onClick={login} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Login
            </button>
            <button onClick={logout} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Logout
            </button>
          </div>
        </form>
        {user && <p className="mt-3 text-sm text-green-700">Logged in as: {user.email}</p>}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {/* 🧠 AI Form */}
      {user ? (
        <div className="bg-white shadow p-6 rounded border">
          <h2 className="text-lg font-semibold mb-4">Generate New Ad</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              placeholder="Business / Product"
              className="w-full p-2 border rounded"
              required
            />
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Target Audience"
              className="w-full p-2 border rounded"
              required
            />
            <input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Ad Goal (e.g., sales, leads)"
              className="w-full p-2 border rounded"
              required
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Generate Ad Copy
            </button>
          </form>

          {/* Previews */}
          {adCopy && adCopy.headlines && (
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2">Generated Ad Preview</h3>
              {adCopy.headlines.map((headline, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded border mb-4">
                  <h4 className="font-semibold text-gray-800">{headline}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {adCopy.descriptions?.[idx] || ""}
                  </p>
                </div>
              ))}
            </div>
          )}

          <Link
            to="/my-campaigns"
            className="inline-block mt-6 text-indigo-600 hover:underline font-medium"
          >
            📊 View My Campaigns
          </Link>
        </div>
      ) : (
        <p className="text-center text-red-500 text-sm mt-6">
          Please sign up or log in to use the AI Ad Copy generator.
        </p>
      )}
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/my-campaigns" element={<MyCampaigns />} />
      </Routes>
    </Router>
  );
}

export default App;
