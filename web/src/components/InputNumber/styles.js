import styled from 'styled-components';

export const Container = styled.div`
  width: 100px;

  display: flex;
  align-items: center;

  background-color: ${({ theme }) => theme.COLORS.BACKGROUND_100};
  color: ${({ theme }) => theme.COLORS.GRAY_400};

  border-radius: 10px;
  margin-bottom: 8px;

  border: 1px solid ${({ theme }) => theme.COLORS.GRAY_300};
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  
  &:focus-within {
    border:1px solid ${({ theme }) => theme.COLORS.ORANGE};
    /* box-shadow: 0 0 0 2px rgba(255, 132, 0, 0.2); */
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
      color: ${({ theme }) => theme.COLORS.GRAY_600};
    }
  }
  
  > svg {
      margin-left: 16px;
      border: 1px solid red;
    }
`