# EnergyMatch Platform

**EnergyMatch** es una plataforma integral de planificación de energía renovable y mercado digital diseñada para conectar a PyMEs y hogares con soluciones energéticas sostenibles. Potenciada por **Gemini AI** y principios de la **Web3**, la plataforma ofrece análisis de consumo inteligente, recomendaciones personalizadas y un directorio de proveedores verificados.

![EnergyMatch Dashboard](https://i.ibb.co/3ykzN9S/logo-energymatch.png)

## 🚀 Características Principales

*   **Energy Coach (IA)**: Asistente virtual inteligente que educa y asesora sobre eficiencia energética en tiempo real.
*   **Análisis de Facturas**: Procesamiento de imágenes/PDF de facturas de servicios públicos para extraer datos de consumo automáticamente.
*   **Motor de Recomendación**: Cálculo de sistemas solares fotovoltaicos óptimos basado en ubicación, clima y consumo histórico.
*   **Mercado de Proveedores**: Conexión directa con instaladores certificados (RETIE) y consultores energéticos.
*   **Panel de Administración**: Gestión centralizada para validación de proveedores y monitoreo de la plataforma.

## 🛠️ Tecnologías

*   **Frontend**: React 19, TypeScript, Tailwind CSS.
*   **AI**: Google Gemini API (`gemini-2.5-flash`).
*   **Visualización**: Recharts para análisis de datos financieros y energéticos.
*   **Iconografía**: Lucide React.
*   **Build Tool**: Vite.

## 📦 Instalación y Desarrollo

1.  **Clonar el repositorio**
    ```bash
    git clone https://github.com/tu-usuario/energymatch.git
    cd energymatch
    ```

2.  **Instalar dependencias**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno**
    Crea un archivo `.env` en la raíz del proyecto:
    ```env
    API_KEY=tu_api_key_de_google_gemini
    ```

4.  **Iniciar servidor de desarrollo**
    ```bash
    npm run dev
    ```

## ☁️ Despliegue en Vercel

Este proyecto está optimizado para ser desplegado en **Vercel**.

1.  Haz fork o sube este repositorio a tu cuenta de GitHub/GitLab.
2.  Importa el proyecto en [Vercel Dashboard](https://vercel.com/new).
3.  Vercel detectará automáticamente que es un proyecto **Vite**.
4.  **Importante**: En la configuración del despliegue, añade la variable de entorno:
    *   **Name**: `API_KEY`
    *   **Value**: Tu clave de API de Google Gemini.
5.  Haz clic en **Deploy**.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---
© 2025 EnergyMatch. Connecting Sustainable Power.