import type { AllFlowsPrecondition, BucketScope, Command } from "@sapphire/framework";
import { Precondition } from "@sapphire/framework";
import type { ChatInputCommandInteraction, Message, Snowflake } from "discord.js";
import { db } from "~/lib/db";

export interface CooldownPreconditionContext extends AllFlowsPrecondition.Context {
	scope?: BucketScope;
	delay: number;
	limit?: number;
	filteredUsers?: Snowflake[];
}

export class UserPrecondition extends Precondition {
  public override messageRun(message: Message, command: Command, context: CooldownPreconditionContext): AllFlowsPrecondition.Result {
    return this.ratelimit(message.author.id, command, context);
  }

  public override chatInputRun(
    interaction: ChatInputCommandInteraction,
    command: Command,
    context: CooldownPreconditionContext
  ): AllFlowsPrecondition.Result {
    return this.ratelimit(interaction.user.id, command, context);
  }

  private async ratelimit(userId: string, command: Command, context: CooldownPreconditionContext): AllFlowsPrecondition.AsyncResult {
    const data = await db.cooldown.findFirst({
      where: {
        userId,
        command: command.name
      }
    });
    if (data && data.expiresAt.getTime() < Date.now() + context.delay)
      return this.error({
        message: `Calm down son, you're on cooldown! Try again <t:${(data.expiresAt.getTime() / 1000).toFixed(0)}:R>.`
      });
    else {
      if (data)
        await db.cooldown.delete({
          where: {
            id: data.id
          }
        });

      await db.cooldown.create({
        data: {
          userId,
          command: command.name,
          expiresAt: new Date(Date.now() + context.delay)
        }
      });

      return this.ok();
    }
  }
}
