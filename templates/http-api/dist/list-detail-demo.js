import { requestJson, showHttpErrorNotification, showHttpSuccessNotification, } from './http-client.js';
const t = sigma.i18n.extensionT;
const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts';
function getFilterOptions() {
    return [
        { value: 'all', label: t('filterAll') },
        { value: '1', label: t('filterUser1') },
        { value: '2', label: t('filterUser2') },
        { value: '3', label: t('filterUser3') },
    ];
}
function filterPosts(posts, searchQuery, filterValue) {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
        const matchesFilter = filterValue === 'all' || String(post.userId) === filterValue;
        if (!matchesFilter) {
            return false;
        }
        if (normalizedQuery.length === 0) {
            return true;
        }
        return post.title.toLowerCase().includes(normalizedQuery)
            || post.body.toLowerCase().includes(normalizedQuery);
    });
}
function buildListItems(posts) {
    return posts.map((post) => ({
        id: String(post.id),
        title: post.title,
        subtitle: t('detailPostId') + `: ${post.id}`,
        icon: 'text',
        badge: `U${post.userId}`,
    }));
}
function buildDetailForPost(post) {
    if (!post) {
        return {
            detail: {
                type: 'empty',
            },
            detailFields: [],
        };
    }
    return {
        detail: {
            type: 'text',
            text: post.body,
        },
        detailFields: [
            { label: t('detailPostId'), value: String(post.id) },
            { label: t('detailUserId'), value: String(post.userId) },
            { label: t('detailTitle'), value: post.title },
            { label: t('detailBody'), value: post.body },
        ],
    };
}
function buildListDetailState(posts, searchQuery = '', filterValue = 'all', selectedItemId = null) {
    const filteredPosts = filterPosts(posts, searchQuery, filterValue);
    const resolvedSelection = selectedItemId && filteredPosts.some((post) => String(post.id) === selectedItemId)
        ? selectedItemId
        : (filteredPosts[0] ? String(filteredPosts[0].id) : null);
    const selectedPost = filteredPosts.find((post) => String(post.id) === resolvedSelection);
    const { detail, detailFields } = buildDetailForPost(selectedPost);
    return {
        items: buildListItems(filteredPosts),
        selectedItemId: resolvedSelection,
        searchQuery,
        filterValue,
        filterOptions: getFilterOptions(),
        searchPlaceholder: t('searchPlaceholder'),
        detail,
        detailFields,
        emptyListTitle: t('emptyListTitle'),
        emptyListDescription: t('emptyListDescription'),
        emptyDetailTitle: t('emptyDetailTitle'),
        emptyDetailDescription: t('emptyDetailDescription'),
    };
}
function buildActionButtons() {
    return [
        {
            id: 'refresh',
            label: t('refreshButton'),
            variant: 'secondary',
        },
        {
            id: 'close',
            label: t('closeButton'),
            variant: 'primary',
            shortcut: { key: 'Enter' },
        },
    ];
}
async function fetchDemoPosts() {
    return requestJson({
        url: POSTS_URL,
        query: {
            _limit: 50,
        },
    });
}
async function refreshModalState(modal, posts, overrides = {}) {
    const currentState = modal.getListDetail();
    const nextState = buildListDetailState(posts, overrides.searchQuery ?? currentState.searchQuery, overrides.filterValue ?? currentState.filterValue, overrides.selectedItemId === undefined ? currentState.selectedItemId : overrides.selectedItemId);
    await modal.setListDetail(nextState);
}
export async function openHttpListDetailDemo() {
    let cachedPosts = [];
    try {
        cachedPosts = await fetchDemoPosts();
        showHttpSuccessNotification('notificationListDetailLoadedSubtitle', { count: cachedPosts.length });
    }
    catch (loadError) {
        showHttpErrorNotification(loadError);
        sigma.ui.showNotification({
            title: t('notificationErrorTitle'),
            subtitle: t('loadPostsError'),
            type: 'error',
        });
        return;
    }
    const modal = sigma.ui.createModal({
        title: t('modalListDetailTitle'),
        commandTitle: t('commandListDetailTitle'),
        layout: 'listDetail',
        width: 920,
        listDetail: buildListDetailState(cachedPosts),
        buttons: buildActionButtons(),
    });
    modal.onSelectionChange(async (itemId) => {
        try {
            await refreshModalState(modal, cachedPosts, { selectedItemId: itemId });
        }
        catch (refreshError) {
            showHttpErrorNotification(refreshError);
        }
    });
    modal.onSearchChange(async (searchQuery) => {
        try {
            await refreshModalState(modal, cachedPosts, { searchQuery, selectedItemId: null });
        }
        catch (refreshError) {
            showHttpErrorNotification(refreshError);
        }
    });
    modal.onFilterChange(async (filterValue) => {
        try {
            await refreshModalState(modal, cachedPosts, { filterValue, selectedItemId: null });
        }
        catch (refreshError) {
            showHttpErrorNotification(refreshError);
        }
    });
    modal.onSubmit(async (_values, buttonId) => {
        if (buttonId === 'refresh') {
            try {
                cachedPosts = await fetchDemoPosts();
                showHttpSuccessNotification('notificationListDetailLoadedSubtitle', { count: cachedPosts.length });
                await refreshModalState(modal, cachedPosts, { selectedItemId: null });
            }
            catch (refreshError) {
                showHttpErrorNotification(refreshError);
            }
            return false;
        }
        return true;
    });
}
