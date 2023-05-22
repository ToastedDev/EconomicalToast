import type { Events, MessageCommandDeniedPayload } from "@sapphire/framework";
import { Listener, type UserError } from "@sapphire/framework";

export class UserEvent extends Listener<typeof Events.MessageCommandDenied> {
  public async run({ context, message: content }: UserError, { message }: MessageCommandDeniedPayload) {
    if (Reflect.get(Object(context), "silent")) return;

    return message.reply({ content, allowedMentions: { users: [message.author.id], roles: [] } });
  }
}
