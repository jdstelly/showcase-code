// Written with inspiration by Joshua S. Inspired by the PS2 Jampack Winter 2002 demo disk.
// A small love letter to those programmers who filled my childhood with wonder and adventure.

import * as THREE from '/build/three.module.js';
import { GLTFLoader } from '/jsm/loaders/GLTFLoader';
// import { OrbitControls } from '/jsm/controls/OrbitControls';
import { Water } from '/jsm/objects/Water.js';
//=======================
//=======MISC VARS=======
//=======================
const assetsPath = '../../assets/';
let aquatics = [];
let statics = [];
let StaticEntities = [];
let StaticSubEntities = [];
let Entities = [];
let SubEntities = [];
let intersectEligibles = [];
let t = 0;
let c = 0;
let axis = new THREE.Vector3();
let forward = new THREE.Vector3(0, 0, -1);
let pt, radians, water;
let cameraUpdated = false;
let camPath;
let animationMixers = [];
//=======================
//=====THREEJS SETUP=====
//=======================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 200);
const gltfLoader = new GLTFLoader();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight - 57.67);

document.body.appendChild(renderer.domElement);
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight - 57.67);
    camera.aspect = window.innerWidth / (window.innerHeight - 57.67);
    camera.updateProjectionMatrix();
});
let clock = new THREE.Clock();
//=======CONTROLS=======
// const controls = new OrbitControls(camera, renderer.domElement);
//=======================
//========CLASSES========
//=======================
// STATIC ENTITY CLASS
class StaticEntity {
    constructor(entityName) {
        this.name = entityName;
        this.error = 0;
        this.points = [];
        this.groupObjects = [];
        this.mapped = false;
    }
    generateGroup() {
        let groupStatus = 'G' == this.name.slice(0, 1);
        // Static group number generation
        let groupNum = Math.floor(Math.random() * (6 - 3) + 3);
        if (groupNum > 0 && groupStatus) {
            // ASSET PREP
            if (/\d/.test(this.name)) {
                if (/\d/.test(this.name.slice(-2, -1))) {
                    this.objectFileName = this.name.slice(0, -2);
                }
                else {
                    this.objectFileName = this.name.slice(0, -1);
                }
            }
            else {
                this.objectFileName = this.name;
            }
            // CREATE GROUP OBJECTS
            for (let i = 0; i < groupNum; i++) {
                gltfLoader.load(`${assetsPath}objects/${this.objectFileName}.gltf`, (gltf) => {
                    let groupObject = gltf.scene;
                    if (gltf.animations.length > 0) {
                        let mixer = new THREE.AnimationMixer(groupObject);
                        let staticAnimation = mixer.clipAction(gltf.animations[0]);
                        animationMixers.push(mixer);
                        staticAnimation.play();
                    }
                    let thisObject = scene.getObjectByName(this.name);
                    groupObject.name = `${this.name}-groupie${[i]}`;
                    this.groupObjects.push(groupObject.name);
                    scene.add(groupObject);
                    // Generate offset from Master Static Entity
                    let offsetX = Math.random() * (40 - (-40)) + (-40);
                    let offsetZ = Math.random() * (40 - (-40)) + (-40);
                    groupObject.position.set(thisObject.position.x + offsetX, thisObject.position.y, thisObject.position.z + offsetZ);
                    createSubStatic(`${groupObject.name}`);
                    thisObject.visible = false;
                });
            }
        }
    }
    mapEntity() {
        if (this.mapped == false && this.name != 'P_Seascape') {
            // Use Raycasting to map the 'floating' group entities to the terrain
            let thisObject = scene.getObjectByName(this.name);
            let intersect;
            let dir = new THREE.Vector3();
            thisObject.getWorldDirection(dir);
            dir.set(0, -1, 0);
            let raycaster = new THREE.Raycaster(thisObject.position, dir);
            intersect = raycaster.intersectObjects(intersectEligibles);
            if (intersect.length != 0) {
                let height = intersect[0].distance;
                this.mapped = true;
                thisObject.position.y -= height;
            }
        }
    }
}
// STATIC SUB ENTITY CLASS
class StaticSubEntity {
    constructor(entityName) {
        this.name = entityName;
        this.error = 0;
        this.points = [];
        this.groupObjects = [];
        this.mapped = false;
    }
    mapSubEntity() {
        if (this.mapped == false) {
            // Use Raycasting to map the 'floating' group entities to the terrain
            let thisObject = scene.getObjectByName(this.name);
            let intersect;
            let dir = new THREE.Vector3();
            thisObject.getWorldDirection(dir);
            dir.set(0, -1, 0);
            let raycaster = new THREE.Raycaster(thisObject.position, dir);
            intersect = raycaster.intersectObjects(intersectEligibles);
            if (intersect.length != 0) {
                let height = intersect[0].distance;
                this.mapped = true;
                thisObject.position.y -= height;
            }
        }
    }
}
// ENTITY CLASS
class Entity {
    constructor(entityName) {
        this.name = entityName;
        this.error = 0;
        this.points = [];
        this.groupObjects = [];
    }
    generateGroup() {
        let groupStatus = 'G' == this.name.slice(0, 1);
        // 'School' number generation
        let groupNum = Math.floor(Math.random() * (12 - 6) + 6);
        if (groupNum > 0 && groupStatus) {
            //ASSET PREP
            if (/\d/.test(this.name)) {
                if (/\d/.test(this.name.slice(-2, -1))) {
                    this.objectFileName = this.name.slice(0, -2);
                }
                else {
                    this.objectFileName = this.name.slice(0, -1);
                }
            }
            else {
                this.objectFileName = this.name;
            }
            //CREATE GROUP OBJECTS
            for (let i = 0; i < groupNum; i++) {
                gltfLoader.load(`${assetsPath}objects/${this.objectFileName}.gltf`, (gltf) => {
                    let groupObject = gltf.scene;
                    groupObject.name = `${this.name}-groupie${[i]}`;
                    if (gltf.animations.length > 0) {
                        let mixer = new THREE.AnimationMixer(groupObject);
                        let entityAnimation = mixer.clipAction(gltf.animations[0]);
                        animationMixers.push(mixer);
                        entityAnimation.play();
                    }
                    this.groupObjects.push(groupObject.name);
                    scene.add(groupObject);
                    createSubEntity(`${groupObject.name}`, this.points);
                    //Generate offset from Master Entity
                    let offsetX = Math.random() * (3 - (-3)) + (-3);
                    let offsetY = Math.random() * (3 - (-3)) + (-3);
                    let offsetZ = Math.random() * (3 - (-3)) + (-3);
                    groupObject.position.set(offsetX, offsetY, offsetZ);
                });
            }
        }
    }
    generatePath() {
        let pointNum = Math.floor(Math.random() * (10 - (4)) + (4));
        let curveVectors = [];
        let x, y, z;
        for (let i = 0; i < pointNum; i++) {
            for (let j = 0; j < 3; j++) {
                if (j = 1) {
                    x = Math.floor(Math.random() * (80 - (-80)) + (-80));
                }
                if (j = 2) {
                    y = Math.floor(Math.random() * (25 - (7.5)) + (7.5));
                }
                if (j = 3) {
                    z = Math.floor(Math.random() * (80 - (-80)) + (-80));
                }
            }
            this.points.push([x, y, z]);
        }
        for (let i = 0; i < this.points.length; i++) {
            curveVectors.push(new THREE.Vector3(this.points[i][0], this.points[i][1], this.points[i][2]));
        }
        this.path = new THREE.CatmullRomCurve3(curveVectors, true);
        let pathPoints = this.path.getPoints(this.points.length * 10);
        let pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
        let pathMaterial = new THREE.LineBasicMaterial({ color: 0xcc00cc });
        let pathObject = new THREE.Line(pathGeometry, pathMaterial);
        pathObject.visible = false;
        this.error = 0;
        scene.add(pathObject);
    }
    processPath() {
        try {
            if (this.error == 0) {
                pt = this.path.getPoint(t);
                scene.getObjectByName(this.name).position.set(pt.x, pt.y, pt.z);
                let tangent = this.path.getTangent(t).normalize();
                axis.crossVectors(forward, tangent).normalize();
                radians = Math.acos(forward.dot(tangent));
                scene.getObjectByName(this.name).quaternion.setFromAxisAngle(axis, radians);
            }
        }
        catch (_a) {
            this.error = 1;
            this.reloadEntity();
        }
    }
    reloadEntity() {
        this.generatePath();
        this.generateGroup();
    }
}
;
// SUB-ENTITY CLASS
class SubEntity {
    constructor(entityName, masterPoints) {
        this.name = entityName;
        this.masterPoints = masterPoints;
        this.points = [];
    }
    generateSubPath() {
        //Introduce 'noise' to master points
        for (let i = 0; i < this.masterPoints.length; i++) {
            this.points.push([
                this.masterPoints[i][0] + (Math.random() * (5 - (-5)) + (-5)),
                this.masterPoints[i][1] + (Math.random() * (5 - (-5)) + (-5)),
                this.masterPoints[i][2] + (Math.random() * (5 - (-5)) + (-5))
            ]);
        }
        // Compose unique points into curve
        let curveVectors = [];
        for (let i = 0; i < this.points.length; i++) {
            curveVectors.push(new THREE.Vector3(this.points[i][0], this.points[i][1], this.points[i][2]));
        }
        this.path = new THREE.CatmullRomCurve3(curveVectors, true);
        let pathPoints = this.path.getPoints(this.points.length * 10);
        let pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
        let pathMaterial = new THREE.LineBasicMaterial({ color: 0xffcc33 });
        let pathObject = new THREE.Line(pathGeometry, pathMaterial);
        pathObject.visible = false;
        scene.add(pathObject);
    }
    processPath() {
        // set the marker position
        pt = this.path.getPoint(t);
        scene.getObjectByName(this.name).position.set(pt.x, pt.y, pt.z);
        // get the tangent to the curve
        let tangent = this.path.getTangent(t).normalize();
        // calculate the axis to rotate around
        axis.crossVectors(forward, tangent).normalize();
        // calculate the angle between the forward vector and the tangent
        radians = Math.acos(forward.dot(tangent));
        // set the quaternion
        scene.getObjectByName(this.name).quaternion.setFromAxisAngle(axis, radians);
    }
}
//=======================
//=======FUNCTIONS=======
//=======================
function generateStatics() {
    let preParsedStatics = {
        'P_Seascape': 1,
        'P_Shipwreck': 1,
        'P_TreasureChestA': 1,
        'P_TreasureChestB': 1,
        'G_Seaweed_Big': 3,
        'G_Seaweed_Bigger': 2,
        'G_RockA': 2,
        'G_RockB': 5,
        'G_StarfishA': 3,
        'G_StarfishB': 3,
        'G_StarfishC': 3,
        'G_Coral_Red': 2,
        'G_Coral_Blue': 2,
        'G_Coral_Pink': 2,
        'G_Coral_Yellow': 2,
        'G_Coral_Green': 2
    };
    let staticsKeys = Object.keys(preParsedStatics);
    let staticsValues = Object.values(preParsedStatics);
    for (let i = 0; i < staticsKeys.length; i++) {
        if (staticsValues[i] > 1) {
            for (let k = 0; k < staticsValues[i]; k++) {
                statics.push(`${staticsKeys[i]}${k}`);
            }
        }
        else if (staticsValues[i] == 1) {
            statics.push(staticsKeys[i]);
        }
    }
    for (let i = 0; i < statics.length; i++) {
        let offsetX, offsetY, offsetZ;
        if (statics[i] == 'P_Seascape') {
            offsetX = 0;
            offsetY = 5;
            offsetZ = 0;
        }
        else if (statics[i] == 'P_Shipwreck') {
            offsetX = 10;
            offsetY = 5;
            offsetZ = 0;
        }
        else if (statics[i] == 'P_TreasureChestA') {
            offsetX = 15;
            offsetY = -4;
            offsetZ = 0;
        }
        else if (statics[i] == 'P_TreasureChestB') {
            offsetX = 5;
            offsetY = -4;
            offsetZ = 0;
        }
        else {
            offsetX = Math.random() * (75 - (-75)) + (-75);
            offsetY = 10;
            offsetZ = Math.random() * (75 - (-75)) + (-75);
        }
        loadAsset(`${statics[i]}`, [offsetX, offsetY, offsetZ]).then(() => {
            StaticEntities.push(new StaticEntity(`${statics[i]}`));
        });
    }
}
function generateAquatics() {
    let preParsedAquatics = {
        'Fish_Shark': 1,
        'Fish_Turtle': 1,
        'Fish_Barracuda': 1,
        'G_Fish_A': 1,
        'G_Fish_B': 1,
        'G_Fish_C': 1,
        'G_Fish_D': 1,
        'G_Fish_E': 1,
        'G_Fish_F': 1
    };
    let aquaticsKeys = Object.keys(preParsedAquatics);
    let aquaticsValues = Object.values(preParsedAquatics);
    for (let i = 0; i < aquaticsKeys.length; i++) {
        if (aquaticsValues[i] > 1) {
            for (let k = 0; k < aquaticsValues[i]; k++) {
                aquatics.push(`${aquaticsKeys[i]}${k}`);
            }
        }
        else if (aquaticsValues[i] == 1) {
            aquatics.push(aquaticsKeys[i]);
        }
    }
}
function createSubEntity(name, points) {
    SubEntities.push(new SubEntity(name, points));
    for (let i = 0; i < SubEntities.length; i++) {
        if (SubEntities[i].name == name) {
            SubEntities[i].generateSubPath();
        }
    }
}
function createSubStatic(name) {
    let thisSubStaticEntity = new StaticSubEntity(name);
    thisSubStaticEntity.mapSubEntity()
    StaticSubEntities.push(thisSubStaticEntity)

}
function loadAsset(objectName, position = []) {
    let objectFileName;
    return new Promise((resolve, reject) => {
        //Check for number in name
        if (/\d/.test(objectName)) {
            if (/\d/.test(objectName.slice(-2, -1))) {
                objectFileName = objectName.slice(0, -2);
            }
            else {
                objectFileName = objectName.slice(0, -1);
            }
        }
        else {
            objectFileName = objectName;
        }
        gltfLoader.load(`${assetsPath}objects/${objectFileName}.gltf`, (gltf) => {
            let object = gltf.scene;
            object.name = objectName;
            if (gltf.animations.length > 0) {
                let mixer = new THREE.AnimationMixer(object);
                let entityAnimation = mixer.clipAction(gltf.animations[0]);
                animationMixers.push(mixer);
                entityAnimation.play();
            }
            if (objectName == "P_Seascape") {
                object.side = THREE.DoubleSide
                intersectEligibles.push(object.children[0]);
            }
            if (objectName == "P_Shipwreck") {
                object.rotation.x = Math.PI / 12;
                object.rotation.y = Math.PI / 2;
                object.rotation.z = Math.PI / 14;
            }
            if (objectName == "P_TreasureChestA") {
                object.rotation.y = -Math.PI / 4;
            }
            if (objectName == "P_TreasureChestB") {
                object.rotation.y = Math.PI / 4;
            }
            object.position.set(position[0], position[1], position[2]);
            scene.add(object);
            resolve(gltf);
        });
    });
}
function setupScene() {
    for (let i = 0; i < aquatics.length; i++) {
        loadAsset(`${aquatics[i]}`, [0, 0, 0]).then(() => {
            if (aquatics[i].includes('Fish')) {
                Entities.push(new Entity(`${aquatics[i]}`));
            }
            if (i == aquatics.length - 1) {
                const color = 0xFFFFFF;
                const intensity = 3.5;
                const light = new THREE.DirectionalLight(color, intensity);
                const ambientLight = new THREE.AmbientLight(0x00CCFF, .5);
                scene.background = new THREE.Color(0x1ea49f);
                scene.fog = new THREE.Fog(0x1ea49f, 15, 85);
                light.position.set(0, 20, 0);
                scene.add(light);
                scene.add(ambientLight);
                scene.add(camera);
                // Water
                const waterGeometry = new THREE.PlaneBufferGeometry(300, 300);
                water = new Water(waterGeometry, {
                    textureWidth: 1024,
                    textureHeight: 1024,
                    waterNormals: new THREE.TextureLoader().load(`${assetsPath}textures/water.jpg`, function (texture) {
                        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                    }),
                    alpha: 1.0,
                    waterColor: 0x1ea49f,
                    sunDirection: new THREE.Vector3(),
                    sunColor: 0xffffff,
                    distortionScale: 3.7,
                });
                water.rotation.x = Math.PI / 2;
                water.position.y = 30;
                scene.add(water);
                
                // Generate groups and paths
                StaticEntities.forEach(s => s.generateGroup());
                Entities.forEach(e => e.generateGroup());
                Entities.forEach(e => e.generatePath());
                // Starts the scene once all assets are loaded
                animate();
            }
        });
    }
}
function generateCamPath() {
    let points = [];
    let pointNum = Math.floor(Math.random() * (10 - (10)) + (10));
    let curveVectors = [];
    let x, y, z;
    for (let i = 0; i < pointNum; i++) {
        for (let j = 0; j < 3; j++) {
            if (j = 1) {
                x = Math.floor(Math.random() * (75 - (-75)) + (-75));
            }
            if (j = 2) {
                y = Math.floor(Math.random() * (20 - (15)) + (15));
            }
            if (j = 3) {
                z = Math.floor(Math.random() * (75 - (-75)) + (-75));
            }
        }
        points.push([x, y, z]);
    }
    //Creates closed path
    points[points.length - 1] = points[0];
    for (let i = 0; i < points.length; i++) {
        curveVectors.push(new THREE.Vector3(points[i][0], points[i][1], points[i][2]));
    }
    camPath = new THREE.CatmullRomCurve3(curveVectors, true);
    let pathPoints = camPath.getPoints(points.length * 10);
    let pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
    let pathMaterial = new THREE.LineBasicMaterial({ color: 0xcc00cc });
    let camPathObject = new THREE.Line(pathGeometry, pathMaterial);
    camPathObject.visible = false;
    scene.add(camPathObject);
}
function processCamPath() {
    pt = camPath.getPoint(c);
    camera.position.set(pt.x, pt.y, pt.z);
    let tangent = camPath.getTangent(t).normalize();
    axis.crossVectors(forward, tangent).normalize();
    radians = Math.acos(forward.dot(tangent));
    camera.lookAt(0, 0, 0);
}
function camProfile(profile) {
    switch (profile) {
        case 1:
            generateCamPath();
            cameraUpdated = true;
        case 2:
        // Fish View 1
        case 3:
        // Fish View 2
        case 4:
        // Fish View 3
        case 5:
        // Fixed Scene View
        case 6:
        // Skyward View
    }
}
function updateCamera() {
    if (cameraUpdated == false) {
        camProfile(1);
    }
    processCamPath();
}
//=======================
//=======EXECUTION=======
//=======================
generateStatics();
generateAquatics();
setupScene();
//=======================
//=======================
//=======ANIMATION=======
//=======================
//=======================
let animate = function () {
    let delta = clock.getDelta();
    animationMixers.forEach(m => m.update(delta));
    t = (t >= 1) ? 0 : t += 0.0002;
    c = (c >= 1) ? 0 : c += 0.0001;
    Entities.forEach(e => e.processPath());
    SubEntities.forEach(se => se.processPath());
    // controls.update();
    updateCamera();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};
