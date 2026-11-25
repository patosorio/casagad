import { expect, test } from "@playwright/test";

const pages = [
  { it: "/", en: "/en/", itH1: "Casa vacanze sulla spiaggia di Simius, a Villasimius", enH1: "Holiday house on Simius beach, Villasimius" },
  { it: "/la-casa/", en: "/en/the-house/", itH1: "La casa: tre camere, terrazza e giardino", enH1: "The house: three bedrooms, terrace and garden" },
  { it: "/foto/", en: "/en/photos/", itH1: "Foto della casa e della spiaggia di Simius", enH1: "Photos of the house and Simius beach" },
  { it: "/dove-siamo/", en: "/en/location/", itH1: "Dove siamo: Simius, Villasimius, Sardegna", enH1: "Location: Simius, Villasimius, Sardinia" },
  { it: "/prenota/", en: "/en/book/", itH1: "Verifica la disponibilità e prenota", enH1: "Check availability and book" },
  { it: "/informazioni/", en: "/en/good-to-know/", itH1: "Informazioni utili per il soggiorno", enH1: "Good to know before you stay" },
  { it: "/contatti/", en: "/en/contact/", itH1: "Contatti", enH1: "Contact" },
  { it: "/privacy/", en: "/en/privacy/", itH1: "Privacy", enH1: "Privacy" },
  { it: "/cookie/", en: "/en/cookies/", itH1: "Cookie", enH1: "Cookies" },
] as const;

test.use({ viewport: { width: 390, height: 844 } });

for (const entry of pages) {
  test(`${entry.it} loads in Italian and English`, async ({ page }) => {
    const csp: string[] = [];
    page.on("console", (message) => {
      if (/content security policy/i.test(message.text())) csp.push(message.text());
    });
    page.on("request", (request) => {
      if (request.url().includes("/api/csp-report")) csp.push(request.url());
    });

    const italian = await page.goto(entry.it);
    expect(italian?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "it");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(entry.itH1);

    await page.getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL(entry.en);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(entry.enH1);
    expect(csp).toEqual([]);
  });
}

test("unknown nested house URLs are localized 404s", async ({ page }) => {
  const italian = await page.goto("/la-casa/xyz/");
  expect(italian?.status()).toBe(404);
  await expect(page.locator("html")).toHaveAttribute("lang", "it");
  await expect(page.locator("html")).not.toHaveAttribute("id", "__next_error__");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Questa pagina non c'è");

  const english = await page.goto("/en/the-house/xyz/");
  expect(english?.status()).toBe(404);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).not.toHaveAttribute("id", "__next_error__");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This page doesn't exist");
});
