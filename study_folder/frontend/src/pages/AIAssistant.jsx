import React, { useState } from "react";
import Card from "../components/Card";
import { callAI } from "../api/api";

function AIAssistant({ syllabusText }) {
  const [activeTab, setActiveTab] = useState("summary");
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [chat, setChat] = useState([]);
  const [userQuery, setUserQuery] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  async function handleGetSummary() {
    if (!syllabusText) {
      alert("Please upload a syllabus first!");
      return;
    }
    setLoadingSummary(true);
    try {
      const res = await callAI("summary", syllabusText);
      setSummary(res.response);
    } catch (err) {
      console.error(err);
      alert("Failed to get summary. Make sure local AI is running.");
    } finally {
      setLoadingSummary(false);
    }
  }

  async function handleSendQuery(e) {
    e.preventDefault();
    if (!userQuery.trim()) return;
    
    const newChat = [...chat, { role: "user", text: userQuery }];
    setChat(newChat);
    setUserQuery("");
    setLoadingChat(true);

    try {
      const res = await callAI("doubt", userQuery, syllabusText);
      setChat([...newChat, { role: "ai", text: res.response }]);
    } catch (err) {
      console.error(err);
      setChat([...newChat, { role: "ai", text: "Sorry, I'm having trouble connecting to the AI." }]);
    } finally {
      setLoadingChat(false);
    }
  }

  return (
    <div className="page" style={{ paddingBottom: "100px" }}>
      <header style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "800", background: "linear-gradient(to right, #ec4899, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          AI Learning Assistant
        </h2>
        <p style={{ color: "var(--text-muted)" }}>Get summaries or clear your doubts instantly.</p>
      </header>

      <div style={{ display: "flex", gap: "10px", marginBottom: "30px", background: "rgba(255,255,255,0.05)", padding: "5px", borderRadius: "12px" }}>
        <button 
          onClick={() => setActiveTab("summary")}
          style={{ 
            flex: 1, 
            padding: "10px", 
            borderRadius: "8px", 
            border: "none", 
            background: activeTab === "summary" ? "var(--primary)" : "transparent",
            color: activeTab === "summary" ? "white" : "var(--text-muted)",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          Syllabus Summary
        </button>
        <button 
          onClick={() => setActiveTab("doubt")}
          style={{ 
            flex: 1, 
            padding: "10px", 
            borderRadius: "8px", 
            border: "none", 
            background: activeTab === "doubt" ? "var(--primary)" : "transparent",
            color: activeTab === "doubt" ? "white" : "var(--text-muted)",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          Doubt Clearing
        </button>
      </div>

      {activeTab === "summary" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Card>
            <h3>Smart Summary</h3>
            <p style={{ marginBottom: "20px", color: "var(--text-muted)" }}>
              Summarize your syllabus into actionable bullet points.
            </p>
            {!summary ? (
              <button 
                className="btn-primary" 
                onClick={handleGetSummary} 
                disabled={loadingSummary}
                style={{ width: "100%" }}
              >
                {loadingSummary ? "Analyzing Syllabus..." : "Generate Summary"}
              </button>
            ) : (
              <div className="summary-content" style={{ whiteSpace: "pre-wrap", background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                {summary}
              </div>
            )}
          </Card>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Card>
            <div style={{ height: "400px", display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "15px", marginBottom: "20px", padding: "10px" }}>
                {chat.length === 0 && (
                  <div style={{ textAlign: "center", color: "var(--text-muted)", marginTop: "100px" }}>
                    Ask anything about your studies!
                  </div>
                )}
                {chat.map((msg, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                      background: msg.role === "user" ? "var(--primary)" : "rgba(255,255,255,0.05)",
                      padding: "12px 16px",
                      borderRadius: msg.role === "user" ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                      maxWidth: "80%",
                      fontSize: "0.95rem"
                    }}
                  >
                    {msg.text}
                  </div>
                ))}
                {loadingChat && (
                  <div style={{ alignSelf: "flex-start", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    AI is thinking...
                  </div>
                )}
              </div>
              <form onSubmit={handleSendQuery} style={{ display: "flex", gap: "10px" }}>
                <input 
                  type="text" 
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Ask a doubt..."
                  style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px" }}
                />
                <button type="submit" className="btn-primary" style={{ padding: "0 20px" }} disabled={loadingChat}>
                  Send
                </button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default AIAssistant;
