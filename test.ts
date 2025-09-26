import { renderTemplate } from "./dist";

function getValueByPath(obj: Record<string, any>, path: string): any {
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
}

const template = `
<div>
  Hello {{ user.name }}
  {{#upper user.name}}
  {{#repeat user.name 3}}
</div>
`;

const output = renderTemplate({
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

console.log(output);