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
  display: flex;
  gap: 1.6rem;
`
export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`
export const Label = styled.label`
  margin-bottom: 0.8rem;
`
export const Table = styled.table`
  width: 100%;
  color: ${({ theme }) => theme.COLORS.GRAY_600};
  border-spacing: 0;
  border-collapse: separate;
  thead {
    background-color: ${({ theme }) => theme.COLORS.GREEN};
  }
  th,
  td {
    padding: 0.8rem 1.5rem;
  }

  th {
    background-color: ${({ theme }) => theme.COLORS.GREEN};
    text-align: left;
    line-height: 2.4rem;
    color: ${({ theme }) => theme.COLORS.WHITE};
  }

  tr {
    background-color: ${({ theme }) => theme.COLORS.WHITE};
  }

  /*preenche as linhas impares com a cor #ddd*/
  tr:nth-child(odd) {
    background: ${({ theme }) => theme.COLORS.GRAY_100};
  }

  .message {
    background-color: ${({ theme }) => theme.COLORS.WHITE};
  }
  @media (max-width: ${DEVICE_BREAKPOINTS.LG}) {
    th,
    td {
      padding: 1rem;
    }
  }
`
export const TableWrapper = styled.div`
  width: 100%;
  max-height: 550px;
  overflow-y: auto;
  padding: 0 1rem;

  &-webkit-scrollbar-track {
    /*-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);*/
    background-color: transparent;
  }

  &::-webkit-scrollbar {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.COLORS.GRAY_300};
  }
`
export const GroupDate = styled.div`
  display: flex;
  align-items: center;
  gap: 1.6rem;
  padding: 0.8rem 2rem 0;

  svg {
    font-size: 1.8rem;
    color: ${({ theme }) => theme.COLORS.GRAY_300};
    border: 1px solid ${({ theme }) => theme.COLORS.GRAY_300};
    border-radius: 0.3rem;
  }
`
export const ButtonWrapper = styled.div`
  min-width: 20%;
  display: flex;
  gap: 1.6rem;
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
  }
`
