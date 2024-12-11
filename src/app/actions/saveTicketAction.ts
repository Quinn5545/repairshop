"use server";

import { db } from "@/db";
import { tickets } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";
import {
  insertTicketSchema,
  type insertTicketSchemaType,
} from "@/zod-schemas/ticket";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { eq } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { redirect } from "next/navigation";

export const saveTicketAction = actionClient
  .metadata({ actionName: "saveTicketAction" })
  .schema(insertTicketSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({
      parsedInput: ticket,
    }: {
      parsedInput: insertTicketSchemaType;
    }) => {
      const { isAuthenticated } = getKindeServerSession();
      const isAuth = await isAuthenticated;

      if (!isAuth) redirect("/login");

      // New Ticket
      if (ticket.id === "(New)") {
        const result = await db
          .insert(tickets)
          .values({
            customerID: ticket.customerID,
            title: ticket.title,
            description: ticket.description,
            tech: ticket.tech,
          })
          .returning({ insertedID: tickets.id });

        return {
          message: `Ticket ID #${result[0].insertedID} created successfully`,
        };
      }

      // Updating Ticket
      const result = await db
        .update(tickets)
        .set({
          customerID: ticket.customerID,
          title: ticket.title,
          description: ticket.description,
          completed: ticket.completed,
          tech: ticket.tech,
        })
        .where(eq(tickets.id, ticket.id!))
        .returning({ updatedID: tickets.id });

      return {
        message: `Ticket ID #${result[0].updatedID} updated successfully`,
      };
    }
  );
