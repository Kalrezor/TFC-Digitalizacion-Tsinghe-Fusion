### style: Pop-Up para ofertas y arreglo de carrusel tras el merge

He corregido los estilos visuales del carrusel principal que se habían desalineado hacia la izquierda tras el merge de ramas, asegurando su centrado simétrico absoluto. Además, se ha solucionado el problema de sincronización de fechas en el Home para que las promociones activas se carguen correctamente desde Firestore y, al hacer clic sobre ellas, desplieguen un pop-up optimizado que muestra la imagen completa sin recortes.

### Funcionalidades Destacadas

* **Módulo de Ofertas y Vista Dinámica (Home):**
    * Implementación de una lógica sanitizada para la validación temporal exacta de las promociones (`isEnVigor`), evitando conflictos de zonas horarias entre los strings de la base de datos y el navegador del cliente.
    * Integración de un modal interactivo (pop-up) que renderiza dinámicamente la información de la oferta seleccionada y enlaza directamente con el flujo de reservas del restaurante.

* **Sincronización de Datos con Administración:**
    * Corrección en el mapeo del catálogo de platos dentro de la vista de administración (`AdminOffers`), vinculando de forma correcta la respuesta del servicio externo (`result.data`) para asegurar la lectura completa de los nombres del menú.

* **Optimización y Estilos Adaptativos multimedia:**
    * Reestructuración geométrica de las celdas de `react-slick` en el carrusel de imágenes, combinando anchos fijos y márgenes automáticos (`margin: 0 auto`) para estabilizar su alineación horizontal manteniendo la proporción vertical original de las fotografías.
    * Configuración de escalado inteligente en la imagen del pop-up mediante `object-fit: contain` sobre un lienzo de respaldo oscuro (`#1a1a1a`), garantizando que los diseños y promociones se visualicen íntegros sin sufrir recortes ni deformaciones.



