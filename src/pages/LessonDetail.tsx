import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lessonsApi, type LessonResponse } from '../api/lessons';

const IconPdf = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2v-9.586a1 1 0 00-.293-.707l-4.414-4.414A1 1 0 0013.586 4H7a2 2 0 00-2 2v13a2 2 0 002 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 4v4a1 1 0 001 1h4" />
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

// Helper function to fix swapped video links (detect if url/title are swapped)
const fixSwappedVideoLink = (video: { title: string; url: string }): { title: string; url: string } => {
  const url = video.url || '';
  const title = video.title || '';
  
  // If URL looks like a title (doesn't start with http and contains spaces/short)
  // and title looks like a URL (starts with http), swap them
  const urlLooksLikeTitle = !url.startsWith('http') && url.length < 100 && (url.includes(' ') || !url.includes('.'));
  const titleLooksLikeUrl = title.startsWith('http');
  
  if (urlLooksLikeTitle && titleLooksLikeUrl) {
    // Swap them
    return { title: url, url: title };
  }
  
  // If URL doesn't look like a URL but title does, swap
  if (!url.startsWith('http') && title.startsWith('http')) {
    return { title: url, url: title };
  }
  
  return video;
};

// Helper function to ensure video URL is properly formatted
const formatVideoUrl = (url: string): string => {
  if (!url) return '';
  // If it's already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // If it's a YouTube video ID, convert to full URL
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return `https://www.youtube.com/watch?v=${url}`;
  }
  // Otherwise, assume it's a partial URL and prepend https://
  return `https://${url}`;
};

export const LessonDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<LessonResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!id) return;
      setError(null);
      setLoading(true);
      try {
        const data = await lessonsApi.retrieve(id);
        setLesson(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load lesson';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [id]);

  const handleToggleVisibility = async () => {
    if (!id) return;
    setActionError(null);
    try {
      const updatedLesson = await lessonsApi.toggleVisibility(id);
      setLesson(updatedLesson);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update visibility';
      setActionError(message);
    }
  };

  const handleDownload = async () => {
    if (!id || !lesson) return;
    setActionError(null);
    try {
      const blob = await lessonsApi.downloadPdf(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${lesson.topic || 'lesson'}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to download PDF';
      setActionError(message);
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
            to="/dashboard"
            className="inline-block mt-4 text-blue-600 hover:text-blue-700 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title Section */}
      <div className="space-y-1 animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-900">{lesson.topic}</h1>
        <p className="text-sm text-gray-600">View and manage your lesson details</p>
      </div>

      {/* Action Bar */}
      <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              lesson.is_public
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
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
          <span className="text-sm text-gray-600">
            {lesson.subject} • {lesson.grade_level} • {lesson.duration_minutes} mins
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleToggleVisibility}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 hover:shadow-sm transition-all duration-200 ease-in-out"
            title={lesson.is_public ? 'Make Private' : 'Make Public'}
          >
            <IconLock />
            {lesson.is_public ? 'Make Private' : 'Make Public'}
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-green-600 border border-green-200 rounded-lg hover:bg-green-50 hover:border-green-300 hover:shadow-sm transition-all duration-200 ease-in-out"
            title="Download lesson as PDF"
          >
            <IconPdf />
            Download PDF
          </button>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm transition-all duration-200 ease-in-out"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {actionError && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded-xl">
          {actionError}
        </div>
      )}

      {/* Lesson Content */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6 hover:shadow-md transition-all duration-300 ease-in-out">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{lesson.description}</p>
        </div>

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
              {(lesson.video_links || []).map((video, index) => {
                // Fix swapped video links if needed
                const fixedVideo = fixSwappedVideoLink(video);
                const videoUrl = formatVideoUrl(fixedVideo.url || '');
                return (
                <a
                  key={`${video.url}-${index}`}
                  href={videoUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 group cursor-pointer"
                  onClick={(e) => {
                    // Ensure the link opens properly
                    if (!videoUrl || !videoUrl.startsWith('http')) {
                      e.preventDefault();
                      console.error('Invalid video URL:', video.url);
                      alert('Invalid video URL. Please check the video link.');
                    }
                  }}
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center group-hover:bg-red-700 transition-colors">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {fixedVideo.title || 'Untitled Video'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{videoUrl}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

