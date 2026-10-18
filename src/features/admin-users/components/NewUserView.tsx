"use client";

import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { PageHeader } from "@/components/tabler";

import { useNewUser } from "../hooks/useNewUser";
import { NewUserForm } from "./NewUserForm";

export function NewUserView() {
  const {
    form,
    setForm,
    companies,
    departments,
    divisions,
    sites,
    creating,
    createUser,
  } = useNewUser();

  return (
    <div className="container-tight py-4">
      <div className="mb-3">
        <Link
          href="/users"
          className="btn btn-outline-secondary d-inline-flex align-items-center gap-1 mb-3"
        >
          <IconArrowLeft size={16} /> Back to Users
        </Link>
        <PageHeader
          pretitle="Administration"
          title="New Account"
          description="Provision a new employee or administrator account."
        />
      </div>

      <NewUserForm
        form={form}
        setForm={setForm}
        companies={companies}
        creating={creating}
        createUser={createUser}
        dummyDepartments={departments}
        dummyDivisions={divisions}
        dummySites={sites}
      />
    </div>
  );
}
