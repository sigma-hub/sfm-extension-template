export type CommandCandidate = {
  command: string;
  args: string[];
};

export function getWindowsPowerShellCandidates(script: string): CommandCandidate[] {
  return [
    { command: 'powershell', args: ['-NoProfile', '-Command', script] },
    { command: 'pwsh', args: ['-NoProfile', '-Command', script] },
    { command: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', args: ['-NoProfile', '-Command', script] },
  ];
}

function getErrorMessage(error: unknown): string {
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

export async function runPowerShellScript(script: string): Promise<string> {
  if (!sigma.platform.isWindows) {
    throw new Error('PowerShell is only supported on Windows.');
  }

  let latestError: unknown = null;

  for (const commandCandidate of getWindowsPowerShellCandidates(script)) {
    try {
      const runningCommand = await sigma.shell.runWithProgress(
        commandCandidate.command,
        commandCandidate.args,
        () => {}
      );
      const result = await runningCommand.result;

      if (result.code !== 0) {
        throw new Error(result.stderr || `${commandCandidate.command} exited with code ${result.code}`);
      }

      return result.stdout;
    } catch (error) {
      latestError = error;

      if (isCommandNotFoundError(error)) {
        continue;
      }

      throw error;
    }
  }

  throw latestError instanceof Error ? latestError : new Error('No available PowerShell command candidates');
}
