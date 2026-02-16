import styled from 'styled-components'
import { DEVICE_BREAKPOINTS } from '../../styles/devices'

export const Container = styled.header`
  grid-area: header;

  background-color: ${({ theme }) => theme.COLORS.BACKGROUND_100};
  display: flex;
  justify-content: space-between;
  padding: 0 6rem;

  @media (max-width: ${DEVICE_BREAKPOINTS.MD}) {
    width: 100%;
  }
`

export const Brand = styled.div`
  width: 180px;
  display: flex;
  align-items: center;
  height: 9rem;

  > img {
    width: 200px;
  }

  @media (max-width: ${DEVICE_BREAKPOINTS.MD}) {
    width: 80px;
    > img {
      width: 100px;
    }
  }
`

export const RightItems = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`

export const Logout = styled.div`
  display: flex;
  align-items: center;

  button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: none;
    background-color: transparent;

    color: ${({ theme }) => theme.COLORS.GRAY_300};
    cursor: pointer;

    transition: filter 0.2s;
  }
  button:hover {
    color: ${({ theme }) => theme.COLORS.GREEN};
  }
  svg {
    font-size: 2.4rem;
  }
`
