import { useState, type FormEvent } from "react";
import { useAuth } from '../context/AuthContext';
import TextField from "../components/ui/TextField";

function RegisterPage(){
    const { register } = useAuth();

    const [name, setName] =  useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setSubmitError(null);
        setIsSubmitting(true);
        try {
            if (name == "" && email == "" && password == "" && confirmPassword == ""){
                throw Error("Completa todos los campos por favor.");
            }
            
            await register(name, email, password);
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'Ocurrió un error inesperado');
        } finally {
            setIsSubmitting(false);
        }
    }
    


    return (
        <main className="min-h-screen grid place-items-center p-4">
            <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
                <h2 className="text-2xl col-span-1">Crea una cuenta</h2>

                {submitError && (
                    <div role="alert" className="alert-error">
                    {submitError}
                    </div>
                )}

                <TextField id="name" label="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                <TextField id="email" label="Correo Electrónico" value={email} type="email" onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                <TextField id="password" placeholder="********" label="Contraseña" value={password} type="password" onChange={(e) => setPassword(e.target.value)} />
                <TextField id="confirmPassword" placeholder="********" label="Confirmar Contraseña" value={confirmPassword} type="password" onChange={(e) => setConfirmPassword(e.target.value)} />                    

                <button type="submit" className="px-4 py-2 bg-black text-white rounded-2xl cursor-pointer hover:bg-mist-900 transition-colors" disabled={isSubmitting}>
                    {isSubmitting ? 'Creando cuenta...' : 'Registrarme'}
                </button> 
            </form>
            
            
        </main>
        
        
    );
}

export default RegisterPage;