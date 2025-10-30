import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateUserData } from '@/lib/api';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserData) => Promise<void>;
  initialData?: Partial<CreateUserData>;
  mode: 'create' | 'edit';
}

export function UserModal({ isOpen, onClose, onSubmit, initialData, mode }: UserModalProps) {
  const [formData, setFormData] = useState<CreateUserData>({
    user_name: '',
    user_email: '',
    user_type: 'Read_only',
    user_phone: '',
    password: '',
    user_role: 'Picking',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.user_name.trim()) newErrors.user_name = 'Name is required';
    if (!formData.user_email.trim()) newErrors.user_email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user_email)) newErrors.user_email = 'Invalid email format';
    if (!formData.user_phone.trim()) newErrors.user_phone = 'Phone number is required';
    
    if (mode === 'create') {
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password && (formData.password.length < 6 || formData.password.length > 10)) {
        newErrors.password = 'Password must be 6-10 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSubmit(formData);
      onClose();
      setFormData({
        user_name: '',
        user_email: '',
        user_type: 'Read_only',
        user_phone: '',
        password: '',
        user_role: 'Picking',
      });
      setErrors({});
    } catch (error) {
      console.error('Failed to submit form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New User' : 'Edit User'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Add a new user to the system.' : 'Update user information.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user_name">Name *</Label>
            <Input
              id="user_name"
              value={formData.user_name}
              onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
              placeholder="Enter name"
            />
            {errors.user_name && <p className="text-sm text-destructive">{errors.user_name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_email">Email *</Label>
            <Input
              id="user_email"
              type="email"
              value={formData.user_email}
              onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
              placeholder="Enter email"
            />
            {errors.user_email && <p className="text-sm text-destructive">{errors.user_email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_type">User Type *</Label>
            <Select value={formData.user_type} onValueChange={(value) => setFormData({ ...formData, user_type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Read_only">Read Only</SelectItem>
                <SelectItem value="Read_write">Read Write</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_phone">Phone Number *</Label>
            <Input
              id="user_phone"
              type="tel"
              value={formData.user_phone}
              onChange={(e) => setFormData({ ...formData, user_phone: e.target.value })}
              placeholder="Enter phone number"
              disabled={mode === 'edit'}
            />
            {errors.user_phone && <p className="text-sm text-destructive">{errors.user_phone}</p>}
          </div>

          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="6-10 characters"
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="user_role">Role *</Label>
            <Select value={formData.user_role} onValueChange={(value) => setFormData({ ...formData, user_role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Picking">Picking</SelectItem>
                <SelectItem value="in-bound">In-bound</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="all-ops">All Ops</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create User' : 'Update User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
