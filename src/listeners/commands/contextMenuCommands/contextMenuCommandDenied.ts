import type { ContextMenuCommandDeniedPayload, Events, UserError } from "@sapphire/framework";
import { Listener } from "@sapphire/framework";
import { EmbedBuilder } from "discord.js";
import { colors } from "~/consts";

export class UserEvent extends Listener<typeof Events.ContextMenuCommandDenied> {
  public async run({ context, message: content }: UserError, { interaction }: ContextMenuCommandDeniedPayload) {
    if (Reflect.get(Object(context), "silent")) return;

    if (interaction.deferred || interaction.replied) {
      return interaction.editReply({
        embeds: [new EmbedBuilder().setDescription(content).setColor(colors.danger)],
        allowedMentions: { users: [interaction.user.id], roles: [] }
      });
    }

    return interaction.reply({
      embeds: [new EmbedBuilder().setDescription(content).setColor(colors.danger)],
      allowedMentions: { users: [interaction.user.id], roles: [] },
      ephemeral: true
    });
  }
}
