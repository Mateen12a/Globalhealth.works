// src/components/landing/HowItWorks.jsx
export default function HowItWorks() {
  const steps = [
    {
      title: "Join the Community",
      desc: "Choose your role: Post tasks as an Owner or solve tasks as a Provider.",
    },
    {
      title: "Create / Apply",
      desc: "Owners create tasks. Providers apply to work on tasks.",
    },
    {
      title: "Match & Collaborate",
      desc: "Smart matching connects the right people to the right tasks.",
    },
    {
      title: "Deliver & Feedback",
      desc: "Work is delivered, feedback collected, and impact measured.",
    },
  ];

  return (
    <section className="bg-gray-50 py-24 px-6">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1E376E] mb-16">
        How It Works
      </h2>

      {/* Horizontal Steps */}
      <div className="flex flex-col md:flex-row items-start justify-between max-w-6xl mx-auto space-y-12 md:space-y-0 md:space-x-8">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center flex-1">
            {/* Number Circle */}
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-[#E96435] to-[#F7B526] text-white font-bold text-xl shadow-md mb-6">
              {i + 1}
            </div>

            {/* Card */}
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition text-center w-full">
              <h3 className="font-semibold text-[#1E376E] text-lg mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Stacked Steps */}
      <div className="md:hidden flex flex-col items-center mt-16 space-y-12">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center w-full">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-r from-[#E96435] to-[#F7B526] text-white font-bold text-lg shadow-md mb-4">
              {i + 1}
            </div>
            <div className="bg-white rounded-xl p-5 shadow-md text-center w-full">
              <h3 className="font-semibold text-[#1E376E] text-lg mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
