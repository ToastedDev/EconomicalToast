import type { Events } from "@sapphire/framework";
import { Listener } from "@sapphire/framework";
import { EmbedBuilder, type Message } from "discord.js";
import { colors } from "~/consts";

export class UserEvent extends Listener<typeof Events.MentionPrefixOnly> {
  public async run(message: Message) {
    const prefix = await this.container.client.fetchPrefix(message);
    return message.channel.send({
      embeds: [new EmbedBuilder().setDescription(`My prefix in this guild is: \`${prefix}\`.`).setColor(colors.primary)]
    });
  }
}
