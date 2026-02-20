import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

// Initialisation du client TanStack Query pour la gestion du cache et de l'état asynchrone
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // Les données sont considérées fraîches pendant 5 minutes
            retry: 1, // Réessayer une fois en cas d'échec
            refetchOnWindowFocus: false, // Éviter les refetch automatiques au focus de la fenêtre pour économiser des ressources
        },
    },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </React.StrictMode>,
)
