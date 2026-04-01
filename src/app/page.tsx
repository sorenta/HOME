import { RequireAuth } from "@/components/auth/require-auth";
import { BentoDashboard } from "@/components/dashboard/bento-dashboard";

export default function Home() {
  return (
    <RequireAuth compact={false}>
      <BentoDashboard />
    </RequireAuth>
  );
}
