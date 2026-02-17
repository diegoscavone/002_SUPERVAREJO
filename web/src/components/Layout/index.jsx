import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar.jsx'
import { Footer } from '../Footer'
import { Header } from '../Header'
import { Nav } from '../Nav'
import { Container } from './styles'

export function Layout({ children }) {
  return (
    <SidebarProvider>
      <Nav />
      <SidebarInset className="bg-background flex flex-col min-h-screen">
        <Header />
        <Container className="flex-1 flex flex-col w-full">
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </Container>
      </SidebarInset>
    </SidebarProvider>
  )
}
