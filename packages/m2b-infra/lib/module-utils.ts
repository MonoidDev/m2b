import fs from "fs";
import path from "path";

export const filePackageJsonPath = (filename: string): string => {
  let packageJsonPath = path.join(path.dirname(filename), "package.json");

  while (!fs.existsSync(packageJsonPath)) {
    const nextDir = path.dirname(path.dirname(packageJsonPath));

    if (nextDir === "/") {
      throw new Error("Could not find package.json");
    }

    packageJsonPath = path.join(nextDir, "package.json");
  }

  return packageJsonPath;
};

export const tryTsExtensions = (filename: string): string => {
  for (const ext of ["", ".ts", ".tsx"]) {
    const filePath = `${filename}${ext}`;

    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  throw new Error(`Could not find file: ${filename}`);
};
