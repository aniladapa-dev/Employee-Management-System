import { useState } from "react";
import Swal from "sweetalert2";
import { changePassword } from "../services/auth/AuthService";
import { X, KeyRound, Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/Button";

const ChangePasswordModal = ({ onClose }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      Swal.fire({ icon: "error", title: "Mismatch", text: "New passwords do not match!", timer: 2000, showConfirmButton: false });
      return;
    }
    if (newPassword.length < 6) {
      Swal.fire({ icon: "warning", title: "Too Short", text: "New password must be at least 6 characters.", timer: 2000, showConfirmButton: false });
      return;
    }

    setLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      Swal.fire({ icon: "success", title: "Password Changed!", text: "Your password has been updated successfully.", timer: 2000, showConfirmButton: false });
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to change password. Please check your old password.";
      Swal.fire({ icon: "error", title: "Error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 text-slate-900 dark:text-white transition-all";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
              <KeyRound size={20} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Change Password</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Update your account security</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          
          <div>
            <label className={labelClass}>Current Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showOld ? "text" : "password"}
                className={inputClass}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                placeholder="Enter current password"
              />
              <button 
                type="button" 
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                onClick={() => setShowOld(!showOld)}
              >
                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className={labelClass}>New Password</label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showNew ? "text" : "password"}
                className={inputClass}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="At least 6 characters"
              />
              <button 
                type="button" 
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className={labelClass}>Confirm New Password</label>
            <div className="relative">
              <CheckCircle2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                className={inputClass.replace('pr-10 ', '')} // No eye icon on confirm
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter new password"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex gap-3">
            <Button type="button" variant="outline" className="flex-1 justify-center" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 justify-center" disabled={loading}>
              {loading ? "Saving..." : "Update Password"}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ChangePasswordModal;
