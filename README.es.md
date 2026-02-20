# 🎭 Moodcam por Esplubot

**Aplicación web de detección de emociones en tiempo real mediante IA y tu webcam.**

Moodcam utiliza modelos de aprendizaje automático que se ejecutan completamente en el navegador para detectar rostros y analizar emociones en tiempo real — sin procesamiento en servidor, sin que tus datos salgan de tu dispositivo.

> [English version](README.md) · [Versió en català](README.ca.md)

---

## ✨ Características

- **Detección facial en tiempo real** — Detecta rostros del flujo de la webcam usando los modelos BlazeFace y FaceMesh.
- **Reconocimiento de emociones** — Clasifica 7 emociones (feliz, triste, enfadado, sorprendido, asustado, disgustado, neutral) con porcentajes de confianza.
- **Malla facial superpuesta** — Dibuja polígonos de la malla facial en una capa canvas sobre el vídeo en directo.
- **100% en el cliente** — Toda la inferencia ocurre localmente en el navegador mediante TensorFlow.js (a través de la librería `@vladmandic/human`). No se envían imágenes ni datos a ningún servidor.
- **Interfaz responsiva** — Diseño en dos columnas en escritorio, una columna en móvil. Construido con Tailwind CSS v4.
- **Desplegable en Vercel** — Incluye `vercel.json` con cabeceras de caché agresivas para los archivos de modelos.

## 🛠 Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Framework** | [React 19](https://react.dev/) |
| **Herramienta de build** | [Vite 7](https://vite.dev/) |
| **Estilos** | [Tailwind CSS 4](https://tailwindcss.com/) (vía `@tailwindcss/vite`) |
| **IA / ML** | [@vladmandic/human 3.x](https://github.com/vladmandic/human) (envuelve TensorFlow.js) |
| **Linting** | ESLint 9 con configuración plana, plugins de React Hooks y React Refresh |
| **Despliegue** | [Vercel](https://vercel.com/) |

## 📁 Estructura del Proyecto

```
moodcam/
├── public/
│   ├── logo-esplubot.png          # Logo / favicon de la app
│   └── models/                    # Archivos de modelos ML pre-entrenados
│       ├── blazeface.{json,bin}   # Modelo de detección facial
│       ├── facemesh.{json,bin}    # Modelo de malla facial / landmarks
│       ├── emotion.{json,bin}     # Modelo de clasificación de emociones
│       └── faceres.{json,bin}     # Modelo de descripción facial (edad/género)
├── src/
│   ├── main.jsx                   # Punto de entrada React (StrictMode)
│   ├── App.jsx                    # Layout principal: cabecera, cámara, panel de emociones, pie de página
│   ├── index.css                  # Importación de Tailwind CSS
│   ├── components/
│   │   ├── CameraView.jsx         # Vídeo + canvas superpuesto con indicador en vivo
│   │   └── EmotionDisplay.jsx     # Emoción dominante, barras de emociones
│   └── hooks/
│       └── useFaceDetection.js    # Hook principal: carga de modelos, cámara, bucle de detección
├── index.html                     # Shell HTML (lang="es")
├── vite.config.js                 # Plugins Vite + React + Tailwind
├── eslint.config.js               # Configuración plana de ESLint
├── vercel.json                    # Configuración de despliegue en Vercel con cabeceras de caché
└── package.json
```

## 🏗 Arquitectura

### Pipeline de Detección

1. **Carga de modelos** — Al montar el componente, `useFaceDetection` crea una instancia singleton de `Human`, carga los modelos desde `/models` y los precalienta (warmup).
2. **Acceso a la cámara** — Cuando el usuario pulsa "Iniciar Cámara", el hook solicita `getUserMedia` con la cámara frontal a 640×480.
3. **Bucle de detección** — Una vez que el vídeo empieza a reproducirse, un bucle `requestAnimationFrame` llama continuamente a `human.detect(video)`, que ejecuta BlazeFace → FaceMesh → Clasificación de emociones.
4. **Dibujado** — La malla facial detectada se dibuja sobre un `<canvas>` superpuesto usando `human.draw.face()` con renderizado de polígonos.
5. **Actualización de estado** — Las puntuaciones de emociones y la emoción dominante se envían al estado de React y son renderizados por `EmotionDisplay`.

### Decisiones de Diseño Clave

- **Patrón singleton** para la instancia de `Human` que evita re-descargar los modelos en cada re-render.
- **Efecto espejo** — Tanto el vídeo como el canvas usan `scaleX(-1)` para que la cámara actúe como un espejo.
- **Un solo rostro** — `maxDetected: 1` mantiene la inferencia rápida procesando solo un rostro.
- **Adaptación al frame-rate** — Usa `requestAnimationFrame` para que la velocidad de detección se adapte a las capacidades del dispositivo.

## 🚀 Inicio Rápido

### Requisitos Previos

- **Node.js** ≥ 18
- **npm** (o cualquier gestor de paquetes compatible)
- Un dispositivo con **webcam** y un navegador moderno (Chrome, Firefox, Edge, Safari)

### Instalación

```bash
git clone <url-del-repositorio>
cd moodcam
npm install
```

### Desarrollo

```bash
npm run dev
```

Se abre en `http://localhost:5173`. Haz clic en **"📷 Iniciar Cámara"**, concede permisos de cámara y observa cómo se detectan tus emociones en directo.

### Build para Producción

```bash
npm run build
npm run preview   # previsualizar el build de producción localmente
```

### Desplegar en Vercel

```bash
npx vercel
```

El `vercel.json` incluido configura el comando de build, el directorio de salida y establece `Cache-Control: public, max-age=31536000, immutable` en todos los archivos de modelos bajo `/models/`.

## ⚙️ Configuración de Detección

La app incluye un panel de configuración (icono ⚙️ en la cabecera) que permite ajustar todos los parámetros de detección en tiempo real. Los cambios se aplican instantáneamente sin recargar modelos y se **guardan automáticamente en `localStorage`**, de modo que tu configuración preferida se restaura en la siguiente visita.

### 🔍 Detector Facial

Parámetros que controlan cómo se localizan los rostros en el fotograma de vídeo.

| Parámetro | Default | Rango | Descripción |
|---|---|---|---|
| **Confianza mín.** | `0.50` | 0.10 – 1.00 | Puntuación mínima para aceptar un rostro detectado. Valores más altos reducen falsos positivos (ej. objetos confundidos con caras) pero pueden perder rostros parcialmente visibles. |
| **Máx. rostros** | `1` | 1 – 5 | Número máximo de rostros a detectar simultáneamente. Mantenerlo en 1 ofrece el mejor rendimiento. |
| **IoU Threshold** | `0.10` | 0.01 – 0.90 | Umbral de Intersection over Union para Non-Maximum Suppression. Controla cuánto pueden solaparse dos bounding boxes antes de descartar el más débil. Valores más bajos son más agresivos eliminando duplicados. |
| **Corrección de rotación** | `off` | on / off | Habilita detección facial multi-ángulo. Mejora la precisión con cabezas inclinadas pero aumenta significativamente el tiempo de procesamiento. |
| **Skip frames** | `99` | 0 – 100 | Frames consecutivos máximos en los que el detector puede reutilizar bounding boxes del caché en lugar de re-ejecutarse. Funciona junto con la sensibilidad de caché. |
| **Skip time (ms)** | `2500` | 0 – 5000 | Tiempo máximo en milisegundos que el detector puede reutilizar resultados cacheados. Tras este tiempo se fuerza una nueva detección independientemente de los skip frames. |

### 🎭 Emociones

Parámetros del modelo de clasificación de emociones que se ejecuta sobre cada rostro detectado.

| Parámetro | Default | Rango | Descripción |
|---|---|---|---|
| **Confianza mín.** | `0.30` | 0.01 – 0.80 | Puntuación mínima para incluir una emoción en los resultados. **Es el parámetro más impactante para la estabilidad.** Valores más altos filtran emociones de baja confianza que causan parpadeo entre estados. |
| **Skip frames** | `99` | 0 – 100 | Frames máximos que el modelo de emoción puede reutilizar su resultado previo del caché. Valores altos reducen carga de CPU/GPU pero hacen las actualizaciones menos responsivas. |
| **Skip time (ms)** | `1500` | 0 – 5000 | Tiempo máximo antes de forzar al modelo de emoción a re-ejecutarse. Valores bajos dan actualizaciones más rápidas; valores altos producen lecturas más estables (pero con mayor retardo). |

### 📊 Suavizado

Media móvil exponencial (EMA) personalizada aplicada sobre los scores de emociones crudos para reducir saltos abruptos. Esta no es una funcionalidad nativa de `@vladmandic/human` — está implementada en el hook de detección de la app.

Fórmula: `suavizado = α × crudo + (1 − α) × anterior`

| Parámetro | Default | Rango | Descripción |
|---|---|---|---|
| **Activar suavizado** | `on` | on / off | Activa/desactiva la interpolación temporal de puntuaciones de emociones. |
| **Factor de suavizado (α)** | `0.25` | 0.05 – 0.95 | Peso dado a la nueva lectura cruda. **Valores bajos** (ej. 0.10) producen resultados muy suaves y lentos en cambiar. **Valores altos** (ej. 0.80) siguen los datos crudos de cerca con mínimo retardo. |

### 🖼 Filtros de Imagen

Preprocesamiento acelerado por GPU aplicado al fotograma de vídeo antes de la inferencia (latencia casi nula vía WebGL).

| Parámetro | Default | Rango | Descripción |
|---|---|---|---|
| **Ecualización** | `on` | on / off | Ecualización de histograma de la imagen de entrada y regiones faciales recortadas. **Recomendado para condiciones de iluminación variable** — normaliza la distribución de brillo para que el modelo reciba inputs más consistentes. |
| **Auto-brillo** | `on` | on / off | Ajusta el brillo automáticamente según la escena. Solo activo cuando el caché de frames está habilitado (sensibilidad de caché > 0). |
| **Nitidez** | `0.00` | 0.00 – 1.00 | Filtro de realce de bordes. Valores bajos (0.1–0.3) pueden ayudar con webcams borrosas. Valores altos pueden amplificar el ruido. |
| **Brillo** | `0.00` | −1.00 – 1.00 | Ajuste manual de brillo. Negativo oscurece, positivo aclara. |
| **Contraste** | `0.00` | −1.00 – 1.00 | Ajuste manual de contraste. Negativo reduce el contraste, positivo lo aumenta. |
| **Desenfoque** | `0` | 0 – 15 | Radio de desenfoque gaussiano en píxeles. Puede reducir ruido en cámaras con grano, pero demasiado perjudicará la precisión de detección. |

### ⚡ Caché y Rendimiento

| Parámetro | Default | Rango | Descripción |
|---|---|---|---|
| **Sensibilidad de caché** | `0.70` | 0.00 – 1.00 | Controla cuánto debe cambiar la escena entre frames para invalidar el caché y forzar una re-detección. `0` desactiva el caché por completo (cada frame se procesa). Valores más altos permiten más saltos de frames cuando la escena es estable, reduciendo el uso de CPU/GPU. Este parámetro **habilita** el mecanismo de skip frames/time en todos los sub-modelos. |

### 💾 Persistencia

Todos los ajustes se guardan automáticamente en **`localStorage`** bajo la clave `moodcam-detection-config`. Al reabrir la app, tu configuración anterior se restaura. Al pulsar "🔄 Restaurar defaults" se restablecen todos los valores y se eliminan los datos guardados.

### 🎯 Consejos de Ajuste Recomendados

Para obtener las lecturas de emociones más estables, prueba esta combinación:

1. **Confianza mín. emociones** → `0.30`–`0.40` (elimina ruido)
2. **Suavizado** → activado, factor `0.15`–`0.25` (amortigua cambios rápidos)
3. **Ecualización** → activada (normaliza la iluminación)
4. **Desenfoque** → `1`–`2` (si tu cámara tiene ruido)

## 🔒 Privacidad

Todo el procesamiento ocurre **completamente en tu navegador**. Ningún fotograma de vídeo, imagen o resultado de detección se transmite nunca a un servidor. Los modelos de ML son archivos estáticos que se sirven junto con la aplicación.

## 📖 Glosario

| Término | Definición |
|---|---|
| **IA (Inteligencia Artificial)** | Tecnología que permite a los ordenadores realizar tareas que normalmente requieren inteligencia humana, como reconocer rostros o emociones. |
| **Aprendizaje Automático (ML)** | Rama de la IA donde los ordenadores aprenden patrones a partir de datos (en este caso, miles de imágenes de rostros) en lugar de ser programados explícitamente. |
| **Modelo** | Un archivo que contiene el "conocimiento aprendido" del entrenamiento. Moodcam usa varios modelos: uno para encontrar rostros, otro para mapear puntos faciales y otro para clasificar emociones. |
| **Inferencia** | El proceso de pasar datos nuevos (la imagen de tu webcam) a un modelo para obtener una predicción (ej. "feliz 82%"). |
| **TensorFlow.js** | Una librería de Google que permite ejecutar modelos de ML directamente en el navegador web usando la CPU o GPU de tu dispositivo. |
| **@vladmandic/human** | La librería de código abierto que usa Moodcam. Envuelve TensorFlow.js y proporciona detección facial, reconocimiento de emociones y otras capacidades listas para usar. |
| **BlazeFace** | Un modelo ligero que localiza rápidamente rostros en una imagen y devuelve sus bounding boxes (coordenadas rectangulares). |
| **FaceMesh** | Un modelo que identifica más de 468 puntos de referencia en un rostro (ojos, nariz, boca, mandíbula, etc.), formando una malla detallada. |
| **Bounding Box** | El rectángulo dibujado alrededor de un rostro detectado, definido por su posición y tamaño en la imagen. |
| **Puntuación de confianza** | Un número de 0 a 1 (mostrado como 0%–100%) que indica cuán seguro está el modelo de su predicción. Mayor = más certeza. |
| **IoU (Intersection over Union)** | Una medida del solapamiento entre dos bounding boxes. Se usa para eliminar detecciones duplicadas del mismo rostro. |
| **NMS (Non-Maximum Suppression)** | Un algoritmo que elimina detecciones redundantes superpuestas, conservando solo la más fuerte. |
| **Suavizado / EMA** | Media Móvil Exponencial — técnica que mezcla la lectura actual con las anteriores para reducir saltos bruscos y producir resultados más estables. |
| **Caché** | Almacén temporal de resultados de detección previos. Cuando la escena no ha cambiado mucho, se reutilizan los resultados cacheados para ahorrar procesamiento. |
| **Skip Frames** | Número de fotogramas de vídeo consecutivos en los que el sistema puede reutilizar resultados cacheados en lugar de ejecutar el modelo de nuevo. |
| **Ecualización** | Técnica de procesamiento de imagen que redistribuye los niveles de brillo para mejorar el contraste, especialmente útil con iluminación desigual. |
| **WebGL** | Tecnología del navegador que permite a la GPU (tarjeta gráfica) acelerar cálculos, haciendo los filtros de imagen y la inferencia ML más rápidos. |
| **localStorage** | Funcionalidad del navegador que almacena pequeñas cantidades de datos (como tus ajustes) en tu dispositivo, persistiendo entre recargas de página y reinicios del navegador. |
| **Webcam** | La cámara integrada o externa de tu dispositivo. Moodcam la usa para capturar vídeo en directo para su análisis. |
| **Lado del cliente (client-side)** | Procesamiento que ocurre enteramente en tu dispositivo (en el navegador), en contraposición a enviarse a un servidor remoto. |
