const vscode = require('vscode')
const { layoutMap } = require('../gomem/layout')

function searchForStructInFile(structName) {
    const text = vscode.window.activeTextEditor.document.getText()

    if (structName !== undefined && structName !== '') {
        const structRegex = new RegExp(`(?:type\\s+)?${structName}\\s+struct\\s*\\{(?:[^{}]*\\{[^{}]*\\}[^{}]*)*[^{}]*\\}`, 'g')
        return structRegex.exec(text)
    }
    return []
}

/**
 * This function search for all possibile Go struct in opened document
 * For each struct gets name and lineposition in doc
 */
function getAllStructInDocument() {

    const currentOpenedDocument = vscode.window.activeTextEditor.document
    const totalNumberOfLines = currentOpenedDocument.lineCount

    let structInFiles = []

    for (let lineNumber = 0; lineNumber < totalNumberOfLines; lineNumber++) {
        const currentLine = currentOpenedDocument.lineAt(lineNumber)

        if (currentLine.text.trim().startsWith('type')) {
            let structName = parseStructDeclartionInPlain(currentLine.text)
            let structAsString = searchForStructInFile(structName)[0]

            structInFiles.push(
                {
                    'name': structName,
                    'start': lineNumber,
                    'end': lineNumber + structAsString.split('\n').length - 1
                }
            )
        }
    }
    return structInFiles
}

function getStructInDocument(structName) {

    const currentOpenedDocument = vscode.window.activeTextEditor.document
    const totalNumberOfLines = currentOpenedDocument.lineCount

    for (let lineNumber = 0; lineNumber < totalNumberOfLines; lineNumber++) {
        const currentLine = currentOpenedDocument.lineAt(lineNumber)

        if (currentLine.text.trim().startsWith('type')) {
            let strName = parseStructDeclartionInPlain(currentLine.text)
            if (structName == strName) {
                let structAsString = searchForStructInFile(structName)[0]
                return {
                    name: structName,
                    start: lineNumber,
                    end: lineNumber + structAsString.split('\n').length - 1
                }
            }
        }
    }
    return {}
}

/**
 * 
 * @param {string} structLine 
 */
function parseStructDeclartionInPlain(structLine) {
    /**
     * structLine starts with type a priori.
     * Function splits structLine by space and takes second element as structName
     */
    const structElements = structLine.split(' ')

    return structElements.length > 1 ? structElements[1].replaceAll('\t', '') : undefined
}


/**
 * This function compute de struct dimension ignoring padding
 * @param {string} structName 
 */
function computeStructDimension(structName) {
    const structToCheck = searchForStructInFile(structName);

    // Verifica se la struct è stata trovata
    if (!structToCheck || structToCheck.length === 0 || !structToCheck[0]) {
        console.error(`Struct ${structName} not found or invalid.`)
        return {}
    }

    const cleaned = structToCheck[0].replaceAll('\t', '')
    const parsedStruct = parsingStruct(cleaned, structName)

    return loopOn(parsedStruct)
}

function sortStruct(structName) {
    const structToCheck = searchForStructInFile(structName);

    // Verifica se la struct è stata trovata
    if (!structToCheck || structToCheck.length === 0 || !structToCheck[0]) {
        console.error(`Struct ${structName} not found or invalid.`);
        return [];
    }

    const cleaned = structToCheck[0].replaceAll('\t', '');
    const parsedStruct = parsingStruct(cleaned, structName);

    return sortOn(parsedStruct)
}

function writeStruct(structName, structFields, nested = false, buildString = "") {
    /**
     * The only particulare case to handle is that a field is an Array
     */
    structFields.forEach(field => {
        if (field.type || Array.isArray(field)) {
            if (Array.isArray(field)) {
                buildString += `\n${writeStruct('', field, true)}`
            } else {
                buildString += `\n\t${nested ? '\t' : ''}${field.name} ${field.type} ${field.others || ''}`
            }
        }
    })

    return structName != '' ?
        `type ${structName} struct { ${buildString} \n}\n\n` :
        `\tstruct {\n${buildString}\n\t}`

}


function loopOn(arr, totalDimension = 0, currentDimension = 0, optimum = true) {
    arr.forEach(x => {
        if (!x.type && !Array.isArray(x)) totalDimension += 0
        else if (layoutMap[x.type]) {
            let dim = layoutMap[x.type].size
            if (currentDimension == 0) currentDimension = dim
            else if (currentDimension < dim) optimum = false
            currentDimension = dim
            totalDimension += dim
        } else if (Array.isArray(x)) {
            let res = loopOn(x, 0, currentDimension, optimum)
            if (!res.optimum) optimum = res.optimum
            else if (currentDimension == 0) currentDimension = res.totalDimension
            else if (currentDimension < res.totalDimension) optimum = false
            currentDimension = res.totalDimension
            totalDimension += res.totalDimension
        } else {
            const s = searchForStructInFile(x.type)
            const s1 = parsingStruct(s[0]) //TODO
            let res = loopOn(s1, 0, currentDimension, optimum)
            if (currentDimension == 0) currentDimension = res.totalDimension
            else if (currentDimension < res.totalDimension) optimum = false
            totalDimension += res.totalDimension
        }
    })

    return { totalDimension, currentDimension, optimum }

}

function sortOn(arr) {
    return arr.sort((a, b) => sortingCriteria(a, b))
}

function sortingCriteria(a, b) {
    if ((!a.type && !Array.isArray(a)) || (!b.type && !Array.isArray(b))) return -1
    const la = layoutMap[a.type]
    const lb = layoutMap[b.type]
    if (la && lb) return lb.size - la.size
    else if (la && !lb) {
        if (Array.isArray(b)) {
            return loopOn(sortOn(b)).totalDimension - la.size
        } else {
            return computeStructDimension(b.type).totalDimension - la.size
        }
    } else if (!la && lb) {
        if (Array.isArray(a)) {
            return lb.size - loopOn(sortOn(a)).totalDimension
        } else {
            return lb.size - computeStructDimension(a.type).totalDimension
        }
    } else {
        let dimA = 0
        let dimB = 0
        if (Array.isArray(a)) {
            dimA = loopOn(sortOn(a)).totalDimension
        } else {
            dimA = computeStructDimension(a.type).totalDimension
        }

        if (Array.isArray(b)) {
            dimB = loopOn(sortOn(b)).totalDimension
        } else {
            dimB = computeStructDimension(b.type).totalDimension
        }

        return dimB - dimA
    }
}


/**
 * This function parse a struct given as whole string
 * creating an array of fields (parsing include first level nested struct)
 * @param {string} cleanedStruct 
 */
function parsingStruct(cleanedStruct, structName) {

    //TODO: here can pass as input the struct start line
    let startStruct = 0

    if (structName !== undefined) {
        let structOnDoc = getStructInDocument(structName)
        startStruct = structOnDoc.start
    }

    /**
     * Shoud check:
     *  - is the struct declaration (e.g. type ....)
     *  - is a nested struct(e.g. struct {....} or name that is not inclueded as standard Go field) -> handling just first nesting level
     *  - is closing char (e.g. '}' )
     */
    let structFields = []
    let nestedFields = []
    let isNested = false

    cleanedStruct.split('\n')
        .map(row => row.trim())
        .forEach((row, idx) => {
            if (row.startsWith('type') || (!isNested && row.startsWith('}')) || row.startsWith('\/\/')) {
                //skip
                return
            }
            if (row.includes('struct')) { //TODO: too mild use regexp and adding name to array
                // nested struct at first nesting level
                isNested = true
                return
            } else if (isNested && !row.startsWith('}')) {
                const rowParts = row.split(' ').filter(r => r != '')

                nestedFields.push({
                    'name': rowParts[0],
                    'type': rowParts[1],
                    'others': rowParts.slice(2).join(' '),
                    'pos': startStruct + idx
                })
                return
            } else if (isNested && row.startsWith('}')) {
                structFields.push(nestedFields)
                isNested = false
                nestedFields = []
                return
            }

            const rowParts = row.split(' ').filter(r => r != '')

            structFields.push({
                'name': rowParts[0],
                'type': rowParts[1],
                'others': rowParts.slice(2).join(' '),
                'pos': startStruct + idx
            })

        })

    return structFields

}

function checkPaddingOnStruct(structName) {
    const structToCheck = searchForStructInFile(structName);

    // Verifica se la struct è stata trovata
    if (!structToCheck || structToCheck.length === 0 || !structToCheck[0]) {
        console.error(`Struct ${structName} not found or invalid.`)
        return {}
    }

    const cleaned = structToCheck[0].replaceAll('\t', '')
    const parsedStruct = parsingStruct(cleaned, structName)

    return paddingOn(parsedStruct)
}

/**
 * This function compute padding for each field of input struct
 * @param {Array} cleanedStruct 
 */
function paddingOn(cleanedStruct, currentOffset = 0, paddings = [], nested = false) {
    // when cleandStruct has just one elment the padding is just on tail
    // otherwise loop on all fields
    cleanedStruct.forEach(field => {
        // if there is padding it means that current field is less than 8 byte
        // so Golang compiler put a padding after to align to the next one or tail in the end
        if (field.type) {
            if (layoutMap[field.type]) {
                const size = layoutMap[field.type].size
                const alignment = layoutMap[field.type].align
                let padding = (currentOffset % alignment !== 0) ? alignment - (currentOffset % alignment) : 0
                const currentPad = {
                    name: field.name,
                    layout: layoutMap[field.type].size,
                    headPadding: padding,
                    pos: field.pos
                }
                if (!paddings.includes(currentPad)) paddings.push(currentPad)
                currentOffset += padding + size
            } else {
                //custom type
                const customStruct = searchForStructInFile(field.type);
                const customType = parsingStruct(customStruct[0].replaceAll('\t', ''), field.type)
                paddingOn(customType, currentOffset, paddings, true)
            }
        } else if (Array.isArray(field)) {
            paddingOn(field, currentOffset, paddings, true)
        }
    })

    if (!nested)
        paddings.push({
            tail: currentOffset % 8
        })

    return paddings

}



module.exports = {
    getAllStructInDocument,
    computeStructDimension,
    sortStruct,
    writeStruct,
    checkPaddingOnStruct
}