import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  Facebook, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Compass, 
  Camera, 
  X, 
  Flame, 
  Leaf, 
  Trophy,
  CheckCircle2,
  Search,
  Users,
  MessageSquare,
  Send
} from 'lucide-react';
import { Student, ChatMessage } from '../types';
import { db, addChatMessage } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

interface CommunityProps {
  students: Student[];
  communityTitle?: string;
  communitySubtitle?: string;
  currentUser: Student | null;
}

export default function Community({ students, communityTitle, communitySubtitle, currentUser }: CommunityProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'cr' | 'chat'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'chat'), orderBy('timestamp', 'asc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      setChatMessages(msgs);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;
    
    const messageToSend = {
      senderName: currentUser.name,
      senderRoll: currentUser.rollNumber,
      senderPhoto: currentUser.photoUrl,
      senderId: currentUser.id,
      message: newMessage.trim(),
      timestamp: Date.now()
    };
    
    setNewMessage('');
    try {
      await addChatMessage(messageToSend);
    } catch (err) {
      console.error("Failed to post message:", err);
    }
  };

  return (
    <section 
      id="community" 
      className="relative w-full py-24 md:py-36 bg-[#0B0B0B] text-[#F5F2EE] px-6 md:px-12 border-b border-[#C79A6B]/15 overflow-hidden"
    >
      {/* Background radial accent to give luxury feel */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C79A6B]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#1F3D2B]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto space-y-24">
        
        {/* Editorial Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-mono tracking-[0.4em] text-[#C79A6B] uppercase font-bold flex items-center gap-2">
              <Leaf className="w-3.5 h-3.5 text-[#C79A6B] animate-pulse" />
              — COLLECTIVE ENDEAVOR
            </span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light leading-tight text-[#F5F2EE] tracking-tight">
              {communityTitle || "Botany Community"}
            </h2>
          </div>
          <div className="lg:col-span-6 text-sm md:text-base text-[#F5F2EE]/70 font-light leading-relaxed lg:pt-6 space-y-4">
            <p>
              {communitySubtitle || "Meet the students, contributors, explorers, and the growing botanical community of the Department of Botany."}
            </p>
            <div className="w-24 h-[1px] bg-[#C79A6B]/30" />
          </div>
        </div>



        {/* Academic Cohort Registry */}
        <div className="space-y-8 pt-12 border-t border-[#C79A6B]/15">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 text-left">
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#C79A6B] uppercase font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                — Academic Cohort Directory
              </span>
              <h3 className="font-serif text-2xl md:text-3xl tracking-wider text-[#F5F2EE] font-light">
                Departmental <span className="font-serif italic text-[#C79A6B]">Student Registry</span>
              </h3>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-3.5 h-3.5 text-[#C79A6B]/50" />
              </span>
              <input
                type="text"
                placeholder="Search by name or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111111] border border-[#C79A6B]/20 rounded-xs pl-9 pr-4 py-2.5 text-xs text-[#F5F2EE] placeholder-[#F5F2EE]/45 outline-none focus:border-[#C79A6B]/60 transition-all font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#F5F2EE]/40 hover:text-[#C79A6B] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Tab Switchers */}
          <div className="flex border-b border-[#C79A6B]/15 pb-px gap-6">
            <button
              onClick={() => { setActiveTab('all'); setSearchQuery(''); }}
              className={`pb-3 px-1 text-xs font-mono uppercase tracking-wider relative transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'all' 
                  ? 'text-[#C79A6B] font-bold' 
                  : 'text-[#F5F2EE]/55 hover:text-[#C79A6B]/80'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              All Students ({students.filter(s => s.status !== 'Inactive').length})
              {activeTab === 'all' && (
                <motion.div 
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C79A6B]" 
                />
              )}
            </button>

            <button
              onClick={() => { setActiveTab('cr'); setSearchQuery(''); }}
              className={`pb-3 px-1 text-xs font-mono uppercase tracking-wider relative transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'cr' 
                  ? 'text-[#C79A6B] font-bold' 
                  : 'text-[#F5F2EE]/55 hover:text-[#C79A6B]/80'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              CR Section ({students.filter(s => s.role === 'CR' && s.status !== 'Inactive').length})
              {activeTab === 'cr' && (
                <motion.div 
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C79A6B]" 
                />
              )}
            </button>

            <button
              onClick={() => { setActiveTab('chat'); setSearchQuery(''); }}
              className={`pb-3 px-1 text-xs font-mono uppercase tracking-wider relative transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'chat' 
                  ? 'text-[#C79A6B] font-bold' 
                  : 'text-[#F5F2EE]/55 hover:text-[#C79A6B]/80'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Community Discussion ({chatMessages.length})
              {activeTab === 'chat' && (
                <motion.div 
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C79A6B]" 
                />
              )}
            </button>
          </div>

          {/* Students Grid / Chat View */}
          {(() => {
            if (activeTab === 'chat') {
              return (
                <div className="border border-[#C79A6B]/20 rounded-xs bg-[#111111]/40 flex flex-col h-[550px] relative overflow-hidden backdrop-blur-md">
                  {/* Chat Info Header */}
                  <div className="px-6 py-4 bg-[#0B0B0B]/80 border-b border-[#C79A6B]/15 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <div>
                        <h4 className="font-serif text-sm font-medium text-white">Botanical Cohort Channel</h4>
                        <p className="text-[9px] font-mono text-[#8F6A48] uppercase tracking-widest mt-0.5">Real-time Peer Discussion Forum</p>
                      </div>
                    </div>
                    {currentUser && (
                      <span className="text-[10px] font-mono text-[#C79A6B]">
                        Logged in as: <span className="font-bold underline">{currentUser.name} ({currentUser.rollNumber})</span>
                      </span>
                    )}
                  </div>

                  {/* Message Logs */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 font-sans text-left">
                    {chatMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                        <MessageSquare className="w-8 h-8 text-[#C79A6B] mb-2 animate-bounce" />
                        <p className="text-xs font-mono text-[#8F6A48]">Welcome to the Botany Discussion Board!</p>
                        <p className="text-[10px] text-[#F5F2EE]/50">Start typing below to interact with your peers.</p>
                      </div>
                    ) : (
                      chatMessages.map((msg) => {
                        const isOwn = msg.senderId === currentUser?.id;
                        return (
                          <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isOwn ? 'ml-auto flex-row-reverse' : ''}`}>
                            <img
                              src={msg.senderPhoto}
                              alt={msg.senderName}
                              className="w-8 h-8 rounded-full object-cover border border-[#C79A6B]/30 mt-0.5 flex-shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="space-y-1">
                              <div className={`flex items-center gap-2 text-[9px] font-mono uppercase ${isOwn ? 'justify-end' : ''}`}>
                                <span className="text-[#C79A6B] font-bold">{msg.senderName}</span>
                                <span className="text-[#8F6A48]">Roll: {msg.senderRoll}</span>
                                <span className="text-[#F5F2EE]/40 text-[8px]">
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className={`p-3 text-xs leading-relaxed rounded-xs ${
                                isOwn 
                                  ? 'bg-[#C79A6B]/10 border border-[#C79A6B]/35 text-white' 
                                  : 'bg-[#1a1a1a] border border-[#C79A6B]/10 text-[#F5F2EE]/90'
                              }`}>
                                <p className="whitespace-pre-wrap">{msg.message}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input Form Bar */}
                  <form onSubmit={handleSendMessage} className="p-4 bg-[#0B0B0B]/90 border-t border-[#C79A6B]/15 flex gap-3">
                    <input
                      type="text"
                      placeholder={currentUser ? "Type a message..." : "Please log in to chat."}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={!currentUser}
                      className="flex-1 bg-[#111111] border border-[#C79A6B]/20 rounded-xs px-4 py-3 text-xs text-white placeholder-gray-500 focus:border-[#C79A6B]/60 outline-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!currentUser || !newMessage.trim()}
                      className="px-5 py-3 bg-[#C79A6B] disabled:bg-gray-800 disabled:text-gray-500 disabled:border-transparent text-black text-xs font-mono uppercase font-bold rounded-xs flex items-center gap-2 cursor-pointer hover:bg-[#b08456] transition-colors"
                    >
                      <span>Send</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              );
            }

            const filteredStudents = students.filter(student => {
              if (student.status === 'Inactive') return false;
              const matchesTab = activeTab === 'all' || student.role === 'CR';
              const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    (student.studentId && student.studentId.toLowerCase().includes(searchQuery.toLowerCase()));
              return matchesTab && matchesSearch;
            });

            if (filteredStudents.length > 0) {
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredStudents.map((student) => (
                    <motion.div
                      key={student.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      onClick={() => setSelectedStudent(student)}
                      className="group cursor-pointer relative bg-gradient-to-b from-[#111111] to-[#0D0D0D] border border-[#C79A6B]/20 hover:border-[#C79A6B]/50 rounded-xs p-5 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
                    >
                      {/* Subtly glow background on hover */}
                      <div className="absolute -inset-px bg-gradient-to-r from-transparent via-[#C79A6B]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                      <div className="space-y-4">
                        {/* Profile Photo & Title details */}
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full border border-[#C79A6B]/20 overflow-hidden bg-[#0B0B0B] flex-shrink-0 group-hover:border-[#C79A6B]/50 transition-colors">
                            <img 
                              src={student.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'} 
                              alt={student.name} 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="text-left">
                            <h4 className="font-serif text-sm text-[#F5F2EE] group-hover:text-[#C79A6B] transition-colors font-medium leading-tight">
                              {student.name}
                            </h4>
                            <p className="text-[9px] font-mono text-[#8F6A48] uppercase tracking-wider mt-0.5">
                              Roll: {student.rollNumber}
                            </p>
                          </div>
                        </div>

                        {/* Metadata Details */}
                        <div className="text-left space-y-1.5 border-t border-[#C79A6B]/10 pt-3">
                          <div className="flex justify-between text-[10px] font-mono text-[#F5F2EE]/50">
                            <span>Batch:</span>
                            <span className="text-[#F5F2EE]/75">{student.batch}</span>
                          </div>
                          <div className="flex justify-between text-[10px] font-mono text-[#F5F2EE]/50">
                            <span>Session:</span>
                            <span className="text-[#F5F2EE]/75">{student.session}</span>
                          </div>
                          {student.contributions !== undefined && (
                            <div className="flex justify-between text-[10px] font-mono text-[#F5F2EE]/50">
                              <span>Specimens Uploaded:</span>
                              <span className="text-[#C79A6B] font-bold">{student.contributions}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Badge of Card */}
                      <div className="flex items-center justify-between mt-5 pt-3 border-t border-[#C79A6B]/10">
                        {student.role === 'CR' ? (
                          <span className="text-[8.5px] font-mono tracking-widest text-[#C79A6B] uppercase bg-[#C79A6B]/10 border border-[#C79A6B]/20 px-2 py-0.5 rounded-full font-bold">
                            Class Rep
                          </span>
                        ) : (
                          <span className="text-[8.5px] font-mono tracking-widest text-[#8F6A48] uppercase bg-[#8F6A48]/5 border border-[#8F6A48]/10 px-2 py-0.5 rounded-full">
                            Student
                          </span>
                        )}
                        <span className="text-[9.5px] font-mono text-[#C79A6B] group-hover:underline flex items-center gap-1">
                          View Dossier →
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              );
            } else {
              return (
                <div className="text-center py-12 border border-dashed border-[#C79A6B]/20 rounded-xs bg-[#111111]/30">
                  <Users className="w-8 h-8 text-[#8F6A48]/50 mx-auto mb-3" />
                  <p className="text-xs font-mono text-[#8F6A48]/80">No students found matching your criteria.</p>
                </div>
              );
            }
          })()}
        </div>
        <AnimatePresence>
          {selectedStudent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0B0B]/97 backdrop-blur-md overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, y: 25 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 25 }}
                className="relative max-w-3xl w-full bg-[#111111] border border-[#C79A6B]/30 rounded-xs shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
              >
                
                {/* Cover Photo */}
                <div className="relative h-[200px] w-full bg-[#0B0B0B]">
                  <img
                    src={selectedStudent.coverUrl || 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=1200'}
                    alt="Botany Cover"
                    className="w-full h-full object-cover opacity-45"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111111] to-transparent" />
                  
                  {/* Close button floating on cover */}
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="absolute top-6 right-6 p-2 rounded-full bg-[#0B0B0B]/80 border border-[#C79A6B]/20 text-[#C79A6B] hover:text-[#F5F2EE] hover:border-[#C79A6B] transition-colors cursor-pointer z-20"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-4 left-8 flex items-center gap-2 text-[9px] font-mono text-[#C79A6B] bg-[#0B0B0B]/80 border border-[#C79A6B]/20 px-3 py-1 rounded-full uppercase">
                    <Sparkles className="w-3 h-3 text-[#C79A6B] animate-pulse" />
                    <span>Dossier: Verified Botany Registry</span>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="px-8 md:px-12 pb-12 relative -mt-12 space-y-8">
                  
                  {/* Profile Image & Essential Details Header */}
                  <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-end border-b border-[#C79A6B]/15 pb-6">
                    
                    {/* Avatar Frame with custom glow */}
                    <div className="w-28 h-28 rounded-full border-2 border-[#C79A6B] overflow-hidden flex-shrink-0 bg-[#0B0B0B] shadow-2xl relative group">
                      <img
                        src={selectedStudent.photoUrl}
                        alt={selectedStudent.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Text Identifiers */}
                    <div className="text-center sm:text-left space-y-2 flex-grow">
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                        <span className="px-3 py-0.5 rounded-full border border-[#C79A6B]/30 bg-[#0B0B0B] text-[8.5px] font-mono tracking-widest text-[#C79A6B] uppercase font-bold">
                          {selectedStudent.badge}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full border border-[#1F3D2B]/40 bg-[#1F3D2B]/30 text-[8.5px] font-mono tracking-wider text-[#C79A6B] uppercase">
                          {selectedStudent.batch || '21st Batch'}
                        </span>
                      </div>

                      <h3 className="font-serif text-3xl md:text-4xl font-light text-[#F5F2EE]">
                        {selectedStudent.name}
                      </h3>

                      <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-[10px] font-mono text-[#8F6A48]/90 uppercase">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#C79A6B]" /> Roll: {selectedStudent.rollNumber || 'N/A'}
                        </span>
                        <span>•</span>
                        <span>Reg: {selectedStudent.registrationNumber || selectedStudent.studentId}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#C79A6B]" /> Session: {selectedStudent.session}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* About Block */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    
                    {/* Left Column: About & Achievements */}
                    <div className="md:col-span-8 space-y-6">
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono tracking-[0.2em] text-[#C79A6B] uppercase block font-semibold">
                          — INVESTIGATIVE BIOGRAPHY / ABOUT
                        </span>
                        <p className="text-xs md:text-sm text-[#F5F2EE]/80 font-light leading-relaxed">
                          {selectedStudent.bio}
                        </p>
                      </div>

                      {/* Contribution metrics details */}
                      <div className="space-y-4 bg-[#0B0B0B]/80 border border-[#C79A6B]/15 p-6 rounded-xs">
                        <span className="text-[9px] font-mono tracking-[0.15em] text-[#C79A6B] uppercase block font-bold">
                          Contribution Metrics
                        </span>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div className="border border-[#C79A6B]/10 p-3 rounded text-center">
                            <span className="text-[9px] text-[#8F6A48] font-mono block">PLANTS</span>
                            <span className="text-xl font-serif text-[#C79A6B]">{selectedStudent.uploadedPlants || selectedStudent.contributions - 10 || 8}</span>
                          </div>
                          <div className="border border-[#C79A6B]/10 p-3 rounded text-center">
                            <span className="text-[9px] text-[#8F6A48] font-mono block">GALLERY</span>
                            <span className="text-xl font-serif text-[#C79A6B]">{selectedStudent.uploadedGalleryImages || 12}</span>
                          </div>
                          <div className="border border-[#C79A6B]/10 p-3 rounded text-center">
                            <span className="text-[9px] text-[#8F6A48] font-mono block">METRIC RATE</span>
                            <span className="text-xl font-serif text-[#C79A6B]">{selectedStudent.contributions}%</span>
                          </div>
                        </div>

                        {/* visual progress indicator bar */}
                        <div className="space-y-1 pt-2">
                          <div className="flex justify-between text-[8px] font-mono text-[#8F6A48]">
                            <span>CURATORIAL MILESTONE PROGRESS</span>
                            <span>{selectedStudent.contributions} / 30 SPECS</span>
                          </div>
                          <div className="w-full h-1 bg-[#111111] rounded-full overflow-hidden border border-[#C79A6B]/10">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, (selectedStudent.contributions / 30) * 100)}%` }}
                              transition={{ duration: 1.2, ease: 'easeOut' }}
                              className="h-full bg-gradient-to-r from-[#8F6A48] to-[#C79A6B]" 
                            />
                          </div>
                        </div>
                      </div>

                      {/* Achievements Block */}
                      <div className="space-y-3">
                        <span className="text-[9px] font-mono tracking-[0.2em] text-[#C79A6B] uppercase block font-semibold">
                          — MERITORIOUS HONORS & ACHIEVEMENTS
                        </span>
                        <div className="space-y-2">
                          {(selectedStudent.achievements || ['Best Core Explorer Award', 'Outstanding Herbarium Presentation']).map((ach, i) => (
                            <div key={ach} className="flex items-start gap-2.5 text-xs text-[#F5F2EE]/75 font-light">
                              <CheckCircle2 className="w-4 h-4 text-[#C79A6B] flex-shrink-0 mt-0.5" />
                              <span>{ach}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Right Column: Skills, Interests & Badges */}
                    <div className="md:col-span-4 space-y-6">
                      
                      {/* Skills */}
                      <div className="space-y-3">
                        <span className="text-[9px] font-mono tracking-[0.15em] text-[#C79A6B] uppercase block font-bold">
                          Technical Skills
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {selectedStudent.skills.map((skill) => (
                            <span key={skill} className="px-2.5 py-1 bg-[#0B0B0B] border border-[#C79A6B]/10 rounded text-[10px] font-mono text-[#8F6A48] block">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Interests */}
                      <div className="space-y-3">
                        <span className="text-[9px] font-mono tracking-[0.15em] text-[#C79A6B] uppercase block font-bold">
                          Research Focus
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {selectedStudent.interests.map((interest) => (
                            <span key={interest} className="px-2.5 py-1 bg-[#0B0B0B] border border-[#8F6A48]/15 rounded text-[10px] font-serif text-[#C79A6B] block">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Custom Badges earned */}
                      <div className="space-y-3">
                        <span className="text-[9px] font-mono tracking-[0.15em] text-[#C79A6B] uppercase block font-bold">
                          Earned Badges
                        </span>
                        <div className="flex flex-col gap-2">
                          {(selectedStudent.badges || ['Field Champion', 'Taxonomy Scholar', 'Visual Archivist']).map((bg) => (
                            <div key={bg} className="px-3 py-1.5 bg-[#1F3D2B]/20 border border-[#C79A6B]/20 rounded flex items-center gap-2">
                              <Award className="w-3.5 h-3.5 text-[#C79A6B]" />
                              <span className="text-[9.5px] font-mono text-[#C79A6B] uppercase font-bold tracking-wider">{bg}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Footer Connection */}
                  <div className="border-t border-[#C79A6B]/15 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
                    <span className="text-[#8F6A48]">DEPARTMENT OF BOTANY RECOGNITION</span>
                    {selectedStudent.fbUrl && (
                      <a
                        href={selectedStudent.fbUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-[#111111] border border-[#C79A6B]/30 hover:border-[#C79A6B] text-[#C79A6B] hover:text-[#F5F2EE] font-mono text-[10px] tracking-widest uppercase flex items-center gap-2 rounded-xs transition-colors cursor-pointer"
                      >
                        <Facebook className="w-4 h-4" />
                        <span>Connect on Facebook</span>
                      </a>
                    )}
                  </div>

                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
