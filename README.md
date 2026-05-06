### refactor: arreglo del estilo visual y funcionalidad en la gestión de menu y carga de nuevas tablas de la bbdd

Se ha mejorado el estilo visual y funcionalidad agregandole las opciones de que al rellenar el formulario de agregar el plato puedas visualizar todas las categorias y puedas visualizar bien los alergenos para poder rellenar el formulario facilmente, tambien se ha modificado la tabla donde se muestra todo para que se visualicen los alergenos establecidos y las imagenes de los platos .

**Cambios principales:**

* **Consistencia Visual**: Modificación de la tabla de platos agregandole imagenes de estos y logos de los alergenos incluidos, mejora de visualización en las partes de seleccionar categorias para verlas de forma que no ocupe mucho y sea sencillo, y mejora en la visualización de los alergenos en un checklist para poder seleccionar varios.
* **Cambios BBDD**: Agregados la tabla de **allergens**, **category**, y **plate** y actualizados mejor en el codigo para que estraiga los datos de ahí.
