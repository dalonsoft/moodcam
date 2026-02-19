import useFaceDetection from './hooks/useFaceDetection'
import CameraView from './components/CameraView'
import EmotionDisplay from './components/EmotionDisplay'

function App() {
  const {
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
  } = useFaceDetection()

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="py-4 px-4 flex items-center justify-center gap-3 border-b border-gray-800">
        <img src="/logo-esplubot.png" alt="Esplubot" className="w-10 h-10 rounded-full shadow-md" />
        <div className="text-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, #1378BC, #5AB5DB)' }}>
            Moodcam
          </h1>
          <p className="text-xs text-gray-500">by Esplubot</p>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col lg:flex-row items-start justify-center gap-6 p-4 max-w-5xl mx-auto w-full">
        {/* Columna izquierda: Cámara */}
        <div className="w-full lg:w-3/5 space-y-4">
          <CameraView videoRef={videoRef} canvasRef={canvasRef} cameraActive={cameraActive} />

          {/* Controles */}
          <div className="flex justify-center gap-3">
            {!cameraActive ? (
              <button
                onClick={startCamera}
                disabled={!modelsLoaded || loading}
                className="px-6 py-2.5 rounded-xl font-medium text-sm transition-all
                  disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
                style={{ background: 'linear-gradient(to right, #1378BC, #249BD7)', boxShadow: '0 10px 15px -3px rgba(19,120,188,0.25)' }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Cargando modelos...
                  </span>
                ) : (
                  '📷 Iniciar Cámara'
                )}
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="px-6 py-2.5 rounded-xl font-medium text-sm transition-all
                  bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/25"
              >
                ⏹ Detener
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-xl p-3 text-sm text-center">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Columna derecha: Emociones */}
        <div className="w-full lg:w-2/5 bg-gray-900 rounded-2xl p-5 shadow-xl border border-gray-800">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Estado de ánimo
          </h2>
          <EmotionDisplay emotions={emotions} dominant={dominant} age={age} gender={gender} />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 text-center text-xs text-gray-600 border-t border-gray-800">
        Moodcam by Esplubot · Powered by @vladmandic/human
      </footer>
    </div>
  )
}

export default App
