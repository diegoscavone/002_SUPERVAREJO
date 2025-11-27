import styled from 'styled-components'

export const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  position: relative;
  background-color: ${({ theme }) => theme.COLORS.ORANGE};
  border-radius: 0.8rem;
  padding: 1rem 3.2rem;
  justify-content: center;

  > svg {
    color: ${({ theme }) => theme.COLORS.WHITE};
  }

  > input {
    display: block;
    position: absolute;
    left: 0;
    right: 0;
    opacity: 0;
    width: 100%;
    height: 4rem;

    cursor: pointer;
  }

  > span {
    padding-left: 0.8rem;
    font-weight: 400;
    color: ${({ theme }) => theme.COLORS.WHITE};
  }

  &:hover{
    background-color: ${({ theme }) => theme.COLORS.ORANGE_100};
  }
`
