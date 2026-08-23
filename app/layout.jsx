import "./globals.css";
import { AuthProvider } from "../providers/AuthProvider";
import PostHogProvider from "../providers/PostHogProvider";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "GNX Sales",
  description: "GNX Sales is an AI sales rep that writes outreach and follows up with prospects automatically.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider>
          <AuthProvider>{children}</AuthProvider>
        </PostHogProvider>
        <Analytics />
      </body>
    </html>
  );
}
