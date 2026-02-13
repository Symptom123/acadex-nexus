import { motion } from "framer-motion";
import { Download, Printer, User, Calendar, BookOpen, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2 mb-4 no-print">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button variant="default" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>

      <Card className="luxury-card-static border-2 print:border-0 print:shadow-none bg-white text-black p-8 max-w-4xl mx-auto overflow-visible">
        <div className="flex justify-between items-start border-b-2 border-primary/20 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-tighter">Acadex Smart School</h1>
              <p className="text-sm text-muted-foreground uppercase tracking-widest">Official Academic Report</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold">Academic Year 2025-26</p>
            <p className="text-xs text-muted-foreground">Term: Final Examination</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8 bg-secondary/20 p-6 rounded-2xl">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold">Student Name:</span>
              <span>{student.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold">Student ID:</span>
              <span>{student.id}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold">Grade/Section:</span>
              <span>{student.grade}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold">Attendance:</span>
              <span>{student.attendance}</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-muted">
                <th className="py-3 font-bold text-sm">Subject</th>
                <th className="py-3 font-bold text-sm text-center">Score</th>
                <th className="py-3 font-bold text-sm text-right">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/50">
              {student.marks.map((m) => (
                <tr key={m.subject}>
                  <td className="py-4 text-sm font-medium">{m.subject}</td>
                  <td className="py-4 text-sm text-center">{m.score}</td>
                  <td className="py-4 text-sm text-right font-bold">{m.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center bg-primary/5 p-6 rounded-2xl">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Overall Average</p>
            <p className="text-3xl font-bold text-primary">{student.avg}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Status</p>
            <p className="text-xl font-bold text-success uppercase">Promoted</p>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-12 pt-8">
          <div className="text-center border-t border-muted pt-4">
            <p className="text-xs font-semibold uppercase">Class Teacher Signature</p>
          </div>
          <div className="text-center border-t border-muted pt-4">
            <p className="text-xs font-semibold uppercase">Principal Signature</p>
          </div>
        </div>
      </Card>
      
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .luxury-card-static { border: none !important; box-shadow: none !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default ReportCard;
