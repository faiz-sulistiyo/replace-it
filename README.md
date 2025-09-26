# replace-it

A lightweight template engine for Node.js written in TypeScript.  
Supports **expressions, conditionals, loops, custom helpers, custom handlers, and template loading from file paths**.

---

## ✨ Features

- `{{ expression }}` → evaluate JS expressions
- `{{#if condition}}...{{else}}...{{/if}}` → conditional rendering
- `{{#each path}}...{{/each}}` → iterate arrays
- `{{ formatCurrency(value, locale, currency, precision) }}` → built-in currency formatting
- `loadTemplate(filePath)` → load HTML template files
- Custom **helpers** and **handlers** extensibility

---

## 📦 Installation

```bash
npm install replace-it
```

or

```bash
yarn add replace-it
```

---

## 🚀 Usage

### Basic Example

```ts
import { renderTemplate } from "replace-it";

const template = `
  <p>Hello {{ user.name }}</p>
  <p>Balance: {{ formatCurrency(user.balance, "id-ID", "IDR", 0) }}</p>
`;

const result = renderTemplate({
  template,
  data: {
    user: { name: "Faiz", balance: 50000 },
  },
});

console.log(result);
```

**Output:**

```html
<p>Hello Faiz</p>
<p>Balance: Rp50.000</p>
```

---

### Load Template from File

```ts
import { renderTemplate, loadTemplate } from "replace-it";

const template = loadTemplate("templates/invoice.html");

const result = renderTemplate({
  template,
  data: {
    user: { name: "Faiz", balance: 75000 },
  },
});

console.log(result);
```

---

### Conditionals

```ts
const template = `
  {{#if user.isMember}}
    <p>Welcome back, {{ user.name }}!</p>
  {{else}}
    <p>Hello Guest!</p>
  {{/if}}
`;

const result = renderTemplate({
  template,
  data: { user: { isMember: true, name: "Faiz" } },
});
```

**Output:**

```html
<p>Welcome back, Faiz!</p>
```

---

### Loops

```ts
const template = `
  <ul>
    {{#each items}}
      <li>{{ name }} - {{ formatCurrency(price, "id-ID", "IDR") }}</li>
    {{/each}}
  </ul>
`;

const result = renderTemplate({
  template,
  data: {
    items: [
      { name: "Apple", price: 10000 },
      { name: "Orange", price: 15000 },
    ],
  },
});
```

**Output:**

```html
<ul>
  <li>Apple - Rp10.000</li>
  <li>Orange - Rp15.000</li>
</ul>
```

---

### Custom Helpers

```ts
const template = `
  <p>{{ shout(user.name) }}</p>
`;

const result = renderTemplate({
  template,
  data: { user: { name: "faiz" } },
  helpers: {
    shout: (str: string) => str.toUpperCase() + "!",
  },
});
```

**Output:**

```html
<p>FAIZ!</p>
```

---

### Custom Handlers

```ts
const template = `
  (( user.name ))
`;

const result = renderTemplate({
  template,
  data: { user: { name: "Faiz" } },
  handlers: [
    {
      pattern: /\(\(\s*(.*?)\s*\)\)/g,
      handler: (match, scope, helpers) => {
        const expression = match[1];
        const fn = new Function(...Object.keys(scope), `return (${expression});`);
        return fn(...Object.values(scope));
      },
    },
  ],
});
```

**Output:**

```html
Faiz
```

---

## 🛠 API

### `renderTemplate(options: RenderOptions): string`

Options:

- `template` → template string
- `data` → object containing variables for binding
- `helpers` → custom helper functions
- `handlers` → custom regex handlers

### `loadTemplate(filePath: string): string`

Loads an HTML file from the given path.

---

## 📜 License

MIT
