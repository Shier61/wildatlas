import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, useLocation } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AnimatedRoutes } from '@/components/AnimatedRoutes'
import { PageTransition } from '@/components/PageTransition'
import { LanguageProvider, useLanguage } from '@/lib/i18n'
import { Navbar } from '@/components/layout/Navbar'
import Index from '@/pages/Index'
import SpeciesIndex from '@/pages/SpeciesIndex'
import SpeciesDetail from '@/pages/SpeciesDetail'
import Identify from '@/pages/Identify'
import About from '@/pages/About'
import NotFound from '@/pages/NotFound'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

function Footer() {
  const { lang, t } = useLanguage()
  return (
    <footer className="border-t border-border bg-sidebar py-8">
      <div className="container flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="font-display text-sm font-semibold text-foreground">{t('brand')}</span>
        <span>{t('footerNote')} · {new Date().getFullYear()}</span>
        <span>
          {lang === 'zh'
            ? '濒危等级依据 IUCN 红色名录，仅供科普参考'
            : 'Status labels follow the IUCN Red List, for educational reference'}
        </span>
      </div>
    </footer>
  )
}

function AppShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <div className="flex-1">
        <AnimatedRoutes>
          <Route path="/" element={<PageTransition transition="slide-up"><Index /></PageTransition>} />
          <Route path="/species" element={<PageTransition transition="fade"><SpeciesIndex /></PageTransition>} />
          <Route path="/species/:slug" element={<PageTransition transition="slide-up"><SpeciesDetail /></PageTransition>} />
          <Route path="/identify" element={<PageTransition transition="slide-up"><Identify /></PageTransition>} />
          <Route path="/about" element={<PageTransition transition="fade"><About /></PageTransition>} />
          <Route path="*" element={<PageTransition transition="fade"><NotFound /></PageTransition>} />
        </AnimatedRoutes>
      </div>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <LanguageProvider>
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
