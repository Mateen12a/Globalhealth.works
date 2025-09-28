// src/pages/MyProposal.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function MyProposals() {
  const token = localStorage.getItem("token");
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    const fetchMy = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/proposals/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setProposals(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMy();
  }, [token]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-[#1E376E] mb-4">My Proposals</h2>
      {proposals.length === 0 ? <p>No proposals yet.</p> : (
        <ul className="space-y-4">
          {proposals.map(p => (
            <li key={p._id} className="bg-white p-4 rounded shadow flex justify-between items-start">
              <div>
                <Link to={`/tasks/${p.task._id}`} className="font-bold text-[#357FE9]">{p.task.title}</Link>
                <p className="text-sm text-gray-600">{p.message.slice(0,200)}{p.message.length>200?'...':''}</p>
                <div className="text-xs text-gray-500 mt-1">Status: <span className="font-semibold">{p.status}</span></div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">{new Date(p.createdAt).toLocaleString()}</div>
                <div className="mt-2">
                  {p.status === "pending" && (
                    <button onClick={async () => {
                      if (!confirm("Withdraw proposal?")) return;
                      const res = await fetch(`http://localhost:5000/api/proposals/${p._id}/withdraw`, {
                        method: "PATCH",
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      if (res.ok) {
                        setProposals(prev => prev.map(x => x._id===p._id ? {...x, status:'withdrawn'} : x));
                        alert("Withdrawn");
                      } else {
                        const d = await res.json(); alert(d.msg || "Error");
                      }
                    }} className="px-3 py-1 text-sm rounded border">Withdraw</button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
