import Link from 'next/link';
import { FiArrowRight, FiShield, FiZap, FiLayout } from 'react-icons/fi';

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-nunito">
      {/* Navbar */}
      <nav className="border-b border-gray-50 py-6">
        <div className="container mx-auto flex justify-between items-center px-6">
          <div className="flex items-center gap-3">
            <img src="/shoposbd.png" alt="ShopOS BD" className="w-10 h-10 object-contain" />
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">ShopOS BD</h1>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-bold text-gray-500 hover:text-brand transition-colors">Login</Link>
            <Link href="/register" className="bg-brand text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-50 hover:bg-brand-hover transition-all active:scale-95">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="py-24">
        <div className="container mx-auto px-6 text-center">
            <span className="bg-blue-50 text-brand text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-6 inline-block">The ultimate commerce engine</span>
            <h2 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
                Build your store <br/> <span className="text-brand italic underline decoration-blue-100">Better</span> than ever.
            </h2>
            <p className="max-w-2xl mx-auto text-gray-500 text-lg font-medium mb-12">
                Manage your inventory, track sales, and grow your business with the most advanced commerce platform in Bangladesh.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register" className="w-full sm:w-auto bg-brand text-white px-10 py-2.5 rounded-lg text-base font-bold shadow-xl shadow-blue-100 hover:bg-brand-hover transition-all flex items-center justify-center gap-2 group">
                    Start Scanning Now <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/login" className="w-full sm:w-auto bg-white text-gray-800 border-2 border-gray-100 px-10 py-2.5 rounded-lg text-base font-bold hover:bg-gray-50 transition-all">
                    Login to Dashboard
                </Link>
            </div>
        </div>
      </header>

      {/* Features */}
      <section className="py-24 bg-gray-50/50">
        <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-3xl auth-card border border-gray-50">
                    <div className="w-12 h-12 bg-blue-50 text-brand rounded-2xl flex items-center justify-center mb-6">
                        <FiZap size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Lightning Fast</h3>
                    <p className="text-sm text-gray-400 font-medium">Real-time inventory updates and instant sales tracking across all devices.</p>
                </div>
                <div className="bg-white p-8 rounded-3xl auth-card border border-gray-50">
                    <div className="w-12 h-12 bg-blue-50 text-brand rounded-2xl flex items-center justify-center mb-6">
                        <FiShield size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Military-grade Security</h3>
                    <p className="text-sm text-gray-400 font-medium">Your data is encrypted and protected with industry-leading security practices.</p>
                </div>
                <div className="bg-white p-8 rounded-3xl auth-card border border-gray-50">
                    <div className="w-12 h-12 bg-blue-50 text-brand rounded-2xl flex items-center justify-center mb-6">
                        <FiLayout size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Beautiful Interface</h3>
                    <p className="text-sm text-gray-400 font-medium">A premium design system that makes managing your business a joy every day.</p>
                </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-50">
        <div className="container mx-auto px-6 text-center">
            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">© 2026 ShopOS BD. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
