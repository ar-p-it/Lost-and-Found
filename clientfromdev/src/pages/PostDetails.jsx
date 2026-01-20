import React, { useState, useEffect } from "react";
import axios from "axios";
import ClaimModal from "../components/ClaimModal";
import { MapPin, Calendar, Search, Filter, Tag } from "lucide-react";

const PostDetails = () => {
  const [selectedPost, setSelectedPost] = useState(null); // Which post is being claimed?
  
  // 1️⃣ STATE: The List of Posts (Eventually fetched from Backend)
  // 🔴 IMPORTANT: Replace '_id' with REAL MongoDB IDs when connecting to backend
  const [posts, setPosts] = useState([
    {
      _id: "678d217983196901844b2046", 
      title: "Blue Dell Laptop",
      description: "Found near the library entrance. Battery dead.",
      location: "Central Library",
      dateFound: "2026-01-18",
      category: "Electronics",
      questions: ["What is the wallpaper?", "Is there a sticker?"]
    },
    {
      _id: "678d217983196901844b2047", 
      title: "Metal Water Bottle",
      description: "Black matte finish bottle found on the basketball court bleachers.",
      location: "Sports Complex",
      dateFound: "2026-01-19",
      category: "Accessories",
      questions: ["What brand is the bottle?", "Are there any dents?"]
    },
    {
      _id: "678d217983196901844b2048", 
      title: "Car Keys (Honda)",
      description: "A set of keys with a Honda logo and a Spiderman keychain.",
      location: "Canteen Area",
      dateFound: "2026-01-20",
      category: "Keys",
      questions: ["How many keys are in the bunch?", "Color of the keychain?"]
    }
  ]);

  // 2️⃣ STATE: Track which posts *I* have claimed
  // In a real app, you fetch this from 'GET /my-claims'
  const [myClaimedIds, setMyClaimedIds] = useState([]);

  // Mock function to simulate "Withdrawing" a claim directly from the feed
  const handleWithdraw = (postId) => {
    if(window.confirm("Withdraw your claim for this item?")) {
      // In real app: await axios.delete(`/api/verification/${claimId}`)
      setMyClaimedIds(prev => prev.filter(id => id !== postId));
      alert("Claim withdrawn.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-6">
      
      {/* Search & Filter Bar (Visual Only for now) */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1 bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
          <Search className="text-gray-400" size={20} />
          <input type="text" placeholder="Search for lost items..." className="outline-none w-full text-sm" />
        </div>
        <button className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-gray-600 hover:text-blue-600">
          <Filter size={20} />
        </button>
      </div>

      {/* 3️⃣ RENDER POSTS LIST */}
      <div className="space-y-6">
        {posts.map((post) => {
          const isClaimed = myClaimedIds.includes(post._id);

          return (
            <div key={post._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide flex items-center gap-1 w-fit mb-2">
                    <Tag size={12} /> {post.category}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900">{post.title}</h2>
                </div>
                {/* Date Badge */}
                <div className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                  {post.dateFound}
                </div>
              </div>

              <p className="text-gray-600 mt-3 mb-6 text-sm leading-relaxed">
                {post.description}
              </p>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1"><MapPin size={14} className="text-blue-500"/> {post.location}</span>
                </div>

                {/* 4️⃣ DYNAMIC BUTTONS */}
                {isClaimed ? (
                  <button 
                    onClick={() => handleWithdraw(post._id)}
                    className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-lg font-bold text-xs hover:bg-red-100 transition"
                  >
                    Withdraw Claim
                  </button>
                ) : (
                  <button 
                    onClick={() => setSelectedPost(post)}
                    className="bg-gray-900 text-white px-5 py-2 rounded-lg font-bold text-xs hover:bg-black transition shadow-lg shadow-gray-200 transform hover:-translate-y-0.5"
                  >
                    Claim Item
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL (Only renders when a post is selected) */}
      {selectedPost && (
        <ClaimModal 
          postId={selectedPost._id} 
          postTitle={selectedPost.title} 
          questions={selectedPost.questions || []}
          onClose={() => setSelectedPost(null)}
          onSuccess={() => {
            // Update local state to show "Withdraw" button immediately
            setMyClaimedIds([...myClaimedIds, selectedPost._id]);
            // alert("Claim Submitted!"); // Optional alert
          }}
        />
      )}
    </div>
  );
};

export default PostDetails;