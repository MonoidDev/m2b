export function isConstructor(func: unknown): func is { new (): unknown } {
  return (
    typeof func === "function" &&
    !!func.prototype &&
    func.prototype.constructor === func
  );
}
