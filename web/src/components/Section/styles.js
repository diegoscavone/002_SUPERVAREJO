import styled from 'styled-components'
import { DEVICE_BREAKPOINTS } from '../../styles/devices'

export const Container = styled.div`
  display: flex;
  width: 100%;

  background-color: ${({ theme }) => theme.COLORS.BACKGROUND_100};
  padding: 1rem;
  border-radius: 1rem;

  > fieldset {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
    border: none;
  }
  fieldset legend {
    margin-bottom: 10px;
    font-weight: 700;
  }

  /* @media (max-width: ${DEVICE_BREAKPOINTS.LG}) {
    width: 50%;
  } */
`
