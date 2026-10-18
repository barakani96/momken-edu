/**
 * @schools/ui/dynamic-ui — Dynamic Metadata-Driven UI Layer (AGENTS.md §7–8)
 * DataGrid, InteractiveGrid, InteractiveReports, DataView, and EntityForm.
 */

export * from '../../../src/ui/data';
export * from '../../../src/ui/forms';
export {
  EntityPage,
  ModulePage,
  ModuleSettings,
  EntityToolbar,
  EntityStatusBar,
  DynamicField,
  fieldRegistry,
  registerResource,
  hasResource,
  getResource,
  buildRuntimeModule,
  type DataProvider,
  type ResourceDefinition,
  type ModuleManifestJSON,
} from '../../../src/components/dynamic-ui';
