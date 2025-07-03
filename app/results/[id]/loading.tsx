import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ResultDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-9 w-[120px]" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-[250px]" />
                  <Skeleton className="h-4 w-[350px]" />
                </div>
                <Skeleton className="h-6 w-[100px]" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="h-10 w-10 rounded-full mr-3" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-[80px]" />
                      <Skeleton className="h-5 w-[100px]" />
                    </div>
                  </div>
                ))}
              </div>

              <Skeleton className="h-px w-full" />

              <div className="space-y-4">
                <Skeleton className="h-6 w-[100px]" />

                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <Skeleton className="h-5 w-[180px]" />
                          {i === 0 && <Skeleton className="h-5 w-[80px] ml-2" />}
                        </div>
                        <Skeleton className="h-5 w-[100px]" />
                      </div>
                      <Skeleton className="h-2.5 w-full rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-4 w-[350px]" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg border">
                <div className="space-y-3">
                  <div>
                    <Skeleton className="h-4 w-[100px] mb-1" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-[150px] mb-1" />
                    <Skeleton className="h-4 w-[120px]" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Skeleton className="h-9 w-[200px]" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <Skeleton className="h-6 w-[120px]" />
              <Skeleton className="h-4 w-[200px]" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <Skeleton className="h-[250px] w-[250px] rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
