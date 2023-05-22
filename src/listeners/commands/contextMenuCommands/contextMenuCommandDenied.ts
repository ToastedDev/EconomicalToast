import type { ContextMenuCommandDeniedPayload, Events, UserError } from "@sapphire/framework";
import { Listener } from "@sapphire/framework";

export class UserEvent extends Listener<typeof Events.ContextMenuCommandDenied> {
  public async run({ context, message: content }: UserError, { interaction }: ContextMenuCommandDeniedPayload) {
    if (Reflect.get(Object(context), "silent")) return;

    if (interaction.deferred || interaction.replied) {
      return interaction.editReply({
        content,
        allowedMentions: { users: [interaction.user.id], roles: [] }
      });
    }

    return interaction.reply({
      content,
      allowedMentions: { users: [interaction.user.id], roles: [] },
      ephemeral: true
    });
  }
}
