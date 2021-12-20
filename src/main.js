import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import { TimelineUI } from './TimelineUI'

import Datas from './Datas'
import Drone from './Drone'

const timelineUI = new TimelineUI()

const clock = new THREE.Clock()
const drones = []
let time = 0
let animationDuration = 0

const renderer = new THREE.WebGLRenderer({antialias: true})
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.01, 200)
camera.position.y = 2
camera.position.z = 2

const cameraControl = new OrbitControls(camera, renderer.domElement)
cameraControl.target.y = 2

const droneMeshGroup = {
    mesh: null,
    group: new THREE.Group(),
    trajectories: new THREE.Group()
}

const settings = {
    helpers: false,
    trajectories: false
}

const draw = ms => {
    const delta = clock.getDelta() * 1000 | 0
    if(timelineUI.isPLaying()) time += delta
    time = timelineUI.update(time)
    time = time % animationDuration

    cameraControl.update()
    for(const drone of drones) drone.animAt(time)
    renderer.render(scene, camera)
}

const createTrajectorieMesh = waypoints => {
    const points = []
    for(const p of waypoints) points.push(p.position) 
    return new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({color: 0xdd2222})
    )
}

const assignWaypoints = waypointsList => {
    drones.splice(0, drones.length)
    droneMeshGroup.group.clear()
    droneMeshGroup.trajectories.clear()
    animationDuration = 0

    for(const waypoints of waypointsList) {
        const droneMesh = droneMeshGroup.mesh.clone()
        const drone = new Drone(waypoints, droneMesh)
        drones.push(drone)
        droneMeshGroup.group.add(droneMesh)
        droneMeshGroup.trajectories.add(createTrajectorieMesh(waypoints))

        if(animationDuration < drone.duration) animationDuration = drone.duration
    }

    timelineUI.setDuration(animationDuration)
}

window.lw = p => {
    Datas.loadWaypoints(p).then(assignWaypoints)
}

Datas.loadAll().then(data => {
    scene.background = data.skybox
    droneMeshGroup.mesh = data.drone
    assignWaypoints(data.waypoints)
    scene.add(droneMeshGroup.group)
    scene.add(droneMeshGroup.trajectories)
    droneMeshGroup.trajectories.visible = settings.trajectories
    scene.add(data.sol)

    const directionalLight = new THREE.DirectionalLight(0xfff9c4, 2)
    directionalLight.position.set(-20, 10, 20)
    directionalLight.target.position.set(0, 0, 0)
    scene.add(directionalLight)

    //////////////////////////////

    const gui = new GUI()
    const settingsFolder = gui.addFolder('Settings')
    settingsFolder.add(settings, 'trajectories').onChange(b => droneMeshGroup.trajectories.visible = b)
    settingsFolder.open()

    //////////////////////////////

    renderer.setAnimationLoop(draw)
})

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}, false);
