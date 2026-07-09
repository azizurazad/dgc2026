import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, Users, Leaf, Image, FileText, Heart, Settings as SettingsIcon,
  Plus, Edit2, Trash2, Save, X, RefreshCw, Upload, Check, AlertTriangle,
  Award, Trophy, Search, ShieldCheck, Calendar, MapPin, Clock, Video, UserCheck
} from 'lucide-react';
import { Plant, Student, GalleryItem, AcademicNote, Contributor, AppStats, DepartmentEvent } from '../types';

interface AdminPanelProps {
  stats: AppStats;
  onUpdateStats: (stats: AppStats) => void;
  
  plants: Plant[];
  onAddPlant: (plant: Plant) => void;
  onEditPlant: (plant: Plant) => void;
  onDeletePlant: (id: string) => void;
  
  students: Student[];
  onAddStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;

  gallery: GalleryItem[];
  onAddGallery: (item: GalleryItem) => void;
  onEditGallery: (item: GalleryItem) => void;
  onDeleteGallery: (id: string) => void;

  events: DepartmentEvent[];
  onAddEvent: (event: DepartmentEvent) => void;
  onEditEvent: (event: DepartmentEvent) => void;
  onDeleteEvent: (id: string) => void;

  academicNotes: AcademicNote[];
  onAddAcademicNote: (note: AcademicNote) => void;
  onEditAcademicNote: (note: AcademicNote) => void;
  onDeleteAcademicNote: (id: string) => void;

  contributors: Contributor[];
  onAddContributor: (cont: Contributor) => void;
  onEditContributor: (cont: Contributor) => void;
  onDeleteContributor: (id: string) => void;

  sessionYear: string;
  onUpdateSessionYear: (year: string) => void;

  communityTitle: string;
  onUpdateCommunityTitle: (title: string) => void;
  communitySubtitle: string;
  onUpdateCommunitySubtitle: (subtitle: string) => void;
  heroBgImage: string;
  onUpdateHeroBgImage: (url: string) => void;
  heroBgBrightness: number;
  onUpdateHeroBgBrightness: (val: number) => void;
  heroBgBlur: number;
  onUpdateHeroBgBlur: (val: number) => void;
  onLogout: () => void;
  
  userRole?: 'Admin' | 'CR' | 'super_admin';
  currentUser?: Student | null;
}

type AdminModule = 'dashboard' | 'plants' | 'community' | 'events' | 'resources' | 'settings';

export default function AdminPanel({
  stats, onUpdateStats,
  plants, onAddPlant, onEditPlant, onDeletePlant,
  students, onAddStudent, onEditStudent, onDeleteStudent,
  gallery, onAddGallery, onEditGallery, onDeleteGallery,
  events, onAddEvent, onEditEvent, onDeleteEvent,
  academicNotes, onAddAcademicNote, onEditAcademicNote, onDeleteAcademicNote,
  contributors, onAddContributor, onEditContributor, onDeleteContributor,
  sessionYear, onUpdateSessionYear,
  communityTitle, onUpdateCommunityTitle, communitySubtitle, onUpdateCommunitySubtitle,
  heroBgImage, onUpdateHeroBgImage,
  heroBgBrightness, onUpdateHeroBgBrightness,
  heroBgBlur, onUpdateHeroBgBlur,
  onLogout,
  userRole = 'Admin',
  currentUser = null
}: AdminPanelProps) {
  const [activeModule, setActiveModule] = useState<AdminModule>('dashboard');
  const [communityTab, setCommunityTab] = useState<'student' | 'contributor' | 'achievement' | 'settings'>('student');
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [adminNoteSearch, setAdminNoteSearch] = useState('');

  // Portal Student Search, Filter, and Bulk states
  const [studentSearch, setStudentSearch] = useState('');
  const [studentRoleFilter, setStudentRoleFilter] = useState<'all' | 'Student' | 'CR'>('all');
  const [studentStatusFilter, setStudentStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // Forms mapping templates
  const [plantForm, setPlantForm] = useState<Partial<Plant>>({});
  const [studentForm, setStudentForm] = useState<Partial<Student>>({});
  const [galleryForm, setGalleryForm] = useState<Partial<GalleryItem>>({});
  const [eventForm, setEventForm] = useState<Partial<DepartmentEvent>>({});
  const [noteForm, setNoteForm] = useState<Partial<AcademicNote>>({});
  const [contributorForm, setContributorForm] = useState<Partial<Contributor>>({});
  
  // Custom state for safe modal-based mentor deletion confirmation (bypasses iframe native confirm issues)
  const [deleteConfirmMentor, setDeleteConfirmMentor] = useState<Contributor | null>(null);
  
  const [participantStudentInput, setParticipantStudentInput] = useState('');
  const [participantTeacherInput, setParticipantTeacherInput] = useState('');
  const [participantGuestInput, setParticipantGuestInput] = useState('');
  const [coverDragActive, setCoverDragActive] = useState(false);
  const [galleryDragActive, setGalleryDragActive] = useState(false);
  
  // Custom states for achievement management tab
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [newAchievement, setNewAchievement] = useState<string>('');
  const [newBadge, setNewBadge] = useState<string>('');
  
  const handleCoverUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      triggerAlert('Please select an image file (PNG, JPG, etc.)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        setEventForm(prev => ({ ...prev, coverImage: e.target.result }));
        triggerAlert('Cover image loaded successfully');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAdditionalImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      triggerAlert('Please select an image file (PNG, JPG, etc.)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        const loaded = e.target.result;
        setEventForm(prev => {
          const currentImages = prev.additionalImages || [];
          return { ...prev, additionalImages: [...currentImages, loaded] };
        });
        triggerAlert('Gallery image added to draft');
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerAlert = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const [dragActive, setDragActive] = useState(false);

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      triggerAlert('Please select an image file (PNG, JPG, etc.)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        onUpdateHeroBgImage(e.target.result);
        triggerAlert('Custom background loaded successfully', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const rawMenuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'plants', name: 'Plant Archive', icon: Leaf },
    { id: 'community', name: 'Community', icon: Users },
    { id: 'events', name: 'Department Events', icon: Image },
    { id: 'resources', name: 'Academic Notes', icon: FileText },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
  ] as const;

  const menuItems = rawMenuItems.filter(item => {
    if (userRole === 'CR') {
      return item.id !== 'community' && item.id !== 'settings';
    }
    return true;
  });

  // Render alerts
  const renderAlert = () => (
    <AnimatePresence>
      {alertMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-24 right-12 z-55 flex items-center gap-2 px-5 py-3 border bg-[#111111] text-xs font-mono rounded shadow-2xl ${
            alertMsg.type === 'error'
              ? 'border-red-500/50 text-red-400'
              : 'border-[#C79A6B] text-[#C79A6B]'
          }`}
        >
          {alertMsg.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          ) : (
            <Check className="w-4 h-4 text-emerald-500" />
          )}
          {alertMsg.text}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="w-full min-h-screen bg-[#0B0B0B] text-[#F5F2EE] pt-28 px-6 md:px-12 pb-16 flex flex-col lg:flex-row gap-8">
      {renderAlert()}

      {/* LEFT: Dashboard Glass sidebar */}
      <div className="w-full lg:w-64 bg-[#111111]/90 border border-[#C79A6B]/20 rounded p-6 flex flex-col justify-between space-y-8 flex-shrink-0 h-fit backdrop-blur">
        <div className="space-y-6">
          <div className="border-b border-[#C79A6B]/15 pb-4">
            <h3 className="font-serif text-[#C79A6B] text-lg tracking-wider uppercase font-medium">
              Nexus <span className="italic">Admin</span>
            </h3>
            <p className="text-[9px] font-mono tracking-widest text-[#8F6A48]/75 uppercase">Curator Suite v1.2</p>
          </div>

          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveModule(item.id);
                    setEditingId(null);
                    setIsAddingNew(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded text-xs font-mono tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                    activeModule === item.id 
                      ? 'border border-[#C79A6B]/30 bg-[#C79A6B]/10 text-[#C79A6B] font-semibold' 
                      : 'text-[#F5F2EE]/60 hover:text-[#C79A6B] hover:bg-[#111111]/50 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-[#C79A6B]/10 pt-4 text-[9px] font-mono text-[#8F6A48] space-y-3.5">
          <div>
            <span>Security Protocol: active</span>
            <span className="block mt-0.5">Session: {sessionYear}</span>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-2.5 border border-red-900/30 hover:border-red-500 bg-red-950/10 hover:bg-red-950/30 text-red-400 font-mono text-[9px] tracking-wider uppercase rounded transition-all cursor-pointer text-center block font-semibold"
          >
            {userRole === 'CR' ? 'Exit CR Workspace' : 'Log Out & Lock'}
          </button>
        </div>
      </div>

      {/* RIGHT: Active Module Workspace panel */}
      <div className="flex-grow bg-[#111111]/70 border border-[#C79A6B]/15 rounded p-6 md:p-10 backdrop-blur min-h-[600px]">
        
        {/* ==================================================
            MODULE: DASHBOARD OVERVIEW
            ================================================== */}
        {activeModule === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            <div className="border-b border-[#C79A6B]/15 pb-4">
              <h2 className="font-serif text-3xl font-light text-[#F5F2EE]">
                Curation <span className="font-serif italic text-[#C79A6B]">Metrics Overview</span>
              </h2>
              <p className="text-xs font-mono text-[#8F6A48] tracking-widest uppercase mt-1">
                Database synchronization indicators & metrics
              </p>
            </div>

            {/* Quick counters & stat adjustments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Plant Archive Count', value: stats.plantsCount, key: 'plantsCount' },
                { label: 'Student Directory Count', value: stats.studentsCount, key: 'studentsCount' },
                { label: 'Academic Resource Library', value: stats.resourcesCount, key: 'resourcesCount' },
                { label: 'Registered Field Visits', value: stats.fieldVisitsCount, key: 'fieldVisitsCount' },
              ].map((statItem) => (
                <div key={statItem.key} className="bg-[#0B0B0B]/70 border border-[#C79A6B]/15 rounded p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-mono tracking-wider text-[#8F6A48] uppercase block">
                      {statItem.label}
                    </span>
                    <span className="font-serif text-4xl text-[#F5F2EE] font-medium block mt-1.5">
                      {statItem.value}
                    </span>
                  </div>

                  {/* Micro adjuster to test stats display changes */}
                  <div className="flex items-center gap-1.5 border-t border-[#C79A6B]/10 pt-3">
                    <button 
                      onClick={() => {
                        const newStats = { ...stats, [statItem.key]: Math.max(0, statItem.value - 1) };
                        onUpdateStats(newStats);
                        triggerAlert('Stat adjusted successfully');
                      }}
                      className="px-2 py-1 bg-[#111111] hover:bg-red-950 border border-red-900/40 text-[10px] font-mono text-red-400 rounded-sm"
                    >
                      -
                    </button>
                    <button 
                      onClick={() => {
                        const newStats = { ...stats, [statItem.key]: statItem.value + 1 };
                        onUpdateStats(newStats);
                        triggerAlert('Stat adjusted successfully');
                      }}
                      className="px-2 py-1 bg-[#111111] hover:bg-emerald-950 border border-emerald-900/40 text-[10px] font-mono text-emerald-400 rounded-sm"
                    >
                      +
                    </button>
                    <span className="text-[9px] font-mono text-[#8F6A48]/50 uppercase ml-auto">Adjust value</span>
                  </div>
                </div>
              ))}
            </div>

            {/* General welcome */}
            <div className="p-6 bg-[#1F3D2B]/20 border border-[#C79A6B]/30 rounded flex items-start gap-4">
              <AlertTriangle className="w-5 h-5 text-[#C79A6B] mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h5 className="font-serif text-sm font-semibold text-[#C79A6B] uppercase tracking-wider">
                  Administrative Sovereignty Note
                </h5>
                <p className="text-xs text-[#F5F2EE]/70 font-light leading-relaxed">
                  This curated gateway accesses the memory cells of BOTANY NEXUS DGC. Adding, editing or deleting specimens, student indexes, or publication guides immediately updates the public database in client localStorage. Export with caution.
                </p>
              </div>
            </div>

            {/* Quick List states summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
              <div className="bg-[#0B0B0B]/40 border border-[#C79A6B]/15 rounded p-6 space-y-4">
                <h4 className="text-xs font-mono tracking-widest text-[#C79A6B] uppercase font-bold border-b border-[#C79A6B]/10 pb-3">
                  Latest Registered Specimens
                </h4>
                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {plants.map(p => (
                    <div key={p.id} className="flex justify-between items-center text-xs">
                      <span className="font-serif text-[#F5F2EE] italic">{p.scientificName}</span>
                      <span className="font-mono text-[10px] text-[#8F6A48]">{p.family}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-[#0B0B0B]/40 border border-[#C79A6B]/15 rounded p-6 space-y-4">
                <h4 className="text-xs font-mono tracking-widest text-[#C79A6B] uppercase font-bold border-b border-[#C79A6B]/10 pb-3">
                  Research Collaborators
                </h4>
                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {students.map(s => (
                    <div key={s.id} className="flex justify-between items-center text-xs">
                      <span className="font-serif text-[#F5F2EE]">{s.name}</span>
                      <span className="font-mono text-[9px] px-2 py-0.5 bg-[#C79A6B]/10 rounded border border-[#C79A6B]/15 text-[#C79A6B]">{s.badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ==================================================
            MODULE: PLANTS CRUD
            ================================================== */}
        {activeModule === 'plants' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-[#C79A6B]/15 pb-4">
              <div>
                <h2 className="font-serif text-2xl font-light text-[#F5F2EE]">
                  Manage <span className="font-serif italic text-[#C79A6B]">Plant Archive</span>
                </h2>
                <p className="text-[10px] font-mono text-[#8F6A48] tracking-widest uppercase">
                  Add, update and revoke herbarium taxonomical data sheets
                </p>
              </div>
              
              {!isAddingNew && !editingId && (
                <button
                  onClick={() => {
                    setPlantForm({
                      scientificName: '',
                      commonName: '',
                      family: 'Calophyllaceae',
                      habitat: '',
                      locationFound: '',
                      description: '',
                      medicinalUses: '',
                      chemicalCompounds: '',
                      collectorName: '',
                      collectionDate: new Date().toISOString().split('T')[0],
                      imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1200'
                    });
                    setIsAddingNew(true);
                  }}
                  className="px-4 py-2 border border-[#C79A6B] bg-[#C79A6B]/10 hover:bg-[#C79A6B] text-[10px] font-mono tracking-widest uppercase rounded flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Specimen
                </button>
              )}
            </div>

            {/* Form Drawer (Adding or Editing) */}
            {(isAddingNew || editingId) && (
              <div className="bg-[#0B0B0B]/80 border border-[#C79A6B]/20 rounded p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-center border-b border-[#C79A6B]/15 pb-3">
                  <h4 className="font-serif text-lg text-[#C79A6B] uppercase tracking-wider">
                    {editingId ? 'Edit Plant Specimen Sheet' : 'Draft New Botanical Sheet'}
                  </h4>
                  <button 
                    onClick={() => {
                      setIsAddingNew(false);
                      setEditingId(null);
                    }}
                    className="p-1 text-[#8F6A48] hover:text-[#F5F2EE]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-widest block">Scientific Name *</label>
                    <input 
                      type="text" 
                      value={plantForm.scientificName || ''}
                      onChange={(e) => setPlantForm({ ...plantForm, scientificName: e.target.value })}
                      className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] text-xs text-[#F5F2EE] p-2.5 rounded outline-none font-serif italic" 
                      placeholder="e.g. Mesua ferrea"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-widest block">Common Name *</label>
                    <input 
                      type="text" 
                      value={plantForm.commonName || ''}
                      onChange={(e) => setPlantForm({ ...plantForm, commonName: e.target.value })}
                      className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] text-xs text-[#F5F2EE] p-2.5 rounded outline-none font-sans" 
                      placeholder="e.g. Nagkeshar"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-widest block">Botanical Family *</label>
                    <input 
                      type="text" 
                      value={plantForm.family || ''}
                      onChange={(e) => setPlantForm({ ...plantForm, family: e.target.value })}
                      className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] text-xs text-[#F5F2EE] p-2.5 rounded outline-none font-mono uppercase" 
                      placeholder="e.g. Calophyllaceae"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-widest block">Primary Photo URL</label>
                    <input 
                      type="text" 
                      value={plantForm.imageUrl || ''}
                      onChange={(e) => setPlantForm({ ...plantForm, imageUrl: e.target.value })}
                      className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] text-xs text-[#F5F2EE] p-2.5 rounded outline-none font-mono" 
                    />
                  </div>

                  <div className="space-y-1.5 col-span-1 sm:col-span-2">
                    <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-widest block">Ecology Habitat *</label>
                    <input 
                      type="text" 
                      value={plantForm.habitat || ''}
                      onChange={(e) => setPlantForm({ ...plantForm, habitat: e.target.value })}
                      className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] text-xs text-[#F5F2EE] p-2.5 rounded outline-none" 
                      placeholder="e.g. Tropical evergreen clay forests of Dinajpur"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-1 sm:col-span-2">
                    <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-widest block">Geographic Found Point *</label>
                    <input 
                      type="text" 
                      value={plantForm.locationFound || ''}
                      onChange={(e) => setPlantForm({ ...plantForm, locationFound: e.target.value })}
                      className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] text-xs text-[#F5F2EE] p-2.5 rounded outline-none" 
                      placeholder="e.g. Department Herbarium Reserve Area"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-1 sm:col-span-2">
                    <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-widest block">Taxonomic Core Description *</label>
                    <textarea 
                      value={plantForm.description || ''}
                      onChange={(e) => setPlantForm({ ...plantForm, description: e.target.value })}
                      rows={3}
                      className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] text-xs text-[#F5F2EE] p-2.5 rounded outline-none font-sans" 
                      placeholder="Detailed physical characteristics..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-widest block">Ethnobotanical Medicinal Action</label>
                    <input 
                      type="text" 
                      value={plantForm.medicinalUses || ''}
                      onChange={(e) => setPlantForm({ ...plantForm, medicinalUses: e.target.value })}
                      className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] text-xs text-[#F5F2EE] p-2.5 rounded outline-none" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-widest block">Phytochemical Compounds</label>
                    <input 
                      type="text" 
                      value={plantForm.chemicalCompounds || ''}
                      onChange={(e) => setPlantForm({ ...plantForm, chemicalCompounds: e.target.value })}
                      className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] text-xs text-[#F5F2EE] p-2.5 rounded outline-none font-mono" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-widest block">Lead Collector *</label>
                    <input 
                      type="text" 
                      value={plantForm.collectorName || ''}
                      onChange={(e) => setPlantForm({ ...plantForm, collectorName: e.target.value })}
                      className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] text-xs text-[#F5F2EE] p-2.5 rounded outline-none" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-widest block">Archived Date *</label>
                    <input 
                      type="date" 
                      value={plantForm.collectionDate || ''}
                      onChange={(e) => setPlantForm({ ...plantForm, collectionDate: e.target.value })}
                      className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] text-xs text-[#F5F2EE] p-2.5 rounded outline-none font-mono" 
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#C79A6B]/15 flex justify-end gap-3">
                  <button 
                    onClick={() => {
                      setIsAddingNew(false);
                      setEditingId(null);
                    }}
                    className="px-5 py-2 border border-[#C79A6B]/10 hover:border-[#C79A6B]/40 bg-transparent text-[10px] font-mono text-[#8F6A48] uppercase rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      if (!plantForm.scientificName || !plantForm.commonName || !plantForm.description || !plantForm.collectorName) {
                        triggerAlert('Please fill out all required fields marked with *', 'error');
                        return;
                      }
                      if (editingId) {
                        onEditPlant({ ...plantForm, id: editingId } as Plant);
                        triggerAlert('Specimen sheet modified successfully');
                      } else {
                        const newPlant: Plant = {
                          ...plantForm,
                          id: `plant-${Date.now()}`
                        } as Plant;
                        onAddPlant(newPlant);
                        triggerAlert('New specimen sheet added to index');
                      }
                      setIsAddingNew(false);
                      setEditingId(null);
                    }}
                    className="px-6 py-2.5 bg-[#C79A6B] text-[#0B0B0B] text-[10px] font-mono font-bold tracking-widest uppercase rounded cursor-pointer flex items-center gap-1.5 hover:bg-opacity-95"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Document
                  </button>
                </div>
              </div>
            )}

            {/* List Table */}
            <div className="overflow-x-auto bg-[#0B0B0B]/50 border border-[#C79A6B]/15 rounded">
              <table className="w-full text-left text-xs divide-y divide-[#C79A6B]/15 select-text">
                <thead>
                  <tr className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-widest bg-[#111111]">
                    <th className="p-4">Specimen Class / Code</th>
                    <th className="p-4">Scientific Name</th>
                    <th className="p-4">Vernacular</th>
                    <th className="p-4">Lead Collector</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C79A6B]/10">
                  {plants.map((plant) => (
                    <tr key={plant.id} className="hover:bg-[#111111]/30 transition-colors">
                      <td className="p-4 font-mono text-[10px] text-[#C79A6B]">{plant.id.toUpperCase()}</td>
                      <td className="p-4 font-serif italic text-sm">{plant.scientificName}</td>
                      <td className="p-4 text-xs font-light">{plant.commonName}</td>
                      <td className="p-4 font-mono text-[11px] text-[#8F6A48]">{plant.collectorName}</td>
                      <td className="p-4 text-right flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => {
                            setPlantForm(plant);
                            setEditingId(plant.id);
                            setIsAddingNew(false);
                          }}
                          className="p-1.5 text-blue-400 hover:bg-[#111111] rounded border border-transparent hover:border-blue-900/30 cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {userRole !== 'CR' && (
                          <button
                            onClick={() => {
                              if (confirm(`Revoke specimen sheet for "${plant.scientificName}" permanently?`)) {
                                onDeletePlant(plant.id);
                                triggerAlert('Specimen sheet revoked');
                              }
                            }}
                            className="p-1.5 text-red-400 hover:bg-[#111111] rounded border border-transparent hover:border-red-900/30 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================
            MODULE: COMMUNITY MANAGEMENT
            ================================================== */}
        {activeModule === 'community' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-[#C79A6B]/15 pb-4">
              <h2 className="font-serif text-2xl font-light text-[#F5F2EE]">
                Community <span className="font-serif italic text-[#C79A6B]">Management</span>
              </h2>
              <p className="text-[10px] font-mono text-[#8F6A48] tracking-widest uppercase">
                Organize students, faculty contributors, credentials, settings, and achievements
              </p>
            </div>

            {/* Sub-tabs Navigation */}
            <div className="flex border-b border-[#C79A6B]/10 gap-2 overflow-x-auto pb-px">
              <button
                onClick={() => { setCommunityTab('student'); setIsAddingNew(false); setEditingId(null); }}
                className={`px-4 py-2 font-mono text-[10px] tracking-widest uppercase border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  communityTab === 'student'
                    ? 'border-[#C79A6B] text-[#C79A6B]'
                    : 'border-transparent text-[#8F6A48] hover:text-[#C79A6B]'
                }`}
              >
                Student Directory
              </button>
              <button
                onClick={() => { setCommunityTab('contributor'); setIsAddingNew(false); setEditingId(null); }}
                className={`px-4 py-2 font-mono text-[10px] tracking-widest uppercase border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  communityTab === 'contributor'
                    ? 'border-[#C79A6B] text-[#C79A6B]'
                    : 'border-transparent text-[#8F6A48] hover:text-[#C79A6B]'
                }`}
              >
                Mentors & Advisors
              </button>
              <button
                onClick={() => { setCommunityTab('achievement'); setIsAddingNew(false); setEditingId(null); }}
                className={`px-4 py-2 font-mono text-[10px] tracking-widest uppercase border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  communityTab === 'achievement'
                    ? 'border-[#C79A6B] text-[#C79A6B]'
                    : 'border-transparent text-[#8F6A48] hover:text-[#C79A6B]'
                }`}
              >
                Achievements & Credentials
              </button>
              <button
                onClick={() => { setCommunityTab('settings'); setIsAddingNew(false); setEditingId(null); }}
                className={`px-4 py-2 font-mono text-[10px] tracking-widest uppercase border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  communityTab === 'settings'
                    ? 'border-[#C79A6B] text-[#C79A6B]'
                    : 'border-transparent text-[#8F6A48] hover:text-[#C79A6B]'
                }`}
              >
                Registry Settings
              </button>
            </div>

            {/* Student Sub-tab */}
            {communityTab === 'student' && (
              <div className="space-y-6">
                
                {/* Headers & Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#C79A6B]/15 pb-4">
                  <div>
                    <h3 className="font-serif text-xl text-[#F5F2EE] tracking-wide">
                      Portal Student Management
                    </h3>
                    <p className="text-[11px] font-mono text-[#8F6A48] mt-1">
                      Authorize batches, assign Class Representatives (CR), reset credentials, and enforce Row Level Security.
                    </p>
                  </div>
                  
                  {!isAddingNew && !editingId && (
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <button
                        onClick={() => setIsBulkImporting(!isBulkImporting)}
                        className={`px-3.5 py-2 border text-[10px] font-mono tracking-widest uppercase rounded-sm flex items-center gap-2 cursor-pointer transition-all ${
                          isBulkImporting 
                            ? 'bg-purple-950/40 border-purple-500/40 text-purple-300' 
                            : 'bg-[#111111] border-[#C79A6B]/30 hover:border-[#C79A6B] text-[#C79A6B]'
                        }`}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isBulkImporting ? 'animate-spin' : ''}`} />
                        Bulk Import Excel
                      </button>

                      <button
                        onClick={() => {
                          setStudentForm({
                            name: '',
                            rollNumber: '',
                            registrationNumber: '',
                            batch: '21st Batch',
                            session: sessionYear || '2025-2026',
                            photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
                            coverUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800',
                            skills: [],
                            interests: [],
                            contributions: 5,
                            badge: 'Student',
                            bio: 'Student of Botany Department, Dinajpur Govt. College.',
                            email: '',
                            fbUrl: '',
                            achievements: [],
                            badges: [],
                            role: 'Student',
                            status: 'Active',
                            department: 'Department of Botany',
                            password: '',
                            isTemporaryPassword: true
                          });
                          setIsAddingNew(true);
                          setIsBulkImporting(false);
                        }}
                        className="px-4 py-2 bg-[#C79A6B] hover:bg-[#F5F2EE] text-black text-[10px] font-mono tracking-widest uppercase rounded-sm flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add Student
                      </button>
                    </div>
                  )}
                </div>

                {/* BULK IMPORT EXCEL PANEL */}
                {isBulkImporting && !isAddingNew && !editingId && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#111111]/90 border border-purple-500/30 p-6 rounded-sm space-y-4 text-left relative"
                  >
                    <div className="absolute top-0 left-0 w-8 h-[1px] bg-purple-400" />
                    <div className="absolute top-0 left-0 w-[1px] h-8 bg-purple-400" />
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-serif text-purple-300 text-sm uppercase tracking-wider">
                          Excel / CSV Bulk Importer
                        </h4>
                        <p className="text-[10px] text-[#8F6A48] mt-0.5">
                          Paste raw rows from an Excel sheet or select the automatic generator simulation to append multiple records at once.
                        </p>
                      </div>
                      <button 
                        onClick={() => setIsBulkImporting(false)}
                        className="text-[10px] font-mono text-purple-400 hover:underline"
                      >
                        Hide Panel
                      </button>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[9px] font-mono tracking-widest text-[#8F6A48] uppercase font-bold block">
                        CSV Student Data Input (Format: Roll,Name,Reg,Batch,Session,Role)
                      </label>
                      <textarea
                        rows={5}
                        placeholder="10301,Muntasir Billah,DGC-2025-0301,21st Batch,2025-2026,Student..."
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        className="w-full bg-[#0B0B0B] border border-purple-500/20 focus:border-purple-500 p-3 rounded font-mono text-xs text-[#F5F2EE] outline-none"
                      />

                      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setBulkText(
                              "10301,Muntasir Billah,DGC-25-0301,21st Batch,2025-2026,Student\n" +
                              "10302,Saima Jahan,DGC-25-0302,21st Batch,2025-2026,Student\n" +
                              "10303,Shahriar Rafiq,DGC-25-0303,21st Batch,2025-2026,CR\n" +
                              "10304,Anika Tabassum,DGC-25-0304,22nd Batch,2025-2026,Student\n" +
                              "10305,Nafees Imtiaz,DGC-25-0305,22nd Batch,2025-2026,Student"
                            );
                            triggerAlert('Simulated Excel data loaded', 'info');
                          }}
                          className="w-full sm:w-auto px-4 py-2 bg-purple-950/60 border border-purple-500/20 hover:border-purple-400 text-purple-300 text-[10px] font-mono uppercase tracking-wider rounded transition-all"
                        >
                          ⚡ Autofill Simulated Excel Rows
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (!bulkText.trim()) {
                              triggerAlert('Please input student spreadsheet rows to parse.', 'error');
                              return;
                            }
                            const lines = bulkText.trim().split('\n');
                            let count = 0;
                            lines.forEach(line => {
                              const parts = line.split(',');
                              if (parts.length >= 2) {
                                const roll = parts[0]?.trim() || '';
                                const name = parts[1]?.trim() || '';
                                const reg = parts[2]?.trim() || `DGC-REG-${roll || Date.now()}`;
                                const batch = parts[3]?.trim() || '21st Batch';
                                const session = parts[4]?.trim() || sessionYear;
                                const roleVal = (parts[5]?.trim() === 'CR' ? 'CR' : 'Student') as 'Student' | 'CR';

                                if (roll && name) {
                                  // Verify if roll already registered
                                  const exists = students.some(s => s.rollNumber === roll);
                                  if (!exists) {
                                    onAddStudent({
                                      id: `student-bulk-${roll}-${Date.now()}`,
                                      name,
                                      full_name: name,
                                      roll: roll,
                                      rollNumber: roll,
                                      registration: reg,
                                      registrationNumber: reg,
                                      studentId: reg,
                                      batch,
                                      session,
                                      profile_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
                                      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
                                      coverUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800',
                                      skills: ['Botany Explorer'],
                                      interests: ['Field cataloging'],
                                      contributions: 0,
                                      badge: roleVal === 'CR' ? 'Class Representative' : 'Student',
                                      bio: 'Student account provisioned via admin spreadsheet importer.',
                                      email: `${name.toLowerCase().replace(/\s+/g, '')}@dgc.edu`,
                                      fbUrl: '',
                                      achievements: [],
                                      badges: [],
                                      password: `Botany@${roll}`,
                                      role: roleVal,
                                      status: 'Active',
                                      department: 'Department of Botany',
                                      createdDate: new Date().toISOString(),
                                      isTemporaryPassword: true
                                    });
                                    count++;
                                  }
                                }
                              }
                            });
                            triggerAlert(`Success: Imported ${count} new student batch accounts!`, 'success');
                            setBulkText('');
                            setIsBulkImporting(false);
                          }}
                          className="w-full sm:w-auto px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-mono uppercase tracking-wider rounded transition-colors"
                        >
                          Process Excel Bulk Import
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* SEARCH AND FILTERING MODULE */}
                {!isAddingNew && !editingId && (
                  <div className="bg-[#111111] border border-[#C79A6B]/15 p-4 rounded-sm flex flex-col md:flex-row items-center gap-4 text-left">
                    <div className="w-full md:flex-grow relative">
                      <input
                        type="text"
                        placeholder="Search student by Name, Roll, or Registration..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full bg-[#0B0B0B] border border-[#C79A6B]/20 focus:border-[#C79A6B] py-2.5 pl-10 pr-4 rounded text-xs text-white outline-none"
                      />
                      <Search className="w-4 h-4 text-[#8F6A48] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>

                    <div className="grid grid-cols-2 sm:flex items-center gap-3 w-full md:w-auto text-xs">
                      {/* Role Filter */}
                      <div className="flex flex-col gap-1 w-full sm:w-36">
                        <select
                          value={studentRoleFilter}
                          onChange={(e) => setStudentRoleFilter(e.target.value as any)}
                          className="bg-[#0B0B0B] border border-[#C79A6B]/20 text-[#C79A6B] p-2.5 rounded text-xs outline-none"
                        >
                          <option value="all">All Roles</option>
                          <option value="Student">Student Role</option>
                          <option value="CR">CR Role</option>
                        </select>
                      </div>

                      {/* Status Filter */}
                      <div className="flex flex-col gap-1 w-full sm:w-36">
                        <select
                          value={studentStatusFilter}
                          onChange={(e) => setStudentStatusFilter(e.target.value as any)}
                          className="bg-[#0B0B0B] border border-[#C79A6B]/20 text-[#C79A6B] p-2.5 rounded text-xs outline-none"
                        >
                          <option value="all">All Status</option>
                          <option value="Active">Active Portal</option>
                          <option value="Inactive">Deactivated</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STUDENT ADD & EDIT FORM */}
                {(isAddingNew || editingId) && (
                  <div className="bg-[#0B0B0B]/80 border border-[#C79A6B]/20 rounded p-6 space-y-4 text-left">
                    <div className="flex justify-between items-center border-b border-[#C79A6B]/10 pb-2">
                      <h4 className="font-serif text-[#C79A6B] text-sm uppercase font-bold tracking-wider">
                        {editingId ? 'Edit Student Portal Access & Profile' : 'Register New Student Account'}
                      </h4>
                      <span className="text-[9px] font-mono text-[#8F6A48]">
                        BATCH ENROLLMENT • SECURE GATEWAY
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      
                      {/* Name */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase font-bold">Full Name *</label>
                        <input 
                          type="text" placeholder="e.g. Priyanthika Sen" value={studentForm.name || ''}
                          onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                          className="bg-[#111111] border border-[#C79A6B]/20 p-2.5 rounded text-xs text-white outline-none focus:border-[#C79A6B]/50"
                        />
                      </div>

                      {/* Roll */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase font-bold">Roll Number *</label>
                        <input 
                          type="text" placeholder="e.g. 10104" value={studentForm.rollNumber || ''}
                          onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                          className="bg-[#111111] border border-[#C79A6B]/20 p-2.5 rounded text-xs text-white outline-none focus:border-[#C79A6B]/50"
                        />
                      </div>

                      {/* Registration */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase font-bold">Registration Number *</label>
                        <input 
                          type="text" placeholder="e.g. DGC-2025-0104" value={studentForm.registrationNumber || ''}
                          onChange={(e) => setStudentForm({ ...studentForm, registrationNumber: e.target.value, studentId: e.target.value })}
                          className="bg-[#111111] border border-[#C79A6B]/20 p-2.5 rounded text-xs text-white outline-none focus:border-[#C79A6B]/50"
                        />
                      </div>

                      {/* Password */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase font-bold">
                          Portal Passcode / Password
                        </label>
                        <input 
                          type="text" 
                          placeholder="Leave blank for Botany@<RollNumber> default" 
                          value={studentForm.password || ''}
                          onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                          className="bg-[#111111] border border-[#C79A6B]/20 p-2.5 rounded text-xs text-white outline-none focus:border-[#C79A6B]/50"
                        />
                      </div>

                      {/* Role Dropdown */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase font-bold">Portal Role *</label>
                        <select
                          value={studentForm.role || 'Student'}
                          onChange={(e) => setStudentForm({ ...studentForm, role: e.target.value as any })}
                          className="bg-[#111111] border border-[#C79A6B]/20 p-2.5 rounded text-xs text-white outline-none focus:border-[#C79A6B]/50"
                        >
                          <option value="Student">Student (View, Download, Bookmark)</option>
                          <option value="CR">CR (Student Features + Routine, Notices, Gallery upload)</option>
                        </select>
                      </div>

                      {/* Status Dropdown */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase font-bold">Account Status *</label>
                        <select
                          value={studentForm.status || 'Active'}
                          onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value as any })}
                          className="bg-[#111111] border border-[#C79A6B]/20 p-2.5 rounded text-xs text-white outline-none focus:border-[#C79A6B]/50"
                        >
                          <option value="Active">Active (Allowed portal login)</option>
                          <option value="Inactive">Inactive / Deactivated (Banned from portal)</option>
                        </select>
                      </div>

                      {/* Batch */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase font-bold">Batch *</label>
                        <input 
                          type="text" placeholder="e.g. 21st Batch" value={studentForm.batch || ''}
                          onChange={(e) => setStudentForm({ ...studentForm, batch: e.target.value })}
                          className="bg-[#111111] border border-[#C79A6B]/20 p-2.5 rounded text-xs text-white outline-none focus:border-[#C79A6B]/50"
                        />
                      </div>

                      {/* Session */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase font-bold">Academic Session *</label>
                        <input 
                          type="text" placeholder="e.g. 2025-2026" value={studentForm.session || ''}
                          onChange={(e) => setStudentForm({ ...studentForm, session: e.target.value })}
                          className="bg-[#111111] border border-[#C79A6B]/20 p-2.5 rounded text-xs text-white outline-none focus:border-[#C79A6B]/50"
                        />
                      </div>

                      {/* Department */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase font-bold">Department *</label>
                        <input 
                          type="text" placeholder="Department of Botany" value={studentForm.department || 'Department of Botany'}
                          onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                          className="bg-[#111111] border border-[#C79A6B]/20 p-2.5 rounded text-xs text-white outline-none focus:border-[#C79A6B]/50"
                        />
                      </div>

                      {/* Photo Url */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase font-bold">Profile Photo URL</label>
                        <input 
                          type="text" placeholder="https://images.unsplash..." value={studentForm.photoUrl || ''}
                          onChange={(e) => setStudentForm({ ...studentForm, photoUrl: e.target.value })}
                          className="bg-[#111111] border border-[#C79A6B]/20 p-2.5 rounded text-xs text-white outline-none focus:border-[#C79A6B]/50"
                        />
                      </div>

                      {/* Cover Url */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase font-bold">Cover Photo URL</label>
                        <input 
                          type="text" placeholder="https://images.unsplash..." value={studentForm.coverUrl || ''}
                          onChange={(e) => setStudentForm({ ...studentForm, coverUrl: e.target.value })}
                          className="bg-[#111111] border border-[#C79A6B]/20 p-2.5 rounded text-xs text-white outline-none focus:border-[#C79A6B]/50"
                        />
                      </div>

                      {/* Email */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase font-bold">Email</label>
                        <input 
                          type="email" placeholder="e.g. student@dgc.edu" value={studentForm.email || ''}
                          onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                          className="bg-[#111111] border border-[#C79A6B]/20 p-2.5 rounded text-xs text-white outline-none focus:border-[#C79A6B]/50"
                        />
                      </div>

                      {/* Facebook Url */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase font-bold">Facebook Profile Link</label>
                        <input 
                          type="text" placeholder="e.g. https://facebook.com/username" value={studentForm.fbUrl || ''}
                          onChange={(e) => setStudentForm({ ...studentForm, fbUrl: e.target.value })}
                          className="bg-[#111111] border border-[#C79A6B]/20 p-2.5 rounded text-xs text-white outline-none focus:border-[#C79A6B]/50"
                        />
                      </div>

                      {/* Primary Badge */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase font-bold">Student Title / Primary Badge</label>
                        <input 
                          type="text" placeholder="e.g. Taxonomist, Explorer" value={studentForm.badge || ''}
                          onChange={(e) => setStudentForm({ ...studentForm, badge: e.target.value })}
                          className="bg-[#111111] border border-[#C79A6B]/20 p-2.5 rounded text-xs text-white outline-none focus:border-[#C79A6B]/50"
                        />
                      </div>

                      {/* First Login checkbox */}
                      <div className="flex items-center gap-2.5 md:col-span-2 py-2">
                        <input 
                          type="checkbox" 
                          id="isTemporaryPassword" 
                          checked={studentForm.isTemporaryPassword !== false}
                          onChange={(e) => setStudentForm({ ...studentForm, isTemporaryPassword: e.target.checked })}
                          className="w-4 h-4 rounded border-[#C79A6B]/30 bg-[#111111] text-[#C79A6B] accent-[#C79A6B]"
                        />
                        <label htmlFor="isTemporaryPassword" className="text-[10.5px] font-mono text-[#C79A6B] uppercase font-bold cursor-pointer">
                          Force Student to Change Password on Next Login (First Login Security Flow)
                        </label>
                      </div>

                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-[#8F6A48] uppercase font-bold">Short Bio / Statement</label>
                      <textarea 
                        placeholder="Brief botanical exploration background..." value={studentForm.bio || ''}
                        onChange={(e) => setStudentForm({ ...studentForm, bio: e.target.value })}
                        rows={3}
                        className="bg-[#111111] border border-[#C79A6B]/20 p-2.5 rounded text-xs text-white outline-none focus:border-[#C79A6B]/50 resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-[#C79A6B]/10">
                      <button onClick={() => { setIsAddingNew(false); setEditingId(null); }} className="px-4 py-2 text-xs text-[#8F6A48] hover:text-[#C79A6B]">Cancel</button>
                      <button 
                        onClick={() => {
                          if (!studentForm.name || !studentForm.rollNumber || !studentForm.registrationNumber) {
                            triggerAlert('Full Name, Roll Number, and Registration Number are required.', 'error');
                            return;
                          }
                          
                          const fallbackPassword = `Botany@${studentForm.rollNumber}`;
                          const finalPassword = studentForm.password ? studentForm.password.trim() : fallbackPassword;

                          const savedStudent: Student = {
                            ...studentForm,
                            id: editingId || `student-${Date.now()}`,
                            studentId: studentForm.registrationNumber, // compatibility link
                            name: studentForm.name,
                            full_name: studentForm.name,
                            roll: studentForm.rollNumber,
                            rollNumber: studentForm.rollNumber,
                            registration: studentForm.registrationNumber,
                            registrationNumber: studentForm.registrationNumber,
                            profile_photo: studentForm.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
                            photoUrl: studentForm.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
                            coverUrl: studentForm.coverUrl || 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800',
                            skills: studentForm.skills || [],
                            interests: studentForm.interests || [],
                            contributions: studentForm.contributions || 0,
                            badge: studentForm.badge || (studentForm.role === 'CR' ? 'Class Representative' : 'Student'),
                            bio: studentForm.bio || '',
                            email: studentForm.email || `${studentForm.name.toLowerCase().replace(/\s+/g, '')}@dgc.edu`,
                            fbUrl: studentForm.fbUrl || '',
                            achievements: studentForm.achievements || [],
                            badges: studentForm.badges || [],
                            password: finalPassword,
                            role: studentForm.role || 'Student',
                            status: studentForm.status || 'Active',
                            department: studentForm.department || 'Department of Botany',
                            createdDate: studentForm.createdDate || new Date().toISOString(),
                            isTemporaryPassword: studentForm.isTemporaryPassword !== false
                          } as Student;

                          if (editingId) {
                            onEditStudent(savedStudent);
                            triggerAlert('Student portal security portfolio updated');
                          } else {
                            onAddStudent(savedStudent);
                            triggerAlert('New secure student portal account created');
                          }
                          setIsAddingNew(false);
                          setEditingId(null);
                        }}
                        className="px-5 py-2.5 bg-[#C79A6B] text-black text-xs font-mono uppercase font-bold tracking-wider"
                      >
                        {editingId ? 'Update Portfolio' : 'Register Student'}
                      </button>
                    </div>
                  </div>
                )}

                {/* STUDENT RECORD LIST TABLE */}
                {!isAddingNew && !editingId && (
                  <div className="bg-[#0B0B0B]/40 border border-[#C79A6B]/15 rounded overflow-x-auto text-left">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#C79A6B]/15 text-[10px] font-mono uppercase tracking-wider text-[#8F6A48] bg-[#000000]/30">
                          <th className="p-4">Profile</th>
                          <th className="p-4">Full Name</th>
                          <th className="p-4">Roll / Reg No.</th>
                          <th className="p-4">Role / Status</th>
                          <th className="p-4">Department / Session</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C79A6B]/10 font-mono">
                        {students
                          .filter(s => {
                            const term = studentSearch.toLowerCase().trim();
                            if (term) {
                              const matchName = s.name.toLowerCase().includes(term);
                              const matchRoll = s.rollNumber.toLowerCase().includes(term);
                              const matchReg = s.registrationNumber.toLowerCase().includes(term);
                              if (!matchName && !matchRoll && !matchReg) return false;
                            }
                            if (studentRoleFilter !== 'all' && s.role !== studentRoleFilter) return false;
                            if (studentStatusFilter !== 'all' && s.status !== studentStatusFilter) return false;
                            return true;
                          })
                          .map(student => (
                            <tr key={student.id} className="hover:bg-[#111111]/30 transition-colors">
                              <td className="p-4">
                                <img src={student.photoUrl} className="w-10 h-10 rounded object-cover border border-[#C79A6B]/20" referrerPolicy="no-referrer" />
                              </td>
                              <td className="p-4 text-[#F5F2EE] font-serif text-sm">
                                <div>{student.name}</div>
                                {student.isTemporaryPassword !== false && (
                                  <span className="text-[8.5px] font-mono bg-amber-950/40 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full mt-1 inline-block uppercase">
                                    🔑 Temp Pass
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-[#F5F2EE]/70">
                                <div>Roll: <span className="text-[#C79A6B] font-bold">{student.rollNumber || '—'}</span></div>
                                <div className="text-[10px] text-[#8F6A48]">{student.registrationNumber || '—'}</div>
                              </td>
                              <td className="p-4">
                                <div className="flex flex-col gap-1.5 items-start">
                                  {student.role === 'CR' ? (
                                    <span className="px-2 py-0.5 rounded bg-yellow-950/40 border border-yellow-500/30 text-[9.5px] text-yellow-400 font-bold">
                                      CR Role
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded bg-[#C79A6B]/10 border border-[#C79A6B]/20 text-[9.5px] text-[#C79A6B]">
                                      Student
                                    </span>
                                  )}

                                  {student.status === 'Inactive' ? (
                                    <span className="px-1.5 py-0.5 rounded bg-red-950/40 border border-red-500/20 text-[8.5px] text-red-400 uppercase">
                                      Inactive / Banned
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/20 text-[8.5px] text-emerald-400 uppercase">
                                      Active Portal
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-[#F5F2EE]/70">
                                <div>{student.department || 'Department of Botany'}</div>
                                <div className="text-[10px] text-[#8F6A48]">Session: {student.session}</div>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                  
                                  {/* Toggle Active status action */}
                                  <button
                                    onClick={() => {
                                      const nextStatus = student.status === 'Inactive' ? 'Active' : 'Inactive';
                                      onEditStudent({
                                        ...student,
                                        status: nextStatus
                                      });
                                      triggerAlert(`Student status set to ${nextStatus}`, 'info');
                                    }}
                                    title={student.status === 'Inactive' ? 'Activate student account' : 'Deactivate student account'}
                                    className={`p-1.5 rounded border border-transparent transition-all cursor-pointer ${
                                      student.status === 'Inactive' 
                                        ? 'text-emerald-400 hover:bg-[#111111] hover:border-emerald-500/20' 
                                        : 'text-amber-400 hover:bg-[#111111] hover:border-amber-500/20'
                                    }`}
                                  >
                                    <ShieldCheck className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      setStudentForm(student);
                                      setEditingId(student.id);
                                      setIsAddingNew(false);
                                    }}
                                    className="p-1.5 text-blue-400 hover:bg-[#111111] rounded border border-transparent hover:border-blue-900/30 cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      onDeleteStudent(student.id);
                                      triggerAlert('Student registry successfully revoked', 'success');
                                    }}
                                    className="p-1.5 text-red-400 hover:bg-[#111111] rounded border border-transparent hover:border-red-900/30 cursor-pointer"
                                    title="Revoke and Delete Student"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Faculty Advisors sub-tab */}
            {communityTab === 'contributor' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-lg text-[#F5F2EE]">Faculty Advisors & Mentors</h3>
                  {!isAddingNew && !editingId && (
                    <button
                      onClick={() => {
                        setContributorForm({
                          name: '',
                          role: 'Departmental Mentor & Advisor',
                          contributionsCount: 5,
                          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
                        });
                        setIsAddingNew(true);
                      }}
                      className="px-4 py-2 border border-[#C79A6B] bg-[#C79A6B]/10 hover:bg-[#C79A6B] text-[10px] font-mono tracking-widest uppercase rounded flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Mentor / Advisor
                    </button>
                  )}
                </div>

                {/* Contributor Form */}
                {(isAddingNew || editingId) && (
                  <div className="bg-[#0B0B0B]/80 border border-[#C79A6B]/20 rounded p-6 space-y-4">
                    <h4 className="font-serif text-[#C79A6B] text-sm uppercase">
                      {editingId ? 'Edit Mentor / Advisor Profile' : 'Draft Mentor / Advisor Profile'}
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-[#8F6A48]">Full Name</label>
                        <input 
                          type="text" placeholder="Full Name" value={contributorForm.name || ''}
                          onChange={(e) => setContributorForm({ ...contributorForm, name: e.target.value })}
                          className="w-full bg-[#111111] border border-[#C79A6B]/20 p-2.5 rounded text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-[#8F6A48]">Role / Designation</label>
                        <input 
                          type="text" placeholder="Academic Role (e.g. Mentor, Assistant Professor)" value={contributorForm.role || ''}
                          onChange={(e) => setContributorForm({ ...contributorForm, role: e.target.value })}
                          className="w-full bg-[#111111] border border-[#C79A6B]/20 p-2.5 rounded text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-[#8F6A48]">Curatorial Index / Contributions Count</label>
                        <input 
                          type="number" placeholder="Verified Contributions Count" value={contributorForm.contributionsCount || 0}
                          onChange={(e) => setContributorForm({ ...contributorForm, contributionsCount: parseInt(e.target.value) || 0 })}
                          className="w-full bg-[#111111] border border-[#C79A6B]/20 p-2.5 rounded text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-[#8F6A48]">Avatar Photo URL</label>
                        <input 
                          type="text" placeholder="Avatar Photo URL" value={contributorForm.avatarUrl || ''}
                          onChange={(e) => setContributorForm({ ...contributorForm, avatarUrl: e.target.value })}
                          className="w-full bg-[#111111] border border-[#C79A6B]/20 p-2.5 rounded text-xs text-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button onClick={() => { setIsAddingNew(false); setEditingId(null); }} className="px-4 py-1.5 text-xs text-[#8F6A48]">Cancel</button>
                      <button 
                        onClick={() => {
                          if (editingId) {
                            onEditContributor({ ...contributorForm, id: editingId } as Contributor);
                            triggerAlert('Mentor / Advisor registry updated');
                          } else {
                            onAddContributor({ ...contributorForm, id: `cont-${Date.now()}` } as Contributor);
                            triggerAlert('New Mentor / Advisor registered successfully');
                          }
                          setIsAddingNew(false);
                          setEditingId(null);
                        }}
                        className="px-4 py-1.5 bg-[#C79A6B] text-black text-xs font-mono uppercase font-bold"
                      >Save Profile</button>
                    </div>
                  </div>
                )}

                {/* Contributor List */}
                {!isAddingNew && !editingId && (
                  <div className="space-y-3">
                    {contributors.map(cont => (
                      <div key={cont.id} className="p-4 bg-[#0B0B0B]/50 border border-[#C79A6B]/15 rounded flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <img src={cont.avatarUrl} className="w-8 h-8 rounded-full object-cover border border-[#C79A6B]/20" referrerPolicy="no-referrer" />
                          <div>
                            <h5 className="font-serif text-sm font-medium text-white">{cont.name}</h5>
                            <span className="text-[10px] font-mono text-[#8F6A48] uppercase">{cont.role} • Index: {cont.contributionsCount} items approved</span>
                          </div>
                        </div>
                        <div className="flex gap-3 font-mono">
                          <button onClick={() => { setContributorForm(cont); setEditingId(cont.id); setIsAddingNew(false); }} className="text-blue-400 text-xs hover:underline cursor-pointer">Edit</button>
                          <button onClick={() => setDeleteConfirmMentor(cont)} className="text-red-400 text-xs hover:underline cursor-pointer">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Achievement sub-tab */}
            {communityTab === 'achievement' && (
              <div className="space-y-6 max-w-2xl bg-[#0B0B0B]/40 border border-[#C79A6B]/15 rounded p-6">
                <div>
                  <h3 className="font-serif text-lg text-[#F5F2EE]">Student Credentials & Distinctions</h3>
                  <p className="text-[10px] font-mono text-[#8F6A48] tracking-widest uppercase">
                    Grant certificates, titles, medals, and high-contrast badges to student records
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-[#C79A6B] uppercase tracking-wider block font-bold">Select Student Profile</label>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => {
                        setSelectedStudentId(e.target.value);
                        setNewAchievement('');
                        setNewBadge('');
                      }}
                      className="bg-[#111111] border border-[#C79A6B]/35 focus:border-[#C79A6B] text-xs font-mono text-[#F5F2EE] p-3 rounded outline-none w-full cursor-pointer"
                    >
                      <option value="">-- Choose a registered student --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} (Roll: {s.rollNumber || '—'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedStudentId && (() => {
                    const student = students.find(s => s.id === selectedStudentId);
                    if (!student) return null;

                    return (
                      <div className="space-y-6 border-t border-[#C79A6B]/10 pt-6 animate-fade-in">
                        {/* Visual Identity Preview */}
                        <div className="flex items-center gap-3 bg-[#111111]/40 border border-[#C79A6B]/10 p-3 rounded">
                          <img src={student.photoUrl} className="w-10 h-10 rounded-full object-cover border border-[#C79A6B]/20" />
                          <div>
                            <h4 className="font-serif text-sm font-semibold text-[#F5F2EE]">{student.name}</h4>
                            <p className="text-[10px] font-mono text-[#8F6A48] uppercase">{student.badge || 'Student'} • {student.batch}</p>
                          </div>
                        </div>

                        {/* Achievements List and Addition */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-[#C79A6B] uppercase tracking-wider block font-bold">Achievements & Medals</span>
                          </div>
                          
                          {student.achievements && student.achievements.length > 0 ? (
                            <div className="space-y-1.5">
                              {student.achievements.map((ach, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-[#111111]/60 border border-[#C79A6B]/10 px-3 py-2 rounded text-xs font-mono">
                                  <span className="text-white flex items-center gap-1.5">
                                    <Trophy className="w-3.5 h-3.5 text-[#C79A6B] flex-shrink-0" />
                                    {ach}
                                  </span>
                                  <button
                                    onClick={() => {
                                      const updatedAchievements = student.achievements!.filter((_, i) => i !== idx);
                                      onEditStudent({ ...student, achievements: updatedAchievements });
                                      triggerAlert('Achievement revoked');
                                    }}
                                    className="text-red-400 hover:text-red-300 hover:underline text-[10px] cursor-pointer"
                                  >
                                    Revoke
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] font-mono text-[#8F6A48] italic">No achievements recorded on this profile.</p>
                          )}

                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="e.g. Best Bio-diversity Specimen Curator 2025"
                              value={newAchievement}
                              onChange={(e) => setNewAchievement(e.target.value)}
                              className="bg-[#111111] border border-[#C79A6B]/20 p-2.5 rounded text-xs text-white outline-none focus:border-[#C79A6B]/50 flex-grow"
                            />
                            <button
                              onClick={() => {
                                if (!newAchievement.trim()) return;
                                const achievements = [...(student.achievements || []), newAchievement.trim()];
                                onEditStudent({ ...student, achievements });
                                setNewAchievement('');
                                triggerAlert('Distinction awarded successfully');
                              }}
                              className="px-4 py-2 bg-[#C79A6B] hover:bg-[#C79A6B]/80 text-black text-[10px] font-mono tracking-widest uppercase rounded font-bold whitespace-nowrap cursor-pointer transition-colors"
                            >
                              Award
                            </button>
                          </div>
                        </div>

                        {/* Custom Badges List and Addition */}
                        <div className="space-y-3 border-t border-[#C79A6B]/10 pt-6">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-[#C79A6B] uppercase tracking-wider block font-bold">Credential Badges</span>
                          </div>

                          {student.badges && student.badges.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {student.badges.map((badge, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 bg-[#C79A6B]/10 border border-[#C79A6B]/20 px-2.5 py-1 rounded text-[10px] font-mono text-[#C79A6B]">
                                  <Award className="w-3 h-3 text-[#C79A6B]" />
                                  <span>{badge}</span>
                                  <button
                                    onClick={() => {
                                      const updatedBadges = student.badges!.filter((_, i) => i !== idx);
                                      onEditStudent({ ...student, badges: updatedBadges });
                                      triggerAlert('Badge revoked');
                                    }}
                                    className="text-red-400 hover:text-red-300 ml-1.5 hover:underline font-bold text-[9px] cursor-pointer"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] font-mono text-[#8F6A48] italic">No special badges granted to this profile yet.</p>
                          )}

                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="e.g. Flora Explorer, Gold Medallist"
                              value={newBadge}
                              onChange={(e) => setNewBadge(e.target.value)}
                              className="bg-[#111111] border border-[#C79A6B]/20 p-2.5 rounded text-xs text-white outline-none focus:border-[#C79A6B]/50 flex-grow"
                            />
                            <button
                              onClick={() => {
                                if (!newBadge.trim()) return;
                                const badges = [...(student.badges || []), newBadge.trim()];
                                onEditStudent({ ...student, badges });
                                setNewBadge('');
                                triggerAlert('Badge granted successfully');
                              }}
                              className="px-4 py-2 bg-[#C79A6B] hover:bg-[#C79A6B]/80 text-black text-[10px] font-mono tracking-widest uppercase rounded font-bold whitespace-nowrap cursor-pointer transition-colors"
                            >
                              Grant
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Registry Settings sub-tab */}
            {communityTab === 'settings' && (
              <div className="space-y-6 max-w-xl bg-[#0B0B0B]/40 border border-[#C79A6B]/15 rounded p-6">
                <div>
                  <h3 className="font-serif text-lg text-[#F5F2EE]">Registry Global Settings</h3>
                  <p className="text-[10px] font-mono text-[#8F6A48] tracking-widest uppercase">
                    Customize headers, sub-titles, and academic parameters
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-[#C79A6B] uppercase tracking-widest block font-bold">
                      Community Page Title
                    </label>
                    <input 
                      type="text" 
                      value={communityTitle}
                      onChange={(e) => onUpdateCommunityTitle(e.target.value)}
                      className="w-full bg-[#111111] border border-[#C79A6B]/35 focus:border-[#C79A6B] text-xs font-mono text-[#F5F2EE] p-3 rounded outline-none" 
                      placeholder="e.g. Botany Community"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-[#C79A6B] uppercase tracking-widest block font-bold">
                      Community Page Subtitle
                    </label>
                    <textarea 
                      value={communitySubtitle}
                      onChange={(e) => onUpdateCommunitySubtitle(e.target.value)}
                      rows={4}
                      className="w-full bg-[#111111] border border-[#C79A6B]/35 focus:border-[#C79A6B] text-xs font-mono text-[#F5F2EE] p-3 rounded outline-none resize-none leading-relaxed" 
                      placeholder="Meet the students, contributors, explorers, and the growing botanical community of the Department of Botany."
                    />
                  </div>

                  <div className="pt-4 border-t border-[#C79A6B]/15 flex justify-end">
                    <button 
                      onClick={() => triggerAlert('Registry parameters committed', 'success')}
                      className="px-6 py-2.5 bg-[#C79A6B] text-black text-[10px] font-mono font-bold tracking-widest uppercase rounded flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Parameters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================
            MODULE: DEPARTMENT EVENTS
            ================================================== */}
        {activeModule === 'events' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#C79A6B]/15 pb-4 gap-4">
              <div>
                <h2 className="font-serif text-2xl font-light text-[#F5F2EE]">
                  Department <span className="font-serif italic text-[#C79A6B]">Events & Milestones</span>
                </h2>
                <p className="text-[10px] font-mono text-[#8F6A48] tracking-widest uppercase mt-1">
                  Catalog seminars, workshops, botanical field trips, cultural festivals, and research programs.
                </p>
              </div>
              
              {!isAddingNew && !editingId && (
                <button
                  onClick={() => {
                    setEventForm({
                      title: '',
                      subtitle: '',
                      category: 'Seminar',
                      description: '',
                      date: new Date().toISOString().split('T')[0],
                      time: '10:00 AM',
                      location: 'Botany Lab & Seminar Hall, DGC',
                      organizer: 'Department of Botany',
                      chiefGuest: '',
                      facultyCoordinator: 'Dr. Rafiqul Islam',
                      batch: '1st Batch',
                      session: '2025-2026',
                      coverImage: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=1000',
                      additionalImages: [],
                      youtubeUrl: '',
                      facebookLiveUrl: '',
                      participants: {
                        students: [],
                        teachers: [],
                        guests: []
                      },
                      tags: ['Seminar']
                    });
                    setParticipantStudentInput('');
                    setParticipantTeacherInput('');
                    setParticipantGuestInput('');
                    setIsAddingNew(true);
                  }}
                  className="px-4 py-2 bg-[#C79A6B] text-black text-[10px] font-mono tracking-widest uppercase font-bold hover:bg-[#F5F2EE] transition-all cursor-pointer flex items-center justify-center gap-2 rounded-xs"
                >
                  <Plus className="w-4 h-4" /> Add Event Milestone
                </button>
              )}
            </div>

            {/* FORM */}
            {(isAddingNew || editingId) && (
              <div className="bg-[#0B0B0B]/90 border border-[#C79A6B]/25 rounded-xs p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-center border-b border-[#C79A6B]/15 pb-3">
                  <h4 className="font-serif text-[#C79A6B] text-sm uppercase font-bold tracking-wider">
                    {editingId ? 'Edit Event Registry Card' : 'Catalog New Event Registry'}
                  </h4>
                  <button onClick={() => { setIsAddingNew(false); setEditingId(null); }} className="text-[#8F6A48] hover:text-[#C79A6B]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* BASIC SECTION */}
                  <div className="space-y-4">
                    <h5 className="font-mono text-[10px] text-[#C79A6B] tracking-widest uppercase font-bold border-b border-[#C79A6B]/10 pb-1">01. Basic Information</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block font-bold">Event Title *</label>
                        <input 
                          type="text" placeholder="e.g. 1st Annual Botanical Exhibition & Specimen Gala" value={eventForm.title || ''}
                          onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                          className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] p-2.5 rounded text-xs text-white"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block font-bold">Subtitle / Tagline *</label>
                        <input 
                          type="text" placeholder="e.g. Showcasing indigenous medicinal flora collected by current batch students." value={eventForm.subtitle || ''}
                          onChange={(e) => setEventForm({ ...eventForm, subtitle: e.target.value })}
                          className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] p-2.5 rounded text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block font-bold">Event Category *</label>
                        <select 
                          value={eventForm.category || 'Seminar'}
                          onChange={(e) => setEventForm({ ...eventForm, category: e.target.value as any })}
                          className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] p-2.5 rounded text-xs text-white"
                        >
                          <option value="Seminar">Seminar</option>
                          <option value="Workshop">Workshop</option>
                          <option value="Field Visit">Field Visit</option>
                          <option value="Practical Class">Practical Class</option>
                          <option value="Research">Research</option>
                          <option value="Botanical Tour">Botanical Tour</option>
                          <option value="Fresher Reception">Fresher Reception</option>
                          <option value="Farewell">Farewell</option>
                          <option value="Cultural Program">Cultural Program</option>
                          <option value="Exhibition">Exhibition</option>
                          <option value="Competition">Competition</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block font-bold">Date *</label>
                        <input 
                          type="date" value={eventForm.date || ''}
                          onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                          className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] p-2.5 rounded text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block font-bold">Time *</label>
                        <input 
                          type="text" placeholder="e.g. 10:00 AM - 04:00 PM" value={eventForm.time || ''}
                          onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                          className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] p-2.5 rounded text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block font-bold">Location *</label>
                        <input 
                          type="text" placeholder="e.g. Botany Laboratory, Dinajpur Government College" value={eventForm.location || ''}
                          onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                          className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] p-2.5 rounded text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block font-bold">Organizer *</label>
                        <input 
                          type="text" placeholder="e.g. Department of Botany, DGC" value={eventForm.organizer || ''}
                          onChange={(e) => setEventForm({ ...eventForm, organizer: e.target.value })}
                          className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] p-2.5 rounded text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block font-bold">Faculty Coordinator *</label>
                        <input 
                          type="text" placeholder="e.g. Dr. Rafiqul Islam, Head of Department" value={eventForm.facultyCoordinator || ''}
                          onChange={(e) => setEventForm({ ...eventForm, facultyCoordinator: e.target.value })}
                          className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] p-2.5 rounded text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block font-bold">Chief Guest / Speakers</label>
                        <input 
                          type="text" placeholder="e.g. Prof. Abu Bakar Siddique, Principal" value={eventForm.chiefGuest || ''}
                          onChange={(e) => setEventForm({ ...eventForm, chiefGuest: e.target.value })}
                          className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] p-2.5 rounded text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block font-bold">Batch *</label>
                        <input 
                          type="text" placeholder="e.g. 1st Batch" value={eventForm.batch || ''}
                          onChange={(e) => setEventForm({ ...eventForm, batch: e.target.value })}
                          className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] p-2.5 rounded text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block font-bold">Session *</label>
                        <input 
                          type="text" placeholder="e.g. 2025-2026" value={eventForm.session || ''}
                          onChange={(e) => setEventForm({ ...eventForm, session: e.target.value })}
                          className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] p-2.5 rounded text-xs text-white"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block font-bold">Full Description *</label>
                        <textarea 
                          placeholder="Provide deep description of topics, objectives, activities and summaries..." value={eventForm.description || ''}
                          onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                          rows={4} className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] p-2.5 rounded text-xs text-white resize-none animate-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* MEDIA UPLOADS SECTION */}
                  <div className="space-y-4">
                    <h5 className="font-mono text-[10px] text-[#C79A6B] tracking-widest uppercase font-bold border-b border-[#C79A6B]/10 pb-1">02. Cover & Photo Gallery (File Uploads only)</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      {/* Cover Image zone */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block font-bold">Event Cinematic Cover *</label>
                        <div 
                          onDragEnter={(e) => { e.preventDefault(); setCoverDragActive(true); }}
                          onDragOver={(e) => { e.preventDefault(); setCoverDragActive(true); }}
                          onDragLeave={() => setCoverDragActive(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setCoverDragActive(false);
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              handleCoverUpload(e.dataTransfer.files[0]);
                            }
                          }}
                          className={`border-2 border-dashed rounded p-6 flex flex-col items-center justify-center text-center transition-all min-h-[160px] relative ${
                            coverDragActive ? 'border-[#C79A6B] bg-[#C79A6B]/10 scale-[0.99]' : 'border-[#C79A6B]/25 bg-[#111111] hover:border-[#C79A6B]/50'
                          }`}
                        >
                          {eventForm.coverImage ? (
                            <div className="w-full h-full absolute inset-0 rounded overflow-hidden group">
                              <img src={eventForm.coverImage} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                                <label className="px-3 py-1 bg-black/80 border border-[#C79A6B] text-[9px] font-mono uppercase tracking-widest text-[#C79A6B] hover:bg-[#C79A6B] hover:text-black rounded cursor-pointer">
                                  Replace Cover
                                  <input 
                                    type="file" accept="image/*" className="hidden" 
                                    onChange={(e) => { if (e.target.files?.[0]) handleCoverUpload(e.target.files[0]); }}
                                  />
                                </label>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setEventForm(prev => ({ ...prev, coverImage: '' })); }}
                                  className="px-3 py-1 bg-red-950/80 border border-red-500 text-[9px] font-mono uppercase tracking-widest text-red-400 hover:bg-red-500 hover:text-white rounded cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="w-8 h-8 text-[#8F6A48] mx-auto animate-pulse" />
                              <p className="font-serif italic text-white text-xs">Drag & Drop Cover Image Here</p>
                              <p className="text-[9px] font-mono text-[#8F6A48] uppercase tracking-widest">or browse local disk</p>
                              <label className="mt-2 inline-block px-4 py-1.5 border border-[#C79A6B]/40 hover:border-[#C79A6B] bg-[#C79A6B]/5 text-[9px] font-mono uppercase tracking-widest text-[#C79A6B] hover:bg-[#C79A6B] hover:text-black transition-all rounded cursor-pointer">
                                Choose File
                                <input 
                                  type="file" accept="image/*" className="hidden" 
                                  onChange={(e) => { if (e.target.files?.[0]) handleCoverUpload(e.target.files[0]); }}
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Additional gallery zone */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block font-bold">Event Photos (Add Multiple)</label>
                        <div 
                          onDragEnter={(e) => { e.preventDefault(); setGalleryDragActive(true); }}
                          onDragOver={(e) => { e.preventDefault(); setGalleryDragActive(true); }}
                          onDragLeave={() => setGalleryDragActive(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setGalleryDragActive(false);
                            if (e.dataTransfer.files) {
                              Array.from(e.dataTransfer.files).forEach(file => handleAdditionalImageUpload(file as File));
                            }
                          }}
                          className={`border-2 border-dashed rounded p-6 flex flex-col items-center justify-center text-center transition-all min-h-[160px] ${
                            galleryDragActive ? 'border-[#C79A6B] bg-[#C79A6B]/10 scale-[0.99]' : 'border-[#C79A6B]/25 bg-[#111111] hover:border-[#C79A6B]/50'
                          }`}
                        >
                          <div className="space-y-2">
                            <Upload className="w-8 h-8 text-[#8F6A48] mx-auto" />
                            <p className="font-serif italic text-white text-xs">Drag & Drop Additional Photos</p>
                            <p className="text-[9px] font-mono text-[#8F6A48] uppercase tracking-widest">supports multi-file uploads</p>
                            <label className="mt-2 inline-block px-4 py-1.5 border border-[#C79A6B]/40 hover:border-[#C79A6B] bg-[#C79A6B]/5 text-[9px] font-mono uppercase tracking-widest text-[#C79A6B] hover:bg-[#C79A6B] hover:text-black transition-all rounded cursor-pointer">
                              Choose Files
                              <input 
                                type="file" accept="image/*" multiple className="hidden" 
                                onChange={(e) => {
                                  if (e.target.files) {
                                    Array.from(e.target.files).forEach(file => handleAdditionalImageUpload(file as File));
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Preview zone for additional images */}
                      {eventForm.additionalImages && eventForm.additionalImages.length > 0 && (
                        <div className="col-span-2 space-y-2">
                          <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block font-bold">Uploaded Event Photos Gallery Preview ({eventForm.additionalImages.length})</label>
                          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3 bg-[#111111] border border-[#C79A6B]/15 p-4 rounded">
                            {eventForm.additionalImages.map((img, idx) => (
                              <div key={idx} className="relative aspect-square border border-[#C79A6B]/20 rounded overflow-hidden group">
                                <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                <button 
                                  type="button"
                                  onClick={() => {
                                    setEventForm(prev => {
                                      const updated = (prev.additionalImages || []).filter((_, i) => i !== idx);
                                      return { ...prev, additionalImages: updated };
                                    });
                                    triggerAlert('Image removed');
                                  }}
                                  className="absolute top-1 right-1 p-1 bg-red-950/85 hover:bg-red-600 text-red-400 hover:text-white rounded border border-red-500/30 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* MEDIA LINKS SECTION */}
                  <div className="space-y-4">
                    <h5 className="font-mono text-[10px] text-[#C79A6B] tracking-widest uppercase font-bold border-b border-[#C79A6B]/10 pb-1">03. Broadcast & Live Links</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block font-bold">YouTube Broadcast URL (Optional)</label>
                        <input 
                          type="text" placeholder="e.g. https://www.youtube.com/watch?v=..." value={eventForm.youtubeUrl || ''}
                          onChange={(e) => setEventForm({ ...eventForm, youtubeUrl: e.target.value })}
                          className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] p-2.5 rounded text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block font-bold">Facebook Live Broadcast URL (Optional)</label>
                        <input 
                          type="text" placeholder="e.g. https://www.facebook.com/..." value={eventForm.facebookLiveUrl || ''}
                          onChange={(e) => setEventForm({ ...eventForm, facebookLiveUrl: e.target.value })}
                          className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] p-2.5 rounded text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PARTICIPANTS SECTION */}
                  <div className="space-y-4">
                    <h5 className="font-mono text-[10px] text-[#C79A6B] tracking-widest uppercase font-bold border-b border-[#C79A6B]/10 pb-1">04. Registered Participants Registry</h5>
                    <div className="grid grid-cols-1 gap-4 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block font-bold">Student Participants (Comma Separated)</label>
                        <input 
                          type="text" placeholder="e.g. Sazzadur Rahman, Tasnia Ahmed, Khalid Hasan, Marufa Akter" value={participantStudentInput}
                          onChange={(e) => setParticipantStudentInput(e.target.value)}
                          className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] p-2.5 rounded text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block font-bold">Teachers & Academics Present (Comma Separated)</label>
                        <input 
                          type="text" placeholder="e.g. Dr. Rafiqul Islam, Prof. Abu Bakar, Dr. M.A. Bari" value={participantTeacherInput}
                          onChange={(e) => setParticipantTeacherInput(e.target.value)}
                          className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] p-2.5 rounded text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block font-bold">Guests & Specialists (Comma Separated)</label>
                        <input 
                          type="text" placeholder="e.g. Prof. Dr. Shamsul Alam (DU), Unani Specialist Kabiraj M. A. Karim" value={participantGuestInput}
                          onChange={(e) => setParticipantGuestInput(e.target.value)}
                          className="w-full bg-[#111111] border border-[#C79A6B]/25 focus:border-[#C79A6B] p-2.5 rounded text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* TAGS SECTION */}
                  <div className="space-y-4">
                    <h5 className="font-mono text-[10px] text-[#C79A6B] tracking-widest uppercase font-bold border-b border-[#C79A6B]/10 pb-1">05. Curation Tags</h5>
                    <div className="space-y-2 text-xs">
                      <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block font-bold">Select Active Labels for Search Filtering</label>
                      <div className="flex flex-wrap gap-2">
                        {['Seminar', 'Workshop', 'Field Visit', 'Practical Class', 'Research', 'Botanical Tour', 'Fresher Reception', 'Farewell', 'Cultural Program', 'Exhibition', 'Competition', 'Other'].map(tag => {
                          const isSelected = (eventForm.tags || []).includes(tag);
                          return (
                            <button
                              key={tag} type="button"
                              onClick={() => {
                                const currentTags = eventForm.tags || [];
                                const nextTags = isSelected 
                                  ? currentTags.filter(t => t !== tag) 
                                  : [...currentTags, tag];
                                setEventForm(prev => ({ ...prev, tags: nextTags }));
                              }}
                              className={`px-3 py-1.5 font-mono text-[10px] tracking-wider uppercase border transition-all duration-300 rounded-sm cursor-pointer ${
                                isSelected 
                                  ? 'bg-[#C79A6B] text-black border-[#C79A6B] font-bold shadow-md' 
                                  : 'bg-transparent border-[#C79A6B]/20 text-[#F5F2EE]/65 hover:border-[#C79A6B]/50 hover:text-white'
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-[#C79A6B]/15">
                  <button 
                    type="button"
                    onClick={() => { setIsAddingNew(false); setEditingId(null); }} 
                    className="px-5 py-2 border border-[#C79A6B]/20 text-[#8F6A48] text-[10px] font-mono tracking-widest uppercase hover:text-white hover:border-[#C79A6B]/55 rounded transition-all cursor-pointer"
                  >
                    Cancel Draft
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      if (!eventForm.title || !eventForm.category || !eventForm.coverImage || !eventForm.description) {
                        triggerAlert('Please fill out all required fields: Title, Category, Cover Image, and Description.', 'error');
                        return;
                      }

                      const studentList = participantStudentInput.split(',').map(s => s.trim()).filter(Boolean);
                      const teacherList = participantTeacherInput.split(',').map(t => t.trim()).filter(Boolean);
                      const guestList = participantGuestInput.split(',').map(g => g.trim()).filter(Boolean);

                      const finalEventItem: DepartmentEvent = {
                        ...eventForm,
                        id: editingId || `evt-${Date.now()}`,
                        title: eventForm.title,
                        subtitle: eventForm.subtitle || '',
                        category: eventForm.category as any,
                        description: eventForm.description,
                        date: eventForm.date || new Date().toISOString().split('T')[0],
                        time: eventForm.time || '10:00 AM',
                        location: eventForm.location || 'Dinajpur Government College',
                        organizer: eventForm.organizer || 'Department of Botany',
                        chiefGuest: eventForm.chiefGuest || '',
                        facultyCoordinator: eventForm.facultyCoordinator || 'Dr. Rafiqul Islam',
                        batch: eventForm.batch || '1st Batch',
                        session: eventForm.session || '2025-2026',
                        coverImage: eventForm.coverImage,
                        additionalImages: eventForm.additionalImages || [],
                        youtubeUrl: eventForm.youtubeUrl || '',
                        facebookLiveUrl: eventForm.facebookLiveUrl || '',
                        participants: {
                          students: studentList,
                          teachers: teacherList,
                          guests: guestList
                        },
                        tags: eventForm.tags || [eventForm.category]
                      } as DepartmentEvent;

                      if (editingId) {
                        onEditEvent(finalEventItem);
                        triggerAlert('Event milestone card updated');
                      } else {
                        onAddEvent(finalEventItem);
                        triggerAlert('New event milestone successfully cataloged');
                      }
                      setIsAddingNew(false);
                      setEditingId(null);
                    }}
                    className="px-6 py-2 bg-[#C79A6B] text-black text-[10px] font-mono uppercase font-bold tracking-widest hover:bg-[#F5F2EE] transition-all rounded cursor-pointer"
                  >
                    {editingId ? 'Save Milestone Card' : 'Publish Milestone'}
                  </button>
                </div>
              </div>
            )}

            {/* EVENT GRID DISPLAY */}
            {!isAddingNew && !editingId && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-[#111111]/40 border border-[#C79A6B]/10 p-3 rounded text-[10px] font-mono tracking-widest uppercase text-[#8F6A48]">
                  <span>Archived Milestones Count: {events.length}</span>
                  <span>Active Security Key Valid</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map(evt => (
                    <div 
                      key={evt.id} 
                      className="p-4 bg-[#111111]/90 border border-[#C79A6B]/15 hover:border-[#C79A6B]/35 transition-all duration-300 rounded flex gap-4 items-center relative overflow-hidden group"
                    >
                      <div className="w-20 h-20 bg-neutral-900 border border-[#C79A6B]/10 rounded overflow-hidden flex-shrink-0">
                        <img src={evt.coverImage} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-grow space-y-1 select-text">
                        <span className="text-[8.5px] font-mono tracking-widest text-[#C79A6B] border border-[#C79A6B]/25 px-1.5 py-0.5 rounded-xs uppercase">
                          {evt.category}
                        </span>
                        <h5 className="font-serif text-sm font-medium text-white truncate max-w-[280px] pt-1">
                          {evt.title}
                        </h5>
                        <p className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wide truncate max-w-[280px]">
                          {evt.date} • {evt.location}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2.5 font-mono text-[9px] uppercase tracking-widest border-l border-[#C79A6B]/10 pl-3">
                        <button 
                          onClick={() => { 
                            setEventForm(evt); 
                            setParticipantStudentInput(evt.participants?.students?.join(', ') || '');
                            setParticipantTeacherInput(evt.participants?.teachers?.join(', ') || '');
                            setParticipantGuestInput(evt.participants?.guests?.join(', ') || '');
                            setEditingId(evt.id); 
                            setIsAddingNew(false); 
                          }} 
                          className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer transition-colors"
                        >
                          Edit
                        </button>
                        {userRole !== 'CR' && (
                          <button 
                            onClick={() => { 
                              if (confirm('Are you absolutely sure you want to delete this event milestone? This action cannot be reversed.')) { 
                                onDeleteEvent(evt.id); 
                                triggerAlert('Event milestone removed'); 
                              } 
                            }} 
                            className="text-red-400 hover:text-red-300 hover:underline cursor-pointer transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeModule === 'resources' && (
          <div className="space-y-6 animate-fade-in text-left select-text">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#C79A6B]/15 pb-4 gap-4">
              <div>
                <h2 className="font-serif text-2xl font-light text-[#F5F2EE]">
                  Academic <span className="font-serif italic text-[#C79A6B]">Notes Management</span>
                </h2>
                <p className="text-[10px] font-mono text-[#8F6A48] tracking-widest uppercase">
                  Fully dynamic peerless repository. Upload, publish, and pin academic PDFs.
                </p>
              </div>
              
              {!isAddingNew && !editingId && (
                <button
                  onClick={() => {
                    setNoteForm({
                      title: '',
                      subtitle: '',
                      author: '',
                      teacher: '',
                      department: 'Department of Botany',
                      session: '2025-2026',
                      semester: '1st Semester',
                      subject: 'Plant Physiology',
                      category: 'Class Note',
                      description: '',
                      keywords: [],
                      pdfUrl: '',
                      thumbnailUrl: '',
                      fileSize: '0.0 MB',
                      downloadCount: 0,
                      featured: false,
                      published: true
                    });
                    setIsAddingNew(true);
                  }}
                  className="px-4 py-2 bg-[#C79A6B] text-black text-[10px] font-mono tracking-widest uppercase font-bold hover:bg-[#F5F2EE] transition-all cursor-pointer flex items-center justify-center gap-2 rounded-xs self-start"
                >
                  <Plus className="w-4 h-4" /> Add Academic PDF
                </button>
              )}
            </div>

            {/* FORM FOR ADDING / EDITING ACADEMIC NOTE */}
            {(isAddingNew || editingId) && (
              <div className="bg-[#0B0B0B]/90 border border-[#C79A6B]/25 rounded-xs p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-center border-b border-[#C79A6B]/15 pb-3">
                  <h4 className="font-serif text-[#C79A6B] text-sm uppercase font-bold tracking-wider">
                    {editingId ? 'Edit Archived Document Card' : 'Catalog New Academic Note & PDF'}
                  </h4>
                  <button
                    onClick={() => { setIsAddingNew(false); setEditingId(null); }}
                    className="p-1 border border-[#C79A6B]/10 hover:border-[#C79A6B]/35 text-[#8F6A48] hover:text-[#F5F2EE] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#F5F2EE]">
                  {/* Title & Subtitle */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block">Document Title *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Angiosperm Taxonomy and Morphological Keys" 
                      value={noteForm.title || ''}
                      onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                      className="w-full bg-[#111111] border border-[#C79A6B]/20 p-3 rounded-none outline-none focus:border-[#C79A6B] text-[#F5F2EE] font-sans"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block">Subtitle / Lecture Topic</label>
                    <input 
                      type="text" 
                      placeholder="e.g. A systematic identification guide for northern Bengal trees" 
                      value={noteForm.subtitle || ''}
                      onChange={(e) => setNoteForm({ ...noteForm, subtitle: e.target.value })}
                      className="w-full bg-[#111111] border border-[#C79A6B]/20 p-3 rounded-none outline-none focus:border-[#C79A6B] text-[#F5F2EE] font-sans"
                    />
                  </div>

                  {/* Authorship & Guidance */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block">Compiler / Student Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Afrina Sultana" 
                      value={noteForm.author || ''}
                      onChange={(e) => setNoteForm({ ...noteForm, author: e.target.value })}
                      className="w-full bg-[#111111] border border-[#C79A6B]/20 p-3 rounded-none outline-none focus:border-[#C79A6B] text-[#F5F2EE]"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block">Verifying Teacher Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Prof. Anisur Rahman" 
                      value={noteForm.teacher || ''}
                      onChange={(e) => setNoteForm({ ...noteForm, teacher: e.target.value })}
                      className="w-full bg-[#111111] border border-[#C79A6B]/20 p-3 rounded-none outline-none focus:border-[#C79A6B] text-[#F5F2EE]"
                      required
                    />
                  </div>

                  {/* Dept & Session */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block">Department</label>
                    <input 
                      type="text" 
                      value={noteForm.department || 'Department of Botany'}
                      onChange={(e) => setNoteForm({ ...noteForm, department: e.target.value })}
                      className="w-full bg-[#111111]/60 border border-[#C79A6B]/15 p-3 rounded-none text-[#F5F2EE]/70"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block">Academic Session</label>
                    <input 
                      type="text" 
                      value={noteForm.session || '2025-2026'}
                      onChange={(e) => setNoteForm({ ...noteForm, session: e.target.value })}
                      className="w-full bg-[#111111]/60 border border-[#C79A6B]/15 p-3 rounded-none text-[#F5F2EE]/70"
                    />
                  </div>

                  {/* Dropdowns */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block">Semester *</label>
                    <select
                      value={noteForm.semester || '1st Semester'}
                      onChange={(e) => setNoteForm({ ...noteForm, semester: e.target.value })}
                      className="w-full bg-[#111111] border border-[#C79A6B]/20 p-3 rounded-none outline-none focus:border-[#C79A6B] text-[#F5F2EE] font-mono"
                    >
                      {['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester', 'M.S. General', 'Others'].map(sem => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block">Subject *</label>
                    <select
                      value={noteForm.subject || 'Plant Physiology'}
                      onChange={(e) => setNoteForm({ ...noteForm, subject: e.target.value })}
                      className="w-full bg-[#111111] border border-[#C79A6B]/20 p-3 rounded-none outline-none focus:border-[#C79A6B] text-[#F5F2EE] font-mono"
                    >
                      {['Plant Physiology', 'Plant Taxonomy', 'Plant Anatomy', 'Plant Ecology', 'Genetics', 'Microbiology', 'Biochemistry', 'Bryophyte', 'Pteridophyte', 'Gymnosperm', 'Angiosperm', 'Plant Pathology', 'Economic Botany', 'Systematic Botany', 'Others'].map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block">Category *</label>
                    <select
                      value={noteForm.category || 'Class Note'}
                      onChange={(e) => setNoteForm({ ...noteForm, category: e.target.value })}
                      className="w-full bg-[#111111] border border-[#C79A6B]/20 p-3 rounded-none outline-none focus:border-[#C79A6B] text-[#F5F2EE] font-mono"
                    >
                      {['Class Note', 'Lecture Note', 'Hand Note', 'Lab Manual', 'Practical Sheet', 'Assignment', 'Presentation', 'Question Bank', 'Previous Question', 'Suggestion', 'Research Paper', 'Field Guide', 'Taxonomic Key', 'Book', 'Seminar', 'Others'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Keywords (comma separated) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block">Keywords (comma-separated)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. physiology, transpiration, lab" 
                      value={noteForm.keywords ? noteForm.keywords.join(', ') : ''}
                      onChange={(e) => {
                        const kw = e.target.value.split(',').map(k => k.trim()).filter(Boolean);
                        setNoteForm({ ...noteForm, keywords: kw });
                      }}
                      className="w-full bg-[#111111] border border-[#C79A6B]/20 p-3 rounded-none outline-none focus:border-[#C79A6B] text-[#F5F2EE]"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-mono text-[#8F6A48] uppercase tracking-wider block">Scope & Curation Description *</label>
                    <textarea 
                      rows={3}
                      placeholder="A comprehensive summary describing the content and context of the academic note..." 
                      value={noteForm.description || ''}
                      onChange={(e) => setNoteForm({ ...noteForm, description: e.target.value })}
                      className="w-full bg-[#111111] border border-[#C79A6B]/20 p-3 rounded-none outline-none focus:border-[#C79A6B] text-[#F5F2EE]"
                      required
                    />
                  </div>

                  {/* PDF DRAG & DROP FILE UPLOADER */}
                  <div className="md:col-span-2 border border-[#C79A6B]/20 p-4 bg-[#0B0B0B] space-y-4">
                    <span className="text-[10px] font-mono text-[#C79A6B] block uppercase font-bold">📄 PDF FILE CONFIGURATION</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Drag & Drop PDF */}
                      <div className="border border-dashed border-[#C79A6B]/30 hover:border-[#C79A6B]/60 p-4 text-center rounded flex flex-col items-center justify-center bg-[#111111]/30 transition-all">
                        <Upload className="w-8 h-8 text-[#C79A6B] opacity-70 mb-2 animate-pulse" />
                        <span className="text-[10px] font-mono text-[#F5F2EE]/80 block">Drag & Drop PDF File Here</span>
                        <span className="text-[9px] font-mono text-[#8F6A48] block mt-1">or click below to browse</span>
                        
                        <input 
                          type="file" 
                          accept=".pdf"
                          id="admin-pdf-upload"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const f = e.target.files[0];
                              const sizeStr = (f.size / (1024 * 1024)).toFixed(1) + ' MB';
                              
                              // Convert to Base64 to support LocalStorage persistence
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                if (ev.target?.result && typeof ev.target.result === 'string') {
                                  setNoteForm(prev => ({
                                    ...prev,
                                    pdfUrl: ev.target!.result as string,
                                    fileSize: sizeStr
                                  }));
                                  triggerAlert(`PDF "${f.name}" loaded successfully (${sizeStr})`);
                                }
                              };
                              reader.readAsDataURL(f);
                            }
                          }}
                        />
                        <label 
                          htmlFor="admin-pdf-upload"
                          className="mt-3 px-3 py-1 bg-[#C79A6B]/10 hover:bg-[#C79A6B]/25 border border-[#C79A6B]/35 text-[9px] font-mono text-[#C79A6B] uppercase tracking-wider cursor-pointer transition-all"
                        >
                          Browse PDF
                        </label>
                      </div>

                      {/* Google Drive / Direct URL link */}
                      <div className="space-y-3 flex flex-col justify-center">
                        <div>
                          <label className="text-[9px] font-mono text-[#8F6A48] uppercase tracking-wider block">Direct PDF Link / Google Drive URL (Fallback)</label>
                          <input 
                            type="text" 
                            placeholder="https://drive.google.com/file/d/..." 
                            value={noteForm.pdfUrl || ''}
                            onChange={(e) => setNoteForm({ ...noteForm, pdfUrl: e.target.value })}
                            className="w-full bg-[#111111] border border-[#C79A6B]/20 p-2.5 rounded-none outline-none text-[11px] font-mono mt-1 text-[#F5F2EE]"
                          />
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-mono text-[#8F6A48]">
                          <div>
                            <span className="block text-[8px] text-[#C79A6B]">FILE SIZE DETECTED:</span>
                            <span className="text-[#F5F2EE] font-bold">{noteForm.fileSize || '0.0 MB'}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-[#C79A6B]">SOURCE TYPE:</span>
                            <span className="text-[#F5F2EE] truncate max-w-[140px] block">
                              {noteForm.pdfUrl?.startsWith('data:application/pdf') ? 'Base64 Uploaded File' : noteForm.pdfUrl ? 'External URL Link' : 'No File Linked'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* OPTIONAL THUMBNAIL COVER */}
                  <div className="md:col-span-2 border border-[#C79A6B]/20 p-4 bg-[#0B0B0B] space-y-4">
                    <span className="text-[10px] font-mono text-[#C79A6B] block uppercase font-bold">🖼️ COVER THUMBNAIL (OPTIONAL)</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Image Upload */}
                      <div className="border border-dashed border-[#C79A6B]/30 hover:border-[#C79A6B]/60 p-4 text-center rounded flex flex-col items-center justify-center bg-[#111111]/30 transition-all">
                        <Upload className="w-8 h-8 text-[#C79A6B] opacity-70 mb-2" />
                        <span className="text-[10px] font-mono text-[#F5F2EE]/80 block">Drag & Drop Thumbnail Image</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          id="admin-thumbnail-upload"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const f = e.target.files[0];
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                if (ev.target?.result && typeof ev.target.result === 'string') {
                                  setNoteForm(prev => ({
                                    ...prev,
                                    thumbnailUrl: ev.target!.result as string
                                  }));
                                  triggerAlert('Thumbnail cover attached successfully');
                                }
                              };
                              reader.readAsDataURL(f);
                            }
                          }}
                        />
                        <label 
                          htmlFor="admin-thumbnail-upload"
                          className="mt-3 px-3 py-1 bg-[#C79A6B]/10 hover:bg-[#C79A6B]/25 border border-[#C79A6B]/35 text-[9px] font-mono text-[#C79A6B] uppercase tracking-wider cursor-pointer transition-all"
                        >
                          Browse Cover
                        </label>
                      </div>

                      {/* Cover Preview */}
                      <div className="flex items-center justify-center">
                        {noteForm.thumbnailUrl ? (
                          <div className="relative group w-32 aspect-[3/4] border border-[#C79A6B]/30 overflow-hidden bg-[#111111]">
                            <img src={noteForm.thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setNoteForm(prev => ({ ...prev, thumbnailUrl: '' }))}
                              className="absolute top-1 right-1 p-1 bg-red-600/90 hover:bg-red-700 text-white rounded-full transition-colors cursor-pointer"
                              title="Remove image"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-32 aspect-[3/4] border border-dashed border-[#C79A6B]/15 flex flex-col items-center justify-center text-[#8F6A48] text-center p-2 text-[9px]">
                            <span>No cover linked. Fallback icon will represent this note in the catalog grid.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Settings toggles */}
                  <div className="md:col-span-2 flex flex-wrap gap-8 bg-[#111111] p-4 border border-[#C79A6B]/15 justify-start">
                    <label className="flex items-center gap-2 cursor-pointer font-mono text-[10px] tracking-wider uppercase">
                      <input 
                        type="checkbox" 
                        checked={noteForm.featured || false}
                        onChange={(e) => setNoteForm({ ...noteForm, featured: e.target.checked })}
                        className="w-4 h-4 accent-[#C79A6B]"
                      />
                      <span>⭐ Pin/Feature Note (Always Show at Top)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-mono text-[10px] tracking-wider uppercase">
                      <input 
                        type="checkbox" 
                        checked={noteForm.published !== false}
                        onChange={(e) => setNoteForm({ ...noteForm, published: e.target.checked })}
                        className="w-4 h-4 accent-[#C79A6B]"
                      />
                      <span>👁️ Publish Note (Visible on Public Website)</span>
                    </label>
                  </div>

                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#C79A6B]/15">
                  <button 
                    onClick={() => { setIsAddingNew(false); setEditingId(null); }} 
                    className="px-6 py-2.5 text-xs font-mono tracking-wider uppercase text-[#8F6A48] hover:text-[#F5F2EE] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      if (!noteForm.title || !noteForm.author || !noteForm.teacher || !noteForm.description) {
                        triggerAlert('Please fill out all required fields (Title, Compiler Name, Verifying Teacher, and Description).', 'error');
                        return;
                      }

                      // Check fallback direct file size if none exists
                      const verifiedForm = {
                        ...noteForm,
                        fileSize: noteForm.fileSize || '2.8 MB'
                      };

                      if (editingId) {
                        onEditAcademicNote({ 
                          ...verifiedForm, 
                          id: editingId,
                          updatedAt: new Date().toISOString()
                        } as AcademicNote);
                        triggerAlert('Academic note indexed record updated');
                      } else {
                        onAddAcademicNote({ 
                          ...verifiedForm, 
                          id: `note-${Date.now()}`,
                          downloadCount: 0,
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString()
                        } as AcademicNote);
                        triggerAlert('New academic note successfully published');
                      }
                      setIsAddingNew(false);
                      setEditingId(null);
                    }}
                    className="px-6 py-2.5 bg-[#C79A6B] text-black text-xs font-mono uppercase font-bold hover:bg-[#F5F2EE] transition-all cursor-pointer"
                  >
                    {editingId ? 'Update Archived Note' : 'Publish New Note'}
                  </button>
                </div>
              </div>
            )}

            {/* LIVE SEARCH & MANAGEMENT LIST GRID */}
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter and search archived PDFs by title, category, subject, teacher, compiler..."
                  value={adminNoteSearch}
                  onChange={(e) => setAdminNoteSearch(e.target.value)}
                  className="w-full bg-[#111111] border border-[#C79A6B]/20 pl-11 pr-4 py-3 text-xs font-mono text-white outline-none focus:border-[#C79A6B] transition-colors"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F6A48]" />
                {adminNoteSearch && (
                  <button onClick={() => setAdminNoteSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8F6A48] hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* LIST VIEWS */}
              <div className="space-y-3">
                {academicNotes
                  .filter(note => {
                    const q = adminNoteSearch.toLowerCase();
                    return note.title.toLowerCase().includes(q) ||
                      note.category.toLowerCase().includes(q) ||
                      note.subject.toLowerCase().includes(q) ||
                      note.author.toLowerCase().includes(q) ||
                      note.teacher.toLowerCase().includes(q) ||
                      note.semester.toLowerCase().includes(q);
                  })
                  .map(note => (
                    <div 
                      key={note.id} 
                      className={`p-4 bg-[#0B0B0B]/70 border hover:border-[#C79A6B]/40 rounded-none flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                        note.featured ? 'border-[#C79A6B]/30' : 'border-[#C79A6B]/15'
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-grow text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-serif text-sm font-medium text-[#F5F2EE] truncate block">{note.title}</span>
                          <span className="px-2 py-0.5 bg-[#C79A6B]/10 border border-[#C79A6B]/25 text-[8px] font-mono text-[#C79A6B] uppercase rounded-full tracking-wider">
                            {note.category}
                          </span>
                          {note.featured && (
                            <span className="px-1.5 py-0.5 bg-[#C79A6B] text-[7.5px] font-mono text-black font-bold uppercase rounded">
                              Pinned
                            </span>
                          )}
                          {!note.published && (
                            <span className="px-1.5 py-0.5 bg-red-600/20 text-[7.5px] font-mono text-red-400 border border-red-500/20 uppercase rounded">
                              Hidden
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-[#8F6A48] tracking-wide truncate">
                          Subject: {note.subject} • Semester: {note.semester} • Compiled by: {note.author} • Size: {note.fileSize}
                        </p>
                        <p className="text-[9px] font-mono text-[#8F6A48] italic">
                          Assigned Advisor: {note.teacher} • <span className="text-[#C79A6B]">Stats: {note.downloadCount} downloads</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3.5 self-end md:self-auto flex-shrink-0 font-mono text-xs">
                        <button 
                          onClick={() => {
                            setNoteForm({ ...note });
                            setEditingId(note.id);
                            setIsAddingNew(false);
                          }} 
                          className="text-[#C79A6B] hover:text-[#F5F2EE] flex items-center gap-1 transition-colors cursor-pointer hover:underline"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        {userRole !== 'CR' && (
                          <button 
                            onClick={() => {
                              if (confirm(`Are you absolutely sure you want to permanently delete the archived document "${note.title}"?`)) {
                                onDeleteAcademicNote(note.id);
                                triggerAlert('Academic note deleted permanently');
                              }
                            }} 
                            className="text-red-400 hover:text-red-200 flex items-center gap-1 transition-colors cursor-pointer hover:underline"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                {academicNotes.length === 0 && (
                  <p className="text-center text-xs text-[#8F6A48] py-8">No academic resources cataloged. Click "Add Academic PDF" to publish your first botanical reference note.</p>
                )}
              </div>
            </div>

          </div>
        )}



        {activeModule === 'settings' && (
          <div className="space-y-8 animate-fade-in">
            <div className="border-b border-[#C79A6B]/15 pb-4">
              <h2 className="font-serif text-2xl font-light text-[#F5F2EE]">
                System <span className="font-serif italic text-[#C79A6B]">Parameters</span>
              </h2>
              <p className="text-[10px] font-mono text-[#8F6A48] tracking-widest uppercase">
                Configure meta settings and cohort academic session tags
              </p>
            </div>

            <div className="bg-[#0B0B0B]/70 border border-[#C79A6B]/15 rounded p-6 md:p-8 space-y-6 max-w-xl">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-[#C79A6B] uppercase tracking-widest block font-bold">
                  Academic Session Period Tag
                </label>
                <input 
                  type="text" 
                  value={sessionYear}
                  onChange={(e) => onUpdateSessionYear(e.target.value)}
                  className="w-full bg-[#111111] border border-[#C79A6B]/35 focus:border-[#C79A6B] text-sm font-mono text-[#F5F2EE] p-3 rounded outline-none" 
                  placeholder="e.g. 2025-2026"
                />
                <p className="text-[10px] font-mono text-[#8F6A48] leading-relaxed pt-1">
                  This tag displays as the primary session indicator in the header, footer and administrative files. Modifying it immediately mutates all visual headers.
                </p>
              </div>

              {/* Hero Background configuration */}
              <div className="space-y-4 border-t border-[#C79A6B]/10 pt-6">
                <label className="text-[10px] font-mono text-[#C79A6B] uppercase tracking-widest block font-bold">
                  Hero Section Background Image
                </label>

                {/* Drag & Drop File Upload area */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
                    dragActive 
                      ? 'border-[#C79A6B] bg-[#C79A6B]/10 text-[#C79A6B]' 
                      : 'border-[#C79A6B]/25 hover:border-[#C79A6B]/50 bg-[#111111]/30 text-[#8F6A48]'
                  }`}
                >
                  <input
                    type="file"
                    id="hero-bg-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <label 
                    htmlFor="hero-bg-upload"
                    className="flex flex-col items-center justify-center gap-3 cursor-pointer select-none group"
                  >
                    <div className="w-10 h-10 rounded-sm border border-[#C79A6B]/20 flex items-center justify-center bg-[#0B0B0B] group-hover:border-[#C79A6B] transition-colors">
                      <Upload className="w-4 h-4 text-[#C79A6B] group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <p className="text-xs font-mono font-semibold tracking-wider text-white uppercase group-hover:text-[#C79A6B] transition-colors">
                        Upload Custom Background
                      </p>
                      <p className="text-[10px] font-mono text-[#8F6A48] mt-1">
                        Drag & drop your image file here or <span className="text-[#C79A6B] underline font-semibold">Browse files</span>
                      </p>
                    </div>
                  </label>
                </div>
                
                {/* Input URL field */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono text-[#8F6A48] uppercase tracking-wider block font-semibold">
                    Or Enter Image URL:
                  </span>
                  <input 
                    type="text" 
                    value={heroBgImage}
                    onChange={(e) => onUpdateHeroBgImage(e.target.value)}
                    className="w-full bg-[#111111] border border-[#C79A6B]/35 focus:border-[#C79A6B] text-sm font-mono text-[#F5F2EE] p-3 rounded outline-none" 
                    placeholder="Enter Unsplash image URL or local path..."
                  />
                </div>
                
                {/* Image presets */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-[#8F6A48] uppercase tracking-wider block font-semibold">
                    Quick Preset Botanical Scenes:
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      {
                        url: '/src/assets/images/botany_college_building_1783496321472.jpg',
                        title: 'Default DGC Building'
                      },
                      {
                        url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=1200',
                        title: 'Modern Greenhouse'
                      },
                      {
                        url: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=1200',
                        title: 'Garden Flora'
                      },
                      {
                        url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=1200',
                        title: 'Barind Forest'
                      },
                      {
                        url: 'https://images.unsplash.com/photo-1401333109030-a516e46af3be?auto=format&fit=crop&q=80&w=1200',
                        title: 'Barind Monstera'
                      },
                      {
                        url: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&q=80&w=1200',
                        title: 'Vintage Ferns'
                      },
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onUpdateHeroBgImage(preset.url)}
                        title={preset.title}
                        className={`relative aspect-video rounded overflow-hidden border cursor-pointer group transition-all ${
                          heroBgImage === preset.url 
                            ? 'border-[#C79A6B] ring-1 ring-[#C79A6B]' 
                            : 'border-[#C79A6B]/15 hover:border-[#C79A6B]/40'
                        }`}
                      >
                        <img 
                          src={preset.url} 
                          alt={preset.title} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-350"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                        <span className="absolute bottom-1 right-1 text-[7px] font-mono bg-[#0B0B0B]/80 text-[#C79A6B] px-1 rounded truncate max-w-full">
                          {preset.title.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sliders for Brightness & Blur */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-[#C79A6B]/15 bg-[#111111]/40 rounded-lg my-4">
                  {/* Brightness Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-[#C79A6B] uppercase tracking-wider font-semibold">
                        Brightness (উজ্জ্বলতা)
                      </span>
                      <span className="text-xs font-mono text-[#F5F2EE] font-bold">
                        {heroBgBrightness}%
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      value={heroBgBrightness}
                      onChange={(e) => onUpdateHeroBgBrightness(parseInt(e.target.value, 10))}
                      className="w-full accent-[#C79A6B] cursor-pointer h-1.5 bg-[#1A1A1A] rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[8px] font-mono text-[#8F6A48]">
                      <span>Dark (১০%)</span>
                      <span>Bright (১০০%)</span>
                    </div>
                  </div>

                  {/* Blur Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-[#C79A6B] uppercase tracking-wider font-semibold">
                        Blur (ঝাপসা ভাব)
                      </span>
                      <span className="text-xs font-mono text-[#F5F2EE] font-bold">
                        {heroBgBlur}px
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="20" 
                      value={heroBgBlur}
                      onChange={(e) => onUpdateHeroBgBlur(parseInt(e.target.value, 10))}
                      className="w-full accent-[#C79A6B] cursor-pointer h-1.5 bg-[#1A1A1A] rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[8px] font-mono text-[#8F6A48]">
                      <span>Sharp (০px)</span>
                      <span>Max Blur (২০px)</span>
                    </div>
                  </div>
                </div>

                {/* Preview Card */}
                <div className="space-y-2 pt-2">
                  <span className="text-[9px] font-mono text-[#8F6A48] uppercase tracking-wider block font-semibold">
                    Live Hero Background Preview:
                  </span>
                  <div className="relative aspect-[21/9] w-full rounded overflow-hidden border border-[#C79A6B]/20 bg-[#0B0B0B]">
                    <img 
                      src={heroBgImage} 
                      alt="Hero Live Preview" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-all duration-300"
                      style={{
                        opacity: heroBgBrightness / 100,
                        filter: `blur(${heroBgBlur}px)`
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/src/assets/images/botany_college_building_1783496321472.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-transparent opacity-80" />
                    <div className="absolute top-2 left-3">
                      <span className="text-[8px] font-mono bg-black/85 text-[#C79A6B] px-2 py-0.5 border border-[#C79A6B]/20 rounded tracking-widest uppercase font-bold">
                        DGC BOTANY
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-3">
                      <p className="font-serif text-sm font-light text-white tracking-wide">
                        BOTANY NEXUS
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] font-mono text-[#8F6A48] leading-relaxed pt-1">
                  Changes apply immediately. Presets offer curated Department of Botany & Greenhouse photos.
                </p>
              </div>

              <div className="space-y-2 border-t border-[#C79A6B]/10 pt-6">
                <span className="text-[10px] font-mono text-[#C79A6B] uppercase tracking-widest block font-bold">
                  Museum System Status
                </span>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="bg-[#111111] p-3 rounded border border-[#C79A6B]/10">
                    <p className="text-[9px] font-mono text-[#8F6A48] uppercase">CURATOR STATE</p>
                    <p className="text-xs font-mono font-bold text-emerald-400 mt-1">● SYNCHRONIZED</p>
                  </div>
                  <div className="bg-[#111111] p-3 rounded border border-[#C79A6B]/10">
                    <p className="text-[9px] font-mono text-[#8F6A48] uppercase">CORE CACHE ENGINE</p>
                    <p className="text-xs font-mono font-bold text-[#C79A6B] mt-1">LOCAL STORAGE</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#C79A6B]/15 flex justify-end">
                <button 
                  onClick={() => triggerAlert('Global configurations committed', 'success')}
                  className="px-6 py-2.5 bg-[#C79A6B] text-black text-[10px] font-mono font-bold tracking-widest uppercase rounded flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Commit Settings
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Custom Mentor Delete Confirmation Modal */}
      {deleteConfirmMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-left">
          <div className="w-full max-w-md bg-[#0D0D0D] border border-red-500/30 rounded p-6 md:p-8 space-y-6 shadow-2xl relative">
            <button 
              onClick={() => setDeleteConfirmMentor(null)} 
              className="absolute top-4 right-4 text-[#8F6A48] hover:text-[#F5F2EE] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-lg font-light text-[#F5F2EE]">
                Revoke <span className="italic text-red-400">Mentor / Advisor Registry</span>
              </h4>
              <p className="text-[9px] text-[#8F6A48] font-mono uppercase tracking-wider">
                This action is permanent and cannot be undone
              </p>
            </div>

            <div className="p-4 bg-red-950/15 border border-red-500/10 rounded text-xs text-[#F5F2EE]/80 space-y-2">
              <p>Are you sure you want to permanently delete this Mentor / Advisor profile?</p>
              <div className="flex items-center gap-3 pt-2">
                <img src={deleteConfirmMentor.avatarUrl} className="w-10 h-10 rounded-full object-cover border border-[#C79A6B]/20" referrerPolicy="no-referrer" />
                <div>
                  <p className="font-serif font-bold text-white text-sm">{deleteConfirmMentor.name}</p>
                  <p className="font-mono text-[10px] text-[#8F6A48]">{deleteConfirmMentor.role}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 font-mono text-[10px] uppercase tracking-wider">
              <button
                onClick={() => setDeleteConfirmMentor(null)}
                className="px-4 py-2.5 border border-[#C79A6B]/20 text-[#8F6A48] hover:text-white rounded transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteContributor(deleteConfirmMentor.id);
                  triggerAlert('Mentor / Advisor successfully removed', 'success');
                  setDeleteConfirmMentor(null);
                }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded transition-all cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
