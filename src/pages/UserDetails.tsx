import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { userApi, User, CreateUserData } from '@/lib/api';
import { UserModal } from '@/components/UserModal';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Pencil, Mail, Phone, User as UserIcon, Shield, Briefcase } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserDetails() {
  const { phone } = useParams<{ phone: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!phone) return;
      
      setLoading(true);
      try {
        const data = await userApi.getUserByPhone(phone);
        setUser(Array.isArray(data) && data.length > 0 ? data[0] : data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch user details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [phone, toast]);

  const handleEditUser = async (userData: CreateUserData) => {
    if (!user) return;
    
    try {
      await userApi.updateUser(user.user_phone, userData);
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
      
      const updatedData = await userApi.getUserByPhone(user.user_phone);
      setUser(Array.isArray(updatedData) && updatedData.length > 0 ? updatedData[0] : updatedData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive',
      });
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-10 w-48" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <div className="container mx-auto p-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">User not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button onClick={() => setIsEditModalOpen(true)} className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit User
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl text-gradient">{user.user_name}</CardTitle>
            <CardDescription>User ID: {user.record_id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
                  <Mail className="h-5 w-5 mt-0.5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                    <p className="text-base font-semibold">{user.user_email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
                  <Phone className="h-5 w-5 mt-0.5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                    <p className="text-base font-semibold">{user.user_phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
                  <UserIcon className="h-5 w-5 mt-0.5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">User Type</p>
                    <p className="text-base font-semibold">{user.user_type}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
                  <Briefcase className="h-5 w-5 mt-0.5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Role</p>
                    <p className="text-base font-semibold capitalize">{user.user_role}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
                  <Shield className="h-5 w-5 mt-0.5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Record ID</p>
                    <p className="text-base font-semibold font-mono">{user.record_id}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <UserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditUser}
        initialData={user}
        mode="edit"
      />
    </div>
  );
}
