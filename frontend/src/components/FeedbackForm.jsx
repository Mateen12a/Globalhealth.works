// src/components/FeedbackForm.jsx
import { useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

export default function FeedbackForm({ taskId, toUser, onFeedbackSubmitted }) {
  const token = localStorage.getItem("token");
  const [rating, setRating] = useState(0);
  const [strengths, setStrengths] = useState("");
  const [improvementAreas, setImprovementAreas] = useState("");
  const [testimonial, setTestimonial] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`${API_URL}/api/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        taskId,
        toUser,
        rating,
        strengths,
        improvementAreas,
        testimonial,
        privateNotes,
      }),
    });

    if (res.ok) {
      onFeedbackSubmitted && onFeedbackSubmitted();
      setRating(0);
      setStrengths("");
      setImprovementAreas("");
      setTestimonial("");
      setPrivateNotes("");
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-lg rounded-2xl p-6 space-y-5 border border-gray-100"
    >
      <h2 className="text-xl font-semibold text-[#1E376E]">Leave Feedback</h2>

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating
        </label>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition ${
                star <= rating
                  ? "bg-yellow-400 text-white"
                  : "bg-gray-100 text-gray-400 hover:bg-yellow-100"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/* Strengths */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Strengths
        </label>
        <textarea
          value={strengths}
          onChange={(e) => setStrengths(e.target.value)}
          placeholder="What went really well?"
          className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#1E376E]"
        />
      </div>

      {/* Improvement Areas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Areas for Improvement
        </label>
        <textarea
          value={improvementAreas}
          onChange={(e) => setImprovementAreas(e.target.value)}
          placeholder="Where could things improve?"
          className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#1E376E]"
        />
      </div>

      {/* Testimonial */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Public Testimonial
        </label>
        <textarea
          value={testimonial}
          onChange={(e) => setTestimonial(e.target.value)}
          placeholder="Write a testimonial that others can see"
          className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#1E376E]"
        />
      </div>

      {/* Private Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Private Notes (Only visible to admins)
        </label>
        <textarea
          value={privateNotes}
          onChange={(e) => setPrivateNotes(e.target.value)}
          placeholder="Anything you'd like to share privately?"
          className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#1E376E]"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#1E376E] text-white py-3 rounded-lg font-medium hover:bg-[#142851] transition"
      >
        {loading ? "Submitting..." : "Submit Feedback"}
      </button>
    </form>
  );
}
