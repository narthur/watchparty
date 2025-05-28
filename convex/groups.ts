import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      createdBy: userId,
    });

    // Add creator as admin
    await ctx.db.insert("groupMembers", {
      groupId,
      userId,
      role: "admin",
    });

    return groupId;
  },
});

export const invite = mutation({
  args: {
    groupId: v.id("groups"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user is admin
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_user_and_group", (q) =>
        q.eq("userId", userId).eq("groupId", args.groupId),
      )
      .unique();

    if (!membership || membership.role !== "admin") {
      throw new Error("Not authorized");
    }

    // Find user by email
    const invitedUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email.toLowerCase()))
      .unique();

    if (!invitedUser) {
      throw new Error("User not found");
    }

    // Check if already a member
    const existingMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_user_and_group", (q) =>
        q.eq("userId", invitedUser._id).eq("groupId", args.groupId),
      )
      .unique();

    if (existingMembership) {
      throw new Error("User is already a member");
    }

    // Add as member
    await ctx.db.insert("groupMembers", {
      groupId: args.groupId,
      userId: invitedUser._id,
      role: "member",
    });
  },
});

export const listMyGroups = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return await Promise.all(
      memberships.map(async (membership) => {
        const group = await ctx.db.get(membership.groupId);
        if (!group) throw new Error("Group not found");

        const members = await ctx.db
          .query("groupMembers")
          .withIndex("by_group", (q) => q.eq("groupId", group._id))
          .collect();

        const memberDetails = await Promise.all(
          members.map(async (m) => {
            const user = await ctx.db.get(m.userId);
            return {
              userId: m.userId,
              name: user?.name || user?.email,
              role: m.role,
            };
          }),
        );

        return {
          _id: group._id,
          name: group.name,
          role: membership.role,
          members: memberDetails,
        };
      }),
    );
  },
});
