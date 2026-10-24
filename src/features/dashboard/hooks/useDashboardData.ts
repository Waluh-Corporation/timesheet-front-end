"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  fetchDashboardActivities,
  fetchHolidays,
  downloadTimesheet,
  requestTimesheetGeneration,
} from "../services/dashboardService";
import {
  getBeritaAcaraStatus,
  submitBeritaAcara,
  revokeBeritaAcara,
  getPendingWitnessRequests,
} from "@/services/beritaAcaraService";
import {
  getTimesheetStatus,
  signTimesheet,
  revokeTimesheet,
} from "@/services/timesheetService";
import { useToast } from "@/components/Toast";
import type {
  DailyActivity,
  WitnessResponse,
  BeritaAcaraStatusResponse,
  WitnessRequestItem,
  TimesheetStatusResponse,
} from "@/lib/types";
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

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [monthlyWitness, setMonthlyWitness] = useState<WitnessResponse | undefined>();
  const [beritaAcaraStatus, setBeritaAcaraStatus] = useState<BeritaAcaraStatusResponse | null>(null);
  const [timesheetStatus, setTimesheetStatus] = useState<TimesheetStatusResponse | null>(null);
  const [witnessRequests, setWitnessRequests] = useState<WitnessRequestItem[]>([]);
  const [holidays, setHolidays] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [actRes, hols, baStatusRes, pendingWitnessReqs, tsStatusRes] = await Promise.all([
        fetchDashboardActivities(year, month),
        fetchHolidays(year, month),
        getBeritaAcaraStatus(year, month).catch(() => null),
        getPendingWitnessRequests().catch(() => []),
        getTimesheetStatus(year, month).catch(() => null),
      ]);
      const acts = Array.isArray(actRes) ? actRes : (actRes?.activities || []);
      const mWitness = Array.isArray(actRes) ? undefined : actRes?.monthlyWitness;
      setActivities(acts);
      setMonthlyWitness(mWitness);
      setBeritaAcaraStatus(baStatusRes);
      setWitnessRequests(pendingWitnessReqs || []);
      setTimesheetStatus(tsStatusRes);

      const hmap: Record<number, string> = {};
      (hols || []).forEach((h) => {
        const d = Number.parseInt(h.date.split("-")[2], 10);
        if (!Number.isNaN(d)) hmap[d] = h.description;
      });
      setHolidays(hmap);
    } catch (err: any) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [year, month, notify]);

  useEffect(() => {
    load();
    setPage(1);
  }, [load]);

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

  const handleSubmitBeritaAcara = async (witnessId?: number) => {
    setSubmittingBA(true);
    try {
      const targetWitness = witnessId || monthlyWitness?.id;
      await submitBeritaAcara(year, month, targetWitness);
      notify("Attendance Incident Reports successfully submitted to witness! 📋", "success");
      await load();
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
      await load();
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
      await load();
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
      await load();
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
    reload: load,
  };
}
