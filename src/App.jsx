import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import MobileTabBar from './components/MobileTabBar';
import Footer from './components/Footer';
import Leaderboard from './pages/Leaderboard';
import DevMap from './pages/DevMap';
import Register from './pages/Register';
import BadgeGenerator from './pages/BadgeGenerator';
import Evolution from './pages/Evolution';
import About from './pages/About';

const TAB_TITLES = {
  leaderboard: 'LeetIndex | Leaderboard',
  map: 'LeetIndex | Dev Map',
  register: 'LeetIndex | Register',
  badge: 'LeetIndex | Badge',
  evolution: 'LeetIndex | Evolution',
  about: 'LeetIndex | About',
};

export default function App() {
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [badgePrefillUsername, setBadgePrefillUsername] = useState('');

  React.useEffect(() => {
    document.title = TAB_TITLES[activeTab] || 'LeetIndex';
  }, [activeTab]);

  const handleChangeTab = useCallback((tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleNavigateToBadge = useCallback((username) => {
    setBadgePrefillUsername(String(username || '').trim());
    setActiveTab('badge');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBadgePrefillConsumed = useCallback(() => {
    setBadgePrefillUsername('');
  }, []);

  return (
    <>
      <Header
        activeTab={activeTab}
        onChangeTab={handleChangeTab}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <div className="pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0 min-h-screen">
        {activeTab === 'leaderboard' && (
          <Leaderboard
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onNavigateToBadge={handleNavigateToBadge}
            onChangeTab={handleChangeTab}
          />
        )}
        {activeTab === 'map' && <DevMap onChangeTab={handleChangeTab} />}
        {activeTab === 'register' && <Register onChangeTab={handleChangeTab} />}
        {activeTab === 'badge' && (
          <BadgeGenerator
            initialUsername={badgePrefillUsername}
            onInitialUsernameConsumed={handleBadgePrefillConsumed}
          />
        )}
        {activeTab === 'evolution' && <Evolution />}
        {activeTab === 'about' && <About onChangeTab={handleChangeTab} />}
        <Footer />
      </div>
      <MobileTabBar activeTab={activeTab} onChangeTab={handleChangeTab} />
    </>
  );
}
