import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export function BarcodeScanner({ onScanSuccess }) {
  const scannerRef = useRef(null)

  useEffect(() => {
    // 1. Instancia o scanner apontando para o ID 'reader'
    const html5QrCode = new Html5Qrcode("reader")
    scannerRef.current = html5QrCode

    const config = { 
      fps: 10, 
      qrbox: { width: 280, height: 150 },
      aspectRatio: 1.777778 
    }

    // 2. Inicia a câmera automaticamente
    // 'facingMode: environment' tenta usar a câmera traseira em celulares
    html5QrCode.start(
      { facingMode: "environment" }, 
      config,
      (decodedText) => {
        // Sucesso no scan
        onScanSuccess(decodedText)
        
        // Opcional: Para a câmera após o primeiro sucesso se desejar
        // stopScanner()
      },
      (errorMessage) => {
        // Erros de busca (ignorar para não poluir o console)
      }
    ).catch((err) => {
      console.error("Erro ao iniciar a câmera diretamente:", err)
    })

    // 3. Cleanup: Função para garantir que a câmera desligue ao fechar o componente
    return () => {
      stopScanner()
    }
  }, [onScanSuccess])

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch (err) {
        console.error("Falha ao parar o scanner no cleanup:", err)
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