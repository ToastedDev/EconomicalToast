import { ApplyOptions } from "@sapphire/decorators";
import type { Args } from "@sapphire/framework";
import { Command } from "@sapphire/framework";
import type { MessagePayload } from "discord.js";
import { EmbedBuilder, Message, PermissionFlagsBits, type InteractionReplyOptions, type MessageReplyOptions } from "discord.js";
import { colors } from "~/consts";
import { db } from "~/lib/db";
import { getGuildId } from "~/lib/utils/getGuildId";

@ApplyOptions<Command.Options>({
  description: "Change the prefix for this server.",
  requiredUserPermissions: ["ManageGuild"]
})
export class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addUserOption((option) =>
            option.setName("new_prefix").setDescription("The new prefix to use for this server.").setRequired(true)
          )
          .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
      {
        guildIds: getGuildId()
      }
    );
  }

  public async messageRun(message: Message, args: Args) {
    return this.respond(message, args);
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    return this.respond(interaction);
  }

  private async respond(interactionOrMessage: Message | Command.ChatInputCommandInteraction, args?: Args) {
    const newPrefix =
			interactionOrMessage instanceof Message
			  ? await args!.pick("string").catch(() => undefined)
			  : interactionOrMessage.options.getString("new_prefix", true);

    const reply = (options: string | MessagePayload | InteractionReplyOptions) => {
      if (interactionOrMessage instanceof Message) {
        return interactionOrMessage.channel.send(options as string | MessagePayload | MessageReplyOptions);
      }

      return interactionOrMessage.reply(options);
    };

    if (!newPrefix)
      return reply({
        embeds: [new EmbedBuilder().setDescription("You need to specify a new prefix.").setColor(colors.danger)],
        ephemeral: true
      });

    if (newPrefix.length > 5)
      return reply({
        embeds: [new EmbedBuilder().setDescription("Prefix has to be less than 5 characters long.").setColor(colors.danger)],
        ephemeral: true
      });

    await db.guild.upsert({
      where: {
        id: interactionOrMessage.guild!.id
      },
      create: {
        id: interactionOrMessage.guild!.id,
        prefix: newPrefix
      },
      update: {
        prefix: newPrefix
      }
    });

    return reply({
      embeds: [new EmbedBuilder().setDescription(`Set prefix to \`${newPrefix}\`!`).setColor(colors.success)],
      ephemeral: true
    });
  }
}
