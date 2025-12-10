import { Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { lessonsApi, type LessonResponse } from '../api/lessons';

// Format date as "09 Dec 2025"
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export const Dashboard = () => {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<LessonResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const fetchLessons = async (query = '') => {
    setError(null);
    setLoading(true);
    try {
      const data = await lessonsApi.list(query);
      setLessons(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load lessons';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchLessons(debouncedQuery);
  }, [debouncedQuery]);

  const handleToggleVisibility = async (id: number) => {
    setActionError(null);
    try {
      const updatedLesson = await lessonsApi.toggleVisibility(id);
      setLessons((prev) => prev.map((l) => (l.id === id ? updatedLesson : l)));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update visibility';
      setActionError(message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this lesson? This cannot be undone.')) return;
    setActionError(null);
    try {
      await lessonsApi.delete(id);
      setLessons((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete lesson';
      setActionError(message);
    }
  };

  const handleDownload = async (id: number, topic: string) => {
    setActionError(null);
    try {
      const blob = await lessonsApi.downloadPdf(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${topic || 'lesson'}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to download PDF';
      setActionError(message);
    }
  };

  const clearSearch = () => setSearchQuery('');

  const lessonCountText =
    debouncedQuery && !loading
      ? `Showing ${lessons.length} lesson${lessons.length === 1 ? '' : 's'} for "${debouncedQuery}"`
      : `Showing ${lessons.length} lesson${lessons.length === 1 ? '' : 's'}`;

  const summaryStats = useMemo(() => {
    const total = lessons.length;
    const pub = lessons.filter((l) => l.is_public).length;
    const priv = total - pub;
    const drafts = 0; // Drafts feature not implemented yet
    return { total, pub, priv, drafts };
  }, [lessons]);

  return (
    <div className="space-y-6">
      {/* Page Title Section */}
      <div className="space-y-1 animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600">Track your teaching content and lesson visibility.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Lessons" value={summaryStats.total} accent="blue" icon="📚" />
        <StatCard label="Public" value={summaryStats.pub} accent="green" icon="🌍" />
        <StatCard label="Private" value={summaryStats.priv} accent="purple" icon="🔒" />
        <StatCard label="Drafts" value={summaryStats.drafts} accent="gray" icon="📝" />
      </div>

      {/* Welcome Card - Horizontal */}
      <div className="bg-white border border-gray-100 text-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 ease-in-out animate-slide-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 -mt-0.5">
            <h2 className="text-xl font-semibold mb-1">
              Welcome back, {user?.profile?.full_name || user?.username} 👋
            </h2>
            <p className="text-sm text-gray-600">Manage and publish your lessons easily.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              to="/lessons/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-blue-700 hover:shadow-md hover:scale-[1.02] text-center transition-all duration-200 ease-in-out active:scale-[0.98]"
            >
              New Lesson
            </Link>
            <Link
              to="/explore"
              className="text-blue-700 border border-blue-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm hover:scale-[1.02] text-center transition-all duration-200 ease-in-out active:scale-[0.98]"
            >
              Explore Public
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-4 hover:shadow-md transition-all duration-300 ease-in-out animate-slide-up">
        {/* Title */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-xl font-semibold text-gray-800">My Lessons</h3>
          {loading && <span className="text-sm text-gray-500">Loading...</span>}
        </div>

        {/* Search, Filter, Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lessons..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 ease-in-out"
            />
          </div>
          <button
            className="px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm transition-all duration-200 ease-in-out flex items-center gap-1.5"
            title="Filter lessons"
          >
            <span>Filters</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
          <button
            className="px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm transition-all duration-200 ease-in-out flex items-center gap-1.5"
            title="Sort lessons"
          >
            <span>Sort</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="px-4 py-2.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 hover:shadow-md hover:scale-105 shadow-sm transition-all duration-200 ease-in-out active:scale-95"
            >
              Clear
            </button>
          )}
        </div>
        <span className="text-xs text-gray-500">{lessonCountText}</span>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">
            {error}
          </div>
        )}
        {actionError && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded">
            {actionError}
          </div>
        )}
        {!loading && lessons.length === 0 && !error && (
          <div className="text-center py-16 px-4">
            {debouncedQuery ? (
              <>
                <div className="text-6xl mb-4 opacity-60">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No lessons found</h3>
                <p className="text-gray-700 mb-6">
                  No lessons match "{debouncedQuery}". Try a different search term.
                </p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-6 opacity-60">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">You have no lessons yet</h3>
                <p className="text-gray-700 mb-8 max-w-md mx-auto">
                  Create your first lesson to get started
                </p>
        <Link
          to="/lessons/new"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg text-base font-semibold shadow hover:bg-blue-700 hover:shadow-md hover:scale-105 transition-all duration-200 ease-in-out active:scale-95"
                >
                  Create First Lesson
                </Link>
              </>
            )}
          </div>
        )}

        {/* Desktop table */}
        {!loading && lessons.length > 0 && (
          <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Topic</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase w-24">Grade</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase w-28">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Created</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase w-24">Public</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson, index) => (
                <tr
                  key={lesson.id}
                  className={`border-b border-gray-100 hover:bg-blue-50 hover:shadow-sm transition-all duration-200 ease-in-out animate-fade-in ${
                    index === lessons.length - 1 ? 'border-b-0' : ''
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{lesson.topic}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{lesson.subject}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{lesson.grade_level}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{lesson.duration_minutes} mins</td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {formatDate(lesson.created_at)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ease-in-out ${
                        lesson.is_public
                          ? 'bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-sm hover:scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm hover:scale-105'
                      }`}
                    >
                      {lesson.is_public ? (
                        <>
                          <IconCheck />
                          Public
                        </>
                      ) : (
                        <>
                          <IconLock />
                          Private
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={`/lessons/${lesson.id}`}
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:underline hover:scale-105 transition-all duration-200 ease-in-out active:scale-95"
                        title="View lesson details"
                      >
                        <IconEye /> View
        </Link>
                      <button
                        onClick={() => handleToggleVisibility(lesson.id)}
                        className="inline-flex items-center gap-1.5 text-purple-600 hover:text-purple-700 hover:scale-105 transition-all duration-200 ease-in-out active:scale-95"
                        title={lesson.is_public ? 'Make Private' : 'Make Public'}
                      >
                        <div className="relative inline-flex items-center">
                          <div
                            className={`w-10 h-5 rounded-full transition-colors duration-300 ease-in-out hover:shadow-md ${
                              lesson.is_public ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                          >
                            <div
                              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out ${
                                lesson.is_public ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleDownload(lesson.id, lesson.topic)}
                        className="inline-flex items-center gap-1.5 text-green-600 hover:text-green-700 hover:underline hover:scale-105 transition-all duration-200 ease-in-out active:scale-95"
                        title="Download lesson as PDF"
                      >
                        <IconPdf /> PDF
                      </button>
                      <button
                        onClick={() => handleDelete(lesson.id)}
                        className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-800 hover:underline hover:scale-105 transition-all duration-200 ease-in-out active:scale-95"
                        title="Delete lesson"
                      >
                        <IconTrash /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}

        {/* Mobile / tablet cards */}
        {!loading && lessons.length > 0 && (
          <div className="grid gap-3 lg:hidden">
          {lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:bg-blue-50 hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300 ease-in-out animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{lesson.subject}</p>
                  <h4 className="text-lg font-semibold text-gray-900">{lesson.topic}</h4>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ease-in-out ${
                    lesson.is_public
                      ? 'bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-sm hover:scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm hover:scale-105'
                  }`}
                >
                  {lesson.is_public ? (
                    <>
                      <IconCheck />
                      Public
                    </>
                  ) : (
                    <>
                      <IconLock />
                      Private
                    </>
                  )}
                </span>
              </div>
              <div className="text-sm text-gray-800 mt-2 flex flex-wrap gap-2">
                <span>Grade: {lesson.grade_level}</span>
                <span>•</span>
                <span>{lesson.duration_minutes} mins</span>
                <span>•</span>
                <span>{formatDate(lesson.created_at)}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <Link
                  to={`/lessons/${lesson.id}`}
                  className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:underline hover:scale-105 transition-all duration-200 ease-in-out active:scale-95"
                  title="View lesson details"
                >
                  <IconEye /> View
                </Link>
                <button
                  onClick={() => handleToggleVisibility(lesson.id)}
                  className="inline-flex items-center gap-1.5 text-purple-600 hover:text-purple-700 hover:scale-105 transition-all duration-200 ease-in-out active:scale-95"
                  title={lesson.is_public ? 'Make Private' : 'Make Public'}
                >
                  <div className="relative inline-flex items-center">
                    <div
                      className={`w-10 h-5 rounded-full transition-colors duration-300 ease-in-out hover:shadow-md ${
                        lesson.is_public ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out ${
                          lesson.is_public ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleDownload(lesson.id, lesson.topic)}
                  className="inline-flex items-center gap-1.5 text-green-600 hover:text-green-700 hover:underline hover:scale-105 transition-all duration-200 ease-in-out active:scale-95"
                  title="Download lesson as PDF"
                >
                  <IconPdf /> PDF
                </button>
                <button
                  onClick={() => handleDelete(lesson.id)}
                  className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-800 hover:underline hover:scale-105 transition-all duration-200 ease-in-out active:scale-95"
                  title="Delete lesson"
                >
                  <IconTrash /> Delete
                </button>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  accent = 'blue',
  icon,
}: {
  label: string;
  value: number;
  accent?: 'blue' | 'green' | 'gray' | 'purple';
  icon?: string;
}) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border border-blue-100',
    green: 'bg-green-50 text-green-700 border border-green-100',
    gray: 'bg-gray-50 text-gray-700 border border-gray-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-100',
  }[accent];

  const iconBgColors = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    gray: 'bg-gray-100',
    purple: 'bg-purple-100',
  }[accent];

  return (
    <div className={`rounded-lg p-4 h-full flex items-start gap-3 hover:shadow-md hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-default animate-slide-up ${colors}`}>
      {icon && (
        <div className={`w-10 h-10 rounded-full ${iconBgColors} flex items-center justify-center flex-shrink-0 transition-transform duration-300 ease-in-out group-hover:scale-110`}>
          <span className="text-lg transition-transform duration-300 ease-in-out">{icon}</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-600 mb-1.5 transition-colors duration-200">{label}</div>
        <div className="text-4xl font-extrabold leading-none transition-all duration-200">{value}</div>
      </div>
    </div>
  );
};

const IconEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconPdf = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2v-9.586a1 1 0 00-.293-.707l-4.414-4.414A1 1 0 0013.586 4H7a2 2 0 00-2 2v13a2 2 0 002 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 4v4a1 1 0 001 1h4" />
  </svg>
);

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-9 0h10" />
  </svg>
);

const IconLock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2h-1V9a5 5 0 00-10 0v2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
  </svg>
);

const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

