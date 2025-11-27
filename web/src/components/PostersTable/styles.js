import styled from 'styled-components'
import { DEVICE_BREAKPOINTS } from '../../styles/devices'

export const Container = styled.div`
  width: 100%;
  max-height: 550px;
  overflow-y: auto;

  .processing-indicator {
    height: 25px;
  }

  &::-webkit-scrollbar-track {
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
  table {
    width: 100%;
    color: ${({ theme }) => theme.COLORS.GRAY_600};
    border-spacing: 0;
    border-collapse: separate;
  }
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
  th > div {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  th > div svg {
    margin-left: 0.5rem;
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
  .description {
    /* width: 35%; */
  }

  .pagination-controls {
    background-color: ${({ theme }) => theme.COLORS.GRAY_100};
    padding: 1.6rem;
    display: flex;
    align-items: center;
    justify-content: end;
    gap: 1.6rem;
  }

  .pagination-buttons{
    display: flex;
    align-items: center;
    gap: 1.6rem;
  }

  button {
    background-color: ${({ theme }) => theme.COLORS.GRAY_200};
    border: none;
    color: ${({ theme }) => theme.COLORS.GRAY_500};
    cursor: pointer;
    transition: all 0.3s;
    padding: 0.4rem;
    border-radius: 8px;
  }

  button:disabled {
    cursor: not-allowed;
  }

  button:hover {
    background-color: ${({ theme }) => theme.COLORS.GREEN};
    color: ${({ theme }) => theme.COLORS.WHITE};
  }

  button svg {
    display: flex;
    align-items: center;
  }

  span,
  select {
    font-size: 1.4rem;
  }

  select {
    margin-left: 1rem;
    padding: 0.4rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.COLORS.GRAY_300};
  }

  /* @media (max-width: ${DEVICE_BREAKPOINTS.LG}) {
    th,
    td {
      padding: 1rem;
    }
  } */

  @media (max-width: ${DEVICE_BREAKPOINTS.XL}) {
    max-height: 380px;

    th,
    td {
      padding: 0.8rem 0.5rem;
    }
  }
`
