import { getApprovals } from "@/app/actions/approvals";
import { ApprovalsClient } from "./client";

export default async function ApprovalsPage() {
  const approvals = await getApprovals();
  return <ApprovalsClient initialApprovals={approvals} />;
}
