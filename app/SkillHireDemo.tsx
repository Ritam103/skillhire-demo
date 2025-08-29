"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Briefcase,
  Building2,
  Check,
  ChevronRight,
  FileText,
  LogIn,
  LogOut,
  MessageSquare,
  Plus,
  Search,
  Send,
  Sparkles,
  User2,
  Filter,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";

/* -----------------------------------------------------------------------------
   Types & Seed Data
----------------------------------------------------------------------------- */

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: number; // LPA
  skills: string[];
  description: string;
};

type Candidate = {
  id: string;
  name: string;
  headline: string;
  skills: string[];
  score: number;
};

type Application = {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status: "Submitted" | "Shortlisted" | "Interview" | "Offer";
  resume: string;
  createdAt: string;
};

type Conversation = {
  id: string;
  with: string;
  messages: { from: string; text: string; ts: number }[];
};

const seedJobs: Job[] = [
  {
    id: "J-1001",
    title: "Full-Stack Engineer",
    company: "Skybound Labs",
    location: "Bengaluru, IN",
    salary: 18,
    skills: ["React", "Node", "PostgreSQL", "Docker"],
    description:
      "Build end-to-end features, own services, and collaborate cross-functionally. Experience with REST, caching, and CI/CD preferred.",
  },
  {
    id: "J-1002",
    title: "Backend Developer",
    company: "Quanta Systems",
    location: "Hyderabad, IN",
    salary: 16,
    skills: ["Node", "Express", "Redis", "AWS"],
    description: "Design scalable APIs, optimize DB queries, and implement observability.",
  },
  {
    id: "J-1003",
    title: "Frontend Developer",
    company: "Nimbus Tech",
    location: "Remote",
    salary: 14,
    skills: ["Next.js", "TypeScript", "Tailwind"],
    description: "Craft delightful UIs, SSR/ISR pages, and accessible components.",
  },
];

const seedCandidates: Candidate[] = [
  {
    id: "C-2001",
    name: "Aarav Kumar",
    headline: "Full-stack | React • Node • AWS",
    skills: ["React", "Node", "PostgreSQL", "AWS"],
    score: 86,
  },
  {
    id: "C-2002",
    name: "Isha Patel",
    headline: "Frontend | Next.js • TS • Tailwind",
    skills: ["Next.js", "TypeScript", "Tailwind"],
    score: 91,
  },
  {
    id: "C-2003",
    name: "Rohit Singh",
    headline: "Backend | Express • Redis • Kafka",
    skills: ["Node", "Express", "Redis"],
    score: 78,
  },
];

/* -----------------------------------------------------------------------------
   SSR-safe localStorage Hook
----------------------------------------------------------------------------- */

const useLocal = <T,>(key: string, initial: T) => {
  const isClient = typeof window !== "undefined";
  const [state, setState] = useState<T>(initial);

  // hydrate after mount
  useEffect(() => {
    if (!isClient) return;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setState(JSON.parse(raw) as T);
    } catch {}
  }, [key, isClient]);

  // persist
  useEffect(() => {
    if (!isClient) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state, isClient]);

  return [state, setState] as const;
};

/* -----------------------------------------------------------------------------
   UI Bits
----------------------------------------------------------------------------- */

function Nav({
  user,
  setUser,
}: {
  user: { auth: boolean; role: "candidate" | "recruiter" };
  setUser: React.Dispatch<React.SetStateAction<{ auth: boolean; role: "candidate" | "recruiter" }>>;
}) {
  return (
    <div className="sticky top-0 z-20 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold">SkillHire</span>
          <Badge variant="secondary" className="ml-2">
            Demo
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Select value={user.role} onValueChange={(v: "candidate" | "recruiter") => setUser((u) => ({ ...u, role: v }))}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="candidate">Candidate</SelectItem>
              <SelectItem value="recruiter">Recruiter</SelectItem>
            </SelectContent>
          </Select>
          {user.auth ? (
            <Button variant="outline" size="sm" onClick={() => setUser((u) => ({ ...u, auth: false }))}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          ) : (
            <Button size="sm" onClick={() => setUser((u) => ({ ...u, auth: true }))}>
              <LogIn className="w-4 h-4 mr-2" />
              Mock sign in
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function JobCard({ job, onApply }: { job: Job; onApply: (job: Job) => void }) {
  return (
    <Card className="card-glass rounded-2xl hover:shadow-lg transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> {job.title}
          </CardTitle>
          <Badge>{job.location}</Badge>
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
          <Building2 className="w-4 h-4" /> {job.company}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {job.skills.map((s) => (
            <Badge key={s} variant="secondary">
              {s}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{job.description}</p>
        <div className="flex items-center justify-between pt-1">
          <div className="text-sm">
            CTC (LPA): <span className="font-medium">{job.salary}</span>
          </div>
          <Button
            size="sm"
            className="brand-gradient text-white shadow hover:opacity-95"
            onClick={() => onApply(job)}
          >
            Apply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickPreferences({
  onSave,
}: {
  onSave: (prefs: { desiredRole: string; location: string; minLpa: number }) => void;
}) {
  const [desiredRole, setDesiredRole] = useState("");
  const [location, setLocation] = useState("");
  const [minLpa, setMinLpa] = useState<number | "">("");

  const save = () => {
    onSave({ desiredRole, location, minLpa: Number(minLpa || 0) });
    toast.success("Preferences saved");
  };

  return (
    <Card className="card-glass rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Quick Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="desiredRole">Desired Role</Label>
          <Input
            id="desiredRole"
            placeholder="e.g. Frontend Developer"
            value={desiredRole}
            onChange={(e) => setDesiredRole(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="prefLocation">Preferred Location</Label>
          <Input
            id="prefLocation"
            placeholder="e.g. Bengaluru"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="minLpa">Minimum LPA</Label>
          <Input
            id="minLpa"
            type="number"
            placeholder="e.g. 10"
            value={minLpa}
            onChange={(e) => setMinLpa(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>
        <Button className="w-full brand-gradient text-white shadow hover:opacity-95" onClick={save}>
          Save
        </Button>
      </CardContent>
    </Card>
  );
}

function Applications({
  applications,
  setApplications,
}: {
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
}) {
  const advance = (id: string) => {
    setApplications((apps) =>
      apps.map((a) =>
        a.id === id
          ? { ...a, status: a.status === "Submitted" ? "Shortlisted" : a.status === "Shortlisted" ? "Interview" : "Offer" }
          : a
      )
    );
  };
  const remove = (id: string) => setApplications((apps) => apps.filter((a) => a.id !== id));

  if (applications.length === 0) return <div className="text-muted-foreground">No applications yet.</div>;

  return (
    <Card className="card-glass rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Your Applications</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="text-sm">
              <TableCell className="font-semibold">Company</TableCell>
              <TableCell className="font-semibold">Role</TableCell>
              <TableCell className="font-semibold">Status</TableCell>
              <TableCell className="font-semibold">Resume</TableCell>
              <TableCell className="font-semibold whitespace-nowrap">Applied At</TableCell>
              <TableCell className="font-semibold text-right">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((a) => (
              <TableRow key={a.id} className="text-sm">
                <TableCell>{a.company}</TableCell>
                <TableCell>{a.jobTitle}</TableCell>
                <TableCell>
                  <Badge>{a.status}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{a.resume}</Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">{new Date(a.createdAt).toLocaleString()}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => advance(a.id)}>
                    Advance
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(a.id)}>
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* Analytics starts here */
function Analytics({ jobs, applications }: { jobs: Job[]; applications: Application[] }) {
  const dataJobsByLoc = useMemo(() => {
    const map: Record<string, number> = {};
    jobs.forEach((j) => (map[j.location] = (map[j.location] || 0) + 1));
    return Object.entries(map).map(([location, count]) => ({ location, count }));
  }, [jobs]);

  const dataPipeline = useMemo(() => {
    const map: Record<Application["status"], number> = { Submitted: 0, Shortlisted: 0, Interview: 0, Offer: 0 };
    applications.forEach((a) => (map[a.status] = (map[a.status] || 0) + 1));
    return Object.entries(map).map(([stage, value]) => ({ stage, value }));
  }, [applications]);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="card-glass rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Jobs by Location</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataJobsByLoc}>
              <XAxis dataKey="location" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="card-glass rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Application Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataPipeline}>
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Jobs by Location Table */}
      <Card className="card-glass rounded-2xl md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Jobs by Location (Table)</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="font-semibold">Location</TableCell>
                <TableCell className="font-semibold text-right">Count</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataJobsByLoc.map((row) => (
                <TableRow key={row.location}>
                  <TableCell>{row.location}</TableCell>
                  <TableCell className="text-right">{row.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/* -----------------------------------------------------------------------------
   Page Component
----------------------------------------------------------------------------- */

export default function SkillHireDemo() {
  const [user, setUser] = useLocal("demo_user", { auth: true, role: "candidate" as "candidate" | "recruiter" });
  const [jobs, setJobs] = useLocal<Job[]>("demo_jobs", seedJobs);
  const [applications, setApplications] = useLocal<Application[]>("demo_apps", []);
  const [candidates] = useLocal<Candidate[]>("demo_candidates", seedCandidates);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-sky-50">
      <Nav user={user} setUser={setUser as any} />

      {/* accent bar */}
      <div className="h-1 brand-gradient opacity-70"></div>

      <main className="max-w-6xl mx-auto p-4 space-y-4">
        {/* Hero Header */}
        <div className="rounded-3xl card-glass ring-1 ring-indigo-100/60 p-6 md:p-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-2">
                <span className="brand-gradient bg-clip-text text-transparent">
                  Job & Skill Marketplace
                </span>
              </h1>
              <p className="text-sm text-slate-600 mt-2">
                Company-level features: auth (mock), jobs, filters, applications, analytics.
              </p>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button className="brand-gradient text-white shadow hover:opacity-95">
                  <FileText className="w-4 h-4 mr-2" />
                  API Blueprint
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>API Blueprint</SheetTitle>
                  <p className="text-sm text-muted-foreground">
                    In a real system, jobs, applications, and users would come from REST/GraphQL.
                  </p>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="jobs" className="space-y-4">
          <TabsList className="pill-tabs grid grid-cols-3">
            <TabsTrigger value="jobs" className="rounded-full data-[state=active]:bg-white shadow-sm">
              Jobs
            </TabsTrigger>
            <TabsTrigger value="applications" className="rounded-full data-[state=active]:bg-white shadow-sm">
              Applications
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-full data-[state=active]:bg-white shadow-sm">
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-4">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onApply={(j) => {
                      const app: Application = {
                        id: "APP-" + Date.now(),
                        jobId: j.id,
                        jobTitle: j.title,
                        company: j.company,
                        status: "Submitted",
                        resume: "resume.pdf",
                        createdAt: new Date().toISOString(),
                      };
                      setApplications((a) => [...a, app]);
                      toast.success(`Applied to ${j.title} at ${j.company}`);
                    }}
                  />
                ))}
              </div>
              <div className="space-y-4">
                {user.role === "recruiter" ? (
                  <Card className="card-glass rounded-2xl">
                    <CardHeader>
                      <CardTitle>Recruiter Area</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Recruiters can post jobs here (form not included in demo).
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <QuickPreferences
                    onSave={(prefs) =>
                      toast(`Saved: ${prefs.desiredRole}, ${prefs.location}, Min ${prefs.minLpa} LPA`)
                    }
                  />
                )}
              </div>
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <Applications applications={applications} setApplications={setApplications as any} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Analytics jobs={jobs} applications={applications} />
          </TabsContent>
        </Tabs>

        <div className="text-xs text-muted-foreground text-center py-6">
          Demo only — data stored locally in your browser. Refresh to reset.
        </div>
      </main>
    </div>
  );
}
