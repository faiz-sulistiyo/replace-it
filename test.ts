import { renderTemplate, loadTemplate } from "./dist";

const template = loadTemplate("templates/email.html");

const result = renderTemplate({
  template,
  data: {
    user: { name: "Faiz", balance: 50000 },
    items: [
      { name: "Apple", price: 1.5 },
      { name: "Banana", price: 2 },
    ],
  },
});

console.log(result);