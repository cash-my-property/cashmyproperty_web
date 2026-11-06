import { Suspense } from "react";
import TransactionsClient from "@/components/transactions/TransactionsClient";

// CMP Connect GET /transactions (backend 3a443ea). Metadata: transactions/layout.tsx
export default function TransactionsPage() {
  return (
    <Suspense>
      <TransactionsClient />
    </Suspense>
  );
}
