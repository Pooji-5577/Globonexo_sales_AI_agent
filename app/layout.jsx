import "./globals.css";
import { AuthProvider } from "../providers/AuthProvider";

export const metadata = {
  title: "Globonexo Sales AI",
  description: "Globonexo Sales AI frontend migrated to Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
