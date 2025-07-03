"use client"
import { motion } from "framer-motion"

interface ResultsChartProps {
  election: any
}

export default function ResultsChart({ election }: ResultsChartProps) {
  const options = election.candidates || election.options || []
  const results = election.results || {}

  // Calculate total votes and percentages
  const totalVotes = Object.values(results).reduce((sum: number, votes: any) => sum + votes, 0)

  const chartData = options
    .map((option: any) => {
      const votes = results[option.id] || 0
      const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0
      const isWinner = option.id === election.winner

      return {
        id: option.id,
        name: option.name,
        votes,
        percentage,
        isWinner,
      }
    })
    .sort((a: any, b: any) => b.votes - a.votes)

  // Colors for the chart
  const getColor = (index: number, isWinner: boolean) => {
    if (isWinner) return "var(--green-500)"

    const colors = ["var(--primary)", "var(--blue-500)", "var(--amber-500)", "var(--purple-500)", "var(--pink-500)"]

    return colors[index % colors.length]
  }

  return (
    <div className="h-full flex flex-col">
      {/* Pie Chart */}
      <div className="relative flex-1 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full max-w-[200px] h-auto">
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--muted)" strokeWidth="20" />

          {chartData.map((item: any, index: number) => {
            // Calculate the stroke dash array and offset for the pie segments
            const circumference = 2 * Math.PI * 40
            const strokeDasharray = (item.percentage / 100) * circumference
            const previousPercentages = chartData
              .slice(0, index)
              .reduce((sum: number, curr: any) => sum + curr.percentage, 0)
            const strokeDashoffset = circumference - (previousPercentages / 100) * circumference

            return (
              <motion.circle
                key={item.id}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={getColor(index, item.isWinner)}
                strokeWidth="20"
                strokeDasharray={`${strokeDasharray} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 50 50)"
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: `${strokeDasharray} ${circumference}` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            )
          })}

          {/* Center circle for donut chart */}
          <circle cx="50" cy="50" r="30" fill="var(--background)" />

          {/* Total votes in center */}
          <text x="50" y="46" textAnchor="middle" fontSize="10" fill="var(--muted-foreground)">
            Total
          </text>
          <text x="50" y="58" textAnchor="middle" fontSize="12" fontWeight="bold" fill="var(--foreground)">
            {totalVotes}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {chartData.map((item: any, index: number) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <span
                className="inline-block w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: getColor(index, item.isWinner) }}
              />
              <span className="truncate max-w-[150px]">{item.name}</span>
            </div>
            <span className="text-muted-foreground">{Math.round(item.percentage)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
