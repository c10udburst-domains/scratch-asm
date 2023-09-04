const registerLists = {
    "64": [
        "rax", "rbx", "rcx", "rdx",
        "rsi", "rdi", "rbp", "rsp",
        "r8", "r9", "r10", "r11",
    ],
    "32": [
        "eax", "ebx", "ecx", "edx",
        "esi", "edi", "ebp", "esp",
        "r8d", "r9d", "r10d", "r11d",
    ],
    "16": [
        "ax", "bx", "cx", "dx",
        "si", "di", "bp", "sp",
        "r8w", "r9w", "r10w", "r11w",
    ],
    "8": [
        "al", "bl", "cl", "dl",
        "sil", "dil", "bpl", "spl",
        "r8b", "r9b", "r10b", "r11b",
    ],
}

function registerSpecials() {
    Blockly.defineBlocksWithJsonArray([{
        type: "start",
        message0: "When 🏴 clicked",
        nextStatement: null,
        colour: 120,
    }])
    window.toolbox.contents.push({
        kind: 'category',
        name: 'Specials',
        contents: [
            {
                kind: 'block',
                type: 'start'
            }
        ]
    })
}

function defineRegisterBlocks() {
    let registerBlocks = Object.entries(registerLists).map(([key, value]) => {
        return {
            type: `r${key}`,
            message0: `${key}bit register %1`,
            args0: [
                {
                    type: "field_dropdown",
                    name: "REGISTER",
                    options: value.map(register => [register, register])
                }
            ],
            output: `r${key}`,
            colour: 160,
        }
    })
    Blockly.defineBlocksWithJsonArray(registerBlocks);
    window.toolbox.contents.push({
        kind: 'category',
        name: 'Registers',
        contents: Object.keys(registerLists).map(key => {
            return {
                kind: 'block',
                type: `r${key}`
            }
        })
    })
}

function defineMemoryBlocks() {
    let memoryBlocks = Object.keys(registerLists).map(key => {
        return {
            type: `m${key}`,
            message0: `${key}bit memory %1`,
            args0: [
                {
                    type: "field_number",
                    name: "MEMORY",
                    value: 0
                }
            ],
            output: `m${key}`,
            colour: 60,
        }
    })
    memoryBlocks.push({
        type: `m64_string`,
        message0: `Pointer to string %1`,
        args0: [
            {
                type: "field_input",
                name: "STRING",
                text: ""
            }
        ],
        output: `m64`,
        colour: 60,
    })
    Blockly.defineBlocksWithJsonArray(memoryBlocks);
    window.toolbox.contents.push({
        kind: 'category',
        name: 'Memory',
        contents: memoryBlocks.map(block => {
            return {
                kind: 'block',
                type: block.type
            }
        }
        )
    })
}

function defineImmediateBlocks() {
    let immediateBlocks = Object.keys(registerLists).map(key => {
        return {
            type: `imm${key}`,
            message0: `${key}bit immediate %1`,
            args0: [
                {
                    type: "field_number",
                    name: "IMMEDIATE",
                    value: 0
                }
            ],
            output: `imm${key}`,
            colour: 60,
        }
    })
    Blockly.defineBlocksWithJsonArray(immediateBlocks);
    window.toolbox.contents.push({
        kind: 'category',
        name: 'Immediates',
        contents: Object.keys(registerLists).map(key => {
            return {
                kind: 'block',
                type: `imm${key}`
            }
        })
    })
}

function makeToolbox() {
    fetch('https://raw.githubusercontent.com/astocko/json-x86-64/master/x86_64.json')
        .then(response => response.json())
        .then(data => {
            let blocks = [];
            let toolboxElements = [];
            for (let [instruction, instr] of Object.entries(data.instructions)) {
                if (instr.forms == undefined) continue;
                i = 0;
                let toolboxEntries = [];
                for (let form of instr.forms) {
                    let operands = (form.operands || []).map((operand, index) => {
                        return {
                            type: "input_value",
                            name: `OPERAND${index + 1}`,
                            check: operand.type
                        }
                    }).filter(operand => operand != null);
                    blocks.push({
                        type: "asm_" + instruction + i,
                        message0: instruction + " " + (operands.map((operand, index) => `${operand.check} %${index + 1}`).join(" ") || ""),
                        args0: operands,
                        tooltip: instr.summary,
                        previousStatement: null,
                        nextStatement: null,
                        colour: 230,
                    })
                    toolboxEntries.push({
                        kind: 'block',
                        type: "asm_" + instruction + i
                    })
                    i++;
                }
                toolboxElements.push({
                    kind: 'category',
                    name: instruction,
                    contents: toolboxEntries
                })
            }
            Blockly.defineBlocksWithJsonArray(blocks);
            window.toolbox.contents.push({
                kind: 'category',
                name: 'Instructions',
                contents: toolboxElements
            })
            createWorkspace();
        });
}


function init() {
    window.toolbox = {
        kind: 'categoryToolbox',
        contents: []
    }
    registerSpecials();
    defineRegisterBlocks();
    defineImmediateBlocks();
    defineMemoryBlocks();
    makeToolbox();
}

function createWorkspace() {
    const blocklyWorkspace = Blockly.inject('blocklyDiv', {
        toolbox: window.toolbox,
        zoom: {
            controls: true,
            wheel: true,
            startScale: 1.0,
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.2
        },
        trashcan: true
    });
}
