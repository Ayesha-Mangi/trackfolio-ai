import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  Table as TableIcon,
  Sparkles,
  ArrowUpDown,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { OpportunityItem, OpportunityStatus, OpportunityType } from '../types';
import {
  subscribeUserOpportunities,
  addOpportunity,
  updateOpportunity,
  deleteOpportunity,
} from '../services/opportunityService';
import { OpportunityCard } from '../components/opportunities/OpportunityCard';
import { OpportunityTable } from '../components/opportunities/OpportunityTable';
import { OpportunityModal } from '../components/opportunities/OpportunityModal';
import { OpportunityDetailModal } from '../components/opportunities/OpportunityDetailModal';
import { DeleteConfirmModal } from '../components/opportunities/DeleteConfirmModal';
import { Toast, ToastMessage } from '../components/common/Toast';
import { useSearchParams } from 'react-router-dom';

const TYPE_OPTIONS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Types' },
  { id: 'Internship', label: 'Internships' },
  { id: 'Scholarship', label: 'Scholarships' },
  { id: 'Fellowship', label: 'Fellowships' },
  { id: 'Hackathon', label: 'Hackathons' },
  { id: 'Competition', label: 'Competitions' },
  { id: 'Graduate Program', label: 'Grad Programs' },
  { id: 'Job', label: 'Jobs' },
];

const STATUS_OPTIONS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Statuses' },
  { id: 'Saved', label: 'Saved' },
  { id: 'Applied', label: 'Applied' },
  { id: 'Interview', label: 'Interview' },
  { id: 'Offer', label: 'Offer' },
  { id: 'Rejected', label: 'Rejected' },
];

type SortOption = 'deadline' | 'newest' | 'oldest' | 'organization';

export const OpportunitiesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  // Search & Filters & Sorting
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Modals & Toast State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<OpportunityItem | null>(null);
  const [viewingItem, setViewingItem] = useState<OpportunityItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<OpportunityItem | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Auto open add modal if query param ?add=true exists
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setIsAddModalOpen(true);
      searchParams.delete('add');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  // Subscribe to Firestore for authenticated user
  useEffect(() => {
    if (!user) {
      setOpportunities([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeUserOpportunities(
      user.uid,
      (items) => {
        setOpportunities(items);
        setLoading(false);
      },
      (err) => {
        console.error('Subscription error:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Filter & Search & Sort calculation
  const filteredItems = useMemo(() => {
    return opportunities
      .filter((item) => {
        // Search by Organization or Title
        const matchesSearch =
          !searchQuery.trim() ||
          item.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          item.organization.toLowerCase().includes(searchQuery.toLowerCase().trim());

        // Type filter
        const matchesType = selectedType === 'all' || item.type === selectedType;

        // Status filter
        const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'deadline') {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'organization') {
          return a.organization.localeCompare(b.organization);
        }
        return 0;
      });
  }, [opportunities, searchQuery, selectedType, selectedStatus, sortBy]);

  // Handlers for CRUD
  const handleSaveOpportunity = async (data: {
    organization: string;
    title: string;
    type: OpportunityType;
    deadline: string;
    location?: string;
    applicationLink?: string;
    status: OpportunityStatus;
    notes?: string;
  }) => {
    if (!user) return;

    if (editingItem) {
      // Update existing
      await updateOpportunity(user.uid, editingItem.id, data);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: `Updated "${data.title}" successfully!`,
      });
      setEditingItem(null);
    } else {
      // Add new
      await addOpportunity(user.uid, data);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: `Added "${data.title}" to your opportunities!`,
      });
    }
  };

  const handleUpdateStatus = async (item: OpportunityItem, newStatus: OpportunityStatus) => {
    if (!user) return;
    await updateOpportunity(user.uid, item.id, { status: newStatus });
    setToast({
      id: Date.now().toString(),
      type: 'success',
      message: `Status updated to "${newStatus}" for ${item.title}`,
    });
    if (viewingItem && viewingItem.id === item.id) {
      setViewingItem({ ...viewingItem, status: newStatus });
    }
  };

  const handleUpdateNotes = async (id: string, newNotes: string) => {
    if (!user) return;
    await updateOpportunity(user.uid, id, { notes: newNotes });
    setToast({
      id: Date.now().toString(),
      type: 'success',
      message: 'Notes updated successfully!',
    });
    if (viewingItem && viewingItem.id === id) {
      setViewingItem({ ...viewingItem, notes: newNotes });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!user || !deletingItem) return;
    await deleteOpportunity(user.uid, deletingItem.id);
    setToast({
      id: Date.now().toString(),
      type: 'success',
      message: `Deleted "${deletingItem.title}"`,
    });
    if (viewingItem?.id === deletingItem.id) {
      setViewingItem(null);
    }
    setDeletingItem(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <span>Opportunities</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track and manage internships, scholarships, fellowships, hackathons, and jobs
          </p>
        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Opportunity</span>
        </button>
      </div>

      {/* Search Bar + View Toggle */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by organization name or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-xs sm:text-sm shadow-2xs font-medium"
          />
        </div>

        {/* Sorting + View Toggle */}
        <div className="flex items-center gap-2">
          {/* Sorting Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent focus:outline-none cursor-pointer font-bold"
            >
              <option value="newest">Sort: Newest</option>
              <option value="deadline">Sort: Deadline</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="organization">Sort: Organization</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                viewMode === 'card'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="space-y-2">
        {/* Type Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Type:
          </span>
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedType(opt.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedType === opt.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Status:
          </span>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedStatus(opt.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStatus === opt.id
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-xs font-semibold">Loading your opportunities from Firestore...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => (
              <OpportunityCard
                key={item.id}
                item={item}
                onClick={(i) => setViewingItem(i)}
                onEdit={(i) => {
                  setEditingItem(i);
                  setIsAddModalOpen(true);
                }}
                onDelete={(i) => setDeletingItem(i)}
                onStatusChange={(i, s) => handleUpdateStatus(i, s)}
              />
            ))}
          </div>
        ) : (
          <OpportunityTable
            items={filteredItems}
            onClick={(i) => setViewingItem(i)}
            onEdit={(i) => {
              setEditingItem(i);
              setIsAddModalOpen(true);
            }}
            onDelete={(i) => setDeletingItem(i)}
            onStatusChange={(i, s) => handleUpdateStatus(i, s)}
          />
        )
      ) : (
        /* Professional Empty State */
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 shadow-2xs space-y-4 my-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {opportunities.length === 0
                ? 'No opportunities yet.'
                : 'No matching opportunities'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {opportunities.length === 0
                ? 'Start tracking your internships, scholarships, hackathons, and job applications in one central dashboard.'
                : 'Try adjusting your search terms or filters to find what you are looking for.'}
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            {opportunities.length === 0 ? (
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsAddModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Opportunity</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setSelectedStatus('all');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <OpportunityModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveOpportunity}
        initialData={editingItem}
        mode={editingItem ? 'edit' : 'add'}
      />

      <OpportunityDetailModal
        isOpen={!!viewingItem}
        opportunity={viewingItem}
        onClose={() => setViewingItem(null)}
        onEdit={(i) => {
          setViewingItem(null);
          setEditingItem(i);
          setIsAddModalOpen(true);
        }}
        onDelete={(i) => setDeletingItem(i)}
        onUpdateStatus={(id, s) => {
          const found = opportunities.find((o) => o.id === id);
          if (found) handleUpdateStatus(found, s);
          return Promise.resolve();
        }}
        onUpdateNotes={handleUpdateNotes}
      />

      <DeleteConfirmModal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        title={deletingItem?.title || ''}
        organization={deletingItem?.organization || ''}
      />
    </div>
  );
};
