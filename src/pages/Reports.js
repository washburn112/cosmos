import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { investmentService } from '../services/investmentService';
import { financialService } from '../services/financialService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  Download,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Reports() {
  const { currentUser } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('consolidated');
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [companies, setCompanies] = useState([]);
  const location = useLocation();

  useEffect(() => {
    loadInvestments();
  }, [currentUser]);

  useEffect(() => {
    async function preselectInvestmentByCompany() {
      if (location.state && location.state.companyId && investments.length > 0) {
        const companyId = location.state.companyId;
        try {
          const companyDoc = await getDoc(doc(db, 'operating_companies', companyId));
          if (companyDoc.exists()) {
            const companyData = companyDoc.data();
            setSelectedInvestment(companyData.investmentId);
            setSelectedCompanyId(companyId);
            setReportType('detailed');
          }
        } catch (e) {
          setSelectedInvestment(investments[0]?.id);
          setSelectedCompanyId(companyId);
          setReportType('detailed');
        }
      }
    }
    preselectInvestmentByCompany();
  }, [location.state, investments]);

  useEffect(() => {
    // Load companies for the selected investment
    async function loadCompaniesForInvestment() {
      if (selectedInvestment) {
        const q = await investmentService.getOperatingCompanies(selectedInvestment);
        setCompanies(q);
        if (!selectedCompanyId && q.length === 1) {
          setSelectedCompanyId(q[0].id);
        }
      } else {
        setCompanies([]);
      }
    }
    loadCompaniesForInvestment();
  }, [selectedInvestment]);

  const loadInvestments = async () => {
    if (currentUser) {
      const data = await investmentService.getInvestments(currentUser.uid);
      setInvestments(data);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedInvestment || !startDate || !endDate) return;

    setLoading(true);
    try {
      let report;
      if (reportType === 'detailed' && selectedCompanyId) {
        report = await financialService.generateCompanyReport(
          selectedCompanyId,
          startDate,
          endDate
        );
        setReportData({ companyReports: [report], consolidatedMetrics: report.metrics });
      } else {
        report = await financialService.generateConsolidatedReport(
          selectedInvestment,
          startDate,
          endDate
        );
        setReportData(report);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    }
    setLoading(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatPercent = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };

  const MetricCard = ({ title, value, icon: Icon, trend, trendValue }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        {trend && (
          <div className="flex items-center mt-4">
            {trend === 'up' ? (
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {trendValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Financial Reports</h1>
        {reportData && (
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Report Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="investment">Select Investment</Label>
              <Select
                value={selectedInvestment || ''}
                onValueChange={setSelectedInvestment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an investment" />
                </SelectTrigger>
                <SelectContent>
                  {investments.map((investment) => (
                    <SelectItem key={investment.id} value={investment.id}>
                      {investment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select
                value={reportType}
                onValueChange={setReportType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consolidated">Consolidated</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="comparative">Comparative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === 'detailed' && companies.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="company">Select Company</Label>
                <Select
                  value={selectedCompanyId || ''}
                  onValueChange={setSelectedCompanyId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleGenerateReport}
              disabled={!selectedInvestment || !startDate || !endDate || loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                'Generate Report'
              )}
            </Button>
          </CardContent>
        </Card>

        {reportData && (
          <>
            <div className="md:col-span-2 lg:col-span-3 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Revenue"
                value={formatCurrency(reportData.consolidatedMetrics.totalRevenue)}
                icon={DollarSign}
                trend="up"
                trendValue="+12.5%"
              />
              <MetricCard
                title="Total EBITDA"
                value={formatCurrency(reportData.consolidatedMetrics.totalEbitda)}
                icon={TrendingUp}
                trend="up"
                trendValue="+8.3%"
              />
              <MetricCard
                title="Total Cashflow"
                value={formatCurrency(reportData.consolidatedMetrics.totalCashflow)}
                icon={BarChart3}
                trend="down"
                trendValue="-2.1%"
              />
              <MetricCard
                title="Total Headcount"
                value={formatNumber(reportData.consolidatedMetrics.totalHeadcount)}
                icon={Users}
                trend="up"
                trendValue="+5.2%"
              />
            </div>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={reportData.companyReports[0]?.rawData || []}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        stroke="currentColor"
                        className="text-sm"
                      />
                      <YAxis
                        stroke="currentColor"
                        className="text-sm"
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '0.5rem',
                        }}
                        formatter={(value) => formatCurrency(value)}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                        name="Revenue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Financial Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reportData.companyReports[0]?.rawData || []}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        stroke="currentColor"
                        className="text-sm"
                      />
                      <YAxis
                        stroke="currentColor"
                        className="text-sm"
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '0.5rem',
                        }}
                        formatter={(value) => formatCurrency(value)}
                      />
                      <Legend />
                      <Bar
                        dataKey="ebitda"
                        fill="hsl(var(--primary))"
                        name="EBITDA"
                      />
                      <Bar
                        dataKey="cashflow"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.5}
                        name="Cashflow"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
} 