import { absoluteUrl } from "@/lib/seo/metadata";
import { bedrooms, maxGuests, stayTimes } from "@/lib/content/house";

export type JsonLdNode = Record<string, unknown>;

export function breadcrumbLd(items: readonly { name: string; path: string }[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * Address and geo stay off until they are confirmed.
 * No self-published review stars.
 */
export function vacationRentalLd(input: {
  name: string;
  description: string;
  path: string;
  images: readonly string[];
  amenities: readonly string[];
}): JsonLdNode {
  return {
    "@type": "VacationRental",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    image: input.images.map((path) => absoluteUrl(path)),
    checkinTime: stayTimes.checkIn,
    checkoutTime: stayTimes.checkOut,
    numberOfRooms: bedrooms,
    numberOfBedrooms: bedrooms,
    occupancy: { "@type": "QuantitativeValue", maxValue: maxGuests },
    petsAllowed: true,
    amenityFeature: input.amenities.map((name) => ({
      "@type": "LocationFeatureSpecification",
      name,
      value: true,
    })),
  };
}

export function faqLd(items: readonly { question: string; answer: string }[]): JsonLdNode | null {
  const answered = items.filter((item) => item.question.trim() !== "" && item.answer.trim() !== "");
  if (answered.length === 0) return null;
  return {
    "@type": "FAQPage",
    mainEntity: answered.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function jsonLdGraph(nodes: readonly (JsonLdNode | null)[]): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.filter((node): node is JsonLdNode => node !== null),
  };
}

export function jsonLdPayload(data: JsonLdNode): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
