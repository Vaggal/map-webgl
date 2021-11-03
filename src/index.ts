import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  Vector3,
  Group,
  Box3,
  Mesh,
  Clock,
  BufferGeometry,
  Material,
  Raycaster,
  Vector2,
  Object3D,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import Stats from "stats.js";

class Viewer {
  stats = new Stats();
  camera: PerspectiveCamera;
  controls: OrbitControls;
  renderer: WebGLRenderer;
  scene = new Scene();
  clock: Clock;
  raycaster: Raycaster;

  constructor(canvasElement: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({
      canvas: canvasElement,
      antialias: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // camera setup
    this.camera = new PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    this.camera.up.set(0, 0, 1);

    // control setup
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.addEventListener("change", () => {
      requestAnimationFrame(this.render.bind(this));
    });

    // stats setup
    this.stats.showPanel(0); // display fps
    document.body.appendChild(this.stats.dom);

    this.raycaster = new Raycaster();
    this.raycaster.params.Points.threshold = 0.05;

    // listen for resize events
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // listen for click events
    window.addEventListener("click", (event) => this.selectPoint(event));
  }

  // don't call multiple times
  render(): void {
    this.stats.begin();
    this.renderer.render(this.scene, this.camera);
    this.stats.end();
  }

  // helper method for setting camera and controls
  setCameraControls(options: {
    userPosition: Vector3;
    lookAtPoint: Vector3;
    far: number;
  }) {
    const { userPosition, lookAtPoint, far } = options;

    // set far plane & position
    this.camera.far = far;
    this.camera.position.copy(userPosition);
    this.camera.updateMatrixWorld();

    // set look at point
    this.controls.target = lookAtPoint;
    this.controls.maxDistance = 10000000; // magic big number
    this.controls.saveState();
  }

  selectPoint(event: MouseEvent) {
    const pointer = new Vector2(0, 0);
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(pointer, this.camera);
    let intersection = this.raycaster.intersectObjects(
      this.scene.children[0].children[0].children
    );

    if (intersection.length > 0) {
      intersection.sort((a, b) => {
        return a.distanceToRay - b.distanceToRay;
      });

      this.highlightSelectedPoint(
        intersection[0].object,
        intersection[0].index
      );
    }
  }

  highlightSelectedPoint(selectedPoint: Object3D, index: number) {
    console.log("Selected Point: ", selectedPoint);
    let points = <Mesh<BufferGeometry, Material>[]>(
      this.scene.children[0].children[0].children
    );
    points
      .find((pointsMesh) => pointsMesh.id === selectedPoint.id)
      .geometry.attributes.color.setXYZW(index, 255, 0, 0, 255).needsUpdate =
      true;
    requestAnimationFrame(this.render.bind(this));
  }

  async loadModelAndDisplay(url: string) {
    const model = await this.loadGLTFAsync(url);

    var box = new Box3().setFromObject(model);

    let pointsCount = model.children[0].children.length;

    for (let j = 0; j < pointsCount; j++) {
      let points = <Mesh<BufferGeometry, Material>>(
        model.children[0].children[j]
      );
      points.geometry.translate(
        -(box.min.x + box.max.x) / 2,
        -(box.min.y + box.max.y) / 2,
        (box.min.z + box.max.z) / 2
      );
      points.matrixAutoUpdate = false;
      points.updateMatrix();
    }

    this.scene.add(model);

    const userPosition =
      url === BIG_CLOUD_GLB ? new Vector3(120, 0, 50) : new Vector3(0, -60, 0);

    this.setCameraControls({
      userPosition: userPosition,
      lookAtPoint: new Vector3(0, 0, -30),
      far: 1000,
    });
    this.controls.update();
  }

  // boo callbacks, yay promises
  async loadGLTFAsync(url: string): Promise<Group> {
    return new Promise((resolve, reject) => {
      new GLTFLoader().load(
        url,
        ({ scene }) => resolve(scene),
        () => {},
        (err) => reject(err)
      );
    });
  }
}

const SMALL_CLOUD_GLB = "assets/small_cloud.glb";
const BIG_CLOUD_GLB = "assets/big_cloud.glb";

const viewer = new Viewer(
  document.getElementById("viewer") as HTMLCanvasElement
);

viewer.loadModelAndDisplay(BIG_CLOUD_GLB);
viewer.render();
