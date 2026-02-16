import styled from 'styled-components'
import { DEVICE_BREAKPOINTS } from '../../styles/devices'

export const Container = styled.div`
  width: 100%;
  height: 100vh;

  display: grid;
  grid-template-columns: 50px auto;
  grid-template-rows: auto 1fr auto;
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
  overflow-y: auto;
  .content-header {
    display: flex;
    justify-content: flex-start;
  }

  @media (max-width: ${DEVICE_BREAKPOINTS.XL}) {
    padding: 1.6rem;
    gap: 1rem;

  }

  @media (max-width: ${DEVICE_BREAKPOINTS.XXL}) {
    padding: 1.6rem;
    gap: 1rem;
    
  }

  @media (min-width: ${DEVICE_BREAKPOINTS.LG}) {
    .content-header {
      justify-content: flex-end;
    }
  }
`

export const Form = styled.div`
  width: 100%;
  display: flex;
  gap: 1.6rem;
  margin-bottom: 2.4rem;
  /* flex-wrap: wrap; */

  @media (max-width: ${DEVICE_BREAKPOINTS.XL}) {
    gap: 1rem;
  }
`

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;

  @media (max-width: ${DEVICE_BREAKPOINTS.XL}) {
    width: 60%;
  }
`

export const SelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;
`

export const Label = styled.label`
  margin-bottom: 0.8rem;
  /* font-size: 1.4rem; */
  color: ${({ theme }) => theme.COLORS.GRAY_600};
`

export const ButtonSearch = styled.div`
  display: flex;
  align-items: end;
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
    color: ${({ theme }) => theme.COLORS.GRAY_300};
  }

  @media (max-width: ${DEVICE_BREAKPOINTS.XL}) {
    min-height: 355px;
  }

  @media (max-width: ${DEVICE_BREAKPOINTS.XXL}) {
    min-height: 355px;
  }
`

export const ButtonWrapper = styled.div`
  /* min-width: 20%; */
  display: flex;
  gap: 1.6rem;
  margin-top: 2.4rem;
  justify-content: flex-end;

  @media (max-width: ${DEVICE_BREAKPOINTS.XL}) {
    flex-direction: column;
  }

  @media (max-width: ${DEVICE_BREAKPOINTS.MD}) {
    display: none;
  }
`

export const TableSection = styled.section`
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  > div {
    flex-grow: 1;
  }
`

// Adicione este código ao arquivo styles.js
export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;

  &::before {
    content: '';
    display: inline-block;
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    margin-right: 0.5rem;
  }

  &.active::before {
    background-color: #10b981; /* Verde para ofertas ativas */
  }

  &.upcoming::before {
    background-color: #3b82f6; /* Azul para ofertas futuras */
  }

  &.expired::before {
    background-color: #ef4444; /* Vermelho para ofertas encerradas */
  }

  &.unknown::before {
    background-color: #9ca3af; /* Cinza para status desconhecido */
  }
`
