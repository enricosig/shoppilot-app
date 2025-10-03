
export const metadata = {
  title: 'Shoppilot App',
  description: 'AI Copilot for E‑Commerce',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
            <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}><strong>Shoppilot</strong></a>
            <nav style={{ display: 'flex', gap: 16 }}>
              <a href="/billing">Billing</a>
              <a href="/privacy">Privacy</a>
            </nav>
          </header>
          {children}
          <footer style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #eee', fontSize: 12, color: '#666' }}>
            © {new Date().getFullYear()} Shoppilot.ai
          </footer>
        </div>
      </body>
    </html>
  );
}
