import styled from 'styled-components'
import { DEVICE_BREAKPOINTS } from '../../styles/devices'

export const Container = styled.div`
  width: 100%;
  height: 100vh;

  display: grid;
  grid-template-columns: 50px auto;
  grid-template-areas:
    'header header'
    'nav content'
    'nav footer';

  background-color: ${({ theme }) => theme.COLORS.BACKGROUND_200};
  @media (max-width: ${DEVICE_BREAKPOINTS.LG}) {
    grid-template-columns: 50px auto;
  }
`

export const Content = styled.div`
  grid-area: content;
  display: flex;
  justify-content: center;
  min-height: 750px;
  background-color: ${({ theme }) => theme.COLORS.BACKGROUND_200};
  @media (max-width: ${DEVICE_BREAKPOINTS.XL}) {
    min-height: 500px;
  }
`

export const Form = styled.div`
  width: 40%;
  padding: 3rem ;
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
