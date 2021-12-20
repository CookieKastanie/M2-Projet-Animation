import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';

import Datas from './Datas'
import Drone from './Drone'

const drones = []

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
    cameraControl.update()
    //for(const drone of drones) drone.forward(16)
    for(const drone of drones) drone.animAt(ms)
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
    droneMeshGroup.group.clear()
    droneMeshGroup.trajectories.clear()
    for(const waypoints of waypointsList) {
        const droneMesh = droneMeshGroup.mesh.clone()
        drones.push(new Drone(waypoints, droneMesh));
        droneMeshGroup.group.add(droneMesh)
        droneMeshGroup.trajectories.add(createTrajectorieMesh(waypoints))
    }
}

window.lw = p => {
    Datas.loadWaypoints(p).then(assignWaypoints)
}

Datas.loadAll().then(data => {
    console.log(data)

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
    directionalLight.castShadow = true
    scene.add(directionalLight)
    scene.add(directionalLight.target)


    /*directionalLight.target.updateMatrixWorld()
    scene.add(new THREE.CameraHelper(directionalLight.shadow.camera))

    const helper = new THREE.DirectionalLightHelper(directionalLight)
    scene.add(helper)*/

    scene.castShadow = true

    console.log(scene)


    const gui = new GUI()
    const settingsFolder = gui.addFolder('Settings')
    settingsFolder.add(settings, 'trajectories').onChange(b => droneMeshGroup.trajectories.visible = b)
    settingsFolder.open()


    renderer.shadowMap.enabled = true
    renderer.setAnimationLoop(draw)
})

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}, false);
