'use strict';
import * as THREE from 'three';


const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

context.fillStyle = 'green';
context.font = '60px sans-serif';
context.fillText('Hello World!', 0, 60);

const texture = new THREE.Texture(canvas);
texture.needsUpdate = true;


const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 3);
camera.lookAt(0, 0, 0);

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
//const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xaa0000 });
const cubeMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
const linePoints = [];
linePoints.push(new THREE.Vector3(-0.8, 0, 0.4));
linePoints.push(new THREE.Vector3( 0, 0.8, 0.4));
linePoints.push(new THREE.Vector3( 0.8, 0, 0.4));
const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
const line = new THREE.Line(lineGeometry, lineMaterial);

const scene = new THREE.Scene();
scene.add(cube);
scene.add(line);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);


const SCHEDULE = [
    [2, rotateCube, {t: 0.001}]
];


function prepareSchedule(schedule)
{
    prepared = [];
    t = 0;
    for (const entry of schedule) {
        prepared.push([t, entry[1], entry[2]]);
        t += entry[0];
    }
    prepared.push([t]);
}


function manageTime(timestamp)
{

}


function animate(timestamp)
{
    cube.rotation.x = timestamp * 0.001;
    cube.rotation.y = timestamp * 0.0007;

    renderer.render(scene, camera);
}
