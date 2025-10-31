import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { userApi, User, CreateUserData } from '@/lib/api';
import { UserModal } from '@/components/UserModal';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { ValidateOtpModal } from '@/components/ValidateOtpModal';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Eye, Pencil, Trash2, Plus, Search, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isValidateOtpModalOpen, setIsValidateOtpModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const usersData = await userApi.getUsers();
      setUsers(usersData || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      await userApi.createUser(userData);
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
      setIsCreateModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create user';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleEditUser = async (userData: CreateUserData) => {
    if (!selectedUser) return;

    try {
      await userApi.updateUser(selectedUser.user_phone, userData);
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
      setIsEditModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
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
    if (!selectedUser) return;

    setDeleteLoading(true);
    try {
      await userApi.deleteUser(selectedUser.user_phone);
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete user';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchText) return users;

    const searchLower = searchText.toLowerCase();
    return users.filter(user =>
      user.user_name?.toLowerCase().includes(searchLower) ||
      user.user_email?.toLowerCase().includes(searchLower) ||
      user.user_phone?.toLowerCase().includes(searchLower) ||
      user.user_type?.toLowerCase().includes(searchLower) ||
      user.user_role?.toLowerCase().includes(searchLower) ||
      user.id?.toString().includes(searchLower)
    );
  }, [users, searchText]);

  // AG Grid column definitions
  const columnDefs = [
    {
      headerName: 'ID',
      field: 'id',
      width: 80,
      cellClass: 'flex items-center justify-center',
    },
    {
      headerName: 'Name',
      field: 'user_name',
      width: 150,
      cellClass: 'flex items-center',
    },
    {
      headerName: 'Email',
      field: 'user_email',
      width: 200,
      cellClass: 'flex items-center',
    },
    {
      headerName: 'Phone',
      field: 'user_phone',
      width: 140,
      cellClass: 'flex items-center',
    },
    {
      headerName: 'Type',
      field: 'user_type',
      width: 120,
      cellClass: 'flex items-center capitalize',
    },
    {
      headerName: 'Role',
      field: 'user_role',
      width: 120,
      cellClass: 'flex items-center capitalize',
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 100,
      cellClass: 'flex items-center',
      cellRenderer: (params: any) => {
        return params.value || 'Active';
      }
    },
    {
      headerName: 'Actions',
      field: 'actions',
      width: 120,
      cellRenderer: (params: any) => {
        const user = params.data;
        return (
          <div className="flex justify-center gap-1 h-full items-center">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate(`/user/${user.user_phone}`)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      }
    }
  ];

  const defaultColDef = {
    resizable: true,
    sortable: true,
    filter: false, // Remove filter option as requested
    cellClass: 'flex items-center',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">User Management</h1>
            <p className="text-muted-foreground mt-2">Manage and monitor all users in the system</p>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-lg p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsValidateOtpModalOpen(true)}
                variant="outline"
                className="gap-2"
              >
                <Shield className="h-4 w-4" />
                Validate User OTP
              </Button>
              <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create New User
              </Button>
            </div>
          </div>

          {loading && (
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading users...</p>
            </div>
          )}

          {!loading && filteredUsers.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">
                  {users.length === 0 ? 'No users found' : 'No users match your search'}
                </p>
              </CardContent>
            </Card>
          )}

          {!loading && filteredUsers.length > 0 && (
            <div className="ag-theme-alpine" style={{ height: '600px', width: '100%' }}>
              <AgGridReact
                rowData={filteredUsers}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                pagination={true}
                paginationPageSize={10}
                suppressCellFocus={true}
                rowHeight={60}
                headerHeight={50}
              />
            </div>
          )}
        </div>
      </div>

      <UserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateUser}
        mode="create"
      />

      <UserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleEditUser}
        initialData={selectedUser || undefined}
        mode="edit"
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
        userName={selectedUser?.user_name || ''}
        isLoading={deleteLoading}
      />

      <ValidateOtpModal
        isOpen={isValidateOtpModalOpen}
        onClose={() => setIsValidateOtpModalOpen(false)}
      />
    </div>
  );
}