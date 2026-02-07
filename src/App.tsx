import { useState, useEffect } from 'react';
import { Sun, Sunrise, Sunset, Moon, Users, Church, ChevronDown, ChevronUp } from 'lucide-react';
import familyPrayersData from './data/family-prayers.json';
import dailyPrayersData from './data/daily-prayers.json';

type PrayerKey = 'morning' | 'midday' | 'evening' | 'compline';

interface PrayerSection {
  header: string;
  content: string;
}

interface PrayerData {
  title: string;
  time: string;
  sections: PrayerSection[];
}

interface Prayer {
  title: string;
  icon: React.ReactElement;
  time: string;
  sections: PrayerSection[];
}

interface Prayers {
  morning: Prayer;
  midday: Prayer;
  evening: Prayer;
  compline: Prayer;
  [key: string]: Prayer;
}

const STORAGE_KEY = 'acna-prayer-app-preferences';

const getRecommendedPrayer = (): PrayerKey => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 15) return 'midday';
  if (hour >= 15 && hour < 19) return 'evening';
  return 'compline';
};

const getStoredPreferences = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const prefs = JSON.parse(stored);
      return {
        prayerMode: prefs.prayerMode ?? 'family' as 'family' | 'daily',
        currentPrayer: prefs.currentPrayer ?? getRecommendedPrayer()
      };
    } catch (e) {
      console.error('Error parsing stored preferences:', e);
    }
  }
  return {
    prayerMode: 'family' as 'family' | 'daily',
    currentPrayer: getRecommendedPrayer()
  };
};

const savePreferences = (prefs: { prayerMode: 'family' | 'daily'; currentPrayer: PrayerKey }) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
};

const createPrayer = (data: PrayerData, icon: React.ReactElement): Prayer => ({
  title: data.title,
  icon,
  time: data.time,
  sections: data.sections
});

const PrayerApp = () => {
  const storedPrefs = getStoredPreferences();
  const [currentPrayer, setCurrentPrayer] = useState<PrayerKey>(storedPrefs.currentPrayer);
  const [prayerMode, setPrayerMode] = useState<'family' | 'daily'>(storedPrefs.prayerMode);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  useEffect(() => {
    savePreferences({ prayerMode, currentPrayer });
  }, [prayerMode, currentPrayer]);

  const familyPrayersDataTyped = familyPrayersData as unknown as Record<string, PrayerData>;
  const dailyPrayersDataTyped = dailyPrayersData as unknown as Record<string, PrayerData>;

  const familyPrayers: Prayers = {
    morning: createPrayer(familyPrayersDataTyped.morning, <Sunrise className="w-6 h-6" />),
    midday: createPrayer(familyPrayersDataTyped.midday, <Sun className="w-6 h-6" />),
    evening: createPrayer(familyPrayersDataTyped.evening, <Sunset className="w-6 h-6" />),
    compline: createPrayer(familyPrayersDataTyped.compline, <Moon className="w-6 h-6" />)
  };

  const dailyPrayers: Prayers = {
    morning: createPrayer(dailyPrayersDataTyped.morning, <Sunrise className="w-6 h-6" />),
    midday: createPrayer(dailyPrayersDataTyped.midday, <Sun className="w-6 h-6" />),
    evening: createPrayer(dailyPrayersDataTyped.evening, <Sunset className="w-6 h-6" />),
    compline: createPrayer(dailyPrayersDataTyped.compline, <Moon className="w-6 h-6" />)
  };

  const prayerOrder = ['morning', 'midday', 'evening', 'compline'];

  const formatSectionContent = (content: string) => {
    return content.split('\n').map((line: string, index: number) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) {
        return <div key={index} className="h-4" />;
      }
      if (trimmedLine === 'Amen.') {
        return <p key={index} className="font-sans text-base text-center italic mt-6 mb-8 text-amber-200">{trimmedLine}</p>;
      }
      if (trimmedLine.match(/\d+:\d+/)) {
        return <p key={index} className="font-sans text-xs text-center mb-4 text-gray-400">{trimmedLine}</p>;
      }
      if (trimmedLine.startsWith('"') || trimmedLine.endsWith('"')) {
        return <p key={index} className="font-sans text-base text-center leading-relaxed mb-2 italic text-gray-300">{trimmedLine}</p>;
      }
      if (trimmedLine.match(/^[A-Z ]+$/)) {
        return <p key={index} className="font-sans text-base text-center mb-2 text-gray-400 font-medium">{trimmedLine}</p>;
      }
      return <p key={index} className="font-sans text-base text-center leading-relaxed mb-2">{trimmedLine}</p>;
    });
  };

  const currentPrayers = prayerMode === 'family' ? familyPrayers : dailyPrayers;

  const toggleSection = (sectionIndex: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionIndex)) {
        newSet.delete(sectionIndex);
      } else {
        newSet.add(sectionIndex);
      }
      return newSet;
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 md:min-h-screen min-h-screen text-stone-100" style={{backgroundColor: '#1c1c21'}}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="inline-flex rounded-lg p-1">
            <button
              onClick={() => setPrayerMode('family')}
              className={`flex items-center p-2 rounded-md text-sm font-medium transition-all ${
                prayerMode === 'family'
                  ? 'bg-white text-amber-900 shadow-sm ring-2 ring-amber-900'
                  : 'text-stone-200 hover:text-white shadow-sm'
              }`}
              style={prayerMode !== 'family' ? {backgroundColor: '#2d2d35'} : {}}
              title="Family"
            >
              <Users className="w-6 h-6" />
            </button>
            <button
              onClick={() => setPrayerMode('daily')}
              className={`flex items-center p-2 rounded-md text-sm font-medium transition-all ${
                prayerMode === 'daily'
                  ? 'bg-white text-amber-900 shadow-sm ring-2 ring-amber-900'
                  : 'text-stone-200 hover:text-white shadow-sm'
              }`}
              style={prayerMode !== 'daily' ? {backgroundColor: '#2d2d35'} : {}}
              title="Daily Office"
            >
              <Church className="w-6 h-6" />
            </button>
          </div>
          <div className="inline-flex rounded-lg p-1">
            {(prayerOrder as string[]).map((prayerKey: string) => {
              const prayer = currentPrayers[prayerKey as PrayerKey];
              return (
                <button
                  key={prayerKey}
                  onClick={() => setCurrentPrayer(prayerKey as PrayerKey)}
                  className={`p-2 rounded-md text-sm font-medium transition-all ${
                    currentPrayer === prayerKey
                      ? 'bg-white text-amber-900 shadow-sm ring-2 ring-amber-900'
                      : 'text-stone-200 hover:text-white shadow-sm'
                  }`}
                  style={currentPrayer !== prayerKey ? {backgroundColor: '#2d2d35'} : {}}
                  title={prayer.title}
                >
                  {prayer.icon}
                </button>
              );
            })}
          </div>
        </div>

          <div className="rounded-lg p-6 md:p-8 transition-colors duration-300">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-3 mb-3">
                {currentPrayers[currentPrayer].icon}
                <h2 className="text-2xl font-serif font-bold text-stone-100">{currentPrayers[currentPrayer].title}</h2>
              </div>
              <p className="text-gray-300 text-sm mb-8">{currentPrayers[currentPrayer].time}</p>
            </div>

            <div className="font-sans text-base leading-relaxed text-stone-100 space-y-8">
              {currentPrayers[currentPrayer].sections.map((section, sectionIndex) => {
                const isExpanded = expandedSections.has(sectionIndex);
                return (
                  <div key={sectionIndex} className="mb-8">
                    <button
                      onClick={() => toggleSection(sectionIndex)}
                      className="w-full flex items-center justify-center space-x-2 mb-4 group"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-amber-200" /> : <ChevronDown className="w-4 h-4 text-amber-200" />}
                      <h3 className="serif uppercase tracking-widest text-sm font-bold text-amber-200 text-center group-hover:text-amber-300 transition-colors">{section.header}</h3>
                    </button>
                    {isExpanded && (
                      <div className="text-center">
                        {formatSectionContent(section.content)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center mt-8 text-sm text-gray-400">
            <p>May the peace of Christ be with you</p>
          </div>
    </div>
  );
};

export default PrayerApp;
