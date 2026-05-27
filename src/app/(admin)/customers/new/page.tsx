import CustomerForm from "@/components/shared/CustomerForm";

export default function AdminAddCustomerPage() {
  return <CustomerForm role="admin" backHref="/customers" successRedirect="/customers" />;
}
