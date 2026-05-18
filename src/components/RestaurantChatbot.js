import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import chatbotService from "../services/ChatbotService";
import "../styles/MinimalStyle.css";

const getWelcomeMessage = (role) => {
  if (role === "admin") {
    return "Hola. Puedo ayudarte con carta, reservas, mesas, usuarios y consultas internas del restaurante.";
  }

  return "Hola. Puedo ayudarte con la carta, alergenos, reservas, ofertas y navegacion por la web.";
};

const RestaurantChatbot = ({ user, role, userName }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: getWelcomeMessage(role),
    },
  ]);

  if (!user || !role) return null;

  const addMessage = (sender, text) => {
    setMessages((prev) => [
      ...prev,
      { id: `${sender}-${Date.now()}-${prev.length}`, sender, text },
    ]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || loading) return;

    setInput("");
    addMessage("user", message);
    setLoading(true);

    try {
      const result = await chatbotService.sendMessage({
        message,
        user,
        role,
        userName,
        locationPath: location.pathname,
        history: messages,
      });
      addMessage("bot", result.answer);
    } catch (error) {
      addMessage(
        "bot",
        error.message ||
          "Ahora mismo no puedo conectar con Gemini. Revisa la API key local y vuelve a intentarlo.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="restaurant-chatbot">
      {isOpen && (
        <section className="chatbot-panel" aria-label="Chatbot Tsinghe">
          <header className="chatbot-header">
            <div>
              <p className="chatbot-kicker">
                {role === "admin" ? "Asistente interno" : "Asistente"}
              </p>
              <h2>Tsinghe</h2>
            </div>
            <button
              type="button"
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar chatbot"
            >
              X
            </button>
          </header>

          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chatbot-message ${
                  message.sender === "user" ? "is-user" : "is-bot"
                }`}
              >
                {message.text}
              </div>
            ))}
            {loading && (
              <div className="chatbot-message is-bot">Consultando Gemini...</div>
            )}
          </div>

          <form className="chatbot-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                role === "admin"
                  ? "Reservas de hoy, mesas libres..."
                  : "Platos, alergenos, reservas..."
              }
              aria-label="Mensaje para el chatbot"
            />
            <button type="submit" disabled={loading || !input.trim()}>
              Enviar
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="chatbot-toggle"
        onClick={() => setIsOpen((value) => !value)}
        aria-label={isOpen ? "Cerrar chatbot" : "Abrir chatbot"}
      >
        Chat
      </button>
    </div>
  );
};

export default RestaurantChatbot;
