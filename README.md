# 🚀 OmniFlow AI — Portafolio de Sistemas Automatizados de Atención al Cliente

Plataforma web interactiva de alto impacto para exhibir soluciones de **atención al cliente automatizada con inteligencia artificial para E-commerce**.

Diseñada para proyectar un nivel corporativo de alta gama, demostrando capacidades técnicas en **WhatsApp Cloud API**, **análisis de sentimiento en tiempo real**, **resolución autónoma de pedidos (Tracking / Cambios / Stock)** y **sincronización con CRM**.

---

## 🌟 Características Destacadas

### 1. 📱 Demostración Dual Sincronizada en Vivo
- **Lado A (Cliente):** Simulador fotorrealista de smartphone con interfaz de **WhatsApp Business** (burbujas, verificación verde, indicadores de escritura, respuestas rápidas y tarjetas dinámicas de seguimiento).
- **Lado B (Operaciones):** Centro de control y **panel CRM en tiempo real** que muestra:
  - Perfil del cliente y valor del ciclo de vida (LTV).
  - Medidor reactivo de sentimiento (Frustrado, Neutro, Satisfecho).
  - Estado del ticket con SLA medido en milisegundos.
  - Traza de razonamiento paso a paso del agente (NLP Pipeline).
  - Visor en vivo de consultas JSON a la base de datos de órdenes.
  - Feed en vivo de webhooks y disparadores automáticos.

### 2. ⚡ Escenarios de Prueba de 1 Clic (Presets)
- **📦 Rastrear Pedido #AR-8492:** Consulta de tracking en reparto hoy con DHL Express.
- **🔄 Cambio de Talla #AR-7210:** Generación autónoma de etiqueta prepagada de cambio sin soporte humano.
- **⚠️ Cliente Molesto #AR-9104:** Detección de frustración, desescalada inteligente y entrega proactiva de cupón de compensación (`DISCULPAS15`).
- **👟 Consulta de Stock:** Asistente de recomendación de producto y conversión de compra rápida.

### 3. 📊 Calculadora Interactiva de ROI & Ahorro
- Controles deslizantes para ajustar volumen mensual de pedidos, tasa de consultas y costo por agente.
- Cálculo automático de tickets auto-resueltos, horas de trabajo ahorradas, ahorro anual en USD y tiempo de amortización (payback).

### 4. ⚙️ Diagrama de Arquitectura y Flujo Técnico
- Visualización de extremo a extremo: Meta WhatsApp Cloud API ➔ OmniFlow Gateway ➔ Inferencia NLP/RAG ➔ Integraciones (Shopify, DHL, n8n) ➔ Resolución y Handoff.

### 5. 🤖 Motor Híbrido: Zero-Cost + Modo IA en Vivo Opcional
- Funciona 100% de inmediato con **cero costo de API** mediante un motor contextual determinista y base de datos local simulada.
- Incluye un modal de configuración (`⚙️ Modo IA`) para que reclutadores o clientes técnicos puedan ingresar su propia API Key de **Google Gemini** o **OpenAI** y chatear con IA generativa libre.

---

## 🛠️ Estructura del Proyecto

```text
Proyectos Antigravity/
├── index.html                   # Interfaz semántica con SEO, Open Graph y accesibilidad
├── css/
│   ├── variables.css            # Tokens de diseño (Dark Obsidian, WhatsApp Green #25D366, Cyan, Glassmorphism)
│   ├── layout.css               # Grids responsivos, navegación sticky y footer
│   ├── components.css           # Estilos de WhatsApp, CRM, calculadora, diagramas y tarjetas
│   └── animations.css           # Micro-animaciones, pulso neón y transiciones fluidas
├── js/
│   ├── mock-data.js             # Base de datos simulada de pedidos, clientes, catálogo y políticas
│   ├── bot-engine.js            # Clasificador de intenciones, extractor de entidades y motor de respuestas
│   ├── crm-sync.js              # Sincronizador en tiempo real del panel de operaciones
│   ├── calculator.js            # Lógica matemática de la calculadora de ROI
│   └── main.js                  # Orquestador principal, presets y eventos del DOM
└── README.md                    # Documentación del proyecto
```

---

## 💻 Cómo Ejecutar Localmente

El proyecto está construido con **Vanilla Web Moderna** (HTML5, CSS3, ES6+ Modules), por lo que no requiere ningún proceso de compilación ni instalación pesada de dependencias.

Para abrirlo en tu navegador:

1. **Con Python (Servidor local ya iniciado):**
   ```bash
   python -m http.server 8080
   ```
   Luego abre tu navegador en: [http://localhost:8080](http://localhost:8080)

2. **O con cualquier extensión como Live Server en VS Code:**
   Haz clic derecho en `index.html` y selecciona *Open with Live Server*.

---

## 🚀 Despliegue en Producción

Puedes publicarlo gratis en menos de 1 minuto en:
- **GitHub Pages:** Sube los archivos a un repositorio y activa GitHub Pages en *Settings > Pages*.
- **Vercel / Netlify:** Arrastra la carpeta del proyecto a la consola de Vercel o Netlify para obtener una URL HTTPS instantánea.
