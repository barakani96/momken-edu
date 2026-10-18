import {
  sisManifest,
  academicsManifest,
  financeManifest,
  hrManifest,
  libraryManifest,
  ALL_MODULES,
} from '@schools/modules';
import { buildRuntimeModule, ModuleManifestJSON } from '../../components/dynamic-ui/moduleRuntime';

// Register all authoritative institutional entities and data providers into registry
export const sisRuntime = buildRuntimeModule(sisManifest as unknown as ModuleManifestJSON);
export const academicsRuntime = buildRuntimeModule(academicsManifest as unknown as ModuleManifestJSON);
export const financeRuntime = buildRuntimeModule(financeManifest as unknown as ModuleManifestJSON);
export const hrRuntime = buildRuntimeModule(hrManifest as unknown as ModuleManifestJSON);
export const libraryRuntime = buildRuntimeModule(libraryManifest as unknown as ModuleManifestJSON);

export {
  ALL_MODULES,
  sisManifest,
  academicsManifest,
  financeManifest,
  hrManifest,
  libraryManifest,
};
