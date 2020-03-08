/**
 * This wrapper is a workaround for the Typescript limitation that prevents
 * ember-concurrency-decorators from being properly typed
 * @param task - Ember concurrency task
 * @param taskArgs - Arguments for the .perform() call
 */
export default function performTask(task: any, ...taskArgs: any[]) {
  return task.perform(...taskArgs);
}
