import EditorShell from '@/components/editor/editor-shell';
import { getEditDocs } from '@/lib/edit-source';

export const dynamic = 'force-static';

export default async function EditPage() {
  const initialDocs = await getEditDocs();

  return <EditorShell initialDocs={initialDocs} />;
}
