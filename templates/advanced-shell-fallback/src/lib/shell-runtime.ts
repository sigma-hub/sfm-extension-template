import type { CancellationToken, Progress } from '@sigma-file-manager/api';

export type CommandCandidate = {
  command: string;
  args: string[];
};

export type TranslateFn = (
  key: string,
  params?: Record<string, string | number>
) => string;

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return String(error);
}

function isCommandNotFoundError(error: unknown): boolean {
  const errorMessage = getErrorMessage(error).toLowerCase();
  return (
    errorMessage.includes('not found')
    || errorMessage.includes('does not exist')
    || errorMessage.includes('cannot find')
  );
}

export function escapeForPowerShellSingleQuotes(text: string): string {
  return String(text).replace(/'/g, "''");
}

export function getWindowsPowerShellCandidates(script: string): CommandCandidate[] {
  return [
    { command: 'powershell', args: ['-NoProfile', '-Command', script] },
    { command: 'pwsh', args: ['-NoProfile', '-Command', script] },
    { command: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', args: ['-NoProfile', '-Command', script] },
  ];
}

export async function getDenoCommandCandidates(denoArgs: string[]): Promise<CommandCandidate[]> {
  const denoBinaryPath = await sigma.binary.getPath('deno');

  if (!denoBinaryPath) {
    throw new Error('Managed Deno binary is unavailable');
  }

  return [{ command: denoBinaryPath, args: denoArgs }];
}

export async function runFirstAvailableCommandWithProgress(
  commandCandidates: CommandCandidate[],
  progress: Progress,
  cancellationToken: CancellationToken,
  translate: TranslateFn,
): Promise<
  | { cancelled: true }
  | { cancelled: false; result: Awaited<ReturnType<typeof sigma.shell.run>>; commandName: string }
> {
  let latestError: unknown = null;
  let progressValue = 8;

  for (const commandCandidate of commandCandidates) {
    if (cancellationToken.isCancellationRequested) {
      return { cancelled: true };
    }

    try {
      progress.report({
        description: translate('runningCommand', { command: commandCandidate.command }),
        increment: progressValue,
      });
      progressValue = 0;

      const runningCommand = await sigma.shell.runWithProgress(
        commandCandidate.command,
        commandCandidate.args,
        () => {
          if (!cancellationToken.isCancellationRequested) {
            progress.report({
              description: translate('workingWithRuntime', { command: commandCandidate.command }),
              increment: 0.4,
            });
          }
        }
      );

      const cancellationListener = cancellationToken.onCancellationRequested(() => {
        runningCommand.cancel().catch(() => {});
      });

      try {
        const result = await runningCommand.result;
        return {
          cancelled: false,
          result,
          commandName: commandCandidate.command,
        };
      } finally {
        cancellationListener.dispose();
      }
    } catch (error) {
      latestError = error;

      if (cancellationToken.isCancellationRequested) {
        return { cancelled: true };
      }

      if (isCommandNotFoundError(error)) {
        continue;
      }

      throw error;
    }
  }

  throw latestError instanceof Error ? latestError : new Error('No available command candidates');
}
