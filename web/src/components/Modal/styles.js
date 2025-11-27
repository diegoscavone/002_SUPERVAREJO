import styled from 'styled-components'

export const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  /* Estilos para o próprio modal */
  > .modal {
    background-color: ${({ theme }) => theme.COLORS.BACKGROUND_100};
    padding: 2.4rem;
    border-radius: 10px;
    width: 850px;
    max-width: 100%;
    box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.3);
    position: relative;
    z-index: 1001;
  }

  /* Estilos para o botão de fechar */
  .close-button {
    position: absolute;
    top: 15px;
    right: 15px;
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .close-button:hover{
    color: ${({ theme }) => theme.COLORS.RED};
  }

  /* Estilos para o conteúdo do modal */
  .modal-content {
    margin-top: 20px;
  }


  .modalSearch {
    display: flex;
    flex-direction: column;
  }

  .modalContent{
    margin: 2.4rem 0;
  }
  .modalFooter{
    display: flex;
    justify-content: end;
  }
`
