import Link from 'next/link';

const Footer = ({ text = "BETA" }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 py-2 flex justify-between items-center px-4">
      {/* Logo OPSERVER - Esquerda */}
      <Link href="/" className="flex items-center gap-1.5">
        <img src="/logo.svg" alt="OPIUM Logo" width="16" height="16" />
        <span className="text-xs font-semibold text-gray-600">OPIUM</span>
      </Link>
      
      {/* Texto central */}
      <p className="text-xs text-gray-400">{text}</p>
      
      {/* Espaço vazio para manter o texto centralizado */}
      <div className="w-20"></div>
    </footer>
  );
};

export default Footer;
