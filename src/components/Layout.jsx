import LogoHeader from './LogoHeader';
import Footer from './Footer';

const Layout = ({ 
  children, 
  headerProps = {},
  className = "",
  fullPage = false 
}) => {
  if (fullPage) {
    return (
      <div className={`min-h-screen bg-white text-black flex flex-col relative ${className}`}>
  <LogoHeader {...headerProps} />
        {children}
        <Footer />
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen bg-white text-black flex flex-col relative ${className}`}>
  <LogoHeader {...headerProps} />
      
      <div className="flex-1 flex items-center justify-center p-4">
        {children}
      </div>
      
      <Footer />
    </div>
  );
};

export default Layout;
