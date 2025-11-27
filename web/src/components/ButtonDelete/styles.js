import styled from 'styled-components'

export const Container = styled.button`
  width: 100%;
  height: 4.6rem;
  background-color: ${({ theme }) => theme.COLORS.RED};

  border: 0;
  border-radius: 10px;

  padding: 1.5rem;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  color: ${({ theme }) => theme.COLORS.WHITE};
`
