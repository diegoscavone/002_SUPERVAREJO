import { Routes, Route, Navigate } from 'react-router-dom'

import { Home } from '../pages/Home'
import { Campaign } from '../pages/Campaign'
import { Print } from '../pages/Print'
import { Automate } from '../pages/Automate'
import { CampaignType } from '../pages/CampaignType'
import { NewCampaign } from '../pages/NewCampaign'
import { CampaignDetails } from '../pages/CampaignDetails'
import { Details } from '../pages/Details'
import { Profile } from '../pages/Profile'
import { NewOffer } from '../pages/NewOffer'
import { Offers } from '../pages/Offers'

export function OfferManagerRoutes() {
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
      <Route path="/users/profile/:id" element={<Profile />} />
      <Route path="/offers" element={<Offers />} /> 
      <Route path="/offers/new" element={<NewOffer />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
