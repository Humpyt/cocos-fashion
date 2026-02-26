
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Eye, EyeOff, ChevronRight } from 'lucide-react';
import { authApi, tokenStore } from '../lib/api';

interface Props {
  onSignIn: (user: User) => void;
  onNavigate: (page: string) => void;
}

const AuthPage: React.FC<Props> = ({ onSignIn, onNavigate }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle Google OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');

    if (success === 'true') {
      const restoreSession = async () => {
        try {
          const refreshed = await authApi.refresh();
          tokenStore.setAccessToken(refreshed.accessToken);
          onSignIn(refreshed.user as User);
          // Clean up URL
          window.history.replaceState({}, '', '/auth');
        } catch (error) {
          setErrorMessage('Google authentication failed');
        }
      };
      restoreSession();
    }
  }, [onSignIn]);

  const handleGoogleSignIn = () => {
    authApi.googleAuth();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const authResponse = mode === 'signin'
        ? await authApi.login({ email, password })
        : await authApi.register({ email, password, firstName, lastName });

      tokenStore.setAccessToken(authResponse.accessToken);
      onSignIn(authResponse.user as User);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F9F9F9] min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row gap-12">
        {/* Sign In Section */}
        <div className="flex-1 bg-white p-8 border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full bg-white border border-gray-300 py-3 px-4 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-sm font-medium">Continue with Google</span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase text-gray-500">Email Address*</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white text-black border border-gray-300 px-4 py-3 outline-none focus:border-black transition-all placeholder:text-gray-400"
                placeholder="example@email.com"
              />
            </div>

            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase text-gray-500">First Name*</label>
                  <input
                    type="text"
                    required={mode === 'signup'}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-white text-black border border-gray-300 px-4 py-3 outline-none focus:border-black transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase text-gray-500">Last Name*</label>
                  <input
                    type="text"
                    required={mode === 'signup'}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-white text-black border border-gray-300 px-4 py-3 outline-none focus:border-black transition-all"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[11px] font-bold uppercase text-gray-500">Password*</label>
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white text-black border border-gray-300 px-4 py-3 outline-none focus:border-black transition-all"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[34px] text-gray-400 hover:text-black"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {mode === 'signin' && (
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-xs cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 accent-black" /> 
                  <span className="font-medium">Keep me signed in</span>
                </label>
                <button type="button" className="text-xs font-bold underline hover:text-cocos-orange transition-colors">Forgot Password?</button>
              </div>
            )}

            {errorMessage && (
              <p className="text-xs text-red-600 font-bold">{errorMessage}</p>
            )}

            <button type="submit" disabled={isSubmitting} className="bg-black text-white py-4 font-black uppercase text-sm tracking-widest hover:bg-gray-800 transition-colors mt-4 disabled:opacity-50">
              {isSubmitting ? 'Please wait...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
            </button>

            <p className="text-[10px] text-gray-500 text-center leading-relaxed">
              By continuing, you agree to Coco's <span className="underline cursor-pointer">Terms of Use</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
            </p>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col gap-4">
             <button 
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-xs font-black uppercase tracking-widest text-center hover:text-cocos-orange transition-colors"
             >
               {mode === 'signin' ? 'New to Coco\'s? Create an account' : 'Already have an account? Sign in'}
             </button>
          </div>
        </div>

        {/* Perks Section */}
        <div className="w-full md:w-80 flex flex-col gap-8">
           <div className="bg-cocos-orange text-white p-8 shadow-md">
              <h3 className="text-xl font-black italic uppercase tracking-tighter mb-4">★ Star Rewards</h3>
              <p className="text-[13px] font-bold leading-relaxed mb-6">
                Join our free rewards program and get 25% off your next purchase!
              </p>
              <ul className="flex flex-col gap-4 mb-8">
                {['Earn points on every purchase', 'Birthday surprises', 'Free shipping offers', 'Star Money days'].map(perk => (
                  <li key={perk} className="flex items-start gap-2 text-[11px] font-bold uppercase tracking-tight">
                    <ChevronRight size={14} className="flex-shrink-0" /> {perk}
                  </li>
                ))}
              </ul>
              <button className="w-full bg-white text-black py-3 text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-colors">
                Learn More
              </button>
           </div>

           <div className="bg-white border border-gray-200 p-8 shadow-sm">
              <h3 className="text-sm font-black uppercase mb-4 tracking-tighter">Coco's Cardholder?</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-6">
                Manage your account, pay your bill, and view your exclusive benefits here.
              </p>
              <button className="text-xs font-black uppercase tracking-widest underline hover:text-cocos-orange transition-colors">
                Manage Coco's Card
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
