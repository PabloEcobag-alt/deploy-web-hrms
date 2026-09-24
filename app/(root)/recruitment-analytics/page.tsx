"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/services";
import { SummaryCards } from "@/components/analytics/SummaryCards";
import { ScoreDistributionChart } from "@/components/analytics/ScoreDistributionChart";
import { TopCandidatesTable } from "@/components/analytics/TopCandidatesTable";
import { PositionFitTable } from "@/components/analytics/PositionFitTable";
import { ApplicationTrendsChart } from "@/components/analytics/ApplicationTrendsChart";
import { DateRangePicker } from "@/components/analytics/DateRangePicker";
import { CSVExportButton } from "@/components/analytics/CSVExportButton";
import {
  getDashboardSummary,
  getScoreDistribution,
  getTopCandidates,
  getPositionFit,
  getApplicationTrends,
} from "@/lib/services/analyticsService";
import {
  DashboardSummary,
  ScoreDistribution,
  TopCandidate,
  PositionFit,
  ApplicationTrend,
} from "@/lib/types/analytics";
import {
  MOCK_ANALYTICS_SUMMARY,
  MOCK_SCORE_DISTRIBUTION,
  MOCK_TOP_CANDIDATES,
  MOCK_POSITION_FIT,
  MOCK_APPLICATION_TRENDS,
} from "@/lib/types/analyticsMockData";

export default function RecruitmentAnalyticsPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [distribution, setDistribution] = useState<ScoreDistribution | null>(null);
  const [topCandidates, setTopCandidates] = useState<TopCandidate[] | null>(null);
  const [positionFit, setPositionFit] = useState<PositionFit[] | null>(null);
  const [trends, setTrends] = useState<ApplicationTrend[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();

  const handleDateChange = (newStartDate: string | undefined, newEndDate: string | undefined) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const fetchAll = useCallback(async () => {
    try {
      const [s, d, t, p, tr] = await Promise.all([
        getDashboardSummary(startDate, endDate),
        getScoreDistribution(startDate, endDate),
        getTopCandidates(10, startDate, endDate),
        getPositionFit(startDate, endDate),
        getApplicationTrends(startDate, endDate),
      ]);

      setSummary(s ?? {
        totalApplicants: 0, totalScored: 0, qualifiedCount: 0, reviewCount: 0,
        notQualifiedCount: 0, qualifiedRate: 0, reviewRate: 0, notQualifiedRate: 0,
        averageMatchScore: 0, lastScoredAt: null
      });
      setDistribution(d ?? { buckets: [] });
      setTopCandidates(t ?? []);
      setPositionFit(p ?? []);
      setTrends(tr ?? []);
    } catch (error) {
      console.error("Failed to load recruitment analytics:", error);
      // Keep empty states on error
      setSummary({
        totalApplicants: 0, totalScored: 0, qualifiedCount: 0, reviewCount: 0,
        notQualifiedCount: 0, qualifiedRate: 0, reviewRate: 0, notQualifiedRate: 0,
        averageMatchScore: 0, lastScoredAt: null
      });
      setDistribution({ buckets: [] });
      setTopCandidates([]);
      setPositionFit([]);
      setTrends([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!mounted) return;
      await fetchAll();
    };

    fetchData();

    // Set up 10-second polling
    const interval = setInterval(async () => {
      if (mounted) {
        await fetchAll();
      }
    }, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [fetchAll]);

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Recruitment Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered candidate screening, match scores, and position fit.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker onDateChange={handleDateChange} />
          <CSVExportButton startDate={startDate} endDate={endDate} />
        </div>
      </div>

      <SummaryCards data={summary} isLoading={loading} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ScoreDistributionChart data={distribution} isLoading={loading} />
        <TopCandidatesTable data={topCandidates} isLoading={loading} />
      </div>

      <ApplicationTrendsChart data={trends} isLoading={loading} startDate={startDate} endDate={endDate} />

      <PositionFitTable data={positionFit} isLoading={loading} />
    </div>
  );
}
