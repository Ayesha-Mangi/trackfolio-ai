/**
 * Calculate days remaining until deadline and returns appropriate status badge styling
 */
export interface DeadlineBadgeInfo {
  label: string;
  diffDays: number;
  isExpired: boolean;
  badgeClass: string;
  dotClass: string;
}

export const getDeadlineInfo = (deadlineStr: string): DeadlineBadgeInfo => {
  if (!deadlineStr) {
    return {
      label: 'No deadline',
      diffDays: 999,
      isExpired: false,
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
      dotClass: 'bg-slate-400',
    };
  }

  const deadlineDate = new Date(deadlineStr);
  if (isNaN(deadlineDate.getTime())) {
    return {
      label: 'Invalid date',
      diffDays: 999,
      isExpired: false,
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
      dotClass: 'bg-slate-400',
    };
  }
  
  const now = new Date();
  
  // Set both to midnight for exact day diff
  const dDate = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffMs = dDate.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: 'Expired',
      diffDays,
      isExpired: true,
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700',
      dotClass: 'bg-slate-400',
    };
  }

  if (diffDays === 0) {
    return {
      label: 'Today',
      diffDays,
      isExpired: false,
      badgeClass: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900/60 font-semibold',
      dotClass: 'bg-red-500 animate-pulse',
    };
  }

  if (diffDays <= 2) {
    return {
      label: `${diffDays} ${diffDays === 1 ? 'day' : 'days'} left`,
      diffDays,
      isExpired: false,
      badgeClass: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900/60 font-semibold',
      dotClass: 'bg-red-500 animate-pulse',
    };
  }

  if (diffDays <= 7) {
    return {
      label: `${diffDays} days left`,
      diffDays,
      isExpired: false,
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/60 font-semibold',
      dotClass: 'bg-amber-500',
    };
  }

  return {
    label: `${diffDays} days left`,
    diffDays,
    isExpired: false,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/60 font-medium',
    dotClass: 'bg-emerald-500',
  };
};

export const formatDeadlineDate = (deadlineStr: string): string => {
  if (!deadlineStr) return 'N/A';
  try {
    const d = new Date(deadlineStr);
    if (isNaN(d.getTime())) return deadlineStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (e) {
    return deadlineStr;
  }
};
