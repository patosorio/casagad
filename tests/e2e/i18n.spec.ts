import { expect, test } from "@playwright/test";

const query = "from=2026-07-01";
const hash = "dates";

test("language switch keeps the page, query string, and hash", async ({ page }) => {
  await page.goto(`/la-casa/?${query}#${hash}`);

  const toEnglish = page.getByRole("link", { name: "English" });
  await expect(toEnglish).toHaveAttribute("href", `/en/the-house/?${query}#${hash}`);
  await toEnglish.click();
  await expect(page).toHaveURL(`/en/the-house/?${query}#${hash}`);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  const toItalian = page.getByRole("link", { name: "Italiano" });
  await expect(toItalian).toHaveAttribute("href", `/la-casa/?${query}#${hash}`);
  await toItalian.click();
  await expect(page).toHaveURL(`/la-casa/?${query}#${hash}`);
  await expect(page.locator("html")).toHaveAttribute("lang", "it");
});

test("language switch from a 404 stays on that unknown page", async ({ page }) => {
  const response = await page.goto(`/xyz/?${query}#${hash}`);
  expect(response?.status()).toBe(404);
  await expect(page.locator("html")).toHaveAttribute("lang", "it");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Questa pagina non c'è");

  const toEnglish = page.getByRole("link", { name: "English" });
  await expect(toEnglish).toHaveAttribute("href", `/en/xyz/?${query}#${hash}`);
  await toEnglish.click();
  await expect(page).toHaveURL(`/en/xyz/?${query}#${hash}`);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This page doesn't exist");

  const toItalian = page.getByRole("link", { name: "Italiano" });
  await expect(toItalian).toHaveAttribute("href", `/xyz/?${query}#${hash}`);
  await toItalian.click();
  await expect(page).toHaveURL(`/xyz/?${query}#${hash}`);
  await expect(page.locator("html")).toHaveAttribute("lang", "it");
});

test("unknown URLs return a localized 404 in the first HTML", async ({ page }) => {
  const italian = await page.goto("/xyz/");
  expect(italian?.status()).toBe(404);
  await expect(page.locator("html")).toHaveAttribute("lang", "it");
  await expect(page.locator("html")).not.toHaveAttribute("id", "__next_error__");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Questa pagina non c");

  const english = await page.goto("/en/xyz/");
  expect(english?.status()).toBe(404);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).not.toHaveAttribute("id", "__next_error__");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("This page doesn");
});
