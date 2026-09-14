import { UserPlus, Loader2 } from "lucide-react";
import type { Role, Company } from "@/lib/types";

export type NewUserFormState = {
  username: string;
  email: string;
  role: Role;
  name: string;
  bni_id: string;
  mii_id: string;
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
}: {
  form: NewUserFormState;
  setForm: (form: NewUserFormState) => void;
  companies: Company[];
  creating: boolean;
  createUser: (e: React.FormEvent) => void;
  dummyDepartments: string[];
  dummyDivisions: string[];
  dummySites: string[];
}) {
  return (
    <div className="card p-6">
      <form onSubmit={createUser} className="flex flex-col gap-4">
        <input
          className="input"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="input"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            className="input"
            placeholder="Employee / MII ID"
            value={form.mii_id}
            onChange={(e) => setForm({ ...form, mii_id: e.target.value })}
          />
          <input
            className="input"
            placeholder="BNI ID"
            value={form.bni_id}
            onChange={(e) => setForm({ ...form, bni_id: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <select
            className="input"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
          >
            <option value="">— Select Department —</option>
            {dummyDepartments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select
            className="input"
            value={form.division}
            onChange={(e) => setForm({ ...form, division: e.target.value })}
          >
            <option value="">— Select Division —</option>
            {dummyDivisions.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <select
            className="input"
            value={form.site}
            onChange={(e) => setForm({ ...form, site: e.target.value })}
          >
            <option value="">— Select Site —</option>
            {dummySites.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            className="input font-semibold"
            value={form.company_id || ""}
            onChange={(e) => {
              const compId = Number(e.target.value);
              const comp = companies.find((c) => c.id === compId);
              setForm({
                ...form,
                company_id: compId,
                company: comp ? comp.name : "",
              });
            }}
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
        <select
          className="input"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <div className="pt-2">
          <button type="submit" className="btn-primary w-full" disabled={creating}>
            {creating ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
            Create & send setup link
          </button>
        </div>
      </form>
    </div>
  );
}
