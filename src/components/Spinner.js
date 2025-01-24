import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faSnowflake } from '@fortawesome/free-regular-svg-icons';
import { faStar } from '@fortawesome/free-regular-svg-icons';

export default function Spinner() {
  return (
    <div className="relative w-5 h-5 border-2 border-gray-700 border-t-transparent border-b-transparent rounded-full animate-spin"></div>
  );
}

export function Pulse() {
  return <div className="w-5 h-5 bg-gray-700 rounded-full animate-pulse"></div>;
}

export function SpinnerWithText() {
  return (
    <div className="flex items-center">
      <FontAwesomeIcon
        icon={faSpinner}
        spin
        className="text-white h-5 w-5 mr-2"
      />
      <span>Processing...</span>
    </div>
  );
}

export function SnowFlakeWithText() {
  return (
    <div className="flex items-center">
      <FontAwesomeIcon
        icon={faSnowflake}
        spin
        className="text-white h-5 w-5 mr-2"
      />
      <span>Processing...</span>
    </div>
  );
}

export function StarWithText() {
  return (
    <div className="flex items-center">
      <FontAwesomeIcon
        icon={faStar}
        spin
        className="text-white h-5 w-5 mr-2"
      />
      <span>Processing...</span>
    </div>
  );
}

export function DotBounce() {
  return (
    <div className="flex space-x-2">
      <div className="w-2 h-2 bg-gray-700 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-gray-700 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-gray-700 rounded-full animate-bounce"></div>
    </div>
  );
}
