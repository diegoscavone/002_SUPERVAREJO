import { Container } from "./styles"

export function InputNumber({...rest}){
  return (
    <Container>
      <input {...rest} />
    </Container>
  )
}