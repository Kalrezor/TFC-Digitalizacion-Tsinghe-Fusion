# Manual de Usuario - Tsinghe Fusion

## 1. Objetivo del manual

Este manual sirve como guía de uso de la aplicación web de Tsinghe Fusion. Está organizado como un árbol de decisiones para que cada usuario pueda encontrar rápidamente qué hacer según su necesidad.

La aplicación permite:

- Consultar la página de inicio.
- Ver la carta del restaurante.
- Registrarse e iniciar sesión.
- Crear y consultar reservas como comensal.
- Gestionar menú, mesas, ofertas y reservas como administrador.
- Usar herramientas auxiliares como el chatbot y el cálculo para dividir cuenta.

## 2. Árbol general de acceso

```text
Inicio de la aplicación
|
+-- ¿El usuario tiene cuenta?
|   |
|   +-- No
|   |   |
|   |   +-- Puede ver Inicio
|   |   +-- Puede ver Menú
|   |   +-- Si quiere reservar -> debe registrarse o iniciar sesión
|   |
|   +-- Sí
|       |
|       +-- Inicia sesión
|           |
|           +-- ¿Rol comensal?
|           |   |
|           |   +-- Accede a panel de comensal
|           |   +-- Gestiona perfil
|           |   +-- Consulta menú
|           |   +-- Crea y revisa reservas
|           |   +-- Usa dividir cuenta
|           |   +-- Usa chatbot
|           |
|           +-- ¿Rol administrador?
|               |
|               +-- Accede a panel de administración
|               +-- Gestiona menú
|               +-- Gestiona mesas
|               +-- Gestiona ofertas
|               +-- Gestiona todas las reservas
|               +-- Asigna mesas a reservas
|               +-- Usa dividir cuenta
|               +-- Usa chatbot
```

## 3. Usuario no autenticado

```text
Usuario entra en la web
|
+-- ¿Qué quiere hacer?
    |
    +-- Ver información general
    |   |
    |   +-- Ir a Inicio
    |   +-- Revisar contenido principal del restaurante
    |
    +-- Consultar la carta
    |   |
    |   +-- Ir a Menú
    |   +-- Buscar plato por nombre
    |   +-- Filtrar platos excluyendo alérgenos
    |   +-- Abrir un plato para ver detalle, precio, descripción y alérgenos
    |   +-- Navegar entre platos desde el pop-up
    |
    +-- Reservar mesa
    |   |
    |   +-- La aplicación solicita iniciar sesión
    |   +-- ¿Tiene cuenta?
    |       |
    |       +-- Sí -> Iniciar sesión
    |       +-- No -> Registrarse
```

### Registro de usuario

```text
Usuario selecciona Registro
|
+-- Rellena formulario
|   |
|   +-- Nombre completo
|   +-- Email
|   +-- Contraseña
|   +-- Confirmación de contraseña
|   +-- Teléfono
|
+-- ¿Los datos son válidos?
    |
    +-- No
    |   |
    |   +-- La aplicación muestra aviso
    |   +-- El usuario corrige los campos
    |
    +-- Sí
        |
        +-- Se crea la cuenta
        +-- El usuario puede iniciar sesión
```

### Inicio de sesión

```text
Usuario selecciona Entrar
|
+-- ¿Cómo quiere acceder?
    |
    +-- Email y contraseña
    |   |
    |   +-- Introduce email
    |   +-- Introduce contraseña
    |   +-- Accede al panel correspondiente a su rol
    |
    +-- Google
        |
        +-- Selecciona cuenta Google
        +-- ¿Debe configurar contraseña?
            |
            +-- Sí -> redirección a recuperación/configuración de contraseña
            +-- No -> accede al panel correspondiente
```

### Recuperación de contraseña

```text
Usuario no recuerda su contraseña
|
+-- Entra en "¿Olvidaste tu contraseña?"
|
+-- Introduce email
|
+-- Recibe instrucciones de recuperación
|
+-- Vuelve a iniciar sesión
```

## 4. Comensal

```text
Comensal inicia sesión
|
+-- Entra al panel
|
+-- ¿Qué necesita hacer?
    |
    +-- Configurar perfil
    +-- Ver inicio
    +-- Ver menú
    +-- Crear reserva
    +-- Consultar sus reservas
    +-- Dividir cuenta
    +-- Cerrar sesión
```

### Configurar perfil

```text
Comensal abre "Configuración de perfil"
|
+-- Revisa sus datos personales
|
+-- ¿El teléfono está informado?
    |
    +-- No
    |   |
    |   +-- Añade teléfono
    |   +-- Guarda cambios
    |   +-- Ya puede crear reservas
    |
    +-- Sí
        |
        +-- Puede continuar usando reservas
```

### Consultar menú como comensal

```text
Comensal selecciona "Ver Menú"
|
+-- ¿Busca un plato concreto?
|   |
|   +-- Sí -> usa el buscador por nombre
|   +-- No -> navega por categorías
|
+-- ¿Quiere evitar alérgenos?
|   |
|   +-- Sí -> marca los alérgenos que desea excluir
|   +-- No -> ve todos los platos disponibles
|
+-- ¿Quiere más información de un plato?
    |
    +-- Sí
    |   |
    |   +-- Pulsa sobre el plato
    |   +-- Ve imagen, descripción, precio y alérgenos
    |   +-- Usa flechas para pasar al plato anterior o siguiente
    |
    +-- No -> continúa navegando por la carta
```

### Crear reserva como comensal

```text
Comensal selecciona "Reservas"
|
+-- Entra en "Crear reserva"
|
+-- Completa datos
|   |
|   +-- Fecha
|   +-- Hora
|   +-- Número de personas
|   +-- Solicitudes especiales, opcional
|
+-- ¿La reserva cumple las reglas?
    |
    +-- No
    |   |
    |   +-- La aplicación muestra el motivo
    |   +-- Ejemplos:
    |       +-- Falta fecha
    |       +-- Falta hora
    |       +-- Hora fuera de turno
    |       +-- Perfil sin teléfono
    |       +-- Número de personas fuera del rango permitido
    |
    +-- Sí
        |
        +-- Se envía la solicitud
        +-- La reserva queda creada
        +-- El usuario espera confirmación
```

### Consultar reservas propias

```text
Comensal entra en "Reservas"
|
+-- Mira el bloque "Mis reservas"
|
+-- ¿Tiene reservas?
    |
    +-- No -> no se muestran reservas activas
    +-- Sí -> revisa fecha, hora, personas, estado y datos asociados
```

### Dividir cuenta

```text
Comensal selecciona "Dividir Cuenta"
|
+-- Introduce importe total
|
+-- Introduce número de personas
|
+-- La aplicación calcula automáticamente cuánto paga cada persona
```

### Chatbot

```text
Comensal autenticado
|
+-- Abre chatbot
|
+-- Formula una pregunta relacionada con el restaurante
|
+-- Recibe respuesta de asistencia
```

## 5. Administrador

```text
Administrador inicia sesión
|
+-- Entra al panel de administración
|
+-- ¿Qué necesita gestionar?
    |
    +-- Ver Inicio
    +-- Ver Menú
    +-- Gestionar Menú
    +-- Gestionar Mesas
    +-- Gestionar Ofertas
    +-- Gestionar Todas las Reservas
    +-- Dividir Cuenta
    +-- Configuración de perfil
    +-- Cerrar sesión
```

### Gestionar menú

```text
Administrador selecciona "Gestionar Menú"
|
+-- ¿Qué quiere hacer?
    |
    +-- Crear nuevo plato
    |   |
    |   +-- Pulsa "+ Nuevo Plato"
    |   +-- Completa nombre
    |   +-- Completa descripción
    |   +-- Selecciona categoría
    |   +-- Selecciona alérgenos
    |   +-- Introduce precio
    |   +-- Sube imagen
    |   +-- Marca disponibilidad
    |   +-- Guarda plato
    |
    +-- Editar plato existente
    |   |
    |   +-- Busca o filtra el plato
    |   +-- Pulsa "Editar"
    |   +-- Modifica los datos necesarios
    |   +-- Guarda cambios
    |
    +-- Eliminar plato
    |   |
    |   +-- Busca el plato
    |   +-- Pulsa "Eliminar"
    |   +-- Confirma eliminación
    |
    +-- Cambiar disponibilidad
        |
        +-- Edita el plato
        +-- Marca o desmarca "Disponible"
        +-- Guarda cambios
```

### Gestionar estructura visual de la carta

```text
Administrador entra en "Ver Menú"
|
+-- Pulsa "Gestionar estructura"
|
+-- ¿Qué desea ajustar?
    |
    +-- Orden de categorías
    |   |
    |   +-- Arrastra categorías
    |   +-- Suelta en la posición deseada
    |   +-- Guarda al salir
    |
    +-- Disponibilidad rápida de platos
        |
        +-- Pulsa un plato
        +-- Cambia entre disponible y agotado/no disponible
```

### Gestionar mesas

```text
Administrador selecciona "Gestionar Mesas"
|
+-- ¿Qué quiere hacer?
    |
    +-- Crear mesa
    |   |
    |   +-- Pulsa nueva mesa
    |   +-- Introduce número de mesa
    |   +-- Introduce capacidad
    |   +-- Marca si está disponible
    |   +-- Guarda
    |
    +-- Editar mesa
    |   |
    |   +-- Selecciona mesa
    |   +-- Cambia número, capacidad o disponibilidad
    |   +-- Guarda
    |
    +-- Eliminar mesa
    |   |
    |   +-- Selecciona mesa
    |   +-- Elimina
    |   +-- Confirma acción si la aplicación lo solicita
    |
    +-- Consultar disponibilidad
        |
        +-- Selecciona fecha
        +-- Selecciona turno: comida o cena
        +-- Revisa mesas disponibles para ese momento
```

### Gestionar ofertas

```text
Administrador selecciona "Ofertas"
|
+-- ¿Qué quiere hacer?
    |
    +-- Crear oferta
    |   |
    |   +-- Pulsa "+ Nueva Oferta"
    |   +-- Introduce título
    |   +-- Introduce descripción
    |   +-- Introduce porcentaje de descuento
    |   +-- Marca si está activa
    |   +-- Define fecha de inicio, opcional
    |   +-- Define fecha de fin, opcional
    |   +-- Sube imagen, opcional
    |   +-- Selecciona platos incluidos, opcional
    |   +-- Guarda oferta
    |
    +-- Editar oferta
    |   |
    |   +-- Busca la oferta
    |   +-- Pulsa "Editar"
    |   +-- Cambia los datos
    |   +-- Guarda
    |
    +-- Activar o desactivar oferta
    |   |
    |   +-- Pulsa "Activar" o "Desactivar"
    |
    +-- Eliminar oferta
    |   |
    |   +-- Pulsa "Eliminar"
    |   +-- Confirma acción
    |
    +-- Filtrar ofertas
        |
        +-- Todas
        +-- Activas
        +-- Inactivas
        +-- En vigor ahora
```

### Gestionar todas las reservas

```text
Administrador selecciona "Todas las Reservas"
|
+-- Primero filtra reservas
|   |
|   +-- Por turno
|   +-- Por día
|   +-- Por rango de fechas
|   +-- Por nombre o teléfono del cliente
|   +-- Por estado
|
+-- ¿Qué necesita hacer?
    |
    +-- Consultar listado
    |   |
    |   +-- Revisa cliente, teléfono, fecha, hora, turno, personas, estado y mesas
    |
    +-- Cambiar estado
    |   |
    |   +-- En la tabla, cambia el estado de la reserva
    |   +-- La aplicación actualiza el estado
    |
    +-- Crear reserva desde administración
    |   |
    |   +-- Busca cliente por teléfono, nombre o email
    |   +-- ¿Existe cliente?
    |       |
    |       +-- Sí -> selecciona cliente
    |       +-- No -> introduce nombre y teléfono manualmente
    |   +-- Introduce fecha
    |   +-- Introduce hora
    |   +-- Introduce personas
    |   +-- Añade solicitudes especiales, opcional
    |   +-- Guarda reserva
    |
    +-- Editar reserva
    |   |
    |   +-- Pulsa "Seleccionar" en una reserva
    |   +-- Modifica cliente, fecha, hora, personas, estado o notas
    |   +-- Guarda cambios
    |
    +-- Asignar mesas
        |
        +-- Selecciona una reserva
        +-- Revisa mesas disponibles
        +-- Selecciona una o varias mesas
        +-- Pulsa "Asignar mesas"
        +-- ¿Necesita quitar mesas?
            |
            +-- Sí -> pulsa "Desasignar todas"
            +-- No -> mantiene asignación actual
```

## 6. Estados y decisiones frecuentes

### Si el usuario no puede reservar

```text
No puede crear reserva
|
+-- ¿Está autenticado?
|   |
|   +-- No -> iniciar sesión o registrarse
|   +-- Sí -> continuar
|
+-- ¿Tiene rol comensal?
|   |
|   +-- No -> solo comensales crean reservas desde el formulario de comensal
|   +-- Sí -> continuar
|
+-- ¿Tiene teléfono en el perfil?
|   |
|   +-- No -> ir a configuración de perfil y añadir teléfono
|   +-- Sí -> continuar
|
+-- ¿Ha elegido fecha, hora y personas válidas?
    |
    +-- No -> corregir formulario
    +-- Sí -> enviar reserva
```

### Si el administrador no ve opciones de administración

```text
No aparecen opciones de administración
|
+-- ¿Ha iniciado sesión?
|   |
|   +-- No -> iniciar sesión
|   +-- Sí -> continuar
|
+-- ¿Su rol es administrador?
    |
    +-- No -> la aplicación lo trata como comensal
    +-- Sí -> recargar sesión o revisar datos del usuario en Firebase
```

### Si no hay mesas disponibles

```text
No hay mesas disponibles
|
+-- Revisar fecha
+-- Revisar turno
+-- Revisar número de personas
+-- Comprobar que existen mesas activas
+-- Comprobar reservas ya asignadas
+-- Si es necesario, fusionar varias mesas desde administración
```

### Si un plato no aparece en la carta pública

```text
Plato no visible en menú público
|
+-- ¿Está creado en Gestión de Menú?
|   |
|   +-- No -> crear plato
|   +-- Sí -> continuar
|
+-- ¿Está marcado como disponible?
|   |
|   +-- No -> activar disponibilidad
|   +-- Sí -> continuar
|
+-- ¿Pertenece a una categoría válida?
|   |
|   +-- No -> asignar categoría
|   +-- Sí -> revisar filtros de búsqueda/alérgenos
```

## 7. Mapa rápido de navegación

```text
Barra superior
|
+-- Inicio
+-- Menú
+-- Reserva, solo autenticados
+-- Perfil, según rol
+-- Entrar, si no autenticado
+-- Registro, si no autenticado
+-- Menú de usuario
    |
    +-- Configuración de perfil
    +-- Cerrar sesión
```

```text
Menú lateral del comensal
|
+-- Configuración de perfil
+-- Ver Inicio
+-- Ver Menú
+-- Reservas
+-- Dividir Cuenta
+-- Cerrar Sesión
```

```text
Menú lateral del administrador
|
+-- Ver Inicio
+-- Ver Menú
+-- Gestionar Menú
+-- Gestionar Mesas
+-- Ofertas
+-- Todas las Reservas
+-- Dividir Cuenta
+-- Configuración de perfil
+-- Cerrar Sesión
```

## 8. Recomendaciones de uso

- Antes de reservar, el comensal debe tener teléfono guardado en su perfil.
- Para evitar errores de disponibilidad, el administrador debe mantener las mesas actualizadas.
- Los platos sin disponibilidad no aparecen como platos disponibles para el usuario final.
- Las ofertas deben tener fechas coherentes: la fecha de fin debe ser posterior a la fecha de inicio.
- El administrador debe revisar las reservas por fecha y turno antes de asignar mesas.
- Si una reserva requiere más capacidad que una mesa individual, se pueden seleccionar varias mesas.

## 9. Cierre de sesión

```text
Usuario quiere salir
|
+-- Abre menú de usuario o menú lateral
|
+-- Pulsa "Cerrar sesión"
|
+-- La aplicación finaliza la sesión
|
+-- El usuario vuelve al acceso público
```

