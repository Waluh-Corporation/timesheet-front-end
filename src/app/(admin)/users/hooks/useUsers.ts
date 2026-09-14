import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/Toast";
import type { User, ProfileChangeRequest, Passkey, Company } from "@/lib/types";
import { usersService } from "../services/usersService";

export function useUsers() {
  const { notify } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [changes, setChanges] = useState<ProfileChangeRequest[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const [passkeysFor, setPasskeysFor] = useState<number | null>(null);
  const [userPasskeys, setUserPasskeys] = useState<Passkey[]>([]);
  const [pkLoading, setPkLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, c, comps] = await Promise.all([
        usersService.getUsers(),
        usersService.getPendingChanges(),
        usersService.getCompanies(),
      ]);
      setUsers(u || []);
      setChanges(c || []);
      setCompanies(comps || []);
    } catch (error) {
      const err = error as Error;
      notify(err.message || "Failed to load", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (u: User) => {
    try {
      await usersService.toggleActive(u.id, !u.is_active);
      load();
    } catch (error) {
      const err = error as Error;
      notify(err.message, "error");
    }
  };

  const deactivateUser = async (u: User) => {
    // ponytail: [Need custom modal to replace native confirm]
    if (!window.confirm(`Deactivate ${u.username}? They keep their history and can be reactivated later.`)) return;
    try {
      await usersService.deactivateUser(u.id);
      notify("User deactivated", "success");
      load();
    } catch (error) {
      const err = error as Error;
      notify(err.message, "error");
    }
  };

  const assignCompany = async (u: User, compId?: number, compObj?: Company) => {
    try {
      await usersService.assignCompany(u.id, compId, compObj ? compObj.name : "");
      notify(`Assigned ${u.username} to ${compObj ? compObj.name : "Unassigned"}`, "success");
      load();
    } catch (error) {
      const err = error as Error;
      notify(err.message, "error");
    }
  };

  const viewPasskeys = async (u: User) => {
    if (passkeysFor === u.id) {
      setPasskeysFor(null);
      return;
    }
    setPasskeysFor(u.id);
    setPkLoading(true);
    try {
      const pk = await usersService.getPasskeys(u.id);
      setUserPasskeys(pk || []);
    } catch (error) {
      const err = error as Error;
      notify(err.message, "error");
      setUserPasskeys([]);
    } finally {
      setPkLoading(false);
    }
  };

  const removeUserPasskey = async (u: User, pk: Passkey) => {
    // ponytail: [Need custom modal to replace native confirm]
    if (!window.confirm(`Remove ${u.username}'s passkey "${pk.friendly_name || "Passkey"}"?`)) return;
    try {
      await usersService.removePasskey(u.id, pk.id);
      notify("Passkey removed", "success");
      const pks = await usersService.getPasskeys(u.id);
      setUserPasskeys(pks || []);
    } catch (error) {
      const err = error as Error;
      notify(err.message, "error");
    }
  };

  const reviewChange = async (c: ProfileChangeRequest, action: "approve" | "reject") => {
    try {
      await usersService.reviewChange(c.id, action);
      notify(`Request ${action}d`, "success");
      load();
    } catch (error) {
      const err = error as Error;
      notify(err.message, "error");
    }
  };

  return {
    users,
    changes,
    companies,
    loading,
    passkeysFor,
    userPasskeys,
    pkLoading,
    toggleActive,
    deactivateUser,
    assignCompany,
    viewPasskeys,
    removeUserPasskey,
    reviewChange,
  };
}
