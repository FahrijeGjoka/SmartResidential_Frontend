import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="max-w-md text-center">
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-secondary">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600">The route does not exist in this SPA shell.</p>
        <Link to="/">
          <Button className="mt-6">Back home</Button>
        </Link>
      </Card>
    </div>
  );
}
