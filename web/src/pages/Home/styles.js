import styled from 'styled-components'
import { DEVICE_BREAKPOINTS } from '../../styles/devices'

export const Container = styled.div`
 width: 100%;
  min-height: 100vh;
  display: flex;       /* Mudamos de Grid para Flex */
  flex-direction: column; 
  background-color: ${({ theme }) => theme.COLORS.BACKGROUND_200};
`
export const Content = styled.div`
display: flex;
  width: 100%;
  flex: 1; /* Faz o conteúdo ocupar o espaço restante */
`
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 45%;
  padding: 3rem;

  @media (max-width: ${DEVICE_BREAKPOINTS.XL}) {
    gap: 1rem;
    width: 55%;
    padding: 1.6rem;
  }

  @media (max-width: ${DEVICE_BREAKPOINTS.XXL}) {
    gap: 1rem;
    width: 45%;
    padding: 1.6rem;
  }

`
export const Label = styled.label`
  margin-bottom: 0.8rem;
`

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  @media (max-width: ${DEVICE_BREAKPOINTS.XL}) {
    width: 45%;
  }

  @media (max-width: ${DEVICE_BREAKPOINTS.XXL}) {
    width: 40%;
  }
`

export const ButtonSearch = styled.div`
  display: flex;
  align-items: end;
`

export const Footer = styled.div`
  grid-area: footer;
`
