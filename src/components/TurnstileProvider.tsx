'use client'

import { createContext, useContext, useState } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'
import type { ReactNode } from 'react'

const TurnstileContext = createContext<string | null>(null)

export function useTurnstileToken() {
  return useContext(TurnstileContext)
}

export function TurnstileProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)

  return (
    <TurnstileContext.Provider value={token}>
      {children}
      <div className="fixed bottom-4 left-4 z-40">
        <Turnstile
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
          onSuccess={setToken}
          onExpire={() => setToken(null)}
        />
      </div>
    </TurnstileContext.Provider>
  )
}
