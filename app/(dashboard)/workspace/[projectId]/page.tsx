import { WorkspaceShell } from '@/components/workspace/workspace-shell';

export default function WorkspacePage({ params }: { params: { projectId: string } }) {
  return <WorkspaceShell projectId={params.projectId} />;
}
