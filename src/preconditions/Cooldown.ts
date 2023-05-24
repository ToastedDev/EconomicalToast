import type { AllFlowsPrecondition, BucketScope, Command } from "@sapphire/framework";
import { Precondition } from "@sapphire/framework";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { ChatInputCommandInteraction, Message, Snowflake } from "discord.js";

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
    const ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(1, `${context.delay! / 1000} s`),
      prefix: "economicaltoast"
    });
    const { success, reset } = await ratelimit.limit(`${userId}:${command.name}`);
    if (!success)
      return this.error({
        message: `Calm down there son, you're on cooldown! Try again <t:${(reset / 1000).toFixed(0)}:R>.`
      });
    else return this.ok();
  }
}
