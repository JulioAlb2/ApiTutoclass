
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    const possibleError = error as { message: string };
    return possibleError.message;
  }
  
  if (error !== null && error !== undefined) {
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }
  
  return 'Error desconocido';
}

export function getErrorMessageSimple(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}