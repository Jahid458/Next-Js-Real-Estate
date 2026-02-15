import { Webhook } from "svix";
import { headers } from "next/headers";
import { createOrUpdateUser, deleteUser } from "@/lib/actions/user";
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(req) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error("Please add SIGNING_SECRET in .env.local");
  }

  const wh = new Webhook(SIGNING_SECRET);

  // Get Svix headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing Svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });

    console.log("Webhook verified:", evt.type);
  } catch (err) {
    console.error("Err: Could not verify webhook", err);
    return new Response("Verification failed", { status: 400 });
  }

  const { id } = evt?.data;
  const eventType = evt?.type;

  try {
    // CREATE / UPDATE
    if (eventType === "user.created" || eventType === "user.updated") {
      const { firstName, lastName, profileImageUrl, emailAddresses } =
        evt?.data;

      const user = await createOrUpdateUser(
        id,
        firstName,
        lastName,
        profileImageUrl,
        emailAddresses,
      );

      // Save MongoDB _id to Clerk metadata (optional)
      if (user && eventType === "user.created") {
        try {
          await clerkClient.users.updateUserMetadata(id, {
            publicMetadata: {
              userMongoId: user._id.toString(),
            },
          });
        } catch (err) {
          console.error("Error: Couldn't update create or update user", err);
          return new Response("Error: Could not update user", {
            status: 400,
          });
        }
      }
    }

    // DELETE
    if (eventType === "user.deleted") {
      await deleteUser(id);
    }
  } catch (err) {
    console.error("Error handling webhook:", err);
    return new Response("Error: Could not delete User", {
      status: 400,
    });
  }

  return new Response("Webhook recived", { status: 200 });
}
