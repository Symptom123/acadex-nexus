import { motion } from "framer-motion";
import { Download, Printer, User, Calendar, BookOpen, GraduationCap, Edit3, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";

interface ReportCardProps {
  student: {
    name: string;
    grade: string;
    id: string;
    avg: number;
    attendance: string;
    marks: { subject: string; score: number; grade: string }[];
  };
}

const ReportCard = ({ student }: ReportCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [schoolName, setSchoolName] = useState("Acadex Smart School");
  const [academicYear, setAcademicYear] = useState("Academic Year 2025-26");
  const [term, setTerm] = useState("Final Examination");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2 mb-4 no-print">
        <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? <Check className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
          {isEditing ? "Finish Editing" : "Customize Report"}
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button variant="default" size="sm" onClick={handlePrint}>
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>

      <div>
        <Card className="glass-panel border-white/10 print:border-0 print:shadow-none p-8 max-w-4xl mx-auto overflow-visible shadow-2xl transition-all">
        <div className="flex justify-between items-start border-b border-white/10 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
              <GraduationCap className="w-10 h-10 text-primary" />
            </div>
            <div>
              {isEditing ? (
                <input
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="text-2xl font-bold uppercase tracking-tighter border-b border-white/20 bg-transparent text-white focus:outline-none w-full focus:border-primary"
                />
              ) : (
                <h1 className="text-2xl font-bold uppercase tracking-tighter text-white">{schoolName}</h1>
              )}
              <p className="text-sm text-white/50 uppercase tracking-widest mt-1">Official Academic Report</p>
            </div>
          </div>
          <div className="text-right">
            {isEditing ? (
              <div className="flex flex-col gap-1 items-end">
                <input
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="text-sm font-bold border-b border-white/20 bg-transparent text-white focus:outline-none text-right focus:border-primary"
                />
                <input
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="text-xs text-white/50 border-b border-white/20 bg-transparent text-white focus:outline-none text-right focus:border-primary"
                />
              </div>
            ) : (
              <>
                <p className="text-sm font-bold text-white">{academicYear}</p>
                <p className="text-xs text-white/60">Term: {term}</p>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8 bg-white/5 p-6 rounded-2xl border border-white/10">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <User className="w-4 h-4 text-white/40" />
              <span className="font-semibold text-white/60">Student Name:</span>
              <span className="text-white font-medium">{student.name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <BookOpen className="w-4 h-4 text-white/40" />
              <span className="font-semibold text-white/60">Student ID:</span>
              <span className="text-white font-medium">{student.id}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <GraduationCap className="w-4 h-4 text-white/40" />
              <span className="font-semibold text-white/60">Grade/Section:</span>
              <span className="text-white font-medium">{student.grade}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-white/40" />
              <span className="font-semibold text-white/60">Attendance:</span>
              <span className="text-white font-medium">{student.attendance}</span>
            </div>
          </div>
        </div>

        <div className="mb-8 overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left bg-white/5">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="py-3 px-4 font-bold text-sm text-white">Subject</th>
                <th className="py-3 px-4 font-bold text-sm text-center text-white">Score</th>
                <th className="py-3 px-4 font-bold text-sm text-right text-white">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {student.marks.map((m) => (
                <tr key={m.subject} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 text-sm font-medium text-white/80">{m.subject}</td>
                  <td className="py-4 px-4 text-sm text-center text-white">{m.score}</td>
                  <td className="py-4 px-4 text-sm text-right font-bold text-white">{m.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center bg-primary/20 p-6 rounded-2xl border border-primary/30 shadow-[0_0_30px_rgba(var(--primary),0.1)]">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">Overall Average</p>
            <p className="text-4xl font-bold text-white">{student.avg}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-1">Status</p>
            <p className="text-xl font-bold text-emerald-400 uppercase tracking-widest">Promoted</p>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-12 pt-8">
          <div className="text-center border-t border-white/20 pt-4">
            <p className="text-xs font-semibold uppercase text-white/50 tracking-widest">Class Teacher Signature</p>
          </div>
          <div className="text-center border-t border-white/20 pt-4">
            <p className="text-xs font-semibold uppercase text-white/50 tracking-widest">Principal Signature</p>
          </div>
        </div>
      </Card>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .luxury-card-static { border: none !important; box-shadow: none !important; padding: 0 !important; }
          .shadow-2xl { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
};

export default ReportCard;
