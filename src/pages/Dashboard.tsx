import { useState, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { MiniChart } from "@/components/dashboard/MiniChart";
import { JobsTable } from "@/components/dashboard/JobsTable";
import { FileText, Clock, Zap, CheckCircle } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalMinutes: 0,
    timeSavedMin: 0,
    autoCorrections: 0
  });
  const [chartData, setChartData] = useState({
    filesPerDay: [],
    minutesPerDay: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch summary stats
        const summaryResponse = await fetch('/api/dashboard/summary');
        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          setStats(summaryData);
        }

        // Fetch chart data could be part of summary or separate endpoint
        setChartData({
          filesPerDay: [
            { day: 'Mon', files: 23 },
            { day: 'Tue', files: 31 },
            { day: 'Wed', files: 28 },
            { day: 'Thu', files: 35 },
            { day: 'Fri', files: 42 },
            { day: 'Sat', files: 18 },
            { day: 'Sun', files: 12 },
          ],
          minutesPerDay: [
            { day: 'Mon', minutes: 420 },
            { day: 'Tue', minutes: 580 },
            { day: 'Wed', minutes: 520 },
            { day: 'Thu', minutes: 650 },
            { day: 'Fri', minutes: 780 },
            { day: 'Sat', minutes: 340 },
            { day: 'Sun', minutes: 210 },
          ]
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Navigation />
        
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your transcription activity and performance.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Files"
              value={stats.totalFiles.toLocaleString()}
              icon={FileText}
              description="Files transcribed"
              trend="+12% from last month"
              trendUp={true}
            />
            <StatCard
              title="Total Minutes"
              value={`${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`}
              icon={Clock}
              description="Audio processed"
              trend="+8% from last month"
              trendUp={true}
            />
            <StatCard
              title="Time Saved"
              value={`${Math.floor(stats.timeSavedMin / 60)}h ${stats.timeSavedMin % 60}m`}
              icon={Zap}
              description="Through automation"
              trend="+15% from last month"
              trendUp={true}
            />
            <StatCard
              title="Auto-Corrections"
              value={stats.autoCorrections.toLocaleString()}
              icon={CheckCircle}
              description="Applied successfully"
              trend="+22% from last month"
              trendUp={true}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Files per Day</CardTitle>
              </CardHeader>
              <CardContent>
                <MiniChart 
                  data={chartData.filesPerDay}
                  type="bar"
                  dataKey="files"
                  xAxisKey="day"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Minutes per Day</CardTitle>
              </CardHeader>
              <CardContent>
                <MiniChart 
                  data={chartData.minutesPerDay}
                  type="line"
                  dataKey="minutes"
                  xAxisKey="day"
                />
              </CardContent>
            </Card>
          </div>

          {/* Recent Jobs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transcription Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <JobsTable />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}