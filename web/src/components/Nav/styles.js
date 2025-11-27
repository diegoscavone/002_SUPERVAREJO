import styled from 'styled-components'
import { DEVICE_BREAKPOINTS } from '../../styles/devices'

export const Container = styled.div`
  min-height: 100vh;
  grid-area: nav;
  background-color: ${({ theme }) => theme.COLORS.GRAY_200};
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative; /* Added for positioning the collapse button */
  padding: ${({ $isCollapsed }) =>
    $isCollapsed ? '2rem 0.5rem' : '2rem 1rem'};
  z-index: 999;
  width: ${({ $isCollapsed }) => ($isCollapsed ? '50px' : '170px')};
  transition: width 0.3s ease-in-out, padding 0.3s ease-in-out;

  .active {
    color: ${({ theme }) => theme.COLORS.GREEN};
  }

  .menu-active {
    color: ${({ theme }) => theme.COLORS.GREEN};
  }

  > ul {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: ${({ $isCollapsed }) => ($isCollapsed ? 'center' : 'start')};
    gap: 1rem;
    padding-top: 2rem;
    width: 100%; /* Ensure ul takes full width of Container */
  }

  li {
    display: flex;
    gap: 0.8rem;
    padding: 0.5rem;
    border-radius: 1rem;
    width: 100%; /* Ensure li takes full width of ul */
    justify-content: ${({ $isCollapsed }) =>
      $isCollapsed ? 'center' : 'flex-start'};

    a {
      color: ${({ theme }) => theme.COLORS.GREEN};
    }
    svg {
      /* color: ${({ theme }) => theme.COLORS.GREEN}; */
      /* font-size: ${({ $isCollapsed }) =>
        $isCollapsed ? '2.4rem' : 'initial'}; */
    }
    a {
      display: flex;
      gap: 0.8rem;
      color: ${({ theme }) => theme.COLORS.GRAY_500};
      align-items: center; /* Vertically align icon and text */
      text-decoration: none; /* Remove underline from links */
    }
    span {
      color: ${({ theme }) => theme.COLORS.GRAY_400};
      ${({ $isCollapsed }) =>
        $isCollapsed &&
        'display: none;'}/* Hide section titles when collapsed */
    }

    &.section-title {
      padding: 0; /* Remove padding for section titles */
      margin-bottom: -1rem; /* Adjust margin for section titles */
    }

    &.active {
      a {
        color: ${({ theme }) => theme.COLORS.GREEN};
      }
      svg {
        color: ${({ theme }) => theme.COLORS.GREEN};
      }
    }
  }

  .collapse-button {
    background: none;
    border: none;
    color: ${({ theme }) => theme.COLORS.GRAY_500};
    font-size: 2.4rem;
    cursor: pointer;
    position: absolute;
    top: 2rem;
    right: ${({ $isCollapsed }) => ($isCollapsed ? '50%' : '1rem')};
    transform: ${({ $isCollapsed }) =>
      $isCollapsed ? 'translateX(50%)' : 'none'};
    transition: right 0.3s ease-in-out, transform 0.3s ease-in-out;
    z-index: 1000;

    &:hover {
      color: ${({ theme }) => theme.COLORS.GREEN};
    }
  }

  @media (max-width: ${DEVICE_BREAKPOINTS.LG}) {
    width: ${({ $isCollapsed }) =>
      $isCollapsed ? '50px' : '170px'}; /* Smaller width for smaller screens */
    padding: 2rem 0.5rem;

    .collapse-button {
      right: ${({ $isCollapsed }) => ($isCollapsed ? '50%' : '0.5rem')};
    }
  }
`

export const Divider = styled.div`
  width: 100%;
  border-top: 1px solid ${({ theme }) => theme.COLORS.GRAY_300};
  margin: 1rem 0; /* Add margin to dividers */
`

export const Profile = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 4rem;
  a {
    display: flex;
    justify-content: center;
  }
  a img {
    width: ${({ $isCollapsed }) =>
      $isCollapsed ? '80%' : '50%'}; /* Adjust image size when collapsed */
    border-radius: 50%;
    border: 3px solid ${({ theme }) => theme.COLORS.GRAY_200};
    outline: 3px solid ${({ theme }) => theme.COLORS.GREEN};
    margin-bottom: 1rem;
    transition: width 0.3s ease-in-out;
  }

  span {
    font-size: 1.4rem;
    color: ${({ theme }) => theme.COLORS.GRAY_600};
    ${({ $isCollapsed }) =>
      $isCollapsed && 'display: none;'}/* Hide text when collapsed */
  }
  strong {
    color: ${({ theme }) => theme.COLORS.GREEN};
    ${({ $isCollapsed }) =>
      $isCollapsed && 'display: none;'}/* Hide text when collapsed */
  }
`
