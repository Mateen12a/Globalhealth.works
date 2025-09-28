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
    <section className="bg-gray-50 py-16 px-6">
      <h2 className="text-3xl font-bold text-center text-[#1E376E] mb-12">
        What Our Users Say
      </h2>
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="bg-white shadow-md rounded-xl p-6 text-center hover:shadow-lg transition"
          >
            <p className="italic text-gray-600">“{t.quote}”</p>
            <h4 className="mt-4 font-semibold text-[#357FE9]">{t.name}</h4>
            <p className="text-xs text-gray-500">{t.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
