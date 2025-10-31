import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { userApi, User } from '@/lib/api';
import { UserModal } from '@/components/UserModal';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Pencil, Trash2, Calendar, Phone, Mail, User as UserIcon, Shield, KeyRound } from 'lucide-react';

export default function UserDetails() {
  const { phone } = useParams<{ phone: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      if (!phone) return;

      setLoading(true);
      try {
        const users = await userApi.getUserByPhone(phone);
        if (users.length > 0) {
          setUser(users[0]);
        } else {
          toast({
            title: 'Error',
            description: 'User not found',
            variant: 'destructive',
          });
          navigate('/');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch user details',
          variant: 'destructive',
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [phone, navigate, toast]);

  const handleEditUser = async (userData: any) => {
    if (!user) return;

    try {
      await userApi.updateUser(user.user_phone, userData);
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
      setIsEditModalOpen(false);
      // Refresh user data
      const users = await userApi.getUserByPhone(user.user_phone);
      if (users.length > 0) {
        setUser(users[0]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;

    try {
      await userApi.deleteUser(user.user_phone);
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      navigate('/');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete user';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">User not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold">User Details</h1>
              <p className="text-muted-foreground mt-2">Detailed information about the user</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsChangePasswordModalOpen(true)}
              variant="secondary"
              className="gap-2"
            >
              <KeyRound className="h-4 w-4" />
              Change Password
            </Button>
            <Button
              onClick={() => setIsEditModalOpen(true)}
              variant="outline"
              className="gap-2"
            >
              <Pencil className="h-4 w-4" />
              Edit User
            </Button>
            <Button
              onClick={() => setIsDeleteDialogOpen(true)}
              variant="destructive"
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete User
            </Button>
          </div>
        </div>

        {/* User Information Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Name:</span>
                <span>{user.user_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">ID:</span>
                <Badge variant="outline">{user.id}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Status:</span>
                <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                  {user.status || 'Active'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Email:</span>
                <span>{user.user_email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Phone:</span>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {user.user_phone}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role & Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Role & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">User Type:</span>
                <Badge variant="secondary" className="capitalize">
                  {user.user_type}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Role:</span>
                <Badge variant="secondary" className="capitalize">
                  {user.user_role}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Password Enabled:</span>
                <Badge variant={user.user_password_enabled ? 'default' : 'secondary'}>
                  {user.user_password_enabled ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">OTP Enabled:</span>
                <Badge variant={user.user_otp_enabled ? 'default' : 'secondary'}>
                  {user.user_otp_enabled ? 'Yes' : 'No'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Created At:</span>
                <span>{new Date(user.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Updated At:</span>
                <span>{new Date(user.updated_at).toLocaleString()}</span>
              </div>
              {user.user_password_expiry && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Password Expiry:</span>
                  <span>{new Date(user.user_password_expiry).toLocaleString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <UserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditUser}
        initialData={user}
        mode="edit"
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteUser}
        userName={user.user_name}
        isLoading={false}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        userPhone={user.user_phone}
      />
    </div>
  );
}