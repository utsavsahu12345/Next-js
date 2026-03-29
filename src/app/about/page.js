import Navbar from "../components/Navbar";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar ko yahan bhi show karenge bina button ke logic ke */}
      <Navbar /> 
      
      <main className="p-12 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About This Project</h1>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <p className="text-gray-600 leading-relaxed mb-4">
            Yeh project Google Sheets API aur Next.js ka use karke banaya gaya hai. 
            Isme hum real-time mein data read, write, update aur delete kar sakte hain.
          </p>
          <ul className="list-disc ml-5 text-gray-600 space-y-2">
            <li>Next.js 14 (App Router)</li>
            <li>Tailwind CSS for Styling</li>
            <li>Google Sheets API v4</li>
            <li>Service Account Authentication</li>
          </ul>
        </div>
      </main>
    </div>
  );
}