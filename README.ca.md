# 🎭 Moodcam per Esplubot

**Aplicació web de detecció d'emocions en temps real mitjançant IA i la teva webcam.**

Moodcam utilitza models d'aprenentatge automàtic que s'executen completament al navegador per detectar rostres i analitzar emocions en temps real — sense processament al servidor, sense que les teves dades surtin del teu dispositiu.

> 🇬🇧 [English version](README.md) · 🇪🇸 [Versión en español](README.es.md)

---

## ✨ Característiques

- **Detecció facial en temps real** — Detecta rostres del flux de la webcam usant els models BlazeFace i FaceMesh.
- **Reconeixement d'emocions** — Classifica 7 emocions (feliç, trist, enfadat, sorprès, espantat, disgustat, neutral) amb percentatges de confiança.
- **Malla facial superposada** — Dibuixa polígons de la malla facial en una capa canvas sobre el vídeo en directe.
- **100% al client** — Tota la inferència passa localment al navegador mitjançant TensorFlow.js (a través de la llibreria `@vladmandic/human`). No s'envien imatges ni dades a cap servidor.
- **Interfície responsiva** — Disseny en dues columnes a l'escriptori, una columna al mòbil. Construït amb Tailwind CSS v4.
- **Desplegable a Vercel** — Inclou `vercel.json` amb capçaleres de memòria cau agressives per als fitxers de models.

## 🛠 Stack Tecnològic

| Capa | Tecnologia |
|---|---|
| **Framework** | [React 19](https://react.dev/) |
| **Eina de build** | [Vite 7](https://vite.dev/) |
| **Estils** | [Tailwind CSS 4](https://tailwindcss.com/) (via `@tailwindcss/vite`) |
| **IA / ML** | [@vladmandic/human 3.x](https://github.com/vladmandic/human) (embolcalla TensorFlow.js) |
| **Linting** | ESLint 9 amb configuració plana, plugins de React Hooks i React Refresh |
| **Desplegament** | [Vercel](https://vercel.com/) |

## 📁 Estructura del Projecte

```
moodcam/
├── public/
│   ├── logo-esplubot.png          # Logo / favicon de l'app
│   └── models/                    # Fitxers de models ML pre-entrenats
│       ├── blazeface.{json,bin}   # Model de detecció facial
│       ├── facemesh.{json,bin}    # Model de malla facial / landmarks
│       ├── emotion.{json,bin}     # Model de classificació d'emocions
│       └── faceres.{json,bin}     # Model de descripció facial (edat/gènere)
├── src/
│   ├── main.jsx                   # Punt d'entrada React (StrictMode)
│   ├── App.jsx                    # Layout principal: capçalera, càmera, panell d'emocions, peu de pàgina
│   ├── index.css                  # Importació de Tailwind CSS
│   ├── components/
│   │   ├── CameraView.jsx         # Vídeo + canvas superposat amb indicador en directe
│   │   └── EmotionDisplay.jsx     # Emoció dominant, barres d'emocions
│   └── hooks/
│       └── useFaceDetection.js    # Hook principal: càrrega de models, càmera, bucle de detecció
├── index.html                     # Shell HTML (lang="es")
├── vite.config.js                 # Plugins Vite + React + Tailwind
├── eslint.config.js               # Configuració plana d'ESLint
├── vercel.json                    # Configuració de desplegament a Vercel amb capçaleres de memòria cau
└── package.json
```

## 🏗 Arquitectura

### Pipeline de Detecció

1. **Càrrega de models** — En muntar el component, `useFaceDetection` crea una instància singleton de `Human`, carrega els models des de `/models` i els preescalfa (warmup).
2. **Accés a la càmera** — Quan l'usuari prem "Iniciar Cámara", el hook sol·licita `getUserMedia` amb la càmera frontal a 640×480.
3. **Bucle de detecció** — Un cop el vídeo comença a reproduir-se, un bucle `requestAnimationFrame` crida contínuament a `human.detect(video)`, que executa BlazeFace → FaceMesh → Classificació d'emocions.
4. **Dibuixat** — La malla facial detectada es dibuixa sobre un `<canvas>` superposat usant `human.draw.face()` amb renderitzat de polígons.
5. **Actualització d'estat** — Les puntuacions d'emocions i l'emoció dominant s'envien a l'estat de React i són renderitzats per `EmotionDisplay`.

### Decisions de Disseny Clau

- **Patró singleton** per a la instància de `Human` que evita re-descarregar els models en cada re-render.
- **Efecte mirall** — Tant el vídeo com el canvas usen `scaleX(-1)` perquè la càmera actuï com un mirall.
- **Un sol rostre** — `maxDetected: 1` manté la inferència ràpida processant només un rostre.
- **Adaptació al frame-rate** — Usa `requestAnimationFrame` perquè la velocitat de detecció s'adapti a les capacitats del dispositiu.

## 🚀 Inici Ràpid

### Requisits Previs

- **Node.js** ≥ 18
- **npm** (o qualsevol gestor de paquets compatible)
- Un dispositiu amb **webcam** i un navegador modern (Chrome, Firefox, Edge, Safari)

### Instal·lació

```bash
git clone <url-del-repositori>
cd moodcam
npm install
```

### Desenvolupament

```bash
npm run dev
```

S'obre a `http://localhost:5173`. Fes clic a **"📷 Iniciar Cámara"**, concedeix permisos de càmera i observa com es detecten les teves emocions en directe.

### Build per a Producció

```bash
npm run build
npm run preview   # previsualitzar el build de producció localment
```

### Desplegar a Vercel

```bash
npx vercel
```

El `vercel.json` inclòs configura la comanda de build, el directori de sortida i estableix `Cache-Control: public, max-age=31536000, immutable` en tots els fitxers de models sota `/models/`.

## ⚙️ Configuració de Detecció

L'app inclou un panell de configuració (icona ⚙️ a la capçalera) que permet ajustar tots els paràmetres de detecció en temps real. Els canvis s'apliquen instantàniament sense recarregar models i es **guarden automàticament a `localStorage`**, de manera que la teva configuració preferida es restaura a la següent visita.

### 🔍 Detector Facial

Paràmetres que controlen com es localitzen els rostres al fotograma de vídeo.

| Paràmetre | Default | Rang | Descripció |
|---|---|---|---|
| **Confiança mín.** | `0.50` | 0.10 – 1.00 | Puntuació mínima per acceptar un rostre detectat. Valors més alts redueixen falsos positius (p. ex. objectes confosos amb cares) però poden perdre rostres parcialment visibles. |
| **Màx. rostres** | `1` | 1 – 5 | Nombre màxim de rostres a detectar simultàniament. Mantenir-lo a 1 ofereix el millor rendiment. |
| **IoU Threshold** | `0.10` | 0.01 – 0.90 | Llindar d'Intersection over Union per a Non-Maximum Suppression. Controla quant poden solapar-se dos bounding boxes abans de descartar el més feble. Valors més baixos són més agressius eliminant duplicats. |
| **Correcció de rotació** | `off` | on / off | Habilita detecció facial multi-angle. Millora la precisió amb caps inclinats però augmenta significativament el temps de processament. |
| **Skip frames** | `99` | 0 – 100 | Frames consecutius màxims en els quals el detector pot reutilitzar bounding boxes de la memòria cau en lloc de re-executar-se. Funciona juntament amb la sensibilitat de memòria cau. |
| **Skip time (ms)** | `2500` | 0 – 5000 | Temps màxim en mil·lisegons que el detector pot reutilitzar resultats en memòria cau. Passat aquest temps es força una nova detecció independentment dels skip frames. |

### 🎭 Emocions

Paràmetres del model de classificació d'emocions que s'executa sobre cada rostre detectat.

| Paràmetre | Default | Rang | Descripció |
|---|---|---|---|
| **Confiança mín.** | `0.30` | 0.01 – 0.80 | Puntuació mínima per incloure una emoció als resultats. **És el paràmetre més impactant per a l'estabilitat.** Valors més alts filtren emocions de baixa confiança que causen parpelleig entre estats. |
| **Skip frames** | `99` | 0 – 100 | Frames màxims que el model d'emoció pot reutilitzar el seu resultat previ de la memòria cau. Valors alts redueixen càrrega de CPU/GPU però fan les actualitzacions menys responsives. |
| **Skip time (ms)** | `1500` | 0 – 5000 | Temps màxim abans de forçar el model d'emoció a re-executar-se. Valors baixos donen actualitzacions més ràpides; valors alts produeixen lectures més estables (però amb més retard). |

### 📊 Suavitzat

Mitjana mòbil exponencial (EMA) personalitzada aplicada sobre els scores d'emocions crus per reduir salts abruptes. Aquesta no és una funcionalitat nativa de `@vladmandic/human` — està implementada al hook de detecció de l'app.

Fórmula: `suavitzat = α × cru + (1 − α) × anterior`

| Paràmetre | Default | Rang | Descripció |
|---|---|---|---|
| **Activar suavitzat** | `on` | on / off | Activa/desactiva la interpolació temporal de puntuacions d'emocions. |
| **Factor de suavitzat (α)** | `0.25` | 0.05 – 0.95 | Pes donat a la nova lectura crua. **Valors baixos** (p. ex. 0.10) produeixen resultats molt suaus i lents a canviar. **Valors alts** (p. ex. 0.80) segueixen les dades crues de prop amb mínim retard. |

### 🖼 Filtres d'Imatge

Preprocessament accelerat per GPU aplicat al fotograma de vídeo abans de la inferència (latència quasi nul·la via WebGL).

| Paràmetre | Default | Rang | Descripció |
|---|---|---|---|
| **Equalització** | `on` | on / off | Equalització d'histograma de la imatge d'entrada i regions facials retallades. **Recomanat per a condicions d'il·luminació variable** — normalitza la distribució de brillantor perquè el model rebi inputs més consistents. |
| **Auto-brillantor** | `on` | on / off | Ajusta la brillantor automàticament segons l'escena. Només actiu quan la memòria cau de frames està habilitada (sensibilitat de memòria cau > 0). |
| **Nitidesa** | `0.00` | 0.00 – 1.00 | Filtre de realç de vores. Valors baixos (0.1–0.3) poden ajudar amb webcams borroses. Valors alts poden amplificar el soroll. |
| **Brillantor** | `0.00` | −1.00 – 1.00 | Ajust manual de brillantor. Negatiu enfosqueix, positiu aclareix. |
| **Contrast** | `0.00` | −1.00 – 1.00 | Ajust manual de contrast. Negatiu redueix el contrast, positiu l'augmenta. |
| **Desenfocament** | `0` | 0 – 15 | Radi de desenfocament gaussià en píxels. Pot reduir soroll en càmeres amb gra, però massa perjudicarà la precisió de detecció. |

### ⚡ Memòria Cau i Rendiment

| Paràmetre | Default | Rang | Descripció |
|---|---|---|---|
| **Sensibilitat de memòria cau** | `0.70` | 0.00 – 1.00 | Controla quant ha de canviar l'escena entre frames per invalidar la memòria cau i forçar una re-detecció. `0` desactiva la memòria cau completament (cada frame es processa). Valors més alts permeten més salts de frames quan l'escena és estable, reduint l'ús de CPU/GPU. Aquest paràmetre **habilita** el mecanisme de skip frames/time a tots els sub-models. |

### 💾 Persistència

Tots els ajustos es guarden automàticament a **`localStorage`** sota la clau `moodcam-detection-config`. En reobrir l'app, la teva configuració anterior es restaura. En prémer "🔄 Restaurar defaults" es restableixen tots els valors i s'eliminen les dades guardades.

### 🎯 Consells d'Ajust Recomanats

Per obtenir les lectures d'emocions més estables, prova aquesta combinació:

1. **Confiança mín. emocions** → `0.30`–`0.40` (elimina soroll)
2. **Suavitzat** → activat, factor `0.15`–`0.25` (amorteix canvis ràpids)
3. **Equalització** → activada (normalitza la il·luminació)
4. **Desenfocament** → `1`–`2` (si la teva càmera té soroll)

## 🔒 Privacitat

Tot el processament passa **completament al teu navegador**. Cap fotograma de vídeo, imatge o resultat de detecció es transmet mai a un servidor. Els models de ML són fitxers estàtics que es serveixen juntament amb l'aplicació.

## 📖 Glossari

| Terme | Definició |
|---|---|
| **IA (Intel·ligència Artificial)** | Tecnologia que permet als ordinadors realitzar tasques que normalment requereixen intel·ligència humana, com reconèixer rostres o emocions. |
| **Aprenentatge Automàtic (ML)** | Branca de la IA on els ordinadors aprenen patrons a partir de dades (en aquest cas, milers d'imatges de rostres) en lloc de ser programats explícitament. |
| **Model** | Un fitxer que conté el "coneixement après" de l'entrenament. Moodcam usa diversos models: un per trobar rostres, un altre per mapejar punts facials i un altre per classificar emocions. |
| **Inferència** | El procés de passar dades noves (la imatge de la teva webcam) a un model per obtenir una predicció (p. ex. "feliç 82%"). |
| **TensorFlow.js** | Una llibreria de Google que permet executar models de ML directament al navegador web usant la CPU o GPU del teu dispositiu. |
| **@vladmandic/human** | La llibreria de codi obert que usa Moodcam. Embolcalla TensorFlow.js i proporciona detecció facial, reconeixement d'emocions i altres capacitats llestes per usar. |
| **BlazeFace** | Un model lleuger que localitza ràpidament rostres en una imatge i retorna els seus bounding boxes (coordenades rectangulars). |
| **FaceMesh** | Un model que identifica més de 468 punts de referència en un rostre (ulls, nas, boca, mandíbula, etc.), formant una malla detallada. |
| **Bounding Box** | El rectangle dibuixat al voltant d'un rostre detectat, definit per la seva posició i mida a la imatge. |
| **Puntuació de confiança** | Un nombre de 0 a 1 (mostrat com 0%–100%) que indica com de segur està el model de la seva predicció. Major = més certesa. |
| **IoU (Intersection over Union)** | Una mesura del solapament entre dos bounding boxes. S'usa per eliminar deteccions duplicades del mateix rostre. |
| **NMS (Non-Maximum Suppression)** | Un algoritme que elimina deteccions redundants superposades, conservant només la més forta. |
| **Suavitzat / EMA** | Mitjana Mòbil Exponencial — tècnica que barreja la lectura actual amb les anteriors per reduir salts bruscos i produir resultats més estables. |
| **Memòria cau (cache)** | Magatzem temporal de resultats de detecció previs. Quan l'escena no ha canviat gaire, es reutilitzen els resultats en memòria cau per estalviar processament. |
| **Skip Frames** | Nombre de fotogrames de vídeo consecutius en els quals el sistema pot reutilitzar resultats en memòria cau en lloc d'executar el model de nou. |
| **Equalització** | Tècnica de processament d'imatge que redistribueix els nivells de brillantor per millorar el contrast, especialment útil amb il·luminació desigual. |
| **WebGL** | Tecnologia del navegador que permet a la GPU (targeta gràfica) accelerar càlculs, fent els filtres d'imatge i la inferència ML més ràpids. |
| **localStorage** | Funcionalitat del navegador que emmagatzema petites quantitats de dades (com els teus ajustos) al teu dispositiu, persistint entre recàrregues de pàgina i reinicis del navegador. |
| **Webcam** | La càmera integrada o externa del teu dispositiu. Moodcam la usa per capturar vídeo en directe per a la seva anàlisi. |
| **Costat del client (client-side)** | Processament que passa enterament al teu dispositiu (al navegador), en contraposició a enviar-se a un servidor remot. |
