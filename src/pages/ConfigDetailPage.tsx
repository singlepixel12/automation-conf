import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAutomationStore } from '@/stores/automationStore';
import { ConfigEditor } from '@/components/config-editor/ConfigEditor';
import { MetaItem, EditableSelectCard, EditableTextCard, ApiEndpointBar } from '@/components/config-detail/DetailCards';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Calendar, User, Tag, Globe, GitBranch, X, Plus, Copy, Check, Trash2, Files } from 'lucide-react';
import { TYPE_LABELS, STATUS_COLORS } from '@/types/automation';
import type { AutomationType, AutomationStatus, Environment } from '@/types/automation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/useToast';
import { motion } from 'framer-motion';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export function ConfigDetailPage() {
  const { id } = useParams<{ id: string }>();
  const automation = useAutomationStore((s) => s.automations.find((a) => a.id === id));
  const updateAutomation = useAutomationStore((s) => s.updateAutomation);
  const deleteAutomation = useAutomationStore((s) => s.deleteAutomation);
  const duplicateAutomation = useAutomationStore((s) => s.duplicateAutomation);
  const navigate = useNavigate();

  const [tagInput, setTagInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');

  if (!automation) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-lg text-muted-foreground">Automation not found.</p>
        <Button variant="outline" asChild>
          <Link to="/automations">Back to Automations</Link>
        </Button>
      </div>
    );
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !automation.tags.includes(tag)) {
      updateAutomation(automation.id, { tags: [...automation.tags, tag] });
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    updateAutomation(automation.id, { tags: automation.tags.filter((t) => t !== tag) });
  };

  const jsonOutput = JSON.stringify(automation, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    deleteAutomation(automation.id);
    navigate('/automations');
    toast('Automation deleted');
  };

  const handleDuplicate = () => {
    const newId = duplicateAutomation(automation.id);
    if (newId) {
      navigate(`/automations/${newId}`);
      toast('Automation duplicated');
    }
  };

  const handleNameDoubleClick = () => {
    setNameValue(automation.name);
    setEditingName(true);
  };

  const handleNameSave = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== automation.name) {
      updateAutomation(automation.id, { name: trimmed });
    }
    setEditingName(false);
  };

  return (
    <motion.div
      className="space-y-6"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUp} className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/automations">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {editingName ? (
              <Input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameSave();
                  if (e.key === 'Escape') setEditingName(false);
                }}
                className="text-2xl font-bold tracking-tight h-auto py-0 px-1 border-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
            ) : (
              <h2
                className="text-2xl font-bold tracking-tight cursor-pointer hover:text-muted-foreground/80 transition-colors"
                onDoubleClick={handleNameDoubleClick}
                title="Double-click to rename"
              >
                {automation.name}
              </h2>
            )}
            <Select
              value={automation.status}
              onValueChange={(v) => updateAutomation(automation.id, { status: v as AutomationStatus })}
            >
              <SelectTrigger className="w-auto h-7 border-0 p-0 focus:ring-0 focus:ring-offset-0">
                <Badge className={cn('border-0 cursor-pointer', STATUS_COLORS[automation.status])}>
                  {automation.status}
                </Badge>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-muted-foreground mt-1">{automation.description}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleDuplicate} title="Duplicate automation">
          <Files className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete "{automation.name}"?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this automation and all its configuration. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-4 md:grid-cols-5">
        <EditableSelectCard
          icon={Tag}
          label="Type"
          value={automation.type}
          displayValue={TYPE_LABELS[automation.type]}
          onChange={(v) => updateAutomation(automation.id, { type: v as AutomationType })}
          options={Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <EditableSelectCard
          icon={Globe}
          label="Environment"
          value={automation.environment}
          displayValue={automation.environment}
          onChange={(v) => updateAutomation(automation.id, { environment: v as Environment })}
          options={[
            { value: 'development', label: 'Development' },
            { value: 'staging', label: 'Staging' },
            { value: 'production', label: 'Production' },
          ]}
        />
        <EditableTextCard
          icon={User}
          label="Owner"
          value={automation.owner}
          onChange={(v) => updateAutomation(automation.id, { owner: v })}
        />
        <MetaItem icon={GitBranch} label="Version" value={automation.version} />
        <MetaItem
          icon={Calendar}
          label="Last Modified"
          value={new Date(automation.lastModified).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
        />
      </motion.div>

      <motion.div variants={fadeUp} className="flex items-center gap-2 flex-wrap">
        {automation.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5 cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <div className="flex items-center gap-1">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTag()}
            placeholder="Add tag..."
            className="h-7 w-28 text-xs"
          />
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={addTag}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <ApiEndpointBar
          automationId={automation.id}
          copied={copiedEndpoint}
          onCopy={() => {
            navigator.clipboard.writeText(`https://api.confighub.acmecorp.com/v1/automations/${automation.id}/config`);
            setCopiedEndpoint(true);
            setTimeout(() => setCopiedEndpoint(false), 2000);
          }}
        />
      </motion.div>

      <motion.div variants={fadeUp}>
        <Tabs defaultValue="config">
          <TabsList>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
            <TabsTrigger value="info">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="config" className="mt-4">
            <ConfigEditor automationId={automation.id} config={automation.config} />
          </TabsContent>
          <TabsContent value="json" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base">JSON Output</CardTitle>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </CardHeader>
              <CardContent>
                <pre className="rounded-md bg-muted p-4 overflow-auto max-h-[600px] text-sm font-mono leading-relaxed">
                  {jsonOutput}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="info" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Automation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">ID</span>
                  <span className="font-mono">{automation.id}</span>
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(automation.createdAt).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-muted-foreground">Last Modified</span>
                  <span>{new Date(automation.lastModified).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-muted-foreground">CRON Schedule</span>
                  <span className="font-mono">{automation.cronExpression || '\u2014'}</span>
                  <span className="text-muted-foreground">Config Sections</span>
                  <span>{automation.config.length}</span>
                  <span className="text-muted-foreground">Total Config Entries</span>
                  <span>{automation.config.reduce((sum, s) => sum + s.entries.length, 0)}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
