export default function RecordCard({ title, description, onClick }) {
    return (
      <div
        className="p-4 border rounded-lg shadow-sm bg-white cursor-pointer hover:shadow-md"
        onClick={onClick}
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    );
  }
  