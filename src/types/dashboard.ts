export interface DashboardMetrics {
  totalStudents: number;
  totalAssignments: number;
  averageScore: number;
  completionRate: number;
  recentActivity: Activity[];
  assignmentStats: AssignmentStat[];
  scoreDistribution: ScoreDistribution[];
}

export interface Activity {
  id: number;
  studentName: string;
  action: 'completed' | 'submitted' | 'graded' | 'started';
  assignment: string;
  timestamp: string;
  score: number | null;
  course?: string;
}

export interface AssignmentStat {
  type: 'quiz' | 'assignment' | 'exam' | 'lab';
  count: number;
  averageScore: number;
  completionRate: number;
}

export interface ScoreDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface FilterOptions {
  dateRange?: { from: Date; to: Date };
  course?: string;
  assignmentType?: string;
  scoreRange?: { min: number; max: number };
}

export interface DashboardSettings {
  refreshInterval: number;
  showRealTimeUpdates: boolean;
  defaultDateRange: '7d' | '30d' | '90d' | 'custom';
  chartPreferences: {
    showLabels: boolean;
    showLegend: boolean;
    colorScheme: 'default' | 'monochrome' | 'high-contrast';
  };
}
