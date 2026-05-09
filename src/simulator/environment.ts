import { EquirectangularReflectionMapping, RepeatWrapping, Scene, SRGBColorSpace, Texture, TextureLoader, type AmbientLight, type Mesh, type MeshStandardMaterial } from 'three';

export type EnvironmentId = 'forest' | 'mars' | 'warehouse' | 'lab';

const ENVIRONMENT_CONFIG: Record<EnvironmentId, { texture: string; ambient: string }> = {
  forest: { texture: '/environments/forest.png', ambient: '#8fba8f' },
  mars: { texture: '/environments/mars.png', ambient: '#c4844a' },
  warehouse: { texture: '/environments/warehouse.png', ambient: '#8fa0ba' },
  lab: { texture: '/environments/lab.png', ambient: '#b0b0c8' },
};

export class EnvironmentManager {
  private readonly scene: Scene;
  private readonly ambient: AmbientLight;
  private readonly groundMaterial: MeshStandardMaterial;
  private readonly textureLoader = new TextureLoader();
  private active: EnvironmentId = 'forest';

  constructor(scene: Scene, ambient: AmbientLight, groundPlane: Mesh) {
    this.scene = scene;
    this.ambient = ambient;
    this.groundMaterial = groundPlane.material as MeshStandardMaterial;
  }

  get currentEnvironment(): EnvironmentId {
    return this.active;
  }

  async setEnvironment(id: EnvironmentId): Promise<void> {
    const config = ENVIRONMENT_CONFIG[id];

    // Background texture — equirectangular
    const bgTexture = await this.textureLoader.loadAsync(config.texture);
    bgTexture.colorSpace = SRGBColorSpace;
    bgTexture.mapping = EquirectangularReflectionMapping;

    // Ground texture — tiled UV
    const groundTexture = await this.textureLoader.loadAsync(config.texture);
    groundTexture.colorSpace = SRGBColorSpace;
    groundTexture.wrapS = RepeatWrapping;
    groundTexture.wrapT = RepeatWrapping;
    groundTexture.repeat.set(4, 4);

    // Dispose previous textures to avoid GPU leak
    if (this.scene.background instanceof Texture) {
      this.scene.background.dispose();
    }
    if (this.groundMaterial.map) {
      this.groundMaterial.map.dispose();
    }

    this.scene.background = bgTexture;
    this.groundMaterial.map = groundTexture;
    this.groundMaterial.needsUpdate = true;
    this.ambient.color.set(config.ambient);
    this.active = id;
  }
}
