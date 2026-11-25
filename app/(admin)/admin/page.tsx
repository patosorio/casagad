import type { Metadata } from "next";
import { Container } from "@/components/site/Container";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("it", "admin");
  return { title: t("dashboard.h1") };
}

export default async function AdminHomePage() {
  const t = await getT("it", "admin");
  return (
    <Container className="py-14">
      <h1>{t("dashboard.h1")}</h1>
    </Container>
  );
}
