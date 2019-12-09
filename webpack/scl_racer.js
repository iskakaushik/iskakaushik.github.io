import * as THREE from 'three';
import * as TWEEN from 'tween.js';

const EXTRA_WIDTH = 50
const BLANK_COLOR = new THREE.Color("blue")
const SCANLINE_COLOR = new THREE.Color("blue")
const RACER_COLOR = new THREE.Color("green")

const NUM_ROWS = 30
const NUM_COLS = 20

// Spehere at origin
class ScanLine {
  constructor(rows, cols, isRacer) {
    this.isRacer = isRacer || false
    let material = new THREE.LineBasicMaterial({ color: SCANLINE_COLOR });
    if (this.isRacer) {
      material = new THREE.LineBasicMaterial({ color: RACER_COLOR });
    }
    const geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(-cols / 2.0 - EXTRA_WIDTH, rows / 2.0, 0));
    geometry.vertices.push(new THREE.Vector3(cols / 2.0 + EXTRA_WIDTH, rows / 2.0, 0));
    this.mesh = new THREE.Line(geometry, material);
  }
}

class FrameBufferPattern {

  constructor(rows, cols) {
    this.group = new THREE.Group();
    this.rowMap = {}
    for (let i = 0; i < rows; i++) {
      this.rowMap[i] = []
    }
    for (let i = -cols / 2.0; i < cols / 2; i += 1) {
      let rowNum = 0
      for (let j = -rows / 2.0; j < rows / 2; j += 1) {
        const material = new THREE.MeshLambertMaterial({ color: RACER_COLOR });
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(i + 0.5, j + 0.5, 0);
        this.rowMap[rowNum].push(mesh.id)
        rowNum++
        this.group.add(mesh);
      }
    }

    const scanLine = new ScanLine(rows, cols, false);
    this.scanLineId = scanLine.mesh.id;
    this.group.add(scanLine.mesh);

    const racer = new ScanLine(rows, cols, true);
    this.racerId = racer.mesh.id;
    this.group.add(racer.mesh);

    this.scanPercent = { percent: 0 };
    this.numRows = rows
    this.numCols = cols
    this.fillPercent = { percent: 100 };
  }

  addToScene(scene) {
    scene.add(this.group);
  }

  _updateScanline() {
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

    return numRowsDone;
  }

  _updateRacer(sclRow) {
    const racerMesh = this.group.getObjectById(this.racerId);
    const num_rows_behind = 5

    let processMesh = (meshId) => {
      const mesh = this.group.getObjectById(meshId);
      mesh.material.color.set("green")
    };

    if (sclRow <= num_rows_behind) {
      racerMesh.position.y = this.numRows - (num_rows_behind - sclRow)
      for (let i = sclRow; i <= this.numRows - (num_rows_behind - sclRow); i++) {
        this.rowMap[i].forEach(processMesh)
      }
    } else {
      const scanLineY = this.scanPercent.percent * this.numRows * 0.01;
      racerMesh.position.y = -scanLineY + num_rows_behind
      for (let rowDone = 1; rowDone <= sclRow - num_rows_behind; rowDone++) {
        this.rowMap[this.numRows - rowDone].forEach(processMesh);
      }
    }
  }

  update() {
    const lastRowScanned = this._updateScanline()
    this._updateRacer(lastRowScanned)
  }

}

class ScanlineRacer {

  constructor(cols, rows) {
    this.numCols = cols || NUM_COLS
    this.numRows = rows || NUM_ROWS

    this.frontBuffer = new FrameBufferPattern(this.numRows, this.numCols, true);

    const group = new THREE.Group();
    group.add(this.frontBuffer.group);
    this.group = group;

  }

  addToScene(scene) {
    scene.add(this.group);
    this._setupAnimations();
  }

  _setupAnimations() {
    const sclT = this._setupScanlineMotion();
    sclT.onComplete(() => {
      this.frontBuffer.scanPercent.percent = 0
      this._setupAnimations();
    })
    sclT.start();
  }

  _setupScanlineMotion() {
    let scanPercent = this.frontBuffer.scanPercent
    const scanLineTween = new TWEEN.Tween(scanPercent)
    // add a little delay here to reduce the jank
    scanLineTween.delay(200)
    scanLineTween.to({ percent: 100 }, 3000)
    return scanLineTween
  }

  update() {
    this.frontBuffer.update()
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
  }

  setupSceneObjects() {
    this.sceneObjects.push(new ScanlineRacer());
    this.sceneObjects.forEach((o) => {
      o.addToScene(this.scene);
    });
  }

  update() {
    this.sceneObjects.forEach((o) => o.update());
    this.renderer.render(this.scene, this.camera);
  }

}

function RenderSclRacer() {
  const canvasId = "scl_racer_canvas";

  const sceneManager = new SceneManager(canvasId);
  sceneManager.init();

  function render() {
    requestAnimationFrame(render);
    TWEEN.update();
    sceneManager.update();
  }

  render();
}

window.RenderSclRacer = RenderSclRacer;
