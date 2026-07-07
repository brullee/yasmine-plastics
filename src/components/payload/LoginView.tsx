import { redirect } from 'next/navigation'
import { getSafeRedirect } from 'payload/shared'
import { RenderServerComponent } from '@payloadcms/ui/elements/RenderServerComponent'
import { PayloadLogo } from '@payloadcms/ui/shared'
import type { AdminViewServerProps } from 'payload'
import { LoginViewForm } from './LoginViewForm'

// Full replacement for Payload's built-in Login view (registered at
// admin.components.views.login in payload.config.ts) so the form can collect an extra
// two-factor code field alongside email/password in one submission — Payload doesn't
// expose a way to add a field to the built-in form without replacing the whole view.
// Mirrors @payloadcms/next's own views/Login/index.js structure (beforeLogin/afterLogin
// component slots, redirect-if-already-logged-in), rebuilt here since that file isn't a
// public export and this view fully replaces it as far as the admin router is concerned.
export function LoginView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { locale, permissions, req } = initPageResult
  const { i18n, payload, user } = req
  const { config } = payload
  const {
    admin: { components: { afterLogin, beforeLogin } = {} },
    routes: { admin: adminRoute },
  } = config

  const redirectUrl = getSafeRedirect({ fallbackTo: adminRoute, redirectTo: searchParams?.redirect as string })
  if (user) redirect(redirectUrl)

  const serverProps = { i18n, locale, params, payload, permissions, searchParams, user }

  return (
    <>
      <div className="login__brand">
        <PayloadLogo />
      </div>
      {RenderServerComponent({ Component: beforeLogin, importMap: payload.importMap, serverProps })}
      <LoginViewForm searchParams={searchParams as Record<string, string>} />
      {RenderServerComponent({ Component: afterLogin, importMap: payload.importMap, serverProps })}
    </>
  )
}
