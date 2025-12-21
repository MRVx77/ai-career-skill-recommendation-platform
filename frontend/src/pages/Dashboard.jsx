import React, { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [preferredRole, setPreferredRole] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [latestRecommendation, setLatestRecommendation] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/api/recommend", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setRecommendations(res.data);
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch recommendation history");
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/api/recommend", {
        skills: skills.split(",").map((s) => s.trim()),
        interests: interests.split(",").map((i) => i.trim()),
        preferredRole,
      });

      setLatestRecommendation(res.data);
      toast.success("Recommendations generated!");
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/api/recommend/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Recommendation deleted");
      setRecommendations(recommendations.filter((rec) => rec.id !== id));
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete recommendation");
    }
  };

  const onLogout = () => {
    toast.info("Logging out...");
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-10">
      <div className="flex justify-end mb-6">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full
               bg-white/70 backdrop-blur-md border border-red-200
               text-red-600 font-semibold
               hover:bg-red-50 hover:border-red-300
               transition shadow-sm hover:cursor-pointer"
        >
          <span className="text-lg">⏻</span>
          Logout
        </button>
      </div>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-gray-800">
            Career Recommendations
          </h2>
          <p className="text-gray-500 mt-2">
            Personalized roadmap to grow your development career 🚀
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-10">
          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-3">
            <input
              type="text"
              placeholder="Skills (React, Node, SQL)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="col-span-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="text"
              placeholder="Interests (Backend, DevOps)"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="col-span-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="text"
              placeholder="Preferred Role"
              value={preferredRole}
              onChange={(e) => setPreferredRole(e.target.value)}
              className="col-span-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <button
              type="submit"
              className=" hover:cursor-pointer md:col-span-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
            >
              Generate Recommendations
            </button>
          </form>
        </div>

        {/* Latest Recommendation */}
        {latestRecommendation && (
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-10 border border-blue-100">
            <h3 className="text-2xl font-bold mb-4 text-blue-700">
              Latest Recommendation
            </h3>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Suggested Roles</p>
                <p className="font-semibold">
                  {latestRecommendation.roles.join(", ")}
                </p>
              </div>

              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Missing Skills</p>
                <p className="font-semibold">
                  {latestRecommendation.missingSkills.join(", ")}
                </p>
              </div>
            </div>

            <div>
              <p className="font-semibold mb-3">Learning Roadmap</p>
              <ol className="space-y-3">
                {latestRecommendation.roadmap.map((step, idx) => (
                  <li
                    key={idx}
                    className="flex gap-3 bg-gray-50 p-4 rounded-xl border"
                  >
                    <span className="h-7 w-7 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">
                      {idx + 1}
                    </span>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* Past Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              Past Recommendations
            </h3>

            <div className="grid gap-6">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white rounded-2xl shadow-md p-6 border hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-md font-semibold text-gray-500">
                        Role
                      </p>
                      <p className="font-semibold">{rec.recommended_roles}</p>
                    </div>

                    <button
                      onClick={() => handleDelete(rec.id)}
                      className="hover:cursor-pointer text-sm text-red-500 hover:text-red-700 font-semibold"
                    >
                      Delete
                    </button>
                  </div>

                  <p className="mb-3">
                    <span className="text-gray-500 text-md font-semibold">
                      Missing Skills:
                    </span>{" "}
                    {rec.missing_skills}
                  </p>

                  <p className="font-semibold mb-2">Roadmap</p>
                  <ol className="space-y-2">
                    {rec.roadmap
                      .split("|")
                      .map((step) => step.trim())
                      .filter(Boolean)
                      .map((step, idx) => (
                        <li
                          key={idx}
                          className="flex gap-3 bg-gray-50 p-3 rounded-lg border"
                        >
                          <span className="text-blue-600 font-bold">
                            {idx + 1}.
                          </span>
                          <p>{step}</p>
                        </li>
                      ))}
                  </ol>

                  {rec.preferred_role && (
                    <p className="mt-4 text-md font-semibold text-gray-500">
                      Preferred Role:{" "}
                      <span className="font-semibold text-gray-700">
                        {rec.preferred_role}
                      </span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
