import { Router, Request, Response } from 'express';
import { NavigationService } from './navigation.service';
import { PrincipalContext } from './navigation.policy';
import { NavigationError } from './navigation.errors';

export function createNavigationRouter(service: NavigationService): Router {
  const router = Router();

  const extractPrincipal = (req: Request): PrincipalContext => {
    // Read from custom headers or middleware-attached user
    const user = (req as any).user;
    if (user) {
      return {
        id: user.id,
        roles: user.roles || [],
        permissions: user.permissions || [],
        tenantId: user.tenantId,
      };
    }

    const rolesHeader = req.headers['x-user-roles'] as string;
    const permissionsHeader = req.headers['x-user-permissions'] as string;
    const tenantIdHeader = req.headers['x-tenant-id'] as string;
    const userIdHeader = req.headers['x-user-id'] as string;

    const roles = rolesHeader ? rolesHeader.split(',').map((r) => r.trim()) : ['admin'];
    const permissions = permissionsHeader ? permissionsHeader.split(',').map((p) => p.trim()) : ['*'];

    return {
      id: userIdHeader || 'admin-user',
      roles,
      permissions,
      tenantId: tenantIdHeader,
    };
  };

  // GET /api/v1/navigation/menus/:key - Retrieve a localized menu tree
  router.get('/menus/:key', async (req: Request, res: Response) => {
    try {
      const { key } = req.params;
      const locale = (req.query.locale as string) || 'en';
      const principal = extractPrincipal(req);

      const menu = await service.getMenu(key, locale, principal);
      return res.json(menu);
    } catch (err: any) {
      const status = err instanceof NavigationError ? err.statusCode : 500;
      return res.status(status).json({
        error: err.name || 'NavigationError',
        message: err.message,
      });
    }
  });

  // GET /api/v1/navigation/menus - List available menus
  router.get('/menus', async (req: Request, res: Response) => {
    try {
      const tenantId = req.query.tenantId as string;
      const menus = await service.listMenus(tenantId);
      return res.json(menus);
    } catch (err: any) {
      const status = err instanceof NavigationError ? err.statusCode : 500;
      return res.status(status).json({
        error: err.name || 'NavigationError',
        message: err.message,
      });
    }
  });

  // GET /api/v1/navigation/menus/by-id/:id - Get menu by ID with items
  router.get('/menus/by-id/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const menu = await service.getMenuById(id);
      return res.json(menu);
    } catch (err: any) {
      const status = err instanceof NavigationError ? err.statusCode : 500;
      return res.status(status).json({
        error: err.name || 'NavigationError',
        message: err.message,
      });
    }
  });

  // POST /api/v1/navigation/menus - Create a menu
  router.post('/menus', async (req: Request, res: Response) => {
    try {
      const principal = extractPrincipal(req);
      const menu = await service.createMenu(req.body, principal);
      return res.status(201).json(menu);
    } catch (err: any) {
      const status = err instanceof NavigationError ? err.statusCode : 400;
      return res.status(status).json({
        error: err.name || 'NavigationError',
        message: err.message,
      });
    }
  });

  // PUT /api/v1/navigation/menus/:id - Update menu
  router.put('/menus/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const principal = extractPrincipal(req);
      const menu = await service.updateMenu(id, req.body, principal);
      return res.json(menu);
    } catch (err: any) {
      const status = err instanceof NavigationError ? err.statusCode : 400;
      return res.status(status).json({
        error: err.name || 'NavigationError',
        message: err.message,
      });
    }
  });

  // DELETE /api/v1/navigation/menus/:id - Delete menu
  router.delete('/menus/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const principal = extractPrincipal(req);
      const deleted = await service.deleteMenu(id, principal);
      return res.json({ message: 'Menu deleted successfully', id: deleted.id });
    } catch (err: any) {
      const status = err instanceof NavigationError ? err.statusCode : 400;
      return res.status(status).json({
        error: err.name || 'NavigationError',
        message: err.message,
      });
    }
  });

  // POST /api/v1/navigation/menus/:id/items - Add a menu item
  router.post('/menus/:id/items', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const principal = extractPrincipal(req);
      const item = await service.addMenuItem(id, req.body, principal);
      return res.status(201).json(item);
    } catch (err: any) {
      const status = err instanceof NavigationError ? err.statusCode : 400;
      return res.status(status).json({
        error: err.name || 'NavigationError',
        message: err.message,
      });
    }
  });

  // PATCH /api/v1/navigation/items/:id - Update an item
  router.patch('/items/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const principal = extractPrincipal(req);
      const updated = await service.updateMenuItem(id, req.body, principal);
      return res.json(updated);
    } catch (err: any) {
      const status = err instanceof NavigationError ? err.statusCode : 400;
      return res.status(status).json({
        error: err.name || 'NavigationError',
        message: err.message,
      });
    }
  });

  // DELETE /api/v1/navigation/items/:id - Delete an item
  router.delete('/items/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const principal = extractPrincipal(req);
      const deleted = await service.deleteMenuItem(id, principal);
      return res.json({ message: 'Item deleted successfully', id: deleted.id });
    } catch (err: any) {
      const status = err instanceof NavigationError ? err.statusCode : 400;
      return res.status(status).json({
        error: err.name || 'NavigationError',
        message: err.message,
      });
    }
  });

  // GET /api/v1/navigation/audit-logs - Retrieve administrative audit logs for navigation management
  router.get('/audit-logs', async (req: Request, res: Response) => {
    try {
      const principal = extractPrincipal(req);
      const limit = Number(req.query.limit) || 100;
      const offset = Number(req.query.offset) || 0;
      const action = req.query.action as string;

      const logs = await service.getAuditLogs(limit, offset, action);
      return res.json(logs);
    } catch (err: any) {
      const status = err instanceof NavigationError ? err.statusCode : 500;
      return res.status(status).json({
        error: err.name || 'NavigationError',
        message: err.message,
      });
    }
  });

  return router;
}
