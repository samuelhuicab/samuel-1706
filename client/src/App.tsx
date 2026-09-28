import { useAuth } from './context/AuthContext'

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p>Cargando...</p>;
  }

  return (
    <>
      <h1>Bienvenido {user ? user.name : 'Sin sesión'}</h1>;
      <button className="btn btn-primary">Prueba</button>
    </>
  );
  
}

export default App
