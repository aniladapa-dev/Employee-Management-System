import React from 'react';
import { twMerge } from 'tailwind-merge';

export function Table({ children, className, ...props }) {
  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <table className={twMerge("w-full text-left border-collapse", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function THead({ children, className, ...props }) {
  return (
    <thead className={twMerge("bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10", className)} {...props}>
      {children}
    </thead>
  );
}

export function TBody({ children, className, ...props }) {
  return (
    <tbody className={twMerge("divide-y divide-slate-100 dark:divide-slate-800", className)} {...props}>
      {children}
    </tbody>
  );
}

export function TR({ children, className, ...props }) {
  return (
    <tr className={twMerge("group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors", className)} {...props}>
      {children}
    </tr>
  );
}

export function TH({ children, className, ...props }) {
  return (
    <th className={twMerge("px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider", className)} {...props}>
      {children}
    </th>
  );
}

export function TD({ children, className, ...props }) {
  return (
    <td className={twMerge("px-6 py-4 text-sm text-slate-600 dark:text-slate-300", className)} {...props}>
      {children}
    </td>
  );
}
