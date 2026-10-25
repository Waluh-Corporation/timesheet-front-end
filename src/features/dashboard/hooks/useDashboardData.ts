"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  downloadTimesheet,
  requestTimesheetGeneration,
} from "../services/dashboardService";
import {
  useDashboardActivitiesQuery,
  useBeritaAcaraStatusQuery,
  useTimesheetStatusQuery,
  DASHBOARD_QUERY_KEYS,
} from "../useDashboardQueries";
import {
  usePendingWitnessRequestsQuery,
  WITNESS_REQUESTS_KEY,
} from "@/services/queries/useWitnessQueries";
import { useHolidaysQuery } from "@/services/queries/useMasterDataQueries";
import {
  submitBeritaAcara,
  revokeBeritaAcara,
} from "@/services/beritaAcaraService";
import {
  signTimesheet,
  revokeTimesheet,
} from "@/services/timesheetService";
import { useToast } from "@/components/Toast";
import type { DailyActivity } from "@/lib/types";
import {
  enablePush,
  disablePush,
  pushSupported,
  registerServiceWorker,
  isPushSubscribed,
  sendTestPush,
} from "@/lib/push";
import { registerPasskey, passkeysSupported } from "@/lib/webauthn";
import { useAuth } from "@/lib/auth";

export function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export function useDashboardData() {
  const { user } = useAuth();
  const { notify } = useToast();
  const queryClient = useQueryClient();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const isWitnessEligible = Boolean(user && user.role !== "admin");

  // TanStack Queries (Cached with 1m staleTime & deduplicated across components)
  const {
    data: dashboardActs,
    isLoading: loadingActs,
  } = useDashboardActivitiesQuery(year, month);

  const {
    data: holsData,
  } = useHolidaysQuery(year, month);

  const {
    data: beritaAcaraStatus = null,
    isLoading: loadingBA,
  } = useBeritaAcaraStatusQuery(year, month);

  const {
    data: timesheetStatus = null,
    isLoading: loadingTS,
  } = useTimesheetStatusQuery(year, month);

  const {
    data: witnessRequests = [],
  } = usePendingWitnessRequestsQuery({
    enabled: isWitnessEligible,
  });

  const activities = useMemo(() => dashboardActs?.activities || [], [dashboardActs?.activities]);
  const monthlyWitness = dashboardActs?.monthlyWitness;

  const holidays = useMemo(() => {
    const hmap: Record<number, string> = {};
    (holsData || []).forEach((h) => {
      const d = Number.parseInt(h.date.split("-")[2], 10);
      if (!Number.isNaN(d)) hmap[d] = h.description;
    });
    return hmap;
  }, [holsData]);

  const loading = loadingActs || loadingBA || loadingTS;

  const [generating, setGenerating] = useState(false);
  const [submittingBA, setSubmittingBA] = useState(false);
  const [revokingBA, setRevokingBA] = useState(false);
  const [signingTimesheet, setSigningTimesheet] = useState(false);
  const [revokingTimesheet, setRevokingTimesheet] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushOn, setPushOn] = useState(false);
  const [sendingTestPush, setSendingTestPush] = useState(false);
  const [isJobsModalOpen, setIsJobsModalOpen] = useState(false);
  const [isWitnessModalOpen, setIsWitnessModalOpen] = useState(false);
  const [isWitnessReviewModalOpen, setIsWitnessReviewModalOpen] = useState(false);
  const [isUnsignedBAModalOpen, setIsUnsignedBAModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  useEffect(() => {
    setPage(1);
  }, [year, month]);

  useEffect(() => {
    let mounted = true;
    if (pushSupported()) {
      registerServiceWorker()
        .then(() => isPushSubscribed())
        .then((subscribed) => {
          if (mounted) setPushOn(subscribed);
        })
        .catch(() => {});
    }
    return () => {
      mounted = false;
    };
  }, []);

  const totalDays = daysInMonth(year, month);
  const byDay = useMemo(() => {
    const map = new Map<number, DailyActivity>();
    activities.forEach((a) => {
      const d = new Date(a.date).getDate();
      map.set(d, a);
    });
    return map;
  }, [activities]);

  const beritaAcaraCount = useMemo(() => {
    return activities.filter((a) => a.is_berita_acara).length;
  }, [activities]);

  const reload = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.monthlyActivities(year, month) }),
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.beritaAcaraStatus(year, month) }),
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.timesheetStatus(year, month) }),
      queryClient.invalidateQueries({ queryKey: WITNESS_REQUESTS_KEY }),
      queryClient.invalidateQueries({ queryKey: ["activities"] }),
    ]);
  }, [queryClient, year, month]);

  const handleSubmitBeritaAcara = async (witnessId?: number) => {
    setSubmittingBA(true);
    try {
      const targetWitness = witnessId || monthlyWitness?.id;
      await submitBeritaAcara(year, month, targetWitness);
      notify("Attendance Incident Reports successfully submitted to witness! 📋", "success");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.beritaAcaraStatus(year, month) }),
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.monthlyActivities(year, month) }),
        queryClient.invalidateQueries({ queryKey: ["activities"] }),
      ]);
    } catch (err: any) {
      notify(err.message || "Failed to submit Attendance Incident Reports", "error");
    } finally {
      setSubmittingBA(false);
    }
  };

  const handleRevokeBeritaAcara = async () => {
    if (!beritaAcaraStatus?.id) return;
    setRevokingBA(true);
    try {
      await revokeBeritaAcara(beritaAcaraStatus.id);
      notify("Witness signature request successfully cancelled.", "success");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.beritaAcaraStatus(year, month) }),
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.monthlyActivities(year, month) }),
        queryClient.invalidateQueries({ queryKey: ["activities"] }),
      ]);
    } catch (err: any) {
      notify(err.message || "Failed to cancel witness signature request", "error");
    } finally {
      setRevokingBA(false);
    }
  };

  const handleSignTimesheet = async () => {
    setSigningTimesheet(true);
    try {
      await signTimesheet(year, month);
      notify("Timesheet signed successfully! Document and activity period are now locked. ✍️", "success");
      await queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.timesheetStatus(year, month) });
    } catch (err: any) {
      notify(err.message || "Failed to sign timesheet", "error");
    } finally {
      setSigningTimesheet(false);
    }
  };

  const handleRevokeTimesheet = async () => {
    setRevokingTimesheet(true);
    try {
      await revokeTimesheet(year, month);
      notify("Timesheet signature revoked. Activity period is unlocked. 🔄", "success");
      await queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.timesheetStatus(year, month) });
    } catch (err: any) {
      notify(err.message || "Failed to revoke timesheet signature", "error");
    } finally {
      setRevokingTimesheet(false);
    }
  };

  const unsignedActivities = useMemo(() => {
    return activities.filter((a) => a.is_berita_acara);
  }, [activities]);

  const generate = async () => {
    setGenerating(true);
    try {
      if (typeof requestTimesheetGeneration === "function") {
        await requestTimesheetGeneration(year, month);
        notify("Timesheet generation task queued! Tracking job... ⏳", "success");
        setIsJobsModalOpen(true);
      } else {
        await downloadTimesheet(year, month);
        notify("Timesheet downloaded & emailed to you 📧", "success");
      }
    } catch (err: any) {
      const msg = err.message || "";
      if (
        msg.includes("Berita Acara") ||
        msg.includes("dokumen belum dapat dibuat") ||
        msg.includes("terdapat catatan") ||
        msg.includes("saksi")
      ) {
        setIsUnsignedBAModalOpen(true);
        notify(msg, "error");
      } else {
        try {
          await downloadTimesheet(year, month);
          notify("Timesheet downloaded & emailed to you 📧", "success");
        } catch (fallbackErr: any) {
          const fallbackMsg = fallbackErr.message || "";
          if (
            fallbackMsg.includes("Berita Acara") ||
            fallbackMsg.includes("dokumen belum dapat dibuat") ||
            fallbackMsg.includes("terdapat catatan") ||
            fallbackMsg.includes("saksi")
          ) {
            setIsUnsignedBAModalOpen(true);
            notify(fallbackMsg, "error");
          } else {
            notify(err.message || fallbackMsg || "Generation failed", "error");
          }
        }
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleSendTestPush = async () => {
    setSendingTestPush(true);
    try {
      await sendTestPush();
      notify("Test push notification sent! 🔔", "success");
    } catch (err: any) {
      notify(err.message || "Failed to send test push notification", "error");
    } finally {
      setSendingTestPush(false);
    }
  };

  const handleTogglePush = async () => {
    setPushBusy(true);
    try {
      if (pushOn) {
        await disablePush();
        setPushOn(false);
        notify("Daily reminders turned off", "info");
      } else {
        await enablePush();
        setPushOn(true);
        notify("Daily reminders enabled at 17:00 WIB", "success");
      }
    } catch (err: any) {
      notify(err.message || "Could not update reminders", "error");
    } finally {
      setPushBusy(false);
    }
  };

  const handleAddPasskey = async () => {
    try {
      await registerPasskey();
      notify("Passkey registered — you can now sign in without a password.", "success");
    } catch (err: any) {
      notify(err.message || "Passkey registration failed", "error");
    }
  };

  return {
    user,
    year, setYear,
    month, setMonth,
    activities,
    monthlyWitness,
    beritaAcaraCount,
    beritaAcaraStatus,
    submittingBA,
    handleSubmitBeritaAcara,
    revokingBA,
    handleRevokeBeritaAcara,
    timesheetStatus,
    signingTimesheet,
    handleSignTimesheet,
    revokingTimesheet,
    handleRevokeTimesheet,
    witnessRequests,
    isWitnessReviewModalOpen,
    setIsWitnessReviewModalOpen,
    holidays,
    loading,
    generating, generate,
    pushBusy, pushOn, handleTogglePush, pushSupported,
    sendingTestPush, handleSendTestPush,
    isJobsModalOpen, setIsJobsModalOpen,
    isWitnessModalOpen, setIsWitnessModalOpen,
    isUnsignedBAModalOpen, setIsUnsignedBAModalOpen,
    unsignedActivities,
    handleAddPasskey, passkeysSupported,
    page, setPage, ITEMS_PER_PAGE,
    totalDays, byDay, now,
    reload,
  };
}
