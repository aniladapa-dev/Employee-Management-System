import React, { useEffect, useState } from 'react';
import { getDashboardData } from '../services/DashboardService';
import { useNavigate } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { clsx } from 'clsx';
import { 
  Users, 
  Building2,
  UsersRound,
  TrendingUp, 
  Zap, 
  Bell, 
  ArrowUpRight,
  Clock,
  PlusCircle,
  FileBarChart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const DashboardComponent = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const response = await getDashboardData();
            setDashboardData(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error loading dashboard", err);
            setError("Failed to load dashboard data.");
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
            <p className="mt-4 font-semibold text-slate-500 animate-pulse">Preparing your workspace...</p>
        </div>
    );
    
    if (error) return (
        <div className="max-w-2xl mx-auto mt-12">
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                    <Zap size={24} />
                </div>
                <h4 className="text-lg font-bold text-red-700 dark:text-red-400">Connection Error</h4>
                <p className="text-red-600/80 dark:text-red-400/80 mt-2">{error}</p>
                <Button className="mt-6" variant="danger" onClick={loadDashboard}>Try Again</Button>
            </div>
        </div>
    );

    if (!dashboardData) return null;

    const renderChart = (analytics) => {
        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#94a3b8' : '#64748b';
        const gridColor = isDark ? '#1e293b' : '#f1f5f9';

        const chartData = {
            labels: analytics.labels,
            datasets: [
                {
                    label: analytics.title,
                    data: analytics.values,
                    backgroundColor: [
                        '#2563eb', // primary
                        '#10b981', // success
                        '#f59e0b', // warning
                        '#ef4444', // danger
                        '#0ea5e9', // info
                    ],
                    borderRadius: 6,
                    borderWidth: 0,
                },
            ],
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                  position: 'bottom', 
                  labels: { 
                    usePointStyle: true, 
                    padding: 20,
                    color: textColor,
                    font: { size: 11, family: 'Inter' }
                  } 
                },
                title: { display: false },
            },
            scales: analytics.type !== 'pie' ? {
                y: { 
                  beginAtZero: true, 
                  grid: { color: gridColor },
                  ticks: { color: textColor, font: { size: 10 } }
                },
                x: { 
                  grid: { display: false },
                  ticks: { color: textColor, font: { size: 10 } }
                }
            } : {}
        };

        return (
          <div className="h-[300px] w-full">
            {analytics.type === 'pie' && <Pie data={chartData} options={options} />}
            {analytics.type === 'line' && <Line data={chartData} options={options} />}
            {analytics.type !== 'pie' && analytics.type !== 'line' && <Bar data={chartData} options={options} />}
          </div>
        );
    };

    const getIconForCard = (title) => {
      const lower = title.toLowerCase();
      if (lower.includes('employee')) return <Users className="text-primary-600" />;
      if (lower.includes('department')) return <Building2 className="text-emerald-600" />;
      if (lower.includes('team')) return <UsersRound className="text-amber-600" />;
      return <TrendingUp className="text-blue-600" />;
    };

    const getBgForCard = (title) => {
      const lower = title.toLowerCase();
      if (lower.includes('employee')) return 'bg-primary-50 dark:bg-primary-900/10';
      if (lower.includes('department')) return 'bg-emerald-50 dark:bg-emerald-900/10';
      if (lower.includes('team')) return 'bg-amber-50 dark:bg-amber-900/10';
      return 'bg-blue-50 dark:bg-blue-900/10';
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {dashboardData.title || 'Manage Your Workforce Smarter'}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {dashboardData.subtitle || "Here's what's happening today."}
                </p>
              </div>
            </div>

            {/* Attendance Summary Banner (if available) */}
            {dashboardData.userAttendance && (
                <div className="relative overflow-hidden bg-primary-600 rounded-3xl p-8 text-white shadow-2xl shadow-primary-600/30">
                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-1">
                      <p className="text-primary-100 font-bold uppercase tracking-wider text-xs">My Attendance Summary</p>
                      <h3 className="text-2xl font-bold">
                        {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-16">
                      <div className="space-y-1">
                        <p className="text-primary-200 text-xs font-medium">Total Days</p>
                        <p className="text-2xl font-bold">{dashboardData.userAttendance.totalDays}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-primary-200 text-xs font-medium">Present</p>
                        <p className="text-2xl font-bold text-emerald-300">{dashboardData.userAttendance.presentDays}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-primary-200 text-xs font-medium">Late</p>
                        <p className="text-2xl font-bold text-amber-300">{dashboardData.userAttendance.lateDays}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-primary-200 text-xs font-medium">Avg Hours</p>
                        <p className="text-2xl font-bold">{(dashboardData.userAttendance.averageWorkingHours || 0).toFixed(1)}h</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-400/20 blur-2xl rounded-full translate-y-1/2 -translate-x-1/2" />
                </div>
            )}

            {/* Overview Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardData.overviewCards.map((card, index) => (
                    <Card key={index} className="group hover:border-primary-500/50 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              {card.title}
                            </p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                              {card.value}
                            </h3>
                          </div>
                          <div className={clsx(
                            "p-3 rounded-2xl group-hover:scale-110 transition-transform",
                            getBgForCard(card.title)
                          )}>
                            {getIconForCard(card.title)}
                          </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs font-bold text-emerald-600">
                          <ArrowUpRight size={14} className="mr-1" />
                          <span>+4.5% vs last month</span>
                        </div>
                      </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Analytics Charts */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {dashboardData.analytics.map((chart, index) => (
                        <Card key={index} className={clsx(dashboardData.analytics.length === 1 && "md:col-span-1")}>
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-base font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                              {chart.title}
                            </CardTitle>
                            <TrendingUp size={16} className="text-slate-400" />
                          </CardHeader>
                          <CardContent>
                            {renderChart(chart)}
                          </CardContent>
                        </Card>
                    ))}
                    {dashboardData.analytics.length === 1 && (
                      <Card className="bg-gradient-to-br from-primary-600 to-primary-700 dark:from-indigo-600 dark:to-indigo-900 text-white border-0 overflow-hidden relative shadow-2xl shadow-primary-500/20 transition-all">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-primary-100/80 text-xs uppercase tracking-widest font-black">Team Efficiency</CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 flex flex-col justify-between h-[250px]">
                          <div>
                            <h4 className="text-4xl font-black mb-1">Excellent</h4>
                            <p className="text-primary-100/70 text-sm font-medium">Your team is performing above average this week.</p>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex justify-between items-end border-b border-white/10 pb-2">
                              <span className="text-xs font-bold text-primary-200">Consistency</span>
                              <span className="text-xl font-bold italic">94%</span>
                            </div>
                            <div className="flex justify-between items-end border-b border-white/10 pb-2">
                              <span className="text-xs font-bold text-primary-200">On-Time Rate</span>
                              <span className="text-xl font-bold italic">88%</span>
                            </div>
                          </div>
                          
                          {/* Mesh background effect */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
                          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-400/20 blur-2xl rounded-full" />
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Recent Insights */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap size={20} className="text-amber-500 fill-amber-500" />
                        <CardTitle className="text-slate-900 dark:text-white">Recent Insights</CardTitle>
                      </div>
                      <Badge variant="neutral" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">System Activity</Badge>
                    </CardHeader>
                    <CardContent className="px-0">
                      <div className="space-y-6">
                        {dashboardData.insights.map((insight, idx) => (
                            <div key={idx} className="px-6">
                                <h6 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">
                                  {insight.title}
                                </h6>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {insight.items.map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-primary-600">
                                              <Clock size={18} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate leading-none mb-1">
                                                  {item.name || item.type || "System Entry"}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                  {item.date || item.status || item.email || item.reason || ""}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar (Announcements & Quick Actions) */}
                <div className="space-y-8">
                    {/* Latest Announcements */}
                    {dashboardData.announcements && (
                        <Card className="border-t-4 border-t-primary-600">
                            <CardHeader className="flex flex-row items-center justify-between border-0 pb-0">
                                <div className="flex items-center gap-2">
                                  <Bell size={20} className="text-primary-600" />
                                  <CardTitle>What's New</CardTitle>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => navigate('/announcements')}>View All</Button>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                {dashboardData.announcements.slice(0, 3).map((ann, i) => (
                                    <div key={i} className="group cursor-pointer">
                                        <div className="flex gap-4">
                                          <div className="mt-1 flex flex-col items-center">
                                            <div className="w-2 h-2 rounded-full bg-primary-600 group-hover:scale-150 transition-transform" />
                                            <div className="w-px flex-1 bg-slate-100 dark:bg-slate-800 my-1" />
                                          </div>
                                          <div className="pb-4 border-b border-slate-50 dark:border-slate-800/50 last:border-0 last:pb-0">
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 transition-colors mb-1">
                                              {ann.title}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                              {ann.message}
                                            </p>
                                            <p className="text-[10px] font-medium text-primary-500 mt-2">
                                              {new Date(ann.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                          </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Actions */}
                    <Card className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden relative">
                        <CardHeader className="border-slate-100 dark:border-slate-800 pb-0">
                            <CardTitle className="text-slate-900 dark:text-white">Quick Actions</CardTitle>
                            <p className="text-slate-500 text-xs mt-1 font-medium">Direct module links</p>
                        </CardHeader>
                        <CardContent className="grid gap-3 pt-6">
                            {dashboardData.quickActions.map((action, index) => (
                                <button 
                                    key={index}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group text-left border border-slate-100 dark:border-slate-800 hover:border-primary-500/20 shadow-sm hover:shadow-md"
                                    onClick={() => navigate(action.link)}
                                >
                                    <div className={clsx(
                                      "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110",
                                      action.color === 'primary' ? 'bg-primary-600 shadow-primary-600/20' : 
                                      action.color === 'success' ? 'bg-emerald-600 shadow-emerald-600/20' :
                                      action.color === 'warning' ? 'bg-amber-600 shadow-amber-600/20' : 'bg-red-600 shadow-red-600/20'
                                    )}>
                                        <ArrowUpRight size={20} />
                                    </div>
                                    <div className="flex-1">
                                      <span className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                        {action.title}
                                      </span>
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Jump to Module</p>
                                    </div>
                                </button>
                            ))}
                        </CardContent>
                        {/* Mesh gradient background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 blur-3xl rounded-full" />
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DashboardComponent;
