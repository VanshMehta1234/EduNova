import { useParams } from 'react-router-dom';

export const PublicLesson = () => {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Public Lesson: {slug}</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-gray-600">Public lesson view will be implemented here.</p>
        <p className="text-gray-500 text-sm mt-2">
          This page will display public lessons that can be viewed without authentication.
        </p>
      </div>
    </div>
  );
};

