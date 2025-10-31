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
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

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
      width: 100,
      cellClass: 'flex items-center justify-center',
    },
    {
      headerName: 'Name',
      field: 'user_name',
      width: 180,
      cellClass: 'flex items-center',
    },
    {
      headerName: 'Email',
      field: 'user_email',
      width: 250,
      cellClass: 'flex items-center',
    },
    {
      headerName: 'Phone',
      field: 'user_phone',
      width: 150,
      cellClass: 'flex items-center',
    },
    {
      headerName: 'Type',
      field: 'user_type',
      width: 140,
      cellClass: 'flex items-center capitalize',
      cellRenderer: (params: any) => {
        return <span className="capitalize">{params.value}</span>;
      }
    },
    {
      headerName: 'Role',
      field: 'user_role',
      width: 140,
      cellClass: 'flex items-center capitalize',
      cellRenderer: (params: any) => {
        return <span className="capitalize">{params.value}</span>;
      }
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 120,
      cellClass: 'flex items-center',
      cellRenderer: (params: any) => {
        const status = params.value || 'Active';
        return (
          <Badge variant={status === 'Active' ? 'default' : 'secondary'}>
            {status}
          </Badge>
        );
      }
    },
    {
      headerName: 'Actions',
      field: 'actions',
      width: 100,
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
    filter: false,
    cellClass: 'flex items-center',
    minWidth: 100,
  };

  // Mobile Card Component
  const UserCard = ({ user }: { user: User }) => (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{user.user_name}</CardTitle>
            <CardDescription className="mt-1">{user.user_email}</CardDescription>
          </div>
          <Badge variant="secondary" className="capitalize">
            {user.user_role}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Phone:</span>
          <span className="font-medium">{user.user_phone}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Type:</span>
          <span className="font-medium capitalize">{user.user_type}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">User ID:</span>
          <span className="font-medium font-mono text-xs">{user.id}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Status:</span>
          <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
            {user.status || 'Active'}
          </Badge>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/user/${user.user_phone}`)}
            className="h-8 gap-1"
          >
            <Eye className="h-3 w-3" />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );

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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                onClick={() => setIsValidateOtpModalOpen(true)}
                variant="outline"
                className="gap-2 w-full sm:w-auto"
              >
                <Shield className="h-4 w-4" />
                Validate User OTP
              </Button>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="gap-2 w-full sm:w-auto"
              >
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
            <>
              {/* Mobile View - Cards */}
              {isMobile && (
                <div className="grid grid-cols-1 gap-4">
                  {filteredUsers.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              )}

              {/* Desktop View - AG Grid */}
              {!isMobile && (
                <div
                  className="ag-theme-alpine"
                  style={{
                    height: '600px',
                    width: '100%',
                    '--ag-header-height': '50px',
                    '--ag-row-height': '60px',
                    '--ag-header-background-color': 'hsl(262 40% 55%)',
                    '--ag-header-foreground-color': 'white',
                    '--ag-row-hover-color': 'hsl(262 20% 95%)',
                    '--ag-border-color': 'hsl(262 20% 90%)',
                  } as React.CSSProperties}
                >
                  <AgGridReact
                    rowData={filteredUsers}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    pagination={true}
                    paginationPageSize={10}
                    suppressCellFocus={true}
                    rowHeight={60}
                    headerHeight={50}
                    domLayout='normal'
                    ensureDomOrder={true}
                    animateRows={true}
                  />
                </div>
              )}
            </>
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