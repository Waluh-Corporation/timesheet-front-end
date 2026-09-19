"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Save, ShieldAlert } from "lucide-react";
import type { User, Company, Division, Department, Site, Role, UpdateUserRequestDTO } from "@/lib/types";
import { fetchDivisions, fetchDepartments, fetchSites } from "@/app/(admin)/master-data/services/masterData";

interface EditUserModalProps {
  user: User | null;
  companies: Company[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, payload: Partial<UpdateUserRequestDTO>) => Promise<void>;
}

export function EditUserModal({
  user,
  companies,
  isOpen,
  onClose,
  onSave,
}: Readonly<EditUserModalProps>) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [isActive, setIsActive] = useState(true);
  const [employeeId, setEmployeeId] = useState("");
  const [bniId, setBniId] = useState("");
  const [companyId, setCompanyId] = useState<number | undefined>(undefined);
  const [division, setDivision] = useState("");
  const [department, setDepartment] = useState("");
  const [site, setSite] = useState("");

  const [divisions, setDivisions] = useState<Division[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loadingMaster, setLoadingMaster] = useState(false);

  // Load master data once modal opens
  useEffect(() => {
    if (!isOpen) return;
    setLoadingMaster(true);
    Promise.all([fetchDivisions(), fetchSites()])
      .then(([divs, sts]) => {
        setDivisions(divs || []);
        setSites(sts || []);
      })
      .finally(() => setLoadingMaster(false));
  }, [isOpen]);

  // Load departments when division changes
  useEffect(() => {
    if (!isOpen) return;
    const selectedDiv = divisions.find((d) => d.name === division || d.code === division);
    fetchDepartments(selectedDiv ? { division_id: selectedDiv.id } : division ? { division } : undefined)
      .then((depts) => {
        setDepartments(depts || []);
      });
  }, [isOpen, division, divisions]);

  // Sync user values into local form state
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setRole(user.role || "user");
      setIsActive(user.is_active ?? true);
      setEmployeeId(user.employee_id || user.mii_id || "");
      setBniId(user.bni_id || "");
      setCompanyId(user.company_id || (user.company_rel ? user.company_rel.id : undefined));
      setDivision(user.division || "");
      setDepartment(user.department || "");
      setSite(user.site || "");
      setError(null);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const selectedComp = companies.find((c) => c.id === companyId);
    const selectedDiv = divisions.find((d) => d.name === division || d.code === division);
    const selectedDept = departments.find((d) => d.name === department || d.code === department);
    const selectedSite = sites.find((s) => s.name === site || s.code === site);

    const payload: Partial<UpdateUserRequestDTO> = {
      name: name.trim(),
      role,
      is_active: isActive,
      employee_id: employeeId.trim(),
      bni_id: bniId.trim(),
      company_id: companyId || undefined,
      company: selectedComp ? selectedComp.name : undefined,
      division_id: selectedDiv?.id,
      division: division || undefined,
      department_id: selectedDept?.id,
      department: department || undefined,
      site_id: selectedSite?.id,
      site: site || undefined,
    };

    try {
      await onSave(user.id, payload);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-mr-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b-2 border-mr-ink pb-4">
          <div>
            <h2 className="text-xl font-bold">Edit User: {user.username}</h2>
            <p className="text-xs text-mr-muted">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="border-2 border-mr-ink p-1.5 hover:bg-mr-pink hover:text-white"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 border-2 border-red-500 bg-red-100 p-3 text-xs text-red-800">
            <ShieldAlert size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-mr-muted">
                Full Name
              </label>
              <input
                className="input w-full"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-mr-muted">
                Role
              </label>
              <select
                className="input w-full"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-mr-muted">
                Employee / MII ID
              </label>
              <input
                className="input w-full"
                placeholder="Employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-mr-muted">
                BNI ID
              </label>
              <input
                className="input w-full"
                placeholder="BNI ID"
                value={bniId}
                onChange={(e) => setBniId(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-mr-muted">
                Company
              </label>
              <select
                className="input w-full"
                value={companyId || ""}
                onChange={(e) => setCompanyId(e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">Select Company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-mr-muted">
                Site
              </label>
              <select
                className="input w-full"
                value={site}
                onChange={(e) => setSite(e.target.value)}
              >
                <option value="">Select Site</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-mr-muted">
                Division
              </label>
              <select
                className="input w-full"
                value={division}
                onChange={(e) => {
                  setDivision(e.target.value);
                  setDepartment("");
                }}
              >
                <option value="">Select Division</option>
                {divisions.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-mr-muted">
                Department
              </label>
              <select
                className="input w-full"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active_checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-2 border-mr-ink text-mr-purple focus:ring-0"
            />
            <label htmlFor="is_active_checkbox" className="text-sm font-semibold">
              Active Account
            </label>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t-2 border-mr-ink pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || loadingMaster}
              className="btn-primary"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
