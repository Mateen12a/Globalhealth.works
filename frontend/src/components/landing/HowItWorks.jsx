// src/components/landing/HowItWorks.jsx
export default function HowItWorks() {
  const steps = [
    { title: "1. Sign Up", desc: "Choose your role: Task Owner or Solution Provider." },
    { title: "2. Create / Apply", desc: "Owners post structured tasks. Providers apply with skills & focus areas." },
    { title: "3. Match & Collaborate", desc: "Smart matching connects the right providers to the right tasks." },
    { title: "4. Deliver & Feedback", desc: "Work is delivered, feedback collected, and impact measured." },
  ];

  return (
    <section className="bg-white py-16 px-6">
      <h2 className="text-3xl font-bold text-center text-[#1E376E] mb-12">
        How It Works
      </h2>
      <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {steps.map((step, i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-6 shadow-sm text-center hover:shadow-md transition">
            <div className="text-[#E96435] text-xl font-bold">{step.title}</div>
            <p className="mt-3 text-gray-600 text-sm">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
