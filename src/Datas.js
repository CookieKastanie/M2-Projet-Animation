import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'

const Datas = {
    async loadObject(path, loadMat = false) {
        return new Promise(resolve => {
            const objLoader = new OBJLoader()
            
            const lobj = () => objLoader.load(`${path}.obj`, obj => {
                obj.castShadow = true
                obj.receiveShadow = true
                resolve(obj)
            })
    
            if(loadMat) {
                const mtlLoader = new MTLLoader()
                mtlLoader.load(`${path}.mtl`, materials => {
                    materials.preload()
                    objLoader.setMaterials(materials)
                    lobj()
                })
            } else {
                lobj()
            }
        })
    },
    
    async loadSkybox() {
        return new Promise(resolve => {
            const textures_skybox = [
                'skybox/xp.jpg', 'skybox/xn.jpg',
                'skybox/yp.jpg', 'skybox/yn.jpg',
                'skybox/zp.jpg', 'skybox/zn.jpg',
            ]
    
            new THREE.CubeTextureLoader().load(textures_skybox, cubemap => {
                resolve(cubemap)
            })
        })
    },
    
    async loadWaypoints(path = './datas/waypoints.json') {
        return new Promise(async resolve => {
            const dataBlob = await fetch(path)
            const animation = await dataBlob.json()
    
            const result = []
            const { framerate } = animation
            for(const drone of animation.drones) {
                const finalWaypoints = []
    
                for(const waypoint of drone.waypoints) {
                    const { position } = waypoint
                    const scale = 1 / 100
                    finalWaypoints.push({
                        position: new THREE.Vector3(
                            position.lng_X, position.alt_Y, position.lat_Z
                        ).multiplyScalar(scale),
                        ms: (waypoint.frame / framerate) * 1000
                    })
                }
    
                result.push(finalWaypoints)
            }
    
            resolve(result)
        })
    },

    async loadAll() {
        const result = {}

        return new Promise(async (resolve, reject) => {
            try {
                result.waypoints = await this.loadWaypoints()
                
                result.drone = await this.loadObject('./objets/drone/dji600', true)

                result.sol = await this.loadObject('./objets/sol/sol', true)
                result.sol.position.y = -0.001

                result.skybox = await this.loadSkybox()
            } catch (error) {
                reject(error)
            }
            
            resolve(result);
        })
    }
}

export default Datas
