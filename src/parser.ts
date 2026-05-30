// ============ CLI Parser ============
export interface ParsedArgs {
  command: string;
  positional: string[];
  options: Record<string, string | boolean | string[]>;
}

export function parseArgs(args: string[]): ParsedArgs {
  const result: ParsedArgs = {
    command: '',
    positional: [],
    options: {},
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];

      if (nextArg && !nextArg.startsWith('-')) {
        // Support repeated flags: accumulate into array
        const existing = result.options[key];
        if (Array.isArray(existing)) {
          existing.push(nextArg);
        } else if (typeof existing === 'string') {
          result.options[key] = [existing, nextArg];
        } else {
          result.options[key] = nextArg;
        }
        i += 2;
      } else {
        result.options[key] = true;
        i++;
      }
    } else if (!result.command) {
      result.command = arg;
      i++;
    } else {
      result.positional.push(arg);
      i++;
    }
  }

  return result;
}
