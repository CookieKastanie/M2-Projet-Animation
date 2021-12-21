class LogsUI {
    constructor() {
        this.container = document.querySelector('#logs')
        this.clickCB = () => {}
    }

    fillCollisions(collisions) {
        this.container.innerHTML = ''

        for(const col of collisions) {
            const timeDiv = document.createElement('div')
            timeDiv.classList.add('timeStamp')
            timeDiv.addEventListener('click', () => {
                this.clickCB(col.time)
            })

            const textDiv = document.createElement('div')

            textDiv.textContent = `Time: ${col.time | 0}`

            timeDiv.appendChild(textDiv)

            for(const p of col.pairs) {
                const colDiv = document.createElement('div')
                colDiv.classList.add('pair')
                colDiv.textContent = `${p.droneA.label.text} - ${p.droneB.label.text}`

                timeDiv.appendChild(colDiv)
            }

            this.container.appendChild(timeDiv)
        }
    }

    onClick(f) {
        this.clickCB = f
    }
}

export default LogsUI
