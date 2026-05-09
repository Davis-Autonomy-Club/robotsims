import { EquirectangularReflectionMapping, RepeatWrapping, Scene, SRGBColorSpace, TextureLoader, type AmbientLight, type Mesh, type MeshStandardMaterial } from 'three';

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
    const texture = await this.textureLoader.loadAsync(config.texture);
    texture.colorSpace = SRGBColorSpace;
    texture.mapping = EquirectangularReflectionMapping;
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(4, 4);
    this.scene.background = texture;
    this.groundMaterial.map = texture;
    this.groundMaterial.needsUpdate = true;
    this.ambient.color.set(config.ambient);
    this.active = id;
  }
}
