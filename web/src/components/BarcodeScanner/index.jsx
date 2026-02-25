import { useEffect } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

export function BarcodeScanner({ onScanSuccess }) {
  useEffect(() => {
    // Configuração do scanner
    const scanner = new Html5QrcodeScanner('reader', {
      fps: 10,
      qrbox: { width: 280, height: 150 }, // Formato retangular para EAN-13
      aspectRatio: 1.777778 // 16:9
    })

    scanner.render(
      decodedText => {
        // Quando ler com sucesso, passamos o código para o componente pai
        onScanSuccess(decodedText)
        scanner.clear() // Para a câmera após a leitura
      },
      error => {
        // Erros de leitura (comum enquanto a câmera foca) são ignorados aqui
      }
    )

    // Cleanup: Quando fechar o componente, desliga a câmera
    return () => {
      scanner
        .clear()
        .catch(error => console.error('Erro ao limpar scanner', error))
    }
  }, [onScanSuccess])

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden rounded-xl border-2 border-orange-500">
      <div id="reader"></div>
    </div>
  )
}
