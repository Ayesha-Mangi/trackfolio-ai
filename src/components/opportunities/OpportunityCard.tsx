import React from 'react';
import {
  Building,
  Calendar,
  MapPin,
  ExternalLink,
  MoreVertical,
  Edit2,
  Trash2,
  Clock,
  Eye,
} from 'lucide-react';
import { OpportunityItem, OpportunityStatus } from '../../types';
import { getDeadlineInfo, formatDeadlineDate } from '../../utils/deadlineUtils';

interface OpportunityCardProps {
  item: OpportunityItem;
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

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  item,
  onClick,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const deadlineInfo = getDeadlineInfo(item.deadline);
  const appLink = item.applicationLink || item.url;

  return (
    <div
      onClick={() => onClick(item)}
      className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-800 transition-all cursor-pointer flex flex-col justify-between space-y-4"
    >
      <div className="space-y-3">
        {/* Top bar: Type + Status */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
            {item.type}
          </span>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
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
          </div>
        </div>

        {/* Title & Organization */}
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
            {item.title}
          </h3>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{item.organization}</span>
          </div>
        </div>

        {/* Details Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Deadline badge */}
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] ${deadlineInfo.badgeClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${deadlineInfo.dotClass}`} />
            <span>Deadline: {formatDeadlineDate(item.deadline)} ({deadlineInfo.label})</span>
          </span>

          {item.location && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 text-[11px] font-medium">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[120px]">{item.location}</span>
            </span>
          )}
        </div>

        {item.notes && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 font-normal">
            {item.notes}
          </p>
        )}
      </div>

      {/* Footer Actions */}
      <div
        className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onClick(item)}
          className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-semibold flex items-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Details</span>
        </button>

        <div className="flex items-center gap-2">
          {appLink && (
            <a
              href={appLink.startsWith('http') ? appLink : `https://${appLink}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold text-[11px]"
            >
              <span>Apply</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

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
      </div>
    </div>
  );
};
