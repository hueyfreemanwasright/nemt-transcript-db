function SearchBar({ value, onChange }) {
  return (
    <input
      type="text"
      className="search"
      placeholder="Search caller, member ID, or location..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default SearchBar;