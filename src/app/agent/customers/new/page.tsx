import CustomerForm from "@/components/shared/CustomerForm";

export default function AgentAddCustomerPage() {
  return <CustomerForm role="agent" backHref="/agent/customers" successRedirect="/agent/customers" />;
}
