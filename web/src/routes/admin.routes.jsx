import { Routes, Route, Navigate } from 'react-router-dom'

import { Home } from '../pages/Home'
import { Campaign } from '../pages/Campaign'
import { Print } from '../pages/Print'
import { Automate } from '../pages/Automate'
import { CampaignType } from '../pages/CampaignType'
import { NewCampaign } from '../pages/NewCampaign'
import { CampaignDetails } from '../pages/CampaignDetails'
import { Details } from '../pages/Details'
import { NewUser } from '../pages/NewUser'
import { Users } from '../pages/Users'
import { NewOffer } from '../pages/NewOffer'
import { Profile } from '../pages/Profile'
import { Offers } from '../pages/Offers'
import { ValidityControl } from '../components/ValidityControl'
import { ProductsValidity } from '../pages/ProductsValidity'

export function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/details/:id" element={<Details />} />
      <Route path="/campaigns" element={<Campaign />} />
      <Route path="/campaigns/new" element={<NewCampaign />} />
      <Route path="/campaigns/details/:id" element={<CampaignDetails />} />
      <Route path="/campaigns-type" element={<CampaignType />} />
      <Route path="/print" element={<Print />} />
      <Route path="/automate" element={<Automate />} />
      <Route path="/users/new" element={<NewUser />} />
      <Route path="/users" element={<Users />} />
      <Route path="/users/profile/:id" element={<Profile />} />
      <Route path="/offers" element={<Offers />} /> 
      <Route path="/offers/new" element={<NewOffer />} />
      <Route path="/validity-control" element={<ValidityControl />} />
      <Route path='/productsValidity' element={<ProductsValidity />} />
      {/* <Route path="/validity-monitoring" element={<ValidityMonitoring />} /> */}


      <Route path="*" exact={true} element={<Home />} />
    </Routes>
  )
}
