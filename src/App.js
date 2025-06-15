import { useState } from "react";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

function App() {
  // Ad generator state
  const [business, setBusiness] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [adCopy, setAdCopy] = useState("");

  // Auth state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  // Auth functions
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
    setError("");
  };

  // Ad copy generation
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${process.env.REACT_APP_API_URL}/generate_ad_copy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ business, audience, goal }),
    });
    const data = await res.json();
    setAdCopy(data.copy);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>User Authentication</h2>
      <div style={{ marginBottom: 20 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button onClick={signup}>Sign Up</button>
        <button onClick={login}>Login</button>
        <button onClick={logout}>Logout</button>
        {user && <span style={{ marginLeft: 20 }}>Welcome, {user.email}</span>}
        {error && <div style={{ color: "red" }}>{error}</div>}
      </div>

      {user ? (
        <>
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
            <button type="submit" style={{ marginTop: 10 }}>Generate Ad Copy</button>
          </form>
          <pre style={{ whiteSpace: "pre-wrap", marginTop: 20 }}>{adCopy}</pre>
        </>
      ) : (
        <p style={{ color: "darkred" }}>
          Please sign up or log in to use the AI Ad Copy generator.
        </p>
      )}
    </div>
  );
}

export default App;
