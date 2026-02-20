import { useState } from 'react'

const SECTIONS = [
  {
    key: 'detector',
    title: '🔍 Detector Facial',
    description: 'Controla cómo se detectan los rostros en la imagen.',
    params: [
      { key: 'face.detector.minConfidence', label: 'Confianza mínima', type: 'range', min: 0.1, max: 1, step: 0.05, description: 'Umbral para aceptar un rostro detectado. Más alto = menos falsos positivos.' },
      { key: 'face.detector.maxDetected', label: 'Máx. rostros', type: 'range', min: 1, max: 5, step: 1, description: 'Número máximo de rostros a detectar simultáneamente.' },
      { key: 'face.detector.iouThreshold', label: 'IoU Threshold', type: 'range', min: 0.01, max: 0.9, step: 0.01, description: 'Overlap mínimo entre detecciones antes de descartar duplicados (NMS).' },
      { key: 'face.detector.rotation', label: 'Corrección de rotación', type: 'toggle', description: 'Mejora detección en ángulos extremos pero reduce rendimiento.' },
      { key: 'face.detector.skipFrames', label: 'Skip frames', type: 'range', min: 0, max: 100, step: 1, description: 'Frames máximos reutilizando bounding boxes del caché.' },
      { key: 'face.detector.skipTime', label: 'Skip time (ms)', type: 'range', min: 0, max: 5000, step: 100, description: 'Milisegundos máximos sin re-ejecutar el detector.' },
    ]
  },
  {
    key: 'emotion',
    title: '🎭 Emociones',
    description: 'Ajustes del modelo de clasificación de emociones.',
    params: [
      { key: 'face.emotion.minConfidence', label: 'Confianza mínima', type: 'range', min: 0.01, max: 0.8, step: 0.01, description: 'Umbral para incluir una emoción en los resultados. Más alto = menos ruido/flickering.' },
      { key: 'face.emotion.skipFrames', label: 'Skip frames', type: 'range', min: 0, max: 100, step: 1, description: 'Frames que reutiliza el resultado cacheado sin re-ejecutar el modelo.' },
      { key: 'face.emotion.skipTime', label: 'Skip time (ms)', type: 'range', min: 0, max: 5000, step: 100, description: 'Tiempo máximo sin re-ejecutar el modelo de emoción.' },
    ]
  },
  {
    key: 'smoothing',
    title: '📊 Suavizado',
    description: 'Media móvil exponencial aplicada sobre las emociones detectadas para reducir saltos.',
    params: [
      { key: 'smoothing.enabled', label: 'Activar suavizado', type: 'toggle', description: 'Aplica interpolación temporal a los scores de emociones.' },
      { key: 'smoothing.factor', label: 'Factor de suavizado', type: 'range', min: 0.05, max: 0.95, step: 0.05, description: 'Peso de los datos nuevos (0.05 = muy suave, 0.95 = casi sin suavizado).' },
    ]
  },
  {
    key: 'filter',
    title: '🖼 Filtros de Imagen',
    description: 'Preprocesamiento aplicado antes de la inferencia (GPU, latencia ~0).',
    params: [
      { key: 'filter.equalization', label: 'Ecualización', type: 'toggle', description: 'Ecualización de histograma. Mejora detección con iluminación variable.' },
      { key: 'filter.autoBrightness', label: 'Auto-brillo', type: 'toggle', description: 'Ajusta el brillo automáticamente según la escena.' },
      { key: 'filter.sharpness', label: 'Nitidez', type: 'range', min: 0, max: 1, step: 0.05, description: 'Mejora bordes. Útil con cámaras de baja calidad.' },
      { key: 'filter.brightness', label: 'Brillo', type: 'range', min: -1, max: 1, step: 0.05, description: 'Ajuste manual de brillo.' },
      { key: 'filter.contrast', label: 'Contraste', type: 'range', min: -1, max: 1, step: 0.05, description: 'Ajuste manual de contraste.' },
      { key: 'filter.blur', label: 'Desenfoque', type: 'range', min: 0, max: 15, step: 1, description: 'Radio de desenfoque en px. Reduce ruido en imágenes ruidosas.' },
    ]
  },
  {
    key: 'cache',
    title: '⚡ Caché y Rendimiento',
    description: 'Controla el sistema de caché de frames que habilita el skip de modelos.',
    params: [
      { key: 'cacheSensitivity', label: 'Sensibilidad de caché', type: 'range', min: 0, max: 1, step: 0.05, description: 'Cuánto debe cambiar la escena para invalidar el caché. 0 = desactivado, 1 = muy permisivo.' },
    ]
  },
]

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

function RangeParam({ param, value, onChange }) {
  const displayValue = Number.isInteger(param.step) ? value : value.toFixed(2)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">{param.label}</label>
        <span className="text-xs font-mono text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-md">{displayValue}</span>
      </div>
      <input
        type="range"
        min={param.min}
        max={param.max}
        step={param.step}
        value={value}
        onChange={(e) => onChange(param.key, Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer
          bg-gray-700 accent-sky-500
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sky-500 [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:hover:bg-sky-400 [&::-webkit-slider-thumb]:transition-colors"
      />
      <div className="flex justify-between text-[10px] text-gray-600">
        <span>{param.min}</span>
        <span>{param.max}</span>
      </div>
    </div>
  )
}

function ToggleParam({ param, value, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-300">{param.label}</label>
      <button
        onClick={() => onChange(param.key, !value)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${value ? 'bg-sky-500' : 'bg-gray-600'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  )
}

export default function SettingsModal({ isOpen, onClose, config, onConfigChange, onReset }) {
  const [expandedSection, setExpandedSection] = useState('emotion')

  if (!isOpen) return null

  const handleChange = (key, value) => {
    onConfigChange(key, value)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg max-h-[85vh] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-white">⚙️ Configuración de Detección</h2>
            <p className="text-xs text-gray-500 mt-0.5">Ajusta los parámetros para afinar la detección de emociones</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
          {SECTIONS.map((section) => {
            const isExpanded = expandedSection === section.key

            return (
              <div key={section.key} className="border border-gray-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : section.key)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="text-left">
                    <span className="text-sm font-semibold text-white">{section.title}</span>
                    {!isExpanded && (
                      <span className="block text-xs text-gray-500 mt-0.5">{section.description}</span>
                    )}
                  </div>
                  <span className={`text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    ▾
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 space-y-3 border-t border-gray-800/50 pt-3">
                    <p className="text-xs text-gray-500 mb-2">{section.description}</p>
                    {section.params.map((param) => {
                      const value = getNestedValue(config, param.key)

                      return (
                        <div key={param.key}>
                          {param.type === 'range' ? (
                            <RangeParam param={param} value={value ?? param.min} onChange={handleChange} />
                          ) : (
                            <ToggleParam param={param} value={value ?? false} onChange={handleChange} />
                          )}
                          <p className="text-[11px] text-gray-600 mt-1">{param.description}</p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-800">
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            🔄 Restaurar defaults
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-white rounded-lg transition-all"
            style={{ background: 'linear-gradient(to right, #1378BC, #249BD7)' }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
