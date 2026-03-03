import styled from 'styled-components'
import { DEVICE_BREAKPOINTS } from '../../styles/devices'

export const Container = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px 20px 20px 0;

  > img {
    width: 550px;
    height: 779px;
  }

  @media (max-width: ${DEVICE_BREAKPOINTS.XL}) {
    padding: 2rem 2rem 3rem 0;

    > img {
      width: 440px;
      height: 622px;
    }
  }

  @media (max-width: ${DEVICE_BREAKPOINTS.XXL}) {
    padding: 2rem 2rem 3rem 0;

    > img {
      width: 420px;
      height: 602px;
    }
  }
`
export const DataView = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 1rem;

  position: absolute;
  z-index: 1;

  width: 490px;
  height: 460px;

  margin-top: 12rem;

  font-family: Arial, Helvetica, sans-serif, sans-serif;
  border: 1px solid red;

  > .description {
    border: 1px solid red;
    width: 100%;
    /* > span {
      font-size: 2.7rem;
      font-weight: bold;
      color: ${({ theme }) => theme.COLORS.DARK};
      text-align: center;
      text-transform: uppercase;
    } */
  }
  .priceWrapper {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .boxValue {
    font-size: 2.5rem;
    font-weight: 900;
    color: ${({ theme }) => theme.COLORS.RED};
  }

  .price {
    /* width: 100%; */
    height: 280px;
    font-weight: 900;
    display: flex;
    justify-content: center;
    color: ${({ theme }) => theme.COLORS.RED};
  }

  .priceWrapperDecimal {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .priceInteger {
    display: flex;
    align-items: center;
  }

  &.small-price,
  .small-price {
    .priceInteger {
      font-size: 18rem !important;
      line-height: 0.8;
    }
    .priceDecimal {
      font-size: 8rem !important;

    }
  }

  &.medium-price,
  .medium-price {
    margin-top: 8px;
    .priceInteger {
      font-size: 14rem !important;
      line-height: 0.8;
    }
    .priceDecimal {
      font-size: 7rem !important;
      margin-top: 2rem;
    }
  }

  &.large-price,
  .large-price {
    margin-top: 40px;
    .priceInteger {
      font-size: 10rem !important;
      line-height: 0.8;
    }
    .priceDecimal {
      font-size: 6rem !important;
      /* margin-top: 3rem; */
    }
  }

  &.x-large-price,
  .x-large-price {
    margin-top: 60px;
    .priceInteger {
      font-size: 7rem !important;
      line-height: 0.8;
    }
    .priceDecimal {
      font-size: 5rem !important;
      /* margin-top: 4rem; */
    }
  }

  .date {
    display: flex;
    align-items: center;
    font-weight: bold;
    gap: 0.5rem;
    text-transform: uppercase;
    color: ${({ theme }) => theme.COLORS.DARK};
  }

  @media (max-width: ${DEVICE_BREAKPOINTS.LG}) {
    width: 370px;
    height: 490px;
    margin-top: 10rem;

    > .description {
      width: 100%;
      height: 120px;
      > h2 {
        font-size: 3.2rem;
        line-height: 3rem;
      }
      > span {
        font-size: 1.8rem;
      }
    }
    .price {
      height: 150px;
    }

    .small-price .priceInteger {
      font-size: 22rem;
    }

    .small-price .priceDecimal {
      font-size: 8rem;
      margin-top: 1rem;
    }

    .medium-price .priceInteger {
      font-size: 18rem;
    }

    .medium-price .priceDecimal {
      font-size: 5rem;
      margin-top: 3rem;
    }

    .large-price .priceInteger {
      font-size: 12rem;
    }

    .large-price .priceDecimal {
      font-size: 5rem;
      margin-top: 4rem;
    }

    .x-large-price .priceInteger {
      font-size: 8rem;
    }

    .x-large-price .priceDecimal {
      font-size: 5rem;
      margin-top: 4rem;
    }

    .date {
      font-size: 1.2rem;
      margin-left: 2rem;
    }
  }
  @media (max-width: ${DEVICE_BREAKPOINTS.XL}) {
    width: 400px;
    height: 400px;
    margin-top: 18rem;

    > .description {
      width: 100%;
      height: 140px;
      > h2 {
        font-size: 3.8rem;
      }
      > span {
        font-size: 2rem;
      }
    }
    .price {
      height: 205px;
    }

    .small-price .priceInteger {
      font-size: 22rem;
    }

    .small-price .priceDecimal {
      font-size: 8rem;
      margin-top: 1rem;
    }

    .medium-price .priceInteger {
      font-size: 18rem;
    }

    .medium-price .priceDecimal {
      font-size: 5rem;
      margin-top: 3rem;
    }

    .large-price .priceInteger {
      font-size: 12rem;
    }

    .large-price .priceDecimal {
      font-size: 5rem;
      margin-top: 4rem;
    }

    .x-large-price .priceInteger {
      font-size: 8rem;
    }

    .x-large-price .priceDecimal {
      font-size: 5rem;
      margin-top: 4rem;
    }

    .date {
      font-size: 1.2rem;
      margin-left: 2rem;
    }
  }
  @media (max-width: ${DEVICE_BREAKPOINTS.XXL}) {
    width: 500px;
    height: 400px;
    margin-top: 16rem;

    > .description {
      width: 100%;
      height: 120px;
      > h2 {
        font-size: 3.8rem;
      }
      > span {
        font-size: 2rem;
      }
    }
    .price {
      height: 205px;
    }

    .small-price .priceInteger {
      font-size: 22rem;
    }

    .small-price .priceDecimal {
      font-size: 8rem;
      margin-top: 1rem;
    }

    .medium-price .priceInteger {
      font-size: 18rem;
    }

    .medium-price .priceDecimal {
      font-size: 5rem;
      margin-top: 3rem;
    }

    .large-price .priceInteger {
      font-size: 12rem;
    }

    .large-price .priceDecimal {
      font-size: 5rem;
      margin-top: 4rem;
    }

    .x-large-price .priceInteger {
      font-size: 8rem;
    }

    .x-large-price .priceDecimal {
      font-size: 5rem;
      margin-top: 4rem;
    }

    .date {
      font-size: 1.2rem;
      margin-left: 2rem;
    }
  }
`

export const DataViewWholesale = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 1rem;

  position: absolute;
  z-index: 1;

  width: 490px;
  height: 510px;

  margin-top: 13rem;

  font-family: Arial, Helvetica, sans-serif, sans-serif;
  `
export const Wholesale = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8px;
  .boxPrice {
    color: ${({ theme }) => theme.COLORS.RED};
    .priceValue {
      font-size: 7rem;
      line-height: 1; /* Remove espaço extra entre linhas */
    }
    .boxValue {
      font-size: 2.5rem;
      margin: 2rem 6px 0;
    }

    .boxPriceValue {
      display: flex;
      align-items: flex-start;
      font-weight: 900;
      font-size: 14rem;
      /* line-height: 120px; */
    }
    .priceCents {
      font-size: 3rem;
    }
    .unit {
      font-size: 1.6rem;
      margin-top: -1rem;
    }

    .priceValueRetail {
      font-size: 5rem;
      line-height: 80px;
    }
    .priceCentsRetail {
      font-size: 3rem;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: center;
    }

    @media (max-width: ${DEVICE_BREAKPOINTS.XL}) {
      .priceValue {
        font-size: 9rem; /* Reduzir de 14rem para 12rem */
      }
      .priceValueRetail {
        font-size: 6rem; /* Reduzir de 8rem para 7rem */
      }
      .priceCents,
      .priceCentsRetail {
        font-size: 3rem; /* Reduzir de 5rem para 4rem */
        margin-top: 1rem; /* Reduzir de -1rem para -0.5rem */
      }
    }
  }
`
