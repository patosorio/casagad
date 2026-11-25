import type admin from "../../locales/it/admin.json";
import type booking from "../../locales/it/booking.json";
import type common from "../../locales/it/common.json";
import type errors from "../../locales/it/errors.json";
import type site from "../../locales/it/site.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    returnNull: false;
    resources: {
      common: typeof common;
      site: typeof site;
      booking: typeof booking;
      errors: typeof errors;
      admin: typeof admin;
    };
  }
}
