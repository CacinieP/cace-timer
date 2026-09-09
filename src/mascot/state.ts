import { Expression } from './assets/mint';

export type MascotState =
  | 'idle'
  | 'focused'
  | 'waiting'
  | 'needs_input'
  | 'unclassified'
  | 'job_succeeded'
  | 'task_completed'
  | 'failed'
  | 'resting';

// Only verified application events select these states. A successful job is
// deliberately separate from completion of the user's entire task.
export function expressionForState(state: MascotState, elapsedMs = 0): Expression {
  switch (state) {
    case 'waiting':
      return elapsedMs < 700 ? 'peek' : 'head_tilt';
    case 'needs_input':
      return 'surprised';
    case 'unclassified':
      return 'head_tilt';
    case 'job_succeeded':
      return 'happy';
    case 'task_completed':
      return elapsedMs < 350 ? 'excited' : elapsedMs < 1000 ? 'happy' : 'little_smile';
    case 'failed':
      return elapsedMs < 500 ? 'surprised' : 'head_tilt';
    case 'resting':
      return 'asleep';
    default:
      return 'little_smile';
  }
}
