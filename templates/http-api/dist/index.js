import { openHttpFormDemo, openLocalhostHttpDemo } from './form-modal-demo.js';
import { openHttpListDetailDemo } from './list-detail-demo.js';
const t = sigma.i18n.extensionT;
export async function activate(_context) {
    await sigma.i18n.mergeFromPath('locales');
    sigma.commands.registerCommand({
        id: 'demo-http-form',
        title: t('commandFormTitle'),
        description: t('commandFormDescription'),
    }, () => openHttpFormDemo());
    sigma.commands.registerCommand({
        id: 'demo-http-localhost',
        title: t('commandLocalhostTitle'),
        description: t('commandLocalhostDescription'),
    }, () => openLocalhostHttpDemo());
    sigma.commands.registerCommand({
        id: 'demo-http-list-detail',
        title: t('commandListDetailTitle'),
        description: t('commandListDetailDescription'),
    }, () => openHttpListDetailDemo());
}
export async function deactivate() { }
