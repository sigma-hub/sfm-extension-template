import type { ExtensionActivationContext } from '@sigma-file-manager/api';

const t = sigma.i18n.extensionT;

function sleep(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export async function activate(_context: ExtensionActivationContext): Promise<void> {
  await sigma.i18n.mergeFromPath('locales');

  sigma.commands.registerCommand(
    {
      id: 'my-extension.show-context',
      title: t('showContextTitle'),
      description: t('showContextDescription'),
    },
    async () => {
      const currentPath = await sigma.context.getCurrentPath();
      const selectedEntries = await sigma.context.getSelectedEntries();
      const content = [
        sigma.ui.input({
          id: 'currentPath',
          label: t('currentPathLabel'),
          value: currentPath || t('notAvailable'),
          disabled: true,
        }),
        sigma.ui.input({
          id: 'selectedCount',
          label: t('selectedCountLabel'),
          value: String(selectedEntries.length),
          disabled: true,
        }),
      ];

      for (const [entryIndex, entry] of selectedEntries.slice(0, 3).entries()) {
        content.push(
          sigma.ui.input({
            id: `entry-${entryIndex}`,
            label: entry.isDirectory ? t('directoryLabel') : t('fileLabel'),
            value: entry.path,
            disabled: true,
          })
        );
      }

      sigma.ui.createModal({
        title: t('showContextTitle'),
        width: 720,
        content,
      });
    }
  );

  sigma.commands.registerCommand(
    {
      id: 'my-extension.show-settings',
      title: t('showSettingsTitle'),
      description: t('showSettingsDescription'),
    },
    async () => {
      const allSettings = await sigma.settings.getAll();
      const content = [
        sigma.ui.text(t('settingsIntro')),
        sigma.ui.separator(),
      ];

      for (const [settingKey, settingValue] of Object.entries(allSettings)) {
        content.push(
          sigma.ui.input({
            id: settingKey,
            label: settingKey,
            value: String(settingValue),
            disabled: true,
          })
        );
      }

      sigma.ui.createModal({
        title: t('showSettingsTitle'),
        width: 640,
        content,
      });
    }
  );

  sigma.commands.registerCommand(
    {
      id: 'my-extension.demo-progress',
      title: t('demoProgressTitle'),
      description: t('demoProgressDescription'),
    },
    async () => {
      const totalStepsSetting = await sigma.settings.get('totalSteps');
      const stepDelaySetting = await sigma.settings.get('stepDelayMs');
      const totalSteps = typeof totalStepsSetting === 'number' ? totalStepsSetting : 10;
      const stepDelayMs = typeof stepDelaySetting === 'number' ? stepDelaySetting : 250;
      let completedSteps = 0;

      const result = await sigma.ui.withProgress(
        {
          subtitle: t('progressSubtitle'),
          location: 'notification',
          cancellable: true,
        },
        async (progress, cancellationToken) => {
          for (let stepIndex = 0; stepIndex < totalSteps; stepIndex++) {
            if (cancellationToken.isCancellationRequested) {
              return { completed: false, completedSteps };
            }

            progress.report({
              description: t('progressDescription', { current: stepIndex + 1, total: totalSteps }),
              increment: 100 / totalSteps,
            });

            await sleep(stepDelayMs);
            completedSteps++;
          }

          return { completed: true, completedSteps };
        }
      );

      sigma.ui.showNotification({
        title: result.completed ? t('progressFinishedTitle') : t('progressCancelledTitle'),
        subtitle: t('progressFinishedSubtitle', { completed: result.completedSteps, total: totalSteps }),
        type: result.completed ? 'success' : 'warning',
      });
    }
  );
}

export async function deactivate(): Promise<void> {}
