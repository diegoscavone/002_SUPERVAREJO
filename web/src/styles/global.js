import { createGlobalStyle } from 'styled-components'

export default createGlobalStyle`
  *{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :root{
    font-size: 62.5%;

    --toastify-text-color-light: ${({ theme }) => theme.COLORS.WHITE};
    --toastify-icon-color-info: ${({ theme }) => theme.COLORS.WHITE} ;
    --toastify-icon-color-error: ${({ theme }) => theme.COLORS.WHITE} ;
    --toastify-icon-color-success: ${({ theme }) => theme.COLORS.WHITE} ;
  }

  body{
    background-color: ${({ theme }) => theme.COLORS.BACKGROUND_600};
    color: ${({ theme }) => theme.COLORS.GRAY_600};

    -webkit-font-smoothing: antialiased;
  }

  body,
  input,
  button,
  select,
  textarea,
  fieldset legend{
    font-family: 'Inter', sans-serif;
    font-size: 1.6rem;
    outline: none;
  }

  a {
    text-decoration: none;
  }

  button, a{
    font-size: 1.6rem;
    cursor: pointer;
    transition: filter 0.2s;
  }

  ul {
    list-style: none;
  }

  svg {
    font-size: 2rem;
  }

  /* Estilos para inputs com foco */
  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible {
    outline: none;
  }

  /* Estilo específico para o componente de input */
  .input-container {
    position: relative;
  }

  .input-container:focus-within {
    border-color: ${({ theme }) => theme.COLORS.ORANGE} !important;
    box-shadow: 0 0 0 2px rgba(255, 132, 0, 0.2);
  }
`