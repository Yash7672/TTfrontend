import { Outlet, useLocation } from 'react-router-dom'
import { Suspense, useEffect } from 'react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { AiAssistantWidget } from '../components/AiAssistantWidget'
import { RouteFallback } from '../components/RouteFallback'

/** Storefront shell: header, page content, footer and the floating assistant. */
export function MainLayout() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <AiAssistantWidget />
    </div>
  )
}
