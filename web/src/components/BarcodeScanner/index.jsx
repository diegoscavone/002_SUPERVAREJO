import { useEffect, useRef } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

export function BarcodeScanner({ onScanSuccess }) {
  const scannerRef = useRef(null)

  useEffect(() => {
    // Verificamos se o elemento existe para evitar erros de renderização
    if (!document.getElementById('reader')) return

    const html5QrCode = new Html5Qrcode('reader', {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.UPC_A
      ],
      verbose: false
    })

    scannerRef.current = html5QrCode

    const config = {
      fps: 20,
      qrbox: { width: 300, height: 160 }, // Formato retangular para as barras
      aspectRatio: 1.777778,
      videoConstraints: {
        facingMode: 'environment',
        focusMode: 'continuous',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    }

    html5QrCode
      .start(
        { facingMode: 'environment' },
        config,
        decodedText => {
          // Vibra e envia o código
          if (navigator.vibrate) navigator.vibrate(100)
          onScanSuccess(decodedText)
        },
        () => {
          /* Ignora erros de frame */
        }
      )
      .catch(err => {
        console.error('Erro ao iniciar câmera:', err)
      })

    return () => {
      // Cleanup seguro
      if (html5QrCode.isScanning) {
        html5QrCode
          .stop()
          .then(() => html5QrCode.clear())
          .catch(console.error)
      }
    }
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
