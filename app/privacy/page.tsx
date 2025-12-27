import { PolicyContainer } from "@/app/components/policy-container";

const privacyContent = `This is a local-first scratchpad. Your notes are stored in your browser's localStorage.

We do not collect, transmit, or store any of your content on our servers.

No analytics. No tracking. No cookies beyond what's necessary for the app to function.

Your data stays on your device.`;

export default function PrivacyPage() {
  return <PolicyContainer title="Privacy" initialContent={privacyContent} />;
}

