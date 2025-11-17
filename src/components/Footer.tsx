export default function Footer() {
  return (
    <footer className="mt-auto py-6 px-4 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto text-center text-sm text-gray-600">
        <p>
          Lumi Billing Panel |{' '}
          <a
            href="https://lumisolutions.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium transition"
          >
            Lumi Solutions
          </a>
          {' '}| 2025
        </p>
      </div>
    </footer>
  )
}
