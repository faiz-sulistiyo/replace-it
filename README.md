# replace-it

A lightweight and flexible template engine for Node.js that replaces `{{ ... }}` placeholders with dynamic values, supports evaluating expressions, injecting helpers, and defining **custom regex-based handlers**.

---

## ✨ Features

- Replace simple placeholders like `{{ user.name }}`
- Evaluate JS expressions inside `{{ ... }}`
- Inject reusable helpers (e.g., `formatDate`, `formatCurrency`)
- Extend syntax with **custom regex handlers**
- Zero dependencies, fast, and easy to use

---

## 📦 Installation

```bash
npm install replace-it
```

or with yarn:

```bash
yarn add replace-it
```

---

## 🚀 Quick Start

### Basic placeholder replacement

```ts
import { renderTemplate } from "replace-it";

const template = "Hello {{ user.name }}, you have {{ user.balance }} points.";

const result = renderTemplate({
  template,
  data: {
    user: { name: "Faiz", balance: 1000 }
  }
});

console.log(result);
// => "Hello Faiz, you have 1000 points."
```

---

### Expressions

You can evaluate JavaScript expressions directly inside the `{{ ... }}` block.

```ts
const template = "Next year, {{ user.age + 1 }} years old.";

const result = renderTemplate({
  template,
  data: { user: { age: 29 } }
});

console.log(result);
// => "Next year, 30 years old."
```

---

### Injecting Helpers

Helpers are functions you can pass in and use directly inside expressions.

```ts
const template = "Today is {{ formatDate(today) }}";

const result = renderTemplate({
  template,
  data: { today: new Date("2025-09-26") },
  helpers: {
    formatDate: (date: Date) => date.toISOString().split("T")[0]
  }
});

console.log(result);
// => "Today is 2025-09-26"
```

---

### Custom Handlers

Custom handlers let you extend the engine with new syntax.  
You pass them as an array of `{ pattern, handler }` objects.

```ts
import { renderTemplate } from "replace-it";

// Helper for nested property lookup
function getValueByPath(obj: Record<string, any>, path: string): any {
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
}

const template = `
Hello {{ user.name }}
{{#upper user.name}}
{{#repeat user.name 3}}
`;

const result = renderTemplate({
  template,
  data: { user: { name: "Faiz" } },
  handlers: [
    {
      pattern: /\{\{#upper (.*?)\}\}/g,
      handler: (match, scope) => {
        const value = getValueByPath(scope, match[1].trim());
        return String(value ?? "").toUpperCase();
      },
    },
    {
      pattern: /\{\{#repeat (.*?) (\d+)\}\}/g,
      handler: (match, scope) => {
        const value = getValueByPath(scope, match[1].trim());
        const times = Number(match[2]);
        return String(value ?? "").repeat(times);
      },
    },
  ],
});

console.log(result);
// =>
// Hello Faiz
// FAIZ
// FaizFaizFaiz
```

---

## ⚡ API Reference

### `renderTemplate(options: RenderOptions): string`

Render a template string with placeholders, expressions, and custom handlers.

#### Parameters

- **`template: string`**  
  The template string containing placeholders.

- **`data: Record<string, any>`**  
  The data object to resolve values from.

- **`helpers?: Record<string, any>`**  
  (Optional) Functions available inside expressions.  
  Example: `{{ formatDate(date) }}`.

- **`handlers?: { pattern: RegExp; handler: (match, scope, helpers) => string }[]`**  
  (Optional) Array of custom regex handlers.  
  - `pattern` → Regex used to match parts of the template.  
  - `handler` → Function that returns a replacement string.  

#### Returns
- A new string with placeholders replaced.

---

## 📖 Examples

### Using Math in templates

```ts
const template = "Total with tax: {{ price * 1.1 }}";

const result = renderTemplate({
  template,
  data: { price: 100 }
});

console.log(result);
// => "Total with tax: 110"
```

---

### Reusing helpers across templates

```ts
const helpers = {
  upper: (str: string) => str.toUpperCase(),
  formatCurrency: (value: number) => `$${value.toFixed(2)}`
};

const template = `
Name: {{ upper(user.name) }}
Balance: {{ formatCurrency(user.balance) }}
`;

const result = renderTemplate({
  template,
  data: { user: { name: "faiz", balance: 42.5 } },
  helpers
});

console.log(result);
// =>
// Name: FAIZ
// Balance: $42.50
```

---

## 📝 License

MIT © 2025 [Faiz](https://github.com/your-username)
