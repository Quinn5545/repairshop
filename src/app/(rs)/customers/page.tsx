import CustomerSearch from "@/app/(rs)/customers/CustomerSearch";
import { getCustomerSearchResults } from "@/lib/queries/getCustomerSearchResults";
import * as Sentry from "@sentry/nextjs";
import CustomerTable from "./CustomerTable";

export const metadata = {
  title: "Customer Search",
};

export default async function Customers({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { searchText } = await searchParams;

  if (!searchText) return <CustomerSearch />;

  const span = Sentry.startInactiveSpan({
    name: "getCustomerSearchResults-2",
  });

  // query db
  const results = await getCustomerSearchResults(searchText);
  span.end();

  // return results
  return (
    <>
      <CustomerSearch />
      {results.length ? (
        <CustomerTable data={results} />
      ) : (
        <p className="mt-4">No Results Found</p>
      )}
    </>
  );
}
