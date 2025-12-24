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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#2a415e' }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-large w-full max-w-md p-8 relative z-10 border border-white/20">
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            {/* <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent mb-2">RME CRM</h1> */}
            <img src="https://rowad-rme.com/wp-content/uploads/Rowad-Logo.png" width="300" alt="Rowad Logo" className="mx-auto" />
          </div>
          <p className="text-gray-600 font-medium">Sign in to your account</p>
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
            className="w-full btn btn-primary flex items-center justify-center shadow-glow hover:shadow-glow-purple"
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

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500 font-medium">Demo Credentials</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3 mt-4">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@crm.com');
                setPassword('admin123');
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-red-50 to-orange-50 text-red-700 rounded-lg text-sm font-semibold hover:from-red-100 hover:to-orange-100 transition-all duration-200 border border-red-200/50 shadow-sm hover:shadow-md"
            >
              🔑 Admin Account
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('clevel@crm.com');
                setPassword('clevel123');
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-lg text-sm font-semibold hover:from-purple-100 hover:to-pink-100 transition-all duration-200 border border-purple-200/50 shadow-sm hover:shadow-md"
            >
              👔 C-Level Executive
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('dev@crm.com');
                setPassword('dev123');
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-lg text-sm font-semibold hover:from-blue-100 hover:to-cyan-100 transition-all duration-200 border border-blue-200/50 shadow-sm hover:shadow-md"
            >
              👨‍💻 Project Developer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
