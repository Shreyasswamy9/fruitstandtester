import { useState } from "react";

interface DiscountCodeProps {
  onApply?: (code: string) => void;
}

const DiscountCode: React.FC<DiscountCodeProps> = ({ onApply }) => {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState("");

  const handleApply = () => {
    if (!code.trim()) {
      setError("Please enter a code.");
      return;
    }
    setApplied(true);
    setError("");
    onApply?.(code);
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="discount-code" className="text-xs font-semibold text-gray-700 mb-1">
        Discount Code
      </label>
      <div className="flex gap-2">
        <input
          id="discount-code"
          type="text"
          value={code}
          onChange={e => setCode(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Enter code"
          disabled={applied}
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={applied}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${applied ? 'bg-gray-300 text-gray-500' : 'bg-black text-white hover:bg-gray-800'}`}
        >
          {applied ? "Applied" : "Apply"}
        </button>
      </div>
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
      {applied && <div className="text-xs text-green-600 mt-1">Code applied!</div>}
    </div>
  );
};

export default DiscountCode;
