import { useEffect, useState } from "react";
import FeedbackSummaryCard from "./FeedbackSummaryCard";

export default function FeedbackList({ userId }) {
  const token = localStorage.getItem("token");
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/api/feedback/received/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const feedbackArray = Array.isArray(data) ? data : [];
        setFeedbacks(feedbackArray);

        if (feedbackArray.length > 0) {
          const avg =
            feedbackArray.reduce((sum, f) => sum + (f.rating || 0), 0) /
            feedbackArray.length;
          setAvgRating(avg.toFixed(1));
        } else {
          setAvgRating(0);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Feedback fetch error:", err);
        setLoading(false);
      });
  }, [userId, token]);

  if (loading) return <p className="text-gray-500">Loading feedback...</p>;
  if (feedbacks.length === 0)
    return <p className="text-gray-500">No feedback yet</p>;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      {feedbacks.length > 0 && (
        <FeedbackSummaryCard avgRating={avgRating} totalReviews={feedbacks.length} />
      )}

      {/* Individual Feedback */}
      {feedbacks.map((f) => (
        <div
          key={f._id}
          className="bg-white shadow-md rounded-lg p-5 border border-gray-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#1E376E]">
                {f.fromUser?.name || "Anonymous"}
              </p>
              <p className="text-xs text-gray-500">
                {f.taskId?.title || "General Feedback"}
              </p>
            </div>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-lg ${
                    star <= f.rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          {/* Content */}
          {f.testimonial && (
            <p className="mt-3 text-gray-700 italic">“{f.testimonial}”</p>
          )}

          {f.strengths && (
            <p className="mt-2 text-sm text-green-600">
              <strong>Strengths:</strong> {f.strengths}
            </p>
          )}

          {f.improvementAreas && (
            <p className="mt-1 text-sm text-orange-600">
              <strong>Improvements:</strong> {f.improvementAreas}
            </p>
          )}

          {/* Date */}
          <p className="mt-2 text-xs text-gray-400">
            {new Date(f.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
