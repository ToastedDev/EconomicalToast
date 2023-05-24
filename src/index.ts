import "~/lib/setup";

import { LogLevel, SapphireClient } from "@sapphire/framework";
import { ActivityType, GatewayIntentBits } from "discord.js";
import { fetchPrefix } from "./lib/utils/fetchPrefix";

const client = new SapphireClient({
  fetchPrefix,
  caseInsensitiveCommands: true,
  logger: {
    level: LogLevel.Debug
  },
  intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
  loadMessageCommandListeners: true,
  presence: {
    activities: [
      {
        name: "with money",
        type: ActivityType.Playing
      }
    ]
  },
  shards: "auto",
  defaultCooldown: {
    delay: 10000
  }
});

const main = async () => {
  try {
    client.logger.info("Logging in...");
    await client.login();
  } catch (error) {
    client.logger.fatal(error);
    client.destroy();
    process.exit(1);
  }
};

main();
