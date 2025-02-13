import { Context, Markup } from 'telegraf';
import { Message } from 'typegram';

import { getChatRoles, getUserIdsAndUsernamesFromRole } from '../db';
import { getRoleReplyCodes } from '../reply_codes';

function escapeUnderscores(str: string): string {
  return str.replace(/_/g, '\\_');
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
        const pings: string[] = [];
        for (const id in res) {
          pings.push(`@${res[id]}`);
        }
        // TODO: Split into chunks by 5 pings
        const reply = `${role}: ${pings.join(' ')}`;
        await ctx.reply(escapeUnderscores(reply), { parse_mode: 'Markdown' });
      }
    })
    .catch((err) => {
      throw new Error(err);
    });
};

export default ping;
