import { getCurrentUser } from "@/lib/auth";
import { getTasks } from "@/app/actions/tasks";
import { getEmployees } from "@/app/actions/employees";
import MyWorkClient from "@/components/features/MyWorkClient";

export default async function MyWorkPage() {
  const user = await getCurrentUser();
  const tasks = await getTasks();
  const employees = await getEmployees();

  const isAdminOrHR = user?.role === "admin" || user?.role === "hr";

  return (
    <MyWorkClient 
      initialTasks={tasks} 
      employees={employees} 
      isAdminOrHR={isAdminOrHR} 
      currentUserId={user?.employee_id || ""} 
    />
  );
}
