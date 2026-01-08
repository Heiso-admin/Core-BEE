import { Suspense } from "react";
// import { UsageYearTable } from './_components/usage-year-table';
// import { TableSkeleton } from './_components/loading-skeleton';
// import { getYearlyTokenUsage } from './actions/billing';

export default function UsageManagement() {
  // const tokenUsage = use(getYearlyTokenUsage());
  // const data = use(getTokenUsageReport());
  // console.log('data: ', data);

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-3xl font-extrabold">
          {new Date().getFullYear()}{" "}
          <span className="text-lg text-muted-foreground">Tokens Usage</span>
        </h2>
        <div className="text-sm space-y-2 rounded-md border border-muted-foreground px-4 py-2">
          <div className="space-x-2">
            <label className="text-xs">Prepaid Balance: </label>
            <span>
              $ <strong>0</strong>
            </span>
          </div>
        </div>
      </div>
      {/* <Suspense fallback={<TableSkeleton />}> */}
      <Suspense>{/* <UsageYearTable data={tokenUsage} /> */}</Suspense>
    </div>
  );
}
