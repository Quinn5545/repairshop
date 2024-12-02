import { BackButton } from "@/components/BackButton";
import { getCustomer } from "@/lib/queries/getCustomer";
import { getTicket } from "@/lib/queries/getTicket";
import * as Sentry from "@sentry/nextjs";
import TicketForm from "@/app/(rs)/tickets/form/TicketForm";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Users, init as kindeInit } from "@kinde/management-api-js";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { customerID, ticketID } = await searchParams;

  if (!customerID && !ticketID) {
    return { title: "Missing Ticket ID or Customer ID" };
  }

  if (customerID) {
    return { title: `New Ticket For Customer #${customerID}` };
  }

  if (ticketID) {
    return {
      title: `Edit Ticket #${ticketID}`,
    };
  }
}

export default async function TicketFormPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  try {
    const { customerID, ticketID } = await searchParams;

    if (!customerID && !ticketID) {
      return (
        <>
          <h2 className="text-2xl mb-2">
            Ticket ID or Customer ID required to load ticket form
          </h2>
          <BackButton title="Go Back" variant="default"></BackButton>
        </>
      );
    }

    const { getPermission, getUser } = getKindeServerSession();
    const [managerPermission, user] = await Promise.all([
      getPermission("manager"),
      getUser(),
    ]);
    const isManager = managerPermission?.isGranted;

    // New Ticket Form
    if (customerID) {
      const customer = await getCustomer(parseInt(customerID));

      if (!customer) {
        return (
          <>
            <h2 className="text-2xl mb-2">
              Customer ID #{customerID} not found
            </h2>
            <BackButton title="Go Back" variant="default"></BackButton>
          </>
        );
      }

      if (!customer.active) {
        return (
          <>
            <h2 className="text-2xl mb-2">
              Customer ID #{customerID} is not active
            </h2>
            <BackButton title="Go Back" variant="default"></BackButton>
          </>
        );
      }

      // Return ticket form

      if (isManager) {
        kindeInit(); // initializes the kinde management api
        const { users } = await Users.getUsers();

        const techs = users
          ? users.map((user) => ({ id: user.email!, description: user.email! }))
          : [];

        return <TicketForm customer={customer} techs={techs} />;
      } else {
        return <TicketForm customer={customer} />;
      }
    }

    if (ticketID) {
      const ticket = await getTicket(parseInt(ticketID));

      if (!ticket) {
        return (
          <>
            <h2 className="text-2xl mb-2">Ticket ID #{ticketID} not found</h2>
            <BackButton title="Go Back" variant="default"></BackButton>
          </>
        );
      }

      const customer = await getCustomer(ticket.customerID);

      // Return ticket form

      if (isManager) {
        kindeInit(); // initializes the kinde management api
        const { users } = await Users.getUsers();

        const techs = users
          ? users.map((user) => ({ id: user.email!, description: user.email! }))
          : [];

        return <TicketForm customer={customer} ticket={ticket} techs={techs} />;
      } else {
        const isEditable =
          user.email?.toLowerCase() === ticket.tech.toLowerCase();

        return (
          <TicketForm
            customer={customer}
            ticket={ticket}
            isEditable={isEditable}
          />
        );
      }
    }

    // Put customer form component
  } catch (error) {
    if (error instanceof Error) {
      Sentry.captureException(error);
      throw error;
    }
    // console.error(error);
  }
}
