import { redirect } from "next/navigation";

type OrderCompletePageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function OrderCompletePage({ searchParams }: OrderCompletePageProps) {
  const params = new URLSearchParams();

  // Preserve Stripe query parameters when forwarding to the success page.
  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.filter((v): v is string => typeof v === "string").forEach((entry) => {
        params.append(key, entry);
      });
      return;
    }

    if (typeof value === "string" && value.length > 0) {
      params.append(key, value);
    }
  });

  if (!params.has("from")) {
    params.append("from", "order-complete");
  }

  const query = params.toString();

  redirect(`/success${query ? `?${query}` : ""}`);
}
