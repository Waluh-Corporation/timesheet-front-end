"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";

import { useUsers } from "./hooks/useUsers";
import { PendingChanges } from "./components/PendingChanges";
import { UserList } from "./components/UserList";

// Admin console for provisioning accounts (the ONLY registration path) and
// reviewing self-service profile change requests.
export default function UsersPage() {
  const {
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
  } = useUsers();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Users</h1>
          <p className="text-sm text-mr-muted">
            Provision accounts and approve profile changes.
          </p>
        </div>
        <Link href="/users/new" className="btn-primary">
          <UserPlus size={18} />
          Create new user
        </Link>
      </header>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          <PendingChanges 
            changes={changes} 
            onReview={reviewChange} 
          />
          <UserList
            users={users}
            companies={companies}
            loading={loading}
            passkeysFor={passkeysFor}
            userPasskeys={userPasskeys}
            pkLoading={pkLoading}
            onToggleActive={toggleActive}
            onDeactivateUser={deactivateUser}
            onAssignCompany={assignCompany}
            onViewPasskeys={viewPasskeys}
            onRemovePasskey={removeUserPasskey}
          />
        </div>
      </div>
    </div>
  );
}
