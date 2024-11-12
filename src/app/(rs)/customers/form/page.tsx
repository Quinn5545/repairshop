import { BackButton } from "@/components/BackButton";
import { getCustomer } from "@/lib/queries/getCustomer";
import * as Sentry from "@sentry/nextjs";

export default async function CustomerFormPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  try {
    const { customerID } = await searchParams;

    // Edit customer form
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
      console.log(customer);

      // Put customer form component
    } else {
      // New customer form component
    }
  } catch (error) {
    if (error instanceof Error) {
      Sentry.captureException(error);
      throw error;
    }
    // console.error(error);
  }
}
