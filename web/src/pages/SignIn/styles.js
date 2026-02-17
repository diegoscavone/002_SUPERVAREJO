import styled from 'styled-components'
import backgroundImg from '../../assets/background.jpg'
import { DEVICE_BREAKPOINTS } from '../../styles/devices'

export const Container = styled.div`
  width: 100%;
  height: 100vh;

  display: flex;
  align-items: center;
  justify-content: center;

  background: url(${backgroundImg}) no-repeat;
  background-size: cover;
`
