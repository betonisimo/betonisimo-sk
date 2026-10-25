"use client";

import { useEffect, useState } from "react";
import { approveReview, deleteReview, getReviewsAction } from "@/actions/reviewActions";
import { Trash2, Check, Clock, Star, MessageSquare, ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getReviewsAction()
      .then((data) => { if (active) setReviews(data || []); })
      .catch((error) => { if (active) console.error("Failed to load reviews:", error); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleApprove = async (id) => {
    const res = await approveReview(id);
    if (res?.success) {
      setReviews(prev => 
        prev.map(rev => rev.id === id ? { ...rev, status: 'APPROVED' } : rev)
      );
    } else {
      alert("Chyba pri schvaľovaní.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Naozaj vymazať túto recenziu?")) {
      const res = await deleteReview(id);
      if (res?.success) {
        setReviews(prev => prev.filter(rev => rev.id !== id));
      } else {
        alert("Chyba pri mazaní.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-[#f8fafc]">
        <Loader2 className="animate-spin text-[#dc2626]" size={48} strokeWidth={3} />
        <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">System_Loading...</p>
      </div>
    );
  }

  const pCount = reviews.filter(r => r.status === 'PENDING').length;
  const aCount = reviews.filter(r => r.status === 'APPROVED').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-32 pb-20 px-6 md:px-12 font-sans text-slate-900">
      <div className="max-w-[1400px] mx-auto">
        
        {/* BACK TO ADMIN */}
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-[#dc2626] mb-12 transition-all duration-500 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> 
          Späť do administrácie
        </Link>

        {/* HEADER & STATS */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16 border-l-4 border-[#dc2626] pl-6 md:pl-8">
          <div>
            <p className="text-[#dc2626] font-black uppercase tracking-[0.5em] text-[10px] mb-4">Feedback_Control_Unit</p>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85]">
              Moderácia <br />
              <span className="text-slate-300">Recenzií</span>
            </h1>
          </div>

          <div className="flex gap-4">
            <div className="bg-white p-6 rounded-[2px] shadow-lg flex items-center gap-6 min-w-[220px]">
              <div className="w-12 h-12 bg-amber-50 text-amber-500 flex items-center justify-center rounded-[2px]">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Čakajúce</p>
                <p className="text-3xl font-black leading-none mt-1">{pCount}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-[2px] shadow-lg flex items-center gap-6 min-w-[220px]">
              <div className="w-12 h-12 bg-green-50 text-green-500 flex items-center justify-center rounded-[2px]">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Schválené</p>
                <p className="text-3xl font-black leading-none mt-1">{aCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* LIST */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="bg-white rounded-[2px] py-32 text-center shadow-sm">
              <MessageSquare className="mx-auto text-slate-100 mb-6" size={64} />
              <p className="text-slate-300 font-black uppercase tracking-[0.4em] text-[10px]">No_Data_Available</p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div 
                key={rev.id}
                className={`group bg-white rounded-[2px] shadow-md hover:shadow-2xl transition-all duration-[800ms] overflow-hidden relative ${
                  rev.status === 'PENDING' ? 'border-l-4 border-amber-400' : 'border-l-4 border-slate-900'
                }`}
              >
                <div className="p-8 md:p-10 flex flex-col lg:flex-row gap-10 items-start">
                  
                  {/* USER INFO */}
                  <div className="flex lg:flex-col items-center lg:items-start gap-6 shrink-0 w-full lg:w-48">
                    <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center text-3xl font-black rounded-[2px] shadow-xl group-hover:bg-[#dc2626] transition-colors duration-700">
                      {rev.author ? rev.author[0].toUpperCase() : "?"}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 uppercase tracking-tighter text-xl leading-none">{rev.author || "Anonym"}</h4>
                      <p className="text-[9px] font-black text-[#dc2626] uppercase tracking-widest mt-2">Verified_User</p>
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1 min-w-0 w-full space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            fill={i < rev.rating ? "currentColor" : "none"}
                            className={i < rev.rating ? "text-amber-400" : "text-slate-100"} 
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">
                        {"// Log_Date: "}{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('sk-SK') : "---"}
                      </span>
                    </div>
                    
                    <p className="text-slate-700 text-xl md:text-2xl leading-relaxed italic font-medium pr-10">
                      &quot;{rev.text}&quot;
                    </p>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-56 pt-8 lg:pt-0 border-t lg:border-t-0 border-slate-50">
                    {rev.status === 'PENDING' ? (
                      <button 
                        onClick={() => handleApprove(rev.id)}
                        className="flex-1 flex items-center justify-center gap-3 bg-slate-900 text-white px-6 py-4 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-green-600 transition-all duration-500 rounded-[2px] shadow-lg active:scale-95"
                      >
                        <Check size={16} /> Schváliť
                      </button>
                    ) : (
                      <div className="flex-1 flex items-center justify-center gap-3 bg-slate-50 text-green-600 border border-green-100 px-6 py-4 font-black uppercase text-[10px] tracking-[0.2em] rounded-[2px] cursor-default">
                        <ShieldCheck size={16} /> Publikované
                      </div>
                    )}
                    
                    <button 
                      onClick={() => handleDelete(rev.id)}
                      className="flex-1 flex items-center justify-center gap-3 text-slate-400 hover:text-white hover:bg-[#dc2626] px-6 py-4 font-black uppercase text-[10px] tracking-[0.2em] transition-all duration-500 rounded-[2px]"
                    >
                      <Trash2 size={16} /> Zmazať
                    </button>
                  </div>
                </div>

                {/* BOTTOM PROGRESS LINE */}
                <span className={`absolute bottom-0 left-0 h-[3px] w-0 transition-all duration-[800ms] ease-out group-hover:w-full ${
                  rev.status === 'PENDING' ? 'bg-amber-400' : 'bg-[#dc2626]'
                }`}></span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
