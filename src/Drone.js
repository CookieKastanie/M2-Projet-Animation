class Drone {
    constructor(waypoints, droneMesh) {
        this.waypoints = waypoints
        this.droneMesh = droneMesh
        this.time = 0
        this.duration = this.waypoints[this.waypoints.length - 1].ms
    }

    forward(delta) {
        this.time += delta
        this.animAt(this.time)
    }

    animAt(ms) {
        ms = ms % this.duration

        let i = 1
        for(; i < this.waypoints.length; ++i) {
            const waypoint = this.waypoints[i]
            if(waypoint.ms > ms) break
        }
        
        const waypoint0 = this.waypoints[i - 1]
        const waypoint1 = this.waypoints[i]

        const t = (ms - waypoint0.ms) / (waypoint1.ms - waypoint0.ms)
        this.droneMesh.position.lerpVectors(
            waypoint0.position, waypoint1.position, t
        )

        //this.droneMesh.rotation.y = ms * 0.01
    }
}

export default Drone
