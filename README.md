# 🎭 Moodcam by Esplubot

**Real-time emotion detection web app powered by AI and your webcam.**

Moodcam uses machine learning models running entirely in the browser to detect faces and analyze emotions in real time — no server processing, no data leaving your device.

> 🇪🇸 [Versión en español](README.es.md) · � [Versió en català](README.ca.md)

---

## ✨ Features

- **Real-time face detection** — Detects faces from the webcam feed using the BlazeFace and FaceMesh models.
- **Emotion recognition** — Classifies 7 emotions (happy, sad, angry, surprised, scared, disgusted, neutral) with confidence percentages.
- **Face mesh overlay** — Draws facial polygon meshes on a canvas layer over the live video.
- **100% client-side** — All inference happens locally in the browser via TensorFlow.js (through the `@vladmandic/human` library). No images or data are sent to any server.
- **Responsive UI** — Two-column layout on desktop, single-column on mobile. Built with Tailwind CSS v4.
- **Deployable to Vercel** — Includes `vercel.json` with aggressive caching headers for model files.

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev/) |
| **Build tool** | [Vite 7](https://vite.dev/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) (via `@tailwindcss/vite`) |
| **AI / ML** | [@vladmandic/human 3.x](https://github.com/vladmandic/human) (wraps TensorFlow.js) |
| **Linting** | ESLint 9 with flat config, React Hooks & React Refresh plugins |
| **Deployment** | [Vercel](https://vercel.com/) |

## 📁 Project Structure

```
moodcam/
├── public/
│   ├── logo-esplubot.png          # App logo / favicon
│   └── models/                    # Pre-trained ML model files
│       ├── blazeface.{json,bin}   # Face detection model
│       ├── facemesh.{json,bin}    # Face mesh / landmark model
│       ├── emotion.{json,bin}     # Emotion classification model
│       └── faceres.{json,bin}     # Face description model (age/gender)
├── src/
│   ├── main.jsx                   # React entry point (StrictMode)
│   ├── App.jsx                    # Main layout: header, camera, emotions panel, footer
│   ├── index.css                  # Tailwind CSS import
│   ├── components/
│   │   ├── CameraView.jsx         # Video + canvas overlay with live indicator
│   │   └── EmotionDisplay.jsx     # Dominant emotion, emotion bars
│   └── hooks/
│       └── useFaceDetection.js    # Core hook: model loading, camera, detection loop
├── index.html                     # HTML shell (lang="es")
├── vite.config.js                 # Vite + React + Tailwind plugins
├── eslint.config.js               # ESLint flat config
├── vercel.json                    # Vercel deployment config with caching headers
└── package.json
```

## 🏗 Architecture

### Detection Pipeline

1. **Model loading** — On mount, `useFaceDetection` creates a singleton `Human` instance, loads the models from `/models`, and warms them up.
2. **Camera access** — When the user clicks "Iniciar Cámara", the hook requests `getUserMedia` with front-facing camera at 640×480.
3. **Detection loop** — Once the video starts playing, a `requestAnimationFrame` loop continuously calls `human.detect(video)`, which runs BlazeFace → FaceMesh → Emotion classification.
4. **Drawing** — The detected face mesh is drawn onto a `<canvas>` overlay using `human.draw.face()` with polygon rendering.
5. **State updates** — Emotion scores and dominant emotion are pushed to React state and rendered by `EmotionDisplay`.

### Key Design Decisions

- **Singleton pattern** for the `Human` instance prevents re-downloading models on re-renders.
- **Mirror effect** — Both video and canvas use `scaleX(-1)` so the camera acts like a mirror.
- **Single face** — `maxDetected: 1` keeps inference fast by only processing one face.
- **Lazy description** — `description` (age/gender) is disabled in config but age/gender are still extracted from `faceres` when available.
- **Frame-rate adaptive** — Uses `requestAnimationFrame` so detection speed adapts to device capabilities.

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (or any compatible package manager)
- A device with a **webcam** and a modern browser (Chrome, Firefox, Edge, Safari)

### Installation

```bash
git clone <repository-url>
cd moodcam
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`. Click **"📷 Iniciar Cámara"**, grant camera permissions, and see your emotions detected live.

### Build for Production

```bash
npm run build
npm run preview   # preview the production build locally
```

### Deploy to Vercel

```bash
npx vercel
```

The included `vercel.json` configures the build command, output directory, and sets `Cache-Control: public, max-age=31536000, immutable` on all model files under `/models/`.

## ⚙️ Detection Settings

The app includes a settings panel (⚙️ gear icon in the header) that lets you fine-tune all detection parameters in real time. Changes are applied instantly without reloading models and are **automatically persisted in `localStorage`**, so your preferred configuration is restored on the next visit.

### 🔍 Face Detector

Parameters controlling how faces are located in the video frame.

| Parameter | Default | Range | Description |
|---|---|---|---|
| **Min. Confidence** | `0.50` | 0.10 – 1.00 | Minimum score to accept a detected face. Higher values reduce false positives (e.g. objects mistaken for faces) but may miss partially visible faces. |
| **Max. Faces** | `1` | 1 – 5 | Maximum number of faces to detect simultaneously. Keeping it at 1 provides the best performance. |
| **IoU Threshold** | `0.10` | 0.01 – 0.90 | Intersection over Union threshold for Non-Maximum Suppression. Controls how much two bounding boxes can overlap before the weaker one is discarded. Lower values are more aggressive at removing duplicates. |
| **Rotation Correction** | `off` | on / off | Enables multi-angle face detection. Improves accuracy for tilted heads but significantly increases processing time. |
| **Skip Frames** | `99` | 0 – 100 | Maximum number of consecutive frames the detector can reuse cached bounding boxes instead of re-running. Works together with cache sensitivity. |
| **Skip Time (ms)** | `2500` | 0 – 5000 | Maximum time in milliseconds the detector can reuse cached results. After this time, a new detection is forced regardless of skip frames. |

### 🎭 Emotions

Parameters for the emotion classification model that runs on each detected face.

| Parameter | Default | Range | Description |
|---|---|---|---|
| **Min. Confidence** | `0.30` | 0.01 – 0.80 | Minimum score to include an emotion in the results. **This is the most impactful parameter for stability.** Higher values filter out low-confidence "noise" emotions that cause flickering between states. |
| **Skip Frames** | `99` | 0 – 100 | Maximum frames the emotion model can reuse its previous result from cache. Higher values reduce CPU/GPU load but make emotion updates less responsive. |
| **Skip Time (ms)** | `1500` | 0 – 5000 | Maximum time before forcing the emotion model to re-run. Lower values give faster updates; higher values produce more stable (but delayed) readings. |

### 📊 Smoothing

Custom exponential moving average (EMA) applied on top of raw emotion scores to reduce abrupt jumps. This is not a native `@vladmandic/human` feature — it is implemented in the app's detection hook.

Formula: `smoothed = α × raw + (1 − α) × previous`

| Parameter | Default | Range | Description |
|---|---|---|---|
| **Enable Smoothing** | `on` | on / off | Toggles temporal interpolation of emotion scores. |
| **Smoothing Factor (α)** | `0.25` | 0.05 – 0.95 | Weight given to the new raw reading. **Low values** (e.g. 0.10) produce very smooth, slow-to-change results. **High values** (e.g. 0.80) follow raw data closely with minimal delay. |

### 🖼 Image Filters

GPU-accelerated preprocessing applied to the video frame before inference (near-zero latency via WebGL).

| Parameter | Default | Range | Description |
|---|---|---|---|
| **Equalization** | `on` | on / off | Histogram equalization of the input image and cropped face regions. **Recommended for variable lighting conditions** — normalizes brightness distribution so the model sees more consistent inputs. |
| **Auto Brightness** | `on` | on / off | Automatically adjusts brightness based on the scene. Only active when frame caching is enabled (cache sensitivity > 0). |
| **Sharpness** | `0.00` | 0.00 – 1.00 | Edge enhancement filter. Low values (0.1–0.3) can help with soft/blurry webcams. High values may amplify noise. |
| **Brightness** | `0.00` | −1.00 – 1.00 | Manual brightness offset. Negative darkens, positive brightens. |
| **Contrast** | `0.00` | −1.00 – 1.00 | Manual contrast adjustment. Negative reduces contrast, positive increases it. |
| **Blur** | `0` | 0 – 15 | Gaussian blur radius in pixels. Can reduce noise in grainy camera feeds, but too much will harm detection accuracy. |

### ⚡ Cache & Performance

| Parameter | Default | Range | Description |
|---|---|---|---|
| **Cache Sensitivity** | `0.70` | 0.00 – 1.00 | Controls how much the scene must change between frames to invalidate the cache and force re-detection. `0` disables caching entirely (every frame is processed). Higher values allow more frame-skipping when the scene is stable, reducing CPU/GPU usage. This parameter **enables** the skip frames/time mechanism across all sub-models. |

### 💾 Persistence

All settings are automatically saved to **`localStorage`** under the key `moodcam-detection-config`. When you reopen the app, your previous configuration is restored. Clicking "🔄 Restore defaults" resets all values and clears the stored data.

### 🎯 Recommended Tuning Tips

For the most stable emotion readings, try this combination:

1. **Emotion min. confidence** → `0.30`–`0.40` (eliminates noise)
2. **Smoothing** → enabled, factor `0.15`–`0.25` (dampens rapid changes)
3. **Equalization** → on (normalizes lighting)
4. **Blur** → `1`–`2` (if your camera is noisy)

## 🔒 Privacy

All processing happens **entirely in your browser**. No video frames, images, or detection results are ever transmitted to a server. The ML models are static files served alongside the app.

## 📖 Glossary

| Term | Definition |
|---|---|
| **AI (Artificial Intelligence)** | Technology that allows computers to perform tasks that normally require human intelligence, such as recognizing faces or emotions. |
| **Machine Learning (ML)** | A branch of AI where computers learn patterns from data (in this case, thousands of face images) instead of being explicitly programmed. |
| **Model** | A file containing the "learned knowledge" from training. Moodcam uses several models: one to find faces, one to map facial landmarks, and one to classify emotions. |
| **Inference** | The process of feeding new data (your webcam image) into a model to get a prediction (e.g. "happy 82%"). |
| **TensorFlow.js** | A Google library that allows ML models to run directly in the web browser using your device's CPU or GPU. |
| **@vladmandic/human** | The open-source library Moodcam uses. It wraps TensorFlow.js and provides ready-to-use face detection, emotion recognition, and other capabilities. |
| **BlazeFace** | A lightweight model that quickly locates faces in an image and returns their bounding boxes (rectangular coordinates). |
| **FaceMesh** | A model that identifies 468+ landmark points on a face (eyes, nose, mouth, jawline, etc.), forming a detailed mesh. |
| **Bounding Box** | The rectangle drawn around a detected face, defined by its position and size in the image. |
| **Confidence Score** | A number from 0 to 1 (shown as 0%–100%) indicating how certain the model is about its prediction. Higher = more certain. |
| **IoU (Intersection over Union)** | A measure of overlap between two bounding boxes. Used to remove duplicate detections of the same face. |
| **NMS (Non-Maximum Suppression)** | An algorithm that removes redundant overlapping detections, keeping only the strongest one. |
| **Smoothing / EMA** | Exponential Moving Average — a technique that blends the current reading with previous ones to reduce abrupt jumps and produce more stable results. |
| **Cache** | A temporary store of previous detection results. When the scene hasn't changed much, cached results are reused to save processing power. |
| **Skip Frames** | The number of consecutive video frames the system can reuse cached results instead of running the model again. |
| **Equalization** | An image processing technique that redistributes brightness levels to improve contrast, especially useful under uneven lighting. |
| **WebGL** | A browser technology that allows the GPU (graphics card) to accelerate computations, making image filters and ML inference faster. |
| **localStorage** | A browser feature that stores small amounts of data (like your settings) on your device, persisting across page reloads and browser restarts. |
| **Webcam** | The built-in or external camera on your device. Moodcam uses it to capture live video for analysis. |
| **Client-side** | Processing that happens entirely on your device (in the browser), as opposed to being sent to a remote server. |
