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
