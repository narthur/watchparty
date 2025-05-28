import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../convex/_generated/dataModel";

export function SuggestionList({
  groupId,
  selectedUsers,
}: {
  groupId: Id<"groups">;
  selectedUsers: Id<"users">[];
}) {
  const suggestions = useQuery(api.suggestions.list, { 
    groupId,
    selectedUserIds: selectedUsers.length > 0 ? selectedUsers : undefined 
  });
  const vote = useMutation(api.suggestions.vote);

  if (!suggestions) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleVote = async (suggestionId: Id<"suggestions">, voteType: "want" | "fine" | "dont_want") => {
    try {
      await vote({ suggestionId, vote: voteType });
      toast.success("Vote recorded!");
    } catch (error) {
      toast.error("Failed to record vote");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Suggestions</h2>
      {suggestions.length === 0 ? (
        <p className="text-gray-500">No suggestions yet. Add one above!</p>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion._id}
              className="bg-white p-6 rounded-lg shadow"
            >
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">{suggestion.title}</h3>
                    <p className="text-sm text-gray-500">
                      {suggestion.type === "movie" ? "Movie" : "TV Show"}
                    </p>
                    {suggestion.description && (
                      <p className="mt-2 text-gray-700">{suggestion.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <VoteButton
                      active={suggestion.myVote === "want"}
                      onClick={() => handleVote(suggestion._id, "want")}
                      color="green"
                      count={suggestion.voteCount.want}
                    >
                      Want to watch
                    </VoteButton>
                    <VoteButton
                      active={suggestion.myVote === "fine"}
                      onClick={() => handleVote(suggestion._id, "fine")}
                      color="gray"
                      count={suggestion.voteCount.fine}
                    >
                      Fine with it
                    </VoteButton>
                    <VoteButton
                      active={suggestion.myVote === "dont_want"}
                      onClick={() => handleVote(suggestion._id, "dont_want")}
                      color="red"
                      count={suggestion.voteCount.dont_want}
                    >
                      Rather not
                    </VoteButton>
                  </div>
                </div>
                
                <div className="text-sm">
                  <h4 className="font-medium mb-2">Votes:</h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestion.voters.map((voter) => (
                      <span
                        key={voter.userId}
                        className={`px-2 py-1 rounded-full ${
                          selectedUsers.length > 0 && !selectedUsers.includes(voter.userId)
                            ? "opacity-25"
                            : ""
                        } ${
                          voter.vote === "want"
                            ? "bg-green-100 text-green-800"
                            : voter.vote === "fine"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {voter.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VoteButton({
  active,
  onClick,
  children,
  color,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color: "green" | "gray" | "red";
  count: number;
}) {
  const colors = {
    green: "bg-green-100 text-green-800 hover:bg-green-200",
    gray: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    red: "bg-red-100 text-red-800 hover:bg-red-200",
  };
  
  const activeColors = {
    green: "bg-green-500 text-white hover:bg-green-600",
    gray: "bg-gray-500 text-white hover:bg-gray-600",
    red: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
        active ? activeColors[color] : colors[color]
      }`}
    >
      {children} ({count})
    </button>
  );
}
