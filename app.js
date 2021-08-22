document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector('.grid') // берем див элемент, будем использовать в качестве контейнера грида
    const styleGrid = getComputedStyle(grid) // стили для этого элемента
    const time = document.querySelector('#time') // получаем контейнер для элемента времени
    const flags = document.querySelector("#flags") // получаем контейнер для элемента флагов
    let countY = 10 // размер сетки по высоте
    let countX = 10 // размер сетки по ширине
    let isCellFirstOpening = true; // установлен ли первый флаг
    let isOver = false
    var cells = [] // массив ячеек
    var countMines = 10 // количество мин на игру
    var countFlags = countMines // количество флагов (флаги = мины)
    var currentTime = 0 // текущее время
    let interval = null
    let colorMap = null
    let cellsToWin = countY * countX - countMines 

    function gameLoop() {

        colorMap = new Map([
            [1, "blue"],
            [2, "green"],
            [3, "blue"],
            [4, "#020070"],
            [5, "#610000"],
            [6, "#0c81a8"],
            [7, "#131414"],
            [8, "#707373"]
        ])
        time.textContent = 0
        flags.textContent = countFlags
        addCellsToGrid()
    }

    function addCellsToGrid() {

        let gridWidth = countY * styleGrid.width
        let gridHeight = countX * styleGrid.height
        // создаем сетку поля
        for (let j = 0; j < countY; j++) {
            cells[j] = []
            var row = document.createElement('div')
            row.setAttribute('id', j)
            row.setAttribute('class', 'row')
            grid.appendChild(row)
            for (let i = 0; i < countX; i++) {
                var cell = document.createElement('div')
                cell.setAttribute('data-X', i)
                cell.setAttribute('data-Y', j)
                cell.setAttribute('data-state', 'closed')
                cell.setAttribute('id', i)
                cell.setAttribute('class', 'cell')
                cell.addEventListener('click', openCell)
                row.appendChild(cell)
                let cellData = { id: j * (i + 1), state: "closed", cntNeighbors: 0, type: 0 }
                cells[j][i] = cellData;
            }
        }

        //cells = document.querySelectorAll('.row')
    }

    // Открывает ячейку
    function openCell(event) {
        if (isOver) {
            gameOver(this)
            return
        }

        if (isCellFirstOpening) {
            setOnBombs(this)
            for (let i = 0; i < countY; i++) {
                for (let j = 0; j < countX; j++) {
                    if (cells[i][j].type !== 1 && cells[i][j].cntNeighbors !== 0)
                        grid.childNodes[i].childNodes[j].innerText = cells[i][j].cntNeighbors

                    /*if (cells[i][j].type === 1)
                        grid.childNodes[i].childNodes[j].innerText = '💣'*/
                }
            }
            isCellFirstOpening = false
            interval = setInterval(tick, 1000)
            //flags.textContent = countFlags
        }


        var column = Number(this.getAttribute('data-X'))
        var row = Number(this.getAttribute('data-Y'))
        if (event.button === 0 && !event.ctrlKey) {
            if (cells[row][column].type === 1 && grid.childNodes[row].childNodes[column].getAttribute('data-state') !== "flag") {
                gameOver(this)
            }
            else {
                revealCell(this)
            }
        }
        else if (event.button === 0 && event.ctrlKey && this.getAttribute('data-state') !== 'opened') {
            setFlag(this)
        }
    }

    function gameOver(cell) {
        for (let i = 0; i < countY; i++) {
            for (let j = 0; j < countX; j++) {

                grid.childNodes[i].childNodes[j].style.color = colorMap.get(cells[i][j].cntNeighbors)
                grid.childNodes[i].childNodes[j].setAttribute('data-state', 'opened')
                if (cells[i][j].type === 1)
                    grid.childNodes[i].childNodes[j].setAttribute('data-state', 'mine')

            }
        }
        if (interval != null)
            clearInterval(interval)
        isOver = true
        alert("Game over!")
    }

    function revealCell(cell) {

        var column = Number(cell.getAttribute('data-X'))
        var row = Number(cell.getAttribute('data-Y'))

        if (cell.getAttribute('data-state') === 'opened')
            return
        else if (cell.getAttribute('data-state') === 'flag') {
            return
        }

        cellsToWin--
        console.log(cellsToWin)
        cells[row][column].state = 'opened'
        cell.setAttribute('data-state', 'opened')
        cell.style.color = colorMap.get(cells[row][column].cntNeighbors)
        if(cellsToWin === 0) {
            victory(cell)
        }


        if (cells[row][column].cntNeighbors > 0)
            return

        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (row + i >= 0 && row + i < countY && column + j >= 0 && column + j < countX)
                    if (grid.childNodes[row + i].childNodes[column + j].getAttribute("data-state") !== "flag")
                        revealCell(grid.childNodes[row + i].childNodes[column + j])
            }
        }
    }

    function setFlag(cell) {
        if (cell.getAttribute("data-state") === "flag") {
            cell.setAttribute("data-state", "closed")
            ++countFlags
            flags.textContent = countFlags
        }
        else {
            if (countFlags === 0)
                return
            cell.setAttribute("data-state", "flag")
            --countFlags
            flags.textContent = countFlags
        }
    }

    // 
    function setOnBombs(cell) {
        for (let i = 0; i < countMines; i++) {
            let randomColumn = -1
            let randomRow = -1
            do {
                randomRow = getRandomInt(0, countY)
                randomColumn = getRandomInt(0, countX)
            } while (cell.getAttribute('data-X') == randomColumn && cell.getAttribute('data-Y') == randomRow)

            cells[randomRow][randomColumn].type = 1 // бомба

            /* верхний левый * # #
                             # _ #
                             # # # */
            if (randomRow - 1 >= 0 && randomColumn - 1 >= 0)
                cells[randomRow - 1][randomColumn - 1].cntNeighbors++

            /* верхний       # * #
                             # _ #  
                             # # # */
            if (randomRow - 1 >= 0)
                cells[randomRow - 1][randomColumn].cntNeighbors++

            /*верхний правый # # *
                             # _ #
                             # # # */
            if (randomRow - 1 >= 0 && randomColumn + 1 < countX)
                cells[randomRow - 1][randomColumn + 1].cntNeighbors++

            /*левый          # # #
                             * _ #
                             # # # */
            if (randomColumn - 1 >= 0)
                cells[randomRow][randomColumn - 1].cntNeighbors++

            /*правый         # # #
                             # _ *
                             # # # */
            if (randomColumn + 1 < countX)
                cells[randomRow][randomColumn + 1].cntNeighbors++

            /*нижний левый   # # #
                             # _ #
                             * # # */
            if (randomRow + 1 < countY && randomColumn - 1 >= 0)
                cells[randomRow + 1][randomColumn - 1].cntNeighbors++

            /*нижний         # # #
                             # _ #
                             # * # */
            if (randomRow + 1 < countY)
                cells[randomRow + 1][randomColumn].cntNeighbors++


            /*нижний правый  # # #
                             # _ #
                             # # * */
            if (randomRow + 1 < countY && randomColumn + 1 < countX)
                cells[randomRow + 1][randomColumn + 1].cntNeighbors++
        }
    }

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
    }

    function tick() {
        currentTime++
        time.textContent = currentTime
    }

    function victory(cell) {
        setTimeout(() => {
            alert("Victory")
        }, 2000);
    }

    gameLoop()
})