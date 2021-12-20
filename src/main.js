import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';

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

const labelRenderer = new CSS2DRenderer()
labelRenderer.setSize(window.innerWidth, window.innerHeight)
labelRenderer.domElement.style.position = 'absolute'
labelRenderer.domElement.style.top = '0px'
document.body.appendChild(labelRenderer.domElement)

//////////////////////////////////////////////////

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.01, 200)
camera.position.y = 2
camera.position.z = 5

const cameraControl = new OrbitControls(camera, labelRenderer.domElement)
cameraControl.target.y = 2

const helpers = {}

const droneMeshGroup = {
    mesh: null,
    group: new THREE.Group(),
    trajectories: new THREE.Group(),
    labels: new THREE.Group(),
    lines: new THREE.Group()
}

const settings = {
    axes: false,
    grid: false,
    labels: false,
    groundLine: false,
    trajectories: false
}

const draw = () => {
    const delta = clock.getDelta() * 1000 | 0
    if(timelineUI.isPLaying()) time += delta
    time = timelineUI.update(time)
    time = time % animationDuration

    cameraControl.update()
    for(const drone of drones) drone.animAt(time)
    renderer.render(scene, camera)
    labelRenderer.render(scene, camera);
}

const createTrajectorieMesh = waypoints => {
    const points = []
    for(const p of waypoints) points.push(p.position) 
    return new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({color: 0xdd2222})
    )
}

const createLabel = text => {
    const div = document.createElement('div')
    div.className = 'label'
    div.textContent = text
    const obj = new CSS2DObject(div)
    obj.visible = settings.labels
    return obj
}

const createLineMesh = () => {
    const points = [new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 0)]
    return new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({color: 0x22dd22})
    )
} 

const assignWaypoints = waypointsList => {
    drones.splice(0, drones.length)
    droneMeshGroup.group.clear()
    droneMeshGroup.trajectories.clear()
    droneMeshGroup.labels.clear()
    droneMeshGroup.lines.clear()

    animationDuration = 0
    time = 0

    const lineMesh = createLineMesh()

    let i = 0
    for(const waypoints of waypointsList) {
        const droneMesh = droneMeshGroup.mesh.clone()
        const label = createLabel(`Drone ${i++}`)
        const line = lineMesh.clone()
        const drone = new Drone(waypoints, droneMesh, label, line)
        drones.push(drone)
    
        droneMeshGroup.group.add(droneMesh)
        droneMeshGroup.trajectories.add(createTrajectorieMesh(waypoints))
        droneMeshGroup.labels.add(label)
        droneMeshGroup.lines.add(line)

        animationDuration = Math.max(animationDuration, drone.duration)
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
    scene.add(droneMeshGroup.labels)
    scene.add(droneMeshGroup.lines)
    droneMeshGroup.trajectories.visible = settings.trajectories
    droneMeshGroup.lines.visible = settings.groundLine
    scene.add(data.sol)

    const directionalLight = new THREE.DirectionalLight(0xfff9c4, 2)
    directionalLight.position.set(-20, 10, 20)
    directionalLight.target.position.set(0, 0, 0)
    scene.add(directionalLight)

    helpers.axes = new THREE.AxesHelper(5)
    helpers.axes.visible = settings.axes
    scene.add(helpers.axes)

    helpers.grid = new THREE.GridHelper(30, 30)
    helpers.grid.visible = settings.grid
    scene.add(helpers.grid)

    //////////////////////////////

    const gui = new GUI()
    const settingsFolder = gui.addFolder('Settings')
    settingsFolder.add(settings, 'axes').onChange(b => helpers.axes.visible = b)
    settingsFolder.add(settings, 'grid').onChange(b => helpers.grid.visible = b)
    settingsFolder.add(settings, 'labels').onChange(b => {
        droneMeshGroup.labels.children.forEach(child => child.visible = b)
    })
    settingsFolder.add(settings, 'groundLine').onChange(b => droneMeshGroup.lines.visible = b)
    settingsFolder.add(settings, 'trajectories').onChange(b => droneMeshGroup.trajectories.visible = b)
    settingsFolder.open()

    //////////////////////////////

    renderer.setAnimationLoop(draw)
})

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
}, false);
