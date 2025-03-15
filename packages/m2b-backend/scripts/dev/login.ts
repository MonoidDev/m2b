import { withAuthPassword } from "./client";

(async () => {
  await withAuthPassword(
    { email: "49445013@qq.ccom", password: "password" },
    async (client) => {
      await client.auth.getCurrentUser.query();
    },
  );
})();
