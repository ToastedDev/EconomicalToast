import { ApplicationCommandRegistries, RegisterBehavior } from "@sapphire/framework";
import "@sapphire/plugin-logger/register";
import { setup } from "@skyra/env-utilities";
import * as colorette from "colorette";
import { join } from "node:path";
import { rootDir } from "~/consts";

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

setup({ path: join(rootDir, ".env") });

import "./env";

colorette.createColors({ useColor: true });
