# Tutorial

This section will quickly walk you through the basic concepts of grafar so that you can jump to building your own cool stuff. To give you a bird's eye view of the architecture, normal grafar apps are structured as follows:

- Free variables are created using generators
- Data is transformed via `grafar.map`
- Free and mapped variables are displayed on a panel.

Once a free variable updates, grafar uses its reactive powers to mark all the dependent variables for update, and the panel is automatically updated. User input and animations are handled by updating _free variables_ from outside grafar.

This tutorial works best if you code along in [codesandbox](https://codesandbox.io/s/grafar-template-h1k66)
