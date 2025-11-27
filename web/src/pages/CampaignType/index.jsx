import { PiNewspaperClippingBold } from 'react-icons/pi'

import { Container, Brand, Section, Action } from './styles'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { Cards } from '../../components/Cards'

import { Button } from '../../components/Button'


export function CampaignType() {
  return (
    <Container>
      <Brand>
        <Header/>
      </Brand>

      <Action>
        <div className='buttonSection'>
          <Button 
           title="Nova Campanha"
           icon={PiNewspaperClippingBold}
           />
        </div>
      </Action>

      <Section>
        <Cards
          title="Dia D"
          img={ViewImg}
        />

        <Cards
          title="Dia D"
          img={ViewImg}
        />

        <Cards
          title="Dia D"
          img={ViewImg}
        />

        <Cards
          title="Dia D"
          img={ViewImg}
        />

        <Cards
          title="Dia D"
          img={ViewImg}
        />

        <Cards
          title="Dia D"
          img={ViewImg}
        />
        <Cards
          title="Dia D"
          img={ViewImg}
        />  
                <Cards
          title="Dia D"
          img={ViewImg}
        />

        <Cards
          title="Dia D"
          img={ViewImg}
        />
        <Cards
          title="Dia D"
          img={ViewImg}
        />     
                <Cards
          title="Dia D"
          img={ViewImg}
        />

        <Cards
          title="Dia D"
          img={ViewImg}
        />
        <Cards
          title="Dia D"
          img={ViewImg}
        />          
      </Section>
      <Footer/>
    </Container>
  )
}