import { BackButton } from "@/components/BackButton";
import { getCustomer } from "@/lib/queries/getCustomer";
import { getTicket } from "@/lib/queries/getTicket";
import * as Sentry from "@sentry/nextjs";
import TicketForm from "@/app/(rs)/tickets/form/TicketForm";

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
      console.log(customer);
      return <TicketForm customer={customer} />;
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
      console.log("ticket------->", ticket);
      console.log("customer------->", customer);
      return <TicketForm customer={customer} ticket={ticket} />;
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
