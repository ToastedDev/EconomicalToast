import { ApplyOptions } from "@sapphire/decorators";
import type { Events } from "@sapphire/framework";
import { Listener } from "@sapphire/framework";
import { EmbedBuilder, type Message } from "discord.js";
import { colors, currency, droppedAmount } from "~/consts";
import { db } from "~/lib/db";
import { random } from "~/lib/utils/random";

@ApplyOptions<Listener.Options>({
  event: "messageCreate"
})
export class UserEvent extends Listener<typeof Events.MessageCreate> {
  public async run(message: Message) {
    if (!message.inGuild() || message.author.bot) return;

    const data = await db.guild.findFirst({
      where: {
        id: message.guild.id
      }
    });
    const maxChance = 10;
    const chance = random(1, maxChance);
    this.container.client.logger.debug("Dropped chance:", chance);

    if (chance === maxChance) {
      if (data && data.dropped) return;
      message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setDescription(`It seems like someone has dropped ${currency}${droppedAmount}. Pick it up by typing \`.pickup\`!`)
            .setColor(colors.primary)
        ]
      });

      await db.guild.upsert({
        where: {
          id: message.guild.id
        },
        create: {
          id: message.guild.id,
          dropped: true
        },
        update: {
          dropped: true
        }
      });
    }
  }
}
