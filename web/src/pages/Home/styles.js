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
  flex-direction: row; /* Lado a lado por padrão */
  flex-wrap: wrap;    /* Permite empilhar quando não houver espaço */
  align-items: flex-start;
  width: 100%;
  flex: 1;
  padding: 20px;
  gap: 40px;

  /* Quando a tela for menor que XL (ou seu breakpoint mobile), empilha */
  @media (max-width: ${DEVICE_BREAKPOINTS.XL}) {
    flex-direction: column; 
    align-items: center; /* Centraliza formulário e cartaz no mobile */
    gap: 20px;
    padding: 10px;
  }
`
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 450px; /* Mantém o formulário legível */

  @media (max-width: ${DEVICE_BREAKPOINTS.XL}) {
    max-width: 100%; /* Ocupa a largura disponível no mobile */
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
