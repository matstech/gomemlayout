
const vscode = require('vscode')
const { getAllStructInDocument, computeStructDimension, checkPaddingOnStruct } = require('../struct/struct')
/**
 * Class providing codeLens to the editor
 */
class CodeLensProvider {
    constructor() {
        this.lastDocumentVersion = null
        this.codeLenses = []
        this.decorations = []
    }
    /**
     * This functions aims to providing code lenses action
     * to put on each Go struct onto editor opened files
     * .....TODO: enrich description
     */
    provideCodeLenses(document, token) {

        // if (this.lastDocumentVersion === document.version) {
        //     return this.codeLenses;
        // }

        this.codeLenses = []

        this.lastDocumentVersion = document.version

        // put a mock codelens on each struct when identified in document
        const structsInDocument = getAllStructInDocument()

        structsInDocument.forEach(struct => {
            let res = computeStructDimension(struct.name)

            if (!res['optimum']) {

                const positionRange = new vscode.Position(struct.start, 0)
                const range = new vscode.Range(positionRange, positionRange)

                this.codeLenses.push(new vscode.CodeLens(range, {
                    title: "gomemlayout:optimize",
                    command: "gomemlayout.optimize",
                    arguments: [struct]
                }))
            }

        })

        return this.codeLenses

    }

    provideDecorations(document) {

        this.decorations = []

        this.lastDocumentVersion = document.version

        // put a mock codelens on each struct when identified in document
        const structsInDocument = getAllStructInDocument()

        structsInDocument.forEach(struct => {
            let padding = checkPaddingOnStruct(struct.name)

            const editor = vscode.window.activeTextEditor;

            if (editor) {
                padding.forEach(pad => {
                    try {
                        if (pad.tail) {
                            const ipLine = editor.document.lineAt(pad.pos + 1)
                            const range = new vscode.Range(ipLine.range.start, ipLine.range.end)
                            const decoration = {
                                range,
                                renderOptions: { after: { contentText: `\t tail:${pad.tail}`, color: 'gray' } }
                            }
                            if (!this.decorations.some(d => JSON.stringify(d) === JSON.stringify(decoration))) {
                                this.decorations.push(decoration)
                            }
                        }
                        /**
                         * Pad ha property pos that is the relative position of field in the current struct
                         */
                        if (pad.headPadding && pad.headPadding > 0) {
                            const line = editor.document.lineAt(pad.pos)
                            // console.log(`field ${pad.name} at line ${JSON.stringify(line)}`)
                            const dec = { name: pad.name, pos: { ...line } }

                            const ipLine = editor.document.lineAt(pad.pos)
                            // console.log(`ip: field ${pad.name} in pos ${JSON.stringify(ipLine)}`)
                            if (!this.decorations.some(d => JSON.stringify(d) === JSON.stringify(dec))) {
                                const range = new vscode.Range(ipLine.range.start, ipLine.range.end)
                                const decoration = {
                                    range,
                                    renderOptions: { after: { contentText: `\t padding:${pad.headPadding}`, color: 'gray' } }
                                }
                                if (!this.decorations.some(d => JSON.stringify(d) === JSON.stringify(decoration))) {
                                    this.decorations.push(decoration)
                                }
                            }
                        }
                    } catch (error) {
                        console.error(error)
                    }
                })
            }
        })

        return this.decorations

    }
}

module.exports = { CodeLensProvider }