import React, { useState } from "react";
import Card from "../components/Card";
import { callAI } from "../api/api";

function AIAssistant({ syllabusText, summary, setSummary, chat, setChat, activeTab, setActiveTab }) {
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  // Helper to format AI response (Bold, Underline, Bullet Points)
  const formatOutput = (text) => {
    if (!text) return null;
    
    // Split by newlines to handle bullet points and structure
    const lines = text.split("\n");
    
    return lines.map((line, i) => {
      // Handle Bold (**text**)
      let formattedLine = line.split(/(\*\*.*?\*\*)/).map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={j} style={{ color: "var(--primary)", fontWeight: "800" }}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      // Handle Underline (__text__)
      formattedLine = formattedLine.map((part, j) => {
        if (typeof part === 'string') {
          return part.split(/(__.*?__)/).map((subPart, k) => {
            if (subPart.startsWith("__") && subPart.endsWith("__")) {
              return <u key={k} style={{ textDecorationColor: "var(--accent)" }}>{subPart.slice(2, -2)}</u>;
            }
            return subPart;
          });
        }
        return part;
      });

      // Handle Bullet Points
      if (line.trim().startsWith("- ")) {
        return (
          <div key={i} style={{ display: "flex", gap: "10px", margin: "8px 0", paddingLeft: "10px" }}>
            <span style={{ color: "var(--accent)", fontWeight: "bold" }}>•</span>
            <div>{formattedLine}</div>
          </div>
        );
      }

      return <p key={i} style={{ margin: "10px 0" }}>{formattedLine}</p>;
    });
  };

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
        <h2 style={{ fontSize: "2.4rem", fontWeight: "900", background: "linear-gradient(135deg, var(--primary), var(--accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-1px" }}>
          AI Learning Assistant
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>Get premium summaries or clear your doubts instantly.</p>
      </header>

      <div style={{ display: "flex", gap: "12px", marginBottom: "30px", background: "rgba(17, 94, 89, 0.05)", padding: "8px", borderRadius: "16px", border: "1px solid rgba(17, 94, 89, 0.1)" }}>
        <button 
          onClick={() => setActiveTab("summary")}
          style={{ 
            flex: 1, 
            padding: "12px", 
            borderRadius: "12px", 
            border: "none", 
            background: activeTab === "summary" ? "var(--primary)" : "transparent",
            color: activeTab === "summary" ? "white" : "var(--text-muted)",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: activeTab === "summary" ? "0 4px 12px rgba(17, 94, 89, 0.2)" : "none"
          }}
        >
          Syllabus Study Guide
        </button>
        <button 
          onClick={() => setActiveTab("doubt")}
          style={{ 
            flex: 1, 
            padding: "12px", 
            borderRadius: "12px", 
            border: "none", 
            background: activeTab === "doubt" ? "var(--primary)" : "transparent",
            color: activeTab === "doubt" ? "white" : "var(--text-muted)",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: activeTab === "doubt" ? "0 4px 12px rgba(17, 94, 89, 0.2)" : "none"
          }}
        >
          Instant Doubt Clear
        </button>
      </div>

      {activeTab === "summary" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Card style={{ border: "1px solid rgba(17, 94, 89, 0.1)", background: "white" }}>
            <h3 style={{ color: "var(--primary)", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.5rem" }}>📘</span> Smart Study Guide
            </h3>
            <p style={{ marginBottom: "25px", color: "var(--text-muted)" }}>
              We've analyzed your syllabus to create a prioritized revision guide.
            </p>
            {!summary ? (
              <button 
                className="btn-primary" 
                onClick={handleGetSummary} 
                disabled={loadingSummary}
                style={{ width: "100%", padding: "16px", borderRadius: "14px", fontSize: "1.1rem", background: "linear-gradient(135deg, var(--primary), #0d4a46)" }}
              >
                {loadingSummary ? "Generating Pro Guide..." : "Generate Study Guide"}
              </button>
            ) : (
              <div 
                className="summary-content" 
                style={{ 
                  whiteSpace: "pre-wrap", 
                  background: "var(--primary-light)", 
                  padding: "25px", 
                  borderRadius: "18px", 
                  border: "1px solid rgba(17, 94, 89, 0.1)",
                  color: "var(--text-main)",
                  fontSize: "1.05rem",
                  lineHeight: "1.6"
                }}
              >
                {formatOutput(summary)}
              </div>
            )}
          </Card>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Card style={{ border: "1px solid rgba(17, 94, 89, 0.1)", background: "white" }}>
            <div style={{ height: "500px", display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "18px", marginBottom: "20px", padding: "15px" }}>
                {chat.length === 0 && (
                  <div style={{ textAlign: "center", color: "var(--text-muted)", marginTop: "140px", display: "flex", flexDirection: "column", gap: "15px" }}>
                    <span style={{ fontSize: "3rem" }}>💬</span>
                    <span>Ask any question from your syllabus!</span>
                  </div>
                )}
                {chat.map((msg, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                      background: msg.role === "user" ? "var(--primary)" : "var(--primary-light)",
                      color: msg.role === "user" ? "white" : "var(--text-main)",
                      padding: "14px 20px",
                      borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                      maxWidth: "85%",
                      fontSize: "1rem",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      lineHeight: "1.5"
                    }}
                  >
                    {msg.role === "ai" ? formatOutput(msg.text) : msg.text}
                  </div>
                ))}
                {loadingChat && (
                  <div style={{ alignSelf: "flex-start", color: "var(--primary)", fontSize: "0.9rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                    <div className="dot-pulse"></div> Thinking...
                  </div>
                )}
              </div>
              <form onSubmit={handleSendQuery} style={{ display: "flex", gap: "12px", background: "var(--bg-main)", padding: "12px", borderRadius: "18px", border: "1px solid rgba(17, 94, 89, 0.1)" }}>
                <input 
                  type="text" 
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Type your question here..."
                  style={{ flex: 1, background: "transparent", border: "none", borderRadius: "0", padding: "8px", color: "var(--text-main)", fontSize: "1rem", outline: "none" }}
                />
                <button type="submit" className="btn-primary" style={{ padding: "0 24px", borderRadius: "12px", height: "45px" }} disabled={loadingChat}>
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
