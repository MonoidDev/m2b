import { AsyncLocalStorage } from "async_hooks";
import { isConstructor } from "./types.ts";

export interface InjectorContext {
  accessToken: string | undefined;
}

export class Injector {
  storage: WeakMap<{}, any>;

  static localStorage = new AsyncLocalStorage<Injector>();

  constructor(public ctx: InjectorContext) {
    this.storage = new WeakMap();
  }

  getToken(t: any): any {
    if (this.storage.has(t)) {
      return this.storage.get(t);
    } else {
      this.storage.set(t, isConstructor(t) ? new t() : t());
      return this.getToken(t);
    }
  }

  static getInjector() {
    return Injector.localStorage.getStore()!;
  }

  static getContext() {
    return Injector.getInjector().ctx;
  }

  static runWithContext<T>(ctx: InjectorContext, f: () => T): T {
    return Injector.localStorage.run(new Injector(ctx), () => {
      return f();
    });
  }
}

export function inject<T extends { new (): any }>(
  t: T
): T extends { new (): infer U } ? U : unknown;

export function inject<T extends () => any>(t: T): ReturnType<T>;

export function inject(t: any) {
  return Injector.getInjector().getToken(t);
}
