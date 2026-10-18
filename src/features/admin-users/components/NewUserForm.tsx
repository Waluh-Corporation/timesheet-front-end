"use client";

import { IconUserPlus } from "@tabler/icons-react";
import type { Role, Company } from "@/lib/types";

export type NewUserFormState = {
  username: string;
  email: string;
  role: Role;
  name: string;
  bni_id: string;
  employee_id: string;
  division: string;
  department: string;
  site: string;
  company: string;
  company_id: number;
};

export function NewUserForm({
  form,
  setForm,
  companies,
  creating,
  createUser,
  dummyDepartments,
  dummyDivisions,
  dummySites,
}: Readonly<{
  form: NewUserFormState;
  setForm: (form: NewUserFormState) => void;
  companies: Company[];
  creating: boolean;
  createUser: (e: React.FormEvent) => void;
  dummyDepartments: string[];
  dummyDivisions: string[];
  dummySites: string[];
}>) {
  return (
    <form onSubmit={createUser} className="card">
      <div className="card-header">
        <h3 className="card-title mb-0">Account Information</h3>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-12 col-sm-6">
            <label className="form-label required">Username</label>
            <input
              className="form-control"
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          <div className="col-12 col-sm-6">
            <label className="form-label required">Email</label>
            <input
              className="form-control"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="col-12 col-sm-6">
            <label className="form-label">Full Name</label>
            <input
              className="form-control"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="col-12 col-sm-6">
            <label className="form-label required">Role</label>
            <select
              className="form-select"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
            >
              <option value="user">User</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div className="col-12 col-sm-6">
            <label className="form-label">Employee / MII ID</label>
            <input
              className="form-control"
              placeholder="Employee ID"
              value={form.employee_id}
              onChange={(e) =>
                setForm({ ...form, employee_id: e.target.value.replace(/\D/g, "") })
              }
            />
          </div>

          <div className="col-12 col-sm-6">
            <label className="form-label required">BNI ID</label>
            <input
              className="form-control"
              placeholder="BNI ID"
              value={form.bni_id}
              onChange={(e) =>
                setForm({ ...form, bni_id: e.target.value.replace(/\D/g, "") })
              }
              required
            />
          </div>

          <div className="col-12 col-sm-6">
            <label className="form-label">Company</label>
            <select
              className="form-select"
              value={form.company_id || ""}
              onChange={(e) => {
                const val = Number(e.target.value);
                const c = companies.find((comp) => comp.id === val);
                setForm({
                  ...form,
                  company_id: val,
                  company: c ? c.name : "",
                });
              }}
            >
              <option value="">— Select Company —</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code.toUpperCase()} — {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-sm-6">
            <label className="form-label">Division</label>
            <select
              className="form-select"
              value={form.division}
              onChange={(e) => setForm({ ...form, division: e.target.value })}
            >
              <option value="">— Select Division —</option>
              {dummyDivisions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-sm-6">
            <label className="form-label">Department</label>
            <select
              className="form-select"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            >
              <option value="">— Select Department —</option>
              {dummyDepartments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-sm-6">
            <label className="form-label">Site / Location</label>
            <select
              className="form-select"
              value={form.site}
              onChange={(e) => setForm({ ...form, site: e.target.value })}
            >
              <option value="">— Select Site —</option>
              {dummySites.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card-footer text-end">
        <button
          type="submit"
          disabled={creating}
          className="btn btn-primary d-inline-flex align-items-center gap-1"
        >
          {creating ? (
            <span className="spinner-border spinner-border-sm" role="status" />
          ) : (
            <IconUserPlus size={16} />
          )}
          Create User Account
        </button>
      </div>
    </form>
  );
}
