import Link from 'next/link';
import ReactCountryFlag from 'react-country-flag';

const Header = ({ 
  logoSize = 24, 
  showBackButton = false, 
  centerLogo = null,
  centerCountry = null 
}) => {
  return (
    <>
      {/* Logo/Team no Centro */}
      {centerLogo && (
        <header className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 text-center">
          <Link href={centerLogo.href || "/"}>
            {centerLogo.src ? (
              <img 
                src={centerLogo.src || "/teams/unknown.svg"} 
                alt={centerLogo.alt || "Logo"}
                className="mx-auto object-contain" 
                width="40" 
                height="40" 
              />
            ) : (
              <img 
                src="/teams/unknown.svg" 
                alt="Unknown Team"
                className="mx-auto object-contain" 
                width="40" 
                height="40" 
              />
            )}
          </Link>
          {centerCountry && (
            <div className="mt-1">
              <ReactCountryFlag 
                countryCode={centerCountry} 
                svg 
                style={{width: '0.8em', height: '0.8em'}} 
              />
            </div>
          )}
        </header>
      )}
    </>
  );
};

export default Header;
