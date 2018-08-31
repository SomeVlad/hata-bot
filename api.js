const fs = require('fs')

class Matrix {
    constructor(amount = 5) {
        this.amount = amount
        this.path = './'
        this.filename = 'matrix.js'
        this.setValue = this.setValue.bind(this)
        this.getValue = this.getValue.bind(this)
        this.getRow = this.getRow.bind(this)

        this.init()
    }

    doesMatrixExist() {
        if (fs.existsSync(`${this.path}${this.filename}`)) {
            console.log('File exists')
            return true
        } else {
            console.log('File doesn\'t exist')
            return false
        }
    }

    createMatrix() {
        const matrix = []
        for (let i = 0; i < this.amount ** 2; i++) {
            matrix.push(0)
        }
        this.matrix = matrix
        this.saveMatrix()
    }

    normalizeMatrix() {
        this.matrix.map((value, position) => {
            const row = Math.floor(position / this.amount)
            const column = position % this.amount
            const mirrorPosition = column * this.amount + row
            const mirrorValue = this.matrix[mirrorPosition]
            if (row === column) this.matrix[position] = 0
            if (value > mirrorValue) {
                this.matrix[mirrorPosition] = 0
                this.matrix[position] = value - mirrorValue
            } else {
                this.matrix[position] = 0
                this.matrix[mirrorPosition] = mirrorValue - value
            }
        })
    }

    saveMatrix() {
        const self = this
        fs.writeFile(`${self.path}${self.filename}`, JSON.stringify(self.matrix), function(error) {
            if (error) {
                console.log('Error while writing to file: ', error)
            } else {
                console.log(`Saved to ${self.path}${self.filename}`)
            }
        })
    }

    readMatrix() {
        const self = this
        fs.readFile(`${self.path}${self.filename}`, function(error, data) {
            if (error) {
                console.log('Error while reading file:', error)
            } else {
                self.matrix = JSON.parse(data)
                console.log('Successfully read file')
            }
        })
    }

    setValue(whoIndex, whomIndex, amount) {
        const index = whoIndex * this.amount + whomIndex
        this.matrix[index] = this.matrix[index] + amount
        this.normalizeMatrix()
        this.saveMatrix()
    }

    getValue(whoIndex, whomIndex) {
        this.normalizeMatrix()
        const position = whoIndex * this.amount + whomIndex
        return this.matrix[position]
    }

    getRow(whoIndex) {
        return this.matrix.slice(whoIndex * this.amount, this.amount * (whoIndex + this.amount))
    }

    init() {
        this.doesMatrixExist() ? this.readMatrix() : this.createMatrix()
    }
}

const matrix = new Matrix
module.exports.setValue = matrix.setValue
module.exports.getValue = matrix.getValue
module.exports.getRow = matrix.getRow

/*
        'Лене' 'Тёме' 'Кате' 'Андрею' 'Владу'

'Лена'    0       1      2       3       4

'Тёма'    -       0      0       8       9

'Катя'    -       -      0      13       14

'Андрей'  -       -      -       0       20

'Влад'    -       -      -       -       0

*/