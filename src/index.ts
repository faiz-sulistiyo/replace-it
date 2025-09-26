/**
 * Core render function for replace-it
 *
 * Supports:
 * - {{ expression }}   → evaluate JS expression with provided data
 * - Custom handlers    → define new syntax with regex patterns
 * - Helpers injection  → pass reusable functions into expression scope
 */

export type AnyObject = { [key: string]: any };

/**
 * A custom regex handler definition
 */
export interface CustomHandler {
  pattern: RegExp;
  handler: (
    match: RegExpExecArray,
    scope: AnyObject,
    helpers: AnyObject
  ) => string;
}

/**
 * Render options for renderTemplate
 */
export interface RenderOptions {
  template: string;
  data: AnyObject;
  helpers?: AnyObject;               // optional functions usable in {{ ... }}
  handlers?: CustomHandler[];        // optional custom regex handlers
}

/**
 * Evaluate an expression safely in the context of scope + helpers
 */
function evaluateExpression(
  expression: string,
  scope: AnyObject,
  helpers: AnyObject = {}
): any {
  const fullScope = { ...helpers, ...scope }; // merge data + helpers
  const keys = Object.keys(fullScope);
  const values = Object.values(fullScope);

  try {
    // Build a function with scope variables injected
    const fn = new Function(...keys, `return (${expression});`);
    return fn(...values);
  } catch {
    // If expression fails, just return empty string
    return '';
  }
}

/**
 * Render a template string by replacing placeholders and applying custom handlers
 */
export function renderTemplate(options: RenderOptions): string {
  let { template, data, helpers = {}, handlers = [] } = options;

  // 1) Apply custom regex handlers
  for (const { pattern, handler } of handlers) {
    template = template.replace(pattern, (...args) => {
      const match = args as unknown as RegExpExecArray;
      return handler(match, data, helpers);
    });
  }

  // 2) Default raw {{ expression }} replacement
  template = template.replace(/\{\{(.*?)\}\}/g, (_, expression) => {
    const value = evaluateExpression(expression.trim(), data, helpers);
    return value ?? '';
  });

  return template;
}