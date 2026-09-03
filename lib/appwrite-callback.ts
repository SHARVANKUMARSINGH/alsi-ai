export type AppwriteCallbackValue = string | string[] | undefined;

export type AppwriteCallbackParams = {
  userId?: AppwriteCallbackValue;
  secret?: AppwriteCallbackValue;
  error?: AppwriteCallbackValue;
  errorDescription?: AppwriteCallbackValue;
  error_description?: AppwriteCallbackValue;
};

function firstValue(value: AppwriteCallbackValue) {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate?.trim() || null;
}

export function getAppwriteCallbackCredentials(params: AppwriteCallbackParams) {
  return {
    userId: firstValue(params.userId),
    secret: firstValue(params.secret),
  };
}

export function getAppwriteCallbackError(params: AppwriteCallbackParams) {
  return {
    code: firstValue(params.error),
    description: firstValue(params.errorDescription) ?? firstValue(params.error_description),
  };
}
