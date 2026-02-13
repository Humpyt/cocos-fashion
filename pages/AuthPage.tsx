
import React, { useState } from 'react';
import { User } from '../types';
import { Eye, EyeOff, ChevronRight } from 'lucide-react';

interface Props {
  onSignIn: (user: User) => void;
  onNavigate: (page: string) => void;
}

const AuthPage: React.FC<Props> = ({ onSignIn, onNavigate }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock user for demonstration
    const mockUser: User = {
      id: 'u123',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      starRewardsTier: 'Silver',
      points: 750,
      nextTierPoints: 1000,
    };
    onSignIn(mockUser);
  };

  return (
    <div className="bg-[#F9F9F9] min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row gap-12">
        {/* Sign In Section */}
        <div className="flex-1 bg-white p-8 border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase text-gray-500">Email Address*</label>
              <input 
                type="email" 
                required 
                className="bg-white text-black border border-gray-300 px-4 py-3 outline-none focus:border-black transition-all placeholder:text-gray-400"
                placeholder="example@email.com"
              />
            </div>

            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase text-gray-500">First Name*</label>
                  <input type="text" required className="bg-white text-black border border-gray-300 px-4 py-3 outline-none focus:border-black transition-all" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase text-gray-500">Last Name*</label>
                  <input type="text" required className="bg-white text-black border border-gray-300 px-4 py-3 outline-none focus:border-black transition-all" />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[11px] font-bold uppercase text-gray-500">Password*</label>
              <input 
                type={showPassword ? "text" : "password"} 
                required 
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

            <button type="submit" className="bg-black text-white py-4 font-black uppercase text-sm tracking-widest hover:bg-gray-800 transition-colors mt-4">
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
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
