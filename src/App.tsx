import { Authenticated, Unauthenticated } from "convex/react";
import { SignInForm } from "./SignInForm";
import { Toaster } from "sonner";
import { GroupSelect } from "./GroupSelect";
import { useState } from "react";
import { Id } from "../convex/_generated/dataModel";
import { GroupView } from "./GroupView";
import { Routes, Route, Link, useParams } from "react-router";
import { Navbar } from "./Navbar";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 flex flex-col items-center p-8">
        <div className="w-full max-w-3xl mx-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/groups/:groupId" element={<GroupPage />} />
          </Routes>
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function HomePage() {
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
            onSelectGroup={(groupId) => {
              setSelectedGroupId(groupId);
              if (groupId) {
                window.location.href = `/groups/${groupId}`;
              }
            }}
          />
          {selectedGroupId && <GroupView groupId={selectedGroupId} />}
        </div>
      </Authenticated>
    </div>
  );
}

function GroupPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const group = useQuery(api.groups.getGroup, {
    groupId: groupId as Id<"groups">,
  });

  if (!groupId) {
    return <div>Group not found</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="gap-4">
        <Link to="/" className="text-primary hover:underline">
          ← Back to Home
        </Link>
        <h2 className="text-2xl font-bold">
          {group ? group.name : "Loading group..."}
        </h2>
      </div>

      <GroupView groupId={groupId as Id<"groups">} />
    </div>
  );
}
