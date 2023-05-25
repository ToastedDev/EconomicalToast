export const prefix = ".";

export const currency = "<:ButteredToast:1109844237056487505> ";
export const currencyName = "toast";

export const rewards = {
  dropped: 10,
  daily: 5000,
  weekly: 10000
};

import type { ColorResolvable } from "discord.js";
export const colors: Record<"primary" | "success" | "danger", ColorResolvable> = {
  primary: "Orange",
  success: "Green",
  danger: "Red"
};

import { join } from "path";

export const rootDir = join(__dirname, "..", "..");
export const srcDir = join(rootDir, "src");
