"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ElectionsList from "@/components/elections-list"
import { motion } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function ElectionsTabs() {
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Tabs defaultValue="all" className="w-full">
        <TabsList className={`grid grid-cols-4 ${isMobile ? "w-full" : "max-w-md"}`}>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <ElectionsList filter="all" />
        </TabsContent>
        <TabsContent value="active">
          <ElectionsList filter="active" />
        </TabsContent>
        <TabsContent value="upcoming">
          <ElectionsList filter="upcoming" />
        </TabsContent>
        <TabsContent value="completed">
          <ElectionsList filter="completed" />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
