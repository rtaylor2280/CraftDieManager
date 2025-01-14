export default function GalleryGrid({ images, onImageClick }) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative cursor-pointer"
            onClick={() => onImageClick && onImageClick(image)}
          >
            <img
              src={image.url}
              alt={image.alt || 'Project image'}
              className="w-full h-48 object-cover rounded shadow"
            />
          </div>
        ))}
      </div>
    );
  }
  