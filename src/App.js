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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const [business, setBusiness] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [adCopy, setAdCopy] = useState(null);

  const signup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const login = async () => {
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
    } catch (err) {
      console.error(err);
      setAdCopy(null);
    }
  };

  const Dashboard = () => (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-6">AI Ad Copy Generator</h1>

      {/* Auth Block */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">User Authentication</h2>
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <div className="flex gap-2">
            <button type="button" onClick={signup} className="px-4 py-2 bg-blue-500 text-white rounded">Sign Up</button>
            <button type="button" onClick={login} className="px-4 py-2 bg-green-500 text-white rounded">Login</button>
            <button type="button" onClick={logout} className="px-4 py-2 bg-gray-500 text-white rounded">Logout</button>
          </div>
        </div>
        {user && <p className="mt-2 text-green-500">Logged in as: {user.email}</p>}
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {/* Ad Generator */}
      {user ? (
        <div className="bg-white p-6 rounded shadow mt-6">
          <h2 className="text-xl font-semibold mb-4">Generate New Ad</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              className="w-full p-2 border rounded"
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              placeholder="Business / Product"
              required
            />
            <input
              className="w-full p-2 border rounded"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Target Audience"
              required
            />
            <input
              className="w-full p-2 border rounded"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Ad Goal (e.g., sales, leads)"
              required
            />
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
              Generate Ad Copy
            </button>
          </form>

          {/* Generated Ad Output */}
          {adCopy && (
            <div className="mt-6 space-y-4">
              {adCopy.headlines.map((headline, idx) => (
                <div key={idx} className="p-4 bg-gray-100 rounded">
                  <h3 className="font-semibold">{headline}</h3>
                  <p className="text-gray-600">{adCopy.descriptions[idx]}</p>
                </div>
              ))}
            </div>
          )}

          <Link className="mt-6 block text-indigo-500 underline" to="/my-campaigns">📊 View My Campaigns</Link>
        </div>
      ) : (
        <p className="mt-4 text-center text-red-500">Please sign up or log in to use the AI Ad Copy generator.</p>
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