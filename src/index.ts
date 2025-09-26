import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Core render function for replace-it
 *
 * Supports:
 * - {{ expression }}             → evaluate JS expression with provided data + helpers
 * - {{#if condition}}...{{/if}}  → conditional rendering with optional {{else}}
 * - {{#each path}}...{{/each}}   → loop over arrays
 * - Custom handlers              → define new syntax with regex patterns
 * - Helpers injection            → pass reusable functions (like formatCurrency, formatDate, etc.)
 */

export type AnyObject = { [key: string]: any };

export interface CustomHandler {
    pattern: RegExp;
    handler: (
        match: RegExpExecArray,
        scope: AnyObject,
        helpers: AnyObject
    ) => string;
}

export interface RenderOptions {
    template: string;
    data: AnyObject;
    helpers?: AnyObject;
    handlers?: CustomHandler[];
}

/**
 * Evaluate an expression safely in the context of scope + helpers
 */
function evaluateExpression(
    expression: string,
    scope: AnyObject,
    helpers: AnyObject = {}
): any {
    const fullScope = { ...helpers, ...scope };
    const keys = Object.keys(fullScope);
    const values = Object.values(fullScope);

    try {
        const fn = new Function(...keys, `return (${expression});`);
        return fn(...values);
    } catch {
        return "";
    }
}

/**
 * Get value by dot path (e.g. "user.name")
 */
function getValueByPath(obj: AnyObject, path: string): any {
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
}

/**
 * Built-in helpers
 */
export const defaultHelpers = {
    formatCurrency: (
        value: number,
        locale = 'id-ID',
        symbolCurrency = 'USD',
        precision?: number,
    ) => {
        if (value === undefined || value === null || isNaN(value)) {
            return '';
        }

        return `${symbolCurrency} ${new Intl.NumberFormat(locale, {
            minimumFractionDigits: precision,
            maximumFractionDigits: precision,
        }).format(value)}`;
    },
        formatDate: (
        value: string | Date,
        format = 'DD/MM/YYYY'
    ): string => {
        if (!value) return '';
        const date = new Date(value);
        if (isNaN(date.getTime())) return '';

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString();

        return format
            .replace(/DD/, day)
            .replace(/MM/, month)
            .replace(/YYYY/, year)
            .replace(/YY/, year.slice(-2));
    }

};

/**
 * Render a template string
 */
export function renderTemplate(options: RenderOptions): string {
    let { template, data, helpers = {}, handlers = [] } = options;
    const mergedHelpers = { ...defaultHelpers, ...helpers };

    function processTemplate(tmpl: string, scope: AnyObject): string {
        let result = tmpl;

        // 1) Conditionals
        const ifRegex = /\{\{#if (.*?)\}\}([\s\S]*?)\{\{\/if\}\}/g;
        result = result.replace(ifRegex, (_, condition, inner) => {
            const [truthyBlock, falsyBlock = ""] = inner.split(/\{\{else\}\}/);
            const cond = evaluateExpression(condition.trim(), scope, mergedHelpers);
            return cond
                ? processTemplate(truthyBlock, scope)
                : processTemplate(falsyBlock, scope);
        });

        // 2) Loops
        const eachRegex = /\{\{#each (.*?)\}\}([\s\S]*?)\{\{\/each\}\}/g;
        result = result.replace(eachRegex, (_, path, inner) => {
            const arr = getValueByPath(scope, path.trim());
            if (!Array.isArray(arr)) return "";
            return arr
                .map((item) =>
                    processTemplate(inner, { ...scope, ...item })
                )
                .join("");
        });

        // 3) Custom handlers
        for (const { pattern, handler } of handlers) {
            result = result.replace(pattern, (...args) => {
                const match = args as unknown as RegExpExecArray;
                return handler(match, scope, mergedHelpers);
            });
        }

        // 4) Raw expressions
        result = result.replace(/\{\{(.*?)\}\}/g, (_, expression) => {
            const value = evaluateExpression(expression.trim(), scope, mergedHelpers);
            return value ?? "";
        });

        return result;
    }

    return processTemplate(template, data);
}

/**
 * Load template file from path
 */
export function loadTemplate(filePath: string): string {
    const absPath = resolve(process.cwd(), filePath);
    return readFileSync(absPath, "utf-8");
}