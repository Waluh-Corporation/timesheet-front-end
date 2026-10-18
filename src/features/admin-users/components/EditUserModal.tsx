"use client";

import { useState, useEffect } from "react";
import type {
  User,
  Company,
  Division,
  Department,
  Site,
  Role,
  UpdateUserRequestDTO,
} from "@/lib/types";
import { isUserAnonymized } from "@/lib/types";
import { Modal } from "@/components/tabler";
import { useAuth } from "@/lib/auth";
import {
  fetchDivisions,
  fetchDepartments,
  fetchSites,
} from "@/app/(admin)/master-data/services/masterData";

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
  const { user: currentUser } = useAuth();
  const isSelf = currentUser?.id === user?.id;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [employeeId, setEmployeeId] = useState("");
  const [bniId, setBniId] = useState("");
  const [companyId, setCompanyId] = useState<number | undefined>(undefined);
  const [division, setDivision] = useState("");
  const [department, setDepartment] = useState("");
  const [site, setSite] = useState("");

  const [divisions, setDivisions] = useState<Division[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sites, setSites] = useState<Site[]>([]);

  // Load master data once modal opens
  useEffect(() => {
    if (!isOpen) return;
    void Promise.all([fetchDivisions(), fetchSites()])
      .then(([divs, sts]) => {
        setDivisions(divs || []);
        setSites(sts || []);
      })
      .catch(() => {});
  }, [isOpen]);

  // Load departments when division changes
  useEffect(() => {
    if (!isOpen) return;
    const selectedDiv = divisions.find((d) => d.name === division || d.code === division);
    void fetchDepartments(
      selectedDiv ? { division_id: selectedDiv.id } : division ? { division } : undefined
    )
      .then((depts) => {
        setDepartments(depts || []);
      })
      .catch(() => {});
  }, [isOpen, division, divisions]);

  // Sync user values into local form state
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setRole(user.role || "user");
      setEmployeeId(user.employee_id || user.mii_id || "");
      setBniId(user.bni_id || "");
      setCompanyId(user.company_id || (user.company_rel ? user.company_rel.id : undefined));
      setDivision(user.division || "");
      setDepartment(user.department || "");
      setSite(user.site || "");
      setError(null);
    }
  }, [user, isOpen]);

  if (!isOpen || !user || isUserAnonymized(user)) return null;

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
      is_active: user.is_active,
      employee_id: employeeId.trim(),
      bni_id: bniId.trim(),
      company_id: companyId || undefined,
      company: selectedComp ? selectedComp.name : undefined,
      division_id: selectedDiv?.id,
      division: selectedDiv ? selectedDiv.name : division.trim() || undefined,
      department_id: selectedDept?.id,
      department: selectedDept ? selectedDept.name : department.trim() || undefined,
      site_id: selectedSite?.id,
      site: selectedSite ? selectedSite.name : site.trim() || undefined,
    };

    try {
      await onSave(user.id, payload);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit User: ${user.username}`}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-link link-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="btn btn-primary d-inline-flex align-items-center gap-1"
          >
            {saving && <span className="spinner-border spinner-border-sm" role="status" />}
            Save Changes
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger mb-3">{error}</div>}

        <div className="row g-3">
          <div className="col-12 col-sm-6">
            <label htmlFor="edit-user-name" className="form-label">Full Name</label>
            <input
              id="edit-user-name"
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="col-12 col-sm-6">
            <label htmlFor="edit-user-role" className="form-label">Role</label>
            <select
              id="edit-user-role"
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="user">User</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div className="col-12 col-sm-6">
            <label htmlFor="edit-user-employee-id" className="form-label">Employee ID / MII ID</label>
            <input
              id="edit-user-employee-id"
              type="text"
              className="form-control"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 12345"
            />
          </div>

          <div className="col-12 col-sm-6">
            <label htmlFor="edit-user-bni-id" className="form-label">BNI ID</label>
            <input
              id="edit-user-bni-id"
              type="text"
              className="form-control"
              value={bniId}
              onChange={(e) => setBniId(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 12345678"
            />
          </div>

          <div className="col-12 col-sm-6">
            <label htmlFor="edit-user-company" className="form-label">Company</label>
            <select
              id="edit-user-company"
              className="form-select"
              value={companyId || ""}
              disabled={isSelf}
              title={isSelf ? "You cannot modify your own company" : undefined}
              onChange={(e) =>
                setCompanyId(e.target.value ? Number(e.target.value) : undefined)
              }
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
            <label htmlFor="edit-user-division" className="form-label">Division</label>
            {divisions.length > 0 ? (
              <select
                id="edit-user-division"
                className="form-select"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
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
                id="edit-user-division"
                type="text"
                className="form-control"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                placeholder="e.g. Application Development"
              />
            )}
          </div>

          <div className="col-12 col-sm-6">
            <label htmlFor="edit-user-department" className="form-label">Department</label>
            {departments.length > 0 ? (
              <select
                id="edit-user-department"
                className="form-select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">— Select Department —</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} {d.code ? `(${d.code})` : ""}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="edit-user-department"
                type="text"
                className="form-control"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Core Banking"
              />
            )}
          </div>

          <div className="col-12 col-sm-6">
            <label htmlFor="edit-user-site" className="form-label">Site / Location</label>
            {sites.length > 0 ? (
              <select
                id="edit-user-site"
                className="form-select"
                value={site}
                onChange={(e) => setSite(e.target.value)}
              >
                <option value="">— Select Site —</option>
                {sites.map((st) => (
                  <option key={st.id} value={st.name}>
                    {st.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="edit-user-site"
                type="text"
                className="form-control"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                placeholder="e.g. Sentul, Slipi"
              />
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
