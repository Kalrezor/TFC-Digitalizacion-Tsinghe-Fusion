### feat: agregado la disponibilidad de los platos en la gestión de menu y en la tabla 'plate' de la bbdd

Se ha agregado la opción de que el administrador pueda marcar si el plato esta disponible o no lo esta tambien se ha modificado en la base de datos para que en la tabla 'plate' esté actualizado al nuevo parametro y se ha integrado en los platos antiguos. 

**Cambios principales:**

* **Consistencia Visual**: Agregada la checklist para marcar si el plato esta disponible o no lo esta, tambien se a agregado la visualización de esto en la tabla de visualización de platos.
* **Cambios BBDD**: Agregado a la tabla **plate** el atributo boleano **disponible** para marcar si el plato está o no está.
