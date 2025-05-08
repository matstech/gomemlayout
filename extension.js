// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { CodeLensProvider } = require('./codelens/provider')
const { sortStruct, writeStruct } = require('./struct/struct')
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {


	vscode.workspace.getConfiguration('editor')
		.update('codeLens', true, vscode.ConfigurationTarget.Global)

	const codeLens = new CodeLensProvider()

	context.subscriptions.push(vscode.languages.registerCodeLensProvider(
		{ scheme: 'file', language: 'go' }, codeLens
	));
	const decorationType = vscode.window.createTextEditorDecorationType({
		after: { color: 'gray', fontStyle: 'italic' }
	});
	vscode.workspace.onDidOpenTextDocument((document) => {
		// Calcola e rendi le decorations
		codeLens.provideDecorations(document)
		const editor = vscode.window.activeTextEditor
		if (editor) {
			editor.setDecorations(decorationType, [...codeLens.decorations.values()])
		}
	});

	vscode.workspace.onDidChangeTextDocument((document) => {
		// Calcola e rendi le decorations
		codeLens.provideDecorations(document)
		const editor = vscode.window.activeTextEditor
		if (editor) {
			editor.setDecorations(decorationType, [...codeLens.decorations.values()])
		}
	})


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('gomemlayout.optimize', function (struct) {
		// The code you place here will be executed every time your command is executed
		const startRange = new vscode.Position(struct.start, 0)
		const endRange = new vscode.Position(struct.end + 1, 0) // last } char
		const range = new vscode.Range(startRange, endRange)
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			Promise.resolve(editor.edit(editBuilder => {
				editBuilder.delete(range);
				editBuilder.insert(startRange, writeStruct(struct.name, sortStruct(struct.name)));
			})).then(() => {
				codeLens.provideDecorations(editor.document)
				editor.setDecorations(decorationType, [...codeLens.decorations.values()])
			})

		}

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from gomemlayout! Trying to optimizing struct ' + struct);
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
