import * as THREE from 'three'

class Drone {
    constructor(waypoints, droneMesh, label, line, hitbox) {
        this.waypoints = waypoints
        this.droneMesh = droneMesh
        this.label = label
        this.line = line
        this.hitbox = hitbox
        this.hitboxSize = 1
        this.duration = this.waypoints[this.waypoints.length - 1].ms
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

        this.label.position.set(
            this.droneMesh.position.x,
            this.droneMesh.position.y + 1,
            this.droneMesh.position.z
        )

        this.line.position.copy(this.droneMesh.position)
        this.line.scale.y = this.droneMesh.position.y

        this.hitbox.position.copy(this.droneMesh.position)
        this.hitbox.scale.set(this.hitboxSize, this.hitboxSize, this.hitboxSize)
    }

    hitOther(o) {
        const tmp = new THREE.Vector3()
        tmp.copy(o.droneMesh.position)
        tmp.sub(this.droneMesh.position)

        const dSq = tmp.dot(tmp)
        const l = this.hitboxSize + o.hitboxSize

        return dSq < l * l
    }
}

export default Drone
