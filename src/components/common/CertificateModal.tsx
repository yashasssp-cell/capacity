import React, { useRef } from 'react';
import { Award, Download, Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { Certificate } from '../../types';
import confetti from 'canvas-confetti';

interface CertificateModalProps {
  certificate: Certificate | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  const certRef = useRef<HTMLDivElement>(null);

  if (!certificate) return null;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-semibold tracking-wide">Official Verified Credential</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={triggerConfetti}
              className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-amber-300 rounded transition-colors"
              title="Celebrate"
            >
              🎉 Celebrate
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Sheet (Printable Canvas) */}
        <div
          ref={certRef}
          className="p-8 sm:p-12 bg-white text-slate-900 border-8 border-double border-slate-200 m-4 rounded-lg relative"
        >
          {/* Subtle Guilloche / Security Pattern border simulation */}
          <div className="absolute inset-2 border border-slate-300 pointer-events-none rounded" />
          <div className="absolute inset-3 border border-amber-600/20 pointer-events-none rounded" />

          {/* Header */}
          <div className="text-center space-y-2 mb-8 relative z-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-900 text-amber-400 mx-auto shadow-sm">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
              Capacity Connect • National Learning & Competency Directorate
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif">
              Certificate of Competency
            </h1>
            <p className="text-xs text-slate-500 italic">
              Conferred under the Verified Institutional Training Standard
            </p>
          </div>

          {/* Recipient Details */}
          <div className="text-center space-y-4 mb-8 relative z-10">
            <p className="text-sm text-slate-600">This certifies that</p>
            <div className="border-b-2 border-slate-300 max-w-md mx-auto pb-1">
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
                {certificate.traineeName}
              </p>
            </div>
            <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              has successfully fulfilled all rigorous curriculum benchmarks, practical assessments, and verified competency evaluations in
            </p>
            <p className="text-lg sm:text-xl font-bold text-slate-900">
              {certificate.courseTitle}
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-600">
              <span>Grade: <strong className="text-slate-900">{certificate.grade}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Score: <strong className="text-slate-900 font-mono tabular-nums">{certificate.scorePercent}%</strong></span>
              <span aria-hidden="true">·</span>
              <span>Issued: <strong className="text-slate-900">{certificate.issueDate}</strong></span>
            </div>
          </div>

          {/* Signatures & Seal */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 items-end text-center relative z-10">
            <div>
              <div className="h-10 flex items-center justify-center font-serif italic text-slate-700 text-sm">
                {certificate.trainerName}
              </div>
              <div className="border-t border-slate-300 pt-1 text-[11px] text-slate-600">
                <p className="font-semibold text-slate-800">Lead Faculty</p>
                <p>Course Directorate</p>
              </div>
            </div>

            {/* Official Seal */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-amber-600 flex flex-col items-center justify-center text-amber-700 bg-amber-50 shadow-inner p-1">
                <Award className="w-6 h-6" />
                <span className="text-[8px] font-bold tracking-tighter uppercase mt-0.5">VERIFIED</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-1">SEAL #2026-CC</span>
            </div>

            <div>
              <div className="h-10 flex items-center justify-center font-serif italic text-slate-700 text-sm">
                Dr. Arvind Swaminathan
              </div>
              <div className="border-t border-slate-300 pt-1 text-[11px] text-slate-600">
                <p className="font-semibold text-slate-800">Director of Capacity</p>
                <p>National Advisory Board</p>
              </div>
            </div>
          </div>

          {/* Verification Code Footer */}
          <div className="mt-8 pt-4 border-t border-dashed border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
            <span>Certificate ID: <strong className="font-mono text-slate-700">{certificate.certificateNumber}</strong></span>
            <span className="font-mono">Verification: {certificate.verificationCode}</span>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <CheckCircle className="w-4 h-4" />
            <span>Cryptographically sealed & verifiable in National Competency Registry</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition-colors"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
};
