
# gomemlayout

**gomemlayout** is a Visual Studio Code extension designed to optimize the memory layout of Go structs. It provides tools to analyze and improve struct layouts, reducing memory padding and improving efficiency.

## Features

- **CodeLens Actions**: Adds a CodeLens above each Go struct to optimize its layout.
- **Visual Decorations**: Highlights padding and inefficiencies in struct layouts directly in the editor.
- **Automatic Optimization**: Reorganizes struct fields to minimize padding with a single command.
- **Support for Nested Structs**: Handles and optimizes structs with nested fields.

![Feature Example](images/feature-x.png)

> Tip: Add animations or screenshots to showcase your extension in action.

## Limitations

While **gomemlayout** provides powerful tools for optimizing Go structs, there are some limitations to be aware of:

- **Complex Structs**: Structs with deeply nested fields at second level or highly complex layouts may not be fully optimized. This could be supporteb but discouraged as use case.
- **Custom Types**: The extension relies on a predefined `layoutMap` for type sizes including all common and base type in Go. Custom types not included in this map may not be handled correctly. The approach is conservative and they will be treated as smallest in the analyzed structs.

## Requirements

- **Go** must be installed on your system.
- A Go file must be open in the editor for the extension to work.

## Extension Settings

This extension does not currently add any configurable settings.

## Commands

The extension provides the following commands:

- `gomemlayout.optimize`: Optimizes the layout of a selected struct.

## Known Issues

- Structs with highly complex layouts may take longer to analyze.
- Decorations may not update correctly in some edge cases when the file is modified rapidly.

## Release Notes

### 1.0.0

- Initial release with:
  - CodeLens for struct optimization.
  - Visual decorations for padding and inefficiencies.
  - Command to optimize struct layouts.

---

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

- Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
- Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
- Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

- [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
- [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
