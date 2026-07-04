import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError: typeof Sentry.captureRequestError = (...args) => {
  Sentry.captureRequestError(...args)
  if (process.env.VERCEL) {
    import('@vercel/functions').then(({ waitUntil }) => {
      waitUntil(Sentry.flush(2000))
    }).catch(() => {})
  }
}
