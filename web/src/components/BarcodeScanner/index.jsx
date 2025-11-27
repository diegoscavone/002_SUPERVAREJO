import React, { useState } from 'react'
import {
  BrowserMultiFormatReader,
  NotFoundException,
  BarcodeFormat
} from '@zxing/library'
import styled from 'styled-components'
import { Button } from '../../components/Button'

const ScannerContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
`

const VideoContainer = styled.div`
  width: 100%;
  max-width: 500px;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  margin-bottom: 15px;

  video {
    width: 100%;
    height: auto;
    display: block;
  }
`

const ScanOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`

const ScanFrame = styled.div`
  width: 70%;
  height: 30%;
  border: 2px solid #4caf50;
  border-radius: 8px;
  position: relative;
  box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.3);

  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 2px;
    background: #4caf50;
    top: 50%;
    left: 0;
    animation: scan 2s infinite;
  }

  @keyframes scan {
    0% {
      top: 20%;
    }
    50% {
      top: 80%;
    }
    100% {
      top: 20%;
    }
  }
`

const StatusMessage = styled.div`
  width: 100%;
  max-width: 500px;
  text-align: center;
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
  color: ${props => (props.error ? '#f44336' : '#333')};
  background-color: ${props => (props.error ? '#ffebee' : '#f5f5f5')};
`

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
`

function BarcodeScanner({ onDetected, onError }) {
  const [message, setMessage] = useState(
    'Clique em "Iniciar Scanner" para ativar a câmera'
  )
  const [isScanning, setIsScanning] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [reader, setReader] = useState(null)
  const [videoElement, setVideoElement] = useState(null)

  const startScanner = async () => {
    setHasError(false)

    try {
      // Verificar suporte a getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Seu navegador não suporta acesso à câmera')
      }

      setMessage('Inicializando câmera...')

      // Criar o elemento de vídeo se não existir
      if (!videoElement) {
        const video = document.getElementById('zxing-video-element')
        if (video) {
          setVideoElement(video)
        } else {
          throw new Error('Elemento de vídeo não encontrado')
        }
      }

      // Criar o leitor de código de barras
      const codeReader = new BrowserMultiFormatReader()

      // Configurar formatos a serem reconhecidos
      const formats = [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_39,
        BarcodeFormat.CODE_128
      ]

      codeReader.hints.set(2, formats)

      // Listar dispositivos de vídeo (câmeras)
      const videoDevices = await codeReader.listVideoInputDevices()
      console.log('Dispositivos disponíveis:', videoDevices)

      // Encontrar câmera traseira, se disponível
      let selectedDeviceId = null

      for (const device of videoDevices) {
        if (
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('traseira') ||
          device.label.toLowerCase().includes('rear')
        ) {
          selectedDeviceId = device.deviceId
          break
        }
      }

      // Se não encontrou câmera traseira, usar a primeira disponível
      if (!selectedDeviceId && videoDevices.length > 0) {
        selectedDeviceId = videoDevices[0].deviceId
      }

      if (!selectedDeviceId) {
        throw new Error('Nenhuma câmera disponível no dispositivo')
      }

      setMessage('Câmera ativada. Aponte para um código de barras...')

      // Iniciar o scanner com a câmera selecionada
      codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        'zxing-video-element',
        (result, error) => {
          if (result) {
            // Código lido com sucesso
            console.log('Código lido:', result.getText())
            setMessage(`Código detectado: ${result.getText()}`)

            // Parar o scanner após detecção bem-sucedida
            codeReader.reset()
            setIsScanning(false)

            // Chamar callback com o código lido
            if (onDetected) {
              onDetected(result.getText())
            }
          }

          if (error && !(error instanceof NotFoundException)) {
            // Ignorar erros de "não encontrado", que são normais durante o escaneamento
            console.error('Erro durante leitura:', error)
          }
        }
      )

      setReader(codeReader)
      setIsScanning(true)
    } catch (error) {
      console.error('Erro ao iniciar scanner:', error)
      setMessage(`Erro: ${error.message || 'Falha ao iniciar o scanner'}`)
      setHasError(true)
      setIsScanning(false)

      if (onError) {
        onError(error)
      }
    }
  }

  const stopScanner = () => {
    if (reader) {
      reader.reset()
      setIsScanning(false)
      setMessage('Scanner parado. Clique em "Iniciar Scanner" para reiniciar.')
    }
  }

  return (
    <ScannerContainer>
      <StatusMessage error={hasError}>{message}</StatusMessage>

      <VideoContainer>
        <video id="zxing-video-element" />
        {isScanning && (
          <ScanOverlay>
            <ScanFrame />
          </ScanOverlay>
        )}
      </VideoContainer>

      <ButtonContainer>
        {!isScanning ? (
          <Button
            title="Iniciar Scanner"
            color="GREEN"
            onClick={startScanner}
          />
        ) : (
          <Button title="Parar Scanner" color="RED" onClick={stopScanner} />
        )}
      </ButtonContainer>
    </ScannerContainer>
  )
}

export default BarcodeScanner
