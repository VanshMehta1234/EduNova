import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { lessonsApi, type LessonContent, type LessonInput } from '../api/lessons';

const IconSparkles = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const IconSave = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const getVideoThumbnail = (url: string): string | null => {
  if (!url) return null;
  
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    // youtu.be/<id>
    if (host.includes('youtu.be')) {
      const id = parsed.pathname.split('/')[1];
      if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }

    // youtube.com/watch?v=<id> or other query formats
    if (host.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v) return `https://img.youtube.com/vi/${v}/hqdefault.jpg`;
      // handle /embed/<id>
      const parts = parsed.pathname.split('/');
      const embedIndex = parts.findIndex((p) => p === 'embed');
      if (embedIndex !== -1 && parts[embedIndex + 1]) {
        const id = parts[embedIndex + 1];
        return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      }
    }

    return null;
  } catch {
    return null;
  }
};

const defaultForm: LessonInput = {
  topic: '',
  subject: '',
  grade_level: '',
  duration_minutes: 45,
};

export const NewLesson = () => {
  const [form, setForm] = useState<LessonInput>(defaultForm);
  const [generated, setGenerated] = useState<LessonContent | null>(null);
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [activitiesText, setActivitiesText] = useState('');
  const [questionsText, setQuestionsText] = useState('');
  const [summary, setSummary] = useState('');
  const [imageUrlsText, setImageUrlsText] = useState('');
  const [videoLinksText, setVideoLinksText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPublic, setSavingPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const parseList = (text: string) =>
    text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

  const parseCsvList = (text: string) =>
    text
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const parseVideoLinks = (text: string) =>
    text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        // Split by '|' but handle titles that contain '|'
        // Format: "Title | URL" - split from the right (last '|')
        const lastPipeIndex = line.lastIndexOf('|');
        if (lastPipeIndex === -1) {
          // No pipe found, treat entire line as URL
          return { title: 'Video', url: line };
        }
        const title = line.substring(0, lastPipeIndex).trim();
        const url = line.substring(lastPipeIndex + 1).trim();
        return { title: title || 'Video', url: url || '' };
      })
      .filter((v) => v.url);

  const handleGenerate = async () => {
    // Validate form fields
    if (!form.topic || !form.subject || !form.grade_level || !form.duration_minutes) {
      setError('Please fill in all required fields.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const result = await lessonsApi.generate(form);
      setGenerated(result);
      setDescription(result.description);
      setContent(result.content);
      setActivitiesText(result.activities.join('\n'));
      setQuestionsText(result.questions.join('\n'));
      setSummary(result.summary);
      setImageUrlsText(result.image_urls.join(', '));
      setVideoLinksText(result.video_links.map((v) => `${v.title} | ${v.url}`).join('\n'));
    } catch {
      setError('Failed to generate lesson. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const prepareLessonData = () => {
    return {
      ...form,
      description,
      content,
      activities: parseList(activitiesText),
      questions: parseList(questionsText),
      summary,
      image_urls: parseCsvList(imageUrlsText),
      video_links: parseVideoLinks(videoLinksText),
    };
  };

  const handleSave = async (makePublic: boolean = false) => {
    if (!generated) {
      setError('Please generate a lesson before saving.');
      return;
    }

    // Validate required fields
    if (!form.topic || !form.subject || !form.grade_level) {
      setError('Please fill in all required lesson details.');
      return;
    }

    if (!description.trim() || !summary.trim()) {
      setError('Description and summary are required.');
      return;
    }

    setError(null);
    setSuccess(null);
    
    if (makePublic) {
      setSavingPublic(true);
    } else {
      setSaving(true);
    }

    try {
      const payload = {
        ...prepareLessonData(),
        is_public: makePublic,
      };

      const created = await lessonsApi.create(payload);
      
      // Show success message briefly before redirect
      setSuccess(makePublic ? 'Lesson saved and made public!' : 'Lesson saved successfully!');
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate(`/lessons/${created.id}`);
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save lesson. Please try again.';
      setError(message);
      // Form data remains intact on error
    } finally {
      setSaving(false);
      setSavingPublic(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title Section */}
      <div className="space-y-1 animate-fade-in">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="text-gray-600 hover:text-gray-900 transition-colors"
            title="Back to Dashboard"
          >
            <IconArrowLeft />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Lesson</h1>
        </div>
        <p className="text-sm text-gray-600">Generate engaging educational content with AI assistance</p>
      </div>

      {/* Lesson Form Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6 hover:shadow-md transition-all duration-300 ease-in-out animate-slide-up">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lesson Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
              <input
                type="text"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 ease-in-out disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="e.g., Photosynthesis"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 ease-in-out disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="e.g., Biology"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
              <input
                type="text"
                value={form.grade_level}
                onChange={(e) => setForm({ ...form, grade_level: e.target.value })}
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 ease-in-out disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="e.g., Grade 8"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
              <input
                type="number"
                min={1}
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 ease-in-out disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                required
              />
            </div>
          </div>
        </div>

        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-700 font-medium">Generating your lesson content...</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !form.topic || !form.subject || !form.grade_level}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-semibold shadow hover:bg-blue-700 hover:shadow-md hover:scale-105 transition-all duration-200 ease-in-out active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <IconSparkles />
            {loading ? 'Generating...' : 'Generate Lesson'}
          </button>
        </div>

        {generated && (
          <div className="border-t border-gray-200 pt-6 mt-6 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Generated Lesson Content</h2>
                <p className="text-sm text-gray-600 mt-1">Review and edit the generated content before saving</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Generated
              </span>
            </div>

            {/* Description and Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 ease-in-out min-h-[120px] resize-y"
                  placeholder="Lesson description..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Summary
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 ease-in-out min-h-[120px] resize-y"
                  placeholder="Lesson summary..."
                />
              </div>
            </div>

            {/* Main Lesson Content */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Main Lesson Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 ease-in-out min-h-[300px] resize-y"
                placeholder="Main lesson text content (article-like content that students will read)..."
              />
              <p className="text-xs text-gray-500">The main lesson text - comprehensive content that teaches the topic</p>
            </div>

            {/* Activities and Questions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Activities
                </label>
                <textarea
                  value={activitiesText}
                  onChange={(e) => setActivitiesText(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 ease-in-out min-h-[140px] resize-y"
                  placeholder="Activity 1&#10;Activity 2&#10;..."
                />
                <p className="text-xs text-gray-500">Enter each activity on a new line</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Questions
                </label>
                <textarea
                  value={questionsText}
                  onChange={(e) => setQuestionsText(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 ease-in-out min-h-[140px] resize-y"
                  placeholder="Question 1&#10;Question 2&#10;..."
                />
                <p className="text-xs text-gray-500">Enter each question on a new line</p>
              </div>
            </div>

            {/* Images Section */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Images
                </label>
                <textarea
                  value={imageUrlsText}
                  onChange={(e) => setImageUrlsText(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 ease-in-out min-h-[80px] resize-y"
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">Separate URLs with commas</p>
              </div>
              {parseCsvList(imageUrlsText).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                  {parseCsvList(imageUrlsText).map((url, index) => (
                    <div key={`${url}-${index}`} className="relative group">
                      <img
                        src={url}
                        alt={`Lesson image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Videos Section */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Videos
                </label>
                <textarea
                  value={videoLinksText}
                  onChange={(e) => setVideoLinksText(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 ease-in-out min-h-[80px] resize-y"
                  placeholder="Video Title | https://example.com/video&#10;Another Video | https://example.com/video2"
                />
                <p className="text-xs text-gray-500 mt-1">Format: Title | URL (one per line)</p>
              </div>
              {parseVideoLinks(videoLinksText).length > 0 && (
                <div className="space-y-2 mt-4">
                  {parseVideoLinks(videoLinksText).map((video, index) => {
                    const thumbnail = getVideoThumbnail(video.url);
                    return (
                      <a
                        key={`${video.url}-${index}`}
                        href={video.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 group"
                      >
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={video.title || 'Video thumbnail'}
                            className="w-20 h-14 rounded-md object-cover border border-gray-200 shadow-sm flex-shrink-0"
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
                            {video.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{video.url}</p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 ease-in-out"
              >
                Cancel
              </Link>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  disabled={saving || savingPublic}
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow hover:bg-green-700 hover:shadow-md hover:scale-105 transition-all duration-200 ease-in-out active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <IconSave />
                  {saving ? 'Saving...' : 'Save Lesson'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={saving || savingPublic}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow hover:bg-blue-700 hover:shadow-md hover:scale-105 transition-all duration-200 ease-in-out active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  {savingPublic ? 'Saving...' : 'Save & Make Public'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

