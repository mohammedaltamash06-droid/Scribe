import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/dashboard/StatCard";
import { JobsTable } from "@/components/dashboard/JobsTable";
import { MiniChart } from "@/components/dashboard/MiniChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const { data: summary } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/summary");
      return response.json();
    },
  });

  const { data: recentJobs } = useQuery({
    queryKey: ["recent-jobs"],
    queryFn: async () => {
      const response = await fetch("/api/jobs/recent");
      return response.json();
    },
  });

  const stats = [
    {
      title: "Total Transcriptions",
      value: summary?.totalTranscriptions || 0,
      icon: FileText,
      description: "All time transcriptions",
    },
    {
      title: "Processing",
      value: summary?.processingJobs || 0,
      icon: Clock,
      description: "Currently processing",
    },
    {
      title: "Completed Today",
      value: summary?.completedToday || 0,
      icon: CheckCircle,
      description: "Finished today",
    },
    {
      title: "Failed Jobs",
      value: summary?.failedJobs || 0,
      icon: AlertCircle,
      description: "Need attention",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <MiniChart 
              data={summary?.timeseries || []} 
              type="line"
              dataKey="count"
              xAxisKey="date"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <JobsTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}