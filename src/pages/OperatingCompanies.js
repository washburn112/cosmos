import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { operatingCompanyService } from '../services/operatingCompanyService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { useToast } from '../components/ui/use-toast';
import { investmentService } from '../services/investmentService';
import { financialService } from '../services/financialService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function OperatingCompanies() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [companies, setCompanies] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [selectedInvestment, setSelectedInvestment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editCompany, setEditCompany] = useState(null);
  const [form, setForm] = useState({ name: '', industry: '', description: '' });
  const [showDetails, setShowDetails] = useState(false);
  const [detailsCompany, setDetailsCompany] = useState(null);
  const [financialData, setFinancialData] = useState([]);
  const [financialLoading, setFinancialLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      loadInvestments();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedInvestment) {
      loadCompanies(selectedInvestment);
    } else {
      setCompanies([]);
    }
  }, [selectedInvestment]);

  const loadInvestments = async () => {
    setLoading(true);
    try {
      const data = await investmentService.getInvestments(currentUser.uid);
      setInvestments(data);
      if (data.length > 0) setSelectedInvestment(data[0].id);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load investments.' });
    }
    setLoading(false);
  };

  const loadCompanies = async (investmentId) => {
    setLoading(true);
    try {
      const data = await operatingCompanyService.getOperatingCompanies(investmentId);
      setCompanies(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load companies.' });
    }
    setLoading(false);
  };

  const handleOpenDialog = (company = null) => {
    setEditCompany(company);
    setForm(company ? {
      name: company.name || '',
      industry: company.industry || '',
      description: company.description || '',
    } : { name: '', industry: '', description: '' });
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditCompany(null);
    setForm({ name: '', industry: '', description: '' });
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.name) {
      toast({ title: 'Validation', description: 'Name is required.' });
      return;
    }
    setLoading(true);
    try {
      if (editCompany) {
        await operatingCompanyService.updateOperatingCompany(editCompany.id, form);
        toast({ title: 'Success', description: 'Company updated.' });
      } else {
        await operatingCompanyService.createOperatingCompany(selectedInvestment, form);
        toast({ title: 'Success', description: 'Company added.' });
      }
      await loadCompanies(selectedInvestment);
      handleCloseDialog();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save company.' });
    }
    setLoading(false);
  };

  const handleDelete = async (companyId) => {
    if (!window.confirm('Delete this company?')) return;
    setLoading(true);
    try {
      await operatingCompanyService.deleteOperatingCompany(companyId);
      toast({ title: 'Deleted', description: 'Company deleted.' });
      await loadCompanies(selectedInvestment);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete company.' });
    }
    setLoading(false);
  };

  const handleViewDetails = async (company) => {
    setDetailsCompany(company);
    setShowDetails(true);
    setFinancialLoading(true);
    try {
      // Get last 12 months
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - 11);
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      const data = await financialService.getFinancialData(company.id, startStr, endStr);
      setFinancialData(data);
    } catch (e) {
      setFinancialData([]);
    }
    setFinancialLoading(false);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setDetailsCompany(null);
    setFinancialData([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Operating Companies</h1>
        {currentUser?.role === 'admin' && (
          <Button onClick={() => handleOpenDialog()}>Add Company</Button>
        )}
      </div>

      <div className="mb-4 max-w-xs">
        <Label>Investment</Label>
        <Select value={selectedInvestment} onValueChange={setSelectedInvestment}>
          <SelectTrigger>
            <SelectValue placeholder="Select investment" />
          </SelectTrigger>
          <SelectContent>
            {investments.map(inv => (
              <SelectItem key={inv.id} value={inv.id}>{inv.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {companies.map(company => (
          <Card key={company.id}>
            <CardHeader>
              <CardTitle>{company.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-sm text-muted-foreground">{company.industry}</div>
              <div className="mb-2">{company.description}</div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="secondary" onClick={() => handleViewDetails(company)}>
                  View Details
                </Button>
                {currentUser?.role === 'admin' && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleOpenDialog(company)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(company.id)}>Delete</Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {companies.length === 0 && !loading && (
          <div className="text-muted-foreground">No companies found for this investment.</div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editCompany ? 'Edit Company' : 'Add Company'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input name="name" value={form.name} onChange={handleFormChange} />
            </div>
            <div>
              <Label>Industry</Label>
              <Input name="industry" value={form.industry} onChange={handleFormChange} />
            </div>
            <div>
              <Label>Description</Label>
              <Input name="description" value={form.description} onChange={handleFormChange} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={loading}>
              {editCompany ? 'Save Changes' : 'Add Company'}
            </Button>
            <Button variant="outline" onClick={handleCloseDialog} disabled={loading}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Company Details</DialogTitle>
          </DialogHeader>
          {detailsCompany && (
            <div className="space-y-2">
              <div><strong>Name:</strong> {detailsCompany.name}</div>
              <div><strong>Industry:</strong> {detailsCompany.industry}</div>
              <div><strong>Description:</strong> {detailsCompany.description}</div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => navigate('/reports', { state: { companyId: detailsCompany.id } })}>
                  Generate Report
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigate('/chat', { state: { companyId: detailsCompany.id, companyName: detailsCompany.name } })}>
                  Chat
                </Button>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Financial Data (Last 12 Months)</h3>
                {financialLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : financialData.length > 0 ? (
                  <div className="space-y-6">
                    <div>
                      <div className="font-medium mb-1">Revenue</div>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={financialData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <div className="font-medium mb-1">EBITDA</div>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={financialData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="ebitda" stroke="#82ca9d" name="EBITDA" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Headcount</div>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={financialData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="headcount" stroke="#ffc658" name="Headcount" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">No financial data available for this period.</div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDetails}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 