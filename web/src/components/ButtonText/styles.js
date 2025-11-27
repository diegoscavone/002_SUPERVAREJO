import styled from 'styled-components'

export const Container = styled.button`
  /* width: 100%; */
  height: 4.6rem;
  border: none;
  border-radius: 10px;

  padding: 1.5rem;

  color: ${({ theme }) => theme.COLORS.GRAY_500};

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`
