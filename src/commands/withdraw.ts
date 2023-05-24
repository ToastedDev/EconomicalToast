import { ApplyOptions } from "@sapphire/decorators";
import type { Args } from "@sapphire/framework";
import { Command } from "@sapphire/framework";
import type { MessagePayload } from "discord.js";
import { EmbedBuilder, Message, type InteractionReplyOptions, type MessageReplyOptions } from "discord.js";
import { colors, currency, currencyName } from "~/consts";
import { db } from "~/lib/db";
import { getGuildId } from "~/lib/utils/getGuildId";
import { unabbreviate } from "~/lib/utils/unabbreviate";

@ApplyOptions<Command.Options>({
  description: `Withdraw some ${currencyName} into your wallet.`,
  aliases: ["with"]
})
export class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addStringOption((option) =>
            option.setName("amount").setDescription(`The amount of ${currencyName} to withdraw into your wallet.`).setRequired(true)
          ),
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
    const user = interactionOrMessage instanceof Message ? interactionOrMessage.author : interactionOrMessage.user;

    const amount = interactionOrMessage instanceof Message ? await args!.pick("string") : interactionOrMessage.options.getString("amount", true);

    const reply = (options: string | MessagePayload | InteractionReplyOptions) => {
      if (interactionOrMessage instanceof Message) {
        return interactionOrMessage.channel.send(options as string | MessagePayload | MessageReplyOptions);
      }

      return interactionOrMessage.reply(options);
    };

    let data = await db.user.findFirst({
      where: {
        id: user.id
      }
    });

    if (!data)
      return reply({
        embeds: [new EmbedBuilder().setDescription(`You don't have enough ${currencyName} in your bank account.`).setColor(colors.danger)]
      });

    let amountTransferred = 0;
    if (amount === "all") {
      await db.user.update({
        where: {
          id: user.id
        },
        data: {
          wallet: {
            increment: data.bank
          },
          bank: {
            decrement: data.bank
          }
        }
      });
      amountTransferred = data.bank;
    } else {
      const amountNum = unabbreviate(amount);
      if (isNaN(amountNum) || amountNum % 1 != 0 || amountNum <= 0)
        return reply({
          embeds: [new EmbedBuilder().setDescription('The amount must be a whole number, or "all".').setColor(colors.danger)]
        });
      if (data.bank < amountNum)
        return reply({
          embeds: [new EmbedBuilder().setDescription(`You don't have enough ${currencyName} in your bank account.`).setColor(colors.danger)]
        });

      await db.user.update({
        where: {
          id: user.id
        },
        data: {
          wallet: {
            increment: amountNum
          },
          bank: {
            decrement: amountNum
          }
        }
      });
      amountTransferred = amountNum;
    }

    data = await db.user.findFirst({
      where: {
        id: user.id
      }
    });

    return reply({
      embeds: [
        new EmbedBuilder()
          .addFields(
            {
              name: "Withdrew",
              value: `${currency}${amountTransferred.toLocaleString()}`
            },
            {
              name: "Wallet Balance",
              value: `${currency}${data!.wallet.toLocaleString()}`,
              inline: true
            },
            {
              name: "Bank Balance",
              value: `${currency}${data!.bank.toLocaleString()}`,
              inline: true
            }
          )
          .setColor(colors.primary)
      ]
    });
  }
}
