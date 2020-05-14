export interface Task {
  (): Generator<Promise<unknown>, void, unknown>;
  perform<T>(args?: any[]): Promise<T>;
  cancel(): void;
  cancelAll(): void;
}
