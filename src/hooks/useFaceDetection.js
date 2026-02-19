import { useEffect, useRef, useState, useCallback } from 'react'
import { Human } from '@vladmandic/human'

const humanConfig = {
    modelBasePath: '/models',
    // Solo habilitamos lo necesario para emociones
    face: {
        enabled: true,
        detector: { enabled: true, rotation: false, maxDetected: 1, minConfidence: 0.5 },
        mesh: { enabled: true },
        emotion: { enabled: true, minConfidence: 0.1 },
        description: { enabled: false },
        iris: { enabled: false },
        antispoof: { enabled: false },
        liveness: { enabled: false },
    },
    body: { enabled: false },
    hand: { enabled: false },
    object: { enabled: false },
    gesture: { enabled: false },
    segmentation: { enabled: false },
}

// Instancia singleton para evitar recargar modelos
let humanInstance = null
function getHuman() {
    if (!humanInstance) {
        humanInstance = new Human(humanConfig)
    }
    return humanInstance
}

export default function useFaceDetection() {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const streamRef = useRef(null)
    const rafRef = useRef(null)
    const detectingRef = useRef(false)

    const [modelsLoaded, setModelsLoaded] = useState(false)
    const [cameraActive, setCameraActive] = useState(false)
    const [emotions, setEmotions] = useState(null)
    const [dominant, setDominant] = useState(null)
    const [age, setAge] = useState(null)
    const [gender, setGender] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    // Cargar modelos
    useEffect(() => {
        async function loadModels() {
            try {
                setLoading(true)
                const human = getHuman()
                await human.load()
                await human.warmup()
                setModelsLoaded(true)
            } catch (err) {
                console.error('Error cargando modelos:', err)
                setError('No se pudieron cargar los modelos de detección facial.')
            } finally {
                setLoading(false)
            }
        }
        loadModels()
    }, [])

    // Iniciar cámara
    const startCamera = useCallback(async () => {
        if (!modelsLoaded) return
        try {
            setError(null)
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                },
                audio: false,
            })
            streamRef.current = stream
            if (videoRef.current) {
                videoRef.current.srcObject = stream
            }
            setCameraActive(true)
        } catch (err) {
            console.error('Error accediendo a cámara:', err)
            setError('No se pudo acceder a la cámara. Asegúrate de dar permisos.')
        }
    }, [modelsLoaded])

    // Detener cámara
    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop())
            streamRef.current = null
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null
        }
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = null
        }
        detectingRef.current = false
        setCameraActive(false)
        setEmotions(null)
        setDominant(null)
        setAge(null)
        setGender(null)
    }, [])

    // Detección en loop
    useEffect(() => {
        if (!cameraActive || !modelsLoaded) return

        const video = videoRef.current
        if (!video) return

        const human = getHuman()

        const handlePlay = () => {
            detectingRef.current = true

            const detectLoop = async () => {
                if (!detectingRef.current) return

                try {
                    const result = await human.detect(video)
                    const canvas = canvasRef.current

                    if (canvas && video.videoWidth > 0) {
                        canvas.width = video.videoWidth
                        canvas.height = video.videoHeight
                        const ctx = canvas.getContext('2d')
                        ctx.clearRect(0, 0, canvas.width, canvas.height)

                        // Dibujar detecciones usando la API de drawing de Human
                        human.draw.face(canvas, result.face, {
                            drawBoxes: true,
                            drawLabels: false,
                            drawPoints: false,
                            drawPolygons: true,
                            fillPolygons: false,
                        })
                    }

                    if (result.face && result.face.length > 0) {
                        const face = result.face[0]

                        // Procesar emociones
                        if (face.emotion && face.emotion.length > 0) {
                            const emotionMap = {}
                            face.emotion.forEach(({ emotion, score }) => {
                                emotionMap[emotion] = score
                            })
                            setEmotions(emotionMap)

                            // Emoción dominante (primer elemento ya está ordenado por score)
                            setDominant(face.emotion[0].emotion)
                        }

                        // Edad y género (extras)
                        if (face.age) setAge(Math.round(face.age))
                        if (face.gender) setGender(face.gender)
                    } else {
                        setEmotions(null)
                        setDominant(null)
                        setAge(null)
                        setGender(null)
                    }
                } catch (err) {
                    console.error('Error en detección:', err)
                }

                // Siguiente frame con un pequeño delay para no saturar
                if (detectingRef.current) {
                    rafRef.current = requestAnimationFrame(detectLoop)
                }
            }

            detectLoop()
        }

        video.addEventListener('playing', handlePlay)
        if (!video.paused && video.readyState >= 2) handlePlay()

        return () => {
            video.removeEventListener('playing', handlePlay)
            detectingRef.current = false
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = null
            }
        }
    }, [cameraActive, modelsLoaded])

    // Cleanup al desmontar
    useEffect(() => {
        return () => {
            stopCamera()
        }
    }, [stopCamera])

    return {
        videoRef,
        canvasRef,
        modelsLoaded,
        cameraActive,
        emotions,
        dominant,
        age,
        gender,
        error,
        loading,
        startCamera,
        stopCamera,
    }
}
