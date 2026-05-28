### style: arreglo de estilos en el footer y en el carrusel 

Se han realizado los siguientes ajustes visuales en la página principal:

* **Footer centrado en Home:**
  * El texto del footer de la página de inicio ahora está alineado al centro.

* **Carrusel con altura mayor y uniforme:**
  * Se elevó la altura del carrusel para que el bloque sea más alto y más visible.
  * El contenedor interno del carrusel ahora tiene una altura fija mayor para mantener consistencia en todas las diapositivas.

* **Estirado selectivo de imágenes cortas:**
  * Las imágenes del carrusel que resultan más bajas se detectan por su altura real.
  * Solo esas imágenes más cortas se estiran para igualar la altura del carrusel.
  * El resto de las imágenes conserva el estilo original con `object-fit: cover`.

* **Umbral de altura aumentado:**
  * El criterio para considerar una imagen como “corta” se ajustó a una altura mayor, permitiendo estirar un poco más las imágenes más bajas.
