import path from "path";

import { ESLintUtils } from "@typescript-eslint/utils";

import { filePackageJsonPath, tryTsExtensions } from "./module-utils.ts";

const createRule = ESLintUtils.RuleCreator((name) => `todo: ${name}`);

const enforceHashImports = createRule({
  name: "enforce-hash-imports",
  meta: {
    docs: {
      description:
        'Use "#path/to/module.ts instead of relative imports, and a good-enough fixer',
    },
    messages: {
      "enforce-hash-imports":
        'Use "#path/to/module.ts instead of relative imports',
    },
    type: "suggestion",
    schema: [],
    fixable: "code",
  },
  defaultOptions: [],
  create(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        if (!importPath.startsWith("#") && importPath.startsWith(".")) {
          let absPath;
          try {
            absPath = tryTsExtensions(
              path.resolve(
                path.join(path.dirname(context.filename), importPath),
              ),
            );
          } catch {
            return;
          }

          // Exempt checking non-src files
          if (!absPath.includes("/src")) {
            return;
          }

          context.report({
            node,
            messageId: "enforce-hash-imports",
            fix(fixer) {
              /**
               * The fixer assumes only current resolving environment...
               * Introducing the correct resolver is too complicated.
               */
              const packageJson = filePackageJsonPath(context.filename);

              /**
               * Assume the package.json always have `{ imports: { "#*": "./src/*" } }`
               */
              const correctedPath = path.relative(
                path.join(path.dirname(packageJson), "src"),
                absPath,
              );

              return fixer.replaceText(node.source, `"#${correctedPath}"`);
            },
          });
        }
      },
    };
  },
});

const noConsoleLog = createRule({
  name: "no-console-log",
  meta: {
    docs: {
      description: "Forbid `console.log`",
    },
    messages: {
      "no-console-log":
        "`console.log` is forbidden in production. If the message is necessary, use other logging methods",
    },
    type: "suggestion",
    schema: [],
    fixable: "code",
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.object.type === "Identifier" &&
          node.callee.object.name === "console" &&
          node.callee.property.type === "Identifier" &&
          node.callee.property.name === "log"
        ) {
          context.report({
            node,
            messageId: "no-console-log",
            fix(fixer) {
              return fixer.remove(node);
            },
          });
        }
      },
    };
  },
});

export default {
  meta: {
    name: "eslint-plugin-m2b",
    version: "0.0.0",
  },
  rules: {
    "enforce-hash-imports": enforceHashImports,
    "no-console-log": noConsoleLog,
  },
};
