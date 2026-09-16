import Chat from './components/Chat';
import Admin from './components/Admin';

function App() {
  const isAdmin = typeof window !== 'undefined' && window.location.pathname === '/admin';

  return (
    <main>
      {isAdmin ? <Admin /> : <Chat />}
    </main>
  );
}

export default App;
