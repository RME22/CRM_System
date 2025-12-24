import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = await login(email, password);
      toast.success('Welcome back!');
      
      // Redirect based on user role
      if (userData.role === 'PROJECT_DEV') {
        navigate('/projects');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-secondary-600/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-secondary-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary-700/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-40 right-40 w-80 h-80 bg-accent-500/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="bg-white/98 backdrop-blur-xl rounded-3xl shadow-brand w-full max-w-md p-10 relative z-10 border-2 border-primary-200/30 animate-scale-in">
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center animate-slide-in-up">
            <img src="https://rowad-rme.com/wp-content/uploads/Rowad-Logo.png" width="300" alt="Rowad Logo" className="mx-auto" />
          </div>
          <p className="text-primary-800 font-bold text-xl">Sign in to your account</p>
          <div className="w-20 h-1 bg-gradient-brand mx-auto mt-3 rounded-full"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary flex items-center justify-center text-base py-3 shadow-soft hover:shadow-glow"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-600 font-semibold">Demo Credentials</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 mt-5">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@crm.com');
                setPassword('admin123');
              }}
              className="px-5 py-3 bg-gradient-to-r from-secondary-50 to-secondary-100 text-secondary-800 rounded-xl text-sm font-bold hover:from-secondary-100 hover:to-secondary-200 transition-all duration-300 border-2 border-secondary-300/60 shadow-sm hover:shadow-glow-red transform hover:scale-[1.02]"
            >
              Admin Account
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('clevel@crm.com');
                setPassword('clevel123');
              }}
              className="px-5 py-3 bg-gradient-to-r from-primary-50 to-primary-100 text-primary-800 rounded-xl text-sm font-bold hover:from-primary-100 hover:to-primary-200 transition-all duration-300 border-2 border-primary-300/60 shadow-sm hover:shadow-glow transform hover:scale-[1.02]"
            >
              C-Level Executive
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('dev@crm.com');
                setPassword('dev123');
              }}
              className="px-5 py-3 bg-gradient-to-r from-accent-50 to-accent-100 text-accent-800 rounded-xl text-sm font-bold hover:from-accent-100 hover:to-accent-200 transition-all duration-300 border-2 border-accent-300/60 shadow-sm hover:shadow-glow-accent transform hover:scale-[1.02]"
            >
              Project Developer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
