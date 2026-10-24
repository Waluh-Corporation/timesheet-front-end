"use client";

import { IconClock } from "@tabler/icons-react";
import { useProfileForm } from "../hooks/useProfileForm";

export function ProfileForm({
  hasPending,
  onSuccess,
}: {
  hasPending: boolean;
  onSuccess?: () => void;
}) {
  const {
    form,
    setFieldValue,
    submit,
    companies,
    departments,
    divisions,
    sites,
    saving,
    loading,
  } = useProfileForm(onSuccess);

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card">
      <div className="card-header d-flex align-items-center justify-content-between">
        <div>
          <h3 className="card-title mb-0">Profile Details</h3>
          <div className="text-secondary small">
            Updates to core personal or organizational details require administrator review.
          </div>
        </div>
        {hasPending && (
          <span className="badge bg-warning-lt d-inline-flex align-items-center gap-1">
            <IconClock size={14} /> Pending Approval
          </span>
        )}
      </div>

      <div className="card-body">
        <div className="row g-3">
          <div className="col-12 col-sm-6">
            <label htmlFor="profile-full-name" className="form-label">
              Full Name
            </label>
            <input
              id="profile-full-name"
              type="text"
              className="form-control"
              value={form.name}
              onChange={(e) => setFieldValue("name", e.target.value)}
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="col-12 col-sm-6">
            <label htmlFor="profile-email" className="form-label">
              Email Address
            </label>
            <input
              id="profile-email"
              type="email"
              className="form-control"
              value={form.email}
              onChange={(e) => setFieldValue("email", e.target.value)}
              placeholder="e.g. john@example.com"
            />
          </div>

          <div className="col-12 col-sm-6">
            <label htmlFor="profile-employee-id" className="form-label">
              Employee ID / MII ID
            </label>
            <input
              id="profile-employee-id"
              type="text"
              className="form-control"
              value={form.employee_id}
              onChange={(e) => setFieldValue("employee_id", e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 12345"
            />
          </div>

          <div className="col-12 col-sm-6">
            <label htmlFor="profile-bni-id" className="form-label required">
              BNI ID
            </label>
            <input
              id="profile-bni-id"
              type="text"
              className="form-control"
              value={form.bni_id}
              onChange={(e) => setFieldValue("bni_id", e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 12345678"
              required
            />
          </div>

          <div className="col-12 col-sm-6">
            <label htmlFor="profile-company" className="form-label required">
              Company
            </label>
            <select
              id="profile-company"
              className="form-select"
              value={form.company_id || ""}
              onChange={(e) => setFieldValue("company_id", Number(e.target.value))}
              required
            >
              <option value="">— Select Company —</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-sm-6">
            <label htmlFor="profile-division" className="form-label">
              Division
            </label>
            {divisions.length > 0 ? (
              <select
                id="profile-division"
                className="form-select"
                value={form.division}
                onChange={(e) => setFieldValue("division", e.target.value)}
              >
                <option value="">— Select Division —</option>
                {divisions.map((div) => (
                  <option key={div.id} value={div.name}>
                    {div.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="profile-division"
                type="text"
                className="form-control"
                value={form.division}
                onChange={(e) => setFieldValue("division", e.target.value)}
                placeholder="e.g. Application Development Division"
              />
            )}
          </div>

          <div className="col-12 col-sm-6">
            <label htmlFor="profile-department" className="form-label">
              Department
            </label>
            {departments.length > 0 ? (
              <select
                id="profile-department"
                className="form-select"
                value={form.department_id}
                onChange={(e) => {
                  const selId = Number(e.target.value);
                  const selDept = departments.find((d) => d.id === selId);
                  setFieldValue("department_id", selId);
                  setFieldValue("department", selDept ? selDept.name : "");
                }}
              >
                <option value={0}>— Select Department —</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.code ? `(${d.code})` : ""}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="profile-department"
                type="text"
                className="form-control"
                value={form.department}
                onChange={(e) => setFieldValue("department", e.target.value)}
                placeholder="e.g. Core Banking"
              />
            )}
          </div>

          <div className="col-12 col-sm-6">
            <label htmlFor="profile-site" className="form-label">
              Site / Location
            </label>
            {sites.length > 0 ? (
              <select
                id="profile-site"
                className="form-select"
                value={form.site}
                onChange={(e) => setFieldValue("site", e.target.value)}
              >
                <option value="">— Select Site —</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.name}>
                    {site.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="profile-site"
                type="text"
                className="form-control"
                value={form.site}
                onChange={(e) => setFieldValue("site", e.target.value)}
                placeholder="e.g. Jakarta, Sentul, Slipi"
              />
            )}
          </div>

          <div className="col-12">
            <label htmlFor="profile-notes" className="form-label">
              Reason / Submission Notes
            </label>
            <textarea
              id="profile-notes"
              className="form-control"
              rows={3}
              value={form.notes}
              onChange={(e) => setFieldValue("notes", e.target.value)}
              placeholder="Explain the reason for profile updates (e.g. site relocation, employee ID correction)..."
            />
          </div>
        </div>
      </div>

      <div className="card-footer text-end">
        <button
          type="submit"
          className="btn btn-primary d-inline-flex align-items-center gap-1"
          disabled={saving}
        >
          {saving && <span className="spinner-border spinner-border-sm" role="status" />}
          Request Profile Change
        </button>
      </div>
    </form>
  );
}
