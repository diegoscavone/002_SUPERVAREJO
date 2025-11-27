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
    min-height: 700px;
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

export const Avatar = styled.div`
  position: relative;
  margin: 0 auto 10px;

  width: 150px;
  height: 150px;

  > img {
    width: 150px;
    height: 150px;
    border-radius: 50%;

    border: 3px solid ${({ theme }) => theme.COLORS.WHITE};
    outline: 3px solid ${({ theme }) => theme.COLORS.GREEN};
  }

  > label{
    width: 40px;
    height: 40px;

    background-color: ${({ theme }) => theme.COLORS.ORANGE};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    position: absolute;
    bottom: 7px;
    right: 7px;

    cursor: pointer;

    input{
      display: none;
    }

    svg{
      font-size: 2.4rem;
      color: ${({ theme }) => theme.COLORS.WHITE};
    }
  }
  @media (max-width: ${DEVICE_BREAKPOINTS.XL}) {
    width: 130px;
  height: 130px;

  > img {
    width: 130px;
    height: 130px;
  }
}
`
export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

export const InputGroupWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
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
