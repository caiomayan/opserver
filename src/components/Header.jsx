import Link from 'next/link';
import SteamAuth from './SteamAuth';

const Header = () => {

  return (
    <nav className="w-full h-16 flex items-center justify-between px-6">
      {/* Logo e menu */}
      <div className="flex items-center gap-8">
        <Link href="/">
          <img src="/logo.svg" alt="Logo" className="h-10 w-10 object-contain" />
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-gray-800 font-semibold hover:text-blue-600 transition-colors">Início</Link>
          <Link href="/teams" className="text-gray-800 font-semibold hover:text-blue-600 transition-colors">Times</Link>
          <Link href="#" className="text-gray-800 font-semibold hover:text-blue-600 transition-colors">Jogar</Link>
          <Link href="https://inventory.cstrike.app/" className="text-gray-800 font-semibold hover:text-blue-600 transition-colors">Inventário</Link>
          <Link href="#" className="text-gray-800 font-semibold hover:text-blue-600 transition-colors">Ranking</Link>
          <Link href="/prosettings" className="text-gray-800 font-semibold hover:text-blue-600 transition-colors">ProSettings</Link>
        </div>
      </div>
      {/* Login/Avatar */}
  <SteamAuth />
    </nav>
  );
};

export default Header;
