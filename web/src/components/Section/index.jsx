import { Container } from './styles'

export function Section({ title, children }) {
  return (
    <Container>
      <fieldset>
      {title && <legend>{title}</legend>}
        {children}
      </fieldset>
    </Container>
  )
}
