import { Container } from './styles'

export function Button({ title, icon: Icon, color, size, ...rest }) {
  return (
    <Container type="button" color={color} size={size} {...rest}>
      {Icon && <Icon size={20} />}
      {title}
    </Container>
  )
}
