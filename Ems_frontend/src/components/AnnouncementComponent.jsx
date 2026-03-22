import React, { useEffect, useState } from 'react';
import { listAnnouncements, createAnnouncement } from '../services/AnnouncementService';
import { isAdminUser } from '../services/auth/AuthService';
import Swal from 'sweetalert2';
import { Megaphone, PlusCircle, X, User, Calendar } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';

const AnnouncementComponent = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [isAdmin] = useState(isAdminUser());
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { fetchAnnouncements(); }, []);

    const fetchAnnouncements = () => {
        listAnnouncements().then(res => setAnnouncements(res.data || [])).catch(console.error);
    };

    const saveAnnouncement = (e) => {
        e.preventDefault();
        setSubmitting(true);
        createAnnouncement({ title, message })
            .then(() => {
                Swal.fire({ icon: 'success', title: 'Announcement posted!', showConfirmButton: false, timer: 1800 });
                setTitle(''); setMessage(''); setShowForm(false);
                fetchAnnouncements();
            })
            .catch(err => Swal.fire('Error', err.response?.data?.message || 'Failed to post', 'error'))
            .finally(() => setSubmitting(false));
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

    const inputClass = "mt-1 w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-900 dark:text-white transition-all";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                    <Megaphone size={22} className="text-primary-600" /> Company Announcements
                </h1>
                {isAdmin && (
                    <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'ghost' : 'primary'} size="sm">
                        {showForm ? <><X size={14} className="mr-1.5" /> Cancel</> : <><PlusCircle size={14} className="mr-1.5" /> New Announcement</>}
                    </Button>
                )}
            </div>

            {/* Create Form */}
            {showForm && (
                <Card className="border-primary-200 dark:border-primary-800 bg-primary-50/30 dark:bg-primary-900/10 animate-fade-in">
                    <CardContent className="pt-4">
                        <form onSubmit={saveAnnouncement} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Title *</label>
                                <input type="text" placeholder="Announcement title..." className={inputClass} value={title} onChange={e => setTitle(e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message *</label>
                                <textarea rows={4} placeholder="Write your announcement..." className={`${inputClass} resize-none`} value={message} onChange={e => setMessage(e.target.value)} required />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={submitting} className="gap-2">
                                    <Megaphone size={14} /> {submitting ? 'Posting…' : 'Post Announcement'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Feed */}
            {announcements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Megaphone size={48} className="mb-4 opacity-20" />
                    <h3 className="font-bold text-slate-500 dark:text-slate-400">No announcements yet</h3>
                    <p className="text-sm">{isAdmin ? 'Click "New Announcement" to post one.' : 'Check back later.'}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements.map((ann, idx) => (
                        <Card key={ann.id} className={`border-l-4 ${idx === 0 ? 'border-l-primary-600' : 'border-l-slate-200 dark:border-l-slate-700'}`}>
                            <CardContent className="py-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            {idx === 0 && <span className="text-[10px] font-black bg-primary-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Latest</span>}
                                            <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">{ann.title}</h3>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">{ann.message}</p>
                                        <div className="flex items-center gap-4 text-xs text-slate-400">
                                            <span className="flex items-center gap-1.5"><User size={12} /> {ann.createdBy || 'Admin'}</span>
                                            <span className="flex items-center gap-1.5"><Calendar size={12} /> {formatDate(ann.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AnnouncementComponent;
