import styled from 'styled-components'
import { DEVICE_BREAKPOINTS } from '../../styles/devices'

export const Container = styled.div`
  /* width: 100%; */

  display: flex;
  align-items: center;

  background-color: ${({ theme }) => theme.COLORS.BACKGROUND_100};
  color: ${({ theme }) => theme.COLORS.GRAY_600};
  border: 1px solid ${({ theme }) => theme.COLORS.GRAY_300};

  border-radius: 10px;
  /* margin-bottom: 8px; */
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus-within {
    border: 1px solid ${({ theme }) => theme.COLORS.GREEN};
    /* border-color: ${({ theme }) => theme.COLORS.GREEN}; */
    /* box-shadow: 0 0 0 2px rgba(255, 132, 0, 0.2); */
  }

  > input[type='number']::-webkit-inner-spin-button,
  > input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  > input[type='number'] {
    -moz-appearance: textfield;
  }

  > input {
    height: 40px;
    width: 100%;

    padding: 12px;

    color: ${({ theme }) => theme.COLORS.GRAY_600};
    background: transparent;
    border: 0;

    &:focus {
      outline: none;
    }

    &::placeholder {
      color: ${({ theme }) => theme.COLORS.GRAY_300};
    }
  }

  > svg {
    margin-left: 16px;
    color: ${({ theme }) => theme.COLORS.GRAY_500};
  }
`