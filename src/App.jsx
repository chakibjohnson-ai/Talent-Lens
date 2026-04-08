import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeProvider } from './contexts/ThemeContext';
import { useAppData } from './hooks/useAppData';
import { Sidebar } from './components/Sidebar';
import { LoginScreen } from './components/LoginScreen';
import { AnalyseView } from './components/AnalyseView';
import { Dashboard } from './components/Dashboard';
import { BooleanView } from './components/BooleanView';
import { FrontsheetView } from './components/FrontsheetView';
import { OutreachView } from './components/OutreachView';
import { InstellingenView } from './components/InstellingenView';
import { ProfileScoutView } from './components/ProfileScoutView';
import { SaveGemModal } from './components/SaveGemModal';
import { MyGemsModal } from './components/MyGemsModal';
import { AppSkeleton } from './components/SkeletonLoader';
import { sbGetProfile, SB_SESSION_KEY } from './services/authService';
import * as Constants from './constants/appConstants';

const TL_LOGO = "https://cebpwkavlxipkrqixbab.supabase.co/storage/v1/object/public/app-assets/Afbeeldingen/TL_logo_trans.png";

// Analyse sub-tab routes die AnalyseView intern aansturen
const ANALYSE_SUBTABS = { analyse: "analyse", geschiedenis: "history", folder: "folder", vacature: "vacature" };

const DEMO_GEMS = [
  { id:1, title:"Koude Acquisitie Medical Devices", type:"Belscript",   content:"Opening: \"Hi [Naam], ik bel je kort omdat ik net een Account Manager sprak die exact de Life Sciences ervaring heeft waar jullie naar zoeken...\"\n\nHook: Benoem direct de Medical Devices en B2B Sales achtergrond.\n\nCTA: \"Wanneer ben je vanmiddag 5 minuten beschikbaar?\"", isShared:true,  team:"Morgan Green", author:"Chakib J.", date:"Vandaag" },
  { id:2, title:"Mijn perfecte QA Frontsheet",     type:"Frontsheet",   content:"[Candidate A] is een resultaatgerichte QA professional met 7 jaar ervaring in Medical Devices. Sterke kennis van ISO 13485, MDR en CAPA-processen. Beschikbaar per direct.", isShared:false, team:"Morgan Green", author:"Mijzelf",   date:"Gisteren" },
  { id:3, title:"Boolean Lab Technicians",          type:"Boolean",      content:"(Laboratory OR Lab OR Laboratorium) AND (Technician OR Analist OR Analyst) AND (\"Life Sciences\" OR Pharma OR \"Medical Devices\") NOT (Manager OR Director)", isShared:true,  team:"Morgan Lab",   author:"Sanne V.", date:"Vorige week" },
  { id:4, title:"Intake Vragen Senior Sales MD",    type:"Interview",    content:"Vraag 1: Kun je een voorbeeld geven van een complex sales-traject in Medical Devices dat je recent hebt gesloten?\n\nVraag 2: Hoe ga je om met regulatory compliance (ISO/MDR) tijdens je pitch?\n\nVraag 3: Hoe snel kun je je inwerken op een nieuwe productgroep?", isShared:true,  team:"Morgan Black", author:"Mijzelf",   date:"2 dagen geleden" },
];

// Framer Motion — subtiel fade+slide preset
const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" } },
  exit:    { opacity: 0, y: -4, transition: { duration: 0.12, ease: "easeIn" } },
};

function AppShell() {
  const [user,       setUser]       = useState(null);
  const [activeTab,  setActiveTab]  = useState('dashboard');
  const [gems,       setGems]       = useState(DEMO_GEMS);
  const [gemToSave,  setGemToSave]  = useState(null);
  const [showMyGems, setShowMyGems] = useState(false);

  // History — lifted zodat Dashboard + FrontsheetView het ook kunnen gebruiken
  const [history, setHistory] = useState([]);

  const { crmSkills, verticals, roles, industries, loading } = useAppData();

  // ── Session restore ──────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SB_SESSION_KEY);
      if (!raw) return;
      const session = JSON.parse(raw);
      if (!session?.access_token) return;
      const payload = JSON.parse(atob(session.access_token.split(".")[1]));
      if (payload.exp * 1000 < Date.now()) { localStorage.removeItem(SB_SESSION_KEY); return; }
      const email  = payload.email || session.user?.email;
      const domain = email?.split("@")[1]?.toLowerCase() || "";
      const theme  = Constants.DOMAIN_THEMES[domain] || Constants.DEFAULT_THEME;
      sbGetProfile(session.access_token).then(profile => {
        setUser({ email, domain, isAdmin: profile?.is_org_admin || profile?.is_team_admin || false,
                  accessToken: session.access_token, profile, theme });
      });
    } catch { /* ongeldige sessie */ }
  }, []);

  function handleLogin(u) {
    const domain = u.email?.split("@")[1]?.toLowerCase() || "";
    const theme  = Constants.DOMAIN_THEMES[domain] || Constants.DEFAULT_THEME;
    setUser({ ...u, domain, theme });
  }

  if (loading) return <AppSkeleton />;

  if (!user) return <LoginScreen onLogin={handleLogin} logo={TL_LOGO} />;

  const T = user.theme || Constants.DEFAULT_THEME;

  // Analyse sub-tab prop afgeleid uit activeTab
  const analyseSubTab = ANALYSE_SUBTABS[activeTab] || null;

  const renderContent = () => {
    // Alle analyse-gerelateerde routes gaan naar AnalyseView met juiste sub-tab
    if (analyseSubTab) {
      return (
        <AnalyseView
          key="analyse-view"
          user={user}
          crmSkills={crmSkills}
          verticals={verticals}
          roles={roles}
          industries={industries}
          gems={gems}
          setGems={setGems}
          onSaveGem={setGemToSave}
          history={history}
          setHistory={setHistory}
          activeSubTab={analyseSubTab}
          onGoToInstellingen={() => setActiveTab('instellingen')}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            stats={Constants.STAT_CARDS}
            verticalColors={Constants.VERTICAL_COLORS}
            verticals={verticals}
            history={history}
            user={user}
          />
        );
      case 'boolean':
        return <BooleanView user={user} />;
      case 'frontsheet':
        return <FrontsheetView user={user} history={history} onSaveGem={d => setGemToSave(d)} />;
      case 'outreach':
        return <OutreachView user={user} />;
      case 'instellingen':
        return <InstellingenView user={user} onUserUpdate={setUser} />;
      case 'profile-scout':
        return <ProfileScoutView user={user} />;
      default:
        return (
          <div style={{ padding:32, color:"var(--text-muted)", textAlign:"center", fontFamily:"Inter,sans-serif", fontSize:14 }}>
            Scherm in ontwikkeling…
          </div>
        );
    }
  };

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:"var(--bg-base)" }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navItems={Constants.NAV_ITEMS}
        workspaceItems={Constants.WORKSPACE_ITEMS}
        bottomItems={Constants.BOTTOM_ITEMS}
        onShowMyGems={() => setShowMyGems(true)}
        onLogout={() => { setUser(null); setHistory([]); }}
        user={user}
        gems={gems}
      />

      <main style={{ flex:1, overflowY:"auto", position:"relative" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ minHeight:"100%" }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Globale modals */}
      {gemToSave && (
        <SaveGemModal
          gemToSave={gemToSave}
          accent={T.accent}
          onClose={() => setGemToSave(null)}
          onSave={newGem => { setGems(prev => [newGem, ...prev]); setGemToSave(null); }}
        />
      )}
      {showMyGems && (
        <MyGemsModal gems={gems} accent={T.accent} onClose={() => setShowMyGems(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}
