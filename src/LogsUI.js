class LogsUI {
    constructor() {
        this.collisionsContainer = document.querySelector('#collisions')
        this.speedingsContainer = document.querySelector('#speedings')
        this.clickCB = () => {}
    }

    fill(container, objcts, formatCB) {
        container.innerHTML = ''

        for(const obj of objcts) {
            const timeDiv = document.createElement('div')
            timeDiv.classList.add('timeStamp')
            timeDiv.addEventListener('click', () => {
                this.clickCB(obj.time)
            })

            const textDiv = document.createElement('div')
            textDiv.textContent = `Time: ${obj.time | 0}`
            timeDiv.appendChild(textDiv)

            for(const e of obj.list) {
                const lDiv = document.createElement('div')
                lDiv.classList.add('list')
                lDiv.textContent = formatCB(e)
                timeDiv.appendChild(lDiv)
            }

            container.appendChild(timeDiv)
        }
    }

    fillCollisions(collisions) {
        this.fill(this.collisionsContainer, collisions, p => `${p.droneA.label.text} # ${p.droneB.label.text}`)
        if(this.collisionsContainer.childNodes.length === 0) {
            this.collisionsContainer.textContent = 'No collisions'
        }
    }

    fillSpeedings(excess) {
        this.fill(this.speedingsContainer, excess, d => `${d.label.text}`)
        if(this.speedingsContainer.childNodes.length === 0) {
            this.speedingsContainer.textContent = 'No speedings'
        }
    }

    onClick(f) {
        this.clickCB = f
    }
}

export default LogsUI
