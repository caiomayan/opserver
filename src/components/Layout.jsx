import Header from './Header';
import Footer from './Footer';

const Layout = ({ 
  children, 
  headerProps = {}, 
  footerText = "Development",
  className = "",
  fullPage = false 
}) => {
  if (fullPage) {
    return (
      <div className={`min-h-screen bg-white text-black flex flex-col relative ${className}`}>
        <Header {...headerProps} />
        {children}
        <Footer text={footerText} />
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen bg-white text-black flex flex-col relative ${className}`}>
      <Header {...headerProps} />
      
      <div className="flex-1 flex items-center justify-center p-4">
        {children}
      </div>
      
      <Footer text={footerText} />
    </div>
  );
};

export default Layout;
