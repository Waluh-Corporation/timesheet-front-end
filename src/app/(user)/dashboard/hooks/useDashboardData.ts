import { useState, useCallback, useEffect, useMemo } from "react";
import { fetchDashboardActivities, fetchHolidays, downloadTimesheet } from "../services/api";
import { useToast } from "@/components/Toast";
import type { DailyActivity } from "@/lib/types";
import { enablePush, disablePush, pushSupported, registerServiceWorker } from "@/lib/push";
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
  const [holidays, setHolidays] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushOn, setPushOn] = useState(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [acts, hols] = await Promise.all([
        fetchDashboardActivities(year, month),
        fetchHolidays(year, month),
      ]);
      setActivities(acts || []);
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
    if (pushSupported()) {
      registerServiceWorker().catch(() => {});
      setPushOn(Notification.permission === "granted");
    }
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

  const generate = async () => {
    setGenerating(true);
    try {
      await downloadTimesheet(year, month);
      notify("Timesheet downloaded & emailed to you 📧", "success");
    } catch (err: any) {
      notify(err.message || "Generation failed", "error");
    } finally {
      setGenerating(false);
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
      await registerPasskey(`${user?.username}'s device`);
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
    holidays,
    loading,
    generating, generate,
    pushBusy, pushOn, handleTogglePush, pushSupported,
    handleAddPasskey, passkeysSupported,
    page, setPage, ITEMS_PER_PAGE,
    totalDays, byDay, now
  };
}
