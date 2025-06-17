// App.js
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import MyCampaigns from "./MyCampaigns";
import Dashboard from "./Dashboard";

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
      setAdCopy({
        headlines: data.headlines || [],
        descriptions: data.descriptions || [],
      });
    } catch (err) {
      console.error("Error generating ad copy:", err);
      setAdCopy(null);
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              email={email}
              password={password}
              setEmail={setEmail}
              setPassword={setPassword}
              user={user}
              error={error}
              signup={signup}
              login={login}
              logout={logout}
              business={business}
              setBusiness={setBusiness}
              audience={audience}
              setAudience={setAudience}
              goal={goal}
              setGoal={setGoal}
              adCopy={adCopy}
              handleSubmit={handleSubmit}
            />
          }
        />
        <Route path="/my-campaigns" element={<MyCampaigns />} />
      </Routes>
    </Router>
  );
}

export default App;
