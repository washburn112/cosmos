import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { investmentService } from '../services/investmentService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Building2,
  Plus,
  Search,
  ArrowUpDown,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Investments() {
  const { currentUser } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    investmentDate: '',
    amount: '',
    status: 'Active',
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadInvestments();
  }, [currentUser]);

  const loadInvestments = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const data = await investmentService.getInvestments(currentUser.uid);
      setInvestments(data);
    } catch (error) {
      console.error('Error loading investments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (investment = null) => {
    if (investment) {
      setEditingInvestment(investment);
      setFormData({
        name: investment.name,
        description: investment.description,
        investmentDate: investment.investmentDate,
        amount: investment.amount,
        status: investment.status || 'Active',
      });
    } else {
      setEditingInvestment(null);
      setFormData({
        name: '',
        description: '',
        investmentDate: new Date().toISOString().split('T')[0],
        amount: '',
        status: 'Active',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingInvestment(null);
    setFormData({
      name: '',
      description: '',
      investmentDate: '',
      amount: '',
      status: 'Active',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInvestment) {
        await investmentService.updateInvestment(editingInvestment.id, formData);
      } else {
        await investmentService.createInvestment(currentUser.uid, formData);
      }
      handleCloseDialog();
      loadInvestments();
    } catch (error) {
      console.error('Error saving investment:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this investment?')) return;

    try {
      await investmentService.deleteInvestment(id);
      setInvestments(investments.filter(inv => inv.id !== id));
    } catch (error) {
      console.error('Error deleting investment:', error);
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredInvestments = investments
    .filter(investment =>
      investment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      investment.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      const modifier = sortOrder === 'asc' ? 1 : -1;

      if (typeof aValue === 'string') {
        return aValue.localeCompare(bValue) * modifier;
      }
      return (aValue - bValue) * modifier;
    });

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

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
        <h1 className="text-3xl font-bold">Investments</h1>
        {currentUser?.role === 'admin' && (
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Investment
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search investments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
              <SelectItem value="investmentDate">Date</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => toggleSort(sortBy)}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredInvestments.map((investment) => (
          <Card key={investment.id} className="group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">
                {investment.name}
              </CardTitle>
              {currentUser?.role === 'admin' && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(investment)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(investment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {investment.description}
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">
                    {formatCurrency(investment.amount)}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Invested on {formatDate(investment.investmentDate)}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {investment.status || 'Active'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => navigate('/reports', { state: { investmentId: investment.id } })}>
                  Go to Reports
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigate('/chat', { state: { investmentId: investment.id, investmentName: investment.name } })}>
                  Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInvestments.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No investments found</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Add your first investment to get started'}
          </p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingInvestment ? 'Edit Investment' : 'Add New Investment'}
              </DialogTitle>
              <DialogDescription>
                {editingInvestment
                  ? 'Update the investment details below.'
                  : 'Fill in the details to create a new investment.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="investmentDate">Investment Date</Label>
                <Input
                  id="investmentDate"
                  type="date"
                  value={formData.investmentDate}
                  onChange={(e) => setFormData({ ...formData, investmentDate: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {editingInvestment ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 