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

  @media (max-width: ${DEVICE_BREAKPOINTS.MD}) {
    /* gap: 6rem; */
  }
`
export const Form = styled.form`
  width: 400px;
  height: 420px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  padding: 3rem;

  background-color: ${({ theme }) => theme.COLORS.WHITE};

  border-radius: 3rem;
  > img {
    width: 250px;
    margin-bottom: 2rem;
  }

  .input-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .button-wrapper{
    width: 100%;
    display: flex;
    margin-top: 1rem;
  }

  .button-wrapper button{
    flex-grow: 1;
  }

  @media (max-width: ${DEVICE_BREAKPOINTS.LG}) {
    width: 360px;
    height: 420px;
  }
`

export const Label = styled.label`
  margin-bottom: 0.8rem;
`
