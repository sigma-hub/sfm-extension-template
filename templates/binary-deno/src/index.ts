import type { ExtensionActivationContext } from '@sigma-file-manager/api';

const t = sigma.i18n.extensionT;

interface JsonToolPayload {
  output: string;
}

async function runJsonTool(
  scriptPath: string,
  action: string,
  jsonInput: string,
): Promise<string> {
  const denoBinaryPath = await sigma.binary.getPath('deno');

  if (!denoBinaryPath) {
    throw new Error(t('runtimeUnavailable'));
  }

  const result = await sigma.shell.run(denoBinaryPath, [
    'run',
    '--quiet',
    scriptPath,
    action,
    jsonInput,
  ]);

  if (result.code !== 0) {
    throw new Error(result.stderr || t('commandFailed'));
  }

  const payload = JSON.parse(result.stdout.trim()) as JsonToolPayload;
  return payload.output;
}

export async function activate(context: ExtensionActivationContext): Promise<void> {
  await sigma.i18n.mergeFromPath('locales');

  const jsonToolsScriptPath = await sigma.platform.joinPath(context.extensionPath, 'scripts', 'json-tools.js');

  sigma.commands.registerCommand(
    {
      id: 'my-extension.deno-json-tools',
      title: t('commandTitle'),
      description: t('commandDescription'),
    },
    async () => {
      return new Promise<void>((resolve) => {
        const modal = sigma.ui.createModal({
          title: t('commandTitle'),
          width: 720,
          content: [
            sigma.ui.select({
              id: 'action',
              label: t('actionLabel'),
              options: [
                { value: 'validate', label: t('validateAction') },
                { value: 'pretty', label: t('prettyAction') },
                { value: 'minify', label: t('minifyAction') },
              ],
              value: 'validate',
            }),
            sigma.ui.textarea({
              id: 'jsonInput',
              label: t('jsonLabel'),
              placeholder: '{\n  "name": "Sigma"\n}',
              rows: 10,
            }),
            sigma.ui.textarea({
              id: 'resultOutput',
              label: t('resultLabel'),
              value: '',
              rows: 8,
              disabled: true,
            }),
          ],
          buttons: [
            { id: 'run', label: t('runLabel'), variant: 'primary', shortcut: { key: 'Enter', modifiers: ['ctrl'] } },
          ],
        });

        modal.onSubmit(async (values, buttonId) => {
          if (buttonId !== 'run') {
            return false;
          }

          const action = typeof values.action === 'string' ? values.action : 'validate';
          const jsonInput = typeof values.jsonInput === 'string' ? values.jsonInput.trim() : '';

          if (!jsonInput) {
            modal.updateElement('resultOutput', {
              value: t('jsonInputRequired'),
            });
            return false;
          }

          try {
            const output = await runJsonTool(jsonToolsScriptPath, action, jsonInput);
            modal.updateElement('resultOutput', {
              value: output,
            });
          } catch (error) {
            modal.updateElement('resultOutput', {
              value: error instanceof Error ? error.message : String(error),
            });
          }

          return false;
        });

        modal.onClose(() => resolve());
      });
    }
  );
}

export async function deactivate(): Promise<void> {}
