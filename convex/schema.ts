import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  groups: defineTable({
    name: v.string(),
    createdBy: v.id("users"),
  }).index("by_createdBy", ["createdBy"]),

  groupMembers: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("member")),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_user_and_group", ["userId", "groupId"]),

  suggestions: defineTable({
    title: v.string(),
    type: v.union(v.literal("movie"), v.literal("tv")),
    suggestedBy: v.id("users"),
    groupId: v.id("groups"),
    description: v.optional(v.string()),
  })
    .index("by_group", ["groupId"])
    .index("by_suggestedBy", ["suggestedBy"]),

  votes: defineTable({
    suggestionId: v.id("suggestions"),
    userId: v.id("users"),
    vote: v.union(
      v.literal("want"),
      v.literal("fine"),
      v.literal("dont_want")
    ),
  })
    .index("by_suggestion", ["suggestionId"])
    .index("by_user_and_suggestion", ["userId", "suggestionId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
