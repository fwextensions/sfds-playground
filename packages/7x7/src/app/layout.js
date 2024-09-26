import "./globals.css";

export const metadata = {
  title: "7x7",
  description: "Just some logo ideas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
