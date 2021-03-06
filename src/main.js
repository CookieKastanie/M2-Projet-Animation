import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'

import TimelineUI from './TimelineUI'
import Datas from './Datas'
import Drone from './Drone'
import Utils from './Utils'
import LogsUI from './LogsUI'

const timelineUI = new TimelineUI()
const logsUI = new LogsUI()
const fileInput = document.querySelector('#file-input')

const clock = new THREE.Clock()
const drones = []
let time = 0
let animationDuration = 0

logsUI.onClick(t => time = t)

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
camera.position.set(5, 3, 5)

const cameraControl = new OrbitControls(camera, labelRenderer.domElement)
cameraControl.target.set(0, 2, 0)

const helpers = {}

const droneMeshGroup = {
    mesh: null,
    group: new THREE.Group(),
    trajectories: new THREE.Group(),
    labels: new THREE.Group(),
    lines: new THREE.Group(),
    hitboxes: new THREE.Group()
}

const settings = {
    axes: false,
    grid: false,
    labels: false,
    groundLine: false,
    trajectories: false,
    hitboxes: false,
    hitboxSize: 0.6,
    maxSpeed: 4
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

const assignWaypoints = waypointsList => {
    drones.splice(0, drones.length)
    droneMeshGroup.group.clear()
    droneMeshGroup.trajectories.clear()
    droneMeshGroup.labels.clear()
    droneMeshGroup.lines.clear()
    droneMeshGroup.hitboxes.clear()

    animationDuration = 0
    time = 0

    const lineMesh = Utils.createLineMesh()
    const hitboxMesh = Utils.createShpereMesh()

    let i = 0
    for(const waypoints of waypointsList) {
        const droneMesh = droneMeshGroup.mesh.clone()
        const label = Utils.createLabel(`Drone ${i++}`)
        label.visible = settings.labels
        const line = lineMesh.clone()
        const hitbox = hitboxMesh.clone()
        const drone = new Drone(waypoints, droneMesh, label, line, hitbox)
        drone.hitboxSize = settings.hitboxSize
        drones.push(drone)
    
        droneMeshGroup.group.add(droneMesh)
        droneMeshGroup.trajectories.add(Utils.createTrajectorieMesh(waypoints))
        droneMeshGroup.labels.add(label)
        droneMeshGroup.lines.add(line)
        droneMeshGroup.hitboxes.add(hitbox)

        animationDuration = Math.max(animationDuration, drone.duration)
    }

    timelineUI.setDuration(animationDuration)

    logsUI.fillCollisions(Utils.getCollisions(drones, animationDuration))
    logsUI.fillSpeedings(Utils.getSpeedings(drones, animationDuration, settings.maxSpeed))
}

Datas.loadAll().then(data => {
    scene.background = data.skybox
    droneMeshGroup.mesh = data.drone
    assignWaypoints(data.waypoints)
    scene.add(droneMeshGroup.group)
    scene.add(droneMeshGroup.trajectories)
    scene.add(droneMeshGroup.labels)
    scene.add(droneMeshGroup.lines)
    scene.add(droneMeshGroup.hitboxes)
    droneMeshGroup.trajectories.visible = settings.trajectories
    droneMeshGroup.lines.visible = settings.groundLine
    droneMeshGroup.hitboxes.visible = settings.hitboxes
    scene.add(data.sol)

    const directionalLight = new THREE.DirectionalLight(0xfff9c4, 3)
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
    settingsFolder.add(settings, 'hitboxes').onChange(b => droneMeshGroup.hitboxes.visible = b)

    let collsTimeoutId = 0
    settingsFolder.add(settings, 'hitboxSize', 0, 10, 0.01).onChange(v => {
        drones.forEach(d => d.hitboxSize = v)

        // petit delai avant de recalculer les collisions
        if(collsTimeoutId) clearTimeout(collsTimeoutId) 
        collsTimeoutId = setTimeout(() => {
            logsUI.fillCollisions(Utils.getCollisions(drones, animationDuration))
            collsTimeoutId = 0
        }, 500)
    })

    let speedsTimeoutId = 0
    settingsFolder.add(settings, 'maxSpeed', 0, 10, 0.01).onChange(v => {
        if(speedsTimeoutId) clearTimeout(speedsTimeoutId) 
        speedsTimeoutId = setTimeout(() => {
            logsUI.fillSpeedings(Utils.getSpeedings(drones, animationDuration, settings.maxSpeed))
            speedsTimeoutId = 0
        }, 500)
    })
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

fileInput.addEventListener('change', e => {
    Utils.fileToJSON(e.target.files[0])
    .then(data => assignWaypoints(Utils.parseAnimationJSON(data)))
})
