"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useNewUser } from "./hooks/useNewUser";
import { NewUserForm } from "./components/NewUserForm";

export default function NewUserPage() {
  const { form, setForm, companies, departments, divisions, sites, creating, createUser } = useNewUser();

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <header className="flex items-center gap-4">
        <Link href="/users" className="btn border-2 border-mr-ink bg-mr-surface hover:bg-mr-surface2">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold">New account</h1>
          <p className="text-sm text-mr-muted">Provision a new user account.</p>
        </div>
      </header>

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
