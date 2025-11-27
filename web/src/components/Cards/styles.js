import styled from 'styled-components'
import { DEVICE_BREAKPOINTS } from '../../styles/devices'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  width: 23rem;

  background-color: ${({ theme }) => theme.COLORS.BACKGROUND_100};
  border-radius: 10px;
  margin-bottom: 8px;

  overflow: hidden;
  cursor: pointer;

  > img {
    width: 100%;
    height: 11rem;
    object-fit: cover;
    object-position: top;
  }

  > h3 {
    font-weight: 500;
    margin-bottom: 2rem;
  }

  @media (max-width: ${DEVICE_BREAKPOINTS.LG}) {
    width: 24rem;
  }
  @media (max-width: ${DEVICE_BREAKPOINTS.XXL}) {
    width: 21rem;
  }
`
