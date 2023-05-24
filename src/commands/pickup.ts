import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import type { MessagePayload } from "discord.js";
import { EmbedBuilder, Message, type InteractionReplyOptions, type MessageReplyOptions } from "discord.js";
import { colors, currency, currencyName, rewards } from "~/consts";
import { db } from "~/lib/db";
import { getGuildId } from "~/lib/utils/getGuildId";

@ApplyOptions<Command.Options>({
  description: `Pick up ${currencyName} that someone dropped.`
})
export class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      {
        name: this.name,
        description: this.description
      },
      {
        guildIds: getGuildId()
      }
    );
  }

  public async messageRun(message: Message) {
    return this.respond(message);
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    return this.respond(interaction);
  }

  private async respond(interactionOrMessage: Message | Command.ChatInputCommandInteraction) {
    const user = interactionOrMessage instanceof Message ? interactionOrMessage.author : interactionOrMessage.user;

    const reply = (options: string | MessagePayload | InteractionReplyOptions) => {
      if (interactionOrMessage instanceof Message) {
        return interactionOrMessage.channel.send(options as string | MessagePayload | MessageReplyOptions);
      }

      return interactionOrMessage.reply(options);
    };

    const error = () => {
      if (interactionOrMessage instanceof Message) {
        interactionOrMessage.delete();
      } else
        interactionOrMessage.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`No one has dropped any ${currencyName} yet. Make sure to wait for the message I send when someone does!`)
              .setColor(colors.danger)
          ],
          ephemeral: true
        });
    };

    const guild = await db.guild.findFirst({
      where: {
        id: interactionOrMessage.guild!.id
      }
    });
    if (!guild || !guild?.dropped) return error();

    await db.user.upsert({
      where: {
        id: user.id
      },
      create: {
        id: user.id,
        wallet: rewards.dropped
      },
      update: {
        wallet: {
          increment: rewards.dropped
        }
      }
    });

    await db.guild.update({
      where: {
        id: interactionOrMessage.guild!.id
      },
      data: {
        dropped: false
      }
    });

    return reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: user.tag,
            iconURL: user.displayAvatarURL()
          })
          .setDescription(`Picked up ${currency}${rewards.dropped}.`)
          .setColor(colors.primary)
      ]
    });
  }
}
