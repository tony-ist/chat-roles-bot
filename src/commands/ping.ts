import { Context, Markup } from 'telegraf';
import { Message } from 'typegram';

import { getChatRoles, getUserIdsAndUsernamesFromRole } from '../db';
import { getRoleReplyCodes } from '../reply_codes';

function escapeUnderscores(str: string): string {
  return str.replace(/_/g, '\\_');
}

function splitInChunks(strings: string[], chunkSize: number): string[][] {
  const chunks = [];
  for (let i = 0; i < strings.length; i += chunkSize) {
    chunks.push(strings.slice(i, i + chunkSize));
  }
  return chunks;
}

const ping = async (ctx: Context): Promise<void> => {
  const chatId: number = ctx.chat.id;
  let role: string;

  if (ctx.state.roleChosen) {
    role = ctx.state.roleChosen;
    await ctx.deleteMessage();
  } else {
    const args: string[] = (ctx.message as Message.TextMessage).text.split(' ');
    role = args[1];
  }

  if (!role) {
    const buttons = [];
    const roles = await getChatRoles(chatId);

    for (const roleToPing of roles) {
      buttons.push([Markup.button.callback(roleToPing, `ping-${roleToPing}`)]);
    }

    await ctx.reply('Choose a role to ping', Markup.inlineKeyboard(buttons));
    return;
  }

  await getUserIdsAndUsernamesFromRole(role, chatId)
    .then(async (res: string | Object) => {
      if (res === getRoleReplyCodes.COLLECTION_EMPTY
        || res === getRoleReplyCodes.ROLE_DOES_NOT_EXIST) {
        ctx.state.reply_code = res;
        return;
      }

      if (typeof res === 'object') {
        // Telegram does not ping people if there are more than 5 mentions in a message
        const chunks = splitInChunks(Object.keys(res), 5);

        for (const ids of chunks) {
          const reply = `${role}: ${ids.map((id) => `@${res[id]}`).join(' ')}`;
          await ctx.reply(escapeUnderscores(reply), { parse_mode: 'Markdown' });
        }
      }
    })
    .catch((err) => {
      throw new Error(err);
    });
};

export default ping;
