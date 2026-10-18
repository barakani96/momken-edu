import { ResourceDefinition } from '../types';

class ResourceRegistry {
  private resources = new Map<string, ResourceDefinition<any>>();

  register<T>(definition: ResourceDefinition<T>) {
    this.resources.set(definition.name, definition);
  }

  has(name: string): boolean {
    return this.resources.has(name);
  }

  get<T = any>(name: string): ResourceDefinition<T> {
    const resource = this.resources.get(name);
    if (!resource) {
      throw new Error(`Resource '${name}' is not registered in the Dynamic UI registry.`);
    }
    return resource as ResourceDefinition<T>;
  }

  getAll(): ResourceDefinition<any>[] {
    return Array.from(this.resources.values());
  }
}

export const registry = new ResourceRegistry();

export function registerResource<T>(definition: ResourceDefinition<T>) {
  registry.register(definition);
}

export function hasResource(name: string): boolean {
  return registry.has(name);
}

export function getResource<T = any>(name: string): ResourceDefinition<T> {
  return registry.get<T>(name);
}

export function getAllResources(): ResourceDefinition<any>[] {
  return registry.getAll();
}
