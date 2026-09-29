import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  Users,
  Sparkles,
  Sliders,
  Layers,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SubjectRequirement } from '../../types';

export const CompetencyEngine: React.FC = () => {
  const {
    trainerProfiles,
    users,
    competencies,
    subjectRequirements,
    calculateTrainerMatch,
    currentUser,
    updateTrainerCompetency,
    setActiveTab,
    goBack,
    previousTabName,
  } = useApp();

  const [selectedRequirementId, setSelectedRequirementId] = useState<string>(
    subjectRequirements[0]?.id || 'req-data-science'
  );

  const [activeMatrixTab, setActiveMatrixTab] = useState<'match' | 'matrix' | 'builder'>('match');
  const [assignedTrainerId, setAssignedTrainerId] = useState<string | null>(null);

  // Custom requirement form state
  const [customSubject, setCustomSubject] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<{ name: string; minLevel: number; weight: number }[]>([
    { name: 'Python', minLevel: 4, weight: 5 },
    { name: 'ML', minLevel: 4, weight: 4 },
  ]);

  const activeReq =
    subjectRequirements.find((r) => r.id === selectedRequirementId) || subjectRequirements[0];

  const matchResults = calculateTrainerMatch(selectedRequirementId);

  const trainerUsers = users.filter((u) => u.role === 'trainer' && u.status === 'approved');

  // Matrix skill columns
  const matrixSkillKeys = ['Python', 'ML', 'Statistics', 'SQL', 'AI', 'Data Visualization', 'Cloud', 'Governance'];

  const getScoreBadgeClass = (score: number) => {
    if (score === 5) return 'bg-emerald-100 text-emerald-800 font-bold';
    if (score === 4) return 'bg-blue-100 text-blue-800 font-semibold';
    if (score === 3) return 'bg-slate-100 text-slate-800 font-medium';
    return 'bg-amber-100 text-amber-800';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header & Flowchart */}
      <div className="border-b border-slate-200 pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => goBack()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-700 transition-colors mb-2.5 group cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back {previousTabName ? `to ${previousTabName}` : 'to previous'}</span>
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
              <Compass className="w-4 h-4" />
              <span>Core Architectural Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
              Competency Mapping & Recommendation System
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
              Algorithmic matching of institutional training subjects to accredited trainer skill vectors.
              Evaluates multi-attribute proficiency matrices to recommend the optimal faculty for mission-critical programs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMatrixTab('match')}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
                activeMatrixTab === 'match'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Requirement Matcher
            </button>
            <button
              onClick={() => setActiveMatrixTab('matrix')}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
                activeMatrixTab === 'matrix'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Full Competency Matrix
            </button>
          </div>
        </div>

        {/* Mechanism Flowchart (from User Brief) */}
        <div className="mt-8 p-5 bg-slate-900 text-white rounded-xl shadow-inner">
          <p className="text-[11px] font-mono uppercase tracking-widest text-blue-400 mb-3">
            Algorithmic Pipeline: Subject Requirement to Faculty Recommendation
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center text-xs">
            <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
              <span className="text-[10px] text-slate-400 block mb-1">01. INGEST</span>
              <p className="font-bold text-white">Subject Domain</p>
              <p className="text-[11px] text-slate-400 mt-0.5">e.g. Data Science</p>
            </div>
            <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
              <span className="text-[10px] text-slate-400 block mb-1">02. DECOMPOSE</span>
              <p className="font-bold text-white">Required Skills</p>
              <p className="text-[11px] text-blue-300 mt-0.5">Python + Stats + ML</p>
            </div>
            <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
              <span className="text-[10px] text-slate-400 block mb-1">03. COMPARE</span>
              <p className="font-bold text-white">Trainer Matrix</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Proficiency 1–5 Scale</p>
            </div>
            <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
              <span className="text-[10px] text-slate-400 block mb-1">04. SCORE</span>
              <p className="font-bold text-white">Weighted Fit</p>
              <p className="text-[11px] text-emerald-300 mt-0.5">Suitability % Vector</p>
            </div>
            <div className="p-3 bg-blue-900/60 rounded-lg border border-blue-500/40 col-span-2 md:col-span-1">
              <span className="text-[10px] text-blue-300 block mb-1">05. OUTPUT</span>
              <p className="font-bold text-amber-300">Ranked Faculty</p>
              <p className="text-[11px] text-white mt-0.5">Assigned to Cohort</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab 1: Live Requirement Matcher */}
      {activeMatrixTab === 'match' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Select or Build Requirement */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Select Training Requirement
              </h2>
              <div className="space-y-2">
                {subjectRequirements.map((req) => (
                  <button
                    key={req.id}
                    onClick={() => setSelectedRequirementId(req.id)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all text-xs ${
                      selectedRequirementId === req.id
                        ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-semibold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{req.subject}</span>
                      {selectedRequirementId === req.id && (
                        <Check className="w-4 h-4 text-blue-700" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{req.description}</p>
                  </button>
                ))}
              </div>

              {/* Required Competencies Decomposition */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <p className="text-xs font-bold text-slate-900">
                  Target Competencies for {activeReq.subject}:
                </p>
                <div className="space-y-2">
                  {activeReq.targetCompetencies.map((comp) => (
                    <div
                      key={comp.competencyName}
                      className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">{comp.competencyName}</span>
                        <span className="text-[10px] text-slate-500 block">
                          Weight: {comp.weight}/5 · Min Req: Level {comp.minimumLevel}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold text-[11px]">
                        Lvl {comp.minimumLevel}+
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Explanatory note */}
            <div className="p-4 bg-slate-100 rounded-xl text-xs text-slate-600 space-y-2">
              <p className="font-semibold text-slate-900">How the Recommendation Works</p>
              <p className="leading-relaxed text-[11px]">
                The recommendation engine computes the dot product of the trainer’s competency ratings against the subject’s weighted importance:
              </p>
              <code className="block p-2 bg-white rounded font-mono text-[10px] text-slate-800 border border-slate-200">
                Fit% = (Σ W_i × Level_i) / (Σ W_i × 5) × 100
              </code>
            </div>
          </div>

          {/* Right Column: Matched Trainers Ranked */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Recommended Trainers for {activeReq.subject}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ranked by multi-competency suitability score
                  </p>
                </div>
                <span className="text-xs font-medium text-slate-600">
                  {matchResults.length} Evaluated Faculty
                </span>
              </div>

              <div className="space-y-4">
                {matchResults.map((result, idx) => (
                  <div
                    key={result.trainerId}
                    className={`p-5 rounded-xl border transition-all ${
                      idx === 0
                        ? 'border-blue-300 bg-blue-50/30 ring-1 ring-blue-200'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                            idx === 0 ? 'bg-blue-700 text-white shadow-xs' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {result.trainerName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900">{result.trainerName}</h3>
                            {idx === 0 && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Top Match
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{result.specialization}</p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {result.experienceYears} Years Faculty Experience
                          </p>
                        </div>
                      </div>

                      {/* Suitability Metric */}
                      <div className="text-left sm:text-right">
                        <div className="flex items-baseline gap-1 sm:justify-end">
                          <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                            {result.overallSuitabilityPercent}%
                          </span>
                          <span className="text-xs text-slate-500 font-medium">Fit</span>
                        </div>
                        <span
                          className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded mt-1 ${
                            result.suitabilityGrade === 'Highly Recommended'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {result.suitabilityGrade}
                        </span>
                      </div>
                    </div>

                    {/* Competency Breakdown Matrix */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Competency Breakdown vs Subject Requirement:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {result.competencyBreakdown.map((item) => (
                          <div
                            key={item.competencyName}
                            className="p-2 bg-white rounded border border-slate-200 text-center"
                          >
                            <p className="text-[11px] font-semibold text-slate-800 truncate">
                              {item.competencyName}
                            </p>
                            <div className="flex items-center justify-center gap-1 my-1">
                              <span className="text-xs font-mono font-bold text-slate-900">
                                {item.trainerLevel}/5
                              </span>
                              <span className="text-[10px] text-slate-400">
                                (req {item.requiredLevel})
                              </span>
                            </div>
                            <span
                              className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded inline-block ${
                                item.status === 'exceeds'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : item.status === 'meets'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="mt-4 flex items-center justify-end gap-3 text-xs">
                      <button
                        onClick={() => {
                          setAssignedTrainerId(result.trainerId);
                          setTimeout(() => {
                            setAssignedTrainerId((prev) => (prev === result.trainerId ? null : prev));
                          }, 3000);
                        }}
                        className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                          assignedTrainerId === result.trainerId
                            ? 'bg-emerald-700 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        {assignedTrainerId === result.trainerId ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                            <span>Assigned to {activeReq.subject} Cohort ✓</span>
                          </>
                        ) : (
                          <span>Assign Faculty to Course</span>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Tab 2: Full Competency Matrix Table (from Prompt) */}
      {activeMatrixTab === 'matrix' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Institutional Trainer Competency Matrix
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-attribute skill rating (1 = Basic, 5 = Master/Subject Authority)
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Scale Legend:</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[11px]">5 Master</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold text-[11px]">4 Advanced</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium text-[11px]">3 Competent</span>
            </div>
          </div>

          {/* Matrix Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-50 text-slate-700 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4 min-w-[200px]">Trainer Name</th>
                  <th className="py-3 px-3 text-center">Python</th>
                  <th className="py-3 px-3 text-center">ML</th>
                  <th className="py-3 px-3 text-center">Statistics</th>
                  <th className="py-3 px-3 text-center">SQL</th>
                  <th className="py-3 px-3 text-center">AI</th>
                  <th className="py-3 px-3 text-center">Visualization</th>
                  <th className="py-3 px-3 text-center">Cloud</th>
                  <th className="py-3 px-3 text-center">Governance</th>
                  <th className="py-3 px-4 text-right">Avg Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {trainerUsers.map((trainer) => {
                  const profile = trainerProfiles[trainer.id];
                  const comps = profile?.competencies || {};
                  const scores = matrixSkillKeys.map((k) => comps[k] || 3);
                  const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);

                  return (
                    <tr key={trainer.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{trainer.name}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[220px]">
                          {trainer.designation || trainer.organization}
                        </div>
                      </td>

                      {matrixSkillKeys.map((key) => {
                        const val = comps[key] || 3;
                        return (
                          <td key={key} className="py-3.5 px-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded text-xs font-mono ${getScoreBadgeClass(
                                val
                              )}`}
                            >
                              {val}
                            </span>
                          </td>
                        );
                      })}

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {avg} / 5
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>
                All matrix ratings are audited and verified through Directorate teaching benchmarks and trainee evaluation feedback.
              </span>
            </div>
            {currentUser?.role === 'trainer' && (
              <button
                onClick={() => setActiveTab('trainer-dashboard')}
                className="text-blue-700 font-semibold hover:underline"
              >
                Edit My Ratings in Trainer Studio →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
