// src/components/FeedbackSummaryCard.jsx
export default function FeedbackSummaryCard({ avgRating, totalReviews }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-[#1E376E] mb-3">
        Overall Rating
      </h3>
      <div className="flex items-center space-x-3">
        <span className="text-3xl font-bold text-[#1E376E]">{avgRating}</span>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-2xl ${
                star <= Math.round(avgRating)
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
            >
              ★
            </span>
          ))}
        </div>
        <span className="text-gray-500 text-sm">
          ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
        </span>
      </div>
    </div>
  );
}
