import styled from 'styled-components'

export const Container = styled.div`
  width: 100%;
  height: 100vh;
  background-color: ${({ theme }) => theme.COLORS.BACKGROUND_200};  

  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 97px 97px auto 50px;
  grid-template-areas:
    'brand brand'
    'action action'
    'section section'
    'footer footer';
`

export const Brand = styled.div`
  grid-area: brand;
  width: 100%;
`

export const Action = styled.div`
  grid-area: action;
  background-color: ${({ theme }) => theme.COLORS.BACKGROUND_200};  
  width: 100%;

  padding: 2rem 8rem;

  display: flex;
  justify-content: flex-end;

  .buttonSection {
    width: 200px;
    margin-top: 2rem;
  }
`

export const Section = styled.div`
  grid-area: section;
  background-color: ${({ theme }) => theme.COLORS.BACKGROUND_200};  
  width: 100%;
  padding: 2rem 4rem;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2rem;
`


export const Footer = styled.div`
  grid-area: footer;
  background-color: blue;
  width: 100%;

  background-color: ${({ theme }) => theme.COLORS.BACKGROUND_200};
  display: flex;
  justify-content: center;

  padding: 2rem 0 4rem 0;

  > span{
    color: ${({ theme }) => theme.COLORS.GRAY_300};
    font-size: 1.4rem;
  }
`