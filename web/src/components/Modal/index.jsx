import { PiX } from 'react-icons/pi'
import { Container } from './styles'

export function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null
  return (
    <Container>
      <div className="modal">
        <button className="close-button" onClick={onClose}>
          <PiX/>
        </button>
        <div className="modal-content">{children}</div>
      </div>
    </Container>
  )
}
