import { Container } from './styles'

export function Input({ type = 'text', onEnter, icon: Icon, ...rest }) {
  function handleKeyDown(event) {
    if (type === 'number') {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault()
      } else if (event.key === 'Enter') {
        if (onEnter) {
          onEnter()
        }
      }
    }

    if (rest.onKeyDown) {
      rest.onKeyDown(event)
    }
  }

  return (
    <Container>
      {Icon && <Icon size={22} />}
      <input type={type} onKeyDown={handleKeyDown} {...rest} />
    </Container>
  )
}
