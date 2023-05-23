import { ApplyOptions } from "@sapphire/decorators";
import type { Events } from "@sapphire/framework";
import { Listener } from "@sapphire/framework";

@ApplyOptions<Listener.Options>({
  event: "shardReady"
})
export class UserEvent extends Listener<typeof Events.ShardReady> {
  public run(shardId: number) {
    this.container.client.logger.info(`Launched shard #${shardId}.`);
  }
}
