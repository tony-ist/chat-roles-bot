import { Context } from 'telegraf';
import { saveOrUpdateUser } from '../db';

const rememberUser = async (ctx: Context, next: () => any): Promise<void> => {
  await saveOrUpdateUser(ctx.from);

  await next();
};

export default rememberUser;
