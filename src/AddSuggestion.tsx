import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../convex/_generated/dataModel";

export function AddSuggestion({ groupId }: { groupId: Id<"groups"> }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"movie" | "tv">("movie");
  const [description, setDescription] = useState("");

  const suggest = useMutation(api.suggestions.suggest);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    suggest({
      groupId,
      title,
      type,
      description: description || undefined,
    })
      .then(() => {
        setTitle("");
        setType("movie");
        setDescription("");
        toast.success("Added suggestion!");
      })
      .catch(() => {
        toast.error("Failed to add suggestion");
      });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Suggest Something to Watch</h2>
      <div className="space-y-4">
        <div className="flex content-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>

          <div className="basis-auto flex-shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="flex rounded-md shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setType("movie")}
                className={`flex-1 py-2 px-4 font-medium text-sm basis-auto ${
                  type === "movie"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Movie
              </button>
              <button
                type="button"
                onClick={() => setType("tv")}
                className={`flex-1 py-2 px-4 font-medium text-sm basis-auto ${
                  type === "tv"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                TV Show
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={!title}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Add Suggestion
        </button>
      </div>
    </form>
  );
}
