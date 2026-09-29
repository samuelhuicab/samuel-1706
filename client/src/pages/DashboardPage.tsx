import { useState, type FormEvent } from "react";
import { useAuth } from '../context/AuthContext';
import TextField from "../components/ui/TextField";

function DashboardPage(){

    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);


    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setSubmitError(null);
        setIsSubmitting(true);
        try {
            await login(email, password);
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'Ocurrió un error inesperado');
        } finally {
            setIsSubmitting(false);
        }
    }


    return (
        <main className="min-h-screen grid place-items-center p-4">
            <form className="grid grid-cols-1 gap-4 w-md max-w-md" onSubmit={handleSubmit}>
                <h2 className="text-2xl col-span-1">Inicio de sesión</h2>

                {submitError && (
                    <div role="alert" className="alert-error">
                    {submitError}
                    </div>
                )}

                <TextField id="email" label="Correo electrónico" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                <TextField id="password" label="Contraseña" type="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)}/>               

                <button type="submit" className="px-4 py-2 bg-black text-white rounded-2xl cursor-pointer hover:bg-mist-900 transition-colors" disabled={isSubmitting}>
                    {isSubmitting ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
                </button> 
            </form>
        </main>
    );
}

export default DashboardPage;