import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import type { MessagePayload } from "discord.js";
import { EmbedBuilder, Message, type InteractionReplyOptions, type MessageReplyOptions } from "discord.js";
import { colors, currency } from "~/consts";
import { db } from "~/lib/db";
import { getGuildId } from "~/lib/utils/getGuildId";

@ApplyOptions<Command.Options>({
  description: "View someone's balance.",
  aliases: ["bal"]
})
export class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addUserOption((option) => option.setName("user").setDescription("The user to view the balance of.")),
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
    const user =
			interactionOrMessage instanceof Message
			  ? interactionOrMessage.mentions.users?.first() || interactionOrMessage.author
			  : interactionOrMessage.options.getUser("user") || interactionOrMessage.user;

    let data = await db.user.findFirst({
      where: {
        id: user.id
      }
    });

    if (!data)
      data = await db.user.create({
        data: {
          id: user.id
        }
      });

    const reply = (options: string | MessagePayload | InteractionReplyOptions) => {
      if (interactionOrMessage instanceof Message) {
        return interactionOrMessage.channel.send(options as string | MessagePayload | MessageReplyOptions);
      }

      return interactionOrMessage.reply(options);
    };

    return reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: user.tag,
            iconURL: user.displayAvatarURL()
          })
          .setDescription(
            [`**Wallet**: ${currency}${data.wallet.toLocaleString()}`, `**Bank**: ${currency}${data.bank.toLocaleString()}`].join("\n")
          )
          .setColor(colors.primary)
      ]
    });
  }
}
