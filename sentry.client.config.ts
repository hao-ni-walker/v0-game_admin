// Client-side Sentry init. NEXT_PUBLIC_SENTRY_DSN is INLINED AT BUILD TIME —
// pass it as a Docker build arg (see Dockerfile / docker-compose.yml) or set
// it in your CI. Empty DSN → disabled, zero runtime overhead.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? "production",
    tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_RATE ?? "0"),
    sendDefaultPii: false,
  });
}
