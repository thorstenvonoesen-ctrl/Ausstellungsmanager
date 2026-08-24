import "server-only";

type PostgresError = Error & {
  code?: string;
  detail?: string;
  hint?: string;
  schema?: string;
  table?: string;
  column?: string;
  constraint?: string;
};

export function logDatabaseError(operation: string, error: unknown) {
  const databaseError = error as PostgresError;
  console.error("[database] query failed", {
    operation,
    name: databaseError?.name,
    message: databaseError?.message ?? String(error),
    code: databaseError?.code,
    detail: databaseError?.detail,
    hint: databaseError?.hint,
    schema: databaseError?.schema,
    table: databaseError?.table,
    column: databaseError?.column,
    constraint: databaseError?.constraint,
  });
}

export async function withDatabaseLogging<T>(
  operation: string,
  query: () => Promise<T>,
): Promise<T> {
  try {
    return await query();
  } catch (error) {
    logDatabaseError(operation, error);
    throw error;
  }
}
