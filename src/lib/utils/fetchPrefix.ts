import type { Message } from "discord.js";
import { prefix } from "~/consts";
import { db } from "../db";

export async function fetchPrefix(message: Message) {
  const guild = await db.guild.findFirst({
    where: {
      id: message.guild!.id
    }
  });
  return guild?.prefix ?? prefix;
}
