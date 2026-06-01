/*
 * Archivo: src/components/ProfileForm.js
 * Proposito: Formulario de perfil: permite ver y actualizar datos personales del usuario.
 * Nota: Cabecera documental; no modifica la logica del fichero.
 */

import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { updateProfile } from "firebase/auth";
import { toastError, toastSuccess } from "../services/ToastService";

const ProfileForm = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!message) return;
    if (message.type === "error") {
      toastError(message.text);
    } else {
      toastSuccess(message.text);
    }
  }, [message]);

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
      setTimeout(() => {
        window.location.reload();
      }, 250);
    } catch (err) {
      console.error("Error guardando perfil:", err);
      setMessage({ type: "error", text: "No se pudo guardar. Intenta de nuevo." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-form-card">
      <h2 className="profile-form-title">ConfiguraciÃ³n de perfil</h2>

      {loading ? (
        <div className="profile-form-loading">Cargando perfil...</div>
      ) : (
        <form noValidate onSubmit={handleSave}>
          <div className="profile-form-group">
            <label className="profile-form-label">Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="profile-form-field"
            />
          </div>

          <div className="profile-form-group">
            <label className="profile-form-label">TelÃ©fono</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Tu telÃ©fono"
              className="profile-form-field"
            />
          </div>

          <div className="profile-form-actions">
            <button
              type="submit"
              disabled={saving}
              className="profile-form-submit"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfileForm;

