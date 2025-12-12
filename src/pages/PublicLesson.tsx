import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lessonsApi, type LessonResponse } from '../api/lessons';
import { useAuth } from '../contexts/AuthContext';

const IconPdf = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2v-9.586a1 1 0 00-.293-.707l-4.414-4.414A1 1 0 0013.586 4H7a2 2 0 00-2 2v13a2 2 0 002 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 4v4a1 1 0 001 1h4" />
  </svg>
);

const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const getVideoThumbnail = (url: string) => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host.includes('youtu.be')) {
      const id = parsed.pathname.split('/')[1];
      if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }

    if (host.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v) return `https://img.youtube.com/vi/${v}/hqdefault.jpg`;
      const parts = parsed.pathname.split('/');
      const embedIndex = parts.findIndex((p) => p === 'embed');
      if (embedIndex !== -1 && parts[embedIndex + 1]) {
        const id = parts[embedIndex + 1];
        return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      }
    }
  } catch {
    // ignore parsing errors
  }
  return '';
};

const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);


export const PublicLesson = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const [lesson, setLesson] = useState<LessonResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!slug) return;
      setError(null);
      setLoading(true);
      try {
        const data = await lessonsApi.retrievePublic(slug);
        setLesson(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load lesson';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [slug]);

  const handleDownload = async () => {
    if (!lesson) return;
    setDownloading(true);
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
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-gray-600">Loading lesson...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-gray-600">Lesson not found.</div>
          <Link
            to="/explore"
            className="inline-block mt-4 text-blue-600 hover:text-blue-700 hover:underline"
          >
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title Section */}
      <div className="space-y-1 animate-fade-in">
        <div className="flex items-center gap-3">
          <Link
            to="/explore"
            className="text-gray-600 hover:text-gray-900 transition-colors"
            title="Back to Explore"
          >
            <IconArrowLeft />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{lesson.topic}</h1>
        </div>
        <p className="text-sm text-gray-600">Public lesson shared by the community</p>
      </div>

      {/* Action Bar */}
      <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <IconCheck />
            Public
          </span>
          <span className="text-sm text-gray-600">
            {lesson.subject} • {lesson.grade_level} • {lesson.duration_minutes} mins
          </span>
          {lesson.creator_email && (
            <span className="text-sm text-gray-500">
              • Created by {lesson.creator_email}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {isAuthenticated && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-green-600 border border-green-200 rounded-lg hover:bg-green-50 hover:border-green-300 hover:shadow-sm transition-all duration-200 ease-in-out disabled:opacity-60"
              title="Download lesson as PDF"
            >
              <IconPdf />
              {downloading ? 'Downloading...' : 'Download PDF'}
            </button>
          )}
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm transition-all duration-200 ease-in-out"
          >
            Back to Explore
          </Link>
        </div>
      </div>

      {/* Lesson Content */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6 hover:shadow-md transition-all duration-300 ease-in-out">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{lesson.description}</p>
        </div>

        {lesson.content && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Main Lesson Content</h3>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base">{lesson.content}</p>
            </div>
          </div>
        )}

        {(lesson.activities || []).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Activities</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-800">
              {(lesson.activities || []).map((a, idx) => (
                <li key={idx} className="leading-relaxed">{a}</li>
              ))}
            </ul>
          </div>
        )}

        {(lesson.questions || []).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Questions</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-800">
              {(lesson.questions || []).map((q, idx) => (
                <li key={idx} className="leading-relaxed">{q}</li>
              ))}
            </ul>
          </div>
        )}

        {lesson.summary && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{lesson.summary}</p>
          </div>
        )}

        {(lesson.image_urls || []).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Images</h3>
            <div className="flex gap-3 flex-wrap">
              {(lesson.image_urls || []).map((url) => (
                <img
                  key={url}
                  src={url}
                  alt="Lesson"
                  className="h-32 w-32 object-cover rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {(lesson.video_links || []).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Video Links</h3>
            <div className="space-y-2">
              {(lesson.video_links || []).map((video, index) => (
                <a
                  key={`${video.url}-${index}`}
                  href={video.url || '#'}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 group cursor-pointer"
                >
                  {getVideoThumbnail(video.url || '') ? (
                    <img
                      src={getVideoThumbnail(video.url || '')}
                      alt={video.title || 'Video thumbnail'}
                      className="w-20 h-14 rounded-md object-cover border border-gray-200 shadow-sm"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex-shrink-0 w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center group-hover:bg-red-700 transition-colors">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {video.title || 'Untitled Video'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{video.url}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

