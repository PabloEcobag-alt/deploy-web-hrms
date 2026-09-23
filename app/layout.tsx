import type { Metadata } from "next";
import { Hanken_Grotesk, Geist_Mono } from "next/font/google";
// import { SessionProvider } from "next-auth/react";
// import { redirect } from "next/navigation";
// import { auth } from "@/auth";
import "@/app/globals.css";
import LayoutProvider from "@/providers/LayoutProvider";
// import { LogoutEventListener } from "@/components/auth/LogoutEventListener";
// import { AxiosTokenProvider } from "@/components/auth/AxiosTokenProvider";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HRMS System",
  description: "Human Resource Management System",
};

const THIS_SYSTEM_CODE = "HRMS";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // const session = await auth();

  // /signin is a Route Handler (Step 3), so it never reaches this layout.
  // This only fires on the rare race where middleware saw a valid session
  // that had since expired by the time this layout's own auth() call ran —
  // send it back through /signin rather than rendering children unguarded.
  // if (!session) redirect("/signin");

  // if (!session.systems?.includes(THIS_SYSTEM_CODE)) {
  //   return (
  //     <html lang="en">
  //       <body>
  //         <main className="p-6">
  //           <h1 className="text-xl font-semibold">Access denied</h1>
  //           <p>
  //             You are signed in, but do not have access to {THIS_SYSTEM_CODE}.
  //           </p>
  //           <a className="underline" href="/api/logout">
  //             Sign out
  //           </a>
  //         </main>
  //       </body>
  //     </html>
  //   );
  // }

  return (
    <html
      lang="en"
      className={`${hankenGrotesk.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground font-sans">
        {/* <SessionProvider refetchInterval={0} refetchOnWindowFocus={false} session={session}>
          <LogoutEventListener
            accessToken={session?.accessToken as string}
            issuer={process.env.AUTH_ISSUER!}
          />
          <AxiosTokenProvider token={session?.accessToken as string} /> */}
          <LayoutProvider>{children}</LayoutProvider>
        {/* </SessionProvider> */}
      </body>
    </html>
  );
}