// Modelo: AuthService.js
// Este archivo contiene la lógica de negocio para la autenticación usando Firebase Auth.
// Maneja el login de usuarios, incluyendo soporte para autenticación de doble factor (MFA).
// Ahora extendido para incluir Firestore y gestión de roles de usuario.

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
  // Método auxiliar para generar token de 3 caracteres
  generateToken() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let token = "";
    for (let i = 0; i < 3; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }
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
  async registerWithEmail(email, password, name, phone) {
    try {
      console.log("🔐 Iniciando registro con email:", email);

      // Validar que name no esté vacío
      if (!name || name.trim() === "") {
        throw new Error("El nombre es requerido para el registro");
      }

      // Validar teléfono
      if (!phone || phone.trim() === "") {
        throw new Error("El número de teléfono es requerido para el registro");
      }

      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      console.log("✅ Usuario creado en Auth:", user.uid);

      // 2. Verificar si ya existe documento en Firestore (creado por admin)
      // Si existe, actualizar; si no, crear nuevo
      const userDocRef = doc(db, "users", user.uid);
      const existingDoc = await getDoc(userDocRef);

      if (existingDoc.exists()) {
        // El usuario ya existía (creado por admin), actualizar como verificado
        console.log("📝 Actualizando documento existente en Firestore");
        await updateDoc(userDocRef, {
          name: name.trim(),
          phone: phone.trim(),
          status: "active",
          emailVerified: true, // El usuario verificó su correo
          role: existingDoc.data().role || "comensal", // Mantener rol original
        });
      } else {
        // Nuevo usuario, crear documento
        console.log("📝 Creando nuevo documento en Firestore");
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

      console.log("✅ Documento guardado exitosamente en Firestore");

      // Enviar email de bienvenida
      await this.sendWelcomeEmail(user.email, user.displayName || name);

      return { success: true, user };
    } catch (error) {
      console.error("❌ Error en registro:", error.code, error.message);

      // Manejar errores específicos de Firebase
      if (error.code === "auth/email-already-in-use") {
        return {
          success: false,
          errorCode: error.code,
          error: "Este email ya está registrado. ¿Quieres iniciar sesión?",
          suggestion: "login",
        };
      }
      if (error.code === "auth/weak-password") {
        return {
          success: false,
          errorCode: error.code,
          error: "La contraseña es demasiado débil. Usa al menos 6 caracteres.",
          suggestion: "password",
        };
      }
      if (error.code === "auth/invalid-email") {
        return {
          success: false,
          errorCode: error.code,
          error: "El email no es válido.",
          suggestion: "email",
        };
      }

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

  // Nuevo: Método para obtener documento del usuario
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

  // Nuevo: Método para completar perfil (teléfono y contraseña opcional)
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

  // Método para login con Google
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

      // Verificar si el usuario ya configuró su contraseña
      const passwordConfigured = userDoc.exists()
        ? userDoc.data().passwordConfigured
        : false;

      // Requerir contraseña solo si es nuevo usuario
      // o si es un usuario existente que aún no ha configurado contraseña
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

  // Método para solicitar reset de contraseña con token
  async requestPasswordReset(email) {
    try {
      console.log("🔐 Solicitando reset de contraseña para:", email);

      // Generar token
      const token = this.generateToken();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Expira en 15 minutos

      console.log("📧 Enviando email con token...");

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
          error: "Error al enviar el email de recuperación",
        };
      }

      // Guardar token en Firestore en una colección temporal
      await setDoc(doc(db, "passwordResets", email), {
        token: token,
        expiresAt: expiresAt,
        email: email,
      });

      console.log("✅ Email de reset enviado exitosamente");
      return {
        success: true,
        message: `Token enviado a ${email}. Expira en 15 minutos.`,
      };
    } catch (error) {
      console.error("❌ Error en reset de contraseña:", error.message);
      return { success: false, error: error.message };
    }
  }

  // Método para validar token y resetear contraseña
  async resetPasswordWithToken(email, token, newPassword) {
    try {
      console.log("🔐 Validando token para:", email);

      // La Cloud Function valida el token y cambia la contraseña con Admin SDK.
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
        console.error("Error reseteando contraseña:", response.statusText);
        return { success: false, error: "Error al resetear la contraseña" };
      }

      // El Cloud Function se encarga de eliminar el documento de reset
      // No necesitamos eliminarlo desde el cliente

      console.log("✅ Contraseña reseteada exitosamente");
      return { success: true, message: "Contraseña actualizada exitosamente" };
    } catch (error) {
      console.error("❌ Error validando token:", error.message);
      return { success: false, error: error.message };
    }
  }

  // Método para que usuarios con Google agreguen una contraseña (para poder entrar con email/password)
  async addPasswordToGoogleUser(password) {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: "No hay usuario autenticado" };
      }

      console.log("🔐 Agregando contraseña al usuario de Google:", user.email);

      // Usar updatePassword de Firebase Auth
      await updatePassword(user, password);
      console.log("✅ Contraseña agregada exitosamente");

      // Marcar en Firestore que el usuario ya configuró su contraseña
      await setDoc(
        doc(db, "users", user.uid),
        { passwordConfigured: true },
        { merge: true },
      );
      console.log("✅ Contraseña marcada como configurada en Firestore");

      return { success: true, message: "Contraseña creada exitosamente" };
    } catch (error) {
      console.error("❌ Error agregando contraseña:", error.message);

      if (error.code === "auth/weak-password") {
        return {
          success: false,
          error: "La contraseña es demasiado débil. Usa al menos 6 caracteres.",
        };
      }
      if (error.code === "auth/requires-recent-login") {
        return {
          success: false,
          error:
            "Necesitas iniciar sesión nuevamente para cambiar la contraseña",
        };
      }

      return { success: false, error: error.message };
    }
  }
}

const authService = new AuthService();
export default authService;
