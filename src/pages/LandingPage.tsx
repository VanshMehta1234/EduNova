import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

const heroImage = '/hero_right.JPEG';

export const LandingPage = () => {
  const { isAuthenticated, isInitializing } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !isInitializing) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-300 border-t-blue-600 mx-auto mb-4" />
          <div className="text-slate-600 font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-white antialiased -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Hero */}
      <section className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        {/* background blobs (smaller + softer) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-12 -left-24 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />
          <div className="absolute top-24 -right-24 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-200/15 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-64px)] flex items-center relative z-10">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center w-full">
              {/* Left */}
              <div className="lg:col-span-7 text-center lg:text-left">
                <div className="inline-flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm border border-blue-100/80 rounded-full text-blue-700 text-sm font-semibold shadow-sm">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Powered by Advanced AI
                </div>

                <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.03] tracking-tight">
                  Create Exceptional{' '}
                  <span className="block mt-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Lesson Plans
                  </span>
                  <span className="block mt-3 text-slate-700 font-extrabold">
                    in Minutes
                  </span>
                </h1>

                <p className="mt-5 text-lg sm:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Generate engaging lesson plans with AI and curated resources—tailored to your students.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Link
                    to="/register"
                    className="group inline-flex items-center justify-center px-7 py-3.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white text-base font-semibold rounded-xl shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/35 transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    Start Creating Free
                    <svg
                      className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>

                  <Link
                    to="/explore"
                    className="inline-flex items-center justify-center px-7 py-3.5 bg-white text-slate-700 text-base font-semibold rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    Explore Lessons
                  </Link>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-sm text-slate-600">
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                    Free forever
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                    No credit card
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                    2-min setup
                  </div>
                </div>

                {/* Stats (more “designed”, less plain) */}
                <div className="mt-8 grid grid-cols-3 gap-3 max-w-xl mx-auto lg:mx-0">
                  {[
                    { value: '1K+', label: 'Lessons' },
                    { value: '500+', label: 'Teachers' },
                    { value: '50+', label: 'Subjects' },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/70 shadow-sm p-4 text-center lg:text-left"
                    >
                      <div className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-none">
                        {s.value}
                      </div>
                      <div className="mt-1 text-xs text-slate-600 font-medium">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right */}
              <div className="lg:col-span-5 hidden lg:block">
                <div className="relative">
                  {/* soft glow behind */}
                  <div className="absolute -inset-6 bg-gradient-to-r from-blue-600/15 via-indigo-600/15 to-purple-600/15 rounded-3xl blur-2xl opacity-70" />

                  <div className="relative rounded-3xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-2xl shadow-blue-500/10 overflow-hidden">
                    {/* IMPORTANT: remove extra “frame within frame” feel */}
                    <img
                      src={heroImage}
                      alt="EduNova - AI-powered lesson planning"
                      className="w-full h-auto object-contain"
                      loading="eager"
                    />
                  </div>

                  {/* minimal floating accents */}
                  <div className="absolute -top-5 -right-5 w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400/90 to-indigo-500/90 shadow-xl shadow-blue-500/20 rotate-12" />
                  <div className="absolute -bottom-5 -left-5 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400/90 to-pink-500/90 shadow-xl shadow-purple-500/20 -rotate-12" />
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* Features section can be added here if needed */}
    </div>
  );
};
