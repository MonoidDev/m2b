import { db } from "#db/index.ts";
import { AuthService } from "#services/AuthService.ts";

(async () => {
  const auth = new AuthService();

  console.info(
    await auth.createUser({
      email: "49445013@qq.ccom",
      password: "password",
    }),
  );

  await db.$client.end();
})();
