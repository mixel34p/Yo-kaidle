import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Login = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
    });
    if (error) console.error('Error during login:', error.message);
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/'); // Redirigir al juego tras iniciar sesión
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-500 to-indigo-800">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Inicia sesión</h1>
        <button
          onClick={handleLogin}
          className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <img
            src="/icons/app/discord-logo.png"
            alt="Discord Logo"
            className="w-6 h-6 mr-2"
          />
          Iniciar sesión con Discord
        </button>
      </div>
    </div>
  );
};

export default Login;
