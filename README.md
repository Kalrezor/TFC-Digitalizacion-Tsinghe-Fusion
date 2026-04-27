### feat: login y registro funcionales con Firebase

He integrado la lógica necesaria para que el inicio de sesión y la creación de cuentas funcionen de forma real, conectando la aplicación con los servicios de autenticación y base de datos.

**Cambios principales:**

* **Conexión con Firebase**: Implementación del sistema de autenticación que permite a los usuarios registrarse e iniciar sesión de manera segura.
* **Registro de Usuarios**: Al crear una cuenta, el sistema guarda automáticamente la información en la base de datos (Firestore) asignando por defecto el rol de "comensal" y activando su perfil.
* **Flexibilidad de Acceso**: Se han simplificado los requisitos de los formularios para permitir un acceso rápido, validando únicamente el formato de correo electrónico y una longitud mínima de contraseña.
* **Experiencia de Usuario**: El formulario permite alternar dinámicamente entre el modo de acceso y el de registro, ofreciendo una navegación más fluida y sencilla.