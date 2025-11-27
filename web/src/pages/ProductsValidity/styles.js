import styled from 'styled-components'
import { DEVICE_BREAKPOINTS } from '../../styles/devices'

// Estilos do componente original
export const Container = styled.div`
  width: 100%;
  height: 100%;

  display: grid;
  grid-template-columns: 50px auto;
  grid-template-areas:
    'header header'
    'nav content'
    'nav footer';

  background-color: ${({ theme }) => theme.COLORS.BACKGROUND_200};

  @media (max-width: ${DEVICE_BREAKPOINTS.LG}) {
    grid-template-columns: 50px auto;
  }
`

export const Content = styled.div`
  grid-area: content;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  .content-header {
    display: flex;
    justify-content: flex-end;
  }
  .table {
    background-color: ${({ theme }) => theme.COLORS.WHITE};
    padding: 1.5rem 2rem;
    border-radius: 1rem;
  }
`

// Estilos originais mantidos
export const InputTopWrapper = styled.div`
  display: inline-flex;
  justify-content: end;
`

export const Label = styled.label`
  margin-bottom: 0.8rem;
`

// Novos estilos para o layout
export const Card = styled.div`
  background-color: ${({ theme }) => theme.COLORS.BACKGROUND_100};
  border-radius: 8px;
  /* box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); */
  margin-bottom: 20px;
  width: 100%;
`

export const CardHeader = styled.div`
  padding: 15px 0;
  border-bottom: 1px solid ${({ theme }) => theme.COLORS.GRAY_200};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`

export const CardTitle = styled.div`
  font-size: 18px;
  width: 100%;
  color: ${({ theme }) => theme.COLORS.GRAY_600};
  font-weight: 500;
  display: flex;
  flex-direction: column;
  gap: 8px;
  .info-text {
    color: ${({ theme }) => theme.COLORS.GRAY_300};
    font-size: 1.6rem;
  }
`

export const CardBody = styled.div`
  padding: 20px 0;

  .empty-state {
    text-align: center;
    padding: 40px 0;
    color: ${({ theme }) => theme.COLORS.GRAY_300};
    font-size: 16px;
  }

  .loading,
  .empty-result {
    text-align: center;
    padding: 20px 0;
    color: ${({ theme }) => theme.COLORS.GRAY_300};
  }
`

export const SearchContainer = styled.div`
  display: flex;
  width: 100%;
  gap: 10px;
  margin-bottom: 20px;
`

export const SearchInput = styled.input`
  flex: 1;
  padding: 10px 15px;
  border: 1px solid ${({ theme }) => theme.COLORS.GRAY_300};
  border-radius: 10px;
  /* font-size: 14px; */
  color: ${({ theme }) => theme.COLORS.GRAY_600};
  text-transform: capitalize;
  background-color: ${({ theme }) => theme.COLORS.BACKGROUND_200};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.COLORS.GREEN};
  }

  &::placeholder {
    color: ${({ theme }) => theme.COLORS.GRAY_300};
  }
`

export const FilterContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`

export const FilterChip = styled.span`
  padding: 5px 10px;
  background-color: ${({ theme }) => theme.COLORS.BACKGROUND_300};
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    background-color: ${({ theme }) => theme.COLORS.ORANGE};
    color: ${({ theme }) => theme.COLORS.BACKGROUND_100};
  }

  &:hover {
    filter: brightness(0.9);
  }
`

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;

  .column-price {
    width: 190px;
  }

  .column-profit {
    width: 150px;
  }
`

export const TableHeader = styled.th`
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid ${({ theme }) => theme.COLORS.BACKGROUND_300};
  background-color: ${({ theme }) => theme.COLORS.GREEN};
  font-weight: 600;
  color: ${({ theme }) => theme.COLORS.WHITE};
`

export const TableRow = styled.tr`
  transition: background-color 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.COLORS.GREEN_LIGHT};
  }

  &:focus {
    outline: none;
    background-color: ${({ theme }) => theme.COLORS.GREEN_LIGHT};
  }

  &.selected-row {
    background-color: ${({ theme }) => theme.COLORS.GREEN_LIGHT};
    font-weight: bold;
  }
`

export const ValidityIndicator = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
  background-color: ${({ color }) => {
    if (color === 'red') {
      return 'rgba(228, 39, 42, 0.8)'
    } else if (color === 'yellow') {
      return 'rgba(255, 222, 0, 0.8)'
    } else if (color === 'green') {
      return 'rgba(56, 171, 78, 0.8)'
    }
    return 'transparent'
  }};
`

export const DescriptionCell = styled.td`
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid ${({ theme }) => theme.COLORS.GRAY_200};
  color: ${({ theme }) => theme.COLORS.GRAY_600};
  display: flex;
  align-items: center;
`

export const TableCell = styled.td`
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid ${({ theme }) => theme.COLORS.GRAY_200};
  color: ${({ theme }) => theme.COLORS.GRAY_600};
`

export const TableCheckbox = styled.label`
  display: inline-block;
  position: relative;
  cursor: pointer;

  input[type='radio'] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .radio-custom {
    position: relative;
    display: inline-block;
    height: 18px;
    width: 18px;
    border-radius: 50%;
    border: 1px solid #ccc;
    margin-right: 5px;
  }

  input[type='radio']:checked ~ .radio-custom {
    background-color: ${({ theme }) => theme.COLORS.ORANGE};
    border-color: ${({ theme }) => theme.COLORS.ORANGE};
  }

  input[type='radio']:checked ~ .radio-custom:after {
    content: '';
    position: absolute;
    display: block;
    top: 4px;
    left: 4px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: white;
  }
`

export const Pagination = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 5px;
  margin-top: 20px;
`

export const PageButton = styled.button`
  padding: 5px 10px;
  border: 1px solid ${({ theme }) => theme.COLORS.BACKGROUND_200};
  background-color: ${({ theme }) => theme.COLORS.BACKGROUND_200};
  color: ${({ theme }) => theme.COLORS.GRAY_600};
  cursor: pointer;

  &.active {
    background-color: ${({ theme }) => theme.COLORS.GREEN};
    color: ${({ theme }) => theme.COLORS.BACKGROUND_100};
    border-color: ${({ theme }) => theme.COLORS.GREEN};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.COLORS.RED};
  cursor: pointer;
  margin-left: 5px;

  &:hover {
    text-decoration: underline;
  }
`

export const OfferPriceInput = styled.input`
  padding: 8px 10px;
  border: 1px solid ${({ theme }) => theme.COLORS.GRAY_300};
  border-radius: 4px;
  width: 100px;
  background-color: ${({ theme }) => theme.COLORS.BACKGROUND_200};
  color: ${({ theme }) => theme.COLORS.GRAY_600};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.COLORS.GREEN};
  }

  &[type='number']::-webkit-inner-spin-button,
  &[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type='number'] {
    -moz-appearance: textfield;
  }
`

export const ProfitIndicator = styled.span`
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  display: inline-block;

  &.positive {
    background-color: rgba(76, 175, 80, 0.2);
    color: #4caf50;
  }

  &.negative {
    background-color: rgba(244, 67, 54, 0.2);
    color: #f44336;
  }

  &.warning {
    background-color: rgba(255, 152, 0, 0.2);
    color: #ff9800;
  }
`

export const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.72);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`

export const Modal = styled.div`
  background-color: ${({ theme }) => theme.COLORS.BACKGROUND_100};
  border-radius: 16px;
  width: 60%; /* Largura fixa em relação à tela */
  height: 800px; /* Altura fixa em pixels */
  max-width: 1200px; /* Largura máxima */
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: ${DEVICE_BREAKPOINTS.LG}) {
    width: 90%;
  }

  @media (max-width: ${DEVICE_BREAKPOINTS.XXL}) {
    width: 70%;
    height: 620px;
  }
`

export const ModalHeader = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.COLORS.GRAY_300};
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const ModalTitle = styled.div`
  font-size: 1.6rem;
  font-weight: bold;
  color: ${({ theme }) => theme.COLORS.GRAY_600};
`

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${({ theme }) => theme.COLORS.GRAY_300};
`

export const ModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;
  flex: 1;
`

export const ModalFooter = styled.div`
  padding: 15px 20px;
  border: 1px solid ${({ theme }) => theme.COLORS.GRAY_200};
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const ResultCount = styled.span`
  color: ${({ theme }) => theme.COLORS.GRAY_600};
  font-size: 14px;
`

// Outros estilos originais que você tinha no componente
export const Form = styled.div`
  width: 100%;
  display: flex;
  align-items: end;
  gap: 1.6rem;
  background-color: ${({ theme }) => theme.COLORS.WHITE};
  padding: 1.5rem 2rem;
  border-radius: 1rem;

  @media (max-width: ${DEVICE_BREAKPOINTS.LG}) {
    flex-wrap: wrap;
  }
`

export const ActionButtons = styled.div`
  /* width: 100%; */
  display: flex;
  gap: 8px;
`

export const InputWrapper = styled.div`
  /* width: 100%; */
  display: flex;
  flex-direction: column;
`

export const GroupDate = styled.div`
  display: flex;
  align-items: center;
  gap: 1.6rem;
  padding: 0.8rem 2rem 0;

  svg {
    font-size: 1.8rem;
    color: ${({ theme }) => theme.COLORS.GRAY_300};
    border: 1px solid ${({ theme }) => theme.COLORS.GRAY_300};
    border-radius: 0.3rem;
  }
`

export const ButtonWrapper = styled.div`
  min-width: 20%;
  display: flex;
  gap: 1.6rem;
`

export const ButtonSearch = styled.div`
  display: flex;
  align-items: end;
`

// Adicione estes estilos ao arquivo styles.js
export const ConfirmationModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100; /* Deve ser maior que o modal de busca */
`

export const ConfirmationModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 450px;
  padding: 1.5rem;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

export const ConfirmationModalHeader = styled.div`
  margin-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.COLORS.GRAY_100};
  padding-bottom: 1rem;
`

export const ConfirmationModalTitle = styled.h3`
  /* font-size: 1.6rem; */
  color: ${({ theme }) => theme.COLORS.GREEN};
  margin: 0;
  text-align: center;
`

export const ConfirmationModalBody = styled.div`
  margin-bottom: 1.5rem;
  text-align: center;

  > p {
    font-size: 1.6rem;
    line-height: 1.5;
    color: ${({ theme }) => theme.COLORS.GRAY_500};
  }
`

export const ConfirmationModalFooter = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`

export const ProductCounter = styled.div`
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  color: ${({ theme }) => theme.COLORS.GRAY_500};
`
