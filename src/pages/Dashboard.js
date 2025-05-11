import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { investmentService } from '../services/investmentService';
import { financialService } from '../services/financialService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Building2,
  TrendingUp,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [metrics, setMetrics] = useState({
    totalInvestments: 0,
    totalRevenue: 0,
    totalEbitda: 0,
    totalHeadcount: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const investments = await investmentService.getInvestments(currentUser.uid);
      const consolidatedReport = await financialService.generateConsolidatedReport(
        investments[0]?.id,
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      );

      setMetrics({
        totalInvestments: investments.length,
        totalRevenue: consolidatedReport.consolidatedMetrics.totalRevenue,
        totalEbitda: consolidatedReport.consolidatedMetrics.totalEbitda,
        totalHeadcount: consolidatedReport.consolidatedMetrics.totalHeadcount,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  const MetricCard = ({ title, value, icon: Icon, trend }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className={`flex items-center text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? (
              <ArrowUpRight className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 mr-1" />
            )}
            {Math.abs(trend)}% from last month
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={loadDashboardData}>Refresh</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Investments"
          value={metrics.totalInvestments}
          icon={Building2}
          trend={5}
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          icon={DollarSign}
          trend={12}
        />
        <MetricCard
          title="Total EBITDA"
          value={formatCurrency(metrics.totalEbitda)}
          icon={TrendingUp}
          trend={-3}
        />
        <MetricCard
          title="Total Headcount"
          value={metrics.totalHeadcount}
          icon={Users}
          trend={8}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New investment added</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Monthly report generated</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Investment updated</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {currentUser?.role === 'admin' && (
                <Button variant="outline" className="h-24">
                  <div className="flex flex-col items-center gap-2">
                    <Building2 className="h-6 w-6" />
                    <span>Add Investment</span>
                  </div>
                </Button>
              )}
              <Button variant="outline" className="h-24" onClick={() => navigate('/reports')}>
                <div className="flex flex-col items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>Generate Report</span>
                </div>
              </Button>
              <Button variant="outline" className="h-24" onClick={() => navigate('/chat')}>
                <div className="flex flex-col items-center gap-2">
                  <Users className="h-6 w-6" />
                  <span>Chat</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 