import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export function BarcodeScanner({ onScanSuccess }) {
  const scannerRef = useRef(null)

  useEffect(() => {
    // 1. Instancia o scanner apontando para o ID 'reader'
    const html5QrCode = new Html5Qrcode('reader', {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128
      ],
      verbose: false
    })
    scannerRef.current = html5QrCode

    const config = {
      fps: 30, // Aumentamos para 30 para não perder frames no movimento
      qrbox: { width: 320, height: 180 }, // Caixa retangular para alinhar as barras
      aspectRatio: 1.777778,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true // Tenta usar aceleração de hardware do celular
      },
      videoConstraints: {
        facingMode: 'environment',
        focusMode: 'continuous',
        // Se o foco estiver ruim, aumentamos a resolução para o sensor enxergar as linhas finas
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    }

    // 2. Inicia a câmera automaticamente
    // 'facingMode: environment' tenta usar a câmera traseira em celulares
    html5QrCode
      .start({ facingMode: 'environment' }, config, decodedText => {
        // Feedback imediato antes de fechar
        if (navigator.vibrate) navigator.vibrate(100)

        onScanSuccess(decodedText)
      })
      .catch(err => console.error('Erro ao iniciar:', err))

    return () => stopScanner()
  }, [onScanSuccess])

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch (err) {
        console.error('Falha ao parar o scanner no cleanup:', err)
      }
    }
  }

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden rounded-xl border-2 border-orange-500 bg-black relative min-h-[250px]">
      <div id="reader" className="w-full"></div>
      {/* Overlay opcional para ajudar o usuário a centralizar o código */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="border-2 border-dashed border-white/50 w-[280px] h-[150px] rounded-lg"></div>
      </div>
    </div>
  )
}
