// src/components/landing/Testimonials.jsx
export default function Testimonials() {
  const testimonials = [
    {
      name: "Dr. Amina K.",
      role: "Task Owner",
      quote:
        "Posting a challenge here connected me with skilled providers who transformed my project idea into a working solution.",
    },
    {
      name: "James O.",
      role: "Solution Provider",
      quote:
        "I applied to a digital health task and collaborated with global experts. It boosted my career and impact.",
    },
    {
      name: "Maria S.",
      role: "Policy Analyst",
      quote:
        "This platform bridges the gap between health challenges and those ready to solve them. A brilliant initiative!",
    },
  ];

  return (
    <section className="bg-gray-50 py-20 px-6">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1E376E] mb-12">
        What Our Users Say
      </h2>

      {/* Desktop Grid */}
      <div className="hidden md:grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition text-center flex flex-col items-center"
          >
            <p className="italic text-gray-700 text-lg mb-6">“{t.quote}”</p>
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-r from-[#E96435] to-[#357FE9] w-12 h-12 flex items-center justify-center rounded-full text-white font-bold text-lg mb-2">
                {t.name[0]}
              </div>
              <h4 className="font-semibold text-[#357FE9]">{t.name}</h4>
              <p className="text-gray-500 text-sm">{t.role}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Carousel Scroll */}
      <div className="md:hidden flex overflow-x-auto gap-4 py-4 px-2 scrollbar-hide">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 shadow-md flex-shrink-0 w-80 text-center"
          >
            <p className="italic text-gray-700 mb-4">“{t.quote}”</p>
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-r from-[#E96435] to-[#357FE9] w-10 h-10 flex items-center justify-center rounded-full text-white font-bold mb-2">
                {t.name[0]}
              </div>
              <h4 className="font-semibold text-[#357FE9]">{t.name}</h4>
              <p className="text-gray-500 text-sm">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
