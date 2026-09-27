--- src/components/ReportModal.tsx (原始)


+++ src/components/ReportModal.tsx (修改后)
import { Person } from '../types';
import { X, Printer, Download, FileText, Users, Calendar, Heart, TreePine } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Person[];
}

export default function ReportModal({ isOpen, onClose, members }: ReportModalProps) {
  if (!isOpen) return null;

  const calculateAge = (birthDate?: string, deathDate?: string) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const end = deathDate ? new Date(deathDate) : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const monthDiff = end.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

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

  const maleCount = members.filter((m) => m.gender === 'male').length;
  const femaleCount = members.filter((m) => m.gender === 'female').length;
  const otherCount = members.filter((m) => m.gender === 'other').length;
  const deceasedCount = members.filter((m) => m.deathDate).length;
  const livingCount = members.length - deceasedCount;

  const ages = members
    .map((m) => calculateAge(m.birthDate, m.deathDate))
    .filter((age): age is number => age !== null);

  const avgAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;
  const maxAge = ages.length > 0 ? Math.max(...ages) : 0;
  const minAge = ages.length > 0 ? Math.min(...ages) : 0;

  const couples = members.filter((m) => m.spouseId).length / 2;

  const rootMembers = members.filter((m) => !m.parentId);
  const getGeneration = (member: Person): number => {
    let gen = 0;
    let current = member;
    while (current.parentId) {
      gen++;
      const parent = members.find((p) => p.id === current.parentId);
      if (!parent) break;
      current = parent;
    }
    return gen;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Gender', 'Birth Date', 'Death Date', 'Age', 'Parent', 'Spouse', 'Notes'];
    const rows = members.map((m) => {
      const parent = m.parentId ? members.find((p) => p.id === m.parentId) : null;
      const spouse = m.spouseId ? members.find((p) => p.id === m.spouseId) : null;
      const age = calculateAge(m.birthDate, m.deathDate);
      return [
        m.name,
        m.gender,
        m.birthDate || '',
        m.deathDate || '',
        age !== null ? age.toString() : '',
        parent?.name || '',
        spouse?.name || '',
        m.notes || '',
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `family-tree-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn print:hidden" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Family Tree Report</h2>
              <p className="text-xs text-gray-400">Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 print:p-0 print:overflow-visible">
          {/* Print Header - Only visible when printing */}
          <div className="hidden print:block mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Family Tree Report</h1>
            <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Statistics Overview */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TreePine className="w-5 h-5 text-green-500" />
              Family Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Total Members</span>
                </div>
                <p className="text-3xl font-bold text-blue-800">{members.length}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <TreePine className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Generations</span>
                </div>
                <p className="text-3xl font-bold text-green-800">{generations.size}</p>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 border border-pink-200">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-pink-600" />
                  <span className="text-sm font-medium text-pink-700">Couples</span>
                </div>
                <p className="text-3xl font-bold text-pink-800">{couples}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Avg Age</span>
                </div>
                <p className="text-3xl font-bold text-purple-800">{avgAge} yrs</p>
              </div>
            </div>
          </div>

          {/* Demographics */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Demographics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-3">Gender Distribution</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Male</span>
                    <span className="text-sm font-bold text-blue-600">{maleCount} ({Math.round((maleCount / members.length) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(maleCount / members.length) * 100}%` }}></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Female</span>
                    <span className="text-sm font-bold text-pink-600">{femaleCount} ({Math.round((femaleCount / members.length) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${(femaleCount / members.length) * 100}%` }}></div>
                  </div>
                  {otherCount > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Other</span>
                        <span className="text-sm font-bold text-purple-600">{otherCount} ({Math.round((otherCount / members.length) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(otherCount / members.length) * 100}%` }}></div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-3">Age Statistics</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Youngest</span>
                    <span className="text-sm font-bold text-gray-800">{minAge} years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Oldest</span>
                    <span className="text-sm font-bold text-gray-800">{maxAge} years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average</span>
                    <span className="text-sm font-bold text-gray-800">{avgAge} years</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Living</span>
                      <span className="text-sm font-bold text-green-600">{livingCount}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-600">Deceased</span>
                      <span className="text-sm font-bold text-gray-600">{deceasedCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Member List */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Family Members</h3>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Gender</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Age</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Generation</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {members.map((member) => {
                    const age = calculateAge(member.birthDate, member.deathDate);
                    const generation = getGeneration(member);
                    const isDeceased = !!member.deathDate;
                    return (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                              member.gender === 'male' ? 'from-blue-400 to-blue-600' :
                              member.gender === 'female' ? 'from-pink-400 to-pink-600' :
                              'from-purple-400 to-purple-600'
                            } flex items-center justify-center`}>
                              <span className="text-white text-xs font-bold">
                                {member.name.charAt(0)}
                              </span>
                            </div>
                            <span className="font-medium text-gray-800">{member.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            member.gender === 'male' ? 'bg-blue-100 text-blue-700' :
                            member.gender === 'female' ? 'bg-pink-100 text-pink-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {member.gender === 'male' ? '♂ Male' : member.gender === 'female' ? '♀ Female' : '⚧ Other'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {age !== null ? `${age} years` : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          Generation {generation + 1}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            isDeceased ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {isDeceased ? '✝ Deceased' : '● Living'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Generation Breakdown */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Generation Breakdown</h3>
            <div className="space-y-3">
              {Array.from(generations).sort().map((gen) => {
                const genMembers = members.filter((m) => getGeneration(m) === gen);
                return (
                  <div key={gen} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-700">Generation {gen + 1}</h4>
                      <span className="text-sm text-gray-500">{genMembers.length} members</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {genMembers.map((member) => (
                        <span key={member.id} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-700">
                          {member.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Root Members */}
          {rootMembers.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Family Founders</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rootMembers.map((member) => {
                  const spouse = member.spouseId ? members.find((m) => m.id === member.spouseId) : null;
                  const children = members.filter((m) => m.parentId === member.id || (spouse && m.parentId === spouse.id));
                  return (
                    <div key={member.id} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                          member.gender === 'male' ? 'from-blue-400 to-blue-600' :
                          member.gender === 'female' ? 'from-pink-400 to-pink-600' :
                          'from-purple-400 to-purple-600'
                        } flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white font-bold">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{member.name}</h4>
                          {spouse && (
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <Heart className="w-3 h-3 text-red-400 fill-red-400" />
                              Married to {spouse.name}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 mt-1">
                            {children.length} {children.length === 1 ? 'child' : 'children'}
                          </p>
                          {member.notes && (
                            <p className="text-xs text-gray-500 mt-2 italic">"{member.notes}"</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-100 p-6 flex gap-3 print:hidden">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
}
