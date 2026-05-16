import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const identifier = params.get("identifier") || "";
  const token = params.get("token") || "";
  const [status, setStatus] = useState<"loading" | "ok" | "err">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!identifier || !token) {
      setStatus("err");
      setMessage("Missing identifier or token in URL.");
      return;
    }
    localStorage.setItem("sr_tenant_identifier", identifier);
    api
      .get<string>("/api/auth/verify", { params: { identifier, token } })
      .then((r) => {
        setMessage(r.data);
        setStatus("ok");
      })
      .catch(() => {
        setStatus("err");
        setMessage("Verification failed. The link may be expired or already used.");
      });
  }, [identifier, token]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-md text-center">
        {status === "loading" ? (
          <div className="flex flex-col items-center py-8">
            <Spinner />
            <p className="mt-4 text-sm text-slate-600">Confirming your email...</p>
          </div>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-secondary">
              {status === "ok" ? "You are verified" : "Verification issue"}
            </h1>
            <p className="mt-2 text-sm text-slate-600">{message}</p>
            <Link className="mt-6 inline-block text-sm font-medium text-primary hover:underline" to="/login">
              Continue to sign in
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}
