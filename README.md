### feat: agregada la visualización y gestión de los platos para el admin

He hecho la parte tanto visual como tecnica iniciar para la gestión de platos por parte del admin, ahora este tiene un panel donde visualiza los platos que hay en la base de datos y tiene la opción de eliminarlos. Tambien puede registrar nuevos platos desde esa ventana.

**Cambios principales:**

* **Gestión de Menú**:
    * Implementación de una interfaz de doble columna: listado dinámico a la izquierda y panel de creación a la derecha.
    * Sincronización en tiempo real con la colección `menus` de Firestore mediante `onSnapshot`.

* **Sistema de Alérgenos Visual**:
    * Creación de una arquitectura de datos donde los platos se vinculan a alérgenos mediante IDs (1-14).
    * Selector visual en el formulario mediante una cuadrícula de iconos interactivos.
    * Visualización de iconos de alérgenos en cada tarjeta de la lista de platos actuales.

* **Integración con Firebase Storage**:
    * Sustitución de entradas de texto por un **botón de carga de archivos**.
    * Flujo de subida automatizado: el sistema sube la imagen al Storage, genera la URL de descarga y la vincula al documento de Firestore.

* **Seguridad y Reglas (RBAC)**:
    * Actualización de las **Security Rules** en Firestore para proteger las colecciones `menus` y `allergen`, permitiendo escritura solo a usuarios con rol `admin`.
    * Configuración de reglas de **Storage** para permitir la lectura pública de imágenes y restringir la subida a personal autorizado.
