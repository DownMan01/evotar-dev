import { PageHeader } from "@/components/page-header"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="Create Election" description="Create a new election" />

      <div className="mt-8">
        <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-6" />

          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="mt-6">
            <Skeleton className="h-10 w-1/4" />
          </div>
        </div>
      </div>
    </div>
  )
}
