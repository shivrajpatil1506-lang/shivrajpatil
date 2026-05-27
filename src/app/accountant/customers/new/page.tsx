import CustomerForm from "@/components/shared/CustomerForm";

export default function AccountantAddCustomerPage() {
  return <CustomerForm role="accountant" backHref="/accountant/customers" successRedirect="/accountant/customers" />;
}
