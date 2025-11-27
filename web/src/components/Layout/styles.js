import styled from 'styled-components'
import { DEVICE_BREAKPOINTS } from '../../styles/devices'

export const LayoutContainer = styled.div`
  display: grid;
  grid-template-areas:
    "nav header"
    "nav content";
  grid-template-columns: ${({ $isCollapsed }) => ($isCollapsed ? '50px' : '300px')} 1fr;
  grid-template-rows: max-content 1fr; /* Header takes content height, content takes rest */
  min-height: 100vh;
  transition: grid-template-columns 0.3s ease-in-out;

  @media (max-width: ${DEVICE_BREAKPOINTS.LG}) {
    grid-template-columns: ${({ $isCollapsed }) => ($isCollapsed ? '80px' : '300px')} 1fr;
  }
`

export const MainContent = styled.main`
  grid-area: content;
  padding: 2rem; /* Add some padding around the main content */
  overflow-y: auto; /* Allow scrolling for content if it overflows */
`
