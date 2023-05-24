import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import type { MessagePayload } from "discord.js";
import { EmbedBuilder, Message, type InteractionReplyOptions, type MessageReplyOptions } from "discord.js";
import ms from "ms";
import { colors, currency, currencyName, rewards } from "~/consts";
import { db } from "~/lib/db";
import { getGuildId } from "~/lib/utils/getGuildId";

@ApplyOptions<Command.Options>({
  description: `Recieve your daily amount of ${currencyName}.`,
  cooldownDelay: ms("1d")
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

    await db.user.upsert({
      where: {
        id: user.id
      },
      create: {
        id: user.id,
        wallet: rewards.daily
      },
      update: {
        wallet: {
          increment: rewards.daily
        }
      }
    });

    const reply = (options: string | MessagePayload | InteractionReplyOptions) => {
      if (interactionOrMessage instanceof Message) {
        return interactionOrMessage.channel.send(options as string | MessagePayload | MessageReplyOptions);
      }

      return interactionOrMessage.reply(options);
    };

    return reply({
      embeds: [new EmbedBuilder().setDescription(`You have recieved ${currency}${rewards.daily.toLocaleString()}!`).setColor(colors.primary)]
    });
  }
}
