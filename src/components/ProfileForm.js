import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { updateProfile } from "firebase/auth";

const fieldStyle = {
  display: "block",
  width: "100%",
  padding: "12px 14px",
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
  marginBottom: "12px",
  fontSize: "14px",
  color: "#111",
  background: "#fff",
};

const labelStyle = { fontSize: "12px", color: "#050505", fontWeight: 700, marginBottom: "6px" };

const cardStyle = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  padding: "24px",
  maxWidth: "720px",
  margin: "24px auto",
  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
};

const ProfileForm = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, "users", userId);
        const snap = await getDoc(docRef);
        if (snap.exists() && mounted) {
          const data = snap.data();
          setName(data.name || "");
          setPhone(data.phone || "");
        }
      } catch (err) {
        console.error("Error cargando perfil:", err);
        setMessage({ type: "error", text: "Error cargando datos." });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, [userId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, { name: name || null, phone: phone || null });

      // actualizar displayName en Auth para mantener coherencia en UI
      if (auth.currentUser) {
        try {
          await updateProfile(auth.currentUser, { displayName: name || null });
        } catch (err) {
          console.warn("No se pudo actualizar displayName:", err);
        }
      }

      setMessage({ type: "success", text: "Perfil actualizado correctamente." });
    } catch (err) {
      console.error("Error guardando perfil:", err);
      setMessage({ type: "error", text: "No se pudo guardar. Intenta de nuevo." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={cardStyle}>
      <h2 style={{ color: "#050505", marginBottom: "12px" }}>Configuración de perfil</h2>

      {loading ? (
        <div style={{ color: "#888" }}>Cargando perfil...</div>
      ) : (
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: "10px" }}>
            <label style={labelStyle}>Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              style={fieldStyle}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={labelStyle}>Teléfono</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Tu teléfono"
              style={fieldStyle}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: "#050505",
                color: "#fff",
                border: "none",
                padding: "10px 16px",
                borderRadius: "6px",
                cursor: saving ? "not-allowed" : "pointer",
                fontWeight: 700,
              }}
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>

            {message && (
              <div style={{ color: message.type === "error" ? "#c62828" : "#2e7d32" }}>
                {message.text}
              </div>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfileForm;
