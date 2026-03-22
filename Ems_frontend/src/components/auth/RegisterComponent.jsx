import React, { useState } from 'react'
import { registerUser } from '../../services/auth/AuthService';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2'
import { User, Mail, Lock, ArrowRight, UserPlus } from 'lucide-react'

const RegisterComponent = () => {
    const [name, setName] = useState('')
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role] = useState('ROLE_EMPLOYEE')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();

    async function handleRegistration(e) {
        e.preventDefault();
        setLoading(true)
        try {
            await registerUser({ name, username, email, password, role });
            Swal.fire({ icon: 'success', title: 'Account Created!', text: 'You can now log in with your credentials.', timer: 3000 });
            navigate('/login');
        } catch (error) {
            setLoading(false)
            Swal.fire('Registration Failed', (error.response?.data?.message || 'Something went wrong'), 'error');
        }
    }

    const inputClass = "w-full pl-11 pr-4 py-3.5 bg-slate-800 border border-slate-700 text-white rounded-xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium placeholder:text-slate-600"

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
            <div className="w-full max-w-md space-y-8">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-black">E</div>
                    <span className="text-xl font-black text-white">EMS Platform</span>
                </div>

                <div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6">
                        <UserPlus size={22} />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Create Account</h2>
                    <p className="text-slate-400 mt-1.5 font-medium">Register as an employee to get started</p>
                </div>

                <form onSubmit={handleRegistration} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                        <div className="relative">
                            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input type="text" placeholder="John Doe" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Username</label>
                        <div className="relative">
                            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input type="text" placeholder="johndoe123" className={inputClass} value={username} onChange={(e) => setUsername(e.target.value)} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input type="email" placeholder="john@company.com" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input type="password" placeholder="••••••••••" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center text-primary-400"><User size={14} /></div>
                        <div>
                            <p className="text-xs font-black text-slate-300">Role: Standard Employee</p>
                            <p className="text-[10px] text-slate-500">Contact Admin to change your access role</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-600/30"
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <>Create Account <ArrowRight size={18} /></>
                        )}
                    </button>
                </form>

                <p className="text-center text-slate-500 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-400 font-bold hover:text-primary-300 transition-colors">Sign in here</Link>
                </p>
            </div>
        </div>
    )
}

export default RegisterComponent
