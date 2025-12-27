import { SlateEditor } from "./slate-editor";

export const SlateContainer = () => {
  return (
    <main className="min-h-screen w-full flex justify-center bg-background animate-fade-in">
      <div className="w-full max-w-[760px] px-6 py-16 md:py-24 lg:py-32">
        <SlateEditor />
      </div>
    </main>
  );
};

