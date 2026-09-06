export type AutomationType = 'rpa-bot' | 'scheduled-script' | 'data-pipeline' | 'api-integration' | 'file-transfer';
export type AutomationStatus = 'active' | 'inactive' | 'error' | 'draft';
export type Environment = 'production' | 'staging' | 'development';
export type ConfigEntryType =
  | 'text' | 'uuid'
  | 'int4' | 'int8' | 'float8'
  | 'bool'
  | 'date' | 'time' | 'timestamp' | 'timestamptz'
  | 'jsonb'
  | 'secret';

export interface ConfigEntry {
  id: string;
  key: string;
  value: string | number | boolean;
  type: ConfigEntryType;
  description?: string;
  required: boolean;
}

export interface ConfigSection {
  id: string;
  name: string;
  description?: string;
  entries: ConfigEntry[];
}

export interface Automation {
  id: string;
  name: string;
  type: AutomationType;
  status: AutomationStatus;
  environment: Environment;
  owner: string;
  description: string;
  lastModified: string;
  createdAt: string;
  version: string;
  tags: string[];
  config: ConfigSection[];
  cronExpression?: string;
}

export const TYPE_LABELS: Record<AutomationType, string> = {
  'rpa-bot': 'RPA Bot',
  'scheduled-script': 'Scheduled Script',
  'data-pipeline': 'Data Pipeline',
  'api-integration': 'API Integration',
  'file-transfer': 'File Transfer',
};

export const STATUS_COLORS: Record<AutomationStatus, string> = {
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-neutral-800 dark:text-gray-300',
  error: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  draft: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
};
