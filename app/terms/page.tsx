import { PolicyContainer } from "@/app/components/policy-container";

const termsContent = `Pad is provided as-is. No warranties, no guarantees.

Use it for notes, drafts, quick thoughts. Don't rely on it for anything critical.

Data is stored locally in your browser. Clearing your browser data will erase your notes.

That's it.`;

export default function TermsPage() {
  return <PolicyContainer title="Terms" initialContent={termsContent} />;
}

