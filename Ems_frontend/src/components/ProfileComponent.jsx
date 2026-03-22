import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMyProfile, getEmployeeProfile, updateProfile } from '../services/ProfileService';
import { listDocuments, uploadDocument, downloadDocument } from '../services/DocumentService';
import Swal from 'sweetalert2';
import {
  Mail, Phone, MapPin, Pencil, X, Check, Upload, Download, FileText,
  Briefcase, Users, Calendar, Star, TrendingUp, ClipboardList, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

const ProfileComponent = () => {
    const { employeeId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [updateDto, setUpdateDto] = useState({ phone: '', address: '' });
    const [documents, setDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadProfile(); }, [employeeId]);

    const loadProfile = () => {
        setLoading(true);
        const fetchPromise = employeeId ? getEmployeeProfile(employeeId) : getMyProfile();
        fetchPromise.then(res => {
            const data = res.data.data;
            setProfile(data);
            setUpdateDto({ phone: data.basicInfo.phone || '', address: data.basicInfo.address || '' });
            if (data.basicInfo.employeeId) fetchDocuments(data.basicInfo.employeeId);
        }).catch(err => {
            Swal.fire('Error', err.response?.data?.message || 'Failed to load profile', 'error');
            if (employeeId) navigate('/profile');
        }).finally(() => setLoading(false));
    };

    const fetchDocuments = (eid) => {
        if (!eid) return;
        listDocuments(eid).then(res => setDocuments(res.data.data || [])).catch(console.error);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const eid = profile?.basicInfo?.employeeId;
        if (!eid) { Swal.fire('Error', 'Employee ID missing', 'error'); return; }
        setUploading(true);
        uploadDocument(eid, file)
            .then(() => { Swal.fire('Uploaded!', 'Document uploaded successfully', 'success'); fetchDocuments(eid); })
            .catch(() => Swal.fire('Error', 'Failed to upload document', 'error'))
            .finally(() => { setUploading(false); e.target.value = null; });
    };

    const handleFileDownload = (docId, fileName) => {
        downloadDocument(docId).then(res => {
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url; a.setAttribute('download', fileName);
            document.body.appendChild(a); a.click(); a.remove();
        }).catch(() => Swal.fire('Error', 'Failed to download file', 'error'));
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        updateProfile(updateDto).then(res => {
            setProfile(res.data.data); setIsEditing(false);
            Swal.fire('Updated!', 'Profile updated successfully', 'success');
        }).catch(err => Swal.fire('Error', err.response?.data?.message || 'Update failed', 'error'));
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );
    if (!profile) return null;

    const { basicInfo, workInfo, salary, attendance, leave, adminActivity } = profile;
    const initials = basicInfo.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();

    const statusColor = { APPROVED: 'success', PENDING: 'warning', REJECTED: 'danger' };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        {/* Avatar + Basic */}
                        <Card>
                            <CardContent>
                                <div className="flex flex-col items-center pb-4">
                                    <div className="w-20 h-20 rounded-2xl bg-primary-600 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-primary-600/30 mb-3">
                                        {initials}
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white">{basicInfo.name}</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest mt-0.5">
                                        {workInfo?.designation || basicInfo.role?.replace('ROLE_', '')}
                                    </p>
                                </div>
                                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                        <Mail size={15} className="text-primary-500 shrink-0" />
                                        <span className="truncate">{basicInfo.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                        <Phone size={15} className="text-primary-500 shrink-0" />
                                        <span>{basicInfo.phone || 'No phone added'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                        <MapPin size={15} className="text-primary-500 shrink-0" />
                                        <span>{basicInfo.address || 'No address added'}</span>
                                    </div>
                                </div>

                                {!employeeId && (
                                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                                        {!isEditing ? (
                                            <Button variant="outline" size="sm" className="w-full" onClick={() => setIsEditing(true)}>
                                                <Pencil size={14} className="mr-2" /> Edit Contact Info
                                            </Button>
                                        ) : (
                                            <form onSubmit={handleUpdate} className="space-y-3">
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</label>
                                                     <input type="text" className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-900 dark:text-white transition-all"
                                                         value={updateDto.phone} onChange={e => { const v = e.target.value; setUpdateDto(prev => ({...prev, phone: v})); }} />
                                                 </div>
                                                 <div>
                                                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address</label>
                                                     <textarea rows={2} className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-900 dark:text-white transition-all resize-none"
                                                         value={updateDto.address} onChange={e => { const v = e.target.value; setUpdateDto(prev => ({...prev, address: v})); }} />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button type="submit" size="sm" className="flex-1"><Check size={14} className="mr-1" /> Save</Button>
                                                    <Button type="button" variant="ghost" size="sm" className="flex-1" onClick={() => setIsEditing(false)}><X size={14} className="mr-1" /> Cancel</Button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Admin Activity */}
                        {adminActivity && (
                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                <CardHeader>
                                    <CardTitle className="text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2 font-bold uppercase tracking-wider">
                                        <BarChart3 size={15} className="text-amber-500" /> System Overview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {[
                                        { label: 'Employees Created', value: adminActivity.totalEmployeesCreated, color: 'bg-primary-600' },
                                        { label: 'Salary Revisions', value: adminActivity.totalSalaryUpdates, color: 'bg-emerald-600' },
                                        { label: 'Departments', value: adminActivity.totalDepartmentsCreated, color: 'bg-sky-500' },
                                    ].map(item => (
                                        <div key={item.label} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">{item.label}</span>
                                            <span className={`${item.color} text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm`}>{item.value}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Work + Finance */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm flex items-center gap-2 text-slate-500 uppercase tracking-widest">
                                        <Briefcase size={14} /> Work Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {[
                                        { label: 'Department', value: workInfo?.department },
                                        { label: 'Team', value: workInfo?.team },
                                        { label: 'Joining Date', value: workInfo?.joiningDate },
                                        { label: 'Experience', value: workInfo?.yearsOfExperience != null ? `${workInfo.yearsOfExperience} Years` : null },
                                    ].map(({ label, value }) => (
                                        <div key={label}>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{value || 'N/A'}</p>
                                        </div>
                                    ))}
                                    {workInfo?.skills?.length > 0 && (
                                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">Skills</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {workInfo.skills.map((s, i) => (
                                                    <Badge key={i} variant="info" className="text-[10px] px-2">{s}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm flex items-center gap-2 text-slate-500 uppercase tracking-widest">
                                        <TrendingUp size={14} /> Financials
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center mb-4">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Current Base Pay</p>
                                        <p className="text-3xl font-black text-emerald-600">₹ {salary?.currentSalary?.toLocaleString('en-IN') || '0'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Last Revision</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                            {salary?.lastSalaryUpdatedDate ? new Date(salary.lastSalaryUpdatedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Performance Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center gap-2 text-slate-500 uppercase tracking-widest">
                                    <Star size={14} /> Performance & Engagement (Current Month)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 text-center">
                                    {[
                                        { label: 'Days Present', value: attendance?.presentDays ?? 0, color: 'text-primary-600' },
                                        { label: 'Days Absent', value: attendance?.absentDays ?? 0, color: 'text-red-500' },
                                        { label: 'Leaves Used', value: leave?.leavesTaken ?? 0, color: 'text-amber-500' },
                                    ].map(({ label, value, color }) => (
                                        <div key={label} className="py-2 px-4">
                                            <p className={`text-3xl font-black ${color}`}>{value}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{label}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Leaves */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-sm flex items-center gap-2 text-slate-500 uppercase tracking-widest">
                                    <ClipboardList size={14} /> Recent Leave Requests
                                </CardTitle>
                                <Badge variant="neutral">{leave?.leavesRemaining ?? 0} Annual Leaves Left</Badge>
                            </CardHeader>
                            <CardContent className="p-0">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800">
                                            <th className="text-left px-6 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Period</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                                            <th className="text-right px-6 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                        {leave?.recentLeaveRequests?.map(lr => (
                                            <tr key={lr.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-3">
                                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{lr.startDate}</p>
                                                    <p className="text-xs text-slate-500">to {lr.endDate}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="info" className="text-[10px]">{lr.leaveType?.replace(/_/g, ' ')}</Badge>
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <Badge variant={statusColor[lr.status] || 'neutral'} className="text-[10px]">{lr.status}</Badge>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!leave?.recentLeaveRequests?.length) && (
                                            <tr><td colSpan="3" className="text-center py-8 text-slate-400 text-sm">No recent leave history.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>

                        {/* Documents */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-sm flex items-center gap-2 text-slate-500 uppercase tracking-widest">
                                    <FileText size={14} /> Professional Documents
                                </CardTitle>
                                {!employeeId && (
                                    <>
                                        <input type="file" id="fileUpload" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                        <Button size="sm" variant="outline" onClick={() => document.getElementById('fileUpload').click()} disabled={uploading}>
                                            <Upload size={14} className="mr-2" /> {uploading ? 'Uploading…' : 'Upload'}
                                        </Button>
                                    </>
                                )}
                            </CardHeader>
                            <CardContent className="p-0">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800">
                                            <th className="text-left px-6 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">File Name</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                                            <th className="text-right px-6 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                        {documents.map(doc => (
                                            <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-200">{doc.fileName}</td>
                                                <td className="px-4 py-3"><Badge variant="neutral" className="text-[10px]">{doc.fileType}</Badge></td>
                                                <td className="px-6 py-3 text-right">
                                                    <button onClick={() => handleFileDownload(doc.id, doc.fileName)}
                                                        className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                                                        <Download size={15} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {documents.length === 0 && (
                                            <tr><td colSpan="3" className="text-center py-8 text-slate-400 text-sm">No documents uploaded yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </div>
            </div>
        </div>
    );
};

export default ProfileComponent;
