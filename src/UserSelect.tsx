import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

export function UserSelect({
  groupId,
  selectedUsers,
  onChange,
}: {
  groupId: Id<"groups">;
  selectedUsers: Id<"users">[];
  onChange: (users: Id<"users">[]) => void;
}) {
  const members = useQuery(api.suggestions.listGroupMembers, { groupId });

  if (!members) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Who's Watching?</h2>
      <div className="flex flex-wrap gap-2">
        {members.map((member) => (
          <button
            key={member._id}
            onClick={() => {
              if (selectedUsers.includes(member._id)) {
                onChange(selectedUsers.filter(id => id !== member._id));
              } else {
                onChange([...selectedUsers, member._id]);
              }
            }}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedUsers.includes(member._id)
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            {member.name}
          </button>
        ))}
      </div>
      {selectedUsers.length > 0 && (
        <button
          onClick={() => onChange([])}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700"
        >
          Clear selection
        </button>
      )}
    </div>
  );
}
