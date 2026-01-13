import { useState, useEffect } from "react";
import "./Chat.css";

function Chat({ socket, playerRole }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const onNewMessage = (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    socket.on("new_message", onNewMessage);

    return () => {
      socket.off("new_message", onNewMessage);
    };
  }, [socket]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage = {
        text: message,
        sender: playerRole,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      socket.emit("chat_message", newMessage);
      setMessage("");
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender === playerRole ? "own-message" : ""}`}>
            <span className="sender">{msg.sender === playerRole ? "You" : `Opponent (${msg.sender})`}</span>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;
