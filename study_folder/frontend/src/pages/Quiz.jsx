import React, { useState } from "react";
import Card from "../components/Card";
import { callAI } from "../api/api";

function Quiz({ syllabusText }) {
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({});

  async function handleGenerateQuiz() {
    if (!syllabusText) {
      alert("Please upload a syllabus first!");
      return;
    }
    setLoading(true);
    try {
      const res = await callAI("quiz", syllabusText);
      // Attempt to find JSON in response (Ollama might include conversational text)
      let jsonStr = res.response;
      const jsonMatch = jsonStr.match(/\[.*\]/s);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      const parsedQuiz = JSON.parse(jsonStr);
      setQuiz(parsedQuiz);
      setAnswers({});
    } catch (err) {
      console.error(err);
      alert("Failed to generate quiz. Make sure Ollama is running llama3.");
    } finally {
      setLoading(false);
    }
  }

  const handleOptionChange = (qIndex, option) => {
    setAnswers({ ...answers, [qIndex]: option });
  };

  return (
    <div className="page" style={{ paddingBottom: "100px" }}>
      <header style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "800", background: "linear-gradient(to right, var(--primary), #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          AI Quiz Master
        </h2>
        <p style={{ color: "var(--text-muted)" }}>Test your knowledge based on your syllabus.</p>
      </header>

      {!quiz.length ? (
        <Card>
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "20px" }}>🧠</div>
            <h3>Ready for a challenge?</h3>
            <p style={{ marginBottom: "30px", color: "var(--text-muted)" }}>
              We'll generate 5 questions to help you master your current syllabus.
            </p>
            <button 
              className="btn-primary" 
              onClick={handleGenerateQuiz} 
              disabled={loading}
              style={{ width: "100%", padding: "15px", borderRadius: "12px", fontSize: "1.1rem" }}
            >
              {loading ? "Generating Quiz..." : "Start AI Quiz"}
            </button>
          </div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {quiz.map((q, index) => (
            <Card key={index}>
              <p style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "20px" }}>
                <span style={{ color: "var(--primary)", marginRight: "10px" }}>{index + 1}.</span>
                {q.question}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {Object.entries(q.options || {}).map(([key, value]) => (
                  <label 
                    key={key} 
                    className="option-label"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      background: answers[index] === key ? "rgba(99, 102, 241, 0.1)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${answers[index] === key ? "var(--primary)" : "rgba(255,255,255,0.1)"}`,
                      borderRadius: "10px",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    <input 
                      type="radio" 
                      name={`q${index}`} 
                      value={key} 
                      checked={answers[index] === key}
                      onChange={() => handleOptionChange(index, key)}
                      style={{ accentColor: "var(--primary)" }}
                    />
                    <span style={{ fontWeight: "700", color: "var(--primary)" }}>{key}.</span>
                    <span>{value}</span>
                  </label>
                ))}
              </div>
            </Card>
          ))}
          <button 
            className="btn-primary" 
            onClick={() => setQuiz([])}
            style={{ marginTop: "20px" }}
          >
            Finish Quiz
          </button>
        </div>
      )}
    </div>
  );
}

export default Quiz;
