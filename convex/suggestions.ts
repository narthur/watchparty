import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const suggest = mutation({
  args: {
    groupId: v.id("groups"),
    title: v.string(),
    type: v.union(v.literal("movie"), v.literal("tv")),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user is member of group
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_user_and_group", q => 
        q.eq("userId", userId).eq("groupId", args.groupId)
      )
      .unique();

    if (!membership) {
      throw new Error("Not a member of this group");
    }
    
    return await ctx.db.insert("suggestions", {
      ...args,
      suggestedBy: userId,
    });
  },
});

export const vote = mutation({
  args: {
    suggestionId: v.id("suggestions"),
    vote: v.union(v.literal("want"), v.literal("fine"), v.literal("dont_want")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user is member of the group
    const suggestion = await ctx.db.get(args.suggestionId);
    if (!suggestion) throw new Error("Suggestion not found");

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_user_and_group", q => 
        q.eq("userId", userId).eq("groupId", suggestion.groupId)
      )
      .unique();

    if (!membership) {
      throw new Error("Not a member of this group");
    }

    const existing = await ctx.db
      .query("votes")
      .withIndex("by_user_and_suggestion", q => 
        q.eq("userId", userId).eq("suggestionId", args.suggestionId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { vote: args.vote });
    } else {
      await ctx.db.insert("votes", {
        suggestionId: args.suggestionId,
        userId,
        vote: args.vote,
      });
    }
  },
});

export const list = query({
  args: {
    groupId: v.id("groups"),
    selectedUserIds: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user is member of group
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_user_and_group", q => 
        q.eq("userId", userId).eq("groupId", args.groupId)
      )
      .unique();

    if (!membership) {
      throw new Error("Not a member of this group");
    }

    const suggestions = await ctx.db
      .query("suggestions")
      .withIndex("by_group", q => q.eq("groupId", args.groupId))
      .collect();

    const results = await Promise.all(
      suggestions.map(async (suggestion) => {
        const votes = await ctx.db
          .query("votes")
          .withIndex("by_suggestion", q => q.eq("suggestionId", suggestion._id))
          .collect();

        const myVote = votes.find(v => v.userId === userId)?.vote;
        
        const selectedUserIds = args.selectedUserIds ?? [];
        const relevantVotes = selectedUserIds.length > 0
          ? votes.filter(v => selectedUserIds.includes(v.userId))
          : votes;

        const voteCount = {
          want: relevantVotes.filter(v => v.vote === "want").length,
          fine: relevantVotes.filter(v => v.vote === "fine").length,
          dont_want: relevantVotes.filter(v => v.vote === "dont_want").length,
        };

        const voters = await Promise.all(
          votes.map(async (vote) => {
            const user = await ctx.db.get(vote.userId);
            return {
              userId: vote.userId,
              name: user?.name || user?.email || "Anonymous User",
              vote: vote.vote,
            };
          })
        );

        return {
          ...suggestion,
          myVote,
          voteCount,
          voters,
        };
      })
    );

    return results.sort((a, b) => {
      if (a.voteCount.dont_want !== b.voteCount.dont_want) {
        return a.voteCount.dont_want - b.voteCount.dont_want;
      }
      return b.voteCount.want - a.voteCount.want;
    });
  },
});

export const listGroupMembers = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user is member of group
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_user_and_group", q => 
        q.eq("userId", userId).eq("groupId", args.groupId)
      )
      .unique();

    if (!membership) {
      throw new Error("Not a member of this group");
    }

    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", q => q.eq("groupId", args.groupId))
      .collect();

    return Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return {
          _id: member.userId,
          name: user?.name || user?.email || "Anonymous User",
          role: member.role,
        };
      })
    );
  },
});
