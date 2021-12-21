import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'

class Utils {
    static createTrajectorieMesh(waypoints) {
        const points = []
        for(const p of waypoints) points.push(p.position) 
        return new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(points),
            new THREE.LineBasicMaterial({color: 0xdd2222})
        )
    }
    
    static createLabel(text) {
        const div = document.createElement('div')
        div.className = 'label'
        div.textContent = text
        const obj = new CSS2DObject(div)
        obj.text = text
        return obj
    }
    
    static createLineMesh() {
        const points = [new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 0)]
        return new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(points),
            new THREE.LineBasicMaterial({color: 0x22dd22})
        )
    }

    static createShpereMesh() {
        return new THREE.Mesh(
            new THREE.SphereGeometry(1, 32, 32),
            new THREE.MeshBasicMaterial({color: 0xdddddd, transparent: true, opacity: 0.4})
        )
    }
}

export default Utils
