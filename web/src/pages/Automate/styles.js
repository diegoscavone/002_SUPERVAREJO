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
export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: end;
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
