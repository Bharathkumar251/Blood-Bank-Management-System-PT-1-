import React, { useState } from "react";
import API from "../services/API";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { sender: "ai", text: "Hello! I am your AI Blood Bank Assistant. How can I help you today?" }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;
    setChatHistory([...chatHistory, { sender: "user", text: userMessage }]);
    setMessage("");
    setLoading(true);

    try {
      const { data } = await API.post("/ai/chat", { message: userMessage });
      if (data?.success) {
        setChatHistory((prev) => [...prev, { sender: "ai", text: data.reply }]);
      }
    } catch (error) {
      console.error(error);
      setChatHistory((prev) => [...prev, { sender: "ai", text: "Sorry, I am having trouble connecting to the server." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#b01826",
          color: "white",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          border: "none",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          fontSize: "24px",
          zIndex: 1000,
          cursor: "pointer"
        }}
      >
        💬
      </button>

      {isOpen && (
        <div 
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "350px",
            height: "450px",
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
            overflow: "hidden"
          }}
        >
          <div style={{ backgroundColor: "#b01826", color: "white", padding: "15px", fontWeight: "bold" }}>
            🤖 AI Assistant
            <button 
              onClick={() => setIsOpen(false)} 
              style={{ float: "right", background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "16px" }}
            >
              ✖
            </button>
          </div>
          
          <div style={{ flex: 1, padding: "15px", overflowY: "auto", backgroundColor: "#f9f9f9" }}>
            {chatHistory.map((chat, index) => (
              <div key={index} style={{ textAlign: chat.sender === "user" ? "right" : "left", marginBottom: "10px" }}>
                <span 
                  style={{ 
                    display: "inline-block", 
                    padding: "8px 12px", 
                    borderRadius: "15px", 
                    backgroundColor: chat.sender === "user" ? "#0d6efd" : "#e9ecef", 
                    color: chat.sender === "user" ? "white" : "black",
                    maxWidth: "85%",
                    wordWrap: "break-word"
                  }}
                >
                  {chat.text}
                </span>
              </div>
            ))}
            {loading && <div style={{ textAlign: "left" }}><span style={{ display: "inline-block", padding: "8px", borderRadius: "15px", backgroundColor: "#e9ecef" }}>Thinking...</span></div>}
          </div>

          <form onSubmit={handleSend} style={{ display: "flex", padding: "10px", borderTop: "1px solid #ddd" }}>
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..." 
              style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #ccc", marginRight: "5px" }}
              required
            />
            <button type="submit" style={{ backgroundColor: "#b01826", color: "white", border: "none", borderRadius: "5px", padding: "8px 15px", cursor: "pointer" }}>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
