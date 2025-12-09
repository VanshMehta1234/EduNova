import { useParams } from 'react-router-dom';

export const LessonDetail = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Lesson {id}</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-gray-600">Lesson view/edit page will be implemented here.</p>
        <p className="text-gray-500 text-sm mt-2">
          This will display the lesson details and allow editing for the lesson owner.
        </p>
      </div>
    </div>
  );
};

