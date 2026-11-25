import { jsonLdPayload, type JsonLdNode } from "@/lib/seo/jsonld";

export function JsonLd({ data }: { data: JsonLdNode }) {
  return <script type="application/ld+json">{jsonLdPayload(data)}</script>;
}
