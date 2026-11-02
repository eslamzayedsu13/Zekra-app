import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { I18nProvider } from "@/lib/i18n";
import { CartProvider } from "@/lib/cart";
import { AuthProvider } from "@/lib/auth";
import { WishlistProvider } from "@/lib/wishlist";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { CartDrawer } from "@/components/store/CartDrawer";
import { PageLoader } from "@/components/store/PageLoader";
import { Splash } from "@/components/store/Splash";
import { Toaster } from "@/components/ui/sonner";
import "@/lib/firebase";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 text-5xl">ذِكرى · Zekra</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          لم نجد هذه الصفحة — We couldn't find this page.
        </p>
        <Link to="/" className="link-draw mt-8 inline-block text-sm">
          الرئيسية · Home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-3xl">حدث خطأ · Something went wrong</h1>
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="bg-primary px-5 py-2 text-sm text-primary-foreground"
          >
            حاول مجددًا · Try again
          </button>
          <a href="/" className="border border-border px-5 py-2 text-sm">
            الرئيسية · Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#f6f2ea" },
      { title: "ذِكرى Zekra — هدايا للمخطوبين ومن يحبّون" },
      {
        name: "description",
        content: "Zekra — thoughtful, engraved gifts and keepsakes for engaged couples in Egypt.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500&family=Manrope:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const isNavigating = useRouterState({ select: (s) => s.status === "pending" });

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <a href="#main" className="sr-only focus:not-sr-only">
                Skip
              </a>
              <Splash />
              <PageLoader active={isNavigating} />
              <Header />
              <main id="main" className="min-h-[60vh]">
                <Outlet />
              </main>
              <Footer />
              <CartDrawer />
              <Toaster
                position="top-center"
                offset="84px"
                toastOptions={{
                  duration: 3500,
                  className: "font-sans",
                  error: {
                    duration: 5000,
                  },
                }}
              />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
