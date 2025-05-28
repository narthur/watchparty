import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { toast } from "sonner";

export function GroupSelect({
  selectedGroupId,
  onSelectGroup,
}: {
  selectedGroupId: Id<"groups"> | null;
  onSelectGroup: (groupId: Id<"groups"> | null) => void;
}) {
  const groups = useQuery(api.groups.listMyGroups);
  const createGroup = useMutation(api.groups.create);
  const inviteToGroup = useMutation(api.groups.invite);
  
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  if (!groups) return null;

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const groupId = await createGroup({ name: newGroupName });
      setNewGroupName("");
      setShowNewGroup(false);
      onSelectGroup(groupId);
      toast.success("Group created!");
    } catch (error) {
      toast.error("Failed to create group");
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId) return;
    
    try {
      await inviteToGroup({ 
        groupId: selectedGroupId, 
        email: inviteEmail 
      });
      setInviteEmail("");
      setShowInvite(false);
      toast.success("Invitation sent!");
    } catch (error) {
      toast.error("Failed to invite user");
    }
  };

  const selectedGroup = groups.find(g => g._id === selectedGroupId);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Your Groups</h2>
          {selectedGroup && (
            <p className="text-gray-600">
              Currently viewing: {selectedGroup.name}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowNewGroup(true)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover"
        >
          New Group
        </button>
      </div>

      {showNewGroup && (
        <form onSubmit={handleCreateGroup} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Group name"
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <button
              type="submit"
              disabled={!newGroupName}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-50"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowNewGroup(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {groups.map((group) => (
          <div
            key={group._id}
            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
              selectedGroupId === group._id
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-primary/50"
            }`}
            onClick={() => onSelectGroup(group._id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{group.name}</h3>
                <p className="text-sm text-gray-500">
                  {group.members.length} member{group.members.length !== 1 ? "s" : ""}
                </p>
              </div>
              {selectedGroupId === group._id && group.role === "admin" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInvite(true);
                  }}
                  className="text-sm text-primary hover:text-primary-hover"
                >
                  Invite
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showInvite && selectedGroupId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <form onSubmit={handleInvite} className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-medium mb-4">Invite to Group</h3>
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
