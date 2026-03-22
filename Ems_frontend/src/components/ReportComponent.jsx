import React, { useState, useEffect } from 'react';
import { downloadEmployeeReport, downloadAttendanceReport, downloadLeaveReport } from '../services/ReportService';
import { getAllDepartments } from '../services/DepartmentService';
import { getAllTeams } from '../services/TeamService';
import { getLoggedInEmployee } from '../services/EmployeeService';
import { FileSpreadsheet, FileText, Download, Users, CalendarClock, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const ReportComponent = () => {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [departmentId, setDepartmentId] = useState('');
    const [teamId, setTeamId] = useState('');
    const [departments, setDepartments] = useState([]);
    const [teams, setTeams] = useState([]);
    const [downloading, setDownloading] = useState({});

    useEffect(() => {
        getLoggedInEmployee().then(res => {
            const context = res.data.data;
            const role = sessionStorage.getItem('role') || '';
            if (role === 'ROLE_TEAM_LEADER' && context.teamId) {
                setTeamId(context.teamId.toString());
                setDepartmentId(context.departmentId ? context.departmentId.toString() : '');
            } else if (role.includes('MANAGER') && context.departmentId) {
                setDepartmentId(context.departmentId.toString());
                getAllTeams(context.departmentId).then(r => setTeams(r.data.data.content || r.data.data || []));
            } else if (role.includes('ADMIN')) {
                getAllDepartments().then(r => setDepartments(r.data.data.content || r.data.data || []));
                getAllTeams().then(r => setTeams(r.data.data.content || r.data.data || []));
            }
        });
    }, []);

    useEffect(() => {
        setTeamId('');
    }, [departmentId]);

    const handleDownload = (key, serviceCall, fileName) => {
        setDownloading(prev => ({ ...prev, [key]: true }));
        serviceCall().then(res => {
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url; a.setAttribute('download', fileName);
            document.body.appendChild(a); a.click(); a.remove();
        }).catch(err => console.error(err))
          .finally(() => setDownloading(prev => ({ ...prev, [key]: false })));
    };

    const inputClass = "mt-1 w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-900 dark:text-white transition-all";

    const simpleReports = [
        {
            key: 'employee',
            icon: Users,
            title: 'Employee Directory',
            description: 'Export all employees with their basic details and information in CSV format.',
            action: () => handleDownload('employee', () => downloadEmployeeReport(departmentId, teamId), 'Employee_Report.csv'),
            color: 'text-primary-600',
            bg: 'bg-primary-50 dark:bg-primary-900/20',
        },
        {
            key: 'leave',
            icon: CalendarClock,
            title: 'Leave History',
            description: 'Export all company leave requests, statuses and remarks in CSV format.',
            action: () => handleDownload('leave', () => downloadLeaveReport(departmentId, teamId), 'Leave_Report.csv'),
            color: 'text-amber-600',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                    <BarChart3 size={22} className="text-primary-600" />
                    <h1 className="text-xl font-black text-slate-900 dark:text-white">Reports &amp; Exports</h1>
                </div>
                {/* Global Filters */}
                {sessionStorage.getItem('role') !== 'ROLE_TEAM_LEADER' && (
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      {sessionStorage.getItem('role')?.includes('ADMIN') && (
                          <>
                              <select className="px-3 py-2 text-sm bg-transparent border-0 outline-none text-slate-700 dark:text-slate-300 font-medium min-w-32 cursor-pointer" 
                                      value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
                                  <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Departments</option>
                                  {departments.map(d => <option key={d.id} value={d.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{d.name}</option>)}
                              </select>
                              <div className="w-px h-6 bg-slate-200 dark:bg-slate-800"></div>
                          </>
                      )}
                      <select className="px-3 py-2 text-sm bg-transparent border-0 outline-none text-slate-700 dark:text-slate-300 font-medium min-w-32 cursor-pointer" 
                              value={teamId} onChange={e => setTeamId(e.target.value)}>
                          <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{sessionStorage.getItem('role')?.includes('MANAGER') ? 'All My Teams' : 'All Teams'}</option>
                          {teams.map(t => <option key={t.id} value={t.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t.name}</option>)}
                      </select>
                  </div>
                )}
            </div>

            {/* Simple Export Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {simpleReports.map(r => (
                    <Card key={r.key} className="flex flex-col">
                        <CardContent className="flex flex-col flex-1 pt-5 pb-5 gap-4">
                            <div className={`w-12 h-12 rounded-xl ${r.bg} flex items-center justify-center`}>
                                <r.icon size={22} className={r.color} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-slate-900 dark:text-white mb-1">{r.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{r.description}</p>
                            </div>
                            <Button onClick={r.action} variant="outline" size="sm" className="w-fit gap-2" disabled={downloading[r.key]}>
                                <Download size={14} /> {downloading[r.key] ? 'Downloading…' : 'Export CSV'}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Attendance Report with Month/Year picker */}
            <Card className="border-l-4 border-l-emerald-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileSpreadsheet size={18} className="text-emerald-600" />
                        Monthly Attendance Report
                        <span className="text-xs font-medium text-slate-400 ml-auto normal-case">Excel (.xlsx)</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Generate a detailed attendance sheet with daily status, check-in/out times and late markings for a specific month.</p>
                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="min-w-36">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Month</label>
                            <select className={inputClass} value={month} onChange={e => setMonth(e.target.value)}>
                                {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                            </select>
                        </div>
                        <div className="min-w-28">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Year</label>
                            <input type="number" className={inputClass} value={year} onChange={e => setYear(e.target.value)} />
                        </div>
                        <Button
                            onClick={() => handleDownload('attendance', () => downloadAttendanceReport(month, year, departmentId, teamId), `Attendance_${MONTHS[month-1]}_${year}.xlsx`)}
                            className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                            disabled={downloading['attendance']}>
                            <FileText size={16} /> {downloading['attendance'] ? 'Generating…' : 'Generate Excel'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ReportComponent;
