/*
 * Archivo: src/services/AuthService.js
 * Proposito: Servicio de autenticacion: login, registro, logout, Google, roles y datos de usuario en Firebase.
 * Nota: Cabecera documental; no modifica la logica del fichero.
 */

// Modelo: AuthService.js
// Este archivo contiene la lÃ³gica de negocio para la autenticaciÃ³n usando Firebase Auth.
// Maneja el login de usuarios, incluyendo soporte para autenticaciÃ³n de doble factor (MFA).
// Ahora extendido para incluir Firestore y gestiÃ³n de roles de usuario.

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updatePassword,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";

class AuthService {
  // MÃ©todo auxiliar para generar token de 3 caracteres
  generateToken() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let token = "";
    for (let i = 0; i < 3; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }
  // MÃ©todo para login con email y contraseÃ±a
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
      // Si el usuario no tiene contraseÃ±a pero existe con Google
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-credential"
      ) {
        return {
          success: false,
          errorCode: error.code,
          error: "Usuario no encontrado. Â¿Quieres registrarte ahora?",
          suggestion: "provider",
        };
      }
      if (error.code === "auth/wrong-password") {
        return {
          success: false,
          errorCode: error.code,
          error: "ContraseÃ±a incorrecta.",
          suggestion: "password",
        };
      }
      if (error.code === "auth/invalid-email") {
        return {
          success: false,
          errorCode: error.code,
          error: "El email no es vÃ¡lido. RevÃ­salo e intenta de nuevo.",
          suggestion: "email",
        };
      }
      if (error.code === "auth/user-disabled") {
        return {
          success: false,
          errorCode: error.code,
          error: "Tu cuenta estÃ¡ deshabilitada. Contacta con soporte.",
        };
      }
      if (error.code === "auth/too-many-requests") {
        return {
          success: false,
          errorCode: error.code,
          error: "Has intentado iniciar sesiÃ³n demasiadas veces. Intenta de nuevo mÃ¡s tarde.",
        };
      }
      console.error("Error en login:", error);
      return { success: false, error: "Error al iniciar sesiÃ³n. Revisa tus datos y vuelve a intentarlo." };
    }
  }

  // MÃ©todo para registro con email y contraseÃ±a
  async registerWithEmail(email, password, name, phone) {
    try {
      // Validar que name no estÃ© vacÃ­o
      if (!name || name.trim() === "") {
        throw new Error("El nombre es requerido para el registro");
      }

      // Validar telÃ©fono
      if (!phone || phone.trim() === "") {
        throw new Error("El nÃºmero de telÃ©fono es requerido para el registro");
      }

      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // 2. Verificar si ya existe documento en Firestore (creado por admin)
      // Si existe, actualizar; si no, crear nuevo
      const userDocRef = doc(db, "users", user.uid);
      const existingDoc = await getDoc(userDocRef);

      if (existingDoc.exists()) {
        // El usuario ya existÃ­a (creado por admin), actualizar como verificado
        await updateDoc(userDocRef, {
          name: name.trim(),
          phone: phone.trim(),
          status: "active",
          emailVerified: true, // El usuario verificÃ³ su correo
          role: existingDoc.data().role || "comensal", // Mantener rol original
        });
      } else {
        // Nuevo usuario, crear documento
        const userData = {
          email: user.email,
          name: name.trim(),
          phone: phone.trim(),
          role: "comensal",
          status: "active",
          createdAt: serverTimestamp(),
          emailVerified: true, // Usuario verificado al registrarse personalmente
        };
        await setDoc(userDocRef, userData);
      }

      // Enviar email de bienvenida
      await this.sendWelcomeEmail(user.email, user.displayName || name);

      return { success: true, user };
    } catch (error) {
      console.error("âŒ Error en registro:", error.code, error.message);

      // Manejar errores especÃ­ficos de Firebase
      if (error.code === "auth/email-already-in-use") {
        return {
          success: false,
          errorCode: error.code,
          error: "Este email ya estÃ¡ registrado. Â¿Quieres iniciar sesiÃ³n?",
          suggestion: "login",
        };
      }
      if (error.code === "auth/weak-password") {
        return {
          success: false,
          errorCode: error.code,
          error: "La contraseÃ±a es demasiado dÃ©bil. Usa al menos 6 caracteres.",
          suggestion: "password",
        };
      }
      if (error.code === "auth/invalid-email") {
        return {
          success: false,
          errorCode: error.code,
          error: "El email no es vÃ¡lido.",
          suggestion: "email",
        };
      }

      return { success: false, error: error.message };
    }
  }

  // MÃ©todo para logout
  async logout() {
    try {
      await auth.signOut();
      return { success: true };
    } catch (error) {
      console.error("Error en logout:", error);
      return { success: false, error: error.message };
    }
  }

  // MÃ©todo para obtener el usuario actual
  getCurrentUser() {
    return auth.currentUser;
  }

  // Nuevo: MÃ©todo para obtener el rol del usuario desde Firestore
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

  // Nuevo: MÃ©todo para obtener documento del usuario
  async getUserDoc(uid) {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error("Error obteniendo documento del usuario:", error);
      return null;
    }
  }

  // Nuevo: MÃ©todo para completar perfil (telÃ©fono y contraseÃ±a opcional)
  async completeProfile(phone, password = null) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: "Usuario no autenticado" };
      }

      const userDocRef = doc(db, "users", currentUser.uid);
      const updateData = {
        phone: phone.trim(),
        profileCompleted: true,
      };

      if (password) {
        await updatePassword(currentUser, password);
        updateData.passwordConfigured = true;
      }

      await updateDoc(userDocRef, updateData);

      return { success: true };
    } catch (error) {
      console.error("Error completando perfil:", error);
      return { success: false, error: error.message };
    }
  }

  // MÃ©todo para login con Google
  async loginWithGoogle() {
    try {
      const googleProvider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // Verificar si el usuario existe en Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      let isNewUser = false;

      if (!userDoc.exists()) {
        isNewUser = true;
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

      // Verificar si el usuario ya configurÃ³ su contraseÃ±a
      const passwordConfigured = userDoc.exists()
        ? userDoc.data().passwordConfigured
        : false;

      // Requerir contraseÃ±a solo si es nuevo usuario
      // o si es un usuario existente que aÃºn no ha configurado contraseÃ±a
      const requiresPassword = isNewUser || !passwordConfigured;

      return {
        success: true,
        user,
        isNewUser,
        requiresPassword,
        passwordConfigured,
      };
    } catch (error) {
      console.error("Error en login con Google:", error);

      if (error?.code === "auth/popup-closed-by-user") {
        return {
          success: false,
          error: "Inicio de sesiÃ³n cancelado. Si quieres, vuelve a intentarlo.",
          canceledByUser: true,
        };
      }

      if (error?.code === "auth/popup-blocked") {
        return {
          success: false,
          error: "El navegador bloqueÃ³ la ventana de Google. Comprueba la configuraciÃ³n de popups e intÃ©ntalo de nuevo.",
        };
      }

      if (error?.code === "auth/cancelled-popup-request") {
        return {
          success: false,
          error: "Ya hay un intento de inicio de sesiÃ³n en curso. Por favor, intÃ©ntalo de nuevo.",
        };
      }

      return { success: false, error: error.message || "Error al iniciar sesiÃ³n con Google." };
    }
  }

  // MÃ©todo para enviar email de bienvenida
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
      // No fallar el registro si el email no se envÃ­a
    }
  }

  // MÃ©todo para solicitar reset de contraseÃ±a con token
  async requestPasswordReset(email) {
    try {
      // Generar token
      const token = this.generateToken();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Expira en 15 minutos

      // Enviar email con token
      const response = await fetch(
        "https://us-central1-digitalizacion-tsinge-fusion.cloudfunctions.net/sendPasswordResetEmail",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            token: token.toUpperCase(),
          }),
        },
      );

      if (!response.ok) {
        console.error("Error enviando email de reset:", response.statusText);
        return {
          success: false,
          error: "Error al enviar el email de recuperaciÃ³n",
        };
      }

      // Guardar token en Firestore en una colecciÃ³n temporal
      await setDoc(doc(db, "passwordResets", email), {
        token: token,
        expiresAt: expiresAt,
        email: email,
      });

      return {
        success: true,
        message: `Token enviado a ${email}. Expira en 15 minutos.`,
      };
    } catch (error) {
      console.error("âŒ Error en reset de contraseÃ±a:", error.message);
      return { success: false, error: error.message };
    }
  }

  // MÃ©todo para validar token y resetear contraseÃ±a
  async resetPasswordWithToken(email, token, newPassword) {
    try {
      // La Cloud Function valida el token y cambia la contraseÃ±a con Admin SDK.
      const response = await fetch(
        "https://us-central1-digitalizacion-tsinge-fusion.cloudfunctions.net/resetPasswordWithToken",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            newPassword: newPassword,
            token: token.toUpperCase(),
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error(
          "Error reseteando contraseÃ±a:",
          errorData || response.statusText,
        );
        return {
          success: false,
          error: errorData?.error || "Error al resetear la contraseÃ±a",
        };
      }

      const data = await response.json().catch(() => ({}));

      // El Cloud Function se encarga de eliminar el documento de reset
      // No necesitamos eliminarlo desde el cliente

      return {
        success: true,
        message: data.message || "ContraseÃ±a actualizada exitosamente",
      };
    } catch (error) {
      console.error("âŒ Error validando token:", error.message);
      return { success: false, error: error.message };
    }
  }

  // MÃ©todo para que usuarios con Google agreguen una contraseÃ±a (para poder entrar con email/password)
  async addPasswordToGoogleUser(password) {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: "No hay usuario autenticado" };
      }

      // Usar updatePassword de Firebase Auth
      await updatePassword(user, password);

      // Marcar en Firestore que el usuario ya configurÃ³ su contraseÃ±a
      await setDoc(
        doc(db, "users", user.uid),
        { passwordConfigured: true },
        { merge: true },
      );

      return { success: true, message: "ContraseÃ±a creada exitosamente" };
    } catch (error) {
      console.error("âŒ Error agregando contraseÃ±a:", error.message);

      if (error.code === "auth/weak-password") {
        return {
          success: false,
          error: "La contraseÃ±a es demasiado dÃ©bil. Usa al menos 6 caracteres.",
        };
      }
      if (error.code === "auth/requires-recent-login") {
        return {
          success: false,
          error:
            "Necesitas iniciar sesiÃ³n nuevamente para cambiar la contraseÃ±a",
        };
      }

      return { success: false, error: error.message };
    }
  }
}

const authService = new AuthService();
export default authService;

