import React, { useState } from 'react';
import {
  X,
  Building,
  Briefcase,
  Calendar,
  MapPin,
  ExternalLink,
  Edit2,
  Trash2,
  Clock,
  FileText,
  CheckCircle2,
  Loader2,
  Tag,
} from 'lucide-react';
import { OpportunityItem, OpportunityStatus } from '../../types';
import { getDeadlineInfo, formatDeadlineDate } from '../../utils/deadlineUtils';

interface OpportunityDetailModalProps {
  isOpen: boolean;
  opportunity: OpportunityItem | null;
  onClose: () => void;
  onEdit: (item: OpportunityItem) => void;
  onDelete: (item: OpportunityItem) => void;
  onUpdateStatus: (id: string, newStatus: OpportunityStatus) => Promise<void>;
  onUpdateNotes: (id: string, newNotes: string) => Promise<void>;
}

const ALL_STATUSES: OpportunityStatus[] = [
  'Saved',
  'Applied',
  'Interview',
  'Offer',
  'Rejected',
];

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  isOpen,
  opportunity,
  onClose,
  onEdit,
  onDelete,
  onUpdateStatus,
  onUpdateNotes,
}) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [notesText, setNotesText] = useState(opportunity?.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  React.useEffect(() => {
    if (opportunity) {
      setNotesText(opportunity.notes || '');
      setIsEditingNotes(false);
    }
  }, [opportunity]);

  if (!isOpen || !opportunity) return null;

  const deadlineInfo = getDeadlineInfo(opportunity.deadline);

  const handleStatusChange = async (newStatus: OpportunityStatus) => {
    if (newStatus === opportunity.status) return;
    setIsUpdatingStatus(true);
    try {
      await onUpdateStatus(opportunity.id, newStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await onUpdateNotes(opportunity.id, notesText);
      setIsEditingNotes(false);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const appLink = opportunity.applicationLink || opportunity.url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {opportunity.type}
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${deadlineInfo.badgeClass}`}>
                {deadlineInfo.label}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight pt-1">
              {opportunity.title}
            </h2>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <Building className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{opportunity.organization}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onEdit(opportunity)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Edit Opportunity"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(opportunity)}
              className="p-2 rounded-xl border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 transition-colors"
              title="Delete Opportunity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Status Bar */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Application Status
            </label>
            <div className="grid grid-cols-5 gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              {ALL_STATUSES.map((st) => {
                const isActive = opportunity.status === st;
                return (
                  <button
                    key={st}
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusChange(st)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center truncate ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700/80'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Deadline
              </span>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>{formatDeadlineDate(opportunity.deadline)}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Location
              </span>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>{opportunity.location || 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* Application Link Button */}
          {appLink && (
            <div>
              <a
                href={appLink.startsWith('http') ? appLink : `https://${appLink}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Application Portal</span>
              </a>
            </div>
          )}

          {/* Notes Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Notes & Track Record</span>
              </label>
              {!isEditingNotes && (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Edit Notes
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-medium"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setNotesText(opportunity.notes || '');
                      setIsEditingNotes(false);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isSavingNotes}
                    onClick={handleSaveNotes}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center gap-1"
                  >
                    {isSavingNotes && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Notes</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed min-h-[80px]">
                {opportunity.notes ? (
                  <p className="whitespace-pre-wrap">{opportunity.notes}</p>
                ) : (
                  <span className="text-slate-400 italic">No notes added yet. Click 'Edit Notes' to add interview tips or reminders.</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs text-slate-400">
          <span>Created {new Date(opportunity.createdAt).toLocaleDateString()}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
