import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export const DEFAULT_CHATBOT_SETTINGS = {
  comensal: true,
  admin: true,
};

const CHATBOT_SETTINGS_DOC = doc(db, "appSettings", "chatbot");

const normalizeSettings = (settings = {}) => ({
  ...DEFAULT_CHATBOT_SETTINGS,
  ...settings,
});

class ChatbotSettingsService {
  subscribe(callback, onError) {
    return onSnapshot(
      CHATBOT_SETTINGS_DOC,
      (snapshot) => {
        callback(
          snapshot.exists()
            ? normalizeSettings(snapshot.data())
            : DEFAULT_CHATBOT_SETTINGS,
        );
      },
      (error) => {
        console.error("Error escuchando configuracion del chatbot:", error);
        onError?.(error);
      },
    );
  }

  async saveSettings(settings) {
    await setDoc(
      CHATBOT_SETTINGS_DOC,
      {
        ...normalizeSettings(settings),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }
}

const chatbotSettingsService = new ChatbotSettingsService();
export default chatbotSettingsService;
