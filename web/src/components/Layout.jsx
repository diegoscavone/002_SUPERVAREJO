import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar.jsx'
import { Header } from './Header'
import { Nav } from './Nav'
import { useWebPush } from '@/hooks/useWebPush';

export function Layout({ children }) {
  useWebPush();
  return (
    <SidebarProvider>
      <Nav />
      <SidebarInset className="bg-background flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex flex-col w-full">
          <main className="flex-1 w-full bg-gray-100">{children}</main>
          {/* <Footer /> */}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
