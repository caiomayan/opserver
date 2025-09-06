import Header from './Header';
import Footer from './Footer';
import LogoScreen from './LogoScreen';


const Home = () => {
  return (
    <LogoScreen>
      <Header />
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-64px-56px)]">
        <h1 className="text-4xl font-bold text-gray-900 text-center">A Great Chaos</h1>
      </main>
      <Footer text="Development" />
    </LogoScreen>
  );
};

export default Home;
