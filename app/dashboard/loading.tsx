import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-4 w-[350px]" />
      </div>

      {/* Admin/Staff Dashboard Layout */}
      <div className="hidden md:grid gap-6 grid-cols-2">
        {/* Elections Card */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-[100px]" />
            <Skeleton className="h-4 w-[200px]" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="py-3 border-b last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Skeleton className="h-7 w-16" />
                    <Skeleton className="h-7 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 pt-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>

        {/* User Management Card */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-[150px]" />
              <Skeleton className="h-4 w-[80px]" />
            </div>
            <Skeleton className="h-4 w-[200px]" />
          </CardHeader>
          <CardContent className="pb-2">
            <div>
              <div className="border-b pb-2">
                <div className="grid grid-cols-4 gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                </div>
              </div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="py-3 border-b">
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Skeleton className="h-8 w-full" />
          </CardFooter>
        </Card>
      </div>

      {/* Second row */}
      <div className="hidden md:grid gap-6 grid-cols-2">
        {/* Admin Profile Card */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-[120px]" />
            <Skeleton className="h-4 w-[180px]" />
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center pb-2">
            <Skeleton className="h-24 w-24 rounded-full mb-4" />
            <Skeleton className="h-6 w-40 mb-1" />
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-4 w-24 mb-6" />

            <div className="w-full max-w-xs space-y-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* System Logs Card */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-[100px]" />
              <Skeleton className="h-4 w-[80px]" />
            </div>
            <Skeleton className="h-4 w-[150px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-2 bg-muted/20 rounded-md">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full mt-2" />
                  <Skeleton className="h-3 w-32 mt-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voter Dashboard Layout - Mobile */}
      <div className="md:hidden space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <Skeleton className="h-8 w-8 rounded-full mb-2" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <Skeleton className="h-8 w-8 rounded-full mb-2" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>

        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <Skeleton className="h-5 w-[100px]" />
          </CardHeader>
          <CardContent className="px-4 py-2">
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
          <CardFooter className="px-4 py-3 border-t">
            <Skeleton className="h-8 w-full" />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
