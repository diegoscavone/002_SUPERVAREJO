import { Container } from './styles'

export function Textarea({ ...rest }) {
  return (
    <Container>
      <textarea {...rest} />
    </Container>
  )
}
