class TimelineUI {
    constructor() {
        this.playButton = document.querySelector('#play-button')
        this.timeSlider = document.querySelector('#time-slider')

        this.setDuration(1)
        this.timeSlider.step = 1

        this.play = true
        this.playButton.addEventListener('click', () => {
            this.play = !this.play
            this.playButton.textContent = this.play ? '||' : '>'
        })

        this.targerTime = 0
        this.click = false
        const mousePose = e => {
            const t = ((e.clientX - this.timeSlider.offsetLeft) / this.timeSlider.clientWidth)
            this.targerTime = Math.min(Math.max(t, 0), 1) * this.timeSlider.max
        }

        this.timeSlider.addEventListener('mousedown', e => {
            this.click = true
            mousePose(e)
        })

        this.timeSlider.addEventListener('mouseup', e => {
            this.click = false
            mousePose(e)
        })

        this.timeSlider.addEventListener('mousemove', e => {
            if(this.click === true) mousePose(e)
        })
    }

    setDuration(d = 1) {
        this.timeSlider.min = 0
        this.timeSlider.max = Math.max(d - 1, 0)
    }

    update(time) {
        if(this.click) time = this.targerTime
        else this.timeSlider.value = time

        return time
    }

    isPLaying() {
        return this.play
    }
}

export default TimelineUI
