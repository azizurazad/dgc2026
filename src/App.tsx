import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  syncCollection, 
  addFirestoreDoc, 
  updateFirestoreDoc, 
  deleteFirestoreDoc 
} from './lib/firebase';
import Header from './components/Header';
import Hero from './components/Hero';
import Philosophy from './components/Philosophy';
import PlantArchive from './components/PlantArchive';
import Community from './components/Community';
import Gallery from './components/Gallery';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import PortalLogin from './components/PortalLogin';
import AccessDenied from './components/AccessDenied';
import Footer from './components/Footer';

// Types and baseline preloaded data
import { Plant, Student, GalleryItem, Contributor, AppStats, AcademicNote, DepartmentEvent, AppSettings } from './types';
import { 
  INITIAL_PLANTS, 
  INITIAL_STUDENTS, 
  INITIAL_GALLERY, 
  INITIAL_CONTRIBUTORS, 
  INITIAL_STATS,
  INITIAL_ACADEMIC_NOTES,
  INITIAL_EVENTS
} from './data/initialData';
import AcademicNotes from './components/AcademicNotes';

const INITIAL_SETTINGS: AppSettings = {
  id: 'main_settings',
  sessionYear: '2025-2026',
  communityTitle: 'Botany Community',
  communitySubtitle: 'Meet the students, contributors, explorers, and the growing botanical community of the Department of Botany.',
  heroBgImage: '/src/assets/images/botany_college_building_1783496321472.jpg',
  heroBgBrightness: 65,
  heroBgBlur: 0
};

export default function App() {
  const [currentView, setCurrentView] = useState<'site' | 'admin'>('site');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('dgc_admin_auth') === 'true';
  });
  
  // Student Portal Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('dgc_portal_auth') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<Student | null>(() => {
    const cached = localStorage.getItem('dgc_portal_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);

  const [sessionYear, setSessionYear] = useState<string>(() => {
    return localStorage.getItem('dgc_session_year') || '2025-2026';
  });

  const [communityTitle, setCommunityTitle] = useState<string>(() => {
    return localStorage.getItem('dgc_community_title') || 'Botany Community';
  });

  const [communitySubtitle, setCommunitySubtitle] = useState<string>(() => {
    return localStorage.getItem('dgc_community_subtitle') || 'Meet the students, contributors, explorers, and the growing botanical community of the Department of Botany.';
  });

  const [heroBgImage, setHeroBgImage] = useState<string>(() => {
    return localStorage.getItem('dgc_hero_bg_image') || '/src/assets/images/botany_college_building_1783496321472.jpg';
  });

  const [heroBgBrightness, setHeroBgBrightness] = useState<number>(() => {
    const val = localStorage.getItem('dgc_hero_bg_brightness');
    return val ? parseInt(val, 10) : 65;
  });

  const [heroBgBlur, setHeroBgBlur] = useState<number>(() => {
    const val = localStorage.getItem('dgc_hero_bg_blur');
    return val ? parseInt(val, 10) : 0;
  });

  const updateSettingsDoc = (partial: Partial<AppSettings>) => {
    const sYear = partial.sessionYear !== undefined ? partial.sessionYear : localStorage.getItem('dgc_session_year') || '2025-2026';
    const cTitle = partial.communityTitle !== undefined ? partial.communityTitle : localStorage.getItem('dgc_community_title') || 'Botany Community';
    const cSubtitle = partial.communitySubtitle !== undefined ? partial.communitySubtitle : localStorage.getItem('dgc_community_subtitle') || 'Meet the students, contributors, explorers, and the growing botanical community of the Department of Botany.';
    const hBgImage = partial.heroBgImage !== undefined ? partial.heroBgImage : localStorage.getItem('dgc_hero_bg_image') || '/src/assets/images/botany_college_building_1783496321472.jpg';
    
    const brightnessVal = localStorage.getItem('dgc_hero_bg_brightness');
    const hBgBrightness = partial.heroBgBrightness !== undefined ? partial.heroBgBrightness : (brightnessVal ? parseInt(brightnessVal, 10) : 65);
    
    const blurVal = localStorage.getItem('dgc_hero_bg_blur');
    const hBgBlur = partial.heroBgBlur !== undefined ? partial.heroBgBlur : (blurVal ? parseInt(blurVal, 10) : 0);

    const updatedSettings: AppSettings = {
      id: 'main_settings',
      sessionYear: sYear,
      communityTitle: cTitle,
      communitySubtitle: cSubtitle,
      heroBgImage: hBgImage,
      heroBgBrightness: hBgBrightness,
      heroBgBlur: hBgBlur,
    };
    updateFirestoreDoc('settings', updatedSettings);
  };

  const handleUpdateCommunityTitle = (title: string) => {
    setCommunityTitle(title);
    localStorage.setItem('dgc_community_title', title);
    updateSettingsDoc({ communityTitle: title });
  };

  const handleUpdateCommunitySubtitle = (subtitle: string) => {
    setCommunitySubtitle(subtitle);
    localStorage.setItem('dgc_community_subtitle', subtitle);
    updateSettingsDoc({ communitySubtitle: subtitle });
  };

  const handleUpdateHeroBgImage = (url: string) => {
    setHeroBgImage(url);
    localStorage.setItem('dgc_hero_bg_image', url);
    updateSettingsDoc({ heroBgImage: url });
  };

  const handleUpdateHeroBgBrightness = (val: number) => {
    setHeroBgBrightness(val);
    localStorage.setItem('dgc_hero_bg_brightness', val.toString());
    updateSettingsDoc({ heroBgBrightness: val });
  };

  const handleUpdateHeroBgBlur = (val: number) => {
    setHeroBgBlur(val);
    localStorage.setItem('dgc_hero_bg_blur', val.toString());
    updateSettingsDoc({ heroBgBlur: val });
  };

  // Database States synchronized with LocalStorage
  const [plants, setPlants] = useState<Plant[]>(() => {
    const cached = localStorage.getItem('dgc_plants');
    return cached ? JSON.parse(cached) : INITIAL_PLANTS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const cached = localStorage.getItem('dgc_students');
    return cached ? JSON.parse(cached) : INITIAL_STUDENTS;
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const cached = localStorage.getItem('dgc_gallery');
    return cached ? JSON.parse(cached) : INITIAL_GALLERY;
  });

  const [events, setEvents] = useState<DepartmentEvent[]>(() => {
    const cached = localStorage.getItem('dgc_events');
    return cached ? JSON.parse(cached) : INITIAL_EVENTS;
  });

  const [academicNotes, setAcademicNotes] = useState<AcademicNote[]>(() => {
    const cached = localStorage.getItem('dgc_academic_notes');
    return cached ? JSON.parse(cached) : INITIAL_ACADEMIC_NOTES;
  });

  const [contributors, setContributors] = useState<Contributor[]>(() => {
    const cached = localStorage.getItem('dgc_contributors');
    return cached ? JSON.parse(cached) : INITIAL_CONTRIBUTORS;
  });

  const [stats, setStats] = useState<AppStats>(() => {
    const cached = localStorage.getItem('dgc_stats');
    if (cached) return JSON.parse(cached);
    return {
      plantsCount: INITIAL_STATS.plantsCount,
      studentsCount: INITIAL_STATS.studentsCount,
      resourcesCount: INITIAL_STATS.resourcesCount,
      fieldVisitsCount: INITIAL_STATS.fieldVisitsCount
    };
  });

  // Watch hash change for direct URL mapping
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin' || window.location.pathname === '/admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('site');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Synchronize all data collections with Firestore in real-time!
  useEffect(() => {
    const unsubPlants = syncCollection<Plant>('plants', INITIAL_PLANTS, setPlants);
    const unsubStudents = syncCollection<Student>('students', INITIAL_STUDENTS, setStudents);
    const unsubGallery = syncCollection<GalleryItem>('gallery', INITIAL_GALLERY, setGallery);
    const unsubEvents = syncCollection<DepartmentEvent>('events', INITIAL_EVENTS, setEvents);
    const unsubAcademicNotes = syncCollection<AcademicNote>('academic_notes', INITIAL_ACADEMIC_NOTES, setAcademicNotes);
    const unsubContributors = syncCollection<Contributor>('contributors', INITIAL_CONTRIBUTORS, setContributors);
    const unsubStats = syncCollection<AppStats & { id: string }>(
      'stats',
      [{ ...INITIAL_STATS, id: 'main_stats' }],
      (data) => {
        if (data.length > 0) {
          const { id, ...rest } = data[0];
          setStats(rest as AppStats);
        }
      }
    );
    const unsubSettings = syncCollection<AppSettings>(
      'settings',
      [INITIAL_SETTINGS],
      (data) => {
        if (data.length > 0) {
          const s = data[0];
          setSessionYear(s.sessionYear);
          setCommunityTitle(s.communityTitle);
          setCommunitySubtitle(s.communitySubtitle);
          setHeroBgImage(s.heroBgImage);
          setHeroBgBrightness(s.heroBgBrightness);
          setHeroBgBlur(s.heroBgBlur);

          // Save to localStorage as cache fallback
          localStorage.setItem('dgc_session_year', s.sessionYear);
          localStorage.setItem('dgc_community_title', s.communityTitle);
          localStorage.setItem('dgc_community_subtitle', s.communitySubtitle);
          localStorage.setItem('dgc_hero_bg_image', s.heroBgImage);
          localStorage.setItem('dgc_hero_bg_brightness', s.heroBgBrightness.toString());
          localStorage.setItem('dgc_hero_bg_blur', s.heroBgBlur.toString());
        }
      }
    );

    return () => {
      unsubPlants();
      unsubStudents();
      unsubGallery();
      unsubEvents();
      unsubAcademicNotes();
      unsubContributors();
      unsubStats();
      unsubSettings();
    };
  }, []);

  // Sync real-time Firestore data updates to LocalStorage to prevent page-refresh cache lag
  useEffect(() => {
    if (plants.length > 0) {
      localStorage.setItem('dgc_plants', JSON.stringify(plants));
    }
  }, [plants]);

  useEffect(() => {
    if (students.length > 0) {
      localStorage.setItem('dgc_students', JSON.stringify(students));
    }
  }, [students]);

  useEffect(() => {
    if (gallery.length > 0) {
      localStorage.setItem('dgc_gallery', JSON.stringify(gallery));
    }
  }, [gallery]);

  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('dgc_events', JSON.stringify(events));
    }
  }, [events]);

  useEffect(() => {
    if (academicNotes.length > 0) {
      localStorage.setItem('dgc_academic_notes', JSON.stringify(academicNotes));
    }
  }, [academicNotes]);

  useEffect(() => {
    if (contributors.length > 0) {
      localStorage.setItem('dgc_contributors', JSON.stringify(contributors));
    }
  }, [contributors]);

  useEffect(() => {
    if (stats) {
      localStorage.setItem('dgc_stats', JSON.stringify(stats));
    }
  }, [stats]);

  // Remember Me persistent login state verification
  useEffect(() => {
    if (!isAuthenticated) {
      const rememberedId = localStorage.getItem('dgc_remembered_student_id');
      const rememberTimeStr = localStorage.getItem('dgc_remember_time');
      if (rememberedId && rememberTimeStr) {
        const rememberTime = parseInt(rememberTimeStr, 10);
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        if (Date.now() - rememberTime < thirtyDaysMs) {
          const student = students.find(s => s.id === rememberedId);
          if (student && student.status === 'Active') {
            setIsAuthenticated(true);
            setCurrentUser(student);
            localStorage.setItem('dgc_portal_auth', 'true');
            localStorage.setItem('dgc_portal_user', JSON.stringify(student));
          }
        }
      }
    }
  }, [students, isAuthenticated]);

  // If anyone scrolls down without logging in, automatically redirect them back to top and trigger login
  useEffect(() => {
    if (isAuthenticated) return;

    const handleScroll = () => {
      if (window.scrollY > 250) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsLoginOpen(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAuthenticated]);

  const handlePortalLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('dgc_portal_auth');
    localStorage.removeItem('dgc_portal_user');
    localStorage.removeItem('dgc_remembered_student_id');
    localStorage.removeItem('dgc_remember_time');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateStudentPassword = (studentId: string, newPass: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      const updatedObj = { ...student, password: newPass, isTemporaryPassword: false };
      updateFirestoreDoc('students', updatedObj);

      // If the student being updated is currently logged in, sync their local state
      if (currentUser && currentUser.id === studentId) {
        const updatedUser = { ...currentUser, password: newPass, isTemporaryPassword: false };
        setCurrentUser(updatedUser);
        localStorage.setItem('dgc_portal_user', JSON.stringify(updatedUser));
      }
    }
  };

  // Sync methods to LocalStorage on changes
  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Stats updates
  const handleUpdateStats = (newStats: AppStats) => {
    updateFirestoreDoc('stats', { ...newStats, id: 'main_stats' });
  };

  // Plant mutators
  const handleAddPlant = (plant: Plant) => {
    addFirestoreDoc('plants', plant);
  };
  const handleEditPlant = (plant: Plant) => {
    updateFirestoreDoc('plants', plant);
  };
  const handleDeletePlant = (id: string) => {
    deleteFirestoreDoc('plants', id);
  };

  // Student mutators
  const handleAddStudent = (student: Student) => {
    addFirestoreDoc('students', student);
  };
  const handleEditStudent = (student: Student) => {
    updateFirestoreDoc('students', student);
  };
  const handleDeleteStudent = (id: string) => {
    deleteFirestoreDoc('students', id);
  };

  // Gallery mutators
  const handleAddGallery = (item: GalleryItem) => {
    addFirestoreDoc('gallery', item);
  };
  const handleEditGallery = (item: GalleryItem) => {
    updateFirestoreDoc('gallery', item);
  };
  const handleDeleteGallery = (id: string) => {
    deleteFirestoreDoc('gallery', id);
  };

  // Event mutators
  const handleAddEvent = (event: DepartmentEvent) => {
    addFirestoreDoc('events', event);
  };
  const handleEditEvent = (event: DepartmentEvent) => {
    updateFirestoreDoc('events', event);
  };
  const handleDeleteEvent = (id: string) => {
    deleteFirestoreDoc('events', id);
  };

  // Academic Notes mutators
  const handleAddAcademicNote = (note: AcademicNote) => {
    addFirestoreDoc('academic_notes', note);
  };
  const handleEditAcademicNote = (note: AcademicNote) => {
    updateFirestoreDoc('academic_notes', note);
  };
  const handleDeleteAcademicNote = (id: string) => {
    deleteFirestoreDoc('academic_notes', id);
  };
  const handleDownloadAcademicNote = (id: string) => {
    const note = academicNotes.find(n => n.id === id);
    if (note) {
      updateFirestoreDoc('academic_notes', { ...note, downloadCount: (note.downloadCount || 0) + 1 });
    }
  };

  // Contributor mutators
  const handleAddContributor = (cont: Contributor) => {
    addFirestoreDoc('contributors', cont);
  };
  const handleEditContributor = (cont: Contributor) => {
    updateFirestoreDoc('contributors', cont);
  };
  const handleDeleteContributor = (id: string) => {
    deleteFirestoreDoc('contributors', id);
  };

  // Session period setter
  const handleUpdateSessionYear = (year: string) => {
    setSessionYear(year);
    localStorage.setItem('dgc_session_year', year);
    updateSettingsDoc({ sessionYear: year });
  };

  // Scroll navigation helper
  const handleNavigateToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-[#0B0B0B] text-[#F5F2EE] min-h-screen relative font-sans">
      
      {/* Editorial Header */}
      <Header 
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          if (view === 'admin') {
            window.location.hash = 'admin';
          } else {
            window.location.hash = '';
          }
        }}
        onNavigate={handleNavigateToSection}
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={handlePortalLogout}
      />

      {/* Main Switch View Container */}
      <AnimatePresence mode="wait">
        {currentView === 'admin' ? (
          !(isAuthenticated && currentUser?.role === 'super_admin') ? (
            <AccessDenied 
              currentUser={currentUser}
              isAuthenticated={isAuthenticated}
              onGoBack={() => {
                setCurrentView('site');
                window.location.hash = '';
              }}
              onTriggerLogin={() => setIsLoginOpen(true)}
            />
          ) : (
            <motion.div
              key="admin-workspace"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <AdminPanel 
                stats={stats}
                onUpdateStats={handleUpdateStats}
                plants={plants}
                onAddPlant={handleAddPlant}
                onEditPlant={handleEditPlant}
                onDeletePlant={handleDeletePlant}
                students={students}
                onAddStudent={handleAddStudent}
                onEditStudent={handleEditStudent}
                onDeleteStudent={handleDeleteStudent}
                gallery={gallery}
                onAddGallery={handleAddGallery}
                onEditGallery={handleEditGallery}
                onDeleteGallery={handleDeleteGallery}
                events={events}
                onAddEvent={handleAddEvent}
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
                academicNotes={academicNotes}
                onAddAcademicNote={handleAddAcademicNote}
                onEditAcademicNote={handleEditAcademicNote}
                onDeleteAcademicNote={handleDeleteAcademicNote}
                contributors={contributors}
                onAddContributor={handleAddContributor}
                onEditContributor={handleEditContributor}
                onDeleteContributor={handleDeleteContributor}
                sessionYear={sessionYear}
                onUpdateSessionYear={handleUpdateSessionYear}
                communityTitle={communityTitle}
                onUpdateCommunityTitle={handleUpdateCommunityTitle}
                communitySubtitle={communitySubtitle}
                onUpdateCommunitySubtitle={handleUpdateCommunitySubtitle}
                heroBgImage={heroBgImage}
                onUpdateHeroBgImage={handleUpdateHeroBgImage}
                heroBgBrightness={heroBgBrightness}
                onUpdateHeroBgBrightness={handleUpdateHeroBgBrightness}
                heroBgBlur={heroBgBlur}
                onUpdateHeroBgBlur={handleUpdateHeroBgBlur}
                userRole="super_admin"
                currentUser={currentUser}
                onLogout={() => {
                  handlePortalLogout();
                  setCurrentView('site');
                  window.location.hash = '';
                }}
              />
            </motion.div>
          )
        ) : (
          <motion.div
            key="public-site"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Cinematic Hero Block */}
            <Hero 
              stats={stats} 
              heroBgImage={heroBgImage}
              heroBgBrightness={heroBgBrightness}
              heroBgBlur={heroBgBlur}
              onExploreArchive={() => handleNavigateToSection('archive')}
              onMeetContributors={() => handleNavigateToSection('contributors')}
              isAuthenticated={isAuthenticated}
              onLoginClick={() => setIsLoginOpen(true)}
            />

            {/* Conditionally render all main sections ONLY if Authenticated */}
            {isAuthenticated ? (
              <>
                {/* Alternating Section 1: Philosophy (Image Left + Text Right) */}
                <Philosophy />

                {/* Alternating Section 2: Botanical Expeditions Editorial (Text Left + Image Right) */}
                <section className="relative w-full py-24 md:py-36 bg-[#111111] text-[#F5F2EE] px-6 md:px-12 border-b border-[#C79A6B]/15">
                  <div className="w-full max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
                      
                      {/* LEFT: Text description */}
                      <div className="lg:col-span-7 space-y-8">
                        <span className="text-xs font-mono tracking-[0.3em] text-[#C79A6B] uppercase font-semibold">
                          — ETHNOBOTANICAL EXPLORATIONS
                        </span>
                        <h3 className="font-serif text-4xl md:text-5xl font-light text-[#F5F2EE] leading-tight">
                          Preserving people and <br />
                          <span className="font-serif italic text-[#C79A6B] font-normal">ancient wisdom</span>
                        </h3>
                        <p className="text-sm md:text-base text-[#F5F2EE]/75 leading-relaxed font-light">
                          Beyond simple morphological cataloging, our 2025-2026 cohort is tasked with documenting the oral medicinal heritage of local ethnic tribes in the Barind tract. By analyzing the organic bonds between community habits and regional flora, we build a defensive boundary against cultural memory loss.
                        </p>
                        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-mono text-[#8F6A48]/90">
                          <div className="space-y-1">
                            <span className="text-[#C79A6B] uppercase font-bold tracking-widest text-[9.5px] block">01. EXPEDITIONARY FOOTPRINT</span>
                            <span>Over 32 field visits conducted in Singra forests and Ramsagar reserve soils.</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[#C79A6B] uppercase font-bold tracking-widest text-[9.5px] block">02. ACTIVE ENGAGEMENT</span>
                            <span>Interfacing with tribal healers to index regional Unani therapeutic plants.</span>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT: Image container */}
                      <motion.div 
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:col-span-5 relative group"
                      >
                        <div className="absolute -inset-1.5 border border-[#C79A6B]/20 rounded-xs group-hover:border-[#C79A6B]/40 transition-colors duration-500 pointer-events-none" />
                        <div className="overflow-hidden rounded-xs bg-[#0B0B0B]">
                          <motion.img 
                            whileHover={{ scale: 1.04 }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=1000" 
                            alt="Expeditionary Fields DGC"
                            className="w-full aspect-[4/5] object-cover opacity-80 hover:opacity-100 transition-all duration-700"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="mt-4 flex justify-between text-[10px] font-mono tracking-widest text-[#8F6A48] uppercase">
                          <span>Fig 02. Field Bio-Census</span>
                          <span>Singra Forest Boundary</span>
                        </div>
                      </motion.div>

                    </div>
                  </div>
                </section>

                {/* Public Botanical Specimen Archive Grid */}
                <PlantArchive plants={plants} />

                {/* Public Interactive Community Registry */}
                <Community 
                  students={students} 
                  communityTitle={communityTitle} 
                  communitySubtitle={communitySubtitle} 
                  currentUser={currentUser}
                />

                {/* Premium Event Archive & Visual Journal */}
                <Gallery events={events} />

                {/* Premium Academic Notes & PDF Library */}
                <AcademicNotes notes={academicNotes} onDownloadNote={handleDownloadAcademicNote} />

                {/* Advisory Board / Contributors Section */}
                <section id="contributors" className="relative w-full py-24 bg-[#111111] text-[#F5F2EE] px-6 md:px-12 border-b border-[#C79A6B]/15">
                  <div className="w-full max-w-7xl mx-auto space-y-16">
                    <div className="text-center max-w-2xl mx-auto space-y-3">
                      <span className="text-xs font-mono tracking-[0.3em] text-[#C79A6B] uppercase font-semibold">
                        — BOARD OF CURATORS
                      </span>
                      <h2 className="font-serif text-3xl md:text-4xl font-light text-[#F5F2EE]">
                        Mentorship & <span className="font-serif italic text-[#C79A6B]">academic guidance</span>
                      </h2>
                      <p className="text-xs md:text-sm text-[#F5F2EE]/60 font-light leading-relaxed">
                        Under direct supervision of the DGC Botany faculty, our systematic digital indices follow strict international herbarium standards.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                      {contributors.map((c) => (
                        <div key={c.id} className="bg-[#0B0B0B]/90 border border-[#C79A6B]/15 rounded p-6 text-center space-y-4 hover:border-[#C79A6B]/40 transition-colors">
                          <div className="w-20 h-20 rounded-full border border-[#C79A6B]/30 mx-auto overflow-hidden bg-[#111111]">
                            <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-serif text-lg font-medium text-[#F5F2EE]">{c.name}</h4>
                            <p className="text-[10px] font-mono text-[#C79A6B] uppercase tracking-wider">{c.role}</p>
                          </div>
                          <div className="text-[10.5px] font-mono text-[#8F6A48]/80 border-t border-[#C79A6B]/10 pt-3">
                            Curatorial Index: {c.contributionsCount} items approved
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </>
            ) : null}

          </motion.div>
        )}
      </AnimatePresence>

      {/* Elegant Editorial Footer */}
      <Footer 
        sessionYear={sessionYear} 
        onViewChange={(view) => {
          setCurrentView(view);
          if (view === 'admin') {
            window.location.hash = 'admin';
          } else {
            window.location.hash = '';
          }
        }}
        onNavigate={handleNavigateToSection}
        isAuthenticated={isAuthenticated}
      />

      {/* Student Portal Login Overlay modal */}
      <AnimatePresence>
        {isLoginOpen && (
          <PortalLogin 
            students={students}
            onLoginSuccess={(student) => {
              setIsAuthenticated(true);
              setCurrentUser(student);
              localStorage.setItem('dgc_portal_auth', 'true');
              localStorage.setItem('dgc_portal_user', JSON.stringify(student));
              setIsLoginOpen(false);
            }}
            onClose={() => setIsLoginOpen(false)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
