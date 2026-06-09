import { getCustomers } from "@/app/actions/customers";
import { CustomersClient, FlattenedCustomer } from "./client";

export default async function AccountantCustomersPage() {
  const data = await getCustomers();
  
  const flat: FlattenedCustomer[] = data.flatMap(c => {
    const fullName = [c.first_name, c.middle_name, c.last_name].filter(Boolean).join(" ");
    
    if ((c as any).purchases && (c as any).purchases.length > 0) {
      return (c as any).purchases.map((p: any) => {
        const received = ((c as any).transactions || []).reduce((sum: number, t: any) => sum + t.amount, 0);
        const total = p.total_agreement_value || 0;
        return {
          id: c.id,
          purchase_id: p.id,
          full_name: fullName,
          mobile_1: c.mobile_1,
          site_name: p.site?.name || "N/A",
          property_type: p.unit?.property_type || "N/A",
          unit_number: p.unit?.unit_number || "N/A",
          total_amount: total,
          received_amount: received,
          pending_amount: Math.max(0, total - received),
          payment_status: p.status,
        };
      });
    } else {
      return [{
        id: c.id, purchase_id: null, full_name: fullName, mobile_1: c.mobile_1,
        site_name: "—", property_type: "—", unit_number: "—",
        total_amount: 0, received_amount: 0, pending_amount: 0,
        payment_status: "active",
      }];
    }
  });

  return <CustomersClient initialData={flat} />;
}
