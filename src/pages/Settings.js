import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { emailService } from '../services/emailService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Bell,
  Mail,
  Clock,
  Globe,
  Shield,
  User,
  Moon,
  Sun,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '../components/ui/use-toast';

export default function Settings() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    reportFrequency: 'monthly',
    reportTime: '09:00',
    reportTimezone: 'America/New_York',
    darkMode: false,
    notifications: {
      newInvestment: true,
      reportReady: true,
      systemUpdates: false,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
    },
  });
  const [emailHistory, setEmailHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    loadEmailHistory();
  }, [currentUser]);

  const loadSettings = async () => {
    // In a real implementation, this would load user settings from Firestore
    // For now, we'll use the default settings
  };

  const loadEmailHistory = async () => {
    // In a real implementation, this would load email history from Firestore
    // For now, we'll use an empty array
    setEmailHistory([]);
  };

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: typeof prev[category] === 'object'
        ? { ...prev[category], [setting]: value }
        : value,
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would save settings to Firestore
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your preferences. Please try again.",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4" />,
      });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
        {currentUser?.role === 'admin' && (
          <Button
            onClick={handleSaveSettings}
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        )}
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Sun className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure how and when you receive email notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Report Frequency</Label>
                <Select
                  value={settings.reportFrequency}
                  onValueChange={(value) => handleSettingChange('reportFrequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Report Time</Label>
                  <Input
                    type="time"
                    value={settings.reportTime}
                    onChange={(e) => handleSettingChange('reportTime', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={settings.reportTimezone}
                    onValueChange={(value) => handleSettingChange('reportTimezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose which notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Investment Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new investments are added
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.newInvestment}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'newInvestment', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Report Ready Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when your reports are ready
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.reportReady}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'reportReady', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about system updates and maintenance
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.systemUpdates}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'systemUpdates', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>
                Customize the appearance of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark theme
                  </p>
                </div>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => handleSettingChange('security', 'twoFactorAuth', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <Select
                  value={settings.security.sessionTimeout.toString()}
                  onValueChange={(value) => handleSettingChange('security', 'sessionTimeout', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 