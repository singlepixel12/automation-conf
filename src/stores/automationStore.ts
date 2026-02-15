import { create } from 'zustand';
import type { Automation, AutomationStatus, ConfigEntry, ConfigSection } from '@/types/automation';
import { mockAutomations } from '@/data/mockData';

interface AutomationStore {
  automations: Automation[];

  // CRUD
  addAutomation: (automation: Omit<Automation, 'id' | 'createdAt' | 'lastModified' | 'version' | 'config'>) => void;
  duplicateAutomation: (id: string) => string | null;
  updateAutomation: (id: string, updates: Partial<Automation>) => void;
  deleteAutomation: (id: string) => void;

  // Status
  setStatus: (id: string, status: AutomationStatus) => void;
  disableAll: () => void;

  // Config editing
  updateConfigEntry: (automationId: string, sectionId: string, entryId: string, value: ConfigEntry['value']) => void;
  addConfigEntry: (automationId: string, sectionId: string, entry: Omit<ConfigEntry, 'id'>) => void;
  removeConfigEntry: (automationId: string, sectionId: string, entryId: string) => void;
  addConfigSection: (automationId: string, section: Omit<ConfigSection, 'id'>) => void;
  removeConfigSection: (automationId: string, sectionId: string) => void;
}

let nextId = 19;
const genId = (prefix: string) => `${prefix}-${String(nextId++).padStart(3, '0')}`;

export const useAutomationStore = create<AutomationStore>((set) => ({
  automations: mockAutomations,

  addAutomation: (data) =>
    set((state) => ({
      automations: [
        ...state.automations,
        {
          ...data,
          id: genId('auto'),
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          version: '0.1.0',
          config: [],
        },
      ],
    })),

  duplicateAutomation: (id) => {
    const state = useAutomationStore.getState();
    const source = state.automations.find((a) => a.id === id);
    if (!source) return null;
    const newId = genId('auto');
    const deepCopyConfig = source.config.map((section) => ({
      ...section,
      id: genId('cs'),
      entries: section.entries.map((entry) => ({ ...entry, id: genId('ce') })),
    }));
    useAutomationStore.setState({
      automations: [
        ...state.automations,
        {
          ...source,
          id: newId,
          name: `${source.name}_copy`,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          version: '0.1.0',
          config: deepCopyConfig,
        },
      ],
    });
    return newId;
  },

  updateAutomation: (id, updates) =>
    set((state) => ({
      automations: state.automations.map((a) =>
        a.id === id ? { ...a, ...updates, lastModified: new Date().toISOString() } : a
      ),
    })),

  deleteAutomation: (id) =>
    set((state) => ({
      automations: state.automations.filter((a) => a.id !== id),
    })),

  setStatus: (id, status) =>
    set((state) => ({
      automations: state.automations.map((a) =>
        a.id === id ? { ...a, status, lastModified: new Date().toISOString() } : a
      ),
    })),

  disableAll: () =>
    set((state) => ({
      automations: state.automations.map((a) => ({
        ...a,
        status: 'inactive' as const,
        lastModified: new Date().toISOString(),
      })),
    })),

  updateConfigEntry: (automationId, sectionId, entryId, value) =>
    set((state) => ({
      automations: state.automations.map((a) =>
        a.id === automationId
          ? {
              ...a,
              lastModified: new Date().toISOString(),
              config: a.config.map((s) =>
                s.id === sectionId
                  ? { ...s, entries: s.entries.map((e) => (e.id === entryId ? { ...e, value } : e)) }
                  : s
              ),
            }
          : a
      ),
    })),

  addConfigEntry: (automationId, sectionId, entry) =>
    set((state) => ({
      automations: state.automations.map((a) =>
        a.id === automationId
          ? {
              ...a,
              lastModified: new Date().toISOString(),
              config: a.config.map((s) =>
                s.id === sectionId
                  ? { ...s, entries: [...s.entries, { ...entry, id: genId('ce') }] }
                  : s
              ),
            }
          : a
      ),
    })),

  removeConfigEntry: (automationId, sectionId, entryId) =>
    set((state) => ({
      automations: state.automations.map((a) =>
        a.id === automationId
          ? {
              ...a,
              lastModified: new Date().toISOString(),
              config: a.config.map((s) =>
                s.id === sectionId
                  ? { ...s, entries: s.entries.filter((e) => e.id !== entryId) }
                  : s
              ),
            }
          : a
      ),
    })),

  addConfigSection: (automationId, section) =>
    set((state) => ({
      automations: state.automations.map((a) =>
        a.id === automationId
          ? {
              ...a,
              lastModified: new Date().toISOString(),
              config: [...a.config, { ...section, id: genId('cs') }],
            }
          : a
      ),
    })),

  removeConfigSection: (automationId, sectionId) =>
    set((state) => ({
      automations: state.automations.map((a) =>
        a.id === automationId
          ? {
              ...a,
              lastModified: new Date().toISOString(),
              config: a.config.filter((s) => s.id !== sectionId),
            }
          : a
      ),
    })),
}));
