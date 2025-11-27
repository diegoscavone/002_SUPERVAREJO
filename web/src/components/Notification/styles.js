import styled from 'styled-components'

export const Container = styled.div`
  position: relative;
`

export const NotificationButton = styled.button`
  border: none;
  color: ${({ theme }) => theme.COLORS.GRAY_400};
  font-size: 2.4rem;
  position: relative;
  background-color: ${({ theme }) => theme.COLORS.WHITE};
  margin-top: 8px;

  span {
    position: absolute;
    top: -0.5rem;
    right: -0.5rem;
    background-color: red;
    color: white;
    border-radius: 50%;
    padding: 0.2rem 0.5rem;
    font-size: 1.2rem;
  }
`

export const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 30rem;
  /* min-height: 100px; */
  max-height: 200px;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.COLORS.WHITE};
  border-radius: 12px;
  padding: 1rem;
  z-index: 1;
  border: 1px solid ${({ theme }) => theme.COLORS.GRAY_200};
   &-webkit-scrollbar-track {
    /*-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);*/
    background-color: transparent;
  }

  &::-webkit-scrollbar {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.COLORS.GRAY_300};
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    li {
      padding: 1rem 0;
      /* border-bottom: 1px solid ${({ theme }) => theme.COLORS.BACKGROUND_700}; */
      &:last-child {
        border-bottom: none;
      }
    }
    .productList {
      display: flex;
      flex-direction: column;
      padding: 8px;
      border-radius: 8px;
      background-color: ${({ theme }) => theme.COLORS.BACKGROUND_200};
    }
    .validity {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.2rem;
    }
  }
`
