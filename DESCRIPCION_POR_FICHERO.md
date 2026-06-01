# Descripcion por fichero

Este documento resume para que sirve cada fichero importante del proyecto.

## Ficheros de configuracion

Estos son los ficheros de configuracion principales del proyecto. Algunos admiten comentarios dentro del propio fichero y otros no, especialmente los `.json`, porque JSON estandar no permite comentarios.

### Ficheros comentados directamente

Los siguientes ficheros se comentaron en su cabecera o en sus secciones principales sin romper su estructura:

- `tailwind.config.js`
- `postcss.config.js`
- `.gitignore`
- `.env.example`
- `firestore.rules`
- `.github/workflows/firebase-hosting-merge.yml`
- `.github/workflows/firebase-hosting-pull-request.yml`

### Detalle de cada fichero

| Fichero | Para que sirve | Comentarios dentro del fichero |
|---|---|---|
| `package.json` | Configura el frontend React: dependencias, scripts (`start`, `build`, `test`), ESLint de React y navegadores soportados. | No comentado porque JSON no permite comentarios. |
| `package-lock.json` | Bloquea versiones exactas de dependencias instaladas. No se edita a mano normalmente. | No comentado porque JSON no permite comentarios. |
| `functions/package.json` | Configura Firebase Cloud Functions: runtime Node `24`, dependencias backend y scripts de deploy/emulador. | No comentado porque JSON no permite comentarios. |
| `functions/package-lock.json` | Lockfile de dependencias del backend. | No comentado porque JSON no permite comentarios. |
| `firebase.json` | Le dice a Firebase donde estan las reglas, indices, functions y hosting. Hosting publica `build/`. | No comentado porque JSON no permite comentarios. |
| `.firebaserc` | Relaciona este proyecto local con el proyecto Firebase `digitalizacion-tsinge-fusion`. | No comentado porque JSON no permite comentarios. |
| `firestore.rules` | Reglas de seguridad de Firestore: quien puede leer/escribir `users`, `menus`, `offers`, `tables`, `reservations`, etc. | Comentado. Ya tenia comentarios y se anadio una cabecera aclaratoria. |
| `firestore.indexes.json` | Define indices compuestos de Firestore para consultas por `reservations`, `menus`, `offers` y `tables`. | No comentado porque JSON no permite comentarios. |
| `tailwind.config.js` | Configura Tailwind: rutas donde busca clases, colores personalizados, fuentes, espaciados, bordes, sombras y plugins. | Comentado. |
| `postcss.config.js` | Activa Tailwind y Autoprefixer durante el build CSS. | Comentado. |
| `.gitignore` | Evita subir `node_modules`, `functions/node_modules` y variables `.env`. | Comentado. |
| `.env.example` | Ejemplo de variables de entorno del frontend. | Comentado. Nota: contiene una API key con pinta de real; seria mejor sustituirla por un placeholder. |
| `.env.local` | Variables reales locales. | No comentado para no tocar credenciales/configuracion local sensible. |
| `TFC_IN_V1.code-workspace` | Configuracion de workspace de VS Code. | No comentado. Es JSON/JSONC y no era necesario tocarlo. |
| `.vscode/settings.json` | Configuracion local de VS Code. Ahora apunta a Python/venv, algo raro para este proyecto React. | No comentado porque es JSON. |
| `skills-lock.json` | Lockfile de skills/agentes Firebase. No afecta a la app React directamente. | No comentado porque JSON no permite comentarios. |
| `.github/workflows/firebase-hosting-merge.yml` | Workflow que compila y despliega Firebase Hosting cuando haces push a `main`. | Comentado. |
| `.github/workflows/firebase-hosting-pull-request.yml` | Workflow que crea previews de Firebase Hosting para Pull Requests. | Comentado. |

## Entrada, aplicacion y Firebase

| Fichero | Para que sirve |
|---|---|
| `src/index.js` | Punto de entrada del frontend React. Monta `App` en el DOM y envuelve proveedores globales. |
| `src/App.js` | Componente raiz. Define rutas, protecciones por rol, navegacion principal, chatbot, footer legal y notificaciones. |
| `src/firebase/index.js` | Inicializa Firebase en el cliente y exporta servicios compartidos como Auth, Firestore y Storage. |
| `src/contexts/AuthContext.jsx` | Contexto de autenticacion alternativo. Expone usuario, rol y banderas de acceso mediante React Context. |
| `src/controllers/useAuth.js` | Alias temporal del hook de autenticacion. Reexporta `src/hooks/useAuth` por compatibilidad. |
| `functions/index.js` | Cloud Functions de Firebase. Contiene endpoints HTTP, triggers de Firestore y tareas del servidor para emails, reservas y mantenimiento. |

## Servicios

| Fichero | Para que sirve |
|---|---|
| `src/services/AuthService.js` | Servicio de autenticacion: login, registro, logout, Google, roles y datos de usuario en Firebase. |
| `src/services/UserService.js` | Servicio de usuarios: consulta y gestion de perfiles, roles y datos de usuarios en Firestore/Auth. |
| `src/services/MenuService.js` | Servicio legacy/alternativo de menus. Trabaja con la coleccion `menus` y metodos CRUD de menu. |
| `src/models/MenuService.js` | Servicio principal actual de carta. Gestiona platos, categorias, alergenos y ofertas en Firestore. |
| `src/services/OfferService.js` | Servicio de ofertas: lectura, creacion, actualizacion, borrado y estado de ofertas en Firestore. |
| `src/services/ReservationService.js` | Servicio de reservas: CRUD y consultas de reservas para comensales y administradores. |
| `src/services/ReservationTableService.js` | Servicio auxiliar que relaciona reservas con mesas y disponibilidad. |
| `src/services/TableService.js` | Servicio de mesas: CRUD, activacion, fusion y consulta de mesas en Firestore. |
| `src/services/TableAvailabilityService.js` | Servicio de disponibilidad. Calcula mesas libres, ocupadas o validas segun fecha, turno y comensales. |
| `src/services/ToastService.js` | Capa comun para mostrar notificaciones y confirmaciones con `react-hot-toast`. |
| `src/services/ChatbotService.js` | Servicio del chatbot. Prepara mensajes, llama al modelo configurado y procesa respuestas para el usuario. |
| `src/services/ChatbotContextService.js` | Construye contexto del restaurante para el chatbot usando carta, reservas, mesas, horarios y datos de Firestore. |

## Hooks

| Fichero | Para que sirve |
|---|---|
| `src/hooks/useAuth.js` | Hook de autenticacion usado por la app. Escucha Firebase Auth y expone usuario, rol, login y logout. |
| `src/hooks/useDashboard.js` | Hook del dashboard. Calcula opciones disponibles y seccion seleccionada segun el rol del usuario. |
| `src/hooks/useMenu.js` | Hook de menu legacy. Carga y gestiona datos de menus desde el servicio correspondiente. |
| `src/hooks/useReservations.js` | Hook de reservas. Carga reservas y acciones de gestion para usuario o administrador. |
| `src/hooks/useReservationsByDateAndShift.js` | Hook de consulta de reservas filtradas por fecha y turno. |
| `src/hooks/useTableAvailability.js` | Hook de disponibilidad puntual de mesa para una fecha, hora y numero de comensales. |
| `src/hooks/useTables.js` | Hook de mesas. Carga listado y expone acciones CRUD para mesas. |
| `src/hooks/useTablesByDateAndShift.js` | Hook que agrupa mesas activas, reservadas e inactivas para una fecha y turno. |
| `src/hooks/useUsers.js` | Hook de usuarios. Carga usuarios y expone acciones administrativas de gestion. |

## Paginas

| Fichero | Para que sirve |
|---|---|
| `src/pages/Home.js` | Pagina publica de inicio. Presenta restaurante, carrusel, ofertas, llamada a reservas y acceso a carta. |
| `src/pages/Menu.js` | Pagina publica de carta. Muestra categorias, platos, alergenos, busqueda y modo de gestion para admin. |
| `src/pages/Login.js` | Pagina de inicio de sesion con email/password, Google y redireccion posterior. |
| `src/pages/Register.js` | Pagina de registro de usuarios con datos de perfil y autenticacion Firebase. |
| `src/pages/ForgotPassword.js` | Pagina de recuperacion o configuracion de contrasena mediante Firebase Auth. |
| `src/pages/Dashboard.js` | Panel principal autenticado. Muestra secciones disponibles para admin o comensal y coordina vistas internas. |
| `src/pages/Reservations.js` | Contenedor de reservas del usuario autenticado. |
| `src/pages/MyReservationsView.js` | Vista de reservas del comensal. Lista reservas propias y su estado. |
| `src/pages/AdminMenu.js` | Vista de administracion de carta. Permite crear, editar, borrar y organizar platos, categorias y alergenos. |
| `src/pages/AdminOffers.js` | Vista de administracion de ofertas. Gestiona promociones, descuentos, fechas, imagenes y platos asociados. |
| `src/pages/AdminReservationsView.js` | Vista administrativa de reservas. Permite consultar, crear, editar, confirmar/cancelar y asignar mesas. |
| `src/pages/AdminTables.js` | Vista administrativa de mesas. Integra la gestion de mesas y disponibilidad. |
| `src/pages/ConfirmReservation.js` | Pagina de confirmacion de reserva desde enlaces o flujos de validacion. |
| `src/pages/CompleteProfile.js` | Pantalla para completar datos de perfil del usuario tras registro o autenticacion incompleta. |
| `src/pages/AvisoLegal.js` | Pagina legal con informacion del titular, condiciones de uso y aviso legal del sitio. |
| `src/pages/PoliticaPrivacidad.js` | Pagina legal de politica de privacidad y tratamiento de datos. |
| `src/pages/PoliticaCookies.js` | Pagina legal de politica de cookies. |
| `src/pages/UsersView.js` | Vista legacy de administracion de usuarios basada en `useUsers`. |
| `src/pages/TablesView.js` | Vista legacy de administracion de mesas basada en `useTables`. |
| `src/pages/ReservationsView.js` | Vista legacy/general de reservas con datos de reservas y mesas. |

## Componentes

| Fichero | Para que sirve |
|---|---|
| `src/components/NavigationBar.js` | Barra de navegacion principal: enlaces publicos, estado de sesion, rol y cierre de sesion. |
| `src/components/Sidebar.js` | Menu lateral del dashboard para cambiar de seccion. |
| `src/components/LegalFooter.js` | Footer legal con enlaces a aviso legal, privacidad y cookies. |
| `src/components/CookieBanner.js` | Banner de consentimiento de cookies y enlace a la politica correspondiente. |
| `src/components/ProfileForm.js` | Formulario de perfil. Permite ver y actualizar datos personales del usuario. |
| `src/components/ReservationForm.js` | Formulario general de reserva. Recoge fecha, turno, comensales y datos necesarios. |
| `src/components/ReservationFormComensal.js` | Formulario de reserva para comensales autenticados con datos precargados. |
| `src/components/AdminReservationForm.js` | Formulario administrativo para crear o editar reservas desde el panel. |
| `src/components/RestaurantChatbot.js` | Widget flotante de chatbot del restaurante para asistencia contextual. |
| `src/components/SplitBillForm.js` | Herramienta para dividir una cuenta entre comensales. |
| `src/components/TableManagement/TablesManagementView.js` | Vista compuesta de gestion de mesas: formulario, listado y panel de disponibilidad. |
| `src/components/TableManagement/TableForm.js` | Formulario para crear o editar mesas. |
| `src/components/TableManagement/TableList.js` | Listado administrativo de mesas con acciones de edicion, borrado y estado. |
| `src/components/TableManagement/TableAvailabilityPanel.js` | Panel de disponibilidad de mesas por fecha y turno. |

## Carpetas generadas o auxiliares

| Carpeta | Para que sirve |
|---|---|
| `build/` | Carpeta generada por `npm run build`. Firebase Hosting publica esta carpeta. No se edita a mano. |
| `node_modules/` | Dependencias instaladas del frontend. Se regenera con `npm install` o `npm ci`. |
| `functions/node_modules/` | Dependencias instaladas de Cloud Functions. |
| `.firebase/` | Metadatos/cache local de Firebase CLI. |
| `.venv/` | Entorno virtual Python local. No parece necesario para la app React/Firebase actual. |
| `.agents/` | Skills/agentes del entorno de desarrollo. No forma parte directa de la app de produccion. |
