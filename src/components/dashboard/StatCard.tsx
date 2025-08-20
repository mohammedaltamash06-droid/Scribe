import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description: string;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ title, value, icon: Icon, description, trend, trendUp }: StatCardProps) {
  return (
    <Card className="hover:shadow-medium transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
        {trend && (
          <div className="flex items-center mt-2">
            {trendUp ? (
              <TrendingUp className="h-3 w-3 text-medical-success mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-destructive mr-1" />
            )}
            <Badge 
              variant="outline" 
              className={`text-xs ${
                trendUp 
                  ? 'text-medical-success border-medical-success/20' 
                  : 'text-destructive border-destructive/20'
              }`}
            >
              {trend}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}