import React from 'react';
import * as THREE from 'three';
import * as TWEEN from 'tween.js';
import chroma from 'chroma-js';
import './App.css';

class FrameBufferPattern {

  constructor(rows, cols) {
    this.group = new THREE.Group();
    for (let i = -cols / 2; i < cols / 2; i++) {
      for (let j = -rows / 2; j < rows / 2; j++) {
        const material = new THREE.MeshLambertMaterial({ color: chroma.random().toString() });
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(i, j, 0);
        this.group.add(mesh);
      }
    }
    console.log(this.group);
  }

  addToScene(scene) {
    scene.add(this.group);
  }

  update() {
    // empty.
  }

}

class FrontAndBackBuffer {

  constructor(rotY) {
    this.frontBuffer = new FrameBufferPattern(5, 5);
    this.backBuffer = new FrameBufferPattern(5, 5);
    this.frontBuffer.group.translateZ(1);
    this.backBuffer.group.translateZ(-1);

    const group = new THREE.Group();
    group.add(this.frontBuffer.group);
    group.add(this.backBuffer.group);
    this.group = group;

    this.rotation = { angle: rotY || 0 };
  }

  addToScene(scene) {
    scene.add(this.group);
    this._setupAnimations();
  }

  _setupAnimations() {
    const targetRotY = this.rotation.angle + Math.PI;
    const tween = new TWEEN.Tween(this.rotation);
    tween.to({ angle: targetRotY }, 3000)
    tween.start();
  }

  update() {
    const axis = new THREE.Vector3(0, 4 / 2, 0).normalize();
    this.group.setRotationFromAxisAngle(axis, this.rotation.angle);
  }

}

const ROT_Y = 0.4;

class SceneManager {

  constructor(canvasId) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const canvas = document.getElementById(canvasId)
    this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    this.sceneObjects = [];
  }

  init() {
    this.setupRenderer();
    this.setupCamera();
    this.setupLights();
    this.setupAnimations();
    this.setupSceneObjects();
  }

  setupCamera() {
    this.camera.position.z = 10;
    this.camera.rotateY += ROT_Y;
  }

  setupRenderer() {
    this.renderer.setClearColor("#E1E1E1");
    this.renderer.setClearAlpha(0.3)
  }

  setupLights() {
    const light = new THREE.PointLight(0xffffff, 4, 100);
    light.position.set(0, 50, 50);
    this.scene.add(light);
  }

  setupAnimations() {
    // const tween = new TWEEN.Tween(this.position);
    // tween.to({ x: 200 }, 1000);
    // tween.start();
  }

  setupSceneObjects() {
    this.sceneObjects.push(new FrontAndBackBuffer(ROT_Y));
    this.sceneObjects.forEach((o) => {
      o.addToScene(this.scene);
    });
  }

  update() {
    this.sceneObjects.forEach((o) => o.update());
    this.renderer.render(this.scene, this.camera);
  }

}

function Render() {
  const canvasId = "double_buffer_canvas";

  const sceneManager = new SceneManager(canvasId);
  sceneManager.init();

  function render() {
    requestAnimationFrame(render);
    TWEEN.update();
    sceneManager.update();
  }

  render();
}

class App extends React.Component {
  componentDidMount = () => {
    Render();
  }

  render() {
    return (
      <center>
        <h1>Graphics Playground!</h1>
        <canvas id="double_buffer_canvas" width="500" height="500">
        </canvas>
      </center>
    );
  }
}

export default App;
