import { CreditCard } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function BillingPage() {
  return (
    <div>
      <PageHeader
        title="Pagesa dhe faturimi"
        description="Kjo pjesë do të aktivizohet kur kompania juaj të lidhë modulin financiar në sistem."
      />
      <EmptyState
        icon={<CreditCard className="h-10 w-10" />}
        title="Së shpejti"
        description="Moduli i pagesave nuk është aktiv ende. Kur të jetë gati, këtu do të shfaqen faturat dhe historiku."
      />
    </div>
  );
}
