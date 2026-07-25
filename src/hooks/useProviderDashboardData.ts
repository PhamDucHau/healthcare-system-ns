import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchClinicalTasks } from "@/lib/ai-assistant-api";
import { fetchDoctorAppointments } from "@/lib/doctor-appointment-api";
import { getMyDoctorProfile } from "@/lib/doctor-profile-api";
import { fetchRecentPatientRecords, searchPatientRecords } from "@/lib/patient-records";
import {
  deriveClinicalTaskItems,
  deriveTodaySchedule,
  deriveTodayStats,
  deriveWeeklyChart,
  formatDoctorDisplayName,
  getWeekRange,
  mapPatientRecordToDashboard,
  type DashboardClinicalTaskItem,
  type DashboardMonitoringStats,
  type DashboardRecentPatient,
  type DashboardScheduleItem,
  type DashboardTodayStats,
  type DashboardWeekChartPoint,
} from "@/lib/provider-dashboard-utils";
import { supabase } from "@/lib/supabase";
import type { AdminAppointment } from "@/types/admin-appointment";
import type { ClinicalTask } from "@/lib/ai-assistant-api";

export type ProviderDashboardData = {
  doctorName: string;
  todayStats: DashboardTodayStats;
  monitoringStats: DashboardMonitoringStats;
  todaySchedule: DashboardScheduleItem[];
  weeklyChart: DashboardWeekChartPoint[];
  clinicalTasks: DashboardClinicalTaskItem[];
};

const EMPTY_MONITORING: DashboardMonitoringStats = { total: 0, newThisWeek: 0 };

function settled<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === "fulfilled" ? result.value : fallback;
}

/** 5 bệnh nhân cập nhật gần nhất — query độc lập, không phụ thuộc lịch hẹn / clinical tasks. */
export function useProviderDashboardRecentPatients() {
  return useQuery({
    queryKey: ["provider-dashboard-recent-patients"],
    queryFn: async (): Promise<{
      recentPatients: DashboardRecentPatient[];
      monitoringStats: DashboardMonitoringStats;
    }> => {
      const { dateFrom, dateTo } = getWeekRange(new Date());

      const recentResult = await fetchRecentPatientRecords(supabase, 5);

      if (recentResult.error) {
        throw recentResult.error;
      }

      let monitoringStats: DashboardMonitoringStats = {
        total: recentResult.total,
        newThisWeek: 0,
      };

      const [submittedResult, weekNewResult] = await Promise.all([
        searchPatientRecords(supabase, {
          page: 1,
          limit: 1,
          status: "submitted",
        }),
        searchPatientRecords(supabase, {
          page: 1,
          limit: 1,
          status: "submitted",
          dateFrom,
          dateTo,
        }),
      ]);

      if (!submittedResult.error) {
        monitoringStats = { ...monitoringStats, total: submittedResult.total };
      }
      if (!weekNewResult.error) {
        monitoringStats = { ...monitoringStats, newThisWeek: weekNewResult.total };
      }

      return {
        recentPatients: recentResult.rows.map(mapPatientRecordToDashboard),
        monitoringStats,
      };
    },
  });
}

async function loadProviderDashboard(anchor: Date): Promise<ProviderDashboardData> {
  const { today, dateFrom, dateTo } = getWeekRange(anchor);

  const [profileResult, todayApptsResult, weekApptsResult, tasksResult] =
    await Promise.allSettled([
      getMyDoctorProfile(),
      fetchDoctorAppointments({ date: today }),
      fetchDoctorAppointments({ dateFrom, dateTo }),
      fetchClinicalTasks("doctor"),
    ]);

  const profile = settled(profileResult, null);
  const todayAppts = settled(todayApptsResult, [] as AdminAppointment[]);
  const weekAppts = settled(weekApptsResult, [] as AdminAppointment[]);
  const tasks = settled(tasksResult, [] as ClinicalTask[]);

  return {
    doctorName: formatDoctorDisplayName(profile?.full_name),
    todayStats: deriveTodayStats(todayAppts),
    monitoringStats: EMPTY_MONITORING,
    todaySchedule: deriveTodaySchedule(todayAppts),
    weeklyChart: deriveWeeklyChart(weekAppts, anchor),
    clinicalTasks: deriveClinicalTaskItems(tasks, 4, anchor),
  };
}

export function useProviderDashboardData(anchor: Date = new Date()) {
  const { dateFrom, dateTo, today } = useMemo(() => getWeekRange(anchor), [anchor]);

  return useQuery({
    queryKey: ["provider-dashboard", today, dateFrom, dateTo],
    queryFn: () => loadProviderDashboard(anchor),
  });
}
