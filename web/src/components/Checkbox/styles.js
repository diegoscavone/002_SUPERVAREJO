import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;

  > input[type='checkbox'] {
    opacity: 0;
    width: 18px;
    height: 18px;
    position: absolute;
    cursor: pointer;
    z-index: 1;
  }

  > input:checked + .checkmark {
    background-color: ${({ theme }) => theme.COLORS.GREEN};
  }

  > input:checked + .checkmark::after {
    display: block;
  }

  .checkmark {
    width: 18px;
    height: 18px;
    background-color: ${({ theme }) => theme.COLORS.GRAY_200};
    border-radius: 3px;
    margin-right: 10px;
    cursor: pointer;
    display: inline-block;
    position: relative;
    border: 1px solid ${({ theme }) => theme.COLORS.WHITE };
  }

  .checkmark::after {
    content: '';
    position: absolute;
    display: none;
    left: 5px;
    top: 1px;
    width: 3px;
    height: 9px;
    border: solid white;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
  }
`
