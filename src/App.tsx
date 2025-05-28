import { Authenticated, Unauthenticated } from "convex/react";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { GroupSelect } from "./GroupSelect";
import { useState } from "react";
import { Id } from "../convex/_generated/dataModel";
import { GroupView } from "./GroupView";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-primary">Watch Party</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 flex flex-col items-center p-8">
        <div className="w-full max-w-3xl mx-auto">
          <Content />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const [selectedGroupId, setSelectedGroupId] = useState<Id<"groups"> | null>(
    null,
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">Watch Party</h1>
        <Authenticated>
          <p className="text-xl text-secondary">Plan your next watch party!</p>
        </Authenticated>
        <Unauthenticated>
          <p className="text-xl text-secondary">Sign in to get started</p>
        </Unauthenticated>
      </div>

      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>

      <Authenticated>
        <div className="flex flex-col gap-8">
          <GroupSelect
            selectedGroupId={selectedGroupId}
            onSelectGroup={setSelectedGroupId}
          />
          {selectedGroupId && <GroupView groupId={selectedGroupId} />}
        </div>
      </Authenticated>
    </div>
  );
}
