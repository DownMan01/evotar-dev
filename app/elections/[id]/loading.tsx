import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function ElectionDetailLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-5 w-[500px]" />
      </div>

      <Card>
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-[200px]" />

            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-md">
                  <div className="flex items-start">
                    <Skeleton className="h-5 w-5 rounded-full mr-3" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-5 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Skeleton className="h-4 w-[300px]" />
            <Skeleton className="h-10 w-[120px]" />
          </div>
        </div>
      </Card>
    </div>
  )
}
