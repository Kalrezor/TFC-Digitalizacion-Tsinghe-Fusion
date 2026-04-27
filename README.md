### feat: control de disponibilidad y validación de precios

Se ha mejorado la lógica de negocio y la integridad de los datos en el panel de administración.

**Cambios principales:**

* **Gestión de Disponibilidad (Toggle)**: Implementación de la función para activar/desactivar platos sin borrarlos. Esto modifica el campo `available` en Firestore, permitiendo ocultar platos temporalmente de la vista del cliente.

* **Refuerzo en Validación de Precios**:
    * Bloqueo de valores negativos.
    * Eliminación de los controles de incremento/decremento para forzar la entrada de datos manual y precisa.
    
* **Feedback Visual de Estado**:
    * Los platos desactivados muestran una opacidad reducida y una etiqueta indicadora en el listado administrativo.
    * Botones de acción diferenciados por color (Verde/Rojo) para una gestión intuitiva de los estados.