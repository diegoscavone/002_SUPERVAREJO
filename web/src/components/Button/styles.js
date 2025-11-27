import styled from 'styled-components'

function getTextColor(backgroundColor, theme) {
  if (['RED', 'ORANGE', 'GREEN'].includes(backgroundColor)) {
    return theme.COLORS.WHITE
  }
  return theme.COLORS.GRAY_600
}

export const Container = styled.button`
  /* width: 100%; */
  /* height: 4.6rem; */
  height: ${({ size }) => (size === 'small' ? '4rem' : '4rem')};
  background-color: ${({ color, theme }) =>
    color ? theme.COLORS[color] : theme.COLORS.GREEN};

  border: 0;
  border-radius: 10px;

  padding: 1rem;
  /* margin-bottom: .8rem; */

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  color: ${({ color, theme }) => getTextColor(color, theme)};

  > svg {
    color: ${({ color, theme }) => getTextColor(color, theme)};
    font-size: 1.2rem;
  }

  &:hover {
    filter: brightness(1.1);
  }
`
