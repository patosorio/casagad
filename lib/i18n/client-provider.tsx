"use client";

import { createInstance, type Resource, type i18n as I18n } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { useState, type ReactNode } from "react";
import { i18nInitOptions, type Locale, type Namespace } from "@/lib/i18n/config";

type I18nClientProviderProps = {
  locale: Locale;
  namespaces: readonly Namespace[];
  resources: Resource;
  children: ReactNode;
};

function createClientI18n(
  locale: Locale,
  namespaces: readonly Namespace[],
  resources: Resource,
): I18n {
  const instance = createInstance();
  instance.use(initReactI18next);
  void instance.init({
    ...i18nInitOptions(locale, namespaces),
    resources,
  });
  return instance;
}

/**
 * One instance for this island tree, built from the locale and namespaces the
 * server serialised. It is not a process-wide instance and it does not read
 * a locale preference from the browser.
 */
export function I18nClientProvider({
  locale,
  namespaces,
  resources,
  children,
}: I18nClientProviderProps) {
  const [i18n] = useState(() => createClientI18n(locale, namespaces, resources));
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
