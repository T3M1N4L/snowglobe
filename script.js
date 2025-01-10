const path = "./assets/";
const extension = "png";
class World {
  constructor(canvas) {
    this.canvas = canvas;
    this.parameters = {
      count: 50000
    };
    this.clock = new THREE.Clock();
    this.timeStart = 0;
    this.force = 0;
    this.lerp = {
      startY: 0,
      startZ: 0,
      targetY: 0,
      targetZ: 0,
      ease: 0.05
    };
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      powerPreference: "high-performance",
      antialias: true
    });
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.aspectRatio = this.width / this.height;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.renderer.physicallyCorrectlights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.CineonToneMapping;
    this.renderer.toneMappingExposure = 0.45;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.setScene();
    this.addCamera();
    this.listenToResize();
    this.setLoaders();
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.show();
    this.addLights();
    this.addControls();
    this.addMouseMove();
  }
  setScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);
  }
  addCamera() {
    this.camera = new THREE.PerspectiveCamera(35, this.aspectRatio, 0.1, 100);
    this.camera.position.z = 3.5;
    this.camera.position.y = 0.5;
    this.camera.position.x = -2.5;
    this.scene?.add(this.camera);
    this.cameraPositionX = this.camera.position.x;
    this.cameraPositionY = this.camera.position.y;
  }
  render() {
    this.renderer.render(this.scene, this.camera);
  }
  listenToResize() {
    window.addEventListener("resize", () => {

      this.width = window.innerWidth;
      this.height = window.innerHeight;

      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.width, this.height);
    });
  }
  setLoaders() {
    this.loaders = {};
    this.loaders.gltfLoader = new THREE.GLTFLoader();
    this.loaders.dracoLoader = new THREE.DRACOLoader();
    this.loaders.dracoLoader.setDecoderPath("./assets/");
    this.loaders.gltfLoader.setDRACOLoader(this.loaders.dracoLoader);
    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader();
  }
  loadCubeTexture() {
    const path = "./assets/";
    const extension = "png";
    return new Promise((resolve) =>
      this.loaders.cubeTextureLoader.load(
        [
          path + "px" + "." + extension,
          path + "nx" + "." + extension,
          path + "py" + "." + extension,
          path + "ny" + "." + extension,
          path + "pz" + "." + extension,
          path + "nz" + "." + extension
        ],
        resolve()
      )
    );
  }
  addBg() {
    const geometry = new THREE.SphereGeometry(55, 4, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0x1e1e2e,
      side: THREE.BackSide
    });

    this.floor = new THREE.Mesh(geometry, material);
    this.camera.add(this.floor);
  }
  addGlassGlobe() {
    return new Promise((resolve) => {
      const geometry = new THREE.IcosahedronGeometry(1, 64);
      const material = new THREE.MeshPhysicalMaterial({
        color: "white",
        roughness: 0.08,
        metalness: 0.0,
        opacity: 0.9,
        transmission: 1,
        reflectivity: 0.42,
        ior: 1.44,
        thickness: 0.14
      });
      this.loaders.cubeTextureLoader.load(
        [
          path + "px" + "." + extension,
          path + "nx" + "." + extension,
          path + "py" + "." + extension,
          path + "ny" + "." + extension,
          path + "pz" + "." + extension,
          path + "nz" + "." + extension
        ],
        (response) => {
          this.globe = new THREE.Mesh(geometry, material);
          resolve(response);
        }
      );
    });
  }

  addModel() {
    return new Promise((resolve) => {
      this.loaders.gltfLoader.load(
        "./assets/snowglobe-1.glb",
        (response) => {
          const model = response.scene;
          model.children.forEach((child) => {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child instanceof THREE.Group) {
              child.children.forEach((groupChild) => {
                groupChild.castShadow = true;
                groupChild.receiveShadow = true;
              });
            }
            if (child.material?.name === "snow-base") {
              child.material.color = new THREE.Color(0x58b9bb);
              child.material.emissive = new THREE.Color(0xaaffff);
              child.material.emissiveIntensity = 1;
            }
          });
          resolve(model);
        }
      );
    });
  }

  show() {
    Promise.all([this.addGlassGlobe(), this.addModel()]).then((values) => {
      this.globe.material.envMap = values[0];
      this.model = values[1];
      this.scene.add(this.globe);
      this.group.add(this.model);
      this.addSnow();
      this.addBg();
      this.canvas.classList.add("show");
    });
  }
  addLights() {

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0x1e1e2e, 10);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.camera.far = 20;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.normalBias = 0.05;
    this.sunLight.position.set(5, 7, -6);
    this.camera.add(this.sunLight);

    this.backLight = new THREE.DirectionalLight(0xeeeeff, 2);
    this.backLight.position.set(0, -25, 0);
    this.camera.add(this.backLight);

    this.addWindowLights();

    this.addPointLights();
  }
  addWindowLights() {
    const width = 0.055;
    const height = 0.055;
    const intensity = 40;
    const params = [0x2ec0ff, intensity, width, height];
    const rectLight = new THREE.RectAreaLight(...params);
    const rectLight1 = new THREE.RectAreaLight(...params);
    const rectLight2 = new THREE.RectAreaLight(...params);
    const rectLight3 = new THREE.RectAreaLight(...params);
    rectLight.position.set(-0.194, 0.113, -0.105);
    rectLight1.position.set(0.228, 0.113, -0.105);
    rectLight.rotation.y = -(Math.PI / 180) * 90;
    rectLight1.rotation.y = (Math.PI / 180) * 90;
    rectLight2.position.set(-0.194, 0.113, 0.073);
    rectLight3.position.set(0.228, 0.113, 0.073);
    rectLight2.rotation.y = -(Math.PI / 180) * 90;
    rectLight3.rotation.y = (Math.PI / 180) * 90;
    this.group.add(rectLight, rectLight1, rectLight2, rectLight3);
  }
  addPointLights() {
    const pointLight1 = new THREE.PointLight(0x3e345c, 15);
    pointLight1.position.set(-21, -3, -8.5);
    pointLight1.distance = 45;
    this.camera.add(pointLight1);
    const pointLight2 = new THREE.PointLight(0x0062ff, 9);
    pointLight2.position.set(0, 4, 0);
    pointLight2.distance = 8;
    this.camera.add(pointLight2);
  }
  addSnow() {
    this.uniforms = {
      uTime: { value: 0 },
      uSize: { value: 0.6 },
      uR: {
        value: 0
      },
      uG: {
        value: 0
      },
      uB: {
        value: 255
      },
      actionTime: {
        value: 0
      },
      previousActionTime: {
        value: 0
      }
    };
    this.snowMaterial = new THREE.ShaderMaterial({
      fragmentShader: document.getElementById("fragmentShaderSnow").textContent,
      vertexShader: document.getElementById("vertexShaderSnow").textContent,
      uniforms: this.uniforms,
      blending: THREE.AdditiveBlending
    });

    const mesh = this.model.children.find((el) => el.name === "top");
    if (!mesh) {
      return;
    }
    const sampler = new THREE.MeshSurfaceSampler(mesh).build();
    const count = this.parameters.count;
    const scales = new Float32Array(count);
    const randoms = new Float32Array(count);
    const random1 = new Float32Array(count);
    const r = new Float32Array(count);
    const phis = new Float32Array(count);
    const thetas = new Float32Array(count);
    const radiusEnd = new Float32Array(count);
    const phiEnd = new Float32Array(count);
    const angleEnd = new Float32Array(count);

    const squareGeometry = new THREE.PlaneGeometry(1, 1);
    this.instancedGeometry = new THREE.InstancedBufferGeometry();
    Object.keys(squareGeometry.attributes).forEach((attr) => {
      this.instancedGeometry.attributes[attr] = squareGeometry.attributes[attr];
    });
    this.instancedGeometry.index = squareGeometry.index;
    this.instancedGeometry.maxInstancedCount = count;
    const spherical = new THREE.Spherical();
    for (let i = 0; i < count; i++) {
      const newPosition = new THREE.Vector3();
      sampler.sample(newPosition);
      const { radius, phi, theta } = spherical.setFromVector3(newPosition);
      r[i] = radius;
      phis[i] = phi;
      thetas[i] = theta;
      randoms[i] = Math.random();
      random1[i] = 1 - Math.pow(Math.random(), 13);
      scales[i] = Math.random() * 0.34;
      phiEnd[i] =
        Math.random() > 0.2
          ? (1 - Math.pow(Math.random(), 5)) * 0.5 * Math.PI
          : 0.5 * Math.PI;
      angleEnd[i] = Math.pow(Math.random(), 5) * 2 * Math.PI;
      radiusEnd[i] = Math.random();
    }

    this.instancedGeometry.setAttribute(
      "random",
      new THREE.InstancedBufferAttribute(randoms, 1, false)
    );

    this.instancedGeometry.setAttribute(
      "random1",
      new THREE.InstancedBufferAttribute(random1, 1, false)
    );

    this.instancedGeometry.setAttribute(
      "aScale",
      new THREE.InstancedBufferAttribute(scales, 1, false)
    );
    this.instancedGeometry.setAttribute(
      "angleEnd",
      new THREE.InstancedBufferAttribute(angleEnd, 1, false)
    );
    this.instancedGeometry.setAttribute(
      "radiusEnd",
      new THREE.InstancedBufferAttribute(radiusEnd, 1, false)
    );

    this.instancedGeometry.setAttribute(
      "phiEnd",
      new THREE.InstancedBufferAttribute(phiEnd, 1, false)
    );

    this.instancedGeometry.setAttribute(
      "aPhi",
      new THREE.InstancedBufferAttribute(phis, 1, false)
    );
    this.instancedGeometry.setAttribute(
      "aTheta",
      new THREE.InstancedBufferAttribute(thetas, 1, false)
    );
    this.instancedGeometry.setAttribute(
      "aRadius",
      new THREE.InstancedBufferAttribute(r, 1, false)
    );

    this.snow = new THREE.Mesh(this.instancedGeometry, this.snowMaterial);
    this.group.add(this.snow);
  }

  addControls() {
    this.controls = new THREE.OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.enableZoom = false;
  }
  addMouseMove() {
    window.addEventListener("mousemove", (event) => {
      this.lerp.targetY =
        ((3 * (event.clientX - window.innerWidth / 2)) / window.innerWidth) *
        0.2;
    });
  }
  loop() {
    const elapsed = this.clock.getElapsedTime();
    const newValue =
      this.lerp.ease * this.lerp.targetY +
      (1 - this.lerp.ease) * this.lerp.startY;
    this.lerp.startY = newValue;
    if (this.model) {
      this.group.rotation.y = this.lerp.startY;
    }

    if (this.snow) {
      this.snow.material.uniforms.uTime.value = elapsed;
      if (
        (Math.abs(this.cameraPositionX - this.camera.position.x) > 0.1 ||
          Math.abs(this.cameraPositionY - this.camera.position.y) > 0.1) &&
        elapsed - this.snow.material.uniforms.actionTime.value > 3
      ) {
        this.snow.material.uniforms.previousActionTime.value = this.snow.material.uniforms.actionTime.value;
        this.snow.material.uniforms.actionTime.value = elapsed;
      }
      this.cameraPositionX = this.camera.position.x;
      this.cameraPositionY = this.camera.position.y;
    }

    this.render();
    this.controls?.update();
    requestAnimationFrame(this.loop.bind(this));
  }
}

const world = new World(document.querySelector(".webgl"));
world.loop();