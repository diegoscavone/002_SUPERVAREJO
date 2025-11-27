import styled from 'styled-components' 

export const Container = styled.footer`
  grid-area: footer;
  width: 100%;
  background-color: ${({ theme }) => theme.COLORS.BACKGROUND_200};
  display: flex;
  justify-content: center; 
  padding: 2rem;

  > span{
    color: ${({ theme }) => theme.COLORS.GRAY_300};
    font-size: 1.4rem;
  }
`