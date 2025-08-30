import Link from 'next/link';
import ReactCountryFlag from "react-country-flag";

const NavigationCard = ({ 
  href, 
  logo, 
  title, 
  subtitle, 
  country, 
  accentColor = 'gray',
  details = [],
  className = '' 
}) => {
  const accentColors = {
    blue: 'border-blue-300 hover:border-blue-400',
    green: 'border-green-300 hover:border-green-400', 
    red: 'border-red-300 hover:border-red-400',
    purple: 'border-purple-300 hover:border-purple-400',
    gray: 'border-gray-300 hover:border-gray-400'
  };

  return (
    <Link 
      href={href}
      className="group relative block cursor-pointer"
    >
      <div className={`bg-gray-50 hover:bg-gray-100 p-6 rounded-lg transition-all duration-200 border-2 ${accentColors[accentColor]} hover:shadow-md w-48 ${className}`}>
        <div className="text-center">
          {logo ? (
            <img 
              src={logo} 
              alt={`${title} Logo`}
              className="w-16 h-16 mx-auto mb-4 object-contain rounded-full"
            />
          ) : (
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-400">{title.charAt(0)}</span>
            </div>
          )}
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            {country && (
              <ReactCountryFlag countryCode={country} svg style={{width: '1.2em', height: '1.2em'}} />
            )}
          </div>
          
          {subtitle && <p className="text-sm text-gray-600 mb-2">{subtitle}</p>}
          
          {/* Details extras - Altura fixa para consistência */}
          <div className="text-xs text-gray-500 space-y-1 h-10 flex flex-col justify-center">
            {details.length > 0 ? (
              details.map((detail, index) => (
                <p key={index} className="leading-4">{detail}</p>
              ))
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NavigationCard;
