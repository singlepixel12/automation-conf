import { useState } from 'react';
import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfigSectionComponent } from './ConfigSection';
import { AddSectionDialog } from './AddSectionDialog';
import { Plus, Settings2 } from 'lucide-react';
import type { ConfigSection } from '@/types/automation';

interface ConfigEditorProps {
  automationId: string;
  config: ConfigSection[];
}

export function ConfigEditor({ automationId, config }: ConfigEditorProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Configuration Sections</CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Section
        </Button>
      </CardHeader>
      <CardContent>
        {config.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Settings2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No configuration sections yet.</p>
            <p className="text-xs mt-1">Add a section to start configuring this automation.</p>
          </div>
        ) : (
          <Accordion type="multiple" defaultValue={config.map((s) => s.id)}>
            {config.map((section) => (
              <ConfigSectionComponent
                key={section.id}
                automationId={automationId}
                section={section}
              />
            ))}
          </Accordion>
        )}
      </CardContent>
      <AddSectionDialog
        automationId={automationId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Card>
  );
}
