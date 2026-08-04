import "./globals.css";
import { AuthProvider } from "../providers/AuthProvider";
import PostHogProvider from "../providers/PostHogProvider";

export const metadata = {
  title: "GNX sales",
  description: "GNX sales frontend",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider>
          <AuthProvider>{children}</AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
