import * as THREE from 'three';
import * as TWEEN from 'tween.js';
import chroma from 'chroma-js';


const EXTRA_WIDTH = 50
const BLANK_COLOR = new THREE.Color("blue")
const SCANLINE_COLOR = new THREE.Color("blue")
const SPHERE_COLOR = new THREE.Color("blue")
const Z_DIFF = 5
const DBL_INFO_PANE = "double_buffer_info"

const NUM_ROWS = 30
const NUM_COLS = 20

// Spehere at origin
class ScanLine {
  constructor(rows, cols) {
    const material = new THREE.LineBasicMaterial({ color: SCANLINE_COLOR });
    const geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(-cols / 2.0 - EXTRA_WIDTH, rows / 2.0, 0));
    geometry.vertices.push(new THREE.Vector3(cols / 2.0 + EXTRA_WIDTH, rows / 2.0, 0));
    this.mesh = new THREE.Line(geometry, material);
  }

  addToScene(scene) {
    scene.add(this.mesh);
  }

  update() {
    // empty.
  }

}

// Spehere at origin
class SphericalPoint {
  constructor(radius) {
    const r = radius || 2
    const material = new THREE.MeshBasicMaterial({ color: SPHERE_COLOR });
    const geometry = new THREE.SphereGeometry(r, 32, 32);
    this.sphere = new THREE.Mesh(geometry, material);
  }

  addToScene(scene) {
    scene.add(this.sphere);
  }

  update() {
    // empty.
  }

}

class FrameBufferPattern {

  constructor(rows, cols, isFront) {
    this.isFront = isFront || false
    this.group = new THREE.Group();
    this.rowMap = {}
    for (let i = 0; i < rows; i++) {
      this.rowMap[i] = []
    }
    for (let i = -cols / 2.0; i < cols / 2; i += 1) {
      let rowNum = 0
      for (let j = -rows / 2.0; j < rows / 2; j += 1) {
        const material = new THREE.MeshLambertMaterial({ color: chroma.random().toString() });
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(i + 0.5, j + 0.5, 0);
        this.rowMap[rowNum].push(mesh.id)
        rowNum++
        this.group.add(mesh);
      }
    }
    const scanLine = new ScanLine(rows, cols);
    this.scanLineId = scanLine.mesh.id;
    this.group.add(scanLine.mesh);
    this.scanPercent = { percent: 0 };
    this.numRows = rows
    this.numCols = cols
    this.fillPercent = { percent: 100 };
  }

  addToScene(scene) {
    scene.add(this.group);
  }

  _updateAsFrontBuffer() {
    // scanPercent has changed
    const scanLineY = this.scanPercent.percent * this.numRows * 0.01;
    const scanLineMesh = this.group.getObjectById(this.scanLineId);
    scanLineMesh.position.y = -scanLineY

    const perLineF = 100.0 / this.numRows;
    const numRowsDone = Math.floor(this.scanPercent.percent / perLineF + 0.5);
    this.fillPercent.percent = 100.0 - perLineF * numRowsDone

    if (this.fillPercent.percent < 0.5) {
      scanLineMesh.material.transparent = true
      scanLineMesh.material.opacity = 0
    } else {
      scanLineMesh.material.transparent = false
      scanLineMesh.material.opacity = 1.0
    }

    for (let rowDone = 1; rowDone <= numRowsDone; rowDone++) {
      this.rowMap[this.numRows - rowDone].forEach((meshId) => {
        const mesh = this.group.getObjectById(meshId);
        mesh.material.color.set(BLANK_COLOR)
      })
    }
  }

  _updateAsBackBuffer() {
    // scanPercent has changed
    const scanLineMesh = this.group.getObjectById(this.scanLineId);
    scanLineMesh.material.transparent = true
    scanLineMesh.material.opacity = 0

    const perLineF = 100.0 / this.numRows;
    const numRowsDone = Math.floor(this.fillPercent.percent / perLineF + 0.5);

    for (let rowDone = 1; rowDone <= numRowsDone; rowDone++) {
      this.rowMap[this.numRows - rowDone].forEach((meshId) => {
        const mesh = this.group.getObjectById(meshId);
        const curCol = mesh.material.color
        if (curCol.equals(BLANK_COLOR)) {
          mesh.material.color.set(chroma.random().toString())
        }
      })
    }
  }

  update() {
    if (this.isFront) {
      this._updateAsFrontBuffer()
    } else {
      this._updateAsBackBuffer()
    }
  }

}

class FrontAndBackBuffer {

  constructor(rotY, cols, rows) {
    this.numCols = cols || NUM_COLS
    this.numRows = rows || NUM_ROWS

    this.frontBuffer = new FrameBufferPattern(this.numRows, this.numCols, true);
    this.backBuffer = new FrameBufferPattern(this.numRows, this.numCols, false);
    this.sphere = new SphericalPoint(0.3);

    this.frontBuffer.group.translateZ(Z_DIFF);
    this.backBuffer.group.translateZ(-Z_DIFF);

    const group = new THREE.Group();
    group.add(this.frontBuffer.group);
    group.add(this.backBuffer.group);
    // group.add(this.sphere.sphere);
    this.group = group;

    this.rotation = { angle: rotY || 0 };
    this.bufferSwap = false;
  }

  addToScene(scene) {
    scene.add(this.group);
    this._setupAnimations();
  }

  _setupAnimations() {
    const sclT = this._setupScanlineMotion()
    const bbFill = this._setupBackBufferFill()
    const rotateT = this._setupRotation()
    rotateT.onComplete(() => {
      this._swapBuffers()
      this._setupAnimations()
    })
    const scanRotateFill = sclT.chain(rotateT)
    bbFill.start()
    scanRotateFill.start()
  }

  _swapBuffers() {
    if (this.bufferSwap) {
      this.frontBuffer.isFront = true;
      this.frontBuffer.scanPercent.percent = 0;
      this.backBuffer.isFront = false;
    } else {
      this.frontBuffer.isFront = false;
      this.backBuffer.isFront = true;
      this.backBuffer.scanPercent.percent = 0;
    }
    this.bufferSwap = !this.bufferSwap;
  }

  _setupBackBufferFill() {
    let fillPercent = this.backBuffer.fillPercent
    if (this.bufferSwap) {
      fillPercent = this.frontBuffer.fillPercent
    }
    const fillTween = new TWEEN.Tween(fillPercent)
    // add a little delay here to reduce the jank
    fillTween.delay(200)
    // this needs to be faster than scanline speed
    fillTween.to({ percent: 100 }, 2000)
    return fillTween
  }

  _setupScanlineMotion() {
    let scanPercent = this.frontBuffer.scanPercent
    if (this.bufferSwap) {
      scanPercent = this.backBuffer.scanPercent
    }

    const scanLineTween = new TWEEN.Tween(scanPercent)
    // add a little delay here to reduce the jank
    scanLineTween.delay(200)
    scanLineTween.to({ percent: 100 }, 3000)
    return scanLineTween
  }

  _setupRotation() {
    const targetRotY = this.rotation.angle + Math.PI;
    const rotateTween = new TWEEN.Tween(this.rotation);
    rotateTween.onStart(() => {
      this._writeText("VBLANK")
    })
    // delay for VBLANK!!
    rotateTween.delay(2000);
    rotateTween.to({ angle: targetRotY }, 2000)
    return rotateTween;
  }

  _writeText(text) {
    const el = document.getElementById(DBL_INFO_PANE)
    console.log(el)
    el.innerHTML = text
  }

  update() {
    const axis = new THREE.Vector3(0, 1, 0).normalize();
    this.group.setRotationFromAxisAngle(axis, this.rotation.angle);
    this.frontBuffer.update()
    this.backBuffer.update()
  }

}

const ROT_Y = 0.6;
const CLEAR_COLOR = "black"

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
    this.camera.position.z = 40;
    this.camera.rotateY += ROT_Y;
  }

  setupRenderer() {
    this.renderer.setClearColor(CLEAR_COLOR);
    this.renderer.setClearAlpha(1)
  }

  setupLights() {
    const frontLight = new THREE.PointLight(0xffffff, 4, 250);
    frontLight.position.set(5, 40, 200);
    this.scene.add(frontLight);

    const backLight = new THREE.PointLight(0xffffff, 4, 200);
    backLight.position.set(20, -40, 200);
    this.scene.add(backLight);
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

window.RenderDblBuffer = Render;
