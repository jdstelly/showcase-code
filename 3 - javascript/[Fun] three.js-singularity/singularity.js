let scene,
    camera,
    renderer

let orbs = [];
let arcs = [];
let particles = [];
let coreTheta = 0;
let camTheta = 0;
let coreLight, core;

const acceptableColors = [0x66FF00, 0x1974D2, 0x08E8DE, 0xFFF000, 0xFFAA1D, 0xFF007F];
const colorChoice = Math.floor(Math.random() * acceptableColors.length);
const color = acceptableColors[colorChoice];
const createArcDistance = 10;
const destroyArcDistance = 20;

// ===================
// ======CLASSES======
// ===================

// ORB CLASS
class Orb {
    constructor() {
        
        this.orbitRadius = Math.floor(Math.random() * (40 - 10) + 10);
        this.orientation = Math.floor(Math.random() * (6 - 1) + 1);
        this.theta = 0;
        this.dTheta = 2 * Math.PI / (Math.floor(Math.random() * (400 - 250) + 250));
        this.yFactor = Math.floor(Math.random() * (Math.PI - 0) + 0);

        let geometry = new THREE.SphereGeometry(1.5, 4, 4);
        let material = new THREE.MeshPhongMaterial({color: 0xffffff, 
                                                    shininess: 100,
                                                    side: THREE.DoubleSide,
                                                    specular: color,
                                                    emissive: color,
                                                    emissiveIntensity: 0.05});
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.x = Math.floor(Math.random() * (15 - (-15)) + (-15));
        this.mesh.position.y = Math.floor(Math.random() * (5 - (-5)) + (-5));
        this.mesh.position.z = Math.floor(Math.random() * (10 - (-10)) + (-10));
        scene.add(this.mesh);
    }

    move() {
        this.theta += this.dTheta;

        if (this.orientation == 1) {
            this.mesh.position.x = this.orbitRadius * Math.sin(this.theta);
            this.mesh.position.y = this.orbitRadius * Math.cos(this.theta + this.yFactor);
        } else if (this.orientation == 2) {
            this.mesh.position.x = this.orbitRadius * Math.sin(this.theta);
            this.mesh.position.z = this.orbitRadius * Math.cos(this.theta);
        } else if (this.orientation == 3) {
            this.mesh.position.y = this.orbitRadius * Math.sin(this.theta + this.yFactor);
            this.mesh.position.x = this.orbitRadius * Math.cos(this.theta);
        } else if (this.orientation == 4) {
            this.mesh.position.y = this.orbitRadius * Math.sin(this.theta + this.yFactor);
            this.mesh.position.z = this.orbitRadius * Math.cos(this.theta);
        } else if (this.orientation == 5) {
            this.mesh.position.z = this.orbitRadius * Math.sin(this.theta);
            this.mesh.position.x = this.orbitRadius * Math.cos(this.theta);
        } else if (this.orientation == 6) {
            this.mesh.position.z = this.orbitRadius * Math.sin(this.theta);
            this.mesh.position.y = this.orbitRadius * Math.cos(this.theta + this.yFactor);
        }
    }
};

// ARC CLASS
class Arc {
    constructor(sourceObj, destinationObj) {

    this.source = sourceObj;
    this.destination = destinationObj;

    let lineGeom = new THREE.Geometry();
    lineGeom.vertices.push(this.source.position);
    lineGeom.vertices.push(this.destination.position);
    let lineMat = new THREE.LineBasicMaterial({
            color: color
    });

    this.line = new THREE.Line(lineGeom, lineMat);
    scene.add(this.line);

    }

    filter() {
        let xD = this.source.position.x - this.destination.position.x;
        let yD = this.source.position.y - this.destination.position.y;
        let zD = this.source.position.z - this.destination.position.z;
        let xEx = xD >= destroyArcDistance || xD <= -destroyArcDistance;
        let yEx = yD >= destroyArcDistance || yD <= -destroyArcDistance;
        let zEx = zD >= destroyArcDistance || zD <= -destroyArcDistance;

        this.line.geometry.verticesNeedUpdate = true;

        if (xEx || yEx || zEx) {
                scene.remove(this.line);
                arcs.splice(arcs.indexOf(this), 1);
        }
    }
};

// PARTICLE CLASS
class Particle {
    constructor() {
    let originX = Math.random() * (75 - (-75)) + (-75);
    let originY = Math.random() * (75 - (-75)) + (-75);
    let originZ = Math.random() * (75 - (-75)) + (-75);
    this.originPos = [originX, originY, originZ];
    let targetPos = [0, 0, 0];
    let colors = [11, 11, 11];
    this.life = 0;
    
    let geometry = new THREE.BufferGeometry({color: 0x00ff00});
    let material = new THREE.PointsMaterial( { size: 0.2, vertexColors: true } );
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( this.originPos, 3 ) );
    geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
    
    this.particle = new THREE.Points( geometry, material );

    let xD = this.originPos[0] - targetPos[0];
    let yD = this.originPos[1] - targetPos[1];
    let zD = this.originPos[2] - targetPos[2];
    this.particleSpeedX = xD / 200;
    this.particleSpeedY = yD / 200;
    this.particleSpeedZ = zD / 200;

    scene.add( this.particle );

    }

    disperse() {         

        if (this.life >= 500 ||
            (this.life > 200 && (this.particle.position.x >= -0.5 || this.particle.position.x <= 0.5))) {
            scene.remove(this.particle);
            particles.splice(particles.indexOf(this), 1);
        } else {
                this.particle.position.x -= this.particleSpeedX;
                this.particle.position.y -= this.particleSpeedY;
                this.particle.position.z -= this.particleSpeedZ;
                this.life += 1;
        }
    }

};

// ===================
// =====FUNCTIONS=====
// ===================

// CREATE CORE
let createCore = function() {

    let coreGeometry = new THREE.SphereGeometry(2.5, 6, 6);
    let coreMaterial = new THREE.MeshPhongMaterial({
                                                    color: color,
                                                    emissive: color,
                                                    emissiveIntensity: 1,
                                                    side: THREE.DoubleSide});

    core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

}

// CREATE ORBS
let createOrbs = function() {        

    for (let i = 0; i < 8; i++) {
        orbs.push(new Orb());
    };

};

// CREATE ARCS
let createArc = function(sourceOrb, destinationOrb) {

    let uniqueArc = 1;

    for (let i = 0; i < arcs.length; i++) {
        if (arcs[i].source == sourceOrb && arcs[i].destination == destinationOrb) {
            uniqueArc = 0;
        }
    }

    let xD = sourceOrb.position.x - destinationOrb.position.x
    let yD = sourceOrb.position.y - destinationOrb.position.y
    let zD = sourceOrb.position.z - destinationOrb.position.z
    let xCr = xD <= createArcDistance && xD >= -createArcDistance;
    let yCr = yD <= createArcDistance && yD >= -createArcDistance;
    let zCr = zD <= createArcDistance && zD >= -createArcDistance;

    if (uniqueArc && xCr && yCr && zCr)
    {
        arcs.push(new Arc(sourceOrb, destinationOrb));
    }

};

// CREATE PARTICLES
let createParticles = function() {

    particles.push(new Particle());

}

//MOVE CAMERA
let moveCamera = function() {

    let dTheta;
    dTheta = -0.005;
    camTheta -= dTheta;

    // camera.position.set(0, 0, 70);
    camera.position.x = 50 * Math.sin(camTheta);
    camera.position.z = 50 * Math.cos(camTheta);

    camera.lookAt(0, 0, 0);

}

// MOVE CORE
let moveCore = function() {

    coreTheta += 0.75;

    core.position.x = .15 * Math.sin(coreTheta);
    core.position.y = .15 * Math.cos(coreTheta);
    core.position.z = .15 * Math.cos(coreTheta);

};

// ===========================
// =====INITIALIZE ASSETS=====
// ===========================

let init = function() {
    // SCENE
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    scene.fog = new THREE.Fog(0x111111, 45, 75);
    
    // CAMERA
    camera = new THREE.PerspectiveCamera(75, 
                    window.innerWidth / window.innerHeight, 
                    1, 1000);
    camera.position.set(0, 0, 0);

    // LIGHTING
    coreLight = new THREE.PointLight(color, .5, 70, 2);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);
    
    // GEOMETRY
    createOrbs();
    createCore();
    
    // RENDERER   
    renderer = new THREE.WebGLRenderer();  
    renderer.setSize(window.innerWidth, window.innerHeight - 57.67);
    document.body.appendChild(renderer.domElement);
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight - 57.67);
        camera.aspect = window.innerWidth / (window.innerHeight - 57.67);
        camera.updateProjectionMatrix();
    });
};

// ANIMATION LOOP
let render = function() {
    
    moveCore();
    moveCamera();

    createParticles();

    for (let i = 0; i < orbs.length - 1; i++) {
        for (let j = i + 1; j < orbs.length; j++) {
            createArc(orbs[i].mesh, orbs[j].mesh);
        }
    }

    arcs.forEach(a => a.filter());
    orbs.forEach(o => o.move());
    particles.forEach(p => p.disperse());

    renderer.render(scene, camera);
    requestAnimationFrame(render);
};

// RUN
init();
render();