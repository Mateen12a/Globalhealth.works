// src/components/COutrySelect.jsx
import { useEffect, useState } from "react";

export default function CountrySelect({ value, onChange, required = false }) {
  const [countries, setCountries] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all")
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((c) => ({
          name: c.name.common, // You can switch to c.name.official if needed
          flag: c.flags.svg || c.flags.png || `https://flagcdn.com/${c.cca2.toLowerCase()}.svg`,
        }));
        setCountries(mapped.sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(() =>
        setCountries([
          { name: "Nigeria", flag: "https://flagcdn.com/ng.svg" },
          { name: "Kenya", flag: "https://flagcdn.com/ke.svg" },
          { name: "United Kingdom", flag: "https://flagcdn.com/gb.svg" },
        ])
      );
  }, []);

  const selected = countries.find((c) => c.name === value);

  return (
    <div className="relative">
      {/* Selected value */}
      <div
        onClick={() => setOpen(!open)}
        className="w-full border p-3 rounded-lg shadow-sm flex items-center justify-between cursor-pointer bg-white"
      >
        {selected ? (
          <div className="flex items-center gap-2">
            <img src={selected.flag} alt="" className="w-5 h-4 object-cover" />
            <span>{selected.name}</span>
          </div>
        ) : (
          <span className="text-gray-400">Select Country</span>
        )}
        <span className="text-gray-500">▾</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {/* Search bar */}
          <input
            type="text"
            placeholder="Search country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border-b p-2 text-sm focus:outline-none"
          />
          {/* Country list */}
          <ul>
            {countries
              .filter((c) =>
                c.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((c) => (
                <li
                  key={c.name}
                  onClick={() => {
                    onChange(c.name);
                    setOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 ${
                    c.name === value ? "bg-gray-50 font-semibold" : ""
                  }`}
                >
                  <img src={c.flag} alt="" className="w-5 h-4 object-cover" />
                  {c.name}
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Validation */}
      {required && !value && (
        <p className="text-red-500 text-xs mt-1">Country is required</p>
      )}
    </div>
  );
}
