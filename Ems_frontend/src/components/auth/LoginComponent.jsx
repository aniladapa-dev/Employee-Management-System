import React, { useState } from 'react'
import { loginUser, saveLoggedInUser, storeToken } from '../../services/auth/AuthService';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'
import { Lock, User, LogIn } from 'lucide-react'

const LoginComponent = () => {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const loginDto = { usernameOrEmail, password };
            const response = await loginUser(loginDto);
            const token = response.data.data.accessToken;
            const role = response.data.data.role;
            storeToken(token);
            saveLoggedInUser(usernameOrEmail, role);
            Swal.fire({ icon: 'success', title: 'Welcome back!', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
            navigate('/');
        } catch (error) {
            setLoading(false);
            Swal.fire('Login Failed', (error.response?.data?.message || 'Invalid credentials. Please check your username and password.'), 'error');
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Left - Branding Panel */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary-700 to-primary-950 flex-col justify-between p-12 relative overflow-hidden">
                {/* Background decorative blobs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                {/* Logo */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-black text-lg">E</div>
                        <span className="text-2xl font-black text-white tracking-tight">EMS</span>
                    </div>
                </div>

                {/* Main Copy */}
                <div className="relative z-10 space-y-4">
                    <h1 className="text-4xl font-black text-white leading-tight">
                        Manage Your <br />
                        <span className="text-primary-200">Workforce Smarter.</span>
                    </h1>
                    <p className="text-primary-200/80 text-lg font-medium max-w-sm">
                        A secure, role-based Employee Management System designed for efficient workforce operations and analytics.
                    </p>
                    <div className="flex gap-4 pt-2">
                        {['Employees', 'Attendance', 'Leaves', 'Reports'].map(feature => (
                            <div key={feature} className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 text-xs font-bold text-primary-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                {feature}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats row */}
                <div className="relative z-10 grid grid-cols-3 gap-6">
                    {[['500+', 'Employees'], ['24/7', 'Uptime'], ['15+', 'Modules']].map(([val, label]) => (
                        <div key={label}>
                            <p className="text-2xl font-black text-white">{val}</p>
                            <p className="text-primary-200/70 text-xs font-medium uppercase tracking-widest">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-6">
                        <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-black">E</div>
                        <span className="text-xl font-black text-white">EMS</span>
                    </div>

                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Sign in</h2>
                        <p className="text-slate-400 mt-1.5 font-medium">Enter your credentials to access your workspace</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Username or Email</label>
                            <div className="relative">
                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="john.doe or john@company.com"
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-800 border border-slate-700 text-white rounded-xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium placeholder:text-slate-600"
                                    value={usernameOrEmail}
                                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="password"
                                    placeholder="••••••••••"
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-800 border border-slate-700 text-white rounded-xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium placeholder:text-slate-600"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 py-3.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-primary-600/30"
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <>Sign In</>
                            )}
                        </button>
                    </form>


                    <p className="text-center text-slate-600 text-[11px] uppercase tracking-widest font-medium">
                        © 2025 EMS Platform · All rights reserved
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LoginComponent
