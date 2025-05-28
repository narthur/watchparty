import { Id } from "../convex/_generated/dataModel";
import { AddSuggestion } from "./AddSuggestion";
import { SuggestionList } from "./SuggestionList";
import { UserSelect } from "./UserSelect";
import { useState } from "react";

export function GroupView({ groupId }: { groupId: Id<"groups"> }) {
  const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);

  return (
    <div className="flex flex-col gap-8">
      <AddSuggestion groupId={groupId} />
      <UserSelect 
        groupId={groupId}
        selectedUsers={selectedUsers} 
        onChange={setSelectedUsers} 
      />
      <SuggestionList 
        groupId={groupId}
        selectedUsers={selectedUsers} 
      />
    </div>
  );
}
