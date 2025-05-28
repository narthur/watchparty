import { Authenticated, Unauthenticated } from "convex/react";
import { SignInForm } from "./SignInForm";
import { Toaster } from "sonner";
import { GroupSelect } from "./GroupSelect";
import { useState } from "react";
import { Id } from "../convex/_generated/dataModel";
import { GroupView } from "./GroupView";
import { Routes, Route, Link, useParams } from "react-router";
import { Navbar } from "./Navbar";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

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
  const inviteToGroup = useMutation(api.groups.invite);
  
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  if (!groupId) {
    return <div>Group not found</div>;
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inviteToGroup({ 
        groupId: groupId as Id<"groups">, 
        email: inviteEmail 
      });
      setInviteEmail("");
      setShowInvite(false);
      toast.success("Invitation sent!");
    } catch (error) {
      toast.error("Failed to invite user");
    }
  };

  const isAdmin = group?.role === "admin";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <Link to="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
          <h2 className="text-2xl font-bold mt-2">
            {group ? group.name : "Loading group..."}
          </h2>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowInvite(true)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover"
          >
            Invite Member
          </button>
        )}
      </div>

      <GroupView groupId={groupId as Id<"groups">} />

      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleInvite} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Invite to {group?.name}</h3>
            <div className="space-y-4">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Email address"
                className="w-full px-3 py-2 border rounded-md"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!inviteEmail}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-50"
                >
                  Send Invite
                </button>
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
