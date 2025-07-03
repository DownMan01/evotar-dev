import { getSession } from "@/actions/auth"
import LoginForm from "@/components/login-form"
import { AuthLayout } from "@/components/layouts/auth-layout"
import { FloatingCheckmarks } from "@/components/floating-checkmarks"
import { ChangingDescription } from "@/components/changing-description"
import { kronaOne } from "@/lib/fonts"

export const dynamic = "force-dynamic"

// Array of changing descriptions
const descriptions = [
  "Secure your voice with immutable blockchain voting that ensures every vote counts.",
  "Transparent, tamper-proof voting powered by blockchain technology.",
  "Your vote matters. Make it count with secure blockchain verification.",
  "Revolutionizing campus elections with cutting-edge blockchain security.",
]

// Create a server component to fetch the session
export default async function HomePage() {
  // Check if user is already logged in
  const session = await getSession()
  const isLoggedIn = session?.isLoggedIn || false

  // We'll let the middleware handle redirects instead of doing it here
  return (
    <AuthLayout>
      {/* Floating checkmark circles */}
      <FloatingCheckmarks />

      {/* Main content */}
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center md:justify-between gap-8 md:gap-16">
        {/* Branding section */}
        <div className="w-full md:w-7/12 flex flex-col items-center md:items-start py-4 md:py-8">
          <div className={`text-white space-y-6 md:space-y-8 max-w-lg w-full mx-auto md:mx-0 ${kronaOne.className}`}>
            <div className="relative">
              <div className="absolute -top-6 -left-6 md:-top-8 md:-left-8 w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 blur-xl"></div>
              <h1 className="text-6xl md:text-7xl tracking-tight relative z-10 text-center md:text-left">evotar</h1>
              <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 w-16 h-16 md:w-24 md:h-24 rounded-full bg-white/10 blur-lg"></div>
            </div>

            <div className="relative">
              <ChangingDescription descriptions={descriptions} />
            </div>
          </div>
        </div>

        {/* Login form */}
        <div className="w-full md:w-5/12 flex justify-center md:block">
          <LoginForm isLoggedIn={isLoggedIn} />
        </div>
      </div>
    </AuthLayout>
  )
}
