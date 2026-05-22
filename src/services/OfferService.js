// Modelo: OfferService.js
// Servicio para gestionar ofertas en Firestore.
// Incluye CRUD completo para ofertas con operaciones admin-only para escritura.

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

class OfferService {
  // Obtener todas las ofertas (lectura p�blica)
  async getAllOffers() {
    try {
      const querySnapshot = await getDocs(collection(db, "offers"));
      const offers = [];
      querySnapshot.forEach((doc) => {
        offers.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, offers };
    } catch (error) {
      console.error("Error obteniendo ofertas:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener ofertas activas (lectura p�blica)
  async getActiveOffers() {
    try {
      const querySnapshot = await getDocs(collection(db, "offers"));
      const offers = [];
      const now = new Date();
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const startDate = data.startDate?.toDate?.() || new Date(data.startDate);
        const endDate = data.endDate?.toDate?.() || new Date(data.endDate);
        if (data.active && startDate <= now && now <= endDate) {
          offers.push({ id: doc.id, ...data });
        }
      });
      return { success: true, offers };
    } catch (error) {
      console.error("Error obteniendo ofertas activas:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener una oferta por ID (lectura p�blica)
  async getOfferById(id) {
    try {
      const docSnap = await getDoc(doc(db, "offers", id));
      if (docSnap.exists()) {
        return { success: true, offer: { id: docSnap.id, ...docSnap.data() } };
      } else {
        return { success: false, error: "Oferta no encontrada" };
      }
    } catch (error) {
      console.error("Error obteniendo oferta:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener ofertas por tipo/categor�a (lectura p�blica)
  async getOffersByType(type) {
    try {
      const querySnapshot = await getDocs(collection(db, "offers"));
      const offers = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.type === type) {
          offers.push({ id: doc.id, ...data });
        }
      });
      return { success: true, offers };
    } catch (error) {
      console.error("Error obteniendo ofertas por tipo:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener ofertas por rango de precio (lectura p�blica)
  async getOffersByPriceRange(minPrice, maxPrice) {
    try {
      const querySnapshot = await getDocs(collection(db, "offers"));
      const offers = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.discount >= minPrice && data.discount <= maxPrice) {
          offers.push({ id: doc.id, ...data });
        }
      });
      return { success: true, offers };
    } catch (error) {
      console.error("Error obteniendo ofertas por rango:", error);
      return { success: false, error: error.message };
    }
  }

  // Crear una nueva oferta (admin-only)
  async createOffer(offerData, isAdmin = false) {
    try {
      if (!isAdmin) {
        return { success: false, error: "Solo administradores pueden crear ofertas" };
      }
      const docRef = await addDoc(collection(db, "offers"), {
        ...offerData,
        createdAt: new Date(),
        active: true,
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error creando oferta:", error);
      return { success: false, error: error.message };
    }
  }

  // Actualizar una oferta (admin-only)
  async updateOffer(id, offerData, isAdmin = false) {
    try {
      if (!isAdmin) {
        return { success: false, error: "Solo administradores pueden actualizar ofertas" };
      }
      await updateDoc(doc(db, "offers", id), {
        ...offerData,
        updatedAt: new Date(),
      });
      return { success: true };
    } catch (error) {
      console.error("Error actualizando oferta:", error);
      return { success: false, error: error.message };
    }
  }

  // Eliminar una oferta (admin-only)
  async deleteOffer(id, isAdmin = false) {
    try {
      if (!isAdmin) {
        return { success: false, error: "Solo administradores pueden eliminar ofertas" };
      }
      await deleteDoc(doc(db, "offers", id));
      return { success: true };
    } catch (error) {
      console.error("Error eliminando oferta:", error);
      return { success: false, error: error.message };
    }
  }

  // Activar/Desactivar una oferta (admin-only)
  async toggleOfferStatus(id, active, isAdmin = false) {
    try {
      if (!isAdmin) {
        return { success: false, error: "Solo administradores pueden cambiar el estado de ofertas" };
      }
      await updateDoc(doc(db, "offers", id), { active });
      return { success: true };
    } catch (error) {
      console.error("Error actualizando estado de oferta:", error);
      return { success: false, error: error.message };
    }
  }

  // Aplicar descuento a una oferta (admin-only)
  async applyDiscount(id, discountPercentage, isAdmin = false) {
    try {
      if (!isAdmin) {
        return { success: false, error: "Solo administradores pueden aplicar descuentos" };
      }
      if (discountPercentage < 0 || discountPercentage > 100) {
        return { success: false, error: "El descuento debe estar entre 0 y 100" };
      }
      await updateDoc(doc(db, "offers", id), {
        discount: discountPercentage,
        updatedAt: new Date(),
      });
      return { success: true };
    } catch (error) {
      console.error("Error aplicando descuento:", error);
      return { success: false, error: error.message };
    }
  }

  // Extender fecha de oferta (admin-only)
  async extendOfferDate(id, newEndDate, isAdmin = false) {
    try {
      if (!isAdmin) {
        return { success: false, error: "Solo administradores pueden extender ofertas" };
      }
      await updateDoc(doc(db, "offers", id), {
        endDate: newEndDate,
        updatedAt: new Date(),
      });
      return { success: true };
    } catch (error) {
      console.error("Error extendiendo oferta:", error);
      return { success: false, error: error.message };
    }
  }
}

const offerService = new OfferService();
export default offerService;
