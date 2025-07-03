export function AppFooter() {
  return (
    <footer className="py-6 border-t border-border/40 backdrop-blur-sm hidden md:block">
      <div className="container mx-auto px-4 text-center text-sm text-white">
        <p>Evotar - Blockchain Voting Platform © {new Date().getFullYear()}</p>
        <p className="mt-1">Secure, Transparent, Immutable</p>
      </div>
    </footer>
  )
}
