import styled from 'styled-components'
import { DEVICE_BREAKPOINTS } from '../../styles/devices'

export const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.COLORS.BACKGROUND_200};
`

export const Content = styled.div`
  display: flex;
  flex-direction: column; /* Agora empilha as seções verticalmente */
  width: 100%;
  flex: 1;
  padding: 20px;
  gap: 16px; /* Espaçamento controlado entre as seções */

  @media (max-width: ${DEVICE_BREAKPOINTS.MD}) {
    padding: 10px;
    gap: 20px;
  }
`

export const Form = styled.div`
  width: 40%;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  @media (max-width: ${DEVICE_BREAKPOINTS.XL}) {
    width: 50%;
  }
`

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

export const ButtonWrapper = styled.div`
  display: flex;
  gap: 1.6rem;
  width: 40%;

  @media (max-width: ${DEVICE_BREAKPOINTS.LG}) {
    /* width: 35%; */
  }
`

export const Footer = styled.div`
  grid-area: footer;
`
