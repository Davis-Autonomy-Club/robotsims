import type { EnvironmentId } from './environment';
import type { SpawnType } from './object-spawner';
import type { RobotId } from '../robots/so101';

export type TaskStatus = 'idle' | 'in_progress' | 'complete';

interface HudElements {
  robotButtons: Record<RobotId, HTMLButtonElement>;
  environmentButtons: Record<EnvironmentId, HTMLButtonElement>;
  spawnButtons: Record<SpawnType, HTMLButtonElement>;
  clearButton: HTMLButtonElement;
  bridgeStatus: HTMLElement;
  jointReadout: HTMLElement;
  lastAction: HTMLElement;
  taskStatus: HTMLElement;
  objectCount: HTMLElement;
  fps: HTMLElement;
  wristCanvas: HTMLCanvasElement;
}

export class Hud {
  private readonly elements: HudElements;

  constructor() {
    this.elements = {
      robotButtons: {
        so101: this.byId<HTMLButtonElement>('robot-so101'),
        lekiwi: this.byId<HTMLButtonElement>('robot-lekiwi'),
      },
      environmentButtons: {
        forest: this.byId<HTMLButtonElement>('env-forest'),
        mars: this.byId<HTMLButtonElement>('env-mars'),
        warehouse: this.byId<HTMLButtonElement>('env-warehouse'),
        lab: this.byId<HTMLButtonElement>('env-lab'),
      },
      spawnButtons: {
        cube: this.byId<HTMLButtonElement>('spawn-cube'),
        sphere: this.byId<HTMLButtonElement>('spawn-sphere'),
        cylinder: this.byId<HTMLButtonElement>('spawn-cylinder'),
      },
      clearButton: this.byId<HTMLButtonElement>('spawn-clear'),
      bridgeStatus: this.byId('bridge-status'),
      jointReadout: this.byId('joint-readout'),
      lastAction: this.byId('last-action'),
      taskStatus: this.byId('task-status'),
      objectCount: this.byId('object-count'),
      fps: this.byId('fps-counter'),
      wristCanvas: this.byId<HTMLCanvasElement>('wrist-cam'),
    };
  }

  onRobotSwitch(callback: (robotId: RobotId) => void): void {
    this.elements.robotButtons.so101.onclick = () => callback('so101');
    this.elements.robotButtons.lekiwi.onclick = () => callback('lekiwi');
  }

  onEnvironmentSwitch(callback: (environmentId: EnvironmentId) => void): void {
    this.elements.environmentButtons.forest.onclick = () => callback('forest');
    this.elements.environmentButtons.mars.onclick = () => callback('mars');
    this.elements.environmentButtons.warehouse.onclick = () => callback('warehouse');
    this.elements.environmentButtons.lab.onclick = () => callback('lab');
  }

  onSpawnObject(callback: (type: SpawnType) => void): void {
    this.elements.spawnButtons.cube.onclick = () => callback('cube');
    this.elements.spawnButtons.sphere.onclick = () => callback('sphere');
    this.elements.spawnButtons.cylinder.onclick = () => callback('cylinder');
  }

  onClearObjects(callback: () => void): void {
    this.elements.clearButton.onclick = callback;
  }

  setActiveRobot(robotId: RobotId): void {
    this.toggleButtons(this.elements.robotButtons, robotId);
  }

  setActiveEnvironment(environmentId: EnvironmentId): void {
    this.toggleButtons(this.elements.environmentButtons, environmentId);
  }

  setBridgeConnected(connected: boolean): void {
    this.elements.bridgeStatus.textContent = connected ? '● BRIDGE CONNECTED' : '○ BRIDGE DISCONNECTED';
    this.elements.bridgeStatus.classList.toggle('connected', connected);
  }

  updateJointReadout(joints: Record<string, number>): void {
    this.elements.jointReadout.innerHTML = Object.entries(joints)
      .map(([name, value]) => `<div>${name}: ${value.toFixed(1)}°</div>`)
      .join('');
  }

  updateLastAction(actionToken: string, magnitude: number, timestamp: number): void {
    const time = new Date(timestamp).toLocaleTimeString();
    this.elements.lastAction.textContent = `${actionToken} (${magnitude.toFixed(2)}) @ ${time}`;
  }

  updateTaskStatus(status: TaskStatus): void {
    this.elements.taskStatus.textContent = status.toUpperCase().replace('_', ' ');
  }

  updateObjectCount(count: number): void {
    this.elements.objectCount.textContent = `${count} objects`;
  }

  updateFps(fps: number): void {
    this.elements.fps.textContent = `${fps.toFixed(1)} FPS`;
  }

  getWristCanvas(): HTMLCanvasElement {
    return this.elements.wristCanvas;
  }

  private byId<T extends HTMLElement = HTMLElement>(id: string): T {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Missing HUD element: ${id}`);
    }
    return element as T;
  }

  private toggleButtons<T extends string>(buttonMap: Record<T, HTMLButtonElement>, active: T): void {
    (Object.keys(buttonMap) as T[]).forEach((key) => {
      buttonMap[key].classList.toggle('active', key === active);
    });
  }
}
