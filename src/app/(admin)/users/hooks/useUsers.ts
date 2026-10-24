import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/Toast";
import type { User, ProfileChangeRequest, Passkey, Company, UpdateUserRequestDTO } from "@/lib/types";
import { isUserAnonymized } from "@/lib/types";
import { usersService } from "../services/usersService";

export function useUsers() {
  const { notify } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [changes, setChanges] = useState<ProfileChangeRequest[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [anonymizingUser, setAnonymizingUser] = useState<User | null>(null);
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
    if (isUserAnonymized(u)) {
      notify("Anonymized accounts cannot have their status modified", "error");
      return;
    }
    try {
      await usersService.toggleActive(u.id, !u.is_active);
      load();
    } catch (error) {
      const err = error as Error;
      notify(err.message, "error");
    }
  };

  const deactivateUser = async (u: User) => {
    if (isUserAnonymized(u)) {
      notify("Anonymized accounts cannot be deactivated", "error");
      return;
    }
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
    if (isUserAnonymized(u)) {
      notify("Anonymized accounts cannot be assigned to another company", "error");
      return;
    }
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
    if (isUserAnonymized(u)) {
      notify("Anonymized accounts do not have active passkeys", "error");
      return;
    }
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

  const handleUpdateUser = async (id: number, payload: Partial<UpdateUserRequestDTO>) => {
    const target = users.find((u) => u.id === id);
    if (target && isUserAnonymized(target)) {
      notify("Anonymized accounts cannot be edited", "error");
      return;
    }
    try {
      await usersService.updateUser(id, payload);
      notify("User updated successfully", "success");
      load();
    } catch (error) {
      const err = error as Error;
      notify(err.message || "Failed to update user", "error");
      throw err;
    }
  };

  return {
    users,
    changes,
    companies,
    loading,
    editingUser,
    setEditingUser,
    anonymizingUser,
    setAnonymizingUser,
    handleUpdateUser,
    passkeysFor,
    userPasskeys,
    pkLoading,
    toggleActive,
    deactivateUser,
    assignCompany,
    viewPasskeys,
    reviewChange,
    reload: load,
  };
}
