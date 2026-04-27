### feat: control de acceso por roles y navegación inteligente

He implementado un sistema robusto de permisos y navegación condicional que personaliza la experiencia del usuario según su perfil (visitante, comensal o administrador).

**Cambios principales:**

* **Control de Roles (Firestore)**: Integración completa con la base de datos para identificar el rol del usuario (`comensal` o `admin`) en tiempo real al iniciar sesión.
* **Navegación Condicional**: 
    * **Visitantes**: Pueden visualizar "Inicio", "La Carta", "Nosotros" y el formulario de "Login".
    * **Comensales**: Tienen acceso a "Inicio", "La Carta" y "Reservar". Se ocultan las secciones informativas de visitantes.
    * **Administradores**: Interfaz exclusiva de gestión. Se eliminan las secciones públicas ("Inicio" y "La Carta") y se habilitan el "Panel de Control", "Gestión de Menú" y "Gestión de Reservas".

* **Lógica de Redirección Automática**:
    * Al iniciar sesión como administrador, el sistema redirige directamente al **Panel de Control**.
    * Al cerrar sesión, el sistema limpia el estado y devuelve automáticamente al usuario a la vista de **Inicio**.

* **Seguridad y Estabilidad**:
    * Implementación de un estado de carga (`loading`) para evitar parpadeos visuales mientras Firebase verifica la identidad.
    * Refuerzo de las condiciones de renderizado en `App.jsx` para impedir el acceso accidental a vistas que no corresponden al rol activo.
    
* **Vistas de Gestión (Placeholders)**: Creación de los componentes base para el Panel de Administración y la Gestión del Menú, permitiendo verificar el flujo de trabajo completo.