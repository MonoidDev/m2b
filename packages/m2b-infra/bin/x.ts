#!/usr/bin/env tsx

import { spawn } from "child_process";
import { existsSync } from "fs";
import { dirname, join } from "path";

import { config } from "dotenv";
import { match, P } from "ts-pattern";

import { EnvName } from "#index.ts";

process.argv[2] = process.argv[2].toUpperCase();

match(process.argv.slice(2))
  .with(
    [P.union(...EnvName.options), P.string, ...P.array()],
    ([env, command, ...passedArgs]) => {
      const envFileName = `.env.${env.toLowerCase()}`;

      let searchingDir = process.cwd();

      while (true) {
        const tryPath = join(searchingDir, envFileName);
        if (existsSync(tryPath)) {
          console.info(
            `\u001b[31m>\u001b[0m env: \u001b[38;2;145;231;255m${tryPath}\u001b[0m`,
          );
          config({ path: tryPath });
          break;
        }
        const nextDir = dirname(searchingDir);
        if (nextDir === searchingDir) {
          console.error(`Could not find ${envFileName} from ${process.cwd()}`);
          process.exit(1);
        }
        searchingDir = nextDir;
      }

      const child = spawn(command, passedArgs, {
        stdio: "inherit",
      }).on("exit", function (exitCode, signal) {
        if (typeof exitCode === "number") {
          process.exit(exitCode);
        } else {
          process.kill(process.pid, signal ?? undefined);
        }
      });

      for (const signal of [
        "SIGINT",
        "SIGTERM",
        "SIGPIPE",
        "SIGHUP",
        "SIGBREAK",
        "SIGWINCH",
        "SIGUSR1",
        "SIGUSR2",
      ] as const) {
        process.on(signal, function () {
          child.kill(signal);
        });
      }
    },
  )
  .otherwise(() => {
    console.info(
      `Usage: x <${EnvName.options.join("|")}> <command> [passedArgs...]`,
    );
    process.exit(1);
  });
