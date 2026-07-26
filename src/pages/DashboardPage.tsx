import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  Clock,
  Video,
  Award,
  Plus,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  Building,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Loader2,
  Bookmark,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { OpportunityItem, OpportunityStatus } from '../types';
import { subscribeUserOpportunities } from '../services/opportunityService';
import { getDeadlineInfo, formatDeadlineDate } from '../utils/deadlineUtils';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Subscribe to user opportunities
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
        console.warn('Dashboard opportunities fetch notice:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Calculated Metrics
  const metrics = useMemo(() => {
    const total = opportunities.length;

    // Upcoming deadlines within 7 days and not expired
    const upcomingDeadlines = opportunities.filter((item) => {
      if (!item.deadline) return false;
      const info = getDeadlineInfo(item.deadline);
      return !info.isExpired && info.diffDays <= 7;
    });

    const applied = opportunities.filter((item) => item.status === 'Applied').length;
    const interview = opportunities.filter((item) => item.status === 'Interview').length;
    const offer = opportunities.filter((item) => item.status === 'Offer').length;

    return {
      total,
      upcomingCount: upcomingDeadlines.length,
      applied,
      interview,
      offer,
      upcomingItems: upcomingDeadlines.sort((a, b) => {
        const dA = new Date(a.deadline).getTime();
        const dB = new Date(b.deadline).getTime();
        return dA - dB;
      }),
    };
  }, [opportunities]);

  // Recent 5 opportunities
  const recentOpportunities = useMemo(() => {
    return [...opportunities]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [opportunities]);

  // Status Breakdown Count
  const statusCounts = useMemo(() => {
    const counts: Record<OpportunityStatus, number> = {
      Saved: 0,
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
    };
    opportunities.forEach((item) => {
      if (counts[item.status] !== undefined) {
        counts[item.status]++;
      }
    });
    return counts;
  }, [opportunities]);

  const STATUS_BADGE_STYLE: Record<OpportunityStatus, string> = {
    Saved: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    Applied: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    Interview: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    Offer: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    Rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Page Header / Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your opportunities and stay ahead of every deadline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/opportunities?add=true"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Opportunity</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-xs font-semibold">Loading dashboard metrics from Firestore...</p>
        </div>
      ) : metrics.total === 0 ? (
        /* Professional Empty State */
        <div className="p-10 sm:p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 shadow-sm space-y-5">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/60 shadow-inner">
            <Briefcase className="w-10 h-10" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome to TrackFolio AI
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              You don't have any opportunities saved yet. Start adding your internships, scholarships, fellowships, and job applications to organize your journey!
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={() => navigate('/opportunities?add=true')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Opportunity</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Metrics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total
                </span>
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {metrics.total}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Opportunities tracked
                </p>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/60 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  Upcoming
                </span>
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {metrics.upcomingCount}
                </div>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-semibold">
                  Due within 7 days
                </p>
              </div>
            </div>

            {/* Applied */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Applied
                </span>
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {metrics.applied}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Applications sent
                </p>
              </div>
            </div>

            {/* Interview */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200/80 dark:border-purple-900/60 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                  Interview
                </span>
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/80 dark:text-purple-400">
                  <Video className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {metrics.interview}
                </div>
                <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 font-semibold">
                  In interview stage
                </p>
              </div>
            </div>

            {/* Offer */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-900/60 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Offer
                </span>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {metrics.offer}
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                  Offers received
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Recent Opportunities & Upcoming Deadlines */}
            <div className="lg:col-span-2 space-y-8">
              {/* Recent Opportunities */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Recent Opportunities
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Your latest created and updated items
                    </p>
                  </div>
                  <Link
                    to="/opportunities"
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {recentOpportunities.map((act) => {
                    const dl = getDeadlineInfo(act.deadline);
                    return (
                      <div
                        key={act.id}
                        onClick={() => navigate('/opportunities')}
                        className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-50/70 dark:hover:bg-slate-800/30 p-2.5 rounded-2xl transition-colors cursor-pointer"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {act.title}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                              {act.type}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                              <Building className="w-3.5 h-3.5 text-slate-400" />
                              {act.organization}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Deadline: {formatDeadlineDate(act.deadline)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              STATUS_BADGE_STYLE[act.status] || STATUS_BADGE_STYLE.Saved
                            }`}
                          >
                            {act.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upcoming Deadlines Section */}
              {metrics.upcomingItems.length > 0 && (
                <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-3xl p-6 border border-amber-200/80 dark:border-amber-900/40 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
                      Action Required: Deadlines Due Soon
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {metrics.upcomingItems.slice(0, 4).map((item) => {
                      const dl = getDeadlineInfo(item.deadline);
                      return (
                        <div
                          key={item.id}
                          onClick={() => navigate('/opportunities')}
                          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200/60 dark:border-amber-900/40 hover:border-amber-400 dark:hover:border-amber-700 transition-all cursor-pointer space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                              {item.organization}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${dl.badgeClass}`}>
                              {dl.label}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {item.title}
                          </h4>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Status Summary */}
            <div className="space-y-6">
              {/* Status Summary Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Status Summary</span>
                </h3>

                <div className="space-y-2.5">
                  {[
                    { key: 'Saved', label: 'Saved', icon: Bookmark, color: 'text-slate-600 dark:text-slate-400' },
                    { key: 'Applied', label: 'Applied', icon: CheckCircle2, color: 'text-blue-600 dark:text-blue-400' },
                    { key: 'Interview', label: 'Interview', icon: Video, color: 'text-amber-600 dark:text-amber-400' },
                    { key: 'Offer', label: 'Offer', icon: Award, color: 'text-emerald-600 dark:text-emerald-400' },
                    { key: 'Rejected', label: 'Rejected', icon: XCircle, color: 'text-rose-600 dark:text-rose-400' },
                  ].map((s) => {
                    const count = statusCounts[s.key as OpportunityStatus] || 0;
                    const percent = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;
                    const Icon = s.icon;

                    return (
                      <div key={s.key} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                            <span>{s.label}</span>
                          </span>
                          <span className="text-slate-900 dark:text-white font-extrabold">
                            {count} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              s.key === 'Saved'
                                ? 'bg-slate-400'
                                : s.key === 'Applied'
                                ? 'bg-blue-600'
                                : s.key === 'Interview'
                                ? 'bg-amber-500'
                                : s.key === 'Offer'
                                ? 'bg-emerald-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick AI Preview Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white shadow-md relative overflow-hidden space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>AI Assistant Ready</span>
                </div>
                <h3 className="text-base font-extrabold tracking-tight">
                  Match Your Resume to Opportunities
                </h3>
                <p className="text-xs text-blue-200/90 leading-relaxed">
                  Analyze application requirements against your uploaded resume with Google Gemini.
                </p>
                <Link
                  to="/ai-analysis"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md"
                >
                  <span>Explore AI Analysis</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
