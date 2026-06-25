// SearchBar is a controlled component. It stores no state of its own.
// The current text is passed down from the parent as the `value` prop, and
// every keystroke is reported back up through the `onChange` prop. This keeps
// data flowing one way (parent -> child) while events flow back up.
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