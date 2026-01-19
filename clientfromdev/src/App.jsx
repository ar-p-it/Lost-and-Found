function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* 🔹 Navbar (ALWAYS ON TOP, NOT AFFECTED BY VIDEO) */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-4 bg-gray-950">
        <div className="text-2xl font-bold flex items-center gap-2">
          🔍 <span>Lost & Found</span>
        </div>

        <div className="flex gap-4">
          <button className="text-sm hover:text-gray-300">Login</button>
          <button className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition">
            Sign Up
          </button>
        </div>
      </nav>

      {/* 🔹 Hero Section (VIDEO BACKGROUND STARTS HERE) */}
      <section className="relative h-[calc(100vh-72px)] flex items-center justify-center overflow-hidden">
        {/* 🎥 Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          // className="absolute inset-0 w-full h-full object-cover opacity-40"
          className="absolute inset-0 m-auto w-[90%] h-[100%] object-cover opacity-85"

        >
          <source src="v1.mp4" type="video/mp4" />
        </video>

        {/* 🌑 Dark Overlay for Better Text Visibility */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* 🔹 Foreground Content */}
        {/* <div className="relative z-10 text-center px-6 max-w-3xl ">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            Lost & Found
          </h1>

          <p className="text-lg md:text-xl text-gray-200 mb-10">
            A community-powered platform to report, track, and recover lost
            items across trusted local hubs.
          </p>

          <div className="flex justify-center gap-6">
            <button className="px-8 py-3 bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition">
              Report Lost
            </button>
            <button className="px-8 py-3 bg-orange-600 rounded-lg font-semibold hover:bg-orange-700 transition">
              Report Found
            </button>
          </div>
        </div> */}
        <div className="relative z-10 text-center px-6 max-w-3xl mt-auto pb-10">
  <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
    Lost & Found
  </h1>

  <p className="text-lg md:text-xl text-gray-200 mb-10">
    A community-powered platform to report, track, and recover lost
    items across trusted local hubs.
  </p>

  <div className="flex justify-center gap-6">
    <button className="px-8 py-3 bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition">
      Report Lost
    </button>
    <button className="px-8 py-3 bg-orange-600 rounded-lg font-semibold hover:bg-orange-700 transition">
      Report Found
    </button>
  </div>
</div>

      </section>
    </div>
  );
}

export default App;
