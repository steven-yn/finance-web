export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Finance Web. All rights reserved.
      </div>
    </footer>
  )
}
