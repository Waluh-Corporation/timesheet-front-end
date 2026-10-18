"use client";

import Link from "next/link";
import { IconUserPlus } from "@tabler/icons-react";
import { PageHeader } from "@/components/tabler";

import { useUsers } from "../hooks/useUsers";
import { PendingChanges } from "./PendingChanges";
import { UserList } from "./UserList";
import { EditUserModal } from "./EditUserModal";
import { AnonymizeUserModal } from "./AnonymizeUserModal";
import { useAuth } from "@/lib/auth";

export function AdminUsersView() {
  const { user: currentUser } = useAuth();
  const {
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
    reload,
  } = useUsers();

  return (
    <div>
      <PageHeader
        pretitle="Administration"
        title="Users"
        description="Provision accounts, assign companies, manage passkeys, and review profile changes."
        actions={
          <Link href="/users/new" className="btn btn-primary d-inline-flex align-items-center gap-1">
            <IconUserPlus size={16} />
            Create New User
          </Link>
        }
      />

      <div className="d-flex flex-column gap-3">
        <PendingChanges changes={changes} onReview={reviewChange} />
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
          onEditUser={(u) => {
            if (
              Boolean(currentUser?.id && currentUser.id === u.id) ||
              Boolean(currentUser?.username && u.username === currentUser.username)
            ) {
              return;
            }
            setEditingUser(u);
          }}
          onViewPasskeys={viewPasskeys}
          onAnonymizeUser={setAnonymizingUser}
        />
      </div>

      <EditUserModal
        user={editingUser}
        companies={companies}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleUpdateUser}
      />

      <AnonymizeUserModal
        user={anonymizingUser}
        isOpen={!!anonymizingUser}
        onClose={() => setAnonymizingUser(null)}
        onSuccess={reload}
      />
    </div>
  );
}
