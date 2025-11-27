import styled from 'styled-components'
import chevron from '/chevron.svg'

export const Container = styled.select`
  /* width: 100%; */
  height: 4rem;
  padding: 0.9rem;

  display: flex;
  flex-direction: column;
  align-items: center;

  appearance: none;
  -webkit-appearance: none;

  background: url(${chevron}) no-repeat right 1.4rem center;
  background-color: ${({ theme }) => theme.COLORS.BACKGROUND_100};
  color: ${({ theme }) => theme.COLORS.GRAY_600};

  border-radius: 10px;
  /* margin-bottom: 8px; */

  border: 1px solid ${({ theme }) => theme.COLORS.GRAY_300};
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    outline: none;
    border: 1px solid ${({ theme }) => theme.COLORS.GREEN};
    /* box-shadow: 0 0 0 2px rgba(255, 132, 0, 0.2); */
  }

  > svg {
    color: ${({ theme }) => theme.COLORS.GRAY_600};
  }
`
