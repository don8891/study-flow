import React, { useState } from "react";
import Card from "../components/Card";
import { callAI } from "../api/api";

function Quiz({ syllabusText, quiz, setQuiz, answers, setAnswers, showResult, setShowResult }) {
  const [loading, setLoading] = useState(false);

  async function handleGenerateQuiz() {
    if (!syllabusText) {
      alert("Please upload a syllabus first!");
      return;
    }
    setLoading(true);
    setShowResult(false);
    try {
      const res = await callAI("quiz", syllabusText);
      let jsonStr = res.response;
      const jsonMatch = jsonStr.match(/\[.*\]/s);
      if (jsonMatch) jsonStr = jsonMatch[0];
      
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
    if (showResult) return; // Prevent changes after submission
    setAnswers({ ...answers, [qIndex]: option });
  };

  const calculateScore = () => {
    let score = 0;
    quiz.forEach((q, index) => {
      if (answers[index] === q.answer) score++;
    });
    return score;
  };

  const score = calculateScore();
  const percentage = (score / quiz.length) * 100;

  const getFeedback = () => {
    if (percentage === 100) return "Master Class! You know your stuff. 🏆";
    if (percentage >= 80) return "Excellent! Almost perfect. 🌟";
    if (percentage >= 60) return "Good job! Keep practicing. 👍";
    return "Keep studying! You'll get there. 📚";
  };

  const resetQuiz = () => {
    setQuiz([]);
    setAnswers({});
    setShowResult(false);
  };

  return (
    <div className="page" style={{ paddingBottom: "100px" }}>
      <header style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "2.4rem", fontWeight: "900", background: "linear-gradient(135deg, var(--primary), var(--accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-1px" }}>
          AI Quiz Master
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>Master your syllabus through strategic testing.</p>
      </header>

      {!quiz.length ? (
        <Card style={{ border: "1px solid rgba(17, 94, 89, 0.1)", background: "white" }}>
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🎯</div>
            <h3 style={{ color: "var(--primary)", fontWeight: "800", fontSize: "1.5rem" }}>Knowledge Check!</h3>
            <p style={{ marginBottom: "30px", color: "var(--text-muted)", fontSize: "1.1rem" }}>
              We'll generate a custom quiz based on your specific syllabus topics.
            </p>
            <button 
              className="btn-primary" 
              onClick={handleGenerateQuiz} 
              disabled={loading}
              style={{ width: "100%", padding: "18px", borderRadius: "14px", fontSize: "1.2rem", background: "linear-gradient(135deg, var(--primary), #0d4a46)" }}
            >
              {loading ? "Crafting Questions..." : "Generate AI Quiz"}
            </button>
          </div>
        </Card>
      ) : showResult ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          <Card style={{ textAlign: "center", padding: "40px", border: "2px solid var(--primary)", background: "var(--primary-light)" }}>
            <h2 style={{ fontSize: "3rem", margin: "0" }}>{percentage >= 60 ? "🎉" : "💪"}</h2>
            <h3 style={{ fontSize: "2rem", color: "var(--primary)", fontWeight: "900", margin: "10px 0" }}>
              Score: {score} / {quiz.length}
            </h3>
            <p style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--text-main)" }}>{getFeedback()}</p>
            <div style={{ width: "100%", height: "8px", background: "white", borderRadius: "10px", margin: "25px 0", overflow: "hidden" }}>
              <div style={{ width: `${percentage}%`, height: "100%", background: "var(--primary)", transition: "width 1s ease-out" }}></div>
            </div>
            <button className="btn-primary" onClick={resetQuiz} style={{ padding: "14px 40px", borderRadius: "12px", background: "var(--primary)" }}>
              Try Another Quiz
            </button>
          </Card>

          <h3 style={{ marginTop: "20px", color: "var(--text-main)" }}>Review Answers</h3>
          {quiz.map((q, index) => {
            const isCorrect = answers[index] === q.answer;
            return (
              <Card key={index} style={{ border: `1px solid ${isCorrect ? "var(--success)" : "var(--error)"}`, opacity: 0.9 }}>
                <p style={{ fontWeight: "700", marginBottom: "15px" }}>
                  <span style={{ color: isCorrect ? "var(--success)" : "var(--error)" }}>
                    {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                  </span>
                  <br />
                  {index + 1}. {q.question}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {Object.entries(q.options || {}).map(([key, value]) => {
                    let border = "1px solid rgba(0,0,0,0.05)";
                    let background = "rgba(255,255,255,0.03)";
                    if (key === q.answer) {
                      border = "2px solid var(--success)";
                      background = "rgba(16, 185, 129, 0.1)";
                    } else if (key === answers[index] && !isCorrect) {
                      border = "2px solid var(--error)";
                      background = "rgba(239, 68, 68, 0.1)";
                    }
                    return (
                      <div key={key} style={{ padding: "10px 15px", borderRadius: "8px", border, background, display: "flex", gap: "10px" }}>
                        <span style={{ fontWeight: "bold" }}>{key}.</span>
                        <span>{value}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {quiz.map((q, index) => (
            <Card key={index} style={{ border: "1px solid rgba(17, 94, 89, 0.08)" }}>
              <p style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "20px", color: "var(--text-main)" }}>
                <span style={{ color: "var(--primary)", marginRight: "12px" }}>{index + 1}.</span>
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
                      padding: "14px 18px",
                      background: answers[index] === key ? "rgba(17, 94, 89, 0.08)" : "white",
                      border: `2px solid ${answers[index] === key ? "var(--primary)" : "rgba(17, 94, 89, 0.1)"}`,
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                  >
                    <input 
                      type="radio" 
                      name={`q${index}`} 
                      checked={answers[index] === key}
                      onChange={() => handleOptionChange(index, key)}
                      style={{ accentColor: "var(--primary)", width: "18px", height: "18px" }}
                    />
                    <span style={{ fontWeight: "800", color: "var(--primary)", minWidth: "20px" }}>{key}.</span>
                    <span style={{ color: "var(--text-main)", fontWeight: "500" }}>{value}</span>
                  </label>
                ))}
              </div>
            </Card>
          ))}
          <button 
            className="btn-primary" 
            onClick={() => setShowResult(true)}
            style={{ marginTop: "20px", padding: "16px", borderRadius: "14px", fontSize: "1.1rem", fontWeight: "800", background: "var(--primary)" }}
            disabled={Object.keys(answers).length < quiz.length}
          >
            Submit for Review
          </button>
        </div>
      )}
    </div>
  );
}

export default Quiz;
