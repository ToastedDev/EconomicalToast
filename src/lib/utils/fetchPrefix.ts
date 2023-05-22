import type { Message } from "discord.js";
import { db } from "../db";
import { env } from "../env";

export async function fetchPrefix(message: Message) {
  const guild = await db.guild.findFirst({
    where: {
      id: message.guild!.id
    }
  });
  return guild?.prefix ?? env.PREFIX;
}
