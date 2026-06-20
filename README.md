# NaturApp - Mobile E-Commerce de Productos Naturales

NaturApp es una aplicación móvil de comercio electrónico inspirada en **Santa Natura**, desarrollada como parte del curso de **Taller de Software Móvil** en la Universidad Nacional Mayor de San Marcos (UNMSM). La aplicación permite explorar un catálogo de productos naturales, gestionar un carrito de compras, realizar pedidos y administrar perfiles de usuario.

## 🚀 Características Principales

- **Catálogo de Productos:** Exploración por categorías con búsqueda asíncrona.
- **Gestión de Carrito:** Persistencia local estructurada para añadir, editar y eliminar productos.
- **Historial de Pedidos:** Registro y consulta de órdenes realizadas.
- **Perfil de Usuario:** Personalización de preferencias (Tema oscuro, notificaciones).
- **Modo Offline:** Capacidad de funcionamiento local mediante base de datos relacional.

## 🏗️ Arquitectura y Patrones

El proyecto implementa una **Arquitectura en Capas** combinada con el patrón **MVVM (Model-View-ViewModel)** adaptado a React Native mediante *Custom Hooks*:

1.  **Capa de Presentación (Views):** Pantallas en `app/` y componentes reutilizables en `src/components/`.
2.  **Capa de Lógica de Negocio (ViewModels):** Implementada con Custom Hooks en `src/viewmodels/` para separar la lógica de la UI.
3.  **Capa de Datos (Services):**
    *   **Persistencia Básica:** `AsyncStorage` para tokens y preferencias.
    *   **Persistencia Local:** `SQLite` (via `expo-sqlite`) para el carrito y favoritos.
    *   **Persistencia Remota:** API REST (Node.js/Express) utilizando `fetch` asíncrono.
4.  **Capa de Modelo (Models):** Clases que definen las entidades del negocio (`Product`, `CartItem`, `Order`).

## 📁 Estructura del Proyecto

```text
├── app/                  # Navegación (Expo Router)
│   ├── (tabs)/           # Navegación por pestañas (Home, Cart, Orders, Profile)
│   ├── product/          # Pantallas de detalle de producto
│   └── _layout.js        # Configuración de navegación raíz
├── src/
│   ├── components/       # Componentes visuales atómicos
│   ├── models/           # Definición de clases y lógica de dominio
│   ├── services/         # Gestión de datos (API, SQLite, AsyncStorage)
│   └── viewmodels/       # Lógica de pantallas (Custom Hooks)
├── assets/               # Imágenes y recursos estáticos
└── package.json          # Dependencias del proyecto
```

## 🛠️ Instalación y Configuración

### Requisitos Previos
*   Node.js instalado.
*   Aplicación **Expo Go** en su dispositivo móvil.

### Pasos
1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/antidv/NaturApp-MV.git
    cd NaturApp-MV
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar la API:**
    Edite el archivo `src/services/apiService.js` y reemplace la `BASE_URL` con la dirección IP local de su servidor backend:
    ```javascript
    const BASE_URL = 'http://TU_IP_LOCAL:9090/api';
    ```

4.  **Iniciar la aplicación:**
    ```bash
    npx expo start
    ```
    Escanee el código QR con la app **Expo Go** (Android) o la cámara (iOS).

## 📦 Tecnologías Utilizadas

- **Core:** React Native & Expo SDK.
- **Navegación:** Expo Router (File-based routing).
- **Base de Datos Local:** `expo-sqlite`.
- **Almacenamiento Clave-Valor:** `@react-native-async-storage/async-storage`.
- **Iconos:** `@expo/vector-icons`.
