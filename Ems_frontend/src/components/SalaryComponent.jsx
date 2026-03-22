import React, { useEffect, useState } from 'react'
import { getEmployeeSalary, getSalaryHistory, updateEmployeeSalary, generateMonthlySalary, getAllSalaryRecords, getSalaryRecordsByEmployee, markSalaryAsPaid, payAllSalaries } from '../services/SalaryService'
import { getLoggedInEmployee } from '../services/EmployeeService'
import { isAdminUser } from '../services/auth/AuthService'
import Swal from 'sweetalert2'
import { DollarSign, History, Receipt, Search, TrendingUp, Zap, CheckCircle2, LayoutDashboard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Table, THead, TBody, TR, TH, TD } from './ui/Table'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const SalaryComponent = () => {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [employeeId, setEmployeeId] = useState(null)
    const [targetId, setTargetId] = useState('')
    const [salary, setSalary] = useState(null)
    const [history, setHistory] = useState([])
    const [records, setRecords] = useState([])
    const [currentSalaryForUpdate, setCurrentSalaryForUpdate] = useState(null)
    const [newSalary, setNewSalary] = useState('')
    const [reason, setReason] = useState('')
    const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1)
    const [genYear, setGenYear] = useState(new Date().getFullYear())
    const isAdmin = isAdminUser()
    const isManager = sessionStorage.getItem('role') === 'ROLE_MANAGER'

    useEffect(() => {
        getLoggedInEmployee().then(res => {
            const self = res.data.data
            setEmployeeId(self.id)
            if (activeTab === 'dashboard') fetchData(self.id)
        }).catch(err => console.error('Profile Error', err))
    }, [activeTab])

    const fetchData = (id) => {
        if (!id) return
        getEmployeeSalary(id).then(res => setSalary(res.data.data)).catch(() => setSalary(null))
        getSalaryHistory(id).then(res => setHistory(res.data.data || [])).catch(() => setHistory([]))
        getSalaryRecordsByEmployee(id).then(res => setRecords(res.data.data || [])).catch(() => setRecords([]))
    }

    const handleCheckSalary = () => {
        if (!targetId) { Swal.fire('Error', 'Please enter a Username or Employee ID', 'error'); return }
        getEmployeeSalary(targetId).then(res => setCurrentSalaryForUpdate(res.data.data || 0))
            .catch(err => { Swal.fire('Lookup Failed', err.response?.data?.message || err.message, 'error'); setCurrentSalaryForUpdate(null) })
    }

    const handleUpdateSalary = (e) => {
        e.preventDefault()
        updateEmployeeSalary(targetId, { newSalary: parseFloat(newSalary), reason })
            .then(() => {
                Swal.fire({ title: 'Updated!', text: 'Salary updated successfully', icon: 'success' })
                setCurrentSalaryForUpdate(null); setTargetId(''); setNewSalary(''); setReason('')
            }).catch(err => Swal.fire('Error!', err.response?.data?.message || err.message, 'error'))
    }

    const handleGeneratePayroll = () => {
        generateMonthlySalary({ month: parseInt(genMonth), year: parseInt(genYear) })
            .then(res => {
                Swal.fire({ title: 'Done!', text: res.data.data, icon: 'success' })
                if (activeTab === 'payroll') fetchAllRecords()
            }).catch(err => Swal.fire('Generation Failed', err.response?.data?.message || err.message, 'error'))
    }

    const fetchAllRecords = () => {
        getAllSalaryRecords().then(res => setRecords(res.data.data || [])).catch(() => setRecords([]))
    }

    const handlePay = (id) => {
        markSalaryAsPaid(id).then(() => {
            Swal.fire('Paid!', 'Marked as PAID', 'success')
            activeTab === 'payroll' ? fetchAllRecords() : fetchData(targetId)
        }).catch(err => Swal.fire('Payment Failed', err.response?.data?.message || err.message, 'error'))
    }

    const handlePayAll = () => {
        const pendingCount = records.filter(r => r.status === 'GENERATED').length
        if (pendingCount === 0) { Swal.fire('Info', 'No pending salaries to pay for this period.', 'info'); return }

        Swal.fire({
            title: `Approve Bulk Payment?`,
            text: `You are about to mark ${pendingCount} salaries as PAID. This cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            confirmButtonText: 'Yes, Pay All'
        }).then((result) => {
            if (result.isConfirmed) {
                payAllSalaries(parseInt(genMonth), parseInt(genYear)).then(res => {
                    Swal.fire('Success!', res.data.data, 'success')
                    fetchAllRecords()
                }).catch(err => Swal.fire('Bulk Payment Failed', err.response?.data?.message || err.message, 'error'))
            }
        })
    }

    const fmt = (n) => n?.toLocaleString('en-IN') || '0'
    const inputClass = "mt-1 w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-900 dark:text-white transition-all"

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        ...(isAdmin ? [
            { id: 'update', label: 'Update Salary', icon: TrendingUp },
            { id: 'payroll', label: 'Payroll', icon: Receipt },
        ] : []),
    ]

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1">
                {tabs.map(tab => (
                    <button key={tab.id}
                        onClick={() => { setActiveTab(tab.id); if (tab.id === 'payroll') fetchAllRecords(); if (tab.id === 'update') setCurrentSalaryForUpdate(null); }}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                        <tab.icon size={15} />{tab.label}
                    </button>
                ))}
            </div>

            {/* DASHBOARD TAB */}
            {activeTab === 'dashboard' && (
                <div className="space-y-6">
                    {(isAdmin || isManager) && (
                        <div className="flex gap-3 max-w-md">
                            <input type="text" className={`${inputClass} mt-0 flex-1`} placeholder="Employee ID or Username" value={targetId} onChange={e => setTargetId(e.target.value)} />
                            <Button onClick={() => fetchData(targetId)} className="gap-2 shrink-0"><Search size={15} /> Fetch</Button>
                        </div>
                    )}

                    {/* Current Salary Hero */}
                    <Card className="overflow-hidden">
                        <div className="bg-gradient-to-r from-primary-700 to-primary-950 p-6 text-white">
                            <p className="text-xs font-bold uppercase tracking-widest text-primary-200 mb-1">Current Compensation</p>
                            <p className="text-4xl font-black">₹ {salary !== null ? fmt(salary) : '—'}</p>
                            {salary === null && <p className="text-primary-300 text-sm mt-1">No salary data found.</p>}
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Salary History */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center gap-2 text-slate-500 uppercase tracking-widest">
                                    <History size={14} /> Salary History
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <THead><TR><TH>Date</TH><TH>New</TH><TH>Old</TH><TH>Reason</TH></TR></THead>
                                    <TBody>
                                        {history.map(h => (
                                            <TR key={h.id}>
                                                <TD>{new Date(h.changedAt).toLocaleDateString('en-IN')}</TD>
                                                <TD className="text-emerald-600 font-bold">₹{fmt(h.newSalary)}</TD>
                                                <TD className="text-slate-400">₹{fmt(h.oldSalary)}</TD>
                                                <TD className="text-slate-500 text-xs max-w-32 truncate" title={h.reason}>{h.reason || '—'}</TD>
                                            </TR>
                                        ))}
                                        {!history.length && <TR><TD colSpan="4" className="text-center py-8 text-slate-400">No history found.</TD></TR>}
                                    </TBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Monthly Records */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center gap-2 text-slate-500 uppercase tracking-widest">
                                    <Receipt size={14} /> Monthly Records
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <THead><TR><TH>Period</TH><TH>Final Pay</TH><TH>Status</TH></TR></THead>
                                    <TBody>
                                        {records.map(r => (
                                            <TR key={r.id}>
                                                <TD>{MONTHS[r.month - 1]} {r.year}</TD>
                                                <TD className="font-bold">₹{fmt(r.finalSalary)}</TD>
                                                <TD><Badge variant={r.status === 'PAID' ? 'success' : 'warning'}>{r.status}</Badge></TD>
                                            </TR>
                                        ))}
                                        {!records.length && <TR><TD colSpan="3" className="text-center py-8 text-slate-400">No records found.</TD></TR>}
                                    </TBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* UPDATE SALARY TAB */}
            {activeTab === 'update' && isAdmin && (
                <div className="max-w-lg space-y-4">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp size={18} className="text-primary-600" /> Modify Employee Pay</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employee ID / Username</label>
                                <div className="flex gap-2 mt-1">
                                    <input type="text" className={`${inputClass} mt-0 flex-1`} value={targetId} onChange={e => { setTargetId(e.target.value); setCurrentSalaryForUpdate(null) }} />
                                    <Button onClick={handleCheckSalary} variant="outline" className="gap-1.5 shrink-0"><Search size={14} /> Check</Button>
                                </div>
                            </div>

                            {currentSalaryForUpdate !== null && (
                                <form onSubmit={handleUpdateSalary} className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-3 text-center">
                                        <p className="text-xs text-slate-500 font-medium mb-0.5">Current Salary</p>
                                        <p className="text-2xl font-black text-primary-600">₹ {fmt(currentSalaryForUpdate)}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Salary Amount *</label>
                                        <input type="number" className={inputClass} required value={newSalary} onChange={e => setNewSalary(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reason *</label>
                                        <textarea rows={3} className={`${inputClass} resize-none`} required value={reason} onChange={e => setReason(e.target.value)} placeholder="Appraisal, Promotion, Correction, etc." />
                                    </div>
                                    <Button type="submit" className="w-full justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20">
                                        <CheckCircle2 size={16} /> Approve Salary Revision
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* PAYROLL TAB */}
            {activeTab === 'payroll' && isAdmin && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Zap size={18} className="text-amber-500" /> Generate Monthly Payroll</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 items-end">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Month</label>
                                    <select className={inputClass} value={genMonth} onChange={e => setGenMonth(e.target.value)}>
                                        {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Year</label>
                                    <input type="number" className={inputClass} value={genYear} onChange={e => setGenYear(e.target.value)} />
                                </div>
                                <Button onClick={handleGeneratePayroll} className="justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white shadow-amber-500/20">
                                    <Zap size={16} /> Generate Payroll
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm flex items-center gap-2 text-slate-500 uppercase tracking-widest">
                                    <Receipt size={14} /> Organization-Wide Payroll Records
                                </CardTitle>
                                {records.some(r => r.status === 'GENERATED') && (
                                    <Button size="sm" onClick={handlePayAll} className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 gap-2 h-8 px-4 rounded-lg">
                                        <CheckCircle2 size={14} /> Pay All
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <THead><TR><TH>Employee</TH><TH>Period</TH><TH>Final Salary</TH><TH>Status</TH><TH>Action</TH></TR></THead>
                                <TBody>
                                    {records.map(r => (
                                        <TR key={r.id}>
                                            <TD>
                                                <p className="font-bold text-slate-800 dark:text-slate-200">{r.employeeName}</p>
                                                <p className="text-xs text-slate-500">ID: {r.employeeId}</p>
                                            </TD>
                                            <TD>{MONTHS[r.month - 1]} {r.year}</TD>
                                            <TD className="font-black text-primary-600">₹{fmt(r.finalSalary)}</TD>
                                            <TD><Badge variant={r.status === 'PAID' ? 'success' : 'warning'}>{r.status}</Badge></TD>
                                            <TD>
                                                {r.status === 'GENERATED' && (
                                                    <Button size="sm" onClick={() => handlePay(r.id)} className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5">
                                                        <CheckCircle2 size={13} /> Pay Now
                                                    </Button>
                                                )}
                                            </TD>
                                        </TR>
                                    ))}
                                    {!records.length && <TR><TD colSpan="5" className="text-center py-10 text-slate-400">No payroll records found.</TD></TR>}
                                </TBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

export default SalaryComponent
