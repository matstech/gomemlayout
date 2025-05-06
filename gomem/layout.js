const layoutMap = {
    "bool": { size: 1, align: 1 },
    "int": { size: 8, align: 8 },
    "uint": { size: 8, align: 8 },
    "int8": { size: 1, align: 1 },
    "uint8": { size: 1, align: 1 },
    "int16": { size: 2, align: 2 },
    "uint16": { size: 2, align: 2 },
    "int32": { size: 4, align: 4 },
    "uint32": { size: 4, align: 4 },
    "int64": { size: 8, align: 8 },
    "uint64": { size: 8, align: 8 },
    "float32": { size: 4, align: 4 },
    "float64": { size: 8, align: 8 },
    "complex64": { size: 8, align: 4 },
    "complex128": { size: 16, align: 8 },
    "byte": { size: 1, align: 1 },
    "string": { size: 16, align: 8 },   // 2 words
    "slice": { size: 24, align: 8 },   // pointer + len + cap
    "map": { size: 8, align: 8 },   // pointer to runtime.hmap
    "chan": { size: 8, align: 8 },
    "func": { size: 8, align: 8 },
    "interface": { size: 16, align: 8 },   // type + data
    "pointer": { size: 8, align: 8 },
    "uintptr": { size: 8, align: 8 },
    "Time": { size: 24, align: 8 },   // from time.Time
    "Duration": { size: 8, align: 8 },   // int64 alias
    "Mutex": { size: 8, align: 8 }    // sync.Mutex (usually int32 + pad)
}

//TODO: checkType function to get every kind of field (also array must be included)

module.exports = { layoutMap }