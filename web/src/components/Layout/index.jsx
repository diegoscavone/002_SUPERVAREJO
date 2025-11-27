import React, { useState } from 'react'
import { Header } from '../Header'
import { Nav } from '../Nav'
import { LayoutContainer, MainContent } from './styles'

export function Layout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // This function will be passed to Nav to toggle the state
  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <LayoutContainer $isCollapsed={isCollapsed}>
      <Header />
      <Nav />
      <MainContent $isCollapsed={isCollapsed}>
        {children}
      </MainContent>
    </LayoutContainer>
  )
}
