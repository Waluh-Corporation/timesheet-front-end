import { Plus, Download, Bell, BellOff, Fingerprint, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface DashboardHeaderProps {
  user: any;
  filledCount: number;
  generating: boolean;
  onGenerate: () => void;
  pushBusy: boolean;
  pushOn: boolean;
  onTogglePush: () => void;
  pushSupported: boolean;
  onAddPasskey: () => void;
  passkeysSupported: boolean;
}

export function DashboardHeader({
  user,
  filledCount,
  generating,
  onGenerate,
  pushBusy,
  pushOn,
  onTogglePush,
  pushSupported,
  onAddPasskey,
  passkeysSupported,
}: Readonly<DashboardHeaderProps>) {
  const router = useRouter();

  let pushIcon = <Bell size={18} />;
  if (pushBusy) {
    pushIcon = <Loader2 size={18} className="animate-spin" />;
  } else if (pushOn) {
    pushIcon = <BellOff size={18} />;
  }

  return (
    <>
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-mr-yellow p-6 text-black">
          <div>
            <p className="text-sm font-bold opacity-70">Halo,</p>
            <h1 className="text-2xl font-extrabold">{user?.name || user?.username} 👋</h1>
            <p className="mt-1 text-sm font-semibold opacity-70">
              {filledCount} day{filledCount === 1 ? "" : "s"} filled this month.
            </p>
          </div>
          <button onClick={() => router.push("/activity")} className="btn-primary">
            <Plus size={18} /> Today&apos;s Activity
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <button
          onClick={onGenerate}
          disabled={generating}
          className="card flex items-center gap-3 p-4 text-left transition hover:shadow-hard"
        >
          <div className="grid h-10 w-10 place-items-center  bg-mr-cyan text-mr-ink">
            {generating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          </div>
          <div>
            <p className="text-sm font-bold">Generate</p>
            <p className="text-xs text-mr-muted">Download & email .xlsx</p>
          </div>
        </button>

        <button
          onClick={onTogglePush}
          disabled={pushBusy || !pushSupported}
          className="card flex items-center gap-3 p-4 text-left transition hover:shadow-hard disabled:opacity-60"
        >
          <div className="grid h-10 w-10 place-items-center bg-mr-purple text-white">
            {pushIcon}
          </div>
          <div>
            <p className="text-sm font-bold">{pushOn ? "Disable reminders" : "Enable reminders"}</p>
            <p className="text-xs text-mr-muted">Daily push at 17:00 WIB</p>
          </div>
        </button>

        <button
          onClick={onAddPasskey}
          disabled={!passkeysSupported}
          className="card flex items-center gap-3 p-4 text-left transition hover:shadow-hard disabled:opacity-60"
        >
          <div className="grid h-10 w-10 place-items-center  bg-mr-pink text-white">
            <Fingerprint size={18} />
          </div>
          <div>
            <p className="text-sm font-bold">Add passkey</p>
            <p className="text-xs text-mr-muted">Passwordless sign-in</p>
          </div>
        </button>
      </div>
    </>
  );
}
