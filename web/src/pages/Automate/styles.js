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
  padding: 3rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  @media (max-width: ${DEVICE_BREAKPOINTS.XL}) {
    gap: 1rem;
    padding: 1.6rem;
  }
  @media (max-width: ${DEVICE_BREAKPOINTS.XXL}) {
    gap: 1rem;
    padding: 1.6rem;
  }
`
export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: end;
`
export const Form = styled.div`
  width: 50%;

  display: flex;
  gap: 1.6rem;
  @media (max-width: ${DEVICE_BREAKPOINTS.LG}) {
    width: 100%;
  }
  
`
export const Message = styled.div`
  width: 100%;
  min-height: 450px;
  display: flex;
  align-items: center;
  justify-content: center;

  > p {
    font-weight: 500;
    font-size: 1.8rem;
  }

  @media (max-width: ${DEVICE_BREAKPOINTS.LG}) {
    min-height: 250px;
  }

  @media (max-width: ${DEVICE_BREAKPOINTS.XL}) {
    min-height: 355px;
  }

  @media (max-width: ${DEVICE_BREAKPOINTS.XXL}) {
    min-height: 350px;
  }
`
export const Label = styled.label`
  margin-bottom: 0.8rem;
`
