import { Routes, Route, Navigate } from 'react-router-dom'

import { Home } from '../pages/Home'
import { Print } from '../pages/Print'
import { Automate } from '../pages/Automate'
import { Details } from '../pages/Details'
import { Profile } from '../pages/Profile'

export function PrintOnlyRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/details/:id" element={<Details />} />
      <Route path="/print" element={<Print />} />
      <Route path="/automate" element={<Automate />} />
      <Route path="/users/profile/:id" element={<Profile />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
