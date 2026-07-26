import React from 'react';
import {
  Building,
  Calendar,
  MapPin,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
} from 'lucide-react';
import { OpportunityItem, OpportunityStatus } from '../../types';
import { getDeadlineInfo, formatDeadlineDate } from '../../utils/deadlineUtils';

interface OpportunityTableProps {
  items: OpportunityItem[];
  onClick: (item: OpportunityItem) => void;
  onEdit: (item: OpportunityItem) => void;
  onDelete: (item: OpportunityItem) => void;
  onStatusChange: (item: OpportunityItem, newStatus: OpportunityStatus) => void;
}

const STATUS_COLOR_MAP: Record<OpportunityStatus, string> = {
  Saved: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  Applied: 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-900',
  Interview: 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-900',
  Offer: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
  Rejected: 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-900',
};

export const OpportunityTable: React.FC<OpportunityTableProps> = ({
  items,
  onClick,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 backdrop-blur-sm">
            <th className="py-3.5 px-4">Organization</th>
            <th className="py-3.5 px-4">Opportunity Title</th>
            <th className="py-3.5 px-4">Type</th>
            <th className="py-3.5 px-4">Deadline</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4">Location</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
          {items.map((item) => {
            const deadlineInfo = getDeadlineInfo(item.deadline);
            const appLink = item.applicationLink || item.url;

            return (
              <tr
                key={item.id}
                onClick={() => onClick(item)}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
              >
                {/* Organization */}
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{item.organization}</span>
                  </div>
                </td>

                {/* Title */}
                <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200 max-w-[220px] truncate">
                  <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </span>
                </td>

                {/* Type */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
                    {item.type}
                  </span>
                </td>

                {/* Deadline */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] ${deadlineInfo.badgeClass}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${deadlineInfo.dotClass}`} />
                    <span>{formatDeadlineDate(item.deadline)}</span>
                  </span>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={item.status}
                    onChange={(e) => onStatusChange(item, e.target.value as OpportunityStatus)}
                    className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none transition-all ${
                      STATUS_COLOR_MAP[item.status] || STATUS_COLOR_MAP.Saved
                    }`}
                  >
                    <option value="Saved">Saved</option>
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>

                {/* Location */}
                <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-[150px] truncate">
                  {item.location || '—'}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    {appLink && (
                      <a
                        href={appLink.startsWith('http') ? appLink : `https://${appLink}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                        title="Open Application Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => onClick(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEdit(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
