type ErrorWithMessage = {
  message?: string;
};

type ErrorWithResponse = {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
};

export function getErrorMessage(error: unknown): string {
  const err = error as ErrorWithMessage & ErrorWithResponse;

  if (err.response?.data?.message) {
    return err.response.data.message;
  }

  const validationErrors = err.response?.data?.errors;
  if (validationErrors) {
    const firstEntry = Object.values(validationErrors)[0];
    if (firstEntry?.length) {
      return firstEntry[0];
    }
  }

  if (err.message) {
    return err.message;
  }

  return 'Ocorreu um erro inesperado.';
}