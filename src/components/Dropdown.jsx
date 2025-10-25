const Dropdown = ({ label, options, value, onChange }) => {
  return (
    <div className="flex flex-col w-full">
      <label className="text-sm text-gray-600 mb-1 font-medium">{label}</label>
      <select
        className="border rounded px-3 py-2 w-full text-sm bg-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option, idx) => (
          <option key={idx} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
