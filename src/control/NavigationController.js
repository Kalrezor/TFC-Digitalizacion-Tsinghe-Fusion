import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export function useNavigation() {
  const [seccion, setSeccion] = useState('inicio');
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState('visitante');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userRole = docSnap.data().role;
            setRol(userRole);
            
            if (userRole === 'admin') {
              setSeccion('admin_panel');
            }
          } else {
            setRol('comensal');
          }
        } catch (error) {
          console.error("Error al obtener el rol:", error);
          setRol('comensal');
        }
      } else {
        setUser(null);
        setRol('visitante');
        setSeccion('inicio');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const navegarA = (nuevaSeccion) => {
    setSeccion(nuevaSeccion);
  };

  return { seccion, navegarA, rol, user, loading };
}