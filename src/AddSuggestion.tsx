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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await suggest({ 
        groupId,
        title, 
        type, 
        description: description || undefined 
      });
      setTitle("");
      setType("movie");
      setDescription("");
      toast.success("Added suggestion!");
    } catch (error) {
      toast.error("Failed to add suggestion");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Suggest Something to Watch</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "movie" | "tv")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          >
            <option value="movie">Movie</option>
            <option value="tv">TV Show</option>
          </select>
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
