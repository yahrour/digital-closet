export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: ActionError };

export type ActionError = {
  code: string;
  message: string;
};

export const ok = <T>(data: T): ActionResult<T> => ({
  success: true,
  data,
});

export const fail = (code: string, message: string): ActionResult<never> => ({
  success: false,
  error: { code, message },
});
