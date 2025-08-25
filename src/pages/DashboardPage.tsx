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
      try {
        const response = await fetch("/api/dashboard/summary");
        if (!response.ok) throw new Error('API not available');
        return response.json();
      } catch (error) {
        // Return mock data when API is not available
        return {
          totalTranscriptions: 47,
          processingJobs: 2,
          completedToday: 8,
          failedJobs: 1,
          timeseries: [
            { date: '2024-01-15', count: 12 },
            { date: '2024-01-16', count: 15 },
            { date: '2024-01-17', count: 8 },
            { date: '2024-01-18', count: 22 },
            { date: '2024-01-19', count: 18 },
          ]
        };
      }
    },
  });

  const { data: recentJobs } = useQuery({
    queryKey: ["recent-jobs"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/jobs/recent");
        if (!response.ok) throw new Error('API not available');
        return response.json();
      } catch (error) {
        // Return empty array when API is not available - JobsTable handles this
        return [];
      }
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