import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { lessonsApi, type LessonResponse } from '../api/lessons';
import { useAuth } from '../contexts/AuthContext';

// Format date as "09 Dec 2025"
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
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

export const Explore = () => {
  const { isAuthenticated } = useAuth();
  const [lessons, setLessons] = useState<LessonResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const fetchLessons = async (query = '') => {
    setError(null);
    setLoading(true);
    try {
      const data = await lessonsApi.listPublic(query);
      setLessons(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load public lessons';
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

  const clearSearch = () => setSearchQuery('');

  const lessonCountText =
    debouncedQuery && !loading
      ? `Showing ${lessons.length} public lesson${lessons.length === 1 ? '' : 's'} for "${debouncedQuery}"`
      : `Showing ${lessons.length} public lesson${lessons.length === 1 ? '' : 's'}`;

  return (
    <div className="space-y-6">
      {/* Page Title Section */}
      <div className="space-y-1 animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-900">Explore</h1>
        <p className="text-sm text-gray-600">Discover and browse public lessons from the community.</p>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-4 hover:shadow-md transition-all duration-300 ease-in-out animate-slide-up">
        {/* Title */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-xl font-semibold text-gray-800">Public Lessons</h3>
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
        {!loading && lessons.length === 0 && !error && (
          <div className="text-center py-16 px-4">
            {debouncedQuery ? (
              <>
                <div className="text-6xl mb-4 opacity-60">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No lessons found</h3>
                <p className="text-gray-700 mb-6">
                  No public lessons match "{debouncedQuery}". Try a different search term.
                </p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-6 opacity-60">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No public lessons yet</h3>
                <p className="text-gray-700 mb-8 max-w-md mx-auto">
                  Be the first to share your lesson with the community!
                </p>
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
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Creator</th>
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
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {lesson.creator_email || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          to={`/public/${lesson.slug}`}
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:underline hover:scale-105 transition-all duration-200 ease-in-out active:scale-95"
                          title="View lesson details"
                        >
                          <IconEye /> View
                        </Link>
                        {isAuthenticated && (
                          <button
                            onClick={async () => {
                              try {
                                const blob = await lessonsApi.downloadPdf(lesson.id);
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${lesson.topic || 'lesson'}.pdf`;
                                a.click();
                                window.URL.revokeObjectURL(url);
                              } catch {
                                // Error is handled by API client
                              }
                            }}
                            className="inline-flex items-center gap-1.5 text-green-600 hover:text-green-700 hover:underline hover:scale-105 transition-all duration-200 ease-in-out active:scale-95"
                            title="Download lesson as PDF"
                          >
                            <IconPdf /> PDF
                          </button>
                        )}
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
                </div>
                <div className="text-sm text-gray-800 mt-2 flex flex-wrap gap-2">
                  <span>Grade: {lesson.grade_level}</span>
                  <span>•</span>
                  <span>{lesson.duration_minutes} mins</span>
                  <span>•</span>
                  <span>{formatDate(lesson.created_at)}</span>
                </div>
                <div className="text-sm text-gray-800 mt-2">
                  <span className="font-medium">Creator:</span> {lesson.creator_email || 'Unknown'}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <Link
                    to={`/public/${lesson.slug}`}
                    className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:underline hover:scale-105 transition-all duration-200 ease-in-out active:scale-95"
                    title="View lesson details"
                  >
                    <IconEye /> View
                  </Link>
                  {isAuthenticated && (
                    <button
                      onClick={async () => {
                        try {
                          const blob = await lessonsApi.downloadPdf(lesson.id);
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${lesson.topic || 'lesson'}.pdf`;
                          a.click();
                          window.URL.revokeObjectURL(url);
                        } catch {
                          // Error is handled by API client
                        }
                      }}
                      className="inline-flex items-center gap-1.5 text-green-600 hover:text-green-700 hover:underline hover:scale-105 transition-all duration-200 ease-in-out active:scale-95"
                      title="Download lesson as PDF"
                    >
                      <IconPdf /> PDF
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

