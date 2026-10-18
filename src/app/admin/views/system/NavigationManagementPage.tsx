import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Button,
  Tag,
  Modal,
  TextInput,
  Select,
  SelectItem,
  Checkbox,
  InlineNotification,
  Loading,
  Dropdown,
  Tile,
  Grid,
  Column,
  CodeSnippet,
} from '@carbon/react';
import {
  Add,
  Renew,
  TrashCan,
  Edit,
  ArrowUp,
  ArrowDown,
  Code,
  TreeViewAlt,
  Flow,
  Activity,
  Document,
} from '@carbon/icons-react';
import {
  fetchNavigationMenus,
  fetchNavigationMenuDetail,
  fetchNavigationMenu,
  createNavigationMenuItem,
  updateNavigationMenuItem,
  deleteNavigationMenuItem,
  reorderNavigationMenuItems,
  fetchNavigationAuditLogs,
  NavigationMenuDetail,
  NavigationMenuItemDetail,
} from '../../../../api/navigationApi';
import { AVAILABLE_CARBON_ICONS } from '../../../../ui/layout/iconResolver';

export function NavigationManagementPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [activeTab, setActiveTab] = useState<'editor' | 'audit'>('editor');
  const [menus, setMenus] = useState<Array<{ id: string; key: string; name: string; isActive: boolean; version: number }>>([]);
  const [selectedMenuKey, setSelectedMenuKey] = useState<string>('admin');
  const [menuDetail, setMenuDetail] = useState<NavigationMenuDetail | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [errorNotification, setErrorNotification] = useState<string | null>(null);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');

  // Dialog states
  const [isItemModalOpen, setIsItemModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<NavigationMenuItemDetail | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<NavigationMenuItemDetail | null>(null);
  const [isApiPreviewOpen, setIsApiPreviewOpen] = useState<boolean>(false);
  const [apiPreviewData, setApiPreviewData] = useState<string>('');

  // Form State
  const [formKey, setFormKey] = useState<string>('');
  const [formType, setFormType] = useState<'LINK' | 'GROUP' | 'EXTERNAL_LINK' | 'DIVIDER'>('LINK');
  const [formLabelEn, setFormLabelEn] = useState<string>('');
  const [formLabelAr, setFormLabelAr] = useState<string>('');
  const [formPath, setFormPath] = useState<string>('');
  const [formIcon, setFormIcon] = useState<string>('Dashboard');
  const [formParentId, setFormParentId] = useState<string>('');
  const [formPermission, setFormPermission] = useState<string>('');
  const [formSortOrder, setFormSortOrder] = useState<number>(10);
  const [formIsVisible, setFormIsVisible] = useState<boolean>(true);
  const [formIsEnabled, setFormIsEnabled] = useState<boolean>(true);
  const [formOpenInNewTab, setFormOpenInNewTab] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load menu list
  const loadMenus = async () => {
    try {
      const list = await fetchNavigationMenus();
      setMenus(list);
      if (list.length > 0 && !list.find((m) => m.key === selectedMenuKey)) {
        setSelectedMenuKey(list[0].key);
      }
    } catch (err: any) {
      setErrorNotification(err.message || 'Failed to fetch menus');
    }
  };

  // Load active menu detail
  const loadMenuDetail = async (menuKeyToLoad: string) => {
    setLoading(true);
    setErrorNotification(null);
    try {
      const targetMenu = menus.find((m) => m.key === menuKeyToLoad);
      if (targetMenu) {
        const detail = await fetchNavigationMenuDetail(targetMenu.id);
        setMenuDetail(detail);
      } else {
        const list = await fetchNavigationMenus();
        setMenus(list);
        const found = list.find((m) => m.key === menuKeyToLoad) || list[0];
        if (found) {
          setSelectedMenuKey(found.key);
          const detail = await fetchNavigationMenuDetail(found.id);
          setMenuDetail(detail);
        }
      }
    } catch (err: any) {
      setErrorNotification(err.message || 'Failed to load menu details from database');
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const logs = await fetchNavigationAuditLogs(100, 0);
      setAuditLogs(logs);
    } catch (err: any) {
      setErrorNotification(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
    loadAuditLogs();
  }, []);

  useEffect(() => {
    if (selectedMenuKey && activeTab === 'editor') {
      loadMenuDetail(selectedMenuKey);
    } else if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [selectedMenuKey, activeTab]);

  // Open modal for Create
  const handleOpenCreateModal = (parentDefaultId?: string) => {
    setEditingItem(null);
    setFormKey('');
    setFormType('LINK');
    setFormLabelEn('');
    setFormLabelAr('');
    setFormPath('/');
    setFormIcon('Dashboard');
    setFormParentId(parentDefaultId || '');
    setFormPermission('');
    setFormSortOrder(
      menuDetail ? (menuDetail.items.length + 1) * 10 : 10
    );
    setFormIsVisible(true);
    setFormIsEnabled(true);
    setFormOpenInNewTab(false);
    setFormError(null);
    setIsItemModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (item: NavigationMenuItemDetail) => {
    setEditingItem(item);
    setFormKey(item.key);
    setFormType(item.type);
    setFormLabelEn(item.label);
    const arTrans = item.translations.find((t) => t.locale === 'ar');
    setFormLabelAr(arTrans ? arTrans.label : '');
    setFormPath(item.path || '');
    setFormIcon(item.icon || 'Dashboard');
    setFormParentId(item.parentId || '');
    setFormPermission(item.permission || '');
    setFormSortOrder(item.sortOrder);
    setFormIsVisible(item.isVisible);
    setFormIsEnabled(item.isEnabled);
    setFormOpenInNewTab(item.openInNewTab);
    setFormError(null);
    setIsItemModalOpen(true);
  };

  // Save Item (Create or Update)
  const handleSaveItem = async () => {
    if (!menuDetail) return;
    setFormError(null);

    if (!formKey.trim()) {
      setFormError('Key identifier is required.');
      return;
    }
    if (!formLabelEn.trim()) {
      setFormError('English label is required.');
      return;
    }
    if ((formType === 'LINK' || formType === 'EXTERNAL_LINK') && !formPath.trim()) {
      setFormError(`Path is required for ${formType} items.`);
      return;
    }

    const payload: any = {
      key: formKey.trim(),
      type: formType,
      label: formLabelEn.trim(),
      path: formType === 'GROUP' || formType === 'DIVIDER' ? null : formPath.trim(),
      icon: formIcon || null,
      permission: formPermission.trim() ? formPermission.trim() : null,
      sortOrder: Number(formSortOrder) || 0,
      isVisible: formIsVisible,
      isEnabled: formIsEnabled,
      openInNewTab: formOpenInNewTab,
      parentId: formParentId.trim() ? formParentId.trim() : null,
      translations: [
        { locale: 'en', label: formLabelEn.trim() },
        ...(formLabelAr.trim() ? [{ locale: 'ar', label: formLabelAr.trim() }] : []),
      ],
    };

    setActionLoading(true);
    try {
      if (editingItem) {
        await updateNavigationMenuItem(editingItem.id, payload);
        setSuccessNotification(`Updated item '${formKey}' successfully.`);
      } else {
        await createNavigationMenuItem(menuDetail.id, payload);
        setSuccessNotification(`Added new item '${formKey}' successfully.`);
      }

      setIsItemModalOpen(false);
      await loadMenuDetail(selectedMenuKey);
      await loadAuditLogs();
      window.dispatchEvent(
        new CustomEvent('navigation-menu-updated', { detail: { menuKey: selectedMenuKey } })
      );
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Item
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setActionLoading(true);
    try {
      await deleteNavigationMenuItem(itemToDelete.id);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      setSuccessNotification('Item deleted successfully. Child items reparented.');
      await loadMenuDetail(selectedMenuKey);
      await loadAuditLogs();
      window.dispatchEvent(
        new CustomEvent('navigation-menu-updated', { detail: { menuKey: selectedMenuKey } })
      );
    } catch (err: any) {
      setErrorNotification(err.message || 'Failed to delete item');
    } finally {
      setActionLoading(false);
    }
  };

  // Reorder Item Up or Down
  const handleMoveItem = async (item: NavigationMenuItemDetail, direction: 'up' | 'down') => {
    if (!menuDetail) return;
    const items = [...menuDetail.items];
    const siblings = items
      .filter((i) => i.parentId === item.parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const index = siblings.findIndex((s) => s.id === item.id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === siblings.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const targetItem = siblings[targetIndex];

    const currentSort = item.sortOrder;
    const targetSort = targetItem.sortOrder === currentSort
      ? direction === 'up'
        ? currentSort - 5
        : currentSort + 5
      : targetItem.sortOrder;

    const payload = [
      { id: item.id, sortOrder: targetSort, parentId: item.parentId },
      { id: targetItem.id, sortOrder: currentSort, parentId: targetItem.parentId },
    ];

    setActionLoading(true);
    try {
      await reorderNavigationMenuItems(menuDetail.id, payload);
      setSuccessNotification(t('navigation.orderSaved', 'Navigation ordering saved successfully'));
      await loadMenuDetail(selectedMenuKey);
      await loadAuditLogs();
      window.dispatchEvent(
        new CustomEvent('navigation-menu-updated', { detail: { menuKey: selectedMenuKey } })
      );
    } catch (err: any) {
      setErrorNotification(err.message || 'Failed to reorder items');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Live API Preview
  const handleOpenApiPreview = async () => {
    try {
      const response = await fetchNavigationMenu(selectedMenuKey, isAr ? 'ar' : 'en');
      setApiPreviewData(JSON.stringify(response, null, 2));
      setIsApiPreviewOpen(true);
    } catch (err: any) {
      setErrorNotification(err.message || 'Failed to fetch API preview');
    }
  };

  const orderedTreeItems = useMemo(() => {
    if (!menuDetail?.items) return [];

    const itemMap = new Map<string, NavigationMenuItemDetail>();
    const childrenMap = new Map<string, NavigationMenuItemDetail[]>();

    menuDetail.items.forEach((item) => {
      itemMap.set(item.id, item);
      const pId = item.parentId || 'ROOT';
      if (!childrenMap.has(pId)) {
        childrenMap.set(pId, []);
      }
      childrenMap.get(pId)!.push(item);
    });

    const result: Array<NavigationMenuItemDetail & { level: number; parentLabel?: string }> = [];

    const traverse = (parentId: string, level: number) => {
      const children = (childrenMap.get(parentId) || []).sort(
        (a, b) => a.sortOrder - b.sortOrder
      );
      children.forEach((child) => {
        const parent = child.parentId ? itemMap.get(child.parentId) : undefined;
        result.push({
          ...child,
          level,
          parentLabel: parent?.label,
        });
        traverse(child.id, level + 1);
      });
    };

    traverse('ROOT', 0);
    return result;
  }, [menuDetail]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return orderedTreeItems;
    const q = searchQuery.toLowerCase();
    return orderedTreeItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.key.toLowerCase().includes(q) ||
        (item.path && item.path.toLowerCase().includes(q)) ||
        (item.permission && item.permission.toLowerCase().includes(q))
    );
  }, [orderedTreeItems, searchQuery]);

  const filteredAuditLogs = useMemo(() => {
    if (!auditSearchQuery.trim()) return auditLogs;
    const q = auditSearchQuery.toLowerCase();
    return auditLogs.filter(
      (log) =>
        log.action.toLowerCase().includes(q) ||
        (log.actorId && log.actorId.toLowerCase().includes(q)) ||
        (log.details && log.details.toLowerCase().includes(q))
    );
  }, [auditLogs, auditSearchQuery]);

  const headers = [
    { key: 'item', header: t('navigation.fields.labelEn', 'Label / Tree') },
    { key: 'key', header: t('navigation.fields.key', 'Stable Key') },
    { key: 'type', header: t('navigation.fields.type', 'Type') },
    { key: 'path', header: t('navigation.fields.path', 'Route / Path') },
    { key: 'permission', header: t('navigation.fields.permission', 'Permission') },
    { key: 'sortOrder', header: t('navigation.fields.sortOrder', 'Sort') },
    { key: 'status', header: 'Status' },
    { key: 'actions', header: 'Actions' },
  ];

  const auditHeaders = [
    { key: 'timestamp', header: 'Timestamp' },
    { key: 'action', header: 'Action Type' },
    { key: 'actor', header: 'Actor ID / User' },
    { key: 'entityId', header: 'Target Entity ID' },
    { key: 'details', header: 'Audit Details & Payload' },
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Page Title & Subtitle */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Flow size={28} />
            {t('navigation.title', 'Navigation & Menu Store')}
          </h2>
          <p style={{ color: 'var(--cds-text-secondary)', marginTop: '0.25rem' }}>
            {t(
              'navigation.subtitle',
              'Authoritative database-backed navigation trees, multi-lingual labels, and RBAC visibility policies'
            )}
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            kind={activeTab === 'editor' ? 'primary' : 'secondary'}
            size="md"
            renderIcon={Flow}
            onClick={() => setActiveTab('editor')}
          >
            Menu Editor
          </Button>
          <Button
            kind={activeTab === 'audit' ? 'primary' : 'secondary'}
            size="md"
            renderIcon={Activity}
            onClick={() => {
              setActiveTab('audit');
              loadAuditLogs();
            }}
          >
            Audit Trail ({auditLogs.length})
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {errorNotification && (
        <InlineNotification
          kind="error"
          title="Error"
          subtitle={errorNotification}
          onCloseButtonClick={() => setErrorNotification(null)}
          style={{ marginBottom: '1rem' }}
        />
      )}
      {successNotification && (
        <InlineNotification
          kind="success"
          title="Success"
          subtitle={successNotification}
          onCloseButtonClick={() => setSuccessNotification(null)}
          style={{ marginBottom: '1rem' }}
        />
      )}

      {/* Tab 1: Menu Editor */}
      {activeTab === 'editor' && (
        <>
          <Tile style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
            <Grid>
              <Column lg={6} md={4} sm={4}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ minWidth: '240px' }}>
                    {menus.length > 0 && (
                      <Dropdown
                        id="menu-select-dropdown"
                        titleText={t('navigation.selectMenu', 'Select Navigation Menu')}
                        label={t('navigation.selectMenu', 'Select Navigation Menu')}
                        items={menus}
                        itemToString={(item) => (item ? `${item.name} (${item.key})` : '')}
                        selectedItem={menus.find((m) => m.key === selectedMenuKey) || menus[0]}
                        onChange={({ selectedItem }) => {
                          if (selectedItem) {
                            setSelectedMenuKey(selectedItem.key);
                          }
                        }}
                        size="md"
                      />
                    )}
                  </div>

                  {menuDetail && (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '1.25rem' }}>
                      <Tag type="blue" size="md">
                        {t('navigation.menuVersion', 'Version')}: v{menuDetail.version}
                      </Tag>
                      <Tag type="green" size="md">
                        {t('navigation.totalItems', 'Total Items')}: {menuDetail.items.length}
                      </Tag>
                      <Tag type={menuDetail.isActive ? 'teal' : 'red'} size="md">
                        {menuDetail.isActive ? t('navigation.badges.active', 'Active') : t('navigation.badges.inactive', 'Inactive')}
                      </Tag>
                    </div>
                  )}
                </div>
              </Column>

              <Column lg={6} md={4} sm={4} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Button
                  kind="secondary"
                  size="md"
                  renderIcon={Renew}
                  onClick={() => {
                    loadMenuDetail(selectedMenuKey);
                    loadAuditLogs();
                  }}
                  disabled={loading || actionLoading}
                >
                  {t('navigation.refresh', 'Refresh')}
                </Button>
                <Button
                  kind="tertiary"
                  size="md"
                  renderIcon={Code}
                  onClick={handleOpenApiPreview}
                  disabled={loading || actionLoading}
                >
                  {t('navigation.previewApi', 'Live API (JSON)')}
                </Button>
                <Button
                  kind="primary"
                  size="md"
                  renderIcon={Add}
                  onClick={() => handleOpenCreateModal()}
                  disabled={loading || actionLoading}
                >
                  {t('navigation.addItem', 'Add Menu Item')}
                </Button>
              </Column>
            </Grid>
          </Tile>

          {loading ? (
            <Loading description={t('navigation.loadingMenu', 'Loading navigation menu from database...')} withOverlay={false} />
          ) : (
            <DataTable rows={filteredItems} headers={headers}>
              {({
                rows,
                headers: tableHeaders,
                getTableProps,
                getHeaderProps,
                getRowProps,
              }) => (
                <div className="cds--data-table-container">
                  <TableToolbar>
                    <TableToolbarContent>
                      <TableToolbarSearch
                        persistent
                        placeholder="Search menu items by label, key, path, or permission..."
                        value={searchQuery}
                        onChange={(e: any) => setSearchQuery(e.target.value)}
                      />
                    </TableToolbarContent>
                  </TableToolbar>

                  <Table {...getTableProps()} size="md" useZebraStyles>
                    <TableHead>
                      <TableRow>
                        {tableHeaders.map((header) => (
                          <TableHeader {...getHeaderProps({ header })} key={header.key}>
                            {header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                            <p style={{ color: 'var(--cds-text-secondary)' }}>
                              No navigation items found for this menu. Click "Add Menu Item" to get started.
                            </p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredItems.map((item) => {
                          const isChild = item.level > 0;
                          const arTranslation = item.translations?.find((tr) => tr.locale === 'ar');

                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div style={{ display: 'flex', alignItems: 'center', paddingInlineStart: `${item.level * 1.5}rem` }}>
                                  {isChild && (
                                    <span style={{ color: 'var(--cds-text-secondary)', marginInlineEnd: '0.5rem' }}>
                                      └─
                                    </span>
                                  )}
                                  <div>
                                    <div style={{ fontWeight: item.level === 0 ? 600 : 400 }}>
                                      {item.label}
                                    </div>
                                    {arTranslation && (
                                      <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', direction: 'rtl' }}>
                                        {arTranslation.label}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>

                              <TableCell>
                                <code style={{ fontSize: '0.8rem', background: 'var(--cds-layer-accent)', padding: '2px 6px', borderRadius: '4px' }}>
                                  {item.key}
                                </code>
                              </TableCell>

                              <TableCell>
                                <Tag
                                  type={
                                    item.type === 'GROUP'
                                      ? 'purple'
                                      : item.type === 'LINK'
                                      ? 'teal'
                                      : item.type === 'EXTERNAL_LINK'
                                      ? 'cyan'
                                      : 'cool-gray'
                                  }
                                  size="sm"
                                >
                                  {item.type}
                                </Tag>
                              </TableCell>

                              <TableCell>
                                {item.path ? (
                                  <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{item.path}</span>
                                ) : (
                                  <span style={{ color: 'var(--cds-text-disabled)', fontStyle: 'italic' }}>None (Group/Divider)</span>
                                )}
                              </TableCell>

                              <TableCell>
                                {item.permission ? (
                                  <Tag type="magenta" size="sm">
                                    {item.permission}
                                  </Tag>
                                ) : (
                                  <span style={{ color: 'var(--cds-text-secondary)', fontSize: '0.8rem' }}>Public (Role Default)</span>
                                )}
                              </TableCell>

                              <TableCell>{item.sortOrder}</TableCell>

                              <TableCell>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                  {item.isVisible ? (
                                    <Tag type="green" size="sm">Visible</Tag>
                                  ) : (
                                    <Tag type="gray" size="sm">Hidden</Tag>
                                  )}
                                  {!item.isEnabled && (
                                    <Tag type="red" size="sm">Disabled</Tag>
                                  )}
                                </div>
                              </TableCell>

                              <TableCell>
                                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                  <Button
                                    hasIconOnly
                                    renderIcon={ArrowUp}
                                    iconDescription="Move Up"
                                    kind="ghost"
                                    size="sm"
                                    onClick={() => handleMoveItem(item, 'up')}
                                    disabled={actionLoading}
                                  />
                                  <Button
                                    hasIconOnly
                                    renderIcon={ArrowDown}
                                    iconDescription="Move Down"
                                    kind="ghost"
                                    size="sm"
                                    onClick={() => handleMoveItem(item, 'down')}
                                    disabled={actionLoading}
                                  />
                                  <Button
                                    hasIconOnly
                                    renderIcon={Edit}
                                    iconDescription="Edit"
                                    kind="ghost"
                                    size="sm"
                                    onClick={() => handleOpenEditModal(item)}
                                    disabled={actionLoading}
                                  />
                                  <Button
                                    hasIconOnly
                                    renderIcon={TrashCan}
                                    iconDescription="Delete"
                                    kind="secondary"
                                    size="sm"
                                    onClick={() => {
                                      setItemToDelete(item);
                                      setIsDeleteModalOpen(true);
                                    }}
                                    disabled={actionLoading}
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </DataTable>
          )}
        </>
      )}

      {/* Tab 2: Audit Trail */}
      {activeTab === 'audit' && (
        <Tile style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Centralized Navigation Audit Trail</h3>
              <p style={{ color: 'var(--cds-text-secondary)', fontSize: '0.85rem' }}>
                Immutable tracking of all administrative menu creations, item updates, deletions, and structural reordering.
              </p>
            </div>
            <Button
              kind="secondary"
              size="sm"
              renderIcon={Renew}
              onClick={loadAuditLogs}
            >
              Refresh Audit Logs
            </Button>
          </div>

          <DataTable rows={filteredAuditLogs} headers={auditHeaders}>
            {({ rows, headers: tableHeaders, getTableProps, getHeaderProps }) => (
              <div className="cds--data-table-container">
                <TableToolbar>
                  <TableToolbarContent>
                    <TableToolbarSearch
                      persistent
                      placeholder="Search audit logs by action type, actor, or details..."
                      value={auditSearchQuery}
                      onChange={(e: any) => setAuditSearchQuery(e.target.value)}
                    />
                  </TableToolbarContent>
                </TableToolbar>

                <Table {...getTableProps()} size="md" useZebraStyles>
                  <TableHead>
                    <TableRow>
                      {tableHeaders.map((header) => (
                        <TableHeader {...getHeaderProps({ header })} key={header.key}>
                          {header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAuditLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                          <p style={{ color: 'var(--cds-text-secondary)' }}>No audit log entries recorded yet.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAuditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                            {new Date(log.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Tag
                              type={
                                log.action.includes('CREATE')
                                  ? 'green'
                                  : log.action.includes('UPDATE')
                                  ? 'blue'
                                  : log.action.includes('DELETE')
                                  ? 'red'
                                  : 'purple'
                              }
                              size="sm"
                            >
                              {log.action}
                            </Tag>
                          </TableCell>
                          <TableCell>
                            <code>{log.actorId}</code>
                            {log.actorEmail && <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>{log.actorEmail}</div>}
                          </TableCell>
                          <TableCell>
                            <code style={{ fontSize: '0.8rem' }}>{log.entityId || '—'}</code>
                          </TableCell>
                          <TableCell>
                            <div style={{ maxWidth: '400px', overflowX: 'auto', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                              {log.details || '—'}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </DataTable>
        </Tile>
      )}

      {/* Add / Edit Menu Item Modal */}
      <Modal
        open={isItemModalOpen}
        modalHeading={
          editingItem
            ? t('navigation.editItem', 'Edit Menu Item')
            : t('navigation.addItem', 'Add Menu Item')
        }
        primaryButtonText={t('navigation.actions.save', 'Save Item')}
        secondaryButtonText={t('navigation.actions.cancel', 'Cancel')}
        onRequestSubmit={handleSaveItem}
        onRequestClose={() => setIsItemModalOpen(false)}
        primaryButtonDisabled={actionLoading}
        size="md"
      >
        <div style={{ padding: '0.5rem 0' }}>
          {formError && (
            <InlineNotification
              kind="error"
              title="Validation Error"
              subtitle={formError}
              style={{ marginBottom: '1rem' }}
            />
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Grid fullWidth>
              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="form-item-key"
                  labelText={t('navigation.fields.key', 'Stable Key Identifier')}
                  helperText={t('navigation.fields.keyHelper', 'e.g. academic.students, finance.invoices')}
                  value={formKey}
                  onChange={(e) => setFormKey(e.target.value)}
                  placeholder="e.g. academic.students"
                  required
                />
              </Column>
              <Column lg={8} md={4} sm={4}>
                <Select
                  id="form-item-type"
                  labelText={t('navigation.fields.type', 'Item Type')}
                  value={formType}
                  onChange={(e) => {
                    const newType = e.target.value as any;
                    setFormType(newType);
                    if (newType === 'GROUP' || newType === 'DIVIDER') {
                      setFormPath('');
                    }
                  }}
                >
                  <SelectItem value="LINK" text={t('navigation.types.LINK', 'Navigation Link')} />
                  <SelectItem value="GROUP" text={t('navigation.types.GROUP', 'Collapsible Group')} />
                  <SelectItem value="EXTERNAL_LINK" text={t('navigation.types.EXTERNAL_LINK', 'External URL')} />
                  <SelectItem value="DIVIDER" text={t('navigation.types.DIVIDER', 'Section Divider')} />
                </Select>
              </Column>
            </Grid>

            <Grid fullWidth>
              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="form-item-label-en"
                  labelText={t('navigation.fields.labelEn', 'Label (English)')}
                  value={formLabelEn}
                  onChange={(e) => setFormLabelEn(e.target.value)}
                  placeholder="English title"
                  required
                />
              </Column>
              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="form-item-label-ar"
                  labelText={t('navigation.fields.labelAr', 'Label (Arabic)')}
                  value={formLabelAr}
                  onChange={(e) => setFormLabelAr(e.target.value)}
                  placeholder="العنوان بالعربية"
                  dir="rtl"
                />
              </Column>
            </Grid>

            <Grid fullWidth>
              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="form-item-path"
                  labelText={t('navigation.fields.path', 'Route / Path')}
                  helperText={t('navigation.fields.pathHelper', 'Required for LINK; must be empty for GROUP/DIVIDER')}
                  value={formPath}
                  onChange={(e) => setFormPath(e.target.value)}
                  placeholder="/sis/directory"
                  disabled={formType === 'GROUP' || formType === 'DIVIDER'}
                />
              </Column>
              <Column lg={8} md={4} sm={4}>
                <Select
                  id="form-item-icon"
                  labelText={t('navigation.fields.icon', 'Carbon Icon')}
                  value={formIcon}
                  onChange={(e) => setFormIcon(e.target.value)}
                >
                  {AVAILABLE_CARBON_ICONS.map((iconName) => (
                    <SelectItem key={iconName} value={iconName} text={iconName} />
                  ))}
                </Select>
              </Column>
            </Grid>

            <Grid fullWidth>
              <Column lg={8} md={4} sm={4}>
                <Select
                  id="form-item-parent"
                  labelText={t('navigation.fields.parent', 'Parent Item')}
                  value={formParentId}
                  onChange={(e) => setFormParentId(e.target.value)}
                >
                  <SelectItem value="" text={t('navigation.fields.noParent', 'None (Top Level Root)')} />
                  {menuDetail?.items
                    .filter((item) => !editingItem || item.id !== editingItem.id)
                    .map((item) => (
                      <SelectItem
                        key={item.id}
                        value={item.id}
                        text={`${item.label} (${item.key})`}
                      />
                    ))}
                </Select>
              </Column>
              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="form-item-permission"
                  labelText={t('navigation.fields.permission', 'Required Permission')}
                  helperText={t('navigation.fields.permissionHelper', 'e.g. students.read, finance.read')}
                  value={formPermission}
                  onChange={(e) => setFormPermission(e.target.value)}
                  placeholder="e.g. students.read (leave blank for public)"
                />
              </Column>
            </Grid>

            <Grid fullWidth>
              <Column lg={4} md={2} sm={4}>
                <TextInput
                  id="form-item-sort-order"
                  labelText={t('navigation.fields.sortOrder', 'Sort Order')}
                  type="number"
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(Number(e.target.value))}
                />
              </Column>
              <Column lg={12} md={6} sm={4} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1.25rem' }}>
                <Checkbox
                  id="form-item-visible"
                  labelText={t('navigation.fields.isVisible', 'Visible in Menu')}
                  checked={formIsVisible}
                  onChange={(_e, { checked }) => setFormIsVisible(checked)}
                />
                <Checkbox
                  id="form-item-enabled"
                  labelText={t('navigation.fields.isEnabled', 'Enabled / Clickable')}
                  checked={formIsEnabled}
                  onChange={(_e, { checked }) => setFormIsEnabled(checked)}
                />
                <Checkbox
                  id="form-item-new-tab"
                  labelText={t('navigation.fields.openInNewTab', 'Open in New Tab')}
                  checked={formOpenInNewTab}
                  onChange={(_e, { checked }) => setFormOpenInNewTab(checked)}
                />
              </Column>
            </Grid>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={isDeleteModalOpen}
        modalHeading={t('navigation.deleteItem', 'Delete Menu Item')}
        primaryButtonText={t('navigation.actions.delete', 'Delete')}
        secondaryButtonText={t('navigation.actions.cancel', 'Cancel')}
        danger
        onRequestSubmit={handleConfirmDelete}
        onRequestClose={() => setIsDeleteModalOpen(false)}
        primaryButtonDisabled={actionLoading}
        size="sm"
      >
        <p>
          {t(
            'navigation.deleteItemConfirm',
            'Are you sure you want to delete this menu item? Any child items will be reparented automatically.'
          )}
        </p>
        {itemToDelete && (
          <p style={{ marginTop: '0.75rem', fontWeight: 600 }}>
            {itemToDelete.label} ({itemToDelete.key})
          </p>
        )}
      </Modal>

      {/* Live API Preview Modal */}
      <Modal
        open={isApiPreviewOpen}
        modalHeading={`${t('navigation.previewApi', 'Live API Preview')} — /api/v1/navigation/menus/${selectedMenuKey}?locale=${isAr ? 'ar' : 'en'}`}
        primaryButtonText="Close"
        onRequestSubmit={() => setIsApiPreviewOpen(false)}
        onRequestClose={() => setIsApiPreviewOpen(false)}
        size="lg"
      >
        <div style={{ marginTop: '0.5rem' }}>
          <p style={{ color: 'var(--cds-text-secondary)', marginBottom: '0.5rem' }}>
            This is the live payload returned from the database by the Navigation API for the authenticated user and active language:
          </p>
          <CodeSnippet type="multi" maxCollapsedNumberOfRows={25}>
            {apiPreviewData}
          </CodeSnippet>
        </div>
      </Modal>
    </div>
  );
}

export default NavigationManagementPage;
