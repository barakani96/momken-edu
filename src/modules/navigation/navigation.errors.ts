export class NavigationError extends Error {
  constructor(message: string, public readonly statusCode: number = 400) {
    super(message);
    this.name = 'NavigationError';
  }
}

export class NavigationNotFoundError extends NavigationError {
  constructor(resource: string = 'Navigation menu') {
    super(`${resource} not found`, 404);
    this.name = 'NavigationNotFoundError';
  }
}

export class CyclicHierarchyError extends NavigationError {
  constructor(itemKey: string, parentKey?: string) {
    super(
      `Cyclic navigation hierarchy detected: setting parent ${parentKey ? `'${parentKey}'` : ''} creates a loop with '${itemKey}'`,
      422
    );
    this.name = 'CyclicHierarchyError';
  }
}

export class SelfParentingError extends NavigationError {
  constructor(itemId: string) {
    super(`Item cannot be its own parent: ${itemId}`, 422);
    this.name = 'SelfParentingError';
  }
}

export class InvalidHierarchyError extends NavigationError {
  constructor(message: string) {
    super(`Invalid navigation hierarchy: ${message}`, 422);
    this.name = 'InvalidHierarchyError';
  }
}

export class InvalidRouteForTypeError extends NavigationError {
  constructor(type: string, reason: string) {
    super(`Invalid route for item type ${type}: ${reason}`, 400);
    this.name = 'InvalidRouteForTypeError';
  }
}

export class ItemMenuMismatchError extends NavigationError {
  constructor(itemId: string, targetMenuId: string) {
    super(`Menu item ${itemId} does not belong to menu ${targetMenuId}`, 400);
    this.name = 'ItemMenuMismatchError';
  }
}

export class NavigationForbiddenError extends NavigationError {
  constructor(action: string = 'manage navigation') {
    super(`Forbidden: Insufficient permissions to ${action}`, 403);
    this.name = 'NavigationForbiddenError';
  }
}
