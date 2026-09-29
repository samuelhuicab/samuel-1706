import { useAuth } from './context/AuthContext'
import RegisterPage from './pages/RegisterPage';

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p>Cargando...</p>;
  }

  return (
    <>
      {user ? (
        <h1>Bienvenido {user ? user.name : 'Sin sesión'}</h1>
      ) : (
        <RegisterPage/>
      )}
    </>
  );
  
}

export default App
