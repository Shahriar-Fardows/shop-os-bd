// Mirror of server/src/app/modules/platform-config/tools.catalog.ts
// Keep the `key` values in sync across all three folders.
export const TOOL_CATALOG = [
    { key: 'digitalKhata',      label: 'Digital Khata + Inventory', href: '/dashboard/accounting' },
    { key: 'linksHub',          label: 'Links Hub',              href: '/dashboard/links' },
    { key: 'imageHub',          label: 'Image Hub (R2)',         href: '/dashboard/image-hub' },
    { key: 'nidPrinter',        label: 'NID Printer',            href: '/dashboard/nid-printer' },
    { key: 'imageEditor',       label: 'Image Editor (BG)',      href: '/dashboard/image-edit' },
    { key: 'cvMaker',           label: 'CV / Bio-Data Maker',    href: '/dashboard/cv-maker' },
    { key: 'applicationLetter', label: 'Application Letter',     href: '/dashboard/application-letter' },
    { key: 'cashMemo',          label: 'Cash Memo Maker',        href: '/dashboard/cash-memo' },
    { key: 'qrCode',            label: 'QR Code Maker',          href: '/dashboard/qr-code' },
    { key: 'jointPhoto',        label: 'Joint Passport Photo',   href: '/dashboard/joint-photo' },
    { key: 'support',           label: 'Support Center',         href: '/dashboard/support' },
];

export const TOOL_KEYS = TOOL_CATALOG.map(t => t.key);

export const PLAN_KEYS = ['free', 'normal', 'premium', 'diamond'];

/**
 * Map a dashboard pathname to its tool key (for gating).
 * Returns null for routes that aren't gated (dashboard home, profile, subscribe, refer).
 */
export const pathToToolKey = (pathname) => {
    const match = TOOL_CATALOG.find(t => pathname === t.href || pathname.startsWith(t.href + '/'));
    return match?.key || null;
};

/**
 * Resolve the user's effective plan key for gating.
 *   'free'    → no active paid subscription
 *   'normal' | 'premium' | 'diamond' → matched against package.name (lowercase, first token)
 */
export const resolvePlanKey = (user) => {
    const now = Date.now();
    const isPaidActive =
        user?.planType === 'paid' &&
        user?.subscriptionExpiresAt &&
        new Date(user.subscriptionExpiresAt).getTime() > now;

    if (!isPaidActive) return 'free';

    const raw = (user?.currentPackage?.name || '').toLowerCase();
    if (raw.includes('diamond')) return 'diamond';
    if (raw.includes('premium')) return 'premium';
    if (raw.includes('normal'))  return 'normal';
    // Unknown paid package name → treat as premium (safer than dropping paid user to free)
    return 'premium';
};

/**
 * Does this user have ANY active paid plan? Used for e.g. premium Links Hub access.
 */
export const hasActivePaidPlan = (user) => resolvePlanKey(user) !== 'free';

/**
 * Resolve which tool keys this user currently has access to.
 * Derived from the per-plan toolAccess matrix on PlatformConfig.
 */
export const getActiveTools = (user, config) => {
    const planKey = resolvePlanKey(user);
    const matrix = config?.toolAccess || {};
    const list = Array.isArray(matrix[planKey]) ? matrix[planKey] : [];
    return list;
};
