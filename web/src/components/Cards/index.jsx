import { Container } from './styles'
import { PiPencil } from 'react-icons/pi'

export function Cards({ title, img, onDelete, onClick, ...rest }) {
  return (
    <Container onClick={onClick} {...rest}>
      <img src={img} alt={title} />
      <h3>{title}</h3>
    </Container>
  )
}
