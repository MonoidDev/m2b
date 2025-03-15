import { useCallback, useEffect, useSyncExternalStore } from "react";

import { transformer } from "m2b-utils";
import type { ZodTypeAny } from "zod";

type TypeLocalStorageSubscription = {
  t: ZodTypeAny;
  key: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cb: (r: any) => void;
};

type SafeParseType<T extends ZodTypeAny> = ReturnType<T["safeParse"]>;

export class TypeLocalStorage {
  private static subscriptions: TypeLocalStorageSubscription[] = [];

  static broadcast() {
    this.subscriptions.forEach(({ t, key, cb }) => {
      try {
        cb(this.get(t, key));
      } catch (e) {
        console.error("Failed to call subscription during broadcast", e);
      }
    });
  }

  /**
   * Load a value from local storage, parse it with superjson and the given schema.
   */
  static get<T extends ZodTypeAny>(t: T, key: string): SafeParseType<T> {
    return this.safeParseData(t, localStorage.getItem(key));
  }

  static safeParseData<T extends ZodTypeAny>(
    t: T,
    data: string | null,
  ): SafeParseType<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return t.safeParse(data === null ? data : transformer.parse(data)) as any;
  }

  /**
   * Store a value in local storage, serializing it with superjson, trigger subscriptions and return the value.
   */
  static set<T>(key: string, data: T): T {
    localStorage.setItem(key, transformer.stringify(data));
    this.broadcast();
    return data;
  }

  static remove(key: string) {
    localStorage.removeItem(key);
    this.broadcast();
  }

  static subscribe<T extends ZodTypeAny>(
    t: T,
    key: string,
    cb: (r: SafeParseType<T>) => void,
  ) {
    this.subscriptions.push({ t, key, cb });

    return () => {
      this.subscriptions = this.subscriptions.filter((sub) => sub.cb !== cb);
    };
  }

  static use() {
    return useEffect(() => {
      const storageListener = (ev: StorageEvent) => {
        this.subscriptions.forEach(({ t, key, cb }) => {
          /**
           * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
           * `ev.key`:
           * Returns a string with the key for the storage item that was changed.
           * The key attribute is null when the change is caused by the storage clear() method.
           */
          if (ev.key === null || ev.key === key) {
            try {
              cb(this.safeParseData(t, ev.newValue));
            } catch (e) {
              console.error(
                "Failed to call subscription on StorageEvent for key",
                key,
                e,
              );
            }
          }
        });
      };

      addEventListener("storage", storageListener);

      return () => {
        removeEventListener("storage", storageListener);
      };
    }, []);
  }

  static useKey<T extends ZodTypeAny>(t: T, key: string): SafeParseType<T> {
    let parsed = this.get(t, key);

    const subscribe = useCallback(
      (onStorehange: () => void) => {
        return this.subscribe(t, key, (r) => {
          parsed = r;
          onStorehange();
        });
      },
      [t, key],
    );

    const getSnapshot = useCallback(() => {
      return parsed;
    }, [t, key]);

    return useSyncExternalStore(subscribe, getSnapshot);
  }
}
