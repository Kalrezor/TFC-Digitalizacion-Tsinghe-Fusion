### style: Pop-Up para los platos y arreglo de imagenes

He agregado para que se puedan abrir cada plato pinchandole y que se vea al estilo pop-up, le he agregado para moverse de un lado a otro pasando ordenadamente por los platos y he estado tocando un poco el estilo de las imagenes de los platos para intentar igualarlas lo maximo posible

### Funcionalidades Destacadas

* **Ventana Emergente (Pop-up) de Plato:** * Se ha diseñado un modal interactivo que se despliega al hacer clic en cualquier plato disponible de la carta.
    * Este pop-up centraliza los detalles extendidos del plato, mostrando de manera limpia la descripción completa y un desglose visual con los nombres e iconos de sus alérgenos específicos.

* **Navegación Secuencial Integrada:** * Se han acoplado flechas de dirección (`◀` y `▶`) directamente en los laterales exteriores del recuadro del pop-up.
    * Estas flechas permiten al usuario navegar de forma fluida e intuitiva entre los platos de la carta sin necesidad de cerrar y abrir la ventana constantemente. El orden de navegación respeta estrictamente la estructura secuencial de las categorías y los filtros de búsqueda activos.
    * Cuentan con un efecto visual interactivo (*hover*) en tono gris minimalista para mejorar la experiencia de usuario.

* **Optimización y Centrado Perfecto de Imágenes:** * Se ha implementado una arquitectura de cajas simétricas con tamaños fijos absolutos para las celdas de las imágenes en las tarjetas de la cuadrícula.
    * Se configuró un escalado inteligente mediante propiedades avanzadas de CSS (`object-fit: contain`, `max-width`, `max-height` y anchos automáticos) tanto en la cuadrícula como en el pop-up. 
    * Esto garantiza que, independientemente del tamaño o la proporción original de la foto (ya sean rectangulares, apaisadas o verticales), el contenido del plato nunca se corte ni se deforme, manteniéndose milimétricamente centrado sobre un lienzo de fondo limpio.