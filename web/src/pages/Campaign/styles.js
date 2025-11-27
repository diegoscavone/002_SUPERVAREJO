import styled from 'styled-components'
import { DEVICE_BREAKPOINTS } from '../../styles/devices'

export const Container = styled.div`
  width: 100%;
  height: 100%;

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
`
export const Section = styled.section`
  display: flex;
  flex-wrap: wrap;
  gap: 1.6rem;
  width: 100%;

  padding: 3rem;
  border-radius: 1rem;

  @media (max-width: ${DEVICE_BREAKPOINTS.XXL}) {
    padding: 1.6rem;
  }
`
export const Form = styled.div`
width: 100%;
  padding: 3rem 3rem 0;
  display: flex;
  justify-content: end;
`
export const InputWrapper = styled.div`

  @media (max-width: ${DEVICE_BREAKPOINTS.LG}) {
    width: 20%;
  }
`
export const Footer = styled.div`
  grid-area: footer;
`
