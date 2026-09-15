import { useAuth } from "@/lib/auth";

export function AccountOverview() {
  const { user } = useAuth();
  
  return (
    <div className="card p-6">
      <h2 className="mb-4 text-lg font-bold">Account Overview</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="text-xs font-bold uppercase text-mr-muted">Username</p>
          <p className="font-semibold">{user?.username}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-mr-muted">Email</p>
          <p className="font-semibold">{user?.email}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-mr-muted">Role</p>
          <span className="chip bg-mr-purple text-white uppercase text-xs">{user?.role}</span>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-mr-muted">Company</p>
          <p className="font-semibold">{user?.company || "Unassigned"}</p>
        </div>
      </div>
    </div>
  );
}
