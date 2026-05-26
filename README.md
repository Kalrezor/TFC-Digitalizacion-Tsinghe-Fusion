### style: Sistema de imagen por defecto en la carta y optimización de tabla de gestión

Se ha integrado un sistema dinámico en el frontend para inyectar una imagen predeterminada ("No disponible") en aquellos platos que no posean una URL multimedia en la base de datos de forma nativa. Además, se ha rediseñado por completo la tabla de administración de la carta (`AdminMenu`) para eliminar el aspecto compactado de las acciones y dotar de mayor holgura y legibilidad a las etiquetas de estado.

### Funcionalidades Destacadas

* **Estrategia Fallback de Imagen Predeterminada (Platos):**
    * Inyección en el renderizado del código de una constante global multimedia (`DEFAULT_PLATE_IMAGE`) alojada en Firebase Storage para cubrir de forma reactiva aquellos platos que tengan el campo de foto vacío, nulo o indefinido.
    * Comportamiento dinámico automatizado: la imagen por defecto se despliega tanto en la cuadrícula pública de la carta como en el panel de control, desapareciendo de forma inmediata en el instante en que el administrador sube y guarda una foto real en el documento de Firestore.

* **Rediseño Estructural y Holgura en la Tabla de Gestión de Menú:**
    * Eliminación del formato comprimido en las filas de la tabla de `AdminMenu` aplicando un padding vertical expandido (`20px`) para dotar de espacio editorial y aire a cada registro del catálogo.
    * Corrección posicional en la celda de acciones estructurando los botones de "Editar" y "Eliminar" en una disposición flexible horizontal limpia (`display: flex`), evitando que los elementos se superpongan o se monten entre sí.
    * Rediseño visual de los distintivos de estado (`DISPONIBLE` / `NO DISPONIBLE`) en formato de píldora expandida con bordes específicos contrastados y tipografías semánticas legibles.