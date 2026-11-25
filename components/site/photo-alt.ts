import type { TFunction } from "i18next";
import type { ImageId } from "@/lib/content/photos";

export function photoAlt(t: TFunction<"site">, id: ImageId): string {
  switch (id) {
    case "0745":
      return t("alts.0745");
    case "0746":
      return t("alts.0746");
    case "0747":
      return t("alts.0747");
    case "0748":
      return t("alts.0748");
    case "0749":
      return t("alts.0749");
    case "0752":
      return t("alts.0752");
    case "0754":
      return t("alts.0754");
    case "0756":
      return t("alts.0756");
    case "0757":
      return t("alts.0757");
    case "0758":
      return t("alts.0758");
    case "0759":
      return t("alts.0759");
    case "0760":
      return t("alts.0760");
    case "0761":
      return t("alts.0761");
    case "0763":
      return t("alts.0763");
    case "0765":
      return t("alts.0765");
    case "0767":
      return t("alts.0767");
    case "0768":
      return t("alts.0768");
    case "0769":
      return t("alts.0769");
    case "0770":
      return t("alts.0770");
    case "0772":
      return t("alts.0772");
    case "0773":
      return t("alts.0773");
    case "0774":
      return t("alts.0774");
    case "0775":
      return t("alts.0775");
  }
}
