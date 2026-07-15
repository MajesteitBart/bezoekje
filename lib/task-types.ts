// Built-in task types every roster gets. Admin-defined custom types live in
// the task_types table; both are offered together when creating a task.
export type DefaultTaskType = {
  name: string;
  emoji: string;
  needsTime: boolean;
};

export const DEFAULT_TASK_TYPES: readonly DefaultTaskType[] = [
  { name: "Koken", emoji: "🍳", needsTime: true },
  { name: "Vervoer", emoji: "🚗", needsTime: true },
  { name: "Boodschappen", emoji: "🛒", needsTime: false },
  { name: "Huishouden", emoji: "🧹", needsTime: false },
] as const;

export const MAX_CUSTOM_TASK_TYPES = 12;
