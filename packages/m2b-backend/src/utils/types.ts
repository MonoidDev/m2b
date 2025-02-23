export function isConstructor(func: any): func is { new (): any } {
  return (
    typeof func === "function" &&
    !!func.prototype &&
    func.prototype.constructor === func
  );
}
