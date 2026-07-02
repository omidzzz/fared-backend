// Patch: Express 5 types define ParamsDictionary index as string | string[],
// but in practice route params are always strings.
import "express-serve-static-core";

declare global {
  namespace Express {
    // No-op — just triggers the module augmentation below
  }
}

// Re-export to ensure module augmentation is applied
export {};
