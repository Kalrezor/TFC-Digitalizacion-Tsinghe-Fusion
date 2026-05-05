// Modelo: AuthService.js
// Este archivo contiene la lógica de negocio para la autenticación usando Firebase Auth.
// Maneja el login de usuarios, incluyendo soporte para autenticación de doble factor (MFA).
// Ahora extendido para incluir Firestore y gestión de roles de usuario.

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  confirmPasswordReset,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

class AuthService {
  // Método para login con email y contraseña
  async loginWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      return { success: true, user };
    } catch (error) {
      // Si el usuario no tiene contraseña pero existe con Google
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-credential"
      ) {
        return {
          success: false,
          errorCode: error.code,
          error: "Usuario no encontrado. ¿Quieres registrarte ahora?",
          suggestion: "provider",
        };
      }
      if (error.code === "auth/wrong-password") {
        return {
          success: false,
          errorCode: error.code,
          error: "Contraseña incorrecta",
          suggestion: "password",
        };
      }
      console.error("Error en login:", error);
      return { success: false, error: error.message };
    }
  }

  // Método para registro con email y contraseña
  async registerWithEmail(email, password, name) {
    try {
      console.log("🔐 Iniciando registro con email:", email);

      // Validar que name no esté vacío
      if (!name || name.trim() === "") {
        throw new Error("El nombre es requerido para el registro");
      }

      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      console.log("✅ Usuario creado en Auth:", user.uid);

      // 2. Crear documento en Firestore
      const userData = {
        email: user.email,
        name: name.trim(),
        role: "comensal",
        status: "active",
        createdAt: serverTimestamp(),
      };

      console.log("📝 Creando documento en Firestore:", userData);
      await setDoc(doc(db, "users", user.uid), userData);
      console.log("✅ Documento creado exitosamente en Firestore");

      return { success: true, user };
    } catch (error) {
      console.error("❌ Error en registro:", error.message);
      return { success: false, error: error.message };
    }
  }

  // Método para logout
  async logout() {
    try {
      await auth.signOut();
      return { success: true };
    } catch (error) {
      console.error("Error en logout:", error);
      return { success: false, error: error.message };
    }
  }

  // Método para obtener el usuario actual
  getCurrentUser() {
    return auth.currentUser;
  }

  // Nuevo: Método para obtener el rol del usuario desde Firestore
  async getUserRole(uid) {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        return userDoc.data().role; // 'admin' o 'comensal'
      } else {
        // Si no existe, crear con valores por defecto
        const currentUser = auth.currentUser;
        await setDoc(doc(db, "users", uid), {
          email: currentUser.email,
          name: currentUser.displayName || "Usuario",
          role: "comensal",
          status: "active",
          createdAt: serverTimestamp(),
        });
        return "comensal";
      }
    } catch (error) {
      console.error("Error obteniendo rol de usuario:", error);
      return "comensal"; // Fallback
    }
  }

  // Nuevo: Método para actualizar el rol del usuario (solo para admin)
  async updateUserRole(uid, newRole) {
    try {
      await setDoc(doc(db, "users", uid), { role: newRole }, { merge: true });
      return { success: true };
    } catch (error) {
      console.error("Error actualizando rol:", error);
      return { success: false, error: error.message };
    }
  }

  // Método para login con Google
  async loginWithGoogle() {
    try {
      const googleProvider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // Verificar si el usuario existe en Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        // Crear documento del usuario con rol 'comensal' por defecto
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          name: user.displayName,
          role: "comensal",
          status: "active",
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
        });

        // Enviar email de bienvenida
        await this.sendWelcomeEmail(user.email, user.displayName);
      }

      return { success: true, user };
    } catch (error) {
      console.error("Error en login con Google:", error);
      return { success: false, error: error.message };
    }
  }

  // Método para enviar email de bienvenida
  async sendWelcomeEmail(email, displayName) {
    try {
      const response = await fetch(
        "https://us-central1-digitalizacion-tsinge-fusion.cloudfunctions.net/sendWelcomeEmail",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            displayName: displayName,
          }),
        },
      );

      if (!response.ok) {
        console.error("Error enviando email:", response.statusText);
      }
    } catch (error) {
      console.error("Error enviando email:", error);
      // No fallar el registro si el email no se envía
    }
  }
}

const authService = new AuthService();
export default authService;
