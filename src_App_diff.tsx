--- src/App.tsx (原始)
import { useState, useCallback } from 'react';
import { Person } from './types';
import { initialFamilyMembers } from './data/initialData';
import FamilyTree from './components/FamilyTree';
import AddPersonModal from './components/AddPersonModal';
import PersonDetail from './components/PersonDetail';
import { UserPlus, TreePine, Users, Search } from 'lucide-react';

function App() {
  const [members, setMembers] = useState<Person[]>(initialFamilyMembers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPerson, setEditPerson] = useState<Person | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const handleAddMember = useCallback(() => {
    setEditPerson(null);
    setDefaultParentId(null);
    setIsModalOpen(true);
  }, []);

  const handleAddChild = useCallback((parent: Person) => {
    setEditPerson(null);
    setDefaultParentId(parent.id);
    setIsModalOpen(true);
  }, []);

  const handleEditPerson = useCallback((person: Person) => {
    setEditPerson(person);
    setDefaultParentId(null);
    setIsModalOpen(true);
  }, []);

  const handleSelectPerson = useCallback((person: Person) => {
    setSelectedPerson((prev) => (prev?.id === person.id ? null : person));
  }, []);

  const handleSave = useCallback(
    (personData: Omit<Person, 'id'> & { id?: string }) => {
      if (personData.id) {
        // Update existing
        setMembers((prev) =>
          prev.map((m) => (m.id === personData.id ? { ...m, ...personData } as Person : m))
        );
        // Update selected person if it was the edited one
        if (selectedPerson?.id === personData.id) {
          setSelectedPerson({ ...selectedPerson, ...personData } as Person);
        }
      } else {
        // Add new
        const newPerson: Person = {
          ...personData,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        };
        setMembers((prev) => [...prev, newPerson]);
      }
    },
    [selectedPerson]
  );

  const handleDelete = useCallback((id: string) => {
    setMembers((prev) => {
      // Remove the person and update references
      return prev
        .filter((m) => m.id !== id)
        .map((m) => ({
          ...m,
          parentId: m.parentId === id ? null : m.parentId,
          spouseId: m.spouseId === id ? null : m.spouseId,
        }));
    });
    if (selectedPerson?.id === id) {
      setSelectedPerson(null);
    }
  }, [selectedPerson]);

  const filteredMembers = searchQuery
    ? members.filter((m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const generations = new Set(members.map((m) => {
    let gen = 0;
    let current = m;
    while (current.parentId) {
      gen++;
      const parent = members.find((p) => p.id === current.parentId);
      if (!parent) break;
      current = parent;
    }
    return gen;
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <TreePine className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Family Tree</h1>
                <p className="text-xs text-gray-400">
                  {members.length} members · {generations.size} generations
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  <Search className="w-5 h-5 text-gray-600" />
                </button>
                {showSearch && (
                  <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-50 animate-fadeIn">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search family members..."
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none text-sm"
                      autoFocus
                    />
                    {searchQuery && (
                      <div className="mt-2 max-h-48 overflow-y-auto">
                        {filteredMembers.length > 0 ? (
                          filteredMembers.map((m) => (
                            <button
                              key={m.id}
                              onClick={() => {
                                handleSelectPerson(m);
                                setShowSearch(false);
                                setSearchQuery('');
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm transition-colors"
                            >
                              <span className="font-medium text-gray-700">{m.name}</span>
                              <span className="text-gray-400 ml-2">
                                {m.gender === 'male' ? '♂' : '♀'}
                              </span>
                            </button>
                          ))
                        ) : (
                          <p className="text-sm text-gray-400 text-center py-2">No results found</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Add Member Button */}
              <button
                onClick={handleAddMember}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg shadow-green-200 active:scale-95"
              >
                <UserPlus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Member</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex gap-4 overflow-x-auto pb-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">
              <span className="font-bold text-gray-800">{members.length}</span> Members
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <TreePine className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-600">
              <span className="font-bold text-gray-800">{generations.size}</span> Generations
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <span className="text-sm text-gray-600">
              <span className="font-bold text-gray-800">{members.filter((m) => m.gender === 'male').length}</span> Male · <span className="font-bold text-gray-800">{members.filter((m) => m.gender === 'female').length}</span> Female
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 pb-12 transition-all duration-300 ${selectedPerson ? 'mr-80' : ''}`}>
        <FamilyTree
          members={members}
          onSelectPerson={handleSelectPerson}
          onAddChild={handleAddChild}
          onEditPerson={handleEditPerson}
          selectedPersonId={selectedPerson?.id || null}
        />
      </main>

      {/* Person Detail Sidebar */}
      <PersonDetail
        person={selectedPerson}
        familyMembers={members}
        onClose={() => setSelectedPerson(null)}
        onEdit={handleEditPerson}
      />

      {/* Add/Edit Modal */}
      <AddPersonModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditPerson(null);
          setDefaultParentId(null);
        }}
        onSave={handleSave}
        onDelete={handleDelete}
        editPerson={editPerson}
        defaultParentId={defaultParentId}
        familyMembers={members}
      />

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-center">
          <p className="text-sm text-gray-400">
            🌳 Family Tree — Preserve your family's legacy
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;


+++ src/App.tsx (修改后)
import { useState, useCallback } from 'react';
import { Person } from './types';
import { initialFamilyMembers } from './data/initialData';
import FamilyTree from './components/FamilyTree';
import AddPersonModal from './components/AddPersonModal';
import PersonDetail from './components/PersonDetail';
import ReportModal from './components/ReportModal';
import { UserPlus, TreePine, Users, Search, FileText, Printer } from 'lucide-react';

function App() {
  const [members, setMembers] = useState<Person[]>(initialFamilyMembers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPerson, setEditPerson] = useState<Person | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const handleAddMember = useCallback(() => {
    setEditPerson(null);
    setDefaultParentId(null);
    setIsModalOpen(true);
  }, []);

  const handleAddChild = useCallback((parent: Person) => {
    setEditPerson(null);
    setDefaultParentId(parent.id);
    setIsModalOpen(true);
  }, []);

  const handleEditPerson = useCallback((person: Person) => {
    setEditPerson(person);
    setDefaultParentId(null);
    setIsModalOpen(true);
  }, []);

  const handleSelectPerson = useCallback((person: Person) => {
    setSelectedPerson((prev) => (prev?.id === person.id ? null : person));
  }, []);

  const handleSave = useCallback(
    (personData: Omit<Person, 'id'> & { id?: string }) => {
      if (personData.id) {
        // Update existing
        setMembers((prev) =>
          prev.map((m) => (m.id === personData.id ? { ...m, ...personData } as Person : m))
        );
        // Update selected person if it was the edited one
        if (selectedPerson?.id === personData.id) {
          setSelectedPerson({ ...selectedPerson, ...personData } as Person);
        }
      } else {
        // Add new
        const newPerson: Person = {
          ...personData,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        };
        setMembers((prev) => [...prev, newPerson]);
      }
    },
    [selectedPerson]
  );

  const handleDelete = useCallback((id: string) => {
    setMembers((prev) => {
      // Remove the person and update references
      return prev
        .filter((m) => m.id !== id)
        .map((m) => ({
          ...m,
          parentId: m.parentId === id ? null : m.parentId,
          spouseId: m.spouseId === id ? null : m.spouseId,
        }));
    });
    if (selectedPerson?.id === id) {
      setSelectedPerson(null);
    }
  }, [selectedPerson]);

  const filteredMembers = searchQuery
    ? members.filter((m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const generations = new Set(members.map((m) => {
    let gen = 0;
    let current = m;
    while (current.parentId) {
      gen++;
      const parent = members.find((p) => p.id === current.parentId);
      if (!parent) break;
      current = parent;
    }
    return gen;
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <TreePine className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Family Tree</h1>
                <p className="text-xs text-gray-400">
                  {members.length} members · {generations.size} generations
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  <Search className="w-5 h-5 text-gray-600" />
                </button>
                {showSearch && (
                  <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-50 animate-fadeIn">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search family members..."
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none text-sm"
                      autoFocus
                    />
                    {searchQuery && (
                      <div className="mt-2 max-h-48 overflow-y-auto">
                        {filteredMembers.length > 0 ? (
                          filteredMembers.map((m) => (
                            <button
                              key={m.id}
                              onClick={() => {
                                handleSelectPerson(m);
                                setShowSearch(false);
                                setSearchQuery('');
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm transition-colors"
                            >
                              <span className="font-medium text-gray-700">{m.name}</span>
                              <span className="text-gray-400 ml-2">
                                {m.gender === 'male' ? '♂' : '♀'}
                              </span>
                            </button>
                          ))
                        ) : (
                          <p className="text-sm text-gray-400 text-center py-2">No results found</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Report Button */}
              <button
                onClick={() => setIsReportOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-200 active:scale-95"
              >
                <FileText className="w-5 h-5" />
                <span className="hidden sm:inline">Report</span>
              </button>

              {/* Print Tree Button */}
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all active:scale-95"
              >
                <Printer className="w-5 h-5" />
                <span className="hidden sm:inline">Print</span>
              </button>

              {/* Add Member Button */}
              <button
                onClick={handleAddMember}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg shadow-green-200 active:scale-95"
              >
                <UserPlus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Member</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex gap-4 overflow-x-auto pb-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">
              <span className="font-bold text-gray-800">{members.length}</span> Members
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <TreePine className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-600">
              <span className="font-bold text-gray-800">{generations.size}</span> Generations
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <span className="text-sm text-gray-600">
              <span className="font-bold text-gray-800">{members.filter((m) => m.gender === 'male').length}</span> Male · <span className="font-bold text-gray-800">{members.filter((m) => m.gender === 'female').length}</span> Female
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 pb-12 transition-all duration-300 ${selectedPerson ? 'mr-80' : ''}`}>
        <FamilyTree
          members={members}
          onSelectPerson={handleSelectPerson}
          onAddChild={handleAddChild}
          onEditPerson={handleEditPerson}
          selectedPersonId={selectedPerson?.id || null}
        />
      </main>

      {/* Person Detail Sidebar */}
      <PersonDetail
        person={selectedPerson}
        familyMembers={members}
        onClose={() => setSelectedPerson(null)}
        onEdit={handleEditPerson}
      />

      {/* Add/Edit Modal */}
      <AddPersonModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditPerson(null);
          setDefaultParentId(null);
        }}
        onSave={handleSave}
        onDelete={handleDelete}
        editPerson={editPerson}
        defaultParentId={defaultParentId}
        familyMembers={members}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        members={members}
      />

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-center">
          <p className="text-sm text-gray-400">
            🌳 Family Tree — Preserve your family's legacy
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
