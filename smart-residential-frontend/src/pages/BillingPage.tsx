import { CreditCard } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function BillingPage() {
  return (
    <div>
      <PageHeader
        title="Billing"
        description="This area will be activated when your company connects the finance module."
      />
      <EmptyState
        icon={<CreditCard className="h-10 w-10" />}
        title="Coming soon"
        description="The payments module is not active yet. When it is ready, invoices and history will appear here."
      />
    </div>
  );
}
