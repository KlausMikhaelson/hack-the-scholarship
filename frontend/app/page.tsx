export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to HackTheScholarship
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your full-stack application is ready to go!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h2 className="font-semibold text-blue-900 mb-2">Backend</h2>
              <p className="text-sm text-blue-700">Node.js + Prisma + PostgreSQL</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h2 className="font-semibold text-green-900 mb-2">Frontend</h2>
              <p className="text-sm text-green-700">Next.js + TailwindCSS</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h2 className="font-semibold text-purple-900 mb-2">Extension</h2>
              <p className="text-sm text-purple-700">Browser Extension</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

