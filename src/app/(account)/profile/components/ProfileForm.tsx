import { Loader2, Clock } from "lucide-react";
import { useProfileForm } from "../hooks/useProfileForm";

export function ProfileForm({ hasPending, onSuccess }: { hasPending: boolean, onSuccess?: () => void }) {
  const { form, setFieldValue, submit, companies, departments, divisions, sites, saving, loading } = useProfileForm(onSuccess);

  if (loading) {
     return <div className="card p-6 flex justify-center py-6"><Loader2 className="animate-spin text-mr-purple" /></div>;
  }

  return (
    <form onSubmit={submit} className="card flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Profile details</h2>
          <p className="text-xs text-mr-muted">
            Updates to core details require administrator approval before taking effect.
          </p>
        </div>
        {hasPending && (
          <span className="chip bg-mr-yellow text-black">
            <Clock size={12} /> Pending approval
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-full-name" className="mb-1 block text-xs font-bold uppercase">Full name</label>
          <input
            id="profile-full-name"
            className="input"
            value={form.name}
            onChange={(e) => setFieldValue("name", e.target.value)}
            placeholder="e.g. John Doe"
          />
        </div>
        <div>
          <label htmlFor="profile-email" className="mb-1 block text-xs font-bold uppercase">Email</label>
          <input
            id="profile-email"
            type="email"
            className="input"
            value={form.email}
            onChange={(e) => setFieldValue("email", e.target.value)}
            placeholder="e.g. john@example.com"
          />
        </div>
        <div>
          <label htmlFor="profile-employee-id" className="mb-1 block text-xs font-bold uppercase">Employee ID / MII ID</label>
          <input
            id="profile-employee-id"
            className="input"
            value={form.employee_id}
            onChange={(e) => setFieldValue("employee_id", e.target.value.replace(/\D/g, ""))}
            placeholder="e.g. 12345"
          />
        </div>
        <div>
          <label htmlFor="profile-bni-id" className="mb-1 block text-xs font-bold uppercase">BNI ID</label>
          <input
            id="profile-bni-id"
            className="input"
            value={form.bni_id}
            onChange={(e) => setFieldValue("bni_id", e.target.value.replace(/\D/g, ""))}
            placeholder="e.g. 12345678"
            required
          />
        </div>
        <div>
          <label htmlFor="profile-division" className="mb-1 block text-xs font-bold uppercase">Division</label>
          {divisions.length > 0 ? (
            <select
              id="profile-division"
              className="input font-medium"
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
              className="input"
              value={form.division}
              onChange={(e) => setFieldValue("division", e.target.value)}
              placeholder="e.g. Application Development Division"
            />
          )}
        </div>
        <div>
          <label htmlFor="profile-company" className="mb-1 block text-xs font-bold uppercase">Company</label>
          <select
            id="profile-company"
            className="input font-medium"
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
        <div>
          <label htmlFor="profile-department" className="mb-1 block text-xs font-bold uppercase">Department</label>
          {departments.length > 0 ? (
            <select
              id="profile-department"
              className="input font-medium"
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
              className="input"
              value={form.department}
              onChange={(e) => setFieldValue("department", e.target.value)}
              placeholder="e.g. Core Banking"
            />
          )}
        </div>
        <div>
          <label htmlFor="profile-site" className="mb-1 block text-xs font-bold uppercase">Site / Location</label>
          {sites.length > 0 ? (
            <select
              id="profile-site"
              className="input font-medium"
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
              className="input"
              value={form.site}
              onChange={(e) => setFieldValue("site", e.target.value)}
              placeholder="e.g. Jakarta, Sentul, Slipi"
            />
          )}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="profile-notes" className="mb-1 block text-xs font-bold uppercase">Reason / Notes (Catatan Pengajuan)</label>
          <textarea
            id="profile-notes"
            className="input min-h-[70px] w-full resize-y text-xs"
            value={form.notes}
            onChange={(e) => setFieldValue("notes", e.target.value)}
            placeholder="Jelaskan alasan perubahan data profil (mis. rotasi penempatan site baru, koreksi NIK/BNI ID)..."
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          Request change
        </button>
      </div>
    </form>
  );
}
