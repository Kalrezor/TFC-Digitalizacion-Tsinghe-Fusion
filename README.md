### style: Mejora visual de la carta, contenedores de platos y organizacion responsive

Se ha trabajado sobre la vista de la carta para que el menu aproveche mejor el ancho disponible de la pantalla, mejore la lectura de los platos y mantenga una presentacion mas ordenada. Tambien se han ajustado las imagenes, los alergenos, la navegacion por categorias y el boton de volver arriba para que la experiencia sea mas comoda tanto en escritorio como en movil.

### Funcionalidades Destacadas

* **Carta a ancho completo:** 
    * Se ha eliminado la sensacion de contenido comprimido en el centro, permitiendo que la carta utilice todo el ancho disponible.
    * Las secciones del menu se distribuyen con mas aire visual y una estructura mas equilibrada.
    * El titulo principal "Nuestra Carta" y el buscador se han reducido ligeramente para que no dominen tanto la primera vista.

* **Organizacion visual inteligente de platos:** 
    * La cuadricula de platos se adapta segun la cantidad de platos de cada categoria.
    * Si una categoria tiene 4 platos, se organiza visualmente en formato `2 x 2`.
    * Si hay mas platos, se distribuyen en matrices equilibradas de 2 o 3 columnas segun el espacio disponible.
    * La cuadricula queda centrada para evitar que los platos aparezcan pegados a la izquierda cuando hay pocos elementos.

* **Tarjetas de plato mas limpias y legibles:** 
    * Cada plato se muestra dentro de una tarjeta blanca con contraste suave respecto al fondo.
    * Se han sustituido los bordes negros duros por bordes claros, esquinas redondeadas y una sombra ligera.
    * Se ha añadido separacion entre tarjetas para mejorar la lectura y evitar que la carta parezca una tabla compacta.
    * El contenido de cada tarjeta se ha reorganizado para que entren correctamente la imagen, el nombre, el precio y los iconos de alergenos sin cortes.

* **Imagenes cuadradas sin deformacion:** 
    * Las imagenes de los platos se presentan en recuadros cuadrados uniformes.
    * Se usa `object-fit: contain` para que las fotos no se corten ni se deformen.
    * El sistema mantiene una caja visual estable aunque las imagenes originales tengan proporciones distintas.

* **Filtro de alergenos en una sola fila:** 
    * Los alergenos se han ajustado para ocupar el ancho completo de la pantalla.
    * Se muestran en una fila continua, evitando saltos innecesarios a dos lineas.
    * Se ha eliminado la barra visible de desplazamiento horizontal para conservar una apariencia mas limpia.

* **Boton circular para volver arriba:** 
    * Se ha añadido un boton flotante con flecha hacia arriba para volver directamente al inicio de la carta.
    * El boton se ha colocado alineado visualmente con el chatbot, pero claramente por encima para que no se solapen.
    * La accion usa desplazamiento suave hasta el inicio real de la carta.

* **Cabecera de gestion estructural ajustada:** 
    * La barra de administracion "Gestionar estructura" deja de quedarse fija encima del contenido.
    * Ahora permanece en su sitio dentro del flujo normal de la pagina, evitando que tape el menu mientras se navega.
