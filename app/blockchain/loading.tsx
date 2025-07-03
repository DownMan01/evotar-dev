import { Skeleton } from "@/components/ui/skeleton"

export default function BlockchainLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-[250px]" />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <Skeleton className="h-6 w-[150px] mb-2" />
          <Skeleton className="h-4 w-[350px]" />
        </div>

        <div className="divide-y">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-6">
              <div className="flex flex-wrap justify-between mb-4">
                <Skeleton className="h-5 w-[100px]" />
                <Skeleton className="h-5 w-[150px]" />
              </div>

              <div className="space-y-3">
                <div>
                  <Skeleton className="h-4 w-[80px] mb-1" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-[120px] mb-1" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-[100px] mb-1" />
                  <Skeleton className="h-4 w-[60px]" />
                </div>
              </div>

              {i === 0 && (
                <div className="mt-4 pt-4 border-t">
                  <Skeleton className="h-5 w-[120px] mb-3" />
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, j) => (
                      <div key={j} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between mb-2">
                          <Skeleton className="h-4 w-[80px]" />
                          <Skeleton className="h-4 w-[100px]" />
                        </div>
                        <div className="flex justify-between mb-2">
                          <Skeleton className="h-4 w-[100px]" />
                          <Skeleton className="h-4 w-[80px]" />
                        </div>
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-[90px]" />
                          <Skeleton className="h-4 w-[120px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
