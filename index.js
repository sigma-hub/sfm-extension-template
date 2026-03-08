// @ts-check

/**
 * @typedef {import('./sigma-extension').ExtensionActivationContext} ExtensionActivationContext
 */

/**
 * @param {ExtensionActivationContext} context
 * @returns {Promise<void>}
 */
async function activate(context) {
  console.log('[Template] Extension activated at:', context.extensionPath);

  sigma.commands.registerCommand(
    {
      id: 'say-hello',
      title: 'Say Hello',
      description: 'Show a notification from the template extension',
    },
    () => {
      sigma.ui.showNotification({
        title: 'Hello',
        subtitle: 'Your Sigma File Manager extension is running.',
        type: 'success',
      });
    }
  );
}

/**
 * @returns {Promise<void>}
 */
async function deactivate() {
}

module.exports = { activate, deactivate };
