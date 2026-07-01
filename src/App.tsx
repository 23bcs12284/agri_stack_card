import { FarmerProvider } from './context/FarmerContext';
import { Header } from './components/Header';
import { Home } from './pages/Home';

function App() {
  return (
    <FarmerProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
        <Header />
        <main className="flex-1 flex flex-col justify-start">
          <Home />
        </main>
      </div>
    </FarmerProvider>
  );
}

export default App;
