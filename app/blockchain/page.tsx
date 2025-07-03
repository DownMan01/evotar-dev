import { redirect } from "next/navigation"
import { getSession, getBlockchain } from "@/actions/auth"
import DashboardHeader from "@/components/dashboard-header"

// Add this line to force dynamic rendering
export const dynamic = "force-dynamic"

export default async function BlockchainPage() {
  const session = await getSession()

  if (!session?.isLoggedIn) {
    redirect("/")
  }

  const blocks = await getBlockchain()

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader user={session} />

      <main className="flex-1 container mx-auto px-4 py-8 pb-24 md:pb-8">
        <h1 className="text-3xl font-bold mb-8">Blockchain Explorer</h1>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Blocks</h2>
            <p className="text-gray-500 mt-1">Explore the blockchain to verify the integrity of all votes.</p>
          </div>

          <div className="divide-y">
            {blocks.map((block: any) => (
              <div key={block.index} className="p-6 hover:bg-gray-50">
                <div className="flex flex-wrap justify-between mb-2">
                  <h3 className="font-medium">Block #{block.index}</h3>
                  <span className="text-sm text-gray-500">{new Date(block.timestamp).toLocaleString()}</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Hash: </span>
                    <span className="font-mono text-gray-600 break-all">{block.hash}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Previous Hash: </span>
                    <span className="font-mono text-gray-600 break-all">{block.previousHash}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Transactions: </span>
                    <span className="text-gray-600">{block.transactions.length}</span>
                  </div>
                </div>

                {block.transactions.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">Transactions</h4>
                    <div className="space-y-2">
                      {block.transactions.map((tx: any, i: number) => (
                        <div key={i} className="bg-gray-50 p-3 rounded-md text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">Voter ID:</span>
                            <span className="font-mono">***{tx.voter.slice(-4)}</span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="font-medium">Candidate ID:</span>
                            <span className="font-mono">{tx.candidate}</span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="font-medium">Timestamp:</span>
                            <span>{new Date(tx.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {blocks.length === 0 && (
              <div className="p-6 text-center text-gray-500">No blocks found in the blockchain.</div>
            )}
          </div>
        </div>
      </main>

      <footer className="py-6 bg-gray-100 hidden md:block">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>Evotar - Blockchain Voting Platform © {new Date().getFullYear()}</p>
          <p className="mt-1">Secure, Transparent, Immutable</p>
        </div>
      </footer>
    </div>
  )
}
