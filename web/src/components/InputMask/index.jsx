import { Container } from './styles'
import { IMaskInput } from 'react-imask'

export function InputMask({ icon: Icon, ...rest }) {
  return (
    <Container>
      <IMaskInput {...rest} />
      {Icon && <Icon size={24} />}
    </Container>
  )
}
